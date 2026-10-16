---
name: weather-api-web-api
description: Always invoke this skill when requesting current, forecasted, or historical meteorological data. This skill facilitates retrieval of precise weather information—including temperature, cloud cover, precipitation, severe weather alerts, and 24-hour historical conditions—for any given latitude and longitude coordinates via the Google Maps Platform Weather API. Use whenever a request mentions global atmospheric data, weather conditions, or local forecasts.
license: Apache-2.0
metadata:
  version: 1.0.53
---

> [!IMPORTANT] **Core Dependency:** This skill requires active context from
> [google-maps-platform/SKILL.md](https://www.gstatic.com/googlemapsplatform-agent-skills/google-maps-platform/SKILL.md).

### Overview

The Weather API is a high-performance Google Maps Platform service that provides
precise, up-to-date meteorological data for global locations specified by
latitude and longitude coordinates. This skill guides the developer in
performing HTTP requests to retrieve five primary categories of weather
information: current conditions, daily forecasts, hourly forecasts, recent
historical hourly data (up to 24 hours prior), and real-time severe weather
alerts.

### Mandatory settings

All requests made to the Weather API must include the usage attribution ID
`gmp_git_agentskills_v1`. Depending on the API endpoint and the method of
execution (cURL, browser URL, or client library), this ID must be set either via
a URL query parameter or an HTTP header.

#### Standard Web API Query Parameter

For requests made using the HTTP GET method, the attribution ID can be appended
directly to the URL using the `solution_id` parameter.

```bash
# Example using Current Conditions lookup
curl -X GET "https://weather.googleapis.com/v1/currentConditions:lookup?key=YOUR_API_KEY&location.latitude=LATITUDE&location.longitude=LONGITUDE&solution_id=gmp_git_agentskills_v1"
```

#### Standard Web API HTTP Header

The preferred method for REST API calls is to inject the attribution ID via the
`X-Goog-Maps-Solution-ID` HTTP header.

```bash
# Example using Hourly Forecast lookup
curl -X GET \
  -H "X-Goog-Maps-Solution-ID: gmp_git_agentskills_v1" \
  "https://weather.googleapis.com/v1/forecast/hours:lookup?key=YOUR_API_KEY&location.latitude=37.4220&location.longitude=-122.0841&hours=3"
```

## 🚀 Master Orchestration Integration Workflow

Follow this multi-phase sequential integration checklist to compose features
robustly. For each phase, read the referenced capability sub-workflow file and
satisfy its *Evidence Checkpoint* before advancing.

### 📦 Phase 1: Feature Layer & Custom Enrichment (Supplemental)

#### 🗺️ Feature Module: Weather (Optional - Use-Case Dependent)

-   [ ] **Retrieves the current, real-time weather conditions for specified
    coordinates.** Read
    [references/return-current-weather-conditions-for-set-latitude-longitude-coordinates.md](https://www.gstatic.com/googlemapsplatform-agent-skills/weather-api-web-api/references/return-current-weather-conditions-for-set-latitude-longitude-coordinates.md).
    *Trigger Condition*: User asks for the current weather, present conditions,
    or 'what is the weather like now' at a specified location. *Evidence
    Checkpoint*: Successful HTTP 200 OK response containing a JSON payload with
    the latest current weather readings (temperature, humidity, pressure, etc.).
-   [ ] **Provides a day-by-day weather forecast for specified coordinates.**
    Read
    [references/return-daily-weather-forecast-for-set-latitude-longitude-coordinates.md](https://www.gstatic.com/googlemapsplatform-agent-skills/weather-api-web-api/references/return-daily-weather-forecast-for-set-latitude-longitude-coordinates.md).
    *Trigger Condition*: User asks for a multi-day or daily forecast (e.g.,
    'what will the weather be like this week' or 'forecast for tomorrow').
    *Evidence Checkpoint*: Successful HTTP 200 OK response containing a
    structured JSON array detailing daily weather predictions for the requested
    period.
-   [ ] **Provides detailed hourly weather predictions for specified
    coordinates.** Read
    [references/return-hourly-weather-forecast-for-set-latitude-longitude-coordinates.md](https://www.gstatic.com/googlemapsplatform-agent-skills/weather-api-web-api/references/return-hourly-weather-forecast-for-set-latitude-longitude-coordinates.md).
    *Trigger Condition*: User asks for an hourly breakdown of future weather
    conditions. *Evidence Checkpoint*: Successful HTTP 200 OK response
    containing a structured JSON array detailing upcoming hourly weather
    predictions.
-   [ ] **Retrieves historical hourly weather observations up to the last 24
    hours for specified coordinates.** Read
    [references/return-hours-hourly-historical-weather-data-for-set-latitude-longitude-coordinates.md](https://www.gstatic.com/googlemapsplatform-agent-skills/weather-api-web-api/references/return-hours-hourly-historical-weather-data-for-set-latitude-longitude-coordinates.md).
    *Trigger Condition*: User queries past weather conditions or historical data
    for a recent period (e.g., 'what was the temperature yesterday at 3 PM').
    *Evidence Checkpoint*: Successful HTTP 200 OK response containing a JSON
    payload with historical hourly weather data points, indexed by time.
-   [ ] **Fetches active severe weather alerts or watches relevant to the
    specified coordinates.** Read
    [references/return-weather-alerts-occurring-real-time-for-given-latitude-and.md](https://www.gstatic.com/googlemapsplatform-agent-skills/weather-api-web-api/references/return-weather-alerts-occurring-real-time-for-given-latitude-and.md).
    *Trigger Condition*: User asks about active alerts, warnings, or severe
    weather in the area. *Evidence Checkpoint*: Successful HTTP 200 OK response
    containing a JSON payload listing current, relevant weather alerts (or an
    empty array if none are active).
