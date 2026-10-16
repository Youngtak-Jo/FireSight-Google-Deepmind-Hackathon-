This document outlines key usage patterns, initialization steps, and best
practices for integrating Markers (standard and advanced) and InfoWindows using
the `@vis.gl/react-google-maps` library.

--------------------------------------------------------------------------------

## 1. Core Initialization and Setup

All map components must be rendered within the `<APIProvider>`. For Marker
functionality, it is recommended to explicitly load the `marker` library.

### 1.1 App Structure (`app.tsx`)

The main application component handles API key configuration, library loading,
and map instantiation. Note the required `internalUsageAttributionIds` prop on
`<Map>`.

```tsx
import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';

// Assume API_KEY is loaded securely
const API_KEY = process.env.GOOGLE_MAPS_API_KEY as string;

const MapApplication = () => {
  return (
    <APIProvider apiKey={API_KEY} libraries={['marker']}>
      <Map
        mapId={'bf51a910020fa25a'}
        defaultZoom={10}
        defaultCenter={{ lat: 34.05, lng: -118.24 }} // Los Angeles
        gestureHandling={'greedy'}
        disableDefaultUI
        internalUsageAttributionIds={['gmp_git_agentskills_v1']} // CRITICAL: Required Prop
      >
        {/* Markers and InfoWindows will be rendered here */}
        <MarkerWithInfowindow />
        <MovingMarker />
      </Map>
    </APIProvider>
  );
};

export default MapApplication;
```

--------------------------------------------------------------------------------

## 2. Marker Usage Patterns

The library provides two primary components for placing points on the map:
`<Marker>` (a wrapper for the legacy `google.maps.Marker`) and
`<AdvancedMarker>` (the modern, highly customizable component).

### 2.1 Simple Clickable Marker

Use the standard `<Marker>` component for basic map pins. This component is
optimized for performance when dealing with a large number of simple markers.

```tsx
import { Marker } from '@vis.gl/react-google-maps';

const SimpleMarker = () => (
  <Marker
    position={{ lat: 10, lng: 10 }}
    clickable={true}
    onClick={() => alert('Marker clicked!')}
    title={'Standard google.maps.Marker'}
  />
);
```

### 2.2 Advanced Marker with Default Pin

The `<AdvancedMarker>` component allows for complex customization using CSS and
HTML. If no children are provided, it uses the default Advanced Marker icon.

```tsx
import { AdvancedMarker } from '@vis.gl/react-google-maps';

const DefaultAdvancedMarker = () => (
  <AdvancedMarker
    position={{ lat: 20, lng: 10 }}
    title={'AdvancedMarker with default styling.'}
  />
);
```

### 2.3 Customizing the Pin Icon

Use the `<Pin>` component as a child of `<AdvancedMarker>` to easily change the
standard map pin's color and glyph without writing custom CSS.

```tsx
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const CustomPinMarker = () => (
  <AdvancedMarker
    position={{ lat: 15, lng: 20 }}
    title={'AdvancedMarker with customized pin.'}
  >
    <Pin
      background={'#22ccff'}
      borderColor={'#1e89a1'}
      glyphColor={'#0f677a'}
      scale={1.4} // Adjust size
    >
      {/* Optional: Add custom glyph content here */}
      🗺️
    </Pin>
  </AdvancedMarker>
);
```

### 2.4 Fully Custom HTML Content

Pass any arbitrary JSX/HTML as children to the `<AdvancedMarker>` component to
create completely custom visuals, such as CSS-drawn shapes.

```tsx
import { AdvancedMarker } from '@vis.gl/react-google-maps';

const CustomHtmlMarker = () => (
  <AdvancedMarker
    position={{ lat: 30, lng: 10 }}
    title={'AdvancedMarker with custom html content.'}
  >
    <div
      style={{
        width: 16,
        height: 16,
        position: 'absolute',
        top: 0,
        left: 0,
        background: '#1dbe80',
        border: '2px solid #0e6443',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
    </div>
  </AdvancedMarker>
);
```

--------------------------------------------------------------------------------

## 3. InfoWindow Usage Patterns

InfoWindows display interactive content, either tied to a specific coordinate or
anchored dynamically to a visible map object (like a Marker).

### 3.1 Fixed Position InfoWindow

If the InfoWindow is not related to a specific marker, it can be positioned
directly using coordinates.

```tsx
import { InfoWindow } from '@vis.gl/react-google-maps';

const FixedInfoWindow = () => (
  <InfoWindow position={{ lat: 40, lng: 0 }} maxWidth={200}>
    <p>
      This InfoWindow is fixed at a specific coordinate (40, 0).
    </p>
  </InfoWindow>
);
```

### 3.2 Anchoring to an AdvancedMarker

To anchor an `InfoWindow` to an `AdvancedMarker`, you must obtain a reference to
the underlying Advanced Marker instance using the `useAdvancedMarkerRef` hook.

#### Component: `MarkerWithInfowindow` (Complete Implementation)

This component demonstrates managing the InfoWindow visibility state and
anchoring it dynamically.

```tsx
import React, {useState} from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';

/**
 * Demonstrates an AdvancedMarker that controls the visibility of an Infowindow
 * anchored directly to the marker instance.
 */
export const MarkerWithInfowindow = () => {
  const [infowindowOpen, setInfowindowOpen] = useState(false);
  // useAdvancedMarkerRef returns [ref, markerInstance]
  const [markerRef, marker] = useAdvancedMarkerRef();

  // Initial state is closed; only open on click
  const handleMarkerClick = () => {
    setInfowindowOpen(true);
  };

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        onClick={handleMarkerClick}
        position={{lat: 28, lng: -82}}
        title={'Click to open Infowindow.'}
      />
      {infowindowOpen && marker && (
        <InfoWindow
          // CRITICAL: Anchor the InfoWindow to the resolved marker instance
          anchor={marker}
          maxWidth={200}
          onCloseClick={() => setInfowindowOpen(false)}>
          This is an example for the{' '}
          <code style={{whiteSpace: 'nowrap'}}>&lt;AdvancedMarker /&gt;</code>{' '}
          combined with an Infowindow.
        </InfoWindow>
      )}
    </>
  );
};
```

**Best Practice:** Ensure `marker` (the resolved instance) is truthy before
conditionally rendering the `<InfoWindow>` using it as an `anchor`.

--------------------------------------------------------------------------------

## 4. Advanced Usage: Dynamic and Moving Markers

To create a marker that changes position dynamically (e.g., simulating vehicle
movement), manage the marker's `position` using React state and update that
state via an interval or data stream.

#### Component: `MovingMarker` (Complete Implementation)

This component uses `useEffect` and `setInterval` to continuously update the
`position` state of the marker, causing it to animate on the map.

```tsx
import React, {useEffect, useState} from 'react';
import {Marker} from '@vis.gl/react-google-maps';

/**
 * Renders a standard Marker whose position continuously changes over time.
 */
export const MovingMarker = () => {
  // Use google.maps.LatLngLiteral for position state
  const [position, setPosition] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Use performance.now() for time-based animation
      const t = performance.now();
      // Calculate new position using trigonometric functions for smooth movement
      const lat = Math.sin(t / 2000) * 5;
      const lng = Math.cos(t / 3000) * 5;

      setPosition({lat, lng});
    }, 200); // Update every 200ms

    // Cleanup function to prevent memory leaks when component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures effect runs once on mount

  // Use standard <Marker> for performance in simple movement scenarios
  return <Marker position={position}></Marker>;
};
```

--------------------------------------------------------------------------------

## 5. Gotcha: Marker vs. AdvancedMarker

| Feature           | `<Marker>` (Legacy         | `<AdvancedMarker>` (Modern  |
:                   : Wrapper)                   : Component)                  :
| :---------------- | :------------------------- | :-------------------------- |
| **Performance**   | High performance for large | Optimized, performs well.   |
:                   : datasets.                  :                             :
| **Customization** | Very limited; requires     | Full HTML/CSS/JSX support   |
:                   : custom icon URL.           : for icons.                  :
| **Pin Styling**   | No built-in pin styling.   | Supports `<Pin>` component  |
:                   :                            : for easy color changes.     :
| **Anchoring       | Requires                   | Requires                    |
: InfoWindow**      : `google.maps.Marker`       : `useAdvancedMarkerRef` hook :
:                   : instance.                  : to get instance for         :
:                   :                            : anchoring.                  :
| **When to Use**   | Simple, traditional pin    | Custom visuals, interactive |
:                   : icons where high count is  : markers, modern UI          :
:                   : critical.                  : integration.                :
