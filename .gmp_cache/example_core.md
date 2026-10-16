This document serves as a comprehensive guide for developers using the
`@vis.gl/react-google-maps` framework, focusing on component usage,
initialization best practices, and modern patterns for accessing Google Maps
Platform services.

--------------------------------------------------------------------------------

## 1. Core Initialization and API Loading

The foundation of any application using this framework is the `<APIProvider>`
component, which manages the loading and configuration of the Google Maps
JavaScript API.

### 1.1 The `<APIProvider>` Component

This component must wrap all other Maps components and hooks. It handles dynamic
loading of the Maps API using the modern `importLibrary` method, ensuring
optimal resource management.

Prop                      | Type                                     | Description                                                       | Criticality
:------------------------ | :--------------------------------------- | :---------------------------------------------------------------- | :----------
`apiKey`                  | `string`                                 | **Required.** Your Google Maps Platform API key.                  | High
`libraries`               | `string[]`                               | List of libraries (`'places'`, `'geometry'`) to load immediately. | Medium
`version`                 | `string`                                 | API version (`'weekly'`, `'beta'`, etc.).                         | Medium (First Render Only)
`fetchAppCheckToken`      | `() => Promise<MapsAppCheckTokenResult>` | Function for integrating Firebase App Check security.             | High (Security)
`disableUsageAttribution` | `boolean`                                | Set to `true` to opt out of sending default usage IDs.            | Low

**Initialization Example**

```tsx
import React from 'react';
import {APIProvider} from '@vis.gl/react-google-maps';

const API_KEY = 'YOUR_API_KEY_HERE';

export default function App() {
  return (
    <APIProvider
      apiKey={API_KEY}
      language="en"
      region="US"
      internalUsageAttributionIds={['gmp_git_agentskills_v1']}
    >
      <MapComponent />
    </APIProvider>
  );
}
```

### 1.2 Accessing API Loading Status

Use the dedicated hooks to monitor the status of the asynchronous API loading
process.

```tsx
import {useApiIsLoaded, useApiLoadingStatus, APILoadingStatus} from '@vis.gl/react-google-maps';

function LoadingMonitor() {
  const isLoaded = useApiIsLoaded();
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return <div>Error loading maps. Check console for details.</div>;
  }

  if (!isLoaded) {
    return <div>Loading Maps API...</div>;
  }

  return <div>API Ready!</div>;
}
```

## 2. Rendering and Controlling the Map View

### 2.1 Standard 2D Map (`<Map>`)

The primary map component supports both controlled and uncontrolled modes for
camera parameters (center, zoom, heading, tilt).

Prop                          | Type                                     | Description                                                 | Usage Pattern
:---------------------------- | :--------------------------------------- | :---------------------------------------------------------- | :------------
`center` / `defaultCenter`    | `LatLngLiteral`                          | Controlled / Uncontrolled map center.                       | Required
`zoom` / `defaultZoom`        | `number`                                 | Controlled / Uncontrolled zoom level (0-22).                | Required
`mapId`                       | `string`                                 | Required for Advanced Markers and Cloud-based styling.      | High
`onCameraChanged`             | `(event: MapCameraChangedEvent) => void` | Event handler for updating camera state in controlled mode. | High
`internalUsageAttributionIds` | `string[]`                               | **MANDATORY**: Must include `gmp_git_agentskills_v1`.       | Critical

**Controlled Map Example**

To maintain synchronization between the React state and the map view, you must
use the controlled props (`center`, `zoom`) and update the state using
`onCameraChanged`.

```tsx
import React, {useState, useCallback} from 'react';
import {Map, MapCameraChangedEvent, MapCameraProps} from '@vis.gl/react-google-maps';

const INITIAL_CAMERA = {
  center: {lat: 34.0522, lng: -118.2437},
  zoom: 12
};

function ControlledMap() {
  const [cameraProps, setCameraProps] = useState<MapCameraProps>(INITIAL_CAMERA);

  const handleCameraChange = useCallback((ev: MapCameraChangedEvent) => {
    // Sync the entire camera state (center, zoom, heading, tilt)
    setCameraProps(ev.detail);
  }, []);

  return (
    <Map
      {...cameraProps}
      mapId={'YOUR_MAP_ID'}
      onCameraChanged={handleCameraChange}
      internalUsageAttributionIds={['gmp_git_agentskills_v1']}
      style={{width: '600px', height: '400px'}}
    />
  );
}
```

### 2.2 3D Map (`<Map3D>`)

For 3D visualization, the `<Map3D>` component requires the `maps3d` library to
be loaded (implicitly handled if `<Map3D>` is used). Camera control is extended
to include `altitude`, `range`, `heading`, `tilt`, and `roll`.

```tsx
import {Map3D, MapMode} from '@vis.gl/react-google-maps';

function ThreeDMap() {
  return (
    <Map3D
      mode={MapMode.SATELLITE}
      defaultCenter={{lat: 37.79, lng: -122.39, altitude: 500}} // Altitude required
      defaultRange={2000} // Distance from camera to center point
      defaultTilt={60} // Angle from vertical
      defaultHeading={0}
      internalUsageAttributionIds={['gmp_git_agentskills_v1']}
      style={{width: '100%', height: '500px'}}
    />
  );
}
```

### 2.3 Accessing the Imperative Map Instance (`useMap`)

The `useMap` hook provides direct access to the underlying `google.maps.Map`
object for imperative actions (e.g., resizing, forcing boundary updates).

```tsx
import {useMap} from '@vis.gl/react-google-maps';

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    if (map) {
      // Imperative call to update map size
      map.setCenter({lat: 40, lng: -100});
      map.setZoom(5);
    }
  }, [map]);

  return null;
}
```

## 3. Modern Marker and Overlay Management

### 3.1 Advanced Markers (`<AdvancedMarker>`)

The `<AdvancedMarker>` component is the modern, performant standard for placing
markers. It supports full custom styling using React children.

Prop                      | Type                                       | Description                                                               | Best Practice
:------------------------ | :----------------------------------------- | :------------------------------------------------------------------------ | :------------
`position`                | `LatLngLiteral` \| `LatLngAltitudeLiteral` | Location on the map.                                                      | Required
`children`                | `ReactNode`                                | Custom content (React components, `<img>`, `<Pin>`).                      | Preferred over default balloon pin.
`collisionBehavior`       | `CollisionBehavior`                        | Defines how markers interact with each other/labels.                      | Use imported `CollisionBehavior` enum.
`anchorLeft`, `anchorTop` | `string`                                   | CSS length/percentage values to specify anchor point relative to content. | Use instead of deprecated `anchorPoint`.

**Custom Marker Example**

```tsx
import {AdvancedMarker, Pin} from '@vis.gl/react-google-maps';

function CustomMarkers() {
  const position = {lat: 40.71, lng: -74.00};

  return (
    <>
      <AdvancedMarker position={position}>
        {/* Custom content via React children */}
        <img src="/custom_icon.svg" width={40} height={40} alt="Custom Marker" />
      </AdvancedMarker>

      <AdvancedMarker position={{lat: 40.72, lng: -74.01}}>
        {/* Customizing default Pin */}
        <Pin background={'#0f9d58'} glyphColor={'#FFF'} />
      </AdvancedMarker>
    </>
  );
}
```

### 3.2 Linking Markers and InfoWindows

To link an `<AdvancedMarker>` to an `<InfoWindow>`, use the provided
`useAdvancedMarkerRef` hook to manage the reference required for the `anchor`
prop.

**Complete Hook Implementation: `useAdvancedMarkerRef`**

```tsx
import {useState, useCallback} from 'react';

/**
 * Hook to simplify connecting an AdvancedMarker instance to an InfoWindow anchor prop.
 * Returns a ref callback for the AdvancedMarker and the marker instance for the InfoWindow.
 */
export function useAdvancedMarkerRef() {
  const [marker, setMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  const refCallback = useCallback((m: google.maps.marker.AdvancedMarkerElement | null) => {
    setMarker(m);
  }, []);

  // Returns [ref, instance]
  return [refCallback, marker] as const;
}

// Usage Example
function MarkerWithInfoWindow({position, content}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={() => setInfoWindowShown(true)}
      />

      {infoWindowShown && (
        <InfoWindow anchor={marker} onClose={handleClose}>
          {content}
        </InfoWindow>
      )}
    </>
  );
}
```

## 4. Modern Services Integration: Routing and Places

**CRITICAL CORS PREFLIGHT GUARDRAIL:** Standard client-side `fetch` or HTTP
requests to REST endpoints like `routes.googleapis.com` will fail due to CORS
preflight restrictions. All Maps Platform REST features **MUST** be accessed
using the official JavaScript SDK wrappers provided via `useMapsLibrary()`.

### 4.1 Dynamic Library Loading (`useMapsLibrary`)

Use `useMapsLibrary` to load necessary SDK modules (e.g., `'routes'`,
`'places'`, `'geometry'`) dynamically and safely within the browser environment.

```tsx
import {useMapsLibrary} from '@vis.gl/react-google-maps';

function ServiceConsumer() {
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');

  useEffect(() => {
    if (placesLib) {
      console.log('Places Library is available:', placesLib.Place);
    }
  }, [placesLib]);

  // ... implement logic using the loaded libraries
}
```

### 4.2 Pattern: Modern Routes API Integration

Below is the recommended pattern for computing routes using the modern,
promise-based SDK wrapper loaded via `useMapsLibrary('routes')`.

**Complete Hook Implementation: `useRouteCalculator` (Routes API)**

```tsx
import {useState, useEffect, useCallback} from 'react';
import {useMap} from './use-map';
import {useMapsLibrary} from './use-maps-library';

interface LatLngLiteral {
    lat: number;
    lng: number;
}

/**
 * Custom hook to interface with the modern Google Maps Routes Service.
 * This utilizes the client-side JS SDK wrapper (routesLib.Route.computeRoutes)
 * which safely handles requests without triggering CORS preflight issues.
 */
function useRouteCalculator() {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [result, setResult] = useState<google.maps.routes.Route[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const computeRoute = useCallback(async (origin: LatLngLiteral, destination: LatLngLiteral) => {
    if (!routesLib || !map) {
      setError("Routes library or map not loaded.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const request: google.maps.routes.RouteRequest = {
      origin: {lat: origin.lat, lng: origin.lng},
      destination: {lat: destination.lat, lng: destination.lng},
      travelMode: 'DRIVING' as google.maps.routes.TravelMode,
      provideRouteAlternatives: false,
      // routeModifiers for REST use: avoidTolls: true, avoidHighways: true, vehicleInfo: { emissionType: 'GASOLINE' }
    };

    try {
        // Instantiate and use the modern, Promise-based Routes Service
        const routeService = new routesLib.Route(map);
        const response = await routeService.computeRoutes(request);

        if (response.routes.length > 0) {
            setResult(response.routes);
        } else {
            setError("No route found.");
        }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to compute route.");
    } finally {
      setIsLoading(false);
    }
  }, [routesLib, map]);

  return {computeRoute, result, isLoading, error};
}
```

## 5. Casing Nuances and Data Types

When interacting with Maps Platform APIs via the JavaScript SDK, be aware of
case sensitivity differences, particularly when referencing coordinate literals
and REST payloads.

Concept                  | JS SDK / React Prop Name | Type                        | Example
:----------------------- | :----------------------- | :-------------------------- | :------
Coordinate Literal       | `lat`, `lng`             | `google.maps.LatLngLiteral` | `{ lat: 34.0, lng: -118.0 }`
Coordinates Class        | N/A                      | `google.maps.LatLng`        | `new google.maps.LatLng(34.0, -118.0)`
Map ID                   | `mapId`                  | `string`                    | `'YOUR_MAP_ID'`
Advanced Marker Position | `position`               | `LatLngLiteral`             | `{ lat: 34.0, lng: -118.0 }`

**Gotcha: Direct REST Payload Casing**

If you were writing a server-side component or were using an older library that
required direct JSON POST payloads (e.g., to the Routes REST API), the casing
differs strictly:

*   **JS SDK (React/Browser):** Use PascalCase properties for SDK objects (e.g.,
    `TravelMode: 'DRIVING'`).
*   **REST API (Server/Backend):** Use snake_case or camelCase JSON fields
    (e.g., `travel_mode: 'DRIVING'`).

Always use the **JS SDK wrapper** methods (like `computeRoutes` via
`useMapsLibrary`) in a client-side React component to avoid this complexity and
the CORS issue.

## 6. Advanced Utility: Web Worker Clustering

For applications requiring high performance with large datasets, offloading
heavy computations (like Supercluster indexing) to a Web Worker is a recommended
practice. The framework provides a ready-made hook for this pattern.

**Complete Hook Implementation: `useSuperclusterWorker`**

This hook manages the worker lifecycle and communication for performing
Supercluster operations asynchronously.

```tsx
/**
 * GeoJSON Bounding Box [west, south, east, north]
 */
export type BBox = [number, number, number, number];

/**
 * GeoJSON Point geometry
 */
export interface PointGeometry {
  type: 'Point';
  coordinates: [number, number];
}

/**
 * GeoJSON Feature
 */
export interface GeoFeature<P = Record<string, unknown>> {
  type: 'Feature';
  id?: string | number;
  geometry: PointGeometry;
  properties: P;
}

/**
 * GeoJSON FeatureCollection
 */
export interface GeoFeatureCollection<P = Record<string, unknown>> {
  type: 'FeatureCollection';
  features: GeoFeature<P>[];
}

/**
 * Supercluster options
 */
export interface SuperclusterOptions {
  /** Min zoom level to generate clusters */
  minZoom?: number;
  /** Max zoom level to cluster points */
  maxZoom?: number;
  /** Minimum points to form a cluster */
  minPoints?: number;
  /** Cluster radius in pixels */
  radius?: number;
  /** Tile extent (radius is calculated relative to it) */
  extent?: number;
  /** Whether to generate numeric ids for clusters */
  generateId?: boolean;
}

/**
 * Properties added to cluster features by Supercluster
 */
export interface ClusterProperties {
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string | number;
}

/**
 * A cluster or point feature returned by Supercluster
 */
export type ClusterFeature<P = Record<string, unknown>> =
  | GeoFeature<P>
  | GeoFeature<ClusterProperties>;

export interface SuperclusterViewport {
  /** Bounding box [west, south, east, north] */
  bbox: BBox;
  /** Zoom level (will be floored to integer) */
  zoom: number;
}

export interface UseSuperclusterWorkerResult<P = Record<string, unknown>> {
  /** Current clusters/markers for the viewport */
  clusters: ClusterFeature<P>[];
  /** True while loading data or calculating clusters */
  isLoading: boolean;
  /** Error message if worker failed */
  error: string | null;
  /** Get all leaf features in a cluster */
  getLeaves: (clusterId: number, limit?: number) => Promise<GeoFeature<P>[]>;
  /** Get immediate children of a cluster */
  getChildren: (clusterId: number) => Promise<ClusterFeature<P>[]>;
  /** Get zoom level at which a cluster expands */
  getClusterExpansionZoom: (clusterId: number) => Promise<number>;
}

// Internal Worker Messaging Types
type WorkerMessage =
  | {type: 'init'; options: SuperclusterOptions}
  | {type: 'load'; features: GeoFeature[]}
  | {type: 'getClusters'; bbox: BBox; zoom: number; requestId: number}
  | {type: 'getLeaves'; clusterId: number; requestId: number; limit?: number}
  | {type: 'getChildren'; clusterId: number; requestId: number}
  | {type: 'getClusterExpansionZoom'; clusterId: number; requestId: number};

type WorkerResponse =
  | {type: 'ready'}
  | {type: 'loaded'; count: number}
  | {type: 'clusters'; clusters: ClusterFeature[]; requestId: number}
  | {type: 'leaves'; leaves: GeoFeature[]; requestId: number}
  | {type: 'children'; children: ClusterFeature[]; requestId: number}
  | {type: 'expansionZoom'; zoom: number; requestId: number}
  | {type: 'error'; message: string; requestId?: number};

// Check if Web Workers are supported
const supportsWorker = typeof Worker !== 'undefined';

/**
 * Hook for running Supercluster in a Web Worker
 *
 * @param geojson - GeoJSON FeatureCollection with Point features
 * @param options - Supercluster configuration options
 * @param viewport - Current map viewport (bbox and zoom)
 * @param workerUrl - URL to the clustering worker file
 * @returns Clustering results and utility functions
 */
export function useSuperclusterWorker<P = Record<string, unknown>>(
  geojson: GeoFeatureCollection<P> | null,
  options: SuperclusterOptions,
  viewport: SuperclusterViewport,
  workerUrl: URL | string
): UseSuperclusterWorkerResult<P> {
  const initialError = useMemo(
    () =>
      supportsWorker ? null : 'Web Workers not supported in this environment',
    []
  );

  const [clusters, setClusters] = useState<ClusterFeature<P>[]>([]);
  const [isLoading, setIsLoading] = useState(supportsWorker);
  const [error, setError] = useState<string | null>(initialError);

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const pendingRequestsRef = useRef<
    Map<
      number,
      {resolve: (value: unknown) => void; reject: (error: Error) => void}
    >
  >(new Map());
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize worker
  useEffect(() => {
    if (!supportsWorker) return;

    let worker: Worker;
    try {
      worker = new Worker(workerUrl, {type: 'module'});
    } catch (e) {
      setError(
        `Failed to create worker: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
      setIsLoading(false);
      return;
    }

    workerRef.current = worker;
    const pendingRequests = pendingRequestsRef.current;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;

      switch (response.type) {
        case 'ready':
          break;

        case 'loaded':
          break;

        case 'clusters':
          setClusters(response.clusters as ClusterFeature<P>[]);
          setIsLoading(false);
          break;

        case 'leaves':
        case 'children':
        case 'expansionZoom': {
          const pending = pendingRequests.get(response.requestId);
          if (pending) {
            pendingRequests.delete(response.requestId);
            if (response.type === 'leaves') {
              pending.resolve(response.leaves);
            } else if (response.type === 'children') {
              pending.resolve(response.children);
            } else {
              pending.resolve(response.zoom);
            }
          }
          break;
        }

        case 'error':
          setError(response.message);
          setIsLoading(false);
          if (response.requestId !== undefined) {
            const pending = pendingRequests.get(response.requestId);
            if (pending) {
              pendingRequests.delete(response.requestId);
              pending.reject(new Error(response.message));
            }
          }
          break;
      }
    };

    worker.onerror = err => {
      setError(err.message || 'Worker error');
      setIsLoading(false);
    };

    // Initialize with options
    const initMessage: WorkerMessage = {
      type: 'init',
      options: optionsRef.current
    };
    worker.postMessage(initMessage);

    return () => {
      worker.terminate();
      workerRef.current = null;
      pendingRequests.clear();
    };
  }, [workerUrl]);

  // Load data when geojson changes
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker || !geojson) return;

    setIsLoading(true);

    const loadMessage: WorkerMessage = {
      type: 'load',
      features: geojson.features as GeoFeature[]
    };
    worker.postMessage(loadMessage);
  }, [geojson]);

  // Get clusters when viewport or data changes
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker || !geojson) return;

    // Throttle cluster requests slightly
    const timeoutId = setTimeout(() => {
      const requestId = ++requestIdRef.current;

      const message: WorkerMessage = {
        type: 'getClusters',
        bbox: viewport.bbox,
        zoom: Math.floor(viewport.zoom),
        requestId
      };
      worker.postMessage(message);
    }, 100); // Debounce delay

    return () => clearTimeout(timeoutId);
  }, [viewport, geojson]);

  const createWorkerPromise = useCallback(<T>(type: 'getLeaves' | 'getChildren' | 'getClusterExpansionZoom', payload: any): Promise<T> => {
    return new Promise((resolve, reject) => {
        const worker = workerRef.current;
        if (!worker) {
          reject(new Error('Worker not initialized'));
          return;
        }

        const requestId = ++requestIdRef.current;
        pendingRequestsRef.current.set(requestId, {
          resolve: resolve as (value: unknown) => void,
          reject
        });

        const message = {type, requestId, ...payload} as WorkerMessage;
        worker.postMessage(message);
    });
  }, []);

  const getLeaves = useCallback(
    (clusterId: number, limit?: number): Promise<GeoFeature<P>[]> => {
      return createWorkerPromise<GeoFeature<P>[]>('getLeaves', {clusterId, limit});
    }, [createWorkerPromise]
  );

  const getChildren = useCallback(
    (clusterId: number): Promise<ClusterFeature<P>[]> => {
        return createWorkerPromise<ClusterFeature<P>[]>('getChildren', {clusterId});
    }, [createWorkerPromise]
  );

  const getClusterExpansionZoom = useCallback(
    (clusterId: number): Promise<number> => {
      return createWorkerPromise<number>('getClusterExpansionZoom', {clusterId});
    }, [createWorkerPromise]
  );

  return {
    clusters,
    isLoading,
    error,
    getLeaves,
    getChildren,
    getClusterExpansionZoom
  };
}
```
