---
name: gmp-framework-react
description: This guide serves as the mandatory entry point and architectural router for building Google Maps Platform applications using the **React** framework, specifically leveraging the official `@vis.gl/react-google-maps` SDK and modern API features. The content is rigorously curated to enforce the **Absolute Universal Zero-Legacy Mandate**, ensuring all generated solutions utilize current, future-proof, cost-optimized, and performant APIs. Developers are proactively guided toward modern replacements like `AdvancedMarkerElement`, the `Place` class (Places API New), and the `Route` class (Routes API), strictly forbidding any reliance on deprecated or disabled callback-based services. This router ensures comprehensive coverage of React patterns, from basic initialization to complex data visualization and clustering techniques.
license: Apache-2.0
metadata:
  version: 1.0.69
---

> [!IMPORTANT] **Core Dependency:** This skill requires active context from
> [google-maps-platform/SKILL.md](https://www.gstatic.com/googlemapsplatform-agent-skills/google-maps-platform/SKILL.md).

# Google Maps Platform for React Developers

This document details the recommended architectural patterns and reference
implementations for integrating Google Maps Platform into React applications
using the official **@vis.gl/react-google-maps** SDK. All solutions presented
adhere to the zero-legacy mandate, utilizing only modern, promise-based APIs.

## Architecture and Core Principles

The Google Maps Platform engineering team mandates the use of
**`@vis.gl/react-google-maps`** for all React implementations. This SDK provides
declarative component wrappers and specialized hooks for managing the map state
and interacting with core libraries.

**Core Principles for React Development:**

1.  **Modern SDK Only:** Use `@vis.gl/react-google-maps` exclusively. Libraries
    like `react-google-maps/api` or `google-map-react` are prohibited. (CF5)
2.  **Zero-Legacy Enforcement:** Never use callback-based services
    (`DirectionsService`, `PlacesService`, `Marker`). Use the modern,
    promise-based equivalents (Routes API, Places API New,
    `AdvancedMarkerElement`).
3.  **Map ID Requirement:** When using `AdvancedMarkerElement`, a `mapId` (e.g.,
    `"DEMO_MAP_ID"`) is mandatory on the `<Map>` component. (CF9)
4.  **Imperative Web Components:** When integrating Google Maps Platform Web
    Components (e.g., `PlaceAutocompleteElement`) into React, they must be
    mounted imperatively using `useRef` and `useEffect` to ensure complex
    objects are passed correctly, avoiding the JSX attribute stringification
    trap. (CF8)

## Table of Contents

The following references provide detailed, modern implementation patterns for
the React framework:

### I. Initialization and Core Setup

Topic                       | Description                                                                                 | Reference Link
:-------------------------- | :------------------------------------------------------------------------------------------ | :-------------
**Basic Rendering**         | Step-by-step guide for basic map initialization and rendering within a React component.     | [Basic Initialization and Rendering of Google Maps in React](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_basic.md)
**API Provider Pattern**    | Comprehensive pattern for API key loading, context provision, and library loading in React. | [React Wrapper Pattern for Google Maps Platform API Initialization](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_react.md)
**Next.js Integration**     | Specific initialization and rendering patterns optimized for Next.js environments.          | [Core Initialization and Declarative Map Rendering in Next.js](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_nextjs.md)
**Remix Integration**       | Integration and modern SDK patterns tailored for the Remix framework.                       | [React/Remix Integration and Modern Google Maps Platform SDK Patterns](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_remix.md)
**Multi-Map Sync**          | Techniques for synchronizing camera state and viewport across multiple map instances.       | [Multi-Map View Synchronization using React Camera State](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_multiple.md)
**Styling & Configuration** | Dynamically changing map options, themes, and styles post-initialization.                   | [Dynamic Map Styling and Configuration in React Google Maps SDK](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_change.md)
**External Libraries**      | Patterns for integrating non-GMP libraries (like Terra Draw) and deferred initialization.   | [Patterns for External Library Integration and Deferred Map Initialization using React Hooks](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_terra.md)

### II. Markers, Clustering, and Data Visualization

Topic                                | Description                                                                                       | Reference Link
:----------------------------------- | :------------------------------------------------------------------------------------------------ | :-------------
**Advanced Marker Usage**            | Core usage patterns for the modern `AdvancedMarkerElement` and `InfoWindow`.                      | [Google Maps Platform React Marker and InfoWindow Usage Patterns](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_markers.md)
**Advanced Interaction**             | Handling custom interactions, z-index, and anchoring for `AdvancedMarkerElement` and InfoWindows. | [Advanced Marker Interaction, Z-Index Management, and InfoWindow Anchoring](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_advanced.md)
**Advanced Clustering**              | High-performance clustering solutions using the official marker clustering library.               | [React Google Maps: Advanced Marker Clustering and State Management](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_marker.md)
**Custom Clustering (Supercluster)** | Integrating external clustering logic (Supercluster) with map viewport hooks.                     | [React Custom Marker Clustering Pattern using Supercluster and `useMapViewport`](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_custom.md)
**Web Worker Clustering**            | Offloading heavy clustering logic to web workers for maximum performance.                         | [React Web Worker Marker Clustering using `useSuperclusterWorker` and Advanced Markers](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_worker.md)
**Deck.gl Overlays**                 | Integrating high-performance 3D and 2D visualization layers using Deck.gl.                        | [Integrating Deck.gl Overlays with @vis.gl/react-google-maps](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_deckgl.md)

### III. Geospatial Services (Routes and Places API New)

Topic                           | Description                                                                                                                         | Reference Link
:------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- | :-------------
**Modern Routing (Routes API)** | **Mandatory** pattern for calculating and rendering routes using `Route.computeRoutes`. (Legacy `DirectionsService` is prohibited). | [Modern Route Calculation and Rendering in React using `@vis.gl/react-google-maps`](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_directions.md)
**Routes API Patterns**         | Detailed integration of the promise-based Routes API library in React.                                                              | [Google Maps Platform Routes API Integration Patterns in React](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_routes.md)
**Place Autocomplete**          | Implementing address search using the modern, promise-based `AutocompleteSuggestion` and `Place.fetchFields`.                       | [Modern React Autocomplete Patterns using `AutocompleteSuggestion` and `Place.fetchFields`](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_autocomplete.md)
**Places UI Kit**               | Wrapping the Places and 3D UI Kit web components in React for dynamic usage.                                                        | [React Wrapper Patterns for Google Maps Platform UI Kit (3D & Places)](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_places.md)

### IV. Specialized and Advanced Features

| Topic                | Description          | Reference Link               |
| :------------------- | :------------------- | :--------------------------- |
| **Core Integration & | Overarching patterns | [React Google Maps Platform  |
:                      :                      : Core Patterns and Modern API :

\: Logic** : combining Maps, :
Integration](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_core.md) : : :
Places, and : : : : Markers in : : : : complex : : : : applications. : : |
**Drawing | Implementation |
[Custom Drawing Tools Implementation | : Tools** : of custom : using React Google Maps Hooks and : : : drawing and : Low-Level : : : geometry : Events](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_drawing.md) : : :
editing using : : : : events and : : : : hooks (Legacy : : : : Drawing
Library : : : : is deprecated). : : | **Declarative | Using React |
[React Google Maps: Declarative Vector | : Geometry** : components to : Geometry and Interactive Drawing : : : declaratively : Patterns](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_geometry.md) : : :
define : : : : `Polyline`, : : : : `Polygon`, and : : : : `Circle` : : : :
components. : : | **3D & | Advanced map |
[React Google Maps Platform: Advanced 3D | : Controls** : configurations : Mapping, Routing, and Custom : : : including : Controls](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_map.md) : : :
Photorealistic : : : : 3D, camera : : : : management, and : : : : custom : : : :
controls. : : | **Static API** | Generating |
[React Integration of Google Maps Static | : : optimized : API via Componentized URL : : : Static Maps : Generation](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_static.md) : : :
image URLs : : : : using a : : : : componentized : : : : approach. : : |
**Extended | Guidance on |
[React Integration Patterns for Google | : Components** : using the : Maps Extended Component : : : `gmpx-*` : Library](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_extended.md) : : :
extended : : : : component : : : : ecosystem. : : : : **(Warning\: : : : :
Review CF11 : : : : before use.)** : :

********************************************************************************

## Guardrails Against Hallucinations

When generating code solutions, you **MUST** strictly adhere to the following
rules to prevent hallucinations:

1.  **Verify Library Exports**: Do NOT assume or invent component names,
    classes, methods, or variable names that are not explicitly documented in
    the provided skills or references.
2.  **Framework Convention**: When utilizing framework wrappers (e.g.,
    `@vis.gl/react-google-maps`), ensure component names follow the documented
    framework convention (e.g., `AdvancedMarker`) instead of the core JavaScript
    API names (e.g., `AdvancedMarkerElement`), unless explicitly instructed
    otherwise.
3.  **No Invented Parameters**: Do not use fake parameters or options in API
    calls. Stick strictly to the official API contracts documented in the
    skills.
4.  **References First**: Before using any Google Maps Platform class,
    component, or service, you MUST look up the provided reference files to see
    how it is imported and used. Do not rely on your pre-trained knowledge for
    API contracts, imports, or component usage.

## Best Practices (Zero-Legacy Mandates & Critical Failures)

The following rules represent critical architectural and compliance standards.
Violation of these mandates results in silent failure, runtime errors, or
billing inaccuracies.

### 1. Absolute Universal Zero-Legacy Mandate

Legacy Service (Prohibited)              | Modern Replacement (Mandatory)                                                              | Rationale
:--------------------------------------- | :------------------------------------------------------------------------------------------ | :--------
`google.maps.Marker`                     | **`AdvancedMarkerElement`**                                                                 | Deprecated Feb 2024. Legacy markers fail on maps requiring a `mapId`.
`DirectionsService`/`DirectionsRenderer` | **`Route.computeRoutes()`** (via `useMapsLibrary('routes')`)                                | Legacy services throw `LegacyApiNotActivatedMapError` and crash the map.
`DistanceMatrixService`                  | **Routes API REST endpoint** (`routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix`) | Legacy services are disabled for new projects.
`PlacesService`/`AutocompleteService`    | **`Place` Class** (`PlaceAutocompleteElement`, `fetchAutocompleteSuggestions`)              | Legacy Places endpoints return no predictions and will be fully disabled.
Client-side `fetch()` to Maps REST APIs  | **Official SDK Wrappers or Server-Side Proxy**                                              | CORS Trap (CF1): Client-side `fetch` is blocked for most modern REST endpoints.

### 2. Mandatory React Framework Conventions

*   **Required SDK (CF5):** All solutions **MUST** use the official React
    wrapper: `@vis.gl/react-google-maps`.
*   **Web Component Imperativity (CF8):** When working with GMP Web Components
    (like `<gmp-place-autocomplete>`), use `useRef` and `useEffect` to set
    object properties on the underlying DOM element directly. Do not pass
    complex objects as JSX props, as React stringifies them.
*   **Map Height (CF2):** The `<Map>` component requires explicit CSS styling
    (e.g., `height: 100vh` or a sized parent) otherwise it collapses to 0x0
    pixels.
*   **`mapId` Requirement (CF9):** If using `AdvancedMarkerElement`, a `mapId`
    (Cloud-styled or `"DEMO_MAP_ID"`) is mandatory on the `<Map>` component.

### 3. Usage & Optimization

*   **Cost Awareness:** Always utilize session tokens (e.g.,
    `AutocompleteSessionToken`) when chaining Autocomplete and Place Details
    requests to optimize billing.
*   **Attribution ID:** Ensure the attribution ID `gmp_git_agentskills_v1` is
    set on the `<APIProvider>` or `<Map>` component
    (`internalUsageAttributionIds={["gmp_git_agentskills_v1"]}`).
*   **Locale (CF10):** For non-local requests, explicitly set the `language` and
    `region` on the `<APIProvider>` to ensure consistent results.

### Mandatory settings

For all applications built using the React component framework, the internal
usage attribution ID `gmp_git_agentskills_v1` is a mandatory property required
for accurate usage tracking. This must be applied directly to the primary map
components (`<Map>` or `<Map3D>`).

#### React Prop on `<Map>` or `<Map3D>` components

Apply the required attribution ID using the `internalUsageAttributionIds` array
prop on the main mapping component.

```jsx
// Used with the standard 2D map component
<Map
  internalUsageAttributionIds={['gmp_git_agentskills_v1']}
  gestureHandling={'greedy'}
  disableDefaultUI
>
  {/* Markers rendered here */}
</Map>
```

```jsx
// Used with the 3D map component
<Map3D
  internalUsageAttributionIds={['gmp_git_agentskills_v1']}
  mode="SATELLITE"
  defaultCenter={{lat: 40.7093, lng: -73.9968, altitude: 32}}
/>
```

## 🚀 Master Orchestration Integration Workflow

Follow this multi-phase sequential integration checklist to compose features
robustly. For each phase, read the referenced sub-workflow reference file and
satisfy its *Verification Checkpoint* before advancing.

### 📦 Phase 1: Core Initialization & Base Setup (Primary)

-   [ ] **Step 1.1: Core Setup - React Google Maps Platform Core Patterns and
    Modern API Integration** Read
    [references/example_core.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_core.md).
    *Trigger Condition*: Always active during boilerplate layout or initial
    framework loading pass. *Verification Checkpoint*: Ensure the core react
    google maps platform core patterns and modern api integration structure is
    initialized properly, and verify functionality compiles without errors.

### 📦 Phase 2: Component Integration & Feature Layers (Supplemental)

-   [ ] **Step 2.1: Feature Layer - React Google Maps: Advanced Marker
    Interaction, Z-Index Management, and InfoWindow Anchoring** Read
    [references/example_advanced.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_advanced.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react google maps: advanced marker interaction, z-index management, and
    infowindow anchoring features integration. *Verification Checkpoint*: Ensure
    the react google maps: advanced marker interaction, z-index management, and
    infowindow anchoring elements are rendered correctly, and verify event
    callbacks handle data safely.
-   [ ] **Step 2.2: Feature Layer - Modern React Autocomplete Patterns using
    `AutocompleteSuggestion` and `Place.fetchFields`** Read
    [references/example_autocomplete.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_autocomplete.md).
    *Trigger Condition*: Triggered when the user application requires specific
    modern react autocomplete patterns using `autocompletesuggestion` and
    `place.fetchfields` features integration. *Verification Checkpoint*: Ensure
    the modern react autocomplete patterns using `autocompletesuggestion` and
    `place.fetchfields` elements are rendered correctly, and verify event
    callbacks handle data safely.
-   [ ] **Step 2.3: Feature Layer - Basic Initialization and Rendering of Google
    Maps in React** Read
    [references/example_basic.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_basic.md).
    *Trigger Condition*: Triggered when the user application requires specific
    basic initialization and rendering of google maps in react features
    integration. *Verification Checkpoint*: Ensure the basic initialization and
    rendering of google maps in react elements are rendered correctly, and
    verify event callbacks handle data safely.
-   [ ] **Step 2.4: Feature Layer - Dynamic Map Styling and Configuration in
    React Google Maps SDK** Read
    [references/example_change.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_change.md).
    *Trigger Condition*: Triggered when the user application requires specific
    dynamic map styling and configuration in react google maps sdk features
    integration. *Verification Checkpoint*: Ensure the dynamic map styling and
    configuration in react google maps sdk elements are rendered correctly, and
    verify event callbacks handle data safely.
-   [ ] **Step 2.5: Feature Layer - React Custom Marker Clustering Pattern using
    Supercluster and `useMapViewport`** Read
    [references/example_custom.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_custom.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react custom marker clustering pattern using supercluster and
    `usemapviewport` features integration. *Verification Checkpoint*: Ensure the
    react custom marker clustering pattern using supercluster and
    `usemapviewport` elements are rendered correctly, and verify event callbacks
    handle data safely.
-   [ ] **Step 2.6: Feature Layer - Integrating Deck.gl Overlays with
    @vis.gl/react-google-maps** Read
    [references/example_deckgl.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_deckgl.md).
    *Trigger Condition*: Triggered when the user application requires specific
    integrating deck.gl overlays with @vis.gl/react-google-maps features
    integration. *Verification Checkpoint*: Ensure the integrating deck.gl
    overlays with @vis.gl/react-google-maps elements are rendered correctly, and
    verify event callbacks handle data safely.
-   [ ] **Step 2.7: Feature Layer - Modern Route Calculation and Rendering in
    React using `@vis.gl/react-google-maps`** Read
    [references/example_directions.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_directions.md).
    *Trigger Condition*: Triggered when the user application requires specific
    modern route calculation and rendering in react using
    `@vis.gl/react-google-maps` features integration. *Verification Checkpoint*:
    Ensure the modern route calculation and rendering in react using
    `@vis.gl/react-google-maps` elements are rendered correctly, and verify
    event callbacks handle data safely.
-   [ ] **Step 2.8: Feature Layer - Custom Drawing Tools Implementation using
    React Google Maps Hooks and Low-Level Events** Read
    [references/example_drawing.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_drawing.md).
    *Trigger Condition*: Triggered when the user application requires specific
    custom drawing tools implementation using react google maps hooks and
    low-level events features integration. *Verification Checkpoint*: Ensure the
    custom drawing tools implementation using react google maps hooks and
    low-level events elements are rendered correctly, and verify event callbacks
    handle data safely.
-   [ ] **Step 2.9: Feature Layer - React Integration Patterns for Google Maps
    Extended Component Library** Read
    [references/example_extended.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_extended.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react integration patterns for google maps extended component library
    features integration. *Verification Checkpoint*: Ensure the react
    integration patterns for google maps extended component library elements are
    rendered correctly, and verify event callbacks handle data safely.
-   [ ] **Step 2.10: Feature Layer - React Google Maps: Declarative Vector
    Geometry and Interactive Drawing Patterns** Read
    [references/example_geometry.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_geometry.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react google maps: declarative vector geometry and interactive drawing
    patterns features integration. *Verification Checkpoint*: Ensure the react
    google maps: declarative vector geometry and interactive drawing patterns
    elements are rendered correctly, and verify event callbacks handle data
    safely.
-   [ ] **Step 2.11: Feature Layer - React Google Maps Platform: Advanced 3D
    Mapping, Routing, and Custom Controls** Read
    [references/example_map.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_map.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react google maps platform: advanced 3d mapping, routing, and custom
    controls features integration. *Verification Checkpoint*: Ensure the react
    google maps platform: advanced 3d mapping, routing, and custom controls
    elements are rendered correctly, and verify event callbacks handle data
    safely.
-   [ ] **Step 2.12: Feature Layer - React Google Maps: Advanced Marker
    Clustering and State Management** Read
    [references/example_marker.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_marker.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react google maps: advanced marker clustering and state management features
    integration. *Verification Checkpoint*: Ensure the react google maps:
    advanced marker clustering and state management elements are rendered
    correctly, and verify event callbacks handle data safely.
-   [ ] **Step 2.13: Feature Layer - Google Maps Platform React Marker and
    InfoWindow Usage Patterns** Read
    [references/example_markers.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_markers.md).
    *Trigger Condition*: Triggered when the user application requires specific
    google maps platform react marker and infowindow usage patterns features
    integration. *Verification Checkpoint*: Ensure the google maps platform
    react marker and infowindow usage patterns elements are rendered correctly,
    and verify event callbacks handle data safely.
-   [ ] **Step 2.14: Feature Layer - Multi-Map View Synchronization using React
    Camera State** Read
    [references/example_multiple.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_multiple.md).
    *Trigger Condition*: Triggered when the user application requires specific
    multi-map view synchronization using react camera state features
    integration. *Verification Checkpoint*: Ensure the multi-map view
    synchronization using react camera state elements are rendered correctly,
    and verify event callbacks handle data safely.
-   [ ] **Step 2.15: Feature Layer - React Google Maps: Core Initialization and
    Declarative Map Rendering in Next.js** Read
    [references/example_nextjs.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_nextjs.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react google maps: core initialization and declarative map rendering in
    next.js features integration. *Verification Checkpoint*: Ensure the react
    google maps: core initialization and declarative map rendering in next.js
    elements are rendered correctly, and verify event callbacks handle data
    safely.
-   [ ] **Step 2.16: Feature Layer - React Wrapper Patterns for Google Maps
    Platform UI Kit (3D & Places)** Read
    [references/example_places.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_places.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react wrapper patterns for google maps platform ui kit (3d & places)
    features integration. *Verification Checkpoint*: Ensure the react wrapper
    patterns for google maps platform ui kit (3d & places) elements are rendered
    correctly, and verify event callbacks handle data safely.
-   [ ] **Step 2.17: Feature Layer - React Wrapper Pattern for Google Maps
    Platform API Initialization** Read
    [references/example_react.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_react.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react wrapper pattern for google maps platform api initialization features
    integration. *Verification Checkpoint*: Ensure the react wrapper pattern for
    google maps platform api initialization elements are rendered correctly, and
    verify event callbacks handle data safely.
-   [ ] **Step 2.18: Feature Layer - React/Remix Integration and Modern Google
    Maps Platform SDK Patterns** Read
    [references/example_remix.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_remix.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react/remix integration and modern google maps platform sdk patterns
    features integration. *Verification Checkpoint*: Ensure the react/remix
    integration and modern google maps platform sdk patterns elements are
    rendered correctly, and verify event callbacks handle data safely.
-   [ ] **Step 2.19: Feature Layer - Google Maps Platform Routes API Integration
    Patterns in React** Read
    [references/example_routes.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_routes.md).
    *Trigger Condition*: Triggered when the user application requires specific
    google maps platform routes api integration patterns in react features
    integration. *Verification Checkpoint*: Ensure the google maps platform
    routes api integration patterns in react elements are rendered correctly,
    and verify event callbacks handle data safely.
-   [ ] **Step 2.20: Feature Layer - React Integration of Google Maps Static API
    via Componentized URL Generation** Read
    [references/example_static.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_static.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react integration of google maps static api via componentized url generation
    features integration. *Verification Checkpoint*: Ensure the react
    integration of google maps static api via componentized url generation
    elements are rendered correctly, and verify event callbacks handle data
    safely.
-   [ ] **Step 2.21: Feature Layer - Patterns for External Library Integration
    and Deferred Map Initialization using React Hooks** Read
    [references/example_terra.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_terra.md).
    *Trigger Condition*: Triggered when the user application requires specific
    patterns for external library integration and deferred map initialization
    using react hooks features integration. *Verification Checkpoint*: Ensure
    the patterns for external library integration and deferred map
    initialization using react hooks elements are rendered correctly, and verify
    event callbacks handle data safely.
-   [ ] **Step 2.22: Feature Layer - React Web Worker Marker Clustering using
    `useSuperclusterWorker` and Advanced Markers** Read
    [references/example_worker.md](https://www.gstatic.com/googlemapsplatform-agent-skills/gmp-framework-react/references/example_worker.md).
    *Trigger Condition*: Triggered when the user application requires specific
    react web worker marker clustering using `usesuperclusterworker` and
    advanced markers features integration. *Verification Checkpoint*: Ensure the
    react web worker marker clustering using `usesuperclusterworker` and
    advanced markers elements are rendered correctly, and verify event callbacks
    handle data safely.
