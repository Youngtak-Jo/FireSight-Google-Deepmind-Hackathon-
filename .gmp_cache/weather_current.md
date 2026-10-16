# Current Weather Conditions Lookup (Feature: Current Conditions)

The `currentConditions:lookup` endpoint provides detailed, real-time weather
information for any given latitude and longitude pair.

## Prerequisites

To utilize the Weather API, ensure that the API Key is available in the
execution environment.

-   [ ] Set up the environment variable `GOOGLE_API_KEY` with your valid Google
    Maps Platform API key.

## Available Tools

| Tool Name                               | Type    | Description             |
| :-------------------------------------- | :------ | :---------------------- |
| `weather-api-current-conditions-lookup` | Web API | Fetches current weather |
:                                         :         : and historical data for :
:                                         :         : a specified geographic  :
:                                         :         : location.               :

## Implementation Guide

To retrieve current weather conditions, construct an HTTP GET request to the
`currentConditions:lookup` endpoint, specifying the location coordinates.

### 1. Constructing the Request URL

The request URL requires the API key and the exact coordinates of the location
using `location.latitude` and `location.longitude` query parameters.

**Endpoint Structure:**

```text
https://weather.googleapis.com/v1/currentConditions:lookup?key=YOUR_API_KEY&location.latitude=LATITUDE&location.longitude=LONGITUDE&solution_id=gmp_git_agentskills_v1
```

**Mandatory Parameters:**

Parameter            | Description
:------------------- | :--------------------------------------------
`key`                | Your Google Maps Platform API Key.
`location.latitude`  | The latitude coordinate (e.g., `37.4220`).
`location.longitude` | The longitude coordinate (e.g., `-122.0841`).

### 2. Specifying the Unit System

By default, the Weather API returns data using the metric system. To request
data using the imperial system, include the optional `unitsSystem` parameter.

-   [ ] **Trigger Condition:** The user explicitly asks for Fahrenheit, miles,
    or inches.
-   [ ] **Verification Checkpoint:** The output fields contain `unit:
    "FAHRENHEIT"` and `unit: "MILES_PER_HOUR"`.

Unit System          | Parameter Value
:------------------- | :-----------------------------
**Metric (Default)** | (Omit `unitsSystem` parameter)
**Imperial**         | `unitsSystem=IMPERIAL`

**Example (Metric System):** The following `curl` command retrieves current
conditions for Mountain View, CA, using metric units.

```bash
curl -X GET "https://weather.googleapis.com/v1/currentConditions:lookup?key=$GOOGLE_API_KEY&location.latitude=37.4220&location.longitude=-122.0841&solution_id=gmp_git_agentskills_v1"
```

**Example (Imperial System):** To retrieve the same data using imperial units:

```bash
curl -X GET "https://weather.googleapis.com/v1/currentConditions:lookup?key=$GOOGLE_API_KEY&location.latitude=37.4220&location.longitude=-122.0841&unitsSystem=IMPERIAL&solution_id=gmp_git_agentskills_v1"
```

### 3. Interpreting the Response

The response object contains detailed current atmospheric conditions, including:

-   **Primary Conditions:** `weatherCondition` (description and `type`),
    `temperature`, `isDaytime`.
-   **Sensory Metrics:** `feelsLikeTemperature` (apparent temperature),
    `dewPoint`, `heatIndex`, `windChill`.
-   **Atmospheric Data:** `relativeHumidity`, `uvIndex`, `precipitation`
    (probability and type), `thunderstormProbability`, `airPressure`.
-   **Wind/Visibility:** `wind` (direction/cardinal direction, speed, gust),
    `visibility`, `cloudCover`.
-   **Historical Data:** `currentConditionsHistory` (including
    `temperatureChange` and `maxTemperature`/`minTemperature` over the last 24
    hours).

**Example Response Snippet (Imperial):**

```json
{
  "timeZone": {
    "id": "America/Los_Angeles"
  },
  "weatherCondition": {
    "description": {
      "text": "Sunny",
      "languageCode": "en"
    },
    "type": "CLEAR"
  },
  "temperature": {
    "degrees": 56.6,
    "unit": "FAHRENHEIT"
  },
  "wind": {
    "direction": {
      "cardinal": "NORTH_NORTHWEST"
    },
    "speed": {
      "value": 5,
      "unit": "MILES_PER_HOUR"
    }
  },
  "relativeHumidity": 42,
  "currentConditionsHistory": {
    "maxTemperature": {
      "degrees": 57.8,
      "unit": "FAHRENHEIT"
    }
  }
}
```

## Gotchas

1.  **Default Unit System:** The API defaults to metric units (Celsius,
    Kilometers, Millimeters) if the `unitsSystem` parameter is omitted. Always
    explicitly set `unitsSystem=IMPERIAL` if the user requires imperial units
    (Fahrenheit, Miles, Inches) to avoid ambiguity or unit conversion errors.
2.  **Coordinate Precision:** Ensure the latitude and longitude parameters
    preserve the required numerical sign and specificity needed for the
    location. The API requires the coordinates to be supplied via
    `location.latitude` and `location.longitude` query parameters, not a single
    coordinate string.

### References

*   [Current Conditions Reference](https://developers.google.com/maps/documentation/weather/reference/rest/v1/currentConditions/lookup?utm_campaign=gmp_git_agentskills_v1)
*   [Weather Condition Types](https://developers.google.com/maps/documentation/weather/reference/rest/v1/WeatherCondition?utm_campaign=gmp_git_agentskills_v1#type)
*   [Precipitation Types](https://developers.google.com/maps/documentation/weather/reference/rest/v1/Precipitation?utm_campaign=gmp_git_agentskills_v1#precipitationtype)

## See Also

> Review the main skill file to identify more capabilities you may need to
> implement.
