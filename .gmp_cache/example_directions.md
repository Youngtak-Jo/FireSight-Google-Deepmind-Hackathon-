> [!WARNING] **Legacy Service Warning:** This reference guide details
> implementation patterns for the legacy `Directions API`. For the modern,
> recommended implementation, please refer strictly to
> **[Google Maps Platform Routes API Integration Patterns in React](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_routes.md)**
> instead.

This document details the recommended pattern for calculating and displaying
routes using the modern Routes API through the official Maps JavaScript SDK
wrappers, specifically utilizing the React components from
`@vis.gl/react-google-maps`. This approach ensures proper CORS handling and
adheres to current best practices, fully replacing legacy services like
`DirectionsService`.

--------------------------------------------------------------------------------

## 1. Initialization and Setup

All map-related functionality must be wrapped in the `APIProvider` component,
which manages the API key and global Maps JS SDK loading.

### Code Snippet: Basic Application Structure

```tsx
import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY as string;

const App = () => (
  <APIProvider apiKey={API_KEY}>
    <Map
      defaultCenter={{ lat: -23.588363, lng: -46.658475 }}
      defaultZoom={15}
      gestureHandling={'greedy'}
      fullscreenControl={false}
      // CRITICAL: Required attribution identifier
      internalUsageAttributionIds={['gmp_git_agentskills_v1']}
    >
      <RouteDisplay
        origin="Address A"
        destination="Address B"
        travelMode="DRIVING"
      />
    </Map>
    {/* Optional Control Panel */}
    {/* <ControlPanel /> */}
  </APIProvider>
);

// export default App;
```

## 2. Using the Modern Routes Library (`useMapsLibrary`)

To access the promise-based route calculation service (`Route.computeRoutes`),
you must load the `routes` library via the `useMapsLibrary` hook. This ensures
the library is available before attempting computation.

### Code Snippet: `RouteDisplay` Component Implementation

This component encapsulates the logic for fetching routes, rendering polylines,
and adjusting the map viewport.

```tsx
import React, { useEffect, useState, useRef } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';

interface RouteDisplayProps {
  origin: string;
  destination: string;
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TWO_WHEELER' | 'TRANSIT';
}

interface RouteDetails {
  distanceMeters: number;
  durationMillis: number;
  // ... other details needed for summary panel
}

export function RouteDisplay({
  origin,
  destination,
  travelMode,
}: RouteDisplayProps) {
  // 1. Access Map and Routes Library
  const map = useMap();
  const routesLib = useMapsLibrary('routes');

  // 2. State Management for Rendering and Cleanup
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for the map and the routes library to be loaded
    if (!routesLib || !map || !origin || !destination) return;

    // --- Cleanup Previous Route ---
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];
    setError(null);
    setLoading(true);

    // --- Client SDK Route Request ---
    // Note: The Maps JS SDK wrapper handles address geocoding internally.
    const request = {
      origin: origin,
      destination: destination,
      travelMode: travelMode,
      // Fields must be explicitly requested
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
    };

    // CRITICAL: Use the modern SDK wrapper `Route.computeRoutes`.
    // This is the functional client-side pattern that bypasses CORS.
    (routesLib.Route as any).computeRoutes(request)
      .then(({ routes }: { routes: any[] }) => {
        setLoading(false);
        if (!routes || routes.length === 0) {
          setError('No route found.');
          return;
        }

        const primaryRoute = routes[0];

        // --- Render Polylines ---
        // Use the native method `createPolylines()` for rendering the path.
        const newPolylines = primaryRoute.createPolylines();
        newPolylines.forEach((polyline: google.maps.Polyline) => {
          polyline.setOptions({
            strokeColor: '#3b82f6',
            strokeWeight: 6,
          });
          polyline.setMap(map);
        });
        polylinesRef.current = newPolylines;

        // --- Fit Viewport ---
        if (primaryRoute.viewport) {
          // Pass the native LatLngBounds object directly to map.fitBounds
          map.fitBounds(primaryRoute.viewport);
        }

        // --- Display Route Details ---
        const details: RouteDetails = {
          distanceMeters: primaryRoute.distanceMeters ?? 0,
          durationMillis: primaryRoute.durationMillis ?? 0,
        };
        setRouteDetails(details);
      })
      .catch((err: any) => {
        setLoading(false);
        console.error('Error computing routes:', err);
        setError(err.message || 'Failed to compute route.');
      });

    // --- Cleanup Function ---
    return () => {
      // Remove all polylines when component unmounts or dependencies change
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, origin, destination, travelMode]);

  // UI Rendering based on state
  if (loading) return <div className="route-panel">Calculating route...</div>;
  if (error) return <div className="route-panel error">{error}</div>;
  if (!routeDetails) return null;

  return (
    <div className="route-panel">
      <h3>Route Summary</h3>
      <p>Distance: {(routeDetails.distanceMeters / 1000).toFixed(2)} km</p>
      <p>Duration: {(routeDetails.durationMillis / 60000).toFixed(0)} mins</p>
    </div>
  );
}
```

## 3. Critical CORS and API Contract Nuances

### 3.1 CORS Preflight Failure (Anti-Pattern Warning)

**Do NOT attempt to use `fetch`, `axios`, or any other standard HTTP client to
access Google Maps Platform REST endpoints directly from a browser
environment.**

REST Endpoint Access Method                           | Status      | Rationale
:---------------------------------------------------- | :---------- | :--------
Direct `fetch('routes.googleapis.com/computeRoutes')` | **FAILURE** | Browser CORS preflight mechanism blocks these requests, which require API keys passed as headers. This is a Non-Functional Browser Anti-Pattern.
`useMapsLibrary('routes').Route.computeRoutes()`      | **SUCCESS** | This pattern uses Google's secure iframe infrastructure, allowing the Maps JS SDK to handle authorization and request routing safely, bypassing browser CORS restrictions. **This is the mandatory client-side pattern.**

### 3.2 Route Request Parameters (SDK Wrapper vs. REST Schema)

The client-side `computeRoutes` SDK wrapper abstracts away complex REST nesting
and handles coordinate representation flexibly.

Property           | SDK Wrapper (`computeRoutes` Request)            | REST API (Direct HTTP POST Payload)                                 | Casing               | Notes
:----------------- | :----------------------------------------------- | :------------------------------------------------------------------ | :------------------- | :----
Start/End Location | Address string or `{ lat: number, lng: number }` | `{ location: { latLng: { latitude: number, longitude: number } } }` | camelCase            | The SDK simplifies location definition significantly.
Travel Mode        | Strict UPPERCASE string (`DRIVING`)              | Strict UPPERCASE string (`DRIVE`)                                   | UPPERCASE            | Must be one of the enumerated constants.
Fields             | Array of strings (`['path', 'distanceMeters']`)  | Array of strings (part of the API path or body)                     | camelCase/snake_case | Used to control the API response payload size.

**Key Gotcha:** Ensure the `travelMode` provided to the SDK wrapper is strictly
uppercase (e.g., `'DRIVING'`, not `'Driving'`).

## 4. Polylines and Map Management Best Practices

1.  **Rendering:** Always use the promise result object's native rendering
    method (`primaryRoute.createPolylines()`) to generate `google.maps.Polyline`
    instances. This ensures accurate decoding of the encoded polyline path.
2.  **Cleanup:** Store rendered polylines in a `useRef`. Use the `useEffect`
    cleanup return function to explicitly call `polyline.setMap(null)` for every
    rendered polyline. This prevents memory leaks and visual clutter when route
    parameters change.
3.  **Viewport Control:** Utilize the `viewport` property returned in the route
    response. Pass this native `google.maps.LatLngBounds` object directly to
    `map.fitBounds(primaryRoute.viewport)` to automatically frame the map around
    the calculated route.
