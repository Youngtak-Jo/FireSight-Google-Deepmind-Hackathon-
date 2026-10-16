---
name: routes-api-web-api
description: Use this skill when a user needs to compute efficient routes, retrieve travel distances and times, and specify detailed parameters like eco-friendly options, intermediate stops, and features to avoid (e.g., tolls or highways) for single or matrix route requests.
license: Apache-2.0
metadata:
  version: 1.0.55
---

> [!IMPORTANT] **Core Dependency:** This skill requires active context from
> [google-maps-platform/SKILL.md](https://www.gstatic.com/googlemapsplatform-agent-skills/google-maps-platform/SKILL.md).

### Overview

Use this skill to access the Routes API, the modern, high-performance service
for calculating routes and travel times for complex navigational scenarios. This
API replaces the legacy Directions and Distance Matrix APIs, providing enhanced
control over routing logic via HTTP REST requests.

The Routes API supports two primary modes:

1.  **Compute Route:** Calculate a detailed route, including distance, duration,
    polyline, and step-by-step instructions between two or more locations,
    allowing for intermediate waypoints, transit preferences, and optimization.
2.  **Compute Route Matrix:** Calculate distances and travel times between
    multiple origins and multiple destinations efficiently.

Requests are highly configurable, supporting parameters to specify travel mode
(driving, walking, two-wheeler, transit), real-time traffic conditions, features
to avoid (like tolls or highways), and eco-friendly routing preferences.

### Mandatory settings

For all Routes API v2 REST requests (`computeRoutes`, `computeRouteMatrix`), the
following headers and parameters are mandatory for authorization, proper
attribution, and receiving a functional response.

#### 1. Authentication (Header)

All requests must be authenticated using your Google Maps Platform API Key.

```http
X-Goog-Api-Key: YOUR_API_KEY
```

#### 2. Response Filtering (Header)

The Routes API v2 is a Field Mask API. You **must** specify which fields you
want returned in the response object using the `X-Goog-FieldMask` header.
Failure to provide this header or request specific fields will result in an
empty response payload or a silent failure to retrieve the requested data.

```http
X-Goog-FieldMask: routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline
```

#### 3. Attribution (Header)

The mandatory solution identifier must be included in the header for
traceability and compliance. This method is required for all REST API POST
requests.

```http
X-Goog-Maps-Solution-ID: gmp_git_agentskills_v1
```

#### 4. Attribution (Request Body)

Alternatively, for `computeRoutes` requests, the attribution ID can be passed
within the JSON request body using the `internalUsageAttributionIds` property.

```json
"internalUsageAttributionIds": [
  "gmp_git_agentskills_v1"
]
```

## 🚀 Master Orchestration Integration Workflow

Follow this multi-phase sequential integration checklist to compose features
robustly. For each phase, read the referenced capability sub-workflow file and
satisfy its *Evidence Checkpoint* before advancing.

### 📦 Phase 1: Core Initialization & Base Setup (Primary)

-   [ ] **Step 1.1: Returns the geometric path of the route as an ordered series
    of latitude/longitude coordinates (polyline).** Read
    [return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md).
    *Trigger Condition*: User requests the raw route path geometry or needs
    coordinate data for subsequent calculations. *Evidence Checkpoint*:
    Successful HTTP 200 OK response containing a 'path' object with coordinate
    pairs.
-   [ ] **Step 1.2: Returns detailed navigational instructions (maneuvers) for
    each step along the calculated route.** Read
    [return-directions-between-two-more-sets-latitude-longitude-coordinates-series-maneuver.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-directions-between-two-more-sets-latitude-longitude-coordinates-series-maneuver.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User requires turn-by-turn text instructions rather
    than just coordinate geometry. *Evidence Checkpoint*: Successful API
    response containing a 'maneuvers' array with structured step descriptions.
-   [ ] **Step 1.3: Returns the total distance for the entire calculated
    route.** Read
    [return-the-distance-for-route-between-two-more-sets-latitude-longitude.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-the-distance-for-route-between-two-more-sets-latitude-longitude.md).
    *Trigger Condition*: User queries the overall distance between the origin
    and destination(s). *Evidence Checkpoint*: Response contains the
    'distanceMeters' field for the calculated route.
-   [ ] **Step 1.4: Returns the total estimated travel time for the entire
    calculated route.** Read
    [return-the-travel-time-for-route-between-two-more-sets.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-the-travel-time-for-route-between-two-more-sets.md).
    *Trigger Condition*: User queries the total expected duration for the trip.
    *Evidence Checkpoint*: Response contains the 'duration' field for the
    calculated route.
-   [ ] **Step 1.5: Returns the distances for all possible routes between
    multiple origins and multiple destinations in a matrix format.** Read
    [return-distances-for-matrix-routes-between-multiple-origins-and-destinations.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-distances-for-matrix-routes-between-multiple-origins-and-destinations.md).
    *Trigger Condition*: User needs a distance table (matrix) comparing all
    possible journeys between sets of points. *Evidence Checkpoint*: Successful
    API response containing a matrix array with calculated distance results for
    each O-D pair.
-   [ ] **Step 1.6: Returns the travel times for all possible routes between
    multiple origins and multiple destinations in a matrix format.** Read
    [return-travel-times-for-matrix-routes-between-multiple-origins-and.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-travel-times-for-matrix-routes-between-multiple-origins-and.md).
    *Dependencies*:
    `["return-distances-for-matrix-routes-between-multiple-origins-and-destinations.md"]`
    *Trigger Condition*: User needs a travel time table (matrix) comparing many
    possible journeys. *Evidence Checkpoint*: Response matrix includes duration
    results for each origin-destination pair.

### 📦 Phase 2: Feature Layer & Custom Enrichment (Supplemental)

#### 🗺️ Feature Module: Directions and Routing (Optional - Use-Case Dependent)

-   [ ] **Provides the distance covered within each step of the route.** Read
    [return-the-distance-between-each-step-along-route-between-two.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-the-distance-between-each-step-along-route-between-two.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User requests detailed distance breakdown per maneuver
    or route segment. *Evidence Checkpoint*: Response includes distance metrics
    populated for individual route steps.
-   [ ] **Provides the estimated travel time required for each step of the
    route.** Read
    [return-the-travel-time-between-each-step-along-route-between.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-the-travel-time-between-each-step-along-route-between.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User requests detailed travel time breakdown per
    maneuver or segment. *Evidence Checkpoint*: Response includes duration
    metrics populated for individual route steps.
-   [ ] **Returns an encoded polyline representing the path segment for each
    step of the route.** Read
    [return-encoded-polyline-between-each-step-along-route-between-two.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-encoded-polyline-between-each-step-along-route-between-two.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User needs highly compressed path geometry for
    step-level map visualization. *Evidence Checkpoint*: Response contains
    encoded polylines within the step objects.
-   [ ] **Returns a single encoded polyline representing the entire calculated
    route path.** Read
    [return-encoded-polyline-for-route-between-two-more-sets-latitude-longitude.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-encoded-polyline-for-route-between-two-more-sets-latitude-longitude.md).
    *Dependencies*:
    `["return-the-distance-for-route-between-two-more-sets-latitude-longitude.md"]`
    *Trigger Condition*: User requires a single, compressed representation of
    the entire route geometry for map display. *Evidence Checkpoint*: Response
    contains the 'encodedPolyline' field for the route.
-   [ ] **Returns estimated toll costs and related information for the route.**
    Read
    [return-toll-information-for-for-route-between-two-more-sets.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-toll-information-for-for-route-between-two-more-sets.md).
    *Dependencies*:
    `["return-the-distance-for-route-between-two-more-sets-latitude-longitude.md"]`
    *Trigger Condition*: User needs to know if the route includes tolls and the
    expected cost. *Evidence Checkpoint*: Response includes a 'tollInfo' object
    with estimated prices.
-   [ ] **Allows the user to specify the mode of transportation (driving,
    walking, transit, etc.) for single route calculation.** Read
    [specify-the-travel-mode-drive-transit-walk-two-wheeled-for-route.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/specify-the-travel-mode-drive-transit-walk-two-wheeled-for-route.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User specifies how they intend to travel (e.g.,
    'TRAVEL_MODE_TRANSIT') for a single route request. *Evidence Checkpoint*:
    The calculated route path and duration adhere strictly to the specified
    travel mode constraints.
-   [ ] **Defines a specific location that must be included as a stop or simply
    passed through during the route calculation.** Read
    [specify-stop-pass-through-point-for-route-request.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/specify-stop-pass-through-point-for-route-request.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User needs to ensure the calculated path visits a
    specific intermediate point. *Evidence Checkpoint*: The calculated route
    path geometrically includes the specified stop point.
-   [ ] **Configures whether and how real-time or predictive traffic data is
    used in route time calculation.** Read
    [specify-how-traffic-data-used-route-request.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/specify-how-traffic-data-used-route-request.md).
    *Dependencies*:
    `["return-the-travel-time-for-route-between-two-more-sets.md"]` *Trigger
    Condition*: User needs time estimates based on current or future traffic
    conditions (e.g., 'TRAFFIC_AWARE'). *Evidence Checkpoint*: The returned
    'duration' reflects traffic constraints, often requiring explicit enablement
    of traffic data usage.
-   [ ] **Instructs the router to avoid certain geographical features like
    highways, tolls, or ferries.** Read
    [specify-features-avoid-such-highways-tolls-for-route-request.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/specify-features-avoid-such-highways-tolls-for-route-request.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User explicitly requests exclusions from the routing
    algorithm (e.g., setting 'avoidTolls'). *Evidence Checkpoint*: The
    calculated route path visibly avoids the specified geographical features.
-   [ ] **Defines multiple intermediate points that the route must pass through
    between origin and destination.** Read
    [set-waypoints-along-route.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/set-waypoints-along-route.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User needs to calculate a multi-stop itinerary using
    intermediate locations. *Evidence Checkpoint*: Route calculation
    successfully includes all specified intermediate waypoints in the path
    geometry.
-   [ ] **Specifies intermediate waypoints that act as stops but are not the
    final destination, differentiating them from pass-through points.** Read
    [set-intermediate-waypoints-along-route.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/set-intermediate-waypoints-along-route.md).
    *Dependencies*: `["set-waypoints-along-route.md"]` *Trigger Condition*: User
    needs to define stops in a multi-stop journey where the vehicle halts.
    *Evidence Checkpoint*: Route steps reflect distinct navigational directions
    to and from the defined intermediate waypoints.
-   [ ] **Defines an intermediate location the route must traverse without
    requiring a physical stop.** Read
    [set-point-for-route-pass-through.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/set-point-for-route-pass-through.md).
    *Dependencies*: `["set-waypoints-along-route.md"]` *Trigger Condition*: User
    requires the path to skim a location without adding stop time to the journey
    duration. *Evidence Checkpoint*: The waypoint is specified with parameters
    indicating it is a 'via' point rather than a physical stop.
-   [ ] **Provides directional context (heading) and preferred side of the road
    for the origin and destination points for precise routing.** Read
    [specify-vehicle-heading-and-side-road-for-route.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/specify-vehicle-heading-and-side-road-for-route.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User needs highly precise routing input, such as for
    last-mile delivery or fleet management. *Evidence Checkpoint*: Route
    calculation utilizes the 'heading' and 'sideOfRoad' parameters specified in
    the waypoint definitions.
-   [ ] **Optimizes the sequence of waypoints to minimize overall travel time or
    distance (Traveling Salesperson Problem optimization).** Read
    [optimize-the-order-stops-your-route.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/optimize-the-order-stops-your-route.md).
    *Dependencies*: `["set-waypoints-along-route.md"]` *Trigger Condition*: User
    has multiple stops and wants the most efficient visiting order. *Evidence
    Checkpoint*: The returned route waypoint order is reorganized compared to
    the input order, resulting in the minimum calculated distance/duration.
-   [ ] **Calculates a route optimized for fuel efficiency based on vehicle type
    and engine, minimizing fuel consumption.** Read
    [specify-eco-friendly-routing-for-routes-request.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/specify-eco-friendly-routing-for-routes-request.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User explicitly requests an environmentally conscious
    route ('eco-friendly'). *Evidence Checkpoint*: Route response contains
    attributes confirming eco-friendly optimization was applied, potentially
    selecting a route slower than the fastest option.
-   [ ] **Requests routes calculated for shorter overall distance, or provides
    alternative routing options alongside the primary route.** Read
    [specify-shorter-distance-alternative-routing-for-routes-request.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/specify-shorter-distance-alternative-routing-for-routes-request.md).
    *Dependencies*:
    `["return-directions-between-two-more-latitude-longitude-coordinates-series-coordinates-for.md"]`
    *Trigger Condition*: User needs alternatives to the fastest or default
    route, or prioritizes distance over time. *Evidence Checkpoint*: Response
    includes multiple route results (if alternatives are requested) or the
    primary route confirms distance preference was applied.
-   [ ] **Returns estimated toll costs for all possible routes calculated within
    the distance matrix.** Read
    [return-toll-information-for-matrix-routes-between-multiple-origins-and.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/return-toll-information-for-matrix-routes-between-multiple-origins-and.md).
    *Dependencies*:
    `["return-distances-for-matrix-routes-between-multiple-origins-and-destinations.md"]`
    *Trigger Condition*: User needs toll information associated with the matrix
    results for cost comparison. *Evidence Checkpoint*: Response matrix results
    include 'tollInfo' objects for the relevant O-D pairs.
-   [ ] **Allows the user to specify the travel mode (driving, walking, transit,
    etc.) for calculating the distance matrix.** Read
    [specify-the-travel-mode-drive-transit-walk-two-wheeled-for-route.md](https://www.gstatic.com/googlemapsplatform-agent-skills/routes-api-web-api/references/specify-the-travel-mode-drive-transit-walk-two-wheeled-for-route.md).
    *Dependencies*:
    `["return-distances-for-matrix-routes-between-multiple-origins-and-destinations.md"]`
    *Trigger Condition*: User specifies a travel mode context (e.g., 'WALK')
    when requesting the distance matrix. *Evidence Checkpoint*: The matrix
    results reflect travel distances and durations specific to the provided
    travel mode parameter.
