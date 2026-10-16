---
name: geocoding-api-web-api
description: Use this skill when a developer needs to convert addresses into geographic coordinates (geocoding) or convert coordinates back into human-readable addresses (reverse geocoding). It provides precise location data, supports restricting results by region or type, and returns details about building entrances, outlines, and landmark proximity.
license: Apache-2.0
metadata:
  version: 1.0.53
---

> [!IMPORTANT] **Core Dependency:** This skill requires active context from
> [google-maps-platform/SKILL.md](https://www.gstatic.com/googlemapsplatform-agent-skills/google-maps-platform/SKILL.md).

### Overview

The Geocoding API provides services for converting addresses (like "1600
Amphitheatre Parkway, Mountain View, CA") into geographic coordinates (latitude
and longitude), a process known as geocoding. It also allows the inverse
operation, converting geographic coordinates into human-readable addresses,
known as reverse geocoding.

This skill governs the use of the Geocoding API REST endpoint, enabling
developers to obtain standardized, accurate location data for mapping and
analysis.

### Mandatory settings

The Geocoding API uses two distinct methods for setting the mandatory internal
usage attribution ID (`gmp_git_agentskills_v1`), depending on the endpoint
version and request type (GET vs. POST).

#### 1. Standard Geocoding/Reverse Geocoding (Legacy/GET Endpoints)

For standard Geocoding and Reverse Geocoding requests using the
`maps.googleapis.com/maps/api/geocode` endpoint, the attribution ID must be
appended as a URL query parameter.

```text
&solution_id=gmp_git_agentskills_v1
```

#### 2. Geocoding v4 Search Destinations (POST Endpoints)

For requests to the v4 Geocoding API (e.g., Search Destinations for entrances or
outlines), which use HTTP POST, the attribution ID must be passed via a custom
HTTP header.

```http
X-Goog-Maps-Solution-ID: gmp_git_agentskills_v1
```

#### Key Features Covered

The Geocoding API supports several critical functionalities, including:

1.  **Geocoding:** Converting a standard address or Place ID into precise
    geographic coordinates.
2.  **Reverse Geocoding:** Converting coordinates into a human-readable address
    or Place ID.
3.  **Result Restriction:** Limiting geocoding or reverse geocoding results
    using parameters like viewport bounding box, region code, or specific
    address types.
4.  **Proximity and Detail Retrieval:** Obtaining specific coordinates for
    building outlines or entrances, and retrieving information about proximity
    to nearby landmarks or areas based on address, coordinates, or a Google
    Place ID.

All operations utilize the single, unified Geocoding API REST endpoint.

## 🚀 Master Orchestration Integration Workflow

Follow this multi-phase sequential integration checklist to compose features
robustly. For each phase, read the referenced capability sub-workflow file and
satisfy its *Evidence Checkpoint* before advancing.

### 📦 Phase 1: Core Initialization & Base Setup (Primary)

-   [ ] **Step 1.1: Translates a human-readable street address into geographic
    latitude and longitude coordinates (standard geocoding).** Read
    [return-the-latitude-longitude-coordinates-address-geocoding.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-the-latitude-longitude-coordinates-address-geocoding.md).
    *Trigger Condition*: User provides an address string (e.g., '1600
    Amphitheatre Parkway, Mountain View, CA') and requests its geographic
    location. *Evidence Checkpoint*: A successful HTTP 200 response containing
    the 'geometry/location' object with accurate 'lat' and 'lng' values for the
    requested address.

### 📦 Phase 2: Feature Layer & Custom Enrichment (Supplemental)

#### 🗺️ Feature Module: Geocoding (Optional - Use-Case Dependent)

-   [ ] **Translates geographic latitude and longitude coordinates into a
    human-readable street address or location description (reverse geocoding).**
    Read
    [return-the-address-for-set-latitude-longitude-coordinates-reverse-geocoding.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-the-address-for-set-latitude-longitude-coordinates-reverse-geocoding.md).
    *Trigger Condition*: User provides coordinates (lat/lng) and requests the
    corresponding location name or postal address. *Evidence Checkpoint*: A
    successful HTTP 200 response containing the 'formatted_address' field in the
    result object.
-   [ ] **Narrows the search results of a geocoding request to locations
    strictly contained within a defined bounding box (viewport).** Read
    [restrict-geocoding-request-return-results-withing-specific-viewport.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/restrict-geocoding-request-return-results-withing-specific-viewport.md).
    *Dependencies*:
    `["return-the-latitude-longitude-coordinates-address-geocoding.md"]`
    *Trigger Condition*: User wants to find the location of an address but
    limits the search area to a specific map region or boundary. *Evidence
    Checkpoint*: The API response includes the 'bounds' parameter in the request
    URL and the returned results are geographically located within the defined
    viewport.
-   [ ] **Filters geocoding or reverse geocoding results based on specified
    components like country, postal code, or region.** Read
    [restrict-geocoding-reverse-geocoding-request-only-return-results-within-specific.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/restrict-geocoding-reverse-geocoding-request-only-return-results-within-specific.md).
    *Dependencies*:
    `["return-the-latitude-longitude-coordinates-address-geocoding.md"]`
    *Trigger Condition*: User needs to ensure the resulting address belongs to a
    particular administrative area (e.g., searching for 'London' only within
    'UK'). *Evidence Checkpoint*: The API response results array only contains
    addresses that match the specified 'component_filter' criteria.
-   [ ] **Restricts reverse geocoding results to include only specific address
    types (e.g., filtering for only 'street_address' or 'postal_code').** Read
    [restrict-reverse-geocoding-request-only-return-results-for-specified-address.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/restrict-reverse-geocoding-request-only-return-results-for-specified-address.md).
    *Dependencies*:
    `["return-the-address-for-set-latitude-longitude-coordinates-reverse-geocoding.md"]`
    *Trigger Condition*: When performing reverse geocoding, the user only
    requires results matching certain structural address categories. *Evidence
    Checkpoint*: The API response results only contain objects whose 'types'
    array matches the requested 'result_type' parameter.
-   [ ] **Retrieves information about landmarks or notable areas situated near a
    provided street address.** Read
    [return-information-about-proximity-landmarks-areas-for-address.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-information-about-proximity-landmarks-areas-for-address.md).
    *Trigger Condition*: User provides an address and requires context about its
    location relative to significant nearby places. *Evidence Checkpoint*:
    Successful response includes specific metadata or proximity details related
    to points of interest near the input address.
-   [ ] **Retrieves information about landmarks or notable areas situated near a
    provided set of latitude/longitude coordinates.** Read
    [return-information-about-proximity-landmarks-areas-for-set-latitude-longitude-coordinates.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-information-about-proximity-landmarks-areas-for-set-latitude-longitude-coordinates.md).
    *Trigger Condition*: User provides coordinates and requires context about
    nearby significant places. *Evidence Checkpoint*: Successful response
    includes specific metadata or proximity details related to points of
    interest near the input coordinates.
-   [ ] **Retrieves information about landmarks or notable areas situated near a
    location identified by a Google Place ID.** Read
    [return-information-about-proximity-landmarks-areas-for-google-place-identifier.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-information-about-proximity-landmarks-areas-for-google-place-identifier.md).
    *Trigger Condition*: User uses a Google Place ID to identify a location and
    requires context about nearby significant places. *Evidence Checkpoint*:
    Successful response includes specific metadata or proximity details related
    to points of interest near the input Place ID location.
-   [ ] **Retrieves the full formatted address and components associated with a
    Google Place ID.** Read
    [return-the-address-for-google-place-identifier.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-the-address-for-google-place-identifier.md).
    *Trigger Condition*: User possesses a Place ID and needs to resolve it to a
    human-readable address string and geographic coordinates. *Evidence
    Checkpoint*: A successful response containing the 'formatted_address'
    corresponding to the input Place ID.
-   [ ] **Returns the geographic coordinates defining the polygon outline
    (footprint) of a building associated with a street address.** Read
    [return-the-latitude-longitude-coordinates-building-outline-for-address.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-the-latitude-longitude-coordinates-building-outline-for-address.md).
    *Dependencies*:
    `["return-the-latitude-longitude-coordinates-address-geocoding.md"]`
    *Trigger Condition*: User requests detailed, geo-fenced building boundaries
    based on a specified street address. *Evidence Checkpoint*: The response
    includes the building footprint data (polygon vertices) related to the input
    address.
-   [ ] **Returns the geographic coordinates defining the polygon outline
    (footprint) of a building based on a set of coordinates.** Read
    [return-the-latitude-longitude-coordinates-building-outline-for-set-latitude-longitude-coordinates.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-the-latitude-longitude-coordinates-building-outline-for-set-latitude-longitude-coordinates.md).
    *Dependencies*:
    `["return-the-address-for-set-latitude-longitude-coordinates-reverse-geocoding.md"]`
    *Trigger Condition*: User requests detailed, geo-fenced building boundaries
    based on specified lat/lng coordinates. *Evidence Checkpoint*: The response
    includes the building footprint data (polygon vertices) near the input
    coordinates.
-   [ ] **Returns the geographic coordinates defining the polygon outline
    (footprint) of a building associated with a Google Place ID.** Read
    [return-the-latitude-longitude-coordinates-building-outline-for-google-place-identifier.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-the-latitude-longitude-coordinates-building-outline-for-google-place-identifier.md).
    *Dependencies*: `["return-the-address-for-google-place-identifier.md"]`
    *Trigger Condition*: User requests detailed, geo-fenced building boundaries
    based on a specified Place ID. *Evidence Checkpoint*: The response includes
    the building footprint data (polygon vertices) related to the input Place
    ID.
-   [ ] **Returns the precise coordinates specifically marking the entrance
    point of a building specified by address.** Read
    [return-the-latitude-longitude-coordinates-building-entrance-for-address.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-the-latitude-longitude-coordinates-building-entrance-for-address.md).
    *Dependencies*:
    `["return-the-latitude-longitude-coordinates-address-geocoding.md"]`
    *Trigger Condition*: User requires high precision location data targeting
    the pedestrian entrance, rather than the building centroid, based on an
    address. *Evidence Checkpoint*: The returned result includes a specific
    location object tagged as the building entrance geometry.
-   [ ] **Returns the precise coordinates specifically marking the entrance
    point of a building based on coordinates.** Read
    [return-the-latitude-longitude-coordinates-building-entrance-for-set-latitude-longitude-coordinates.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-the-latitude-longitude-coordinates-building-entrance-for-set-latitude-longitude-coordinates.md).
    *Dependencies*:
    `["return-the-address-for-set-latitude-longitude-coordinates-reverse-geocoding.md"]`
    *Trigger Condition*: User requires high precision location data targeting
    the pedestrian entrance, rather than the building centroid, based on lat/lng
    coordinates. *Evidence Checkpoint*: The returned result includes a specific
    location object tagged as the building entrance geometry near the input
    coordinates.
-   [ ] **Returns the precise coordinates specifically marking the entrance
    point of a building specified by a Google Place ID.** Read
    [return-the-latitude-longitude-coordinates-building-entrance-for-google-place-identifier.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geocoding-api-web-api/references/return-the-latitude-longitude-coordinates-building-entrance-for-google-place-identifier.md).
    *Dependencies*: `["return-the-address-for-google-place-identifier.md"]`
    *Trigger Condition*: User requires high precision location data targeting
    the pedestrian entrance, rather than the building centroid, based on a Place
    ID. *Evidence Checkpoint*: The returned result includes a specific location
    object tagged as the building entrance geometry corresponding to the input
    Place ID.
