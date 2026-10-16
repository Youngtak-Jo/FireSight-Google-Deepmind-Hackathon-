import test from 'node:test';
import assert from 'node:assert/strict';
import {
  reconcilePeopleSummary,
  normalizeFireSmokeZone,
  validateAndMergeScene,
  computeScenarioProgression,
  applyBuildingIdentityCorrection,
  upsertTimelineEvent,
  type SceneSpec,
  type IncidentState,
  type TimelineEvent,
} from './incident-engine.ts';
import {
  createEmptyStandbyIncidentState,
  createFerryBuildingIncidentState,
} from './evidence-generator.ts';
import { createTrappedPerson3DAsset } from './three-assets.ts';

function createBaseScene(buildingRevision = 1): SceneSpec {
  return {
    buildingRevision,
    envelopeId: 'env-apex-1',
    units: 'meters',
    orientationDeg: 0,
    dimensions: { width: 32, depth: 22, height: 16 },
    facadeSummary: 'Curtain wall glass with terracotta spandrel panels',
    roofSummary: 'Flat membrane roof with HVAC penthouse',
    structuralNotes: ['Reinforced concrete core'],
    floors: [
      {
        level: 1,
        name: 'Ground Lobby & Retail',
        use: 'Commercial Lobby',
        heightMeters: 4.5,
        elevationMeters: 0,
        sourceIds: [{ sourceId: 'src-plan-pdf', page: 1 }],
        rooms: [
          {
            id: 'f1-lobby',
            name: 'Main Atrium Lobby',
            floor: 1,
            bounds: { x: 0, z: 4, width: 18, depth: 10 },
            type: 'lobby',
            connectedRoomIds: ['f1-corridor'],
            doors: [{ id: 'd1', x: 0, z: 9, orientation: 'ew' }],
            windows: [],
            sourceIds: [{ sourceId: 'src-plan-pdf', page: 1 }],
          },
          {
            id: 'f1-corridor',
            name: 'North Service Corridor',
            floor: 1,
            bounds: { x: 0, z: -4, width: 24, depth: 4 },
            type: 'corridor',
            connectedRoomIds: ['f1-lobby'],
            doors: [],
            windows: [],
            sourceIds: [{ sourceId: 'src-plan-pdf', page: 1 }],
          },
        ],
      },
      {
        level: 3,
        name: 'Level 3 Data & Labs',
        use: 'Server & Research Labs',
        heightMeters: 4.0,
        elevationMeters: 8.5,
        sourceIds: [{ sourceId: 'src-plan-pdf', page: 3 }],
        rooms: [
          {
            id: 'f3-server',
            name: 'Server Room 302',
            floor: 3,
            bounds: { x: -8, z: -3, width: 10, depth: 8 },
            type: 'server_room',
            connectedRoomIds: ['f3-corridor'],
            doors: [{ id: 'd302', x: -3, z: -3, orientation: 'ns', connectsTo: 'f3-corridor' }],
            windows: [],
            sourceIds: [{ sourceId: 'src-plan-pdf', page: 3 }],
          },
          {
            id: 'f3-corridor',
            name: 'Central Spine Corridor 3C',
            floor: 3,
            bounds: { x: 0, z: 0, width: 26, depth: 3.5 },
            type: 'corridor',
            connectedRoomIds: ['f3-server', 'f3-east-lab'],
            doors: [],
            windows: [],
            sourceIds: [{ sourceId: 'src-plan-pdf', page: 3 }],
          },
          {
            id: 'f3-east-lab',
            name: 'East Wing Prototyping Lab 305',
            floor: 3,
            bounds: { x: 8, z: 4, width: 12, depth: 9 },
            type: 'lab',
            connectedRoomIds: ['f3-corridor'],
            doors: [],
            windows: [],
            sourceIds: [{ sourceId: 'src-plan-pdf', page: 3 }],
          },
        ],
      },
      {
        level: 4,
        name: 'Level 4 Executive & Terrace',
        use: 'Offices',
        heightMeters: 3.8,
        elevationMeters: 12.5,
        sourceIds: [{ sourceId: 'src-plan-pdf', page: 4 }],
        rooms: [],
      },
    ],
    stairs: [
      {
        id: 'stair-west-a',
        name: 'West Stairwell A',
        fromFloor: 3,
        toFloor: 4,
        position: { x: -12, z: 0, width: 3.5, depth: 6 },
        sourceIds: [{ sourceId: 'src-plan-pdf', page: 3 }],
      },
    ],
    fireZones: [
      {
        id: 'fz-302',
        floor: 3,
        roomId: 'f3-server',
        areaLabel: 'Server Room 302',
        position: [-8, 10.5, -3],
        radiusMeters: 3.5,
        hasFlames: true,
        flameIntensity: 0.8,
        smokeDensity: 0.85,
        smokeColor: 'black',
        provenance: 'observation',
        reportedAt: '2026-10-15T19:00:00Z',
        buildingRevision: 1,
      },
    ],
    stagingCandidates: [],
    quarantinedItems: [],
    scenarioAssumptions: {
      fuelAssumptions: 'High cable & lithium UPS load in Server Room 302',
      openingsAssumptions: 'Door D302 partially propped during maintenance',
      compartmentAssumptions: '1-hour rated partition walls on Level 3',
      suppressionAssumptions: 'Pre-action dry pipe status unconfirmed',
      ventilationAssumptions: 'HVAC damper state unknown',
    },
  };
}

test('reconcilePeopleSummary keeps floor-seen and unknown-location counts separate', () => {
  // "Five total people including two seen on one floor and three with unknown locations is not five people located on that floor."
  const summary = reconcilePeopleSummary(
    [
      {
        id: 'p1',
        label: 'Two technicians seen on 3rd floor East Wing',
        count: 2,
        floor: 3,
        roomId: 'f3-east-lab',
        areaLabel: 'East Wing Prototyping Lab 305',
        provenance: 'observation',
        buildingRevision: 1,
      },
      {
        id: 'p2',
        label: 'Three unconfirmed coworkers in building',
        count: 3,
        floor: undefined,
        provenance: 'relayed',
        buildingRevision: 1,
      },
    ],
    1,
    5
  );

  assert.equal(summary.totalReported, 5);
  assert.equal(summary.preciseRoomCounts['f3-east-lab']?.count, 2);
  assert.equal(summary.floorOnlyCounts[3] ?? 0, 0);
  assert.equal(summary.unknownLocationCount, 3);
});

test('normalizeFireSmokeZone prevents smoke-only reports from creating flames', () => {
  const smokeOnly = normalizeFireSmokeZone({
    id: 'fz-smoke-only',
    floor: 2,
    areaLabel: '2nd Floor West Hallway',
    position: [-5, 6, 0],
    radiusMeters: 3,
    hasFlames: false,
    flameIntensity: 0.9, // Should be forced to 0 because hasFlames is false
    smokeDensity: 0.7,
    smokeColor: 'gray',
    provenance: 'observation',
    reportedAt: '2026-10-15T19:01:00Z',
    buildingRevision: 1,
  });

  assert.equal(smokeOnly.hasFlames, false);
  assert.equal(smokeOnly.flameIntensity, 0);
  assert.equal(smokeOnly.smokeDensity, 0.7);
});

test('validateAndMergeScene rejects stale buildingRevision, detects duplicate envelopes, and quarantines out-of-bounds rooms', () => {
  const base = createBaseScene(2);
  const knownSources = new Set(['src-plan-pdf', 'src-photo-1']);

  // 1. Stale revision must be rejected
  const staleRes = validateAndMergeScene(
    base,
    { buildingRevision: 1, facadeSummary: 'Old building facade' },
    2,
    knownSources
  );
  assert.equal(staleRes.accepted, false);
  assert.equal(staleRes.mergedScene.facadeSummary, base.facadeSummary);

  // 2. Duplicate envelope ID + out-of-bounds room quarantine + valid room addition
  const mergeRes = validateAndMergeScene(
    base,
    {
      buildingRevision: 2,
      envelopeId: 'env-duplicate-99',
      floors: [
        {
          level: 3,
          name: 'Level 3 Data & Labs',
          use: 'Server & Research Labs',
          heightMeters: 4.0,
          elevationMeters: 8.5,
          sourceIds: [{ sourceId: 'src-plan-pdf', page: 3 }],
          rooms: [
            {
              id: 'f3-valid-west',
              name: 'West Battery Room 301',
              floor: 3,
              bounds: { x: -10, z: 5, width: 6, depth: 6 },
              type: 'mechanical',
              connectedRoomIds: ['f3-corridor'],
              doors: [],
              windows: [],
              sourceIds: [{ sourceId: 'src-plan-pdf', page: 3 }],
            },
            {
              id: 'f3-contradictory-room',
              name: 'Out of bounds floating room',
              floor: 3,
              bounds: { x: 95, z: 95, width: 20, depth: 20 }, // Outside 32x22m envelope
              type: 'office',
              connectedRoomIds: [],
              doors: [],
              windows: [],
              sourceIds: [{ sourceId: 'src-plan-pdf', page: 3 }],
            },
          ],
        },
      ],
    },
    2,
    knownSources
  );

  assert.equal(mergeRes.accepted, true);
  assert.equal(mergeRes.duplicateEnvelopeDetected, true);
  assert.equal(mergeRes.mergedScene.envelopeId, 'env-apex-1'); // Preserves authoritative envelopeId
  const f3 = mergeRes.mergedScene.floors.find((f) => f.level === 3)!;
  assert.equal(f3.rooms.some((r) => r.id === 'f3-valid-west'), true);
  assert.equal(f3.rooms.some((r) => r.id === 'f3-contradictory-room'), false);
  assert.equal(
    mergeRes.quarantined.some((q) => q.id === 'room-bounds-f3-contradictory-room'),
    true
  );
});

test('computeScenarioProgression is deterministic and propagates through spatial connections', () => {
  const scene = createBaseScene(1);

  const stage0 = computeScenarioProgression(scene, 0);
  assert.equal(stage0.length, 1);
  assert.equal(stage0[0].roomId, 'f3-server');
  assert.equal(stage0[0].isAssumedSpread, false);

  const stage35 = computeScenarioProgression(scene, 35);
  assert.equal(stage35.length > 1, true);
  assert.equal(stage35.some((z) => z.roomId === 'f3-corridor' && z.isAssumedSpread), true);

  const stage80 = computeScenarioProgression(scene, 80);
  assert.equal(stage80.some((z) => z.roomId === 'f3-east-lab' && z.isAssumedSpread), true);
  assert.equal(stage80.some((z) => z.floor === 4 && z.isAssumedSpread), true);

  // Resetting back to 0 must deterministically match stage0
  const resetStage0 = computeScenarioProgression(scene, 0);
  assert.deepEqual(resetStage0, stage0);
});

test('applyBuildingIdentityCorrection invalidates old spatial state and marks historical timeline events obsolete', () => {
  const scene = createBaseScene(1);
  const initialState: IncidentState = {
    id: 'inc-1',
    shareToken: 'tok-123',
    shareExpiresAt: '2026-10-16T19:00:00Z',
    revision: 5,
    buildingRevision: 1,
    title: 'Apex Innovation Hub Fire',
    status: 'monitoring',
    callState: { active: true, muted: false, questionsAskedCount: 2 },
    building: {
      name: 'Apex Innovation Hub',
      address: '240 Market St',
      coordinates: { lat: 37.79, lng: -122.4 },
      use: 'Tech Lab',
      floorCount: 4,
      heightMeters: 16,
      constructionType: 'Type I Concrete',
      nearbyStations: [],
      accessRoads: ['Market St'],
    },
    facts: [
      {
        id: 'fact-1',
        category: 'fire_smoke',
        statement: 'Black smoke on 3rd floor',
        provenance: 'observation',
        confidence: 'confirmed_report',
        floor: 3,
        reportedBy: 'Caller',
        createdAt: '2026-10-15T19:00:00Z',
        buildingRevision: 1,
      },
    ],
    peopleSummary: reconcilePeopleSummary(
      [
        {
          id: 'p1',
          label: '2 on Floor 3',
          count: 2,
          floor: 3,
          provenance: 'observation',
          buildingRevision: 1,
        },
      ],
      1,
      2
    ),
    sources: [
      {
        id: 'src-plan-pdf',
        title: 'Apex Floor Plan',
        url: 'https://example.com/plan.pdf',
        mimeType: 'application/pdf',
        status: 'applied',
        buildingRevision: 1,
      },
    ],
    scene,
    weather: {
      temperatureCelsius: 18,
      relativeHumidity: 62,
      windSpeedKmh: 19,
      windGustKmh: 28,
      windDirectionFromDeg: 290,
      windCardinalFrom: 'WNW',
      conditionText: 'Partly Cloudy',
      conditionType: 'PARTLY_CLOUDY',
      precipitationText: '0 mm',
      placeName: '240 Market St',
      observationTime: '2026-10-15T19:00:00Z',
      sourceName: 'Google Weather API',
      sourceUrl: 'https://weather.googleapis.com',
      buildingRevision: 1,
    },
    timeline: [
      {
        id: 'evt-1',
        type: 'caller_utterance',
        speaker: 'Caller',
        speakerRole: 'caller',
        text: 'Fire at Apex Innovation Hub!',
        createdAt: '2026-10-15T19:00:00Z',
        buildingRevision: 1,
      },
    ],
  };

  const corrected = applyBuildingIdentityCorrection(
    initialState,
    'Meridian Logistics Annex',
    '580 Howard Street, San Francisco, CA',
    'Dispatcher Rivera'
  );

  assert.equal(corrected.buildingRevision, 2);
  assert.equal(corrected.scene.floors.length, 0);
  assert.equal(corrected.scene.fireZones.length, 0);
  assert.equal(corrected.sources.length, 0);
  assert.equal(corrected.peopleSummary.totalReported, 0);
  assert.equal(corrected.timeline[0].obsoleteBuildingRevision, true);
  assert.equal(corrected.timeline[1].type, 'correction_notice');
});

test('upsertTimelineEvent updates partial speech and research traces in place without reordering', () => {
  const t0: TimelineEvent[] = [
    {
      id: 'utt-1',
      type: 'caller_utterance',
      speaker: 'Caller',
      speakerRole: 'caller',
      text: 'There is smoke on the',
      createdAt: '2026-10-15T19:00:01Z',
      isPartial: true,
      buildingRevision: 1,
    },
    {
      id: 'trace-1',
      type: 'research_trace',
      speaker: 'FireSight Research',
      speakerRole: 'research_orchestrator',
      text: 'Investigating Apex Innovation Hub...',
      createdAt: '2026-10-15T19:00:02Z',
      buildingRevision: 1,
    },
    {
      id: 'msg-2',
      type: 'team_message',
      speaker: 'Dispatcher',
      speakerRole: 'dispatcher',
      text: 'Copy, monitoring floor 3.',
      createdAt: '2026-10-15T19:00:03Z',
      buildingRevision: 1,
    },
  ];

  // Finalize utt-1 in place
  const r1 = upsertTimelineEvent(t0, {
    ...t0[0],
    text: 'There is smoke on the third floor server room.',
    isPartial: false,
  });

  assert.equal(r1.timeline.length, 3);
  assert.equal(r1.timeline[0].id, 'utt-1');
  assert.equal(r1.timeline[0].isPartial, false);
  assert.equal(r1.timeline[2].id, 'msg-2'); // Order preserved

  // Duplicate retry of finalized utterance is ignored
  const r2 = upsertTimelineEvent(r1.timeline, {
    ...r1.timeline[0],
  });
  assert.equal(r2.isDuplicate, true);
});

test('computeScenarioProgression at 60m (stage 100) ignites second-hop rooms and creates exterior facade blow-out fire zones', () => {
  const scene = createBaseScene(1);
  const stage100 = computeScenarioProgression(scene, 100);
  // Second-hop room f3-east-lab must now have active flames at +60m
  const eastLabZone = stage100.find((z) => z.roomId === 'f3-east-lab');
  assert.ok(eastLabZone, 'Second-hop room f3-east-lab should have a fire zone at +60m');
  assert.equal(eastLabZone.hasFlames, true, 'Second-hop room f3-east-lab must have active flames at +60m');

  // Exterior blow-out fire zones must be created at +36m..+60m
  const exteriorBlowout = stage100.find((z) => z.id.startsWith('scenario-roof-breakout-'));
  assert.ok(exteriorBlowout, 'Exterior facade blow-out fire zone must be generated at +60m');
  assert.equal(exteriorBlowout.hasFlames, true);
});

test('createEmptyStandbyIncidentState and createFerryBuildingIncidentState provide valid standby and live research scenarios', () => {
  const standby = createEmptyStandbyIncidentState();
  assert.equal(standby.status, 'standby');
  assert.equal(standby.timeline.length, 0);
  assert.equal(standby.scene.floors.length, 0);

  const ferry = createFerryBuildingIncidentState();
  assert.equal(ferry.demoScenarioId, 'ferry_live');
  assert.ok(ferry.building?.name.includes('Ferry Building'));
  assert.equal(ferry.scene.floors.length, 4);
  assert.equal(ferry.peopleSummary.totalReported, 5);
});

test('createTrappedPerson3DAsset builds articulated 3D human rescue figures with waving animation metadata', () => {
  const group = createTrappedPerson3DAsset(3, true);
  assert.equal(group.name, 'trapped_people_3d_asset');
  let waveCount = 0;
  group.traverse((child) => {
    if (child.userData.animateType === 'person_wave') {
      waveCount++;
    }
  });
  assert.equal(waveCount, 3, 'Should create 3 articulated waving human figures');
});

