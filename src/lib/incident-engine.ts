export type Perspective = 'dispatcher' | 'caller' | 'responder';

export type ProvenanceType =
  | 'observation'
  | 'relayed'
  | 'document'
  | 'visual_inference'
  | 'assumption';

export interface IncidentFact {
  id: string;
  category:
    | 'location'
    | 'caller_relation'
    | 'fire_smoke'
    | 'people_life_risk'
    | 'evacuation_suppression'
    | 'access_obstacles'
    | 'hazards'
    | 'building_system';
  statement: string;
  provenance: ProvenanceType;
  confidence: 'confirmed_report' | 'uncertain' | 'hypothesis';
  floor?: number;
  roomId?: string;
  areaLabel?: string;
  sourceId?: string;
  sourcePage?: number;
  reportedBy: string;
  createdAt: string;
  buildingRevision: number;
  supersededById?: string;
}

export interface PersonLocationEntry {
  id: string;
  label: string;
  count: number;
  floor?: number; // undefined means unknown floor
  roomId?: string; // undefined means floor-only or unknown location
  areaLabel?: string;
  position?: [number, number, number];
  mobilityOrInjury?: string;
  lastKnownTime?: string;
  provenance: ProvenanceType;
  sourceId?: string;
  buildingRevision: number;
}

export interface PeopleSummary {
  totalReported: number;
  floorOnlyCounts: Record<number, number>;
  preciseRoomCounts: Record<string, { floor: number; count: number; label: string }>;
  unknownLocationCount: number;
  entries: PersonLocationEntry[];
  notes: string[];
}

export interface SourceDocument {
  id: string;
  title: string;
  originalTitle?: string;
  url: string;
  mimeType: 'application/pdf' | 'image/png' | 'image/jpeg' | 'text/html';
  status: 'discovered' | 'retrieved' | 'analyzed' | 'applied' | 'failed';
  byteLength?: number;
  sha256?: string;
  pageCount?: number;
  matchedFloor?: number;
  sourceDate?: string;
  previewUrl?: string;
  pages?: Array<{
    pageNumber: number;
    label: string;
    svgDataUrl: string;
    extractedSummary: string;
  }>;
  extractedElements?: string[];
  errorReason?: string;
  buildingRevision: number;
}

export interface TraceStep {
  id: string;
  label: string;
  status: 'running' | 'completed' | 'failed' | 'canceled';
  detail?: string;
  timestamp: string;
  toolName?: string;
  sourceIds?: string[];
}

export interface TraceBranch {
  id: 'identity_geo' | 'building_specs' | 'images_plans' | 'materials_systems' | 'weather';
  title: string;
  subagentName: string;
  status: 'running' | 'completed' | 'failed' | 'canceled';
  summary: string;
  steps: TraceStep[];
  sourceIds: string[];
  findings: string[];
}

export interface ResearchTraceData {
  runId: string;
  buildingRevision: number;
  clueTrigger: string;
  status: 'running' | 'completed' | 'partial_failure' | 'canceled';
  startedAt: string;
  completedAt?: string;
  branches: TraceBranch[];
}

export interface SceneRoom {
  id: string;
  name: string;
  floor: number;
  bounds: { x: number; z: number; width: number; depth: number };
  type: 'office' | 'corridor' | 'stairwell' | 'server_room' | 'lobby' | 'mechanical' | 'lab' | 'uncertain_area';
  uncertainty?: 'verified_plan' | 'approximate_geometry' | 'uncertain_area';
  connectedRoomIds: string[];
  doors: Array<{ id: string; x: number; z: number; orientation: 'ns' | 'ew'; connectsTo?: string }>;
  windows: Array<{ id: string; wall: 'north' | 'south' | 'east' | 'west'; offset: number; width: number }>;
  sourceIds: Array<{ sourceId: string; page?: number }>;
  materials?: string[];
  hazards?: string[];
}

export interface SceneStair {
  id: string;
  name: string;
  fromFloor: number;
  toFloor: number;
  position: { x: number; z: number; width: number; depth: number };
  sourceIds: Array<{ sourceId: string; page?: number }>;
}

export interface SceneFloor {
  level: number;
  name: string;
  use: string;
  heightMeters: number;
  elevationMeters: number;
  rooms: SceneRoom[];
  sourceIds: Array<{ sourceId: string; page?: number }>;
}

export interface FireSmokeZone {
  id: string;
  floor: number;
  roomId?: string;
  areaLabel: string;
  position: [number, number, number];
  radiusMeters: number;
  hasFlames: boolean; // False when only smoke is reported
  flameIntensity: number; // 0 if hasFlames is false
  smokeDensity: number; // 0..1
  smokeColor: 'white' | 'gray' | 'black';
  movementNote?: string;
  provenance: ProvenanceType;
  sourceId?: string;
  reportedAt: string;
  buildingRevision: number;
}

export interface StagingCandidate {
  id: string;
  type: 'truck_staging' | 'medical_post';
  label: string;
  coordinates: { lat: number; lng: number };
  localPosition: [number, number, number];
  status: 'candidate' | 'selected';
  placedBy: 'research_candidate' | 'dispatcher';
  risks: string[];
  outstandingChecks: string[];
  routeDistanceMeters?: number;
  routeDurationSeconds?: number;
  stationName?: string;
  buildingRevision: number;
}

export interface QuarantinedSceneItem {
  id: string;
  reason: string;
  rawItem: unknown;
  timestamp: string;
}

export interface SceneSpec {
  buildingRevision: number;
  envelopeId: string;
  units: 'meters';
  orientationDeg: number;
  dimensions: { width: number; depth: number; height: number };
  facadeSummary: string;
  roofSummary: string;
  structuralNotes: string[];
  floors: SceneFloor[];
  stairs: SceneStair[];
  fireZones: FireSmokeZone[];
  stagingCandidates: StagingCandidate[];
  quarantinedItems: QuarantinedSceneItem[];
  scenarioAssumptions: {
    fuelAssumptions: string;
    openingsAssumptions: string;
    compartmentAssumptions: string;
    suppressionAssumptions: string;
    ventilationAssumptions: string;
  };
}

export interface WeatherData {
  temperatureCelsius: number | null;
  relativeHumidity: number | null; // 0..100
  windSpeedKmh: number | null;
  windGustKmh: number | null;
  windDirectionFromDeg: number | null; // Meteorological direction wind blows FROM (0=N, 90=E, 180=S, 270=W)
  windCardinalFrom: string | null;
  conditionText: string | null;
  conditionType: string | null;
  precipitationText: string | null;
  placeName: string | null;
  observationTime: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  buildingRevision: number;
}

export interface FieldReportData {
  reportId: string;
  reporterName: string;
  captureTime: string;
  publishedAt: string;
  floor?: number;
  roomId?: string;
  placeLabel?: string;
  humanDescription: string;
  aiVisualSummary?: string;
  photoDataUrl?: string;
  deliveryStatus: 'pending' | 'delivered' | 'failed';
  linkedElementId?: string;
  buildingRevision: number;
}

export interface ModelUpdatePreview {
  updateId: string;
  buildingRevision: number;
  summary: string;
  focusElementId?: string;
  focusFloor?: number;
  sourceRefs: Array<{ sourceId: string; title: string; page?: number }>;
  quarantinedCount: number;
}

export type TimelineEventType =
  | 'caller_utterance'
  | 'call_taker_utterance'
  | 'team_message'
  | 'ai_answer'
  | 'research_trace'
  | 'model_update'
  | 'field_report'
  | 'correction_notice';

export interface TimelineEvent {
  id: string;
  idempotencyKey?: string;
  type: TimelineEventType;
  speaker: string;
  speakerRole: 'caller' | 'call_taker' | 'dispatcher' | 'responder' | 'firesight_ai' | 'research_orchestrator';
  text: string;
  createdAt: string;
  captureTime?: string;
  updatedAt?: string;
  isPartial?: boolean;
  buildingRevision: number;
  obsoleteBuildingRevision?: boolean;
  traceData?: ResearchTraceData;
  modelUpdate?: ModelUpdatePreview;
  fieldReport?: FieldReportData;
  sourceCitations?: Array<{ sourceId: string; title: string; page?: number; elementId?: string }>;
  considerationsForDispatch?: string[];
}

export interface NearbyFireStation {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  distanceMeters?: number;
  durationSeconds?: number;
  googleMapsUri?: string;
}

export interface BuildingIdentity {
  name: string;
  originalName?: string;
  address: string;
  coordinates: { lat: number; lng: number };
  placeId?: string;
  googleMapsUri?: string;
  use: string;
  floorCount: number;
  heightMeters: number;
  constructionType: string;
  renovationNotes?: string;
  nearbyStations: NearbyFireStation[];
  accessRoads: string[];
}

export interface IncidentState {
  id: string;
  shareToken: string;
  shareExpiresAt: string;
  revision: number;
  buildingRevision: number;
  title: string;
  status: 'standby' | 'active_intake' | 'researching' | 'monitoring';
  demoScenarioId?: 'standby' | 'bradbury_mockup' | 'ferry_live';
  demoRunning?: boolean;
  demoStepIndex?: number;
  demoTotalSteps?: number;
  callState: {
    active: boolean;
    muted: boolean;
    startedAt?: string;
    callerLocation?: string;
    callerRelationship?: string;
    questionsAskedCount: number;
  };
  building: BuildingIdentity | null;
  facts: IncidentFact[];
  peopleSummary: PeopleSummary;
  sources: SourceDocument[];
  scene: SceneSpec;
  weather: WeatherData;
  timeline: TimelineEvent[];
}

export interface SceneValidationResult {
  accepted: boolean;
  mergedScene: SceneSpec;
  appliedElements: string[];
  quarantined: QuarantinedSceneItem[];
  duplicateEnvelopeDetected: boolean;
  rejectionReason?: string;
}

/**
 * Reconciles people counts strictly preserving total vs floor-only vs precise rooms vs unknown.
 * Five total people including two seen on one floor and three with unknown locations
 * is NEVER five people located on that floor.
 */
export function reconcilePeopleSummary(
  entries: PersonLocationEntry[],
  activeBuildingRevision: number,
  explicitTotalReported?: number
): PeopleSummary {
  const validEntries = entries.filter((e) => e.buildingRevision === activeBuildingRevision && e.count > 0);
  const floorOnlyCounts: Record<number, number> = {};
  const preciseRoomCounts: Record<string, { floor: number; count: number; label: string }> = {};
  let unknownFromEntries = 0;
  let locatedSum = 0;
  const notes: string[] = [];

  for (const entry of validEntries) {
    if (typeof entry.floor === 'number' && Number.isFinite(entry.floor)) {
      locatedSum += entry.count;
      if (entry.roomId) {
        const existing = preciseRoomCounts[entry.roomId];
        preciseRoomCounts[entry.roomId] = {
          floor: entry.floor,
          count: (existing?.count ?? 0) + entry.count,
          label: entry.areaLabel || entry.label,
        };
      } else {
        floorOnlyCounts[entry.floor] = (floorOnlyCounts[entry.floor] ?? 0) + entry.count;
      }
    } else {
      unknownFromEntries += entry.count;
    }
    if (entry.mobilityOrInjury) {
      notes.push(`${entry.label}: ${entry.mobilityOrInjury} (${entry.provenance})`);
    }
  }

  const totalEntryCount = locatedSum + unknownFromEntries;
  const totalReported =
    typeof explicitTotalReported === 'number' && explicitTotalReported > totalEntryCount
      ? explicitTotalReported
      : totalEntryCount;

  const unknownLocationCount = Math.max(unknownFromEntries, totalReported - locatedSum);

  return {
    totalReported,
    floorOnlyCounts,
    preciseRoomCounts,
    unknownLocationCount,
    entries: validEntries,
    notes,
  };
}

/**
 * Enforces that smoke-only reports NEVER create observed flames.
 */
export function normalizeFireSmokeZone(zone: FireSmokeZone): FireSmokeZone {
  const hasFlames = Boolean(zone.hasFlames);
  return {
    ...zone,
    hasFlames,
    flameIntensity: hasFlames ? Math.max(0.15, Math.min(1, zone.flameIntensity || 0.7)) : 0,
    smokeDensity: Math.max(0.1, Math.min(1, zone.smokeDensity || 0.5)),
  };
}

/**
 * Validates and reconciles incoming geometry/scene updates against current SceneSpec.
 * - Rejects stale buildingRevision
 * - Detects duplicate building envelopes even when given a different envelopeId
 * - Validates finite coordinates, positive dimensions, floor membership, bounds, and source references
 * - Quarantines contradictory or out-of-bounds rooms instead of silently clamping them
 */
export function validateAndMergeScene(
  currentScene: SceneSpec,
  incomingPatch: Partial<SceneSpec> & { buildingRevision: number; envelopeId?: string },
  activeBuildingRevision: number,
  knownSourceIds?: Set<string>
): SceneValidationResult {
  if (incomingPatch.buildingRevision !== activeBuildingRevision) {
    return {
      accepted: false,
      mergedScene: currentScene,
      appliedElements: [],
      quarantined: [],
      duplicateEnvelopeDetected: false,
      rejectionReason: `Stale buildingRevision ${incomingPatch.buildingRevision} (active is ${activeBuildingRevision})`,
    };
  }

  const quarantined: QuarantinedSceneItem[] = [...currentScene.quarantinedItems];
  const appliedElements: string[] = [];
  let duplicateEnvelopeDetected = false;

  // Detect duplicate building envelope with different ID
  if (
    incomingPatch.envelopeId &&
    currentScene.envelopeId &&
    incomingPatch.envelopeId !== currentScene.envelopeId &&
    currentScene.floors.length > 0
  ) {
    duplicateEnvelopeDetected = true;
    quarantined.push({
      id: `dup-env-${incomingPatch.envelopeId}`,
      reason: `Duplicate building envelope '${incomingPatch.envelopeId}' detected; reconciled into authoritative envelope '${currentScene.envelopeId}'`,
      rawItem: { envelopeId: incomingPatch.envelopeId, dimensions: incomingPatch.dimensions },
      timestamp: new Date().toISOString(),
    });
  }

  // Validate dimensions if provided
  let dimensions = { ...currentScene.dimensions };
  if (incomingPatch.dimensions) {
    const { width, depth, height } = incomingPatch.dimensions;
    if (
      Number.isFinite(width) &&
      Number.isFinite(depth) &&
      Number.isFinite(height) &&
      width >= 4 &&
      width <= 300 &&
      depth >= 4 &&
      depth <= 300 &&
      height >= 3 &&
      height <= 400
    ) {
      dimensions = { width, depth, height };
      appliedElements.push('envelope_dimensions');
    } else {
      quarantined.push({
        id: `invalid-dim-${Date.now()}`,
        reason: `Rejected non-finite or out-of-range envelope dimensions (${width}x${depth}x${height}m)`,
        rawItem: incomingPatch.dimensions,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Merge floors and validate rooms
  const floorMap = new Map<number, SceneFloor>();
  for (const f of currentScene.floors) {
    floorMap.set(f.level, { ...f, rooms: [...f.rooms] });
  }

  const halfW = dimensions.width / 2 + 0.5;
  const halfD = dimensions.depth / 2 + 0.5;

  if (incomingPatch.floors) {
    for (const incomingFloor of incomingPatch.floors) {
      if (
        !Number.isInteger(incomingFloor.level) ||
        incomingFloor.level < 1 ||
        incomingFloor.level > 60 ||
        !Number.isFinite(incomingFloor.heightMeters) ||
        incomingFloor.heightMeters <= 1.8 ||
        incomingFloor.heightMeters > 20 ||
        !Number.isFinite(incomingFloor.elevationMeters) ||
        incomingFloor.elevationMeters < 0
      ) {
        quarantined.push({
          id: `invalid-floor-${incomingFloor.level}`,
          reason: `Invalid floor parameters on level ${incomingFloor.level}`,
          rawItem: incomingFloor,
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      const existingFloor = floorMap.get(incomingFloor.level);
      const roomMap = new Map<string, SceneRoom>();
      if (existingFloor) {
        for (const r of existingFloor.rooms) {
          roomMap.set(r.id, r);
        }
      }

      for (const room of incomingFloor.rooms || []) {
        if (room.floor !== incomingFloor.level) {
          quarantined.push({
            id: `room-floor-mismatch-${room.id}`,
            reason: `Room '${room.name}' (${room.id}) declares floor ${room.floor} inside floor ${incomingFloor.level}`,
            rawItem: room,
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        const { x, z, width, depth } = room.bounds || {};
        const coordsFinite =
          Number.isFinite(x) && Number.isFinite(z) && Number.isFinite(width) && Number.isFinite(depth);
        const validSize = width > 0.5 && depth > 0.5 && width <= dimensions.width + 1 && depth <= dimensions.depth + 1;
        const withinEnvelope =
          Math.abs(x) + width / 2 <= halfW + 1.0 && Math.abs(z) + depth / 2 <= halfD + 1.0;

        if (!coordsFinite || !validSize || !withinEnvelope) {
          quarantined.push({
            id: `room-bounds-${room.id}`,
            reason: `Room '${room.name}' (${room.id}) bounds [${x}, ${z}, ${width}x${depth}] violate building envelope [${dimensions.width}x${dimensions.depth}m]`,
            rawItem: room,
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        // Validate source references if knownSourceIds provided
        const validSourceRefs = (room.sourceIds || []).filter((ref) => {
          if (!ref.sourceId) return false;
          if (knownSourceIds && !knownSourceIds.has(ref.sourceId)) {
            quarantined.push({
              id: `room-source-ref-${room.id}-${ref.sourceId}`,
              reason: `Room '${room.id}' references unknown source '${ref.sourceId}'`,
              rawItem: ref,
              timestamp: new Date().toISOString(),
            });
            return false;
          }
          if (ref.page !== undefined && (!Number.isInteger(ref.page) || ref.page < 1)) {
            return false;
          }
          return true;
        });

        // Merge with existing room if present, preserving doors/windows/connectivity
        const prevRoom = roomMap.get(room.id);
        const mergedConnections = Array.from(
          new Set([...(prevRoom?.connectedRoomIds || []), ...(room.connectedRoomIds || [])])
        );
        const mergedDoors = room.doors?.length ? room.doors : prevRoom?.doors || [];
        const mergedWindows = room.windows?.length ? room.windows : prevRoom?.windows || [];

        roomMap.set(room.id, {
          ...prevRoom,
          ...room,
          connectedRoomIds: mergedConnections,
          doors: mergedDoors,
          windows: mergedWindows,
          sourceIds: validSourceRefs.length > 0 ? validSourceRefs : prevRoom?.sourceIds || [],
        });
        appliedElements.push(`room:${room.id}`);
      }

      floorMap.set(incomingFloor.level, {
        level: incomingFloor.level,
        name: incomingFloor.name || existingFloor?.name || `Floor ${incomingFloor.level}`,
        use: incomingFloor.use || existingFloor?.use || 'Mixed Use',
        heightMeters: incomingFloor.heightMeters,
        elevationMeters: incomingFloor.elevationMeters,
        rooms: Array.from(roomMap.values()),
        sourceIds: incomingFloor.sourceIds?.length
          ? incomingFloor.sourceIds
          : existingFloor?.sourceIds || [],
      });
      appliedElements.push(`floor:${incomingFloor.level}`);
    }
  }

  const validLevels = new Set(floorMap.keys());

  // Merge stairs & check floor connectivity
  const stairMap = new Map<string, SceneStair>();
  for (const s of currentScene.stairs) {
    stairMap.set(s.id, s);
  }
  if (incomingPatch.stairs) {
    for (const stair of incomingPatch.stairs) {
      if (
        !validLevels.has(stair.fromFloor) ||
        !validLevels.has(stair.toFloor) ||
        stair.fromFloor === stair.toFloor ||
        !Number.isFinite(stair.position.x) ||
        !Number.isFinite(stair.position.z)
      ) {
        quarantined.push({
          id: `invalid-stair-${stair.id}`,
          reason: `Stair '${stair.id}' connects invalid floors ${stair.fromFloor}->${stair.toFloor}`,
          rawItem: stair,
          timestamp: new Date().toISOString(),
        });
        continue;
      }
      stairMap.set(stair.id, stair);
      appliedElements.push(`stair:${stair.id}`);
    }
  }

  // Merge fire zones (normalized so smoke-only never creates flames)
  const fireZoneMap = new Map<string, FireSmokeZone>();
  for (const z of currentScene.fireZones) {
    if (z.buildingRevision === activeBuildingRevision) {
      fireZoneMap.set(z.id, normalizeFireSmokeZone(z));
    }
  }
  if (incomingPatch.fireZones) {
    for (const z of incomingPatch.fireZones) {
      if (z.buildingRevision !== activeBuildingRevision) continue;
      fireZoneMap.set(z.id, normalizeFireSmokeZone(z));
      appliedElements.push(`fire:${z.id}`);
    }
  }

  // Merge staging candidates
  const stagingMap = new Map<string, StagingCandidate>();
  for (const sc of currentScene.stagingCandidates) {
    if (sc.buildingRevision === activeBuildingRevision) {
      stagingMap.set(sc.id, sc);
    }
  }
  if (incomingPatch.stagingCandidates) {
    for (const sc of incomingPatch.stagingCandidates) {
      if (sc.buildingRevision !== activeBuildingRevision) continue;
      stagingMap.set(sc.id, sc);
      appliedElements.push(`staging:${sc.id}`);
    }
  }

  const mergedScene: SceneSpec = {
    buildingRevision: activeBuildingRevision,
    envelopeId: currentScene.envelopeId || incomingPatch.envelopeId || `env-rev-${activeBuildingRevision}`,
    units: 'meters',
    orientationDeg:
      typeof incomingPatch.orientationDeg === 'number' && Number.isFinite(incomingPatch.orientationDeg)
        ? incomingPatch.orientationDeg
        : currentScene.orientationDeg,
    dimensions,
    facadeSummary: incomingPatch.facadeSummary || currentScene.facadeSummary,
    roofSummary: incomingPatch.roofSummary || currentScene.roofSummary,
    structuralNotes: incomingPatch.structuralNotes?.length
      ? Array.from(new Set([...currentScene.structuralNotes, ...incomingPatch.structuralNotes]))
      : currentScene.structuralNotes,
    floors: Array.from(floorMap.values()).sort((a, b) => a.level - b.level),
    stairs: Array.from(stairMap.values()),
    fireZones: Array.from(fireZoneMap.values()),
    stagingCandidates: Array.from(stagingMap.values()),
    quarantinedItems: quarantined,
    scenarioAssumptions: {
      ...currentScene.scenarioAssumptions,
      ...(incomingPatch.scenarioAssumptions || {}),
    },
  };

  return {
    accepted: true,
    mergedScene,
    appliedElements,
    quarantined,
    duplicateEnvelopeDetected,
  };
}

export interface ComputedScenarioZone {
  id: string;
  floor: number;
  roomId?: string;
  areaLabel: string;
  position: [number, number, number];
  radiusMeters: number;
  hasFlames: boolean;
  flameIntensity: number;
  smokeDensity: number;
  smokeColor: 'white' | 'gray' | 'black';
  isAssumedSpread: boolean;
}

/**
 * Computes deterministic scenario progression at relative stage [0..100].
 * Stage 0 matches Reported Situation exactly.
 * Stages > 0 propagate smoke and fire through connected rooms, corridors, and stairwells.
 */
export function computeScenarioProgression(
  scene: SceneSpec,
  stage: number
): ComputedScenarioZone[] {
  const clampedStage = Math.max(0, Math.min(100, Math.round(stage)));
  const t = clampedStage / 100; // 0.0 -> 1.0

  const baseZones: ComputedScenarioZone[] = scene.fireZones.map((z) => {
    const normalized = normalizeFireSmokeZone(z);
    return {
      id: normalized.id,
      floor: normalized.floor,
      roomId: normalized.roomId,
      areaLabel: normalized.areaLabel,
      position: [...normalized.position] as [number, number, number],
      radiusMeters: normalized.radiusMeters * (1 + t * 1.15),
      hasFlames: normalized.hasFlames,
      flameIntensity: normalized.hasFlames ? Math.min(1, normalized.flameIntensity + t * 0.45) : 0,
      smokeDensity: Math.min(1, normalized.smokeDensity + t * 0.45),
      smokeColor: normalized.smokeColor,
      isAssumedSpread: false,
    };
  });

  if (clampedStage === 0) {
    return baseZones;
  }

  const roomLookup = new Map<string, { room: SceneRoom; floorElevation: number; floorHeight: number }>();
  for (const f of scene.floors) {
    for (const r of f.rooms) {
      roomLookup.set(r.id, { room: r, floorElevation: f.elevationMeters, floorHeight: f.heightMeters });
    }
  }

  const spreadZones: ComputedScenarioZone[] = [...baseZones];
  const visitedRooms = new Set<string>();

  for (const z of scene.fireZones) {
    if (!z.roomId) continue;
    visitedRooms.add(z.roomId);
    const originEntry = roomLookup.get(z.roomId);
    if (!originEntry) continue;

    // 1st-hop connected spaces (corridors / adjacent rooms) start spreading at stage >= 20 (+12m)
    if (clampedStage >= 20) {
      const hop1Factor = (clampedStage - 20) / 80; // 0..1
      for (const adjId of originEntry.room.connectedRoomIds) {
        if (visitedRooms.has(adjId)) continue;
        const adj = roomLookup.get(adjId);
        if (!adj) continue;
        visitedRooms.add(adjId);

        const canIgniteAdj = z.hasFlames && clampedStage >= 25;
        spreadZones.push({
          id: `scenario-hop1-${z.id}-${adjId}`,
          floor: adj.room.floor,
          roomId: adj.room.id,
          areaLabel: `${adj.room.name} (Scenario Spread)`,
          position: [
            adj.room.bounds.x,
            adj.floorElevation + adj.floorHeight * 0.45,
            adj.room.bounds.z,
          ],
          radiusMeters: Math.max(
            2.6,
            Math.min(adj.room.bounds.width, adj.room.bounds.depth) * 0.62 * (0.45 + 0.75 * hop1Factor)
          ),
          hasFlames: canIgniteAdj,
          flameIntensity: canIgniteAdj ? Math.min(0.96, 0.45 + ((clampedStage - 25) / 75) * 0.51) : 0,
          smokeDensity: Math.min(0.98, 0.35 + hop1Factor * 0.63),
          smokeColor: canIgniteAdj ? 'black' : z.smokeColor,
          isAssumedSpread: true,
        });

        // 2nd-hop connected spaces & perimeter window breakout at stage >= 45 (+27m)
        if (clampedStage >= 45) {
          const hop2Factor = (clampedStage - 45) / 55;
          for (const adj2Id of adj.room.connectedRoomIds) {
            if (visitedRooms.has(adj2Id)) continue;
            const adj2 = roomLookup.get(adj2Id);
            if (!adj2) continue;
            visitedRooms.add(adj2Id);

            const canIgniteHop2 = z.hasFlames && clampedStage >= 55;
            spreadZones.push({
              id: `scenario-hop2-${z.id}-${adj2Id}`,
              floor: adj2.room.floor,
              roomId: adj2.room.id,
              areaLabel: `${adj2.room.name} (${canIgniteHop2 ? 'Flashover Spread' : 'Smoke Migration'})`,
              position: [
                adj2.room.bounds.x,
                adj2.floorElevation + adj2.floorHeight * 0.5,
                adj2.room.bounds.z,
              ],
              radiusMeters: Math.max(
                2.4,
                Math.min(adj2.room.bounds.width, adj2.room.bounds.depth) * 0.55 * (0.4 + 0.7 * hop2Factor)
              ),
              hasFlames: canIgniteHop2,
              flameIntensity: canIgniteHop2 ? Math.min(0.92, 0.42 + ((clampedStage - 55) / 45) * 0.5) : 0,
              smokeDensity: Math.min(0.95, 0.3 + hop2Factor * 0.65),
              smokeColor: canIgniteHop2 ? 'black' : 'gray',
              isAssumedSpread: true,
            });
          }
        }
      }
    }

    // Vertical stairwell & atrium propagation to upper floor at stage >= 35 (+21m)
    if (clampedStage >= 35) {
      const vertFactor = (clampedStage - 35) / 65;
      const upperStairs = scene.stairs.filter((s) => s.fromFloor <= z.floor && s.toFloor > z.floor);
      for (const stair of upperStairs) {
        const upperFloor =
          scene.floors.find((f) => f.level === z.floor + 1) ||
          scene.floors.find((f) => f.level === stair.toFloor);
        if (!upperFloor) continue;
        const canIgniteUpper = z.hasFlames && clampedStage >= 50;
        spreadZones.push({
          id: `scenario-stair-${z.id}-${stair.id}`,
          floor: upperFloor.level,
          areaLabel: `${stair.name} Upper Landing F${upperFloor.level} (Vertical Lap-Over)`,
          position: [
            stair.position.x,
            upperFloor.elevationMeters + upperFloor.heightMeters * 0.5,
            stair.position.z,
          ],
          radiusMeters: 2.8 + vertFactor * 3.4,
          hasFlames: canIgniteUpper,
          flameIntensity: canIgniteUpper ? Math.min(0.92, 0.4 + ((clampedStage - 50) / 50) * 0.52) : 0,
          smokeDensity: Math.min(0.95, 0.3 + vertFactor * 0.65),
          smokeColor: canIgniteUpper ? 'black' : z.smokeColor,
          isAssumedSpread: true,
        });
      }
    }

    // Unchecked 36m–60m (stage >= 60) Exterior Facade & Skylight Roof Venting Breach
    if (z.hasFlames && clampedStage >= 60) {
      const roofFactor = (clampedStage - 60) / 40;
      const topFloor = scene.floors[scene.floors.length - 1];
      if (topFloor) {
        spreadZones.push({
          id: `scenario-roof-breakout-${z.id}`,
          floor: topFloor.level,
          roomId: topFloor.rooms[0]?.id,
          areaLabel: `Atrium Skylight & Upper Facade Breach (Unchecked +${Math.round((clampedStage / 100) * 60)}m)`,
          position: [
            0,
            topFloor.elevationMeters + topFloor.heightMeters * 0.65,
            3.5,
          ],
          radiusMeters: 4.2 + roofFactor * 4.5,
          hasFlames: true,
          flameIntensity: Math.min(1.0, 0.65 + roofFactor * 0.35),
          smokeDensity: 0.98,
          smokeColor: 'black',
          isAssumedSpread: true,
        });
      }
    }
  }

  return spreadZones;
}

/**
 * Applies a building identity correction:
 * - Increments buildingRevision and revision
 * - Invalidates active old geometry, sources, people/fire locations and staging candidates
 * - Keeps historical conversation visible with obsoleteBuildingRevision=true so it cannot reactivate old state
 */
export function applyBuildingIdentityCorrection(
  state: IncidentState,
  newBuildingName: string,
  newAddress: string,
  correctedBy: string
): IncidentState {
  const nextBuildingRevision = state.buildingRevision + 1;
  const nextRevision = state.revision + 1;
  const now = new Date().toISOString();

  const updatedTimeline: TimelineEvent[] = state.timeline.map((evt) => ({
    ...evt,
    obsoleteBuildingRevision: evt.buildingRevision < nextBuildingRevision ? true : evt.obsoleteBuildingRevision,
    traceData:
      evt.traceData && evt.buildingRevision < nextBuildingRevision
        ? {
            ...evt.traceData,
            status: evt.traceData.status === 'running' ? 'canceled' : evt.traceData.status,
            branches: evt.traceData.branches.map((b) => ({
              ...b,
              status: b.status === 'running' ? 'canceled' : b.status,
            })),
          }
        : evt.traceData,
  }));

  const noticeEvent: TimelineEvent = {
    id: `evt-correction-${nextBuildingRevision}-${Date.now()}`,
    type: 'correction_notice',
    speaker: correctedBy,
    speakerRole: 'dispatcher',
    text: `Building identity corrected to "${newBuildingName}" (${newAddress}). Prior geometry, sources, staging candidates, and floor locations from revision #${state.buildingRevision} have been invalidated. Re-initializing spatial research for revision #${nextBuildingRevision}.`,
    createdAt: now,
    buildingRevision: nextBuildingRevision,
  };

  const emptyScene: SceneSpec = {
    buildingRevision: nextBuildingRevision,
    envelopeId: `env-rev-${nextBuildingRevision}`,
    units: 'meters',
    orientationDeg: 0,
    dimensions: { width: 28, depth: 20, height: 12 },
    facadeSummary: 'Pending source verification for corrected building identity',
    roofSummary: 'Pending aerial/plan verification',
    structuralNotes: ['Awaiting confirmed building documentation for new identity'],
    floors: [],
    stairs: [],
    fireZones: [],
    stagingCandidates: [],
    quarantinedItems: [],
    scenarioAssumptions: {
      fuelAssumptions: 'Awaiting building occupancy & materials verification.',
      openingsAssumptions: 'Interior doors assumed closed unless reported open.',
      compartmentAssumptions: 'Unverified compartmentation.',
      suppressionAssumptions: 'Sprinkler status unconfirmed.',
      ventilationAssumptions: 'Outdoor wind alone does not establish indoor smoke flow.',
    },
  };

  return {
    ...state,
    revision: nextRevision,
    buildingRevision: nextBuildingRevision,
    title: `${newBuildingName} — Structure Fire Intake`,
    status: 'researching',
    building: {
      name: newBuildingName,
      address: newAddress,
      coordinates: state.building?.coordinates || { lat: 37.7897, lng: -122.4014 },
      use: 'Pending verification',
      floorCount: 3,
      heightMeters: 12,
      constructionType: 'Pending verification',
      nearbyStations: [],
      accessRoads: [],
    },
    facts: state.facts.map((f) => ({
      ...f,
      supersededById: f.buildingRevision < nextBuildingRevision ? noticeEvent.id : f.supersededById,
    })),
    peopleSummary: reconcilePeopleSummary([], nextBuildingRevision, 0),
    sources: [],
    scene: emptyScene,
    weather: {
      temperatureCelsius: null,
      relativeHumidity: null,
      windSpeedKmh: null,
      windGustKmh: null,
      windDirectionFromDeg: null,
      windCardinalFrom: null,
      conditionText: null,
      conditionType: null,
      precipitationText: null,
      placeName: newAddress,
      observationTime: null,
      sourceName: null,
      sourceUrl: null,
      buildingRevision: nextBuildingRevision,
    },
    timeline: [...updatedTimeline, noticeEvent],
  };
}

/**
 * Upserts a timeline event while preserving chronological order:
 * - Deduplicates retries via id or idempotencyKey
 * - Revises partial speech in place and finalizes utterance once
 * - Updates existing research_trace in place without reordering old messages
 */
export function upsertTimelineEvent(
  timeline: TimelineEvent[],
  incoming: TimelineEvent
): { timeline: TimelineEvent[]; isDuplicate: boolean } {
  const existingIdx = timeline.findIndex(
    (e) =>
      e.id === incoming.id ||
      (incoming.idempotencyKey && e.idempotencyKey === incoming.idempotencyKey)
  );

  if (existingIdx !== -1) {
    const existing = timeline[existingIdx];
    // If an utterance was already finalized and a duplicate retry arrives, ignore duplicate
    if (
      !existing.isPartial &&
      !incoming.isPartial &&
      existing.type === incoming.type &&
      existing.text === incoming.text &&
      existing.type !== 'research_trace' &&
      existing.type !== 'field_report'
    ) {
      return { timeline, isDuplicate: true };
    }

    // Update in place, preserving original createdAt and array position so old messages never reorder
    const updated = [...timeline];
    updated[existingIdx] = {
      ...existing,
      ...incoming,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    return { timeline: updated, isDuplicate: false };
  }

  return {
    timeline: [...timeline, incoming],
    isDuplicate: false,
  };
}
