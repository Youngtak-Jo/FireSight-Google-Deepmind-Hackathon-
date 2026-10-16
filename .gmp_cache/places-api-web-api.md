---
name: places-api-web-api
description: Use this skill when a user needs to integrate location search, retrieve place details, offer autocomplete suggestions, fetch photos, and utilize advanced features like AI-powered summaries or route-based searching for points of interest via the Google Maps Platform Places API (New).
license: Apache-2.0
metadata:
  version: 1.0.56
---

> [!IMPORTANT] **Web Browser & Client-Side JavaScript Guardrail:** For
> browser-based web applications (React, Angular, Vanilla JS), **DO NOT** make
> direct client-side `fetch()` requests to `places.googleapis.com` (blocked by
> CORS) and **DO NOT** pass REST payload formats into client-side JS SDK
> functions. Instead, for client-side web development you **MUST** use the Maps
> JavaScript SDK (`google.maps.places.Place`, `PlaceAutocompleteElement`, or
> `AutocompleteSuggestion`). Refer to `gmp-framework-react` (for React) or
> `maps-javascript-api-javascript` (for Vanilla JS/Web).

> [!IMPORTANT] **Core Dependency:** This skill requires active context from
> [google-maps-platform/SKILL.md](https://www.gstatic.com/googlemapsplatform-agent-skills/google-maps-platform/SKILL.md).

### Overview

This skill provides guidance for utilizing the Google Maps Platform Places API
(New) to access comprehensive, up-to-date data about millions of points of
interest. Developers can use the API to implement core features such as place
search (Text and Nearby), real-time query autocomplete, and retrieval of
detailed place records, including photos, ratings, reviews, and specialized
AI-powered summaries. The Places API is designed for high performance and cost
control through precise field masking and supports complex location workflows,
including finding and analyzing points of interest relative to specified travel
routes.

### Mandatory settings

All requests to the Places API must include the usage attribution identifier
`gmp_git_agentskills_v1` for tracing and policy compliance. This is typically
achieved via an HTTP header or a URL query parameter, depending on the endpoint
type.

#### REST API HTTP Header (Recommended for POST requests)

Include the `X-Goog-Maps-Solution-ID` header in all POST requests (e.g.,
`places:searchText`, `places:searchNearby`, `places:autocomplete`,
`places:get`).

```text
X-Goog-Maps-Solution-ID: gmp_git_agentskills_v1
```

#### URL Query Parameter (Required for GET requests)

Append the `solution_id` parameter to the URL for HTTP GET endpoints, such as
Place Photos retrieval.

```text
&solution_id=gmp_git_agentskills_v1
```

#### JSON Request Body Field (For Services supporting `internalUsageAttributionIds`)

For Places API (New) service methods that accept request parameters in a JSON
body, the attribution ID is passed as an array field.

```json
internalUsageAttributionIds: ['gmp_git_agentskills_v1']
```

## 🚀 Master Orchestration Integration Workflow

Follow this multi-phase sequential integration checklist to compose features
robustly. For each phase, read the referenced capability sub-workflow file and
satisfy its *Evidence Checkpoint* before advancing.

### 📦 Phase 1: Feature Layer & Custom Enrichment (Supplemental)

#### 🗺️ Feature Module: Places (Optional - Use-Case Dependent)

-   [ ] **Searches for places and returns basic details based on a text query
    string.** Read
    [references/return-list-places-and-place-details-based-query-string.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-list-places-and-place-details-based-query-string.md).
    *Trigger Condition*: User provides a generalized search query (e.g.,
    'restaurants near me', 'best pizza in Chicago') and expects a list of
    matching locations. *Evidence Checkpoint*: The API returns an HTTP 200
    response containing a list of place objects matching the textual input
    query.
-   [ ] **Finds places and returns details based on proximity to specified
    geographical coordinates.** Read
    [references/return-list-places-and-place-details-near-specific-location.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-list-places-and-place-details-near-specific-location.md).
    *Trigger Condition*: User requests points of interest or establishments near
    a known latitude/longitude pair or a circular search area. *Evidence
    Checkpoint*: The API returns an HTTP 200 response containing a list of place
    objects geographically constrained by the location and radius parameters.
-   [ ] **Provides suggested place names, addresses, or queries based on partial
    text input for faster entry.** Read
    [references/return-autocomplete-results-about-places-based-query-string.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-autocomplete-results-about-places-based-query-string.md).
    *Trigger Condition*: User is typing an address or place name into an input
    field and expects real-time suggestions. *Evidence Checkpoint*: The API
    returns an HTTP 200 response with a list of suggested place predictions or
    query completions.
-   [ ] **Retrieves comprehensive information (contact details, operational
    status, geometry) for a single place using its unique Place ID.** Read
    [references/return-detailed-information-about-specific-place.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-detailed-information-about-specific-place.md).
    *Trigger Condition*: The agent possesses a Place ID and requires the full
    dataset of details available for that specific location. *Evidence
    Checkpoint*: The API returns an HTTP 200 response containing a single place
    object populated with extensive details.
-   [ ] **Accesses metadata and references required to fetch place photographs
    associated with a Place ID.** Read
    [references/return-photos-specific-place.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-photos-specific-place.md).
    *Trigger Condition*: User asks to see visual media or photos of a specific
    place. *Evidence Checkpoint*: The API returns an HTTP 200 response
    containing an array of photo references or resource identifiers.
-   [ ] **Allows specifying parameters (max height/width) to resize and optimize
    retrieved place photos.** Read
    [references/resize-place-photos.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/resize-place-photos.md).
    *Dependencies*: `["references/return-photos-specific-place.md"]` *Trigger
    Condition*: Agent needs to display place photos efficiently at a specific
    maximum size or resolution. *Evidence Checkpoint*: The photo resource is
    successfully returned and rendered with dimensions constrained by the
    requested parameters.
-   [ ] **Retrieves user ratings and detailed review text for a specific place
    identified by Place ID.** Read
    [references/return-ratings-and-reviews-for-specific-place.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-ratings-and-reviews-for-specific-place.md).
    *Trigger Condition*: User asks about the quality, public reputation, or
    reads customer feedback for a specific establishment. *Evidence Checkpoint*:
    The API returns an HTTP 200 response containing the average star rating and
    an array of user-submitted reviews.
-   [ ] **Optimizes API usage by restricting the response payload to only the
    requested data fields (field masking).** Read
    [references/specify-the-data-fields-included-place-information-responses.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/specify-the-data-fields-included-place-information-responses.md).
    *Trigger Condition*: Agent is performing any retrieval operation (details,
    search) where cost optimization or minimizing payload size is required.
    *Evidence Checkpoint*: The response body successfully contains only the
    fields explicitly requested in the field mask parameter.
-   [ ] **Filters place search results based on standardized category
    identifiers (place types).** Read
    [references/specify-the-place-types-include-place-information-responses.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/specify-the-place-types-include-place-information-responses.md).
    *Trigger Condition*: User specifies filtering criteria based on the desired
    category of location (e.g., 'airport', 'hospital'). *Evidence Checkpoint*:
    Search results successfully return only places matching the specified type
    constraints.
-   [ ] **Generates a deep link URI to open the Google Maps details page for a
    specific Place ID.** Read
    [references/return-the-uri-open-the-place-details-page-google-maps.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-the-uri-open-the-place-details-page-google-maps.md).
    *Trigger Condition*: User requests a clickable link to view the standard
    Google Maps page for a location. *Evidence Checkpoint*: A valid HTTP/HTTPS
    URI is returned, linking directly to the place details page within Google
    Maps.
-   [ ] **Generates a deep link URI to open the directions page in Google Maps,
    optionally pre-filled with an origin or destination.** Read
    [references/return-the-uri-open-the-directions-page-google-maps-for.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-the-uri-open-the-directions-page-google-maps-for.md).
    *Trigger Condition*: User asks for a link to generate driving or walking
    directions to/from a specific location. *Evidence Checkpoint*: A valid
    HTTP/HTTPS URI is returned, formatted to launch the directions interface in
    Google Maps.
-   [ ] **Generates a deep link URI that opens the Google Maps interface for
    submitting a new user review for a place.** Read
    [references/return-the-uri-open-the-write-review-page-google-maps.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-the-uri-open-the-write-review-page-google-maps.md).
    *Trigger Condition*: User explicitly states the intent to write or submit a
    review for a location. *Evidence Checkpoint*: A valid HTTP/HTTPS URI is
    returned, targeting the review submission interface in Google Maps.
-   [ ] **Generates a deep link URI that opens the Google Maps interface focused
    on reading all user reviews for a place.** Read
    [references/return-the-uri-open-the-read-reviews-page-google-maps.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-the-uri-open-the-read-reviews-page-google-maps.md).
    *Trigger Condition*: User wants quick access to browse all accumulated user
    reviews on Google Maps. *Evidence Checkpoint*: A valid HTTP/HTTPS URI is
    returned, targeting the aggregated list of reviews.
-   [ ] **Generates a deep link URI that opens the photo gallery view for a
    place in Google Maps.** Read
    [references/return-the-uri-open-the-photos-page-google-maps-for.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-the-uri-open-the-photos-page-google-maps-for.md).
    *Trigger Condition*: User wants to browse photos for a place specifically
    within the Google Maps environment. *Evidence Checkpoint*: A valid
    HTTP/HTTPS URI is returned, targeting the photo gallery view.
-   [ ] **Returns a concise, AI-generated summary overview for a specific place,
    synthesizing various data points.** Read
    [references/return-ai-powered-overview-summary-for-specific-place.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-ai-powered-overview-summary-for-specific-place.md).
    *Trigger Condition*: User asks for a quick, synthesized overview or summary
    of a specific location rather than retrieving raw data. *Evidence
    Checkpoint*: HTTP 200 response containing the generated textual
    'overview_summary'.
-   [ ] **Returns an AI-generated summary describing points of interest and
    context in the neighborhood surrounding a specific location.** Read
    [references/return-ai-powered-area-summary-describing-places-the-area-around-specific.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-ai-powered-area-summary-describing-places-the-area-around-specific.md).
    *Trigger Condition*: User requests contextual information about the
    location's surroundings or neighborhood amenities. *Evidence Checkpoint*:
    HTTP 200 response containing the generated textual 'area_summary'.

#### 🗺️ Feature Module: Directions and Routing (Optional - Use-Case Dependent)

-   [ ] **Searches for places using a query string and filters the results to
    only include those located within a predefined geographical route
    corridor.** Read
    [references/return-information-about-places-based-query-string-that-are-located.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-information-about-places-based-query-string-that-are-located.md).
    *Trigger Condition*: User needs to find points of interest or stops
    specifically along a predetermined route path (e.g., 'gas stations along my
    drive'). *Evidence Checkpoint*: HTTP 200 response returns place results that
    satisfy both the text query and the geometry constraints of the route.
-   [ ] **Calculates and returns travel metrics (distance, time, directions URI)
    between a fixed origin (lat/lng) and all resulting places found via a text
    or nearby search.** Read
    [references/return-distance-travel-time-and-directions-uri-between-set-latitude-longitude.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-distance-travel-time-and-directions-uri-between-set-latitude-longitude.md).
    *Trigger Condition*: User searches for places and simultaneously requires
    travel metrics from a defined starting point to each result. *Evidence
    Checkpoint*: Search results contain augmented fields detailing
    'distance_meters', 'duration_seconds', and a 'directions_uri' for each
    place.
-   [ ] **Calculates travel metrics from the start of a predefined route to
    intermediate places found along that route.** Read
    [references/return-distance-travel-time-and-directions-uri-between-the-origin.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-distance-travel-time-and-directions-uri-between-the-origin.md).
    *Dependencies*:
    `["references/return-information-about-places-based-query-string-that-are-located.md"]`
    *Trigger Condition*: Agent needs travel information from the route origin to
    points of interest identified along the route. *Evidence Checkpoint*: Places
    found along the route are augmented with travel metrics starting from the
    route origin point.
-   [ ] **Calculates travel metrics from intermediate places found along a route
    to the route's ultimate destination.** Read
    [references/return-distance-travel-time-and-directions-uri-between-each-the.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-distance-travel-time-and-directions-uri-between-each-the.md).
    *Dependencies*:
    `["references/return-information-about-places-based-query-string-that-are-located.md"]`
    *Trigger Condition*: Agent needs travel information from points of interest
    along the route to the final destination point. *Evidence Checkpoint*:
    Places found along the route are augmented with travel metrics leading to
    the route destination.

#### 🗺️ Feature Module: Generative AI (Optional - Use-Case Dependent)

-   [ ] **Generates an AI-powered summary by analyzing and synthesizing key
    themes and sentiment from all user reviews for a specific Place ID.** Read
    [references/return-ai-powered-summary-user-reviews-for-specified-google-place-identifier.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-ai-powered-summary-user-reviews-for-specified-google-place-identifier.md).
    *Trigger Condition*: User requests a quick, thematic summary or analysis of
    all collected user reviews for a specific location. *Evidence Checkpoint*:
    HTTP 200 response containing the generated textual 'reviews_summary'.
-   [ ] **Generates an AI summary focusing on the surrounding area and amenities
    relevant to an electric vehicle charging station (EVSE).** Read
    [references/return-ai-powered-place-summary-the-area-and-amenities-surrounding-specified.md](https://www.gstatic.com/googlemapsplatform-agent-skills/places-api-web-api/references/return-ai-powered-place-summary-the-area-and-amenities-surrounding-specified.md).
    *Trigger Condition*: The specified place is an EV charging station and the
    user requests context regarding nearby amenities (e.g., food, restrooms).
    *Evidence Checkpoint*: HTTP 200 response containing a generated summary
    specific to EVSE location context and amenities.
