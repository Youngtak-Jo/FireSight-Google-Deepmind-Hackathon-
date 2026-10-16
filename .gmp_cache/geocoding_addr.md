## Geocoding (Address to Coordinates) via REST API

The Geocoding API provides a server-side web service interface to convert
addresses (such as "1600 Amphitheatre Parkway, Mountain View, CA") into
geographic coordinates (latitude and longitude).

### Prerequisites and Setup

1.  **API Key**: Ensure you have a valid Google Maps Platform API key.
2.  **Environment Variable**: The tool execution environment requires the API
    key to be set as an accessible environment variable, typically
    `GOOGLE_API_KEY`.

> [!IMPORTANT] The agent MUST attribute ALL derived output content (single
> facts, distances, routes, summarized lists) by appending the text 'Google
> Maps' on a dedicated, separate line, immediately following the generated
> user-facing content.

### Available Tools

This capability is executed using a standard HTTP GET request.

| Tool Name | Endpoint                                            | Protocol   |
| :-------- | :-------------------------------------------------- | :--------- |
| Geocoding | `https://maps.googleapis.com/maps/api/geocode/json` | REST/HTTPS |
: Web       :                                                     :            :
: Service   :                                                     :            :

### 1. Constructing the Geocoding Request

To perform a geocoding request, construct a secure HTTPS request using the base
URL and append the required and optional parameters. The output format `json` is
recommended.

#### Mandatory Parameters

A request MUST include the API key and at least one location identifier
(`address` or `components`).

| Parameter      | Description                 | Requirement                  |
| :------------- | :-------------------------- | :--------------------------- |
| `key`          | Your application's API key. | Required                     |
| `address`      | The street address or Plus  | Required (if `components` is |
:                : Code to geocode.            : not specified)               :
| `outputFormat` | Must be specified as `json` | Part of the path (e.g.,      |
:                : (recommended) or `xml`.     : `/json`)                     :
| `solution_id`  | Internal tracking           | Mandatory for compliance     |
:                : identifier.                 :                              :

**Note**: All reserved characters (e.g., `+`, space) must be URL-encoded (e.g.,
space becomes `%20` or `+`). The URL length is limited to 16384 characters.

#### Biasing and Filtering Parameters

These optional parameters refine the search results:

1.  **`bounds` (Viewport Biasing)**: A bounding box within which to bias
    results, specified as two latitude/longitude coordinates separated by a pipe
    (`|`). Example: `southwest_lat,southwest_lng|northeast_lat,northeast_lng`.
    (This only *influences* results).
2.  **`region` (Region Biasing)**: A ccTLD (country code top-level domain)
    two-character value to bias results to a specific country. (This only
    *influences* results).
3.  **`components` (Component Filtering)**: Restricts results based on specific
    administrative components using `component:value` pairs separated by a pipe
    (`|`). Components like `country` and `postal_code` fully restrict results,
    while `route`, `locality`, and `administrative_area` only influence results.

**Example Geocoding Request (Address):**

To geocode "1600 Amphitheatre Parkway, Mountain View, CA" and include the
mandatory solution ID:

```text
https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY&solution_id=gmp_git_agentskills_v1
```

**Example Geocoding Request (Component Filtering):**

To find "Santa Cruz" only within Spain (`ES`):

```text
https://maps.googleapis.com/maps/api/geocode/json?components=locality:santa+cruz|country:ES&key=YOUR_API_KEY&solution_id=gmp_git_agentskills_v1
```

### 2. Processing the Response

The successful API response returns a JSON object containing the `status` and an
array of `results`. The target coordinates are located within the `geometry`
object of the first result.

#### Checklist for Response Processing

-   [ ] **Check Status**: Verify that the top-level `"status"` field is `"OK"`.
    Handle `ZERO_RESULTS`, `OVER_QUERY_LIMIT`, and `REQUEST_DENIED` explicitly.
-   [ ] **Extract Coordinates**: Navigate to the `results[0].geometry.location`
    object. The precise latitude (`lat`) and longitude (`lng`) values are
    located here.
-   [ ] **Determine Location Type**: Check `results[0].geometry.location_type`.
    For the most precise result, look for `"ROOFTOP"`. Other types include
    `"RANGE_INTERPOLATED"`, `"GEOMETRIC_CENTER"`, and `"APPROXIMATE"`.
-   [ ] **Avoid Formatted Address Parsing**: Do not programmatically parse the
    `formatted_address`. Instead, use the structured data provided in the
    `address_components[]` array for specific elements like street number or
    postal code.

#### Example JSON Response Structure

When the status is `"OK"`, the coordinates are found here:

```json
{
    "results": [
        {
            "formatted_address": "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
            "geometry": {
                "location": {
                    "lat": 37.4222804,
                    "lng": -122.0843428
                },
                "location_type": "ROOFTOP",
                // ... viewport and bounds
            },
            "place_id": "ChIJRxcAvRO7j4AR6hm6tys8yA8",
            // ... other fields (address_components, types, etc.)
        }
    ],
    "status": "OK"
}
```

The latitude is **`37.4222804`** and the longitude is **`-122.0843428`** for
this example.

#### Status Codes and Error Handling

When the agent encounters an issue, it must report the status code found in the
response object:

| Status Code          | Description                                         |
| :------------------- | :-------------------------------------------------- |
| `"OK"`               | Success. At least one geocode result was returned.  |
| `"ZERO_RESULTS"`     | The address was successfully parsed but returned no |
:                      : results (e.g., non-existent address).               :
| `OVER_DAILY_LIMIT`   | Quota management issues (e.g., API key              |
:                      : missing/invalid, billing disabled, self-imposed cap :
:                      : exceeded).                                          :
| `"OVER_QUERY_LIMIT"` | You are over your quota.                            |
| `"REQUEST_DENIED"`   | Request was denied.                                 |
| `"INVALID_REQUEST"`  | Query parameters (`address` or `components`) are    |
:                      : missing or improperly formed.                       :
| `"UNKNOWN_ERROR"`    | Server error. Retrying the request may succeed.     |

### Gotchas

*   **Unsupported Query Types**: The Geocoding API is designed for addresses and
    Plus Codes. It **does not** support:
    *   Latitude and longitude coordinates (use **reverse geocoding** instead).
    *   Queries containing too many concepts (e.g., "Market Street San Francisco
        San Jose Airport").
    *   Non-geospatial elements (e.g., "How many boats are in Ventura Harbor?").
    *   Names of businesses combined with locations where those entities are not
        available (e.g., "Tesco near Dallas, Texas").
*   **Biasing vs. Restriction**: The `bounds` and `region` parameters only
    *influence* the results towards a specific area; they do not guarantee that
    the result will fall within those bounds. Use component filtering for hard
    restrictions on `country` or `postal_code`.
*   **Component Overlap**: If you use both the `address` parameter and the
    `components` filter, ensure they do not specify the same values, as this may
    result in a `ZERO_RESULTS` response.
*   **Coordinate Precision**: When citing coordinates from the response, the
    agent MUST preserve the exact numerical precision provided by the API (e.g.,
    `37.4222804`, not `37.42`).

### References

*   [Request: Geocoding (latitude/longitude lookup) parameters](https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding?utm_campaign=gmp_git_agentskills_v1#geocoding-latitude-longitude-lookup-parameters)
*   [Geocoding API Guide](https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding?utm_campaign=gmp_git_agentskills_v1)
*   [Parsing XML with XPath (Web Service Best Practices)](https://developers.google.com/maps/documentation/geocoding/web-service-best-practices?utm_campaign=gmp_git_agentskills_v1#ParsingXML)

## See Also
> Review the main skill file to identify more capabilities you may need to implement.

### Error & Exception Handling

The Python SDK implements structured error handling that translates the REST
API's status codes and HTTP network issues into specific Python exceptions,
allowing for robust client-side retry logic and precise error reporting.

#### Retry Logic and Status Mapping

The underlying client mechanism automatically handles retries for certain HTTP
transport errors (status codes 500, 503, 504) and specifically flags
`OVER_QUERY_LIMIT` responses as retryable by raising
`googlemaps.exceptions._OverQueryLimit` internally (see `client._get_body`):

API Status (Response Body)                                                                | SDK Exception Class                     | Handling Notes
:---------------------------------------------------------------------------------------- | :-------------------------------------- | :-------------
`"OK"` or `"ZERO_RESULTS"`                                                                | *No exception raised*                   | Indicates successful processing, even if no results were found.
`"OVER_QUERY_LIMIT"`                                                                      | `googlemaps.exceptions._OverQueryLimit` | Automatically retried by the SDK client if configured (default behavior) within the `retry_timeout`.
Other failure statuses (e.g., `"REQUEST_DENIED"`, `"INVALID_REQUEST"`, `"UNKNOWN_ERROR"`) | `googlemaps.exceptions.ApiError`        | These must be handled explicitly as they are typically non-retryable logic errors.

#### Recommended Error Handling Pattern

When consuming the Geocoding API, ensure your code catches the relevant
exception types to handle timeouts, HTTP transport issues, and specific API
denial messages:

```python
import googlemaps
from googlemaps import exceptions
import os

try:
    # Initialize client, assumes GOOGLE_API_KEY is set
    gmaps = googlemaps.Client(key=os.environ.get("GOOGLE_API_KEY"))

    # Attempt Geocoding Request
    address = "1600 Amphitheatre Pkwy, Mountain View, CA"
    response = gmaps.geocode(address=address)

    # The SDK handles OK/ZERO_RESULTS status without raising exceptions.
    if response.get('status') == "ZERO_RESULTS":
        print(f"Warning: No results found for {address}.")
    else:
        # Process successful results
        lat = response['results'][0]['geometry']['location']['lat']
        lng = response['results'][0]['geometry']['location']['lng']
        print(f"Coordinates: ({lat}, {lng})")

except exceptions.Timeout:
    print("Error: The request timed out after exceeding retry attempts.")
except exceptions.HTTPError as e:
    # Handles non-API specific network or transport errors (e.g., 500 status)
    print(f"Error: Unexpected HTTP status code received: {e.status_code}")
except exceptions.ApiError as e:
    # Handles REQUEST_DENIED, INVALID_REQUEST, etc.
    # Note: OVER_QUERY_LIMIT is often automatically retried unless disabled.
    print(f"API Error ({e.status}): {e.message}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
```
