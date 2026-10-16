This document details the best practices for implementing route calculation and
rendering within a React application using the `@vis.gl/react-google-maps`
framework, focusing specifically on the modern, promise-based Maps JavaScript
SDK (`google.maps.routes.Route`).

--------------------------------------------------------------------------------

## 1. Critical CORS Preflight Guardrail and Anti-Pattern Warning

It is a **critical anti-pattern** to attempt to execute direct HTTP `fetch` or
`axios` requests to Google Maps Platform REST endpoints (e.g.,
`https://routes.googleapis.com/...`) from a client-side browser application.
This configuration will trigger a CORS Preflight failure and is non-functional.

The file `routes-api.ts` demonstrates this anti-pattern by attempting a direct
POST request:

```typescript
// WARNING: NON-FUNCTIONAL BROWSER ANTI-PATTERN (FOUND IN routes-api.ts)
const ROUTES_API_ENDPOINT =
  'https://routes.googleapis.com/directions/v2:computeRoutes';

// ...
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': this.apiKey // Client-side fetch is blocked by CORS
  },
  body: JSON.stringify(routeRequest)
});
```

**BEST PRACTICE:** All routing operations must be handled using the official
Maps JavaScript SDK wrappers, such as `google.maps.routes.Route.computeRoutes`.
This method safely routes the request through Google's secure iframe
infrastructure, bypassing client-side CORS limitations.

## 2. Framework Initialization and Library Loading

To use modern routing features, the application must load the necessary modules
via the `routes` library identifier.

### Initialization (`app.tsx` Structure)

```tsx
import React from 'react';
import {APIProvider, Map, useMapsLibrary, useMap} from '@vis.gl/react-google-maps';

// Define inputs
const routeOrigin = {lng: 9.9004303, lat: 53.588241};
const routeDestination = {lng: 13.43765, lat: 52.52967};

// REST parameters for Routes API v2 (these are mapped by the SDK internally)
const routeOptions = {
  travelMode: 'TRANSIT',
  departureTime: new Date(Date.now() + 86400000).toISOString(), // Example departure time
};

const App = () => (
  // Load the core maps library, which is required for the Map component
  // Note: The Maps JS SDK automatically loads the 'routes' library when requested later via useMapsLibrary.
  <APIProvider apiKey={'YOUR_API_KEY'} libraries={['routes']}>
    <Map
      className={'route-api-example'}
      defaultCenter={{lat: 53, lng: 11}}
      defaultZoom={6}
      internalUsageAttributionIds={['gmp_git_agentskills_v1']}
    >
      <RouteRenderer
        origin={routeOrigin}
        destination={routeDestination}
        routeOptions={routeOptions}
      />
    </Map>
  </APIProvider>
);
```

### 2.3 Field Masking in Maps JS SDK (`Route.computeRoutes`)

In the Maps JavaScript SDK, the `fields` array on `ComputeRoutesRequest` takes
direct Route property names **without** the REST `routes.` prefix:

-   ✅ **Correct JS SDK:** `fields: ['polyline', 'distanceMeters', 'duration',
    'viewport']`
-   ❌ **Incorrect (REST prefix):** `fields: ['routes.polyline',
    'routes.duration']` (causes runtime `InvalidValueError`)

## 3. Best Practice: Implementing Route Calculation (SDK Wrapper)

The recommended pattern is to create a component or hook that utilizes
`useMapsLibrary('routes')` to access the `google.maps.routes.Route` service.

### Full Implementation: `RouteRenderer` Component

This component handles the route calculation, polyline decoding, rendering, and
map viewport adjustment.

```tsx
import React, { useEffect, useState } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';

/**
 * Renders the route between origin and destination using the Maps JS SDK Route service.
 * @param origin Start coordinates
 * @param destination End coordinates
 * @param routeOptions Options matching the ComputeRoutesRequest schema (e.g., travelMode)
 */
const RouteRenderer = ({
  origin,
  destination,
  routeOptions
}: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  routeOptions: { travelMode: string; departureTime: string };
}) => {
  const map = useMap();
  // Loads the 'routes' library instance
  const routesLib = useMapsLibrary('routes');
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!routesLib || !map) return;

    // 1. Cleanup existing polyline before calculating new route
    if (polyline) {
      polyline.setMap(null);
      setPolyline(null);
    }

    const routeService = new routesLib.Route();

    // 2. Map string TravelMode to SDK Enum
    // Note: The Maps JS SDK uses Enums (e.g., google.maps.routes.TravelMode.TRANSIT)
    const sdkTravelMode = routesLib.TravelMode[routeOptions.travelMode as keyof typeof routesLib.TravelMode];

    if (!sdkTravelMode) {
        console.error("Invalid travel mode provided:", routeOptions.travelMode);
        return;
    }

    // 3. Construct the request using flat LatLngLiteral coordinates (SDK standard)
    const request: google.maps.routes.ComputeRoutesRequest = {
      origin: origin,
      destination: destination,
      travelMode: sdkTravelMode,
      departureTime: routeOptions.departureTime ? new Date(routeOptions.departureTime) : undefined,
      // The SDK request is clean, using native JS types for coordinates.
    };

    // 4. Compute Routes
    routeService.computeRoutes(request).then(response => {
      if (response.routes && response.routes.length > 0) {
        const route = response.routes[0];

        // A. Decode and render the polyline
        if (route.polyline && route.polyline.encodedPolyline) {
          // Decode the encoded Polyline string into LatLng coordinates
          const path = routesLib.Route.decode(route.polyline.encodedPolyline);

          const newPolyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 4,
            map: map,
          });
          setPolyline(newPolyline);
        }

        // B. Fit map bounds to the route viewport
        if (route.viewport) {
            // The viewport structure returned by the SDK matches the LatLngBounds literal requirement.
            const bounds = new google.maps.LatLngBounds(route.viewport.southwest, route.viewport.northeast);
            map.fitBounds(bounds);
        }
      }
    }).catch(error => {
      console.error("Error computing route:", error);
    });

    // 5. Cleanup function
    return () => {
      if (polyline) {
        polyline.setMap(null);
      }
    };
  }, [routesLib, map, origin, destination, routeOptions.travelMode, routeOptions.departureTime]);

  return null;
};
```

## 4. REST API Schema Casing Nuance and Structure (Context Only)

Although the Maps JavaScript SDK handles the request translation internally,
developers must understand the strict casing differences if they ever need to
debug the raw REST payload or use another language outside the SDK.

### Routes API v2 Input Structure Comparison

Parameter              | Maps JS SDK Wrapper (`computeRoutes`)                | Direct REST API Payload (`computeRoutes` JSON)                                        | Notes
:--------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------ | :----
**Origin/Destination** | Uses flat `LatLngLiteral`: `{ lat: 53.5, lng: 9.9 }` | Uses nested structure: `{ location: { latLng: { latitude: 53.5, longitude: 9.9 } } }` | SDK simplifies coordinate input.
**Travel Mode**        | Uses SDK Enum: `TravelMode.TRANSIT`                  | Uses UPPERCASE String: `"TRANSIT"`                                                    |
**Departure Time**     | Uses JavaScript `Date` object                        | Uses RFC 3339 String: `"2025-10-21T15:00:00Z"`                                        |
**Avoid Tolls**        | Uses boolean (e.g., `avoidTolls: true`)              | Must be nested inside `routeModifiers`: `{ routeModifiers: { avoidTolls: true } }`    | REST requires strict nesting for options.

### REST Payload Example (Nested Structure)

The direct REST request requires fully nested parameters, contrasting with the
simplified structure used by the SDK:

```json
// Example of the raw JSON body required by routes.googleapis.com
{
  "origin": {
    "location": { "latLng": { "latitude": 53.588241, "longitude": 9.9004303 } }
  },
  "destination": {
    "location": { "latLng": { "latitude": 52.52967, "longitude": 13.43765 } }
  },
  "travelMode": "TRANSIT",
  "routingPreference": "TRAFFIC_AWARE",
  "departureTime": "2025-10-21T15:00:00Z",
  "routeModifiers": {
    "avoidTolls": true
  }
}
```

**Best Practice Summary:** Always use the Maps JS SDK wrappers
(`Route.computeRoutes`) to automatically handle the casing, nesting, CORS
authorization, and coordinate transformation between the flat JavaScript objects
and the strict REST schema.
