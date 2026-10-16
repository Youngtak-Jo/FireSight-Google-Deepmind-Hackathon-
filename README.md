# 🔥 FireSight — Shared 3D & Multimodal Emergency Response Copilot

> *"Could we connect what a caller knows, what dispatch discovers, and what responders see into one shared intelligence?"*

[![Watch the FireSight Demo on YouTube](https://img.youtube.com/vi/L4dzFN3qgNM/maxresdefault.jpg)](https://youtu.be/L4dzFN3qgNM?si=KluLGnCKFktO0ewl)

▶️ **[Watch the Demo Video on YouTube](https://youtu.be/L4dzFN3qgNM?si=KluLGnCKFktO0ewl)** (`https://youtu.be/L4dzFN3qgNM?si=KluLGnCKFktO0ewl`)

---

## Why FireSight

My brother is a firefighter. Listening to his experiences and learning about emergency response made me ask a question: **could we connect what a caller knows, what dispatch discovers, and what responders see into one shared intelligence?**

I built **FireSight** at the Google DeepMind hackathon to explore that possibility. Powered by **Gemini Live** and **Gemini 4 Argon**, FireSight is an AI firefighting copilot and collaborative workspace that helps dispatchers and field responders understand the same situation and coordinate their response.

---

## How It Works

### 1. Real-Time 911 Call Intake & Shared Timeline (`Gemini Live`)
When an emergency call begins, **Gemini Live** analyzes the conversation in real time and generates relevant follow-up questions. It gathers information about the caller’s relationship to the incident, smoke color, visible flames, actions already taken, and the number and location of people who may need rescue. The conversation is transcribed into a shared incident timeline while Argon’s parallel agents begin investigating the scene.

### 2. Parallel Multi-Agent Scene Research (`Gemini 4 Argon`)
The idea draws on a simple observation: valuable information about buildings and their surroundings is already scattered across the web. Searching a location on Google can reveal exterior photographs, publicly available floor plans, information about building materials and use, and local events happening nearby that day. Gathering and interpreting this information as a call unfolds can help responders develop a richer understanding of the scene before they arrive.

**Argon** orchestrates parallel agents to research these sources alongside surrounding roads and access routes from Google Maps, temperature, humidity, wind speed, and wind direction:
- **Geo-Identity & Approach Subagent**: Resolves building footprint, coordinates, and nearest fire station apparatus routing via Google Maps Platform.
- **Structural & Occupancy Subagent**: Queries Google Search Grounding for architectural construction type, floor count, atrium/skylight geometry, and occupancy profile.
- **Multimodal Plan & Photo Subagent**: Inspects publicly available architectural floor plans (L1–L4) and exterior street-level photographs using **Gemini 4 Argon Vision**.
- **Materials, Hazards & Systems Subagent**: Identifies exterior facade cladding, high-voltage transformer vaults, commercial kitchen hoods, and FDC standpipe locations.
- **Meteorological Subagent**: Pulls live temperature, relative humidity, wind speed, and wind direction from the Google Maps Weather API.

### 3. Multimodal 3D Scene Reconstruction & 60-Minute Fire-Spread Simulation
Argon’s multimodal capabilities connect building photographs with the spatial structure of floor plans to reconstruct the scene in **3D**, incorporating reported fire, smoke, and **3D human rescue models** representing people needing rescue. Research results update the interface and model as they arrive. An interactive **0m → +60m scenario timeline** lets users explore interior and exterior fire-spread scenarios—including window blow-outs, vertical atrium smoke migration, and wind-driven rooftop breaches—based on the available evidence and explicit modeling assumptions.

The resulting 3D environment becomes a shared visual workspace for response planning. It brings together:
- **Vehicle approach routes and 3D fire apparatus staging candidates**
- **Interior layouts, pressurized stairwells, and reported fire/smoke compartments** for entry crews
- **3D medical triage tents and casualty collection points** for emergency medical staging

Dispatchers and responders can examine the same scene, switch between **3D Spatial**, **Building & Photos (Original Facade & Cladding Gallery)**, and **2D Tactical Map** views, explore scenarios, and review response options together.

### 4. Incident-Aware AI Bodycam & Field Collaboration
In the field, a responder’s smartphone becomes an **incident-aware AI bodycam**. Through a shared incident link, responders can speak with **Gemini Live**, show the scene through their camera, and receive real-time assistance informed by the existing call and research context. They can move between chat, voice, camera, and the 3D view without repeatedly explaining the situation from scratch.

Field observations feed back into the team’s shared understanding. When a responder shares a photograph, voice report, or chat message, dispatch and other responders can see it in the same incident room, and the AI’s context is updated. Call records, parallel research, field reports, and AI assistance come together in one chronological conversation, helping new discoveries inform the entire team.

---

## Why Gemini 4 Argon & Gemini Live

Argon’s large context window and multimodal processing are central to this approach. They allow FireSight to synthesize floor plans, photographs, call transcripts, weather data, parallel research, and accumulating field reports into an evolving understanding of the incident:
- **Multimodal understanding** connects architectural blueprints and street-level/on-scene photographs directly to 3D space.
- **Parallel agents** investigate geography, structural specs, floor plans, hazards, and live weather simultaneously.
- **Long-context reasoning** maintains continuity and provenance as new caller clues and field responder reports arrive.

FireSight translates these capabilities into real-time 3D scene reconstruction, weather- and building-informed fire-spread scenario simulation, route and staging visualization, responder decision support, and live collaboration between dispatch and the field.

> **FireSight’s goal is to help something one firefighter sees become something the whole team can act on.** By closing the information gaps between the emergency call, dispatch, and field responders, it aims to enable faster shared understanding and more coordinated action—helping protect both the people responding and the people we love.

---

## Built-In Interactive Demo Scenarios

When you launch FireSight, the workspace starts in **Standby Mode** with two one-click demo scenarios:

1. **Demo 1 — The Bradbury Building (`304 S Broadway, Los Angeles`)**
   - Curated architectural & tactical walkthrough (~2.8s natural pacing per step) featuring the 1893 Roman brick, terracotta, and brownstone landmark, 5-story Victorian skylit atrium, 3rd-floor West electrical vault fire, 5 trapped occupants rendered as 3D waving human figures, and LAFD responder field photo uploads.
2. **Demo 2 — San Francisco Ferry Building (`1 Ferry Building, The Embarcadero`)**
   - **Real Live Gemini 4 Argon Execution**: Streams real-time AI Call-Taker responses, executes live Google Maps Geocoding & Weather API calls, runs live `gemini-4-argon` Google Search Grounding + Multimodal Vision on the 245ft Beaux-Arts Clock Tower and Sheet A-102 floor plan, reconstructs the Embarcadero waterfront & Bay in 3D, and performs live Argon Vision analysis on SFFD responder fire photographs.

---

## Tech Stack

- **AI Models (`@google/genai`)**:
  - `gemini-4-argon` — Parallel research orchestration, Google Search grounding, multimodal floor plan & field photo vision, 3D scene synthesis, and tactical Q&A streaming
  - `gemini-3.8-live` — Low-latency real-time voice & camera streaming for 911 Call Intake and Field Responder AI Bodycam
  - `gemini-3.5-transcribe` — Voice dictation into the shared incident composer
- **Spatial & Maps**:
  - **Three.js (`three`)** — Procedural architectural 3D reconstruction (arched masonry facades, clock towers, Victorian ironwork atriums, 3D fire engines, medical triage tents, 3D human rescue figures, and dynamic 60-minute interior/exterior flame & smoke plume shaders)
  - **Google Maps Platform** — Geocoding API, Places API, Routes API, Weather API, and 2D Tactical Map view
- **Frontend & Backend**:
  - React 19, TypeScript, Tailwind CSS v4, Express + WebSocket real-time state synchronization (`server.ts`)

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables** (copy `.env.example` to `.env`):
   ```bash
   GEMINI_API_KEY=your_gemini_api_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

3. **Start the full-stack server (`port 3000`)**:
   ```bash
   npm run dev
   ```
