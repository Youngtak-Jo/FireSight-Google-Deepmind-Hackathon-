import crypto from 'node:crypto';
import {
  reconcilePeopleSummary,
  type IncidentState,
  type SourceDocument,
  type SceneSpec,
  type ResearchTraceData,
} from './incident-engine.ts';

/**
 * Generates a valid, genuine multi-page PDF binary buffer (%PDF-1.4) containing
 * architectural floor plan schedules, room dimensions, stairwell coordinates,
 * and structural annotations for a given building identity.
 * This allows real PDF byte retrieval, SHA-256 hashing, and Gemini Argon
 * multimodal inlineData ("application/pdf") analysis.
 */
export function buildRealArchitecturalPdfBytes(buildingName: string, address: string): Buffer {
  const page1Text = [
    `ARCHITECTURAL RECORD PLAN - ${buildingName.toUpperCase()}`,
    `Location: ${address} | Scale: 1:100 | Units: Meters`,
    `Envelope: 34.0m Width (E-W) x 24.0m Depth (N-S) x 16.0m Height (4 Levels)`,
    `PAGE 1 OF 3: LEVEL 1 GROUND LOBBY, ATRIUM & FIRE COMMAND`,
    `- Room f1-lobby (Main Atrium Lobby): x=0, z=4, width=18m, depth=10m. Glazed South Entrance.`,
    `- Room f1-command (Fire Command & Security 102): x=-11, z=5, width=7m, depth=8m. FDC & Annunciator.`,
    `- Room f1-corridor (North Service Corridor 1C): x=0, z=-3, width=26m, depth=4m.`,
    `- Room f1-loading (East Loading & Transformer Bay 104): x=10, z=-7, width=10m, depth=6m. 480V Switchgear.`,
    `- Stairwell stair-west-a (West Enclosed Stair A): x=-14, z=0, width=3.5m, depth=6m (Connects L1-L4).`,
    `- Stairwell stair-east-b (East Pressurized Stair B): x=14, z=0, width=3.5m, depth=6m (Connects L1-L4).`,
  ].join(' | ');

  const page2Text = [
    `ARCHITECTURAL RECORD PLAN - ${buildingName.toUpperCase()}`,
    `PAGE 2 OF 3: LEVEL 2 R&D OFFICES & LEVEL 3 SERVER / BATTERY LABS`,
    `Level 2 (Elevation +4.5m, Height 4.0m):`,
    `- Room f2-open (Open Engineering Studio 201): x=-4, z=4, width=20m, depth=9m.`,
    `- Room f2-corridor (Central Spine Corridor 2C): x=0, z=-2, width=26m, depth=3.5m.`,
    `- Room f2-mech (HVAC & Riser Room 204): x=9, z=-6, width=9m, depth=5m.`,
    `Level 3 (Elevation +8.5m, Height 4.0m):`,
    `- Room f3-server (Server & UPS Room 302): x=-8, z=-4, width=11m, depth=8m. Contains LiFePO4 UPS racks.`,
    `- Room f3-corridor (Central Spine Corridor 3C): x=0, z=1, width=26m, depth=3.5m. Connects 301, 302, 305, Stairs A/B.`,
    `- Room f3-east-lab (East Wing Prototyping Lab 305): x=8, z=5, width=12m, depth=9m. Glass partition to 3C.`,
    `- Room f3-west-storage (West Chemical & Battery Prep 301): x=-10, z=5, width=7m, depth=7m.`,
  ].join(' | ');

  const page3Text = [
    `ARCHITECTURAL RECORD PLAN - ${buildingName.toUpperCase()}`,
    `PAGE 3 OF 3: LEVEL 4 EXECUTIVE FLOOR, ROOF SYSTEMS & STRUCTURAL SCHEDULE`,
    `Level 4 (Elevation +12.5m, Height 3.5m):`,
    `- Room f4-conf (North Conference & Briefing Hall 401): x=0, z=-4, width=22m, depth=7m.`,
    `- Room f4-corridor (Upper Gallery Corridor 4C): x=0, z=1, width=26m, depth=3.5m.`,
    `- Room f4-terrace (South Sky Lobby & Mechanical Penthouse 402): x=0, z=5, width=18m, depth=7m.`,
    `Structural & Fire Protection Notes:`,
    `- Type I-B Reinforced Concrete Frame with aluminum-framed double low-E curtain wall facade.`,
    `- Wet-pipe sprinkler system on L1, L2, L4; pre-action dry-pipe system in Server Room 302.`,
  ].join(' | ');

  const makePageContent = (text: string) => {
    const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const stream = `BT /F1 10 Tf 36 740 Td (${escaped.slice(0, 110)}) Tj 0 -18 Td (${escaped.slice(110, 220)}) Tj 0 -18 Td (${escaped.slice(220, 330)}) Tj 0 -18 Td (${escaped.slice(330, 440)}) Tj 0 -18 Td (${escaped.slice(440, 550)}) Tj 0 -18 Td (${escaped.slice(550, 680)}) Tj ET`;
    return stream;
  };

  const s1 = makePageContent(page1Text);
  const s2 = makePageContent(page2Text);
  const s3 = makePageContent(page3Text);

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R] /Count 3 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 6 0 R >> >> /Contents 7 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 6 0 R >> >> /Contents 8 0 R >>\nendobj\n',
    '5 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 6 0 R >> >> /Contents 9 0 R >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `7 0 obj\n<< /Length ${Buffer.byteLength(s1)} >>\nstream\n${s1}\nendstream\nendobj\n`,
    `8 0 obj\n<< /Length ${Buffer.byteLength(s2)} >>\nstream\n${s2}\nendstream\nendobj\n`,
    `9 0 obj\n<< /Length ${Buffer.byteLength(s3)} >>\nstream\n${s3}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf-8');
}

/**
 * Generates crisp architectural blueprint SVG data URLs for each page of the PDF
 * so the Source Viewer Sheet can display the exact page selected by the user.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildPlanPageSvgDataUrl(
  buildingName: string,
  pageNumber: number,
  address: string
): string {
  const bradburySheets: Record<number, string> = {
    1: '/src/assets/images/bradbury_floorplan_l1_1792124790927.jpg',
    2: '/src/assets/images/bradbury_floorplan_l2_1792124792612.jpg',
    3: '/src/assets/images/bradbury_floorplan_l3_1792124793694.jpg',
    4: '/src/assets/images/bradbury_floorplan_l4_1792124795692.jpg',
  };
  if (
    buildingName.toLowerCase().includes('bradbury') ||
    address.toLowerCase().includes('broadway')
  ) {
    return bradburySheets[pageNumber] || bradburySheets[1];
  }
  if (
    buildingName.toLowerCase().includes('ferry') ||
    address.toLowerCase().includes('embarcadero')
  ) {
    if (pageNumber === 2 || pageNumber === 3) {
      return '/src/assets/images/ferry_floorplan_l2_1792126216995.jpg';
    }
  }

  const pageConfigs: Record<
    number,
    { title: string; subtitle: string; rooms: Array<{ x: number; y: number; w: number; h: number; code: string; name: string; highlight?: boolean }> }
  > = {
    1: {
      title: 'SHEET A-101 — LEVEL 1 ARCADED STOREFRONT, LOBBY & FREIGHT BAY',
      subtitle: 'Scale 1:100 · Elev +0.00m · Limestone Arcade, Main Lobby 101, Fire Command 102 & Beale St Freight Bay 104',
      rooms: [
        { x: 90, y: 80, w: 60, h: 190, code: 'STAIR-A', name: 'West Stair A (2-Hr)' },
        { x: 160, y: 70, w: 420, h: 70, code: '1C', name: 'North Service Corridor 1C (26m x 4m)' },
        { x: 430, y: 15, w: 170, h: 52, code: '104', name: 'Beale St Freight Bay & 480V Switchgear' },
        { x: 160, y: 150, w: 120, h: 140, code: '102', name: 'Fire Command & Annunciator' },
        { x: 290, y: 150, w: 290, h: 150, code: '101', name: 'Main Market St Atrium Lobby (18m x 10m)' },
        { x: 590, y: 80, w: 60, h: 190, code: 'STAIR-B', name: 'East Stair B (FDC)' },
      ],
    },
    2: {
      title: 'SHEET A-102 — LEVEL 2 OPEN HERITAGE BRICK & TIMBER TECH STUDIO',
      subtitle: 'Scale 1:100 · Elev +4.50m · Open Engineering Loft 201, Central Spine Corridor 2C & IDF 202',
      rooms: [
        { x: 90, y: 80, w: 60, h: 190, code: 'STAIR-A', name: 'West Stair A' },
        { x: 160, y: 35, w: 240, h: 95, code: '202', name: 'North Mechanical & Telecom IDF 202' },
        { x: 410, y: 35, w: 170, h: 95, code: '203', name: 'Breakroom & Conference Suite' },
        { x: 160, y: 140, w: 420, h: 50, code: '2C', name: 'Central Spine Corridor 2C (26m x 3.5m)' },
        { x: 160, y: 200, w: 420, h: 115, code: '201', name: 'South Open Engineering Loft Studio 201' },
        { x: 590, y: 80, w: 60, h: 190, code: 'STAIR-B', name: 'East Stair B' },
      ],
    },
    3: {
      title: 'SHEET A-103 — LEVEL 3 SERVER ROOM 302 & HARDWARE PROTOTYPING LABS',
      subtitle: 'Scale 1:100 · Elev +8.50m · Server & UPS Room 302, Corridor 3C, West Prep 301 & East Lab 305',
      rooms: [
        { x: 90, y: 80, w: 60, h: 190, code: 'STAIR-A', name: 'West Stair A' },
        { x: 160, y: 35, w: 210, h: 110, code: '302', name: 'Server & UPS Room 302 (11m x 8m)', highlight: true },
        { x: 380, y: 35, w: 200, h: 110, code: '303', name: 'Network Patch & Cooling Riser' },
        { x: 160, y: 155, w: 420, h: 52, code: '3C', name: 'Central Spine Corridor 3C (26m x 3.5m)' },
        { x: 160, y: 215, w: 145, h: 105, code: '301', name: 'West Battery Prep 301' },
        { x: 315, y: 215, w: 265, h: 105, code: '305', name: 'East Prototyping Lab 305 (12m x 9m)', highlight: true },
        { x: 590, y: 80, w: 60, h: 190, code: 'STAIR-B', name: 'East Stair B' },
      ],
    },
    4: {
      title: 'SHEET A-201 — LEVEL 4 SKYLIGHT GALLERY, ROOF HVAC & CORNICE SECTION',
      subtitle: 'Scale 1:100 · Elev +12.50m · Kiln-Fired Red Brick Piers, Terra-Cotta Cornice & Central Skylight',
      rooms: [
        { x: 90, y: 80, w: 60, h: 190, code: 'STAIR-A', name: 'West Stair A (Roof Hatch)' },
        { x: 160, y: 40, w: 420, h: 95, code: '401', name: 'North Conference & Briefing Hall 401' },
        { x: 160, y: 145, w: 420, h: 50, code: '4C', name: 'Upper Skylight Atrium Gallery 4C' },
        { x: 190, y: 205, w: 360, h: 105, code: '402', name: 'South Sky Lounge & Rooftop HVAC Penthouse' },
        { x: 590, y: 80, w: 60, h: 190, code: 'STAIR-B', name: 'East Stair B (Roof Hatch)' },
      ],
    },
  };

  const cfg = pageConfigs[pageNumber] || pageConfigs[1];
  const roomsSvg = cfg.rooms
    .map(
      (r) => `
      <g>
        <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${
        r.highlight ? 'rgba(239,68,68,0.14)' : 'rgba(30,41,59,0.55)'
      }" stroke="${r.highlight ? '#f87171' : '#94a3b8'}" stroke-width="${r.highlight ? '2' : '1.5'}" />
        <text x="${r.x + 10}" y="${r.y + 22}" fill="#e2e8f0" font-family="IBM Plex Mono, monospace" font-size="11" font-weight="600">${escapeXml(r.code)}</text>
        <text x="${r.x + 10}" y="${r.y + 40}" fill="#cbd5e1" font-family="Plus Jakarta Sans, sans-serif" font-size="10">${escapeXml(r.name)}</text>
      </g>`
    )
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 420" width="740" height="420">
    <rect width="740" height="420" fill="#090d16" />
    <g stroke="#1e293b" stroke-width="0.75">
      ${Array.from({ length: 18 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="420" />`).join('')}
      ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 40}" x2="740" y2="${i * 40}" />`).join('')}
    </g>
    <rect x="65" y="10" width="610" height="330" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 3" />
    ${roomsSvg}
    <g transform="translate(695, 55)">
      <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#64748b" stroke-width="1.2" />
      <polygon points="0,-13 -5,5 0,1 5,5" fill="#f8fafc" />
      <text x="-4" y="-22" fill="#94a3b8" font-family="IBM Plex Mono, monospace" font-size="10">N</text>
    </g>
    <rect x="20" y="352" width="700" height="54" fill="#0f172a" stroke="#334155" stroke-width="1.2" />
    <text x="34" y="373" fill="#f8fafc" font-family="IBM Plex Mono, monospace" font-size="12" font-weight="600">${escapeXml(cfg.title)} · ${escapeXml(buildingName.toUpperCase())}</text>
    <text x="34" y="393" fill="#94a3b8" font-family="IBM Plex Mono, monospace" font-size="10">${escapeXml(cfg.subtitle)} · ${escapeXml(address)} · Page ${pageNumber}/3</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function buildExteriorPhotoSvgDataUrl(buildingName: string, address: string): string {
  if (
    buildingName.toLowerCase().includes('bradbury') ||
    address.toLowerCase().includes('broadway')
  ) {
    return '/src/assets/images/bradbury_exterior_corner_1792123638843.jpg';
  }
  if (
    buildingName.toLowerCase().includes('ferry') ||
    address.toLowerCase().includes('embarcadero')
  ) {
    return '/src/assets/images/ferry_exterior_clocktower_1792126213230.jpg';
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
    </defs>
    <rect width="640" height="400" fill="url(#sky)" />
    <rect x="0" y="330" width="640" height="70" fill="#18181b" />
    <!-- 4-Story Modern Commercial Building Facade -->
    <rect x="130" y="70" width="380" height="260" fill="#27272a" stroke="#52525b" stroke-width="2" />
    <!-- Roof HVAC Penthouse -->
    <rect x="230" y="42" width="160" height="28" fill="#3f3f46" stroke="#71717a" stroke-width="1.5" />
    <!-- Floors 1-4 Curtain Wall Glazing -->
    ${[0, 1, 2, 3]
      .map((floorIdx) => {
        const y = 265 - floorIdx * 62;
        return `<g>
          <rect x="145" y="${y}" width="350" height="48" fill="#0f172a" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="1" />
          ${[0, 1, 2, 3, 4, 5]
            .map(
              (col) =>
                `<rect x="${150 + col * 57}" y="${y + 3}" width="50" height="42" fill="${
                  floorIdx === 2 && col <= 1 ? 'rgba(239,68,68,0.45)' : 'rgba(56,189,248,0.12)'
                }" stroke="#475569" stroke-width="0.8" />`
            )
            .join('')}
          <text x="95" y="${y + 28}" fill="#94a3b8" font-family="IBM Plex Mono, monospace" font-size="10">L${floorIdx + 1}</text>
        </g>`;
      })
      .join('')}
    <!-- Main South Entrance Canopy -->
    <rect x="260" y="295" width="120" height="35" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5" />
    <rect x="16" y="16" width="608" height="36" rx="4" fill="rgba(9,13,22,0.84)" stroke="#334155" />
    <text x="28" y="38" fill="#f8fafc" font-family="IBM Plex Mono, monospace" font-size="11">EXTERIOR STREET ELEVATION (SOUTH FACADE) · ${escapeXml(buildingName)} · ${escapeXml(address)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createDefaultSceneForBuilding(
  buildingName: string,
  buildingRevision = 1,
  planSourceId = 'src-arch-pdf-1',
  photoSourceId = 'src-ext-photo-1'
): SceneSpec {
  return {
    buildingRevision,
    envelopeId: `env-${buildingRevision}-apex`,
    units: 'meters',
    orientationDeg: 0,
    dimensions: { width: 34, depth: 24, height: 16 },
    facadeSummary: '4-story aluminum-framed double low-E glass curtain wall with precast concrete spandrels',
    roofSummary: 'Flat membrane roof with central HVAC penthouse and West Stair A roof hatch',
    structuralNotes: [
      'Type I-B non-combustible reinforced concrete frame (Documented: Sheet A-201)',
      'Enclosed 2-hour rated stairwells at West (Stair A) and East (Stair B) ends',
      'Pre-action dry-pipe suppression in Server Room 302; wet-pipe on Levels 1, 2, 4',
    ],
    floors: [
      {
        level: 1,
        name: 'Level 1 — Ground Lobby & Command',
        use: 'Commercial Atrium, Fire Command & Service Bay',
        heightMeters: 4.5,
        elevationMeters: 0,
        sourceIds: [
          { sourceId: planSourceId, page: 1 },
          { sourceId: photoSourceId },
        ],
        rooms: [
          {
            id: 'f1-lobby',
            name: 'Main Atrium Lobby 101',
            floor: 1,
            bounds: { x: 2, z: 5, width: 18, depth: 10 },
            type: 'lobby',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f1-corridor', 'f1-command'],
            doors: [
              { id: 'd1-south-main', x: 2, z: 10, orientation: 'ew' },
              { id: 'd1-lobby-corr', x: 2, z: 0, orientation: 'ew', connectsTo: 'f1-corridor' },
            ],
            windows: [{ id: 'w1-south', wall: 'south', offset: 0, width: 14 }],
            sourceIds: [
              { sourceId: planSourceId, page: 1 },
              { sourceId: photoSourceId },
            ],
            materials: ['Polished concrete slab', 'Tempered curtain wall glazing'],
          },
          {
            id: 'f1-command',
            name: 'Fire Command & Security 102',
            floor: 1,
            bounds: { x: -10.5, z: 5, width: 7, depth: 8 },
            type: 'office',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f1-lobby', 'f1-corridor'],
            doors: [{ id: 'd1-cmd', x: -7, z: 2, orientation: 'ns', connectsTo: 'f1-corridor' }],
            windows: [],
            sourceIds: [{ sourceId: planSourceId, page: 1 }],
            materials: ['Gypsum board on metal stud', 'Main fire alarm annunciator panel'],
          },
          {
            id: 'f1-corridor',
            name: 'North Service Corridor 1C',
            floor: 1,
            bounds: { x: 0, z: -2, width: 26, depth: 4 },
            type: 'corridor',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f1-lobby', 'f1-command', 'f1-loading'],
            doors: [{ id: 'd1-north-exit', x: -6, z: -4, orientation: 'ew' }],
            windows: [],
            sourceIds: [{ sourceId: planSourceId, page: 1 }],
          },
          {
            id: 'f1-loading',
            name: 'Loading & 480V Switchgear 104',
            floor: 1,
            bounds: { x: 8, z: -7.5, width: 10, depth: 6 },
            type: 'mechanical',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f1-corridor'],
            doors: [{ id: 'd1-load', x: 8, z: -4.5, orientation: 'ew', connectsTo: 'f1-corridor' }],
            windows: [],
            sourceIds: [{ sourceId: planSourceId, page: 1 }],
            hazards: ['480V main switchgear', 'Standby diesel day-tank (250 gal)'],
          },
        ],
      },
      {
        level: 2,
        name: 'Level 2 — Engineering Offices',
        use: 'Open R&D Engineering Studio',
        heightMeters: 4.0,
        elevationMeters: 4.5,
        sourceIds: [{ sourceId: planSourceId, page: 2 }],
        rooms: [
          {
            id: 'f2-open',
            name: 'Engineering Studio 201',
            floor: 2,
            bounds: { x: -2, z: 5, width: 20, depth: 9 },
            type: 'office',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f2-corridor'],
            doors: [{ id: 'd2-open', x: 0, z: 0.5, orientation: 'ew', connectsTo: 'f2-corridor' }],
            windows: [{ id: 'w2-south', wall: 'south', offset: 0, width: 18 }],
            sourceIds: [{ sourceId: planSourceId, page: 2 }],
          },
          {
            id: 'f2-corridor',
            name: 'Central Spine Corridor 2C',
            floor: 2,
            bounds: { x: 0, z: -1.5, width: 26, depth: 3.5 },
            type: 'corridor',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f2-open', 'f2-mech'],
            doors: [],
            windows: [],
            sourceIds: [{ sourceId: planSourceId, page: 2 }],
          },
          {
            id: 'f2-mech',
            name: 'HVAC & Riser Room 204',
            floor: 2,
            bounds: { x: 8, z: -6.5, width: 9, depth: 5.5 },
            type: 'mechanical',
            uncertainty: 'approximate_geometry',
            connectedRoomIds: ['f2-corridor'],
            doors: [{ id: 'd2-mech', x: 8, z: -3.5, orientation: 'ew', connectsTo: 'f2-corridor' }],
            windows: [],
            sourceIds: [{ sourceId: planSourceId, page: 2 }],
          },
        ],
      },
      {
        level: 3,
        name: 'Level 3 — Server & Battery Labs',
        use: 'Data Center, Prototyping & Battery Testing',
        heightMeters: 4.0,
        elevationMeters: 8.5,
        sourceIds: [
          { sourceId: planSourceId, page: 2 },
          { sourceId: photoSourceId },
        ],
        rooms: [
          {
            id: 'f3-server',
            name: 'Server & UPS Room 302',
            floor: 3,
            bounds: { x: -6.5, z: -5.5, width: 11, depth: 8 },
            type: 'server_room',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f3-corridor'],
            doors: [{ id: 'd3-302', x: -4, z: -1.5, orientation: 'ew', connectsTo: 'f3-corridor' }],
            windows: [{ id: 'w3-north-west', wall: 'north', offset: -6, width: 8 }],
            sourceIds: [
              { sourceId: planSourceId, page: 2 },
              { sourceId: photoSourceId },
            ],
            materials: ['Raised aluminum access floor', 'Acoustic mineral fiber tiles'],
            hazards: ['LiFePO4 UPS battery racks (48 kWh)', 'High-density cable trays'],
          },
          {
            id: 'f3-corridor',
            name: 'Central Spine Corridor 3C',
            floor: 3,
            bounds: { x: 0, z: 0.5, width: 26, depth: 3.5 },
            type: 'corridor',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f3-server', 'f3-east-lab', 'f3-west-storage'],
            doors: [
              { id: 'd3-stair-a', x: -13, z: 0.5, orientation: 'ns' },
              { id: 'd3-stair-b', x: 13, z: 0.5, orientation: 'ns' },
            ],
            windows: [],
            sourceIds: [{ sourceId: planSourceId, page: 2 }],
          },
          {
            id: 'f3-east-lab',
            name: 'East Wing Prototyping Lab 305',
            floor: 3,
            bounds: { x: 6.5, z: 6.5, width: 12, depth: 8 },
            type: 'lab',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f3-corridor'],
            doors: [{ id: 'd3-305', x: 6.5, z: 2.5, orientation: 'ew', connectsTo: 'f3-corridor' }],
            windows: [{ id: 'w3-south-east', wall: 'south', offset: 6, width: 10 }],
            sourceIds: [{ sourceId: planSourceId, page: 2 }],
            materials: ['Interior glazed partition to Corridor 3C', 'Epoxy lab flooring'],
          },
          {
            id: 'f3-west-storage',
            name: 'West Battery Prep Area 301',
            floor: 3,
            bounds: { x: -8.5, z: 6.5, width: 7, depth: 8 },
            type: 'uncertain_area',
            uncertainty: 'uncertain_area',
            connectedRoomIds: ['f3-corridor'],
            doors: [{ id: 'd3-301', x: -8.5, z: 2.5, orientation: 'ew', connectsTo: 'f3-corridor' }],
            windows: [],
            sourceIds: [{ sourceId: planSourceId, page: 2 }],
            hazards: ['Partition layout under recent renovation; exact internal subdivision unconfirmed'],
          },
        ],
      },
      {
        level: 4,
        name: 'Level 4 — Executive & Roof Access',
        use: 'Conference Hall & Mechanical Penthouse',
        heightMeters: 3.5,
        elevationMeters: 12.5,
        sourceIds: [{ sourceId: planSourceId, page: 3 }],
        rooms: [
          {
            id: 'f4-conf',
            name: 'North Conference Hall 401',
            floor: 4,
            bounds: { x: 0, z: -5, width: 22, depth: 7 },
            type: 'office',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f4-corridor'],
            doors: [{ id: 'd4-401', x: 0, z: -1.5, orientation: 'ew', connectsTo: 'f4-corridor' }],
            windows: [{ id: 'w4-north', wall: 'north', offset: 0, width: 18 }],
            sourceIds: [{ sourceId: planSourceId, page: 3 }],
          },
          {
            id: 'f4-corridor',
            name: 'Upper Gallery Corridor 4C',
            floor: 4,
            bounds: { x: 0, z: 0.5, width: 26, depth: 3.5 },
            type: 'corridor',
            uncertainty: 'verified_plan',
            connectedRoomIds: ['f4-conf', 'f4-terrace'],
            doors: [],
            windows: [],
            sourceIds: [{ sourceId: planSourceId, page: 3 }],
          },
          {
            id: 'f4-terrace',
            name: 'South Sky Lobby & HVAC Penthouse 402',
            floor: 4,
            bounds: { x: 0, z: 6, width: 18, depth: 7 },
            type: 'mechanical',
            uncertainty: 'approximate_geometry',
            connectedRoomIds: ['f4-corridor'],
            doors: [{ id: 'd4-402', x: 0, z: 2.5, orientation: 'ew', connectsTo: 'f4-corridor' }],
            windows: [],
            sourceIds: [{ sourceId: planSourceId, page: 3 }],
          },
        ],
      },
    ],
    stairs: [
      {
        id: 'stair-west-a',
        name: 'West Enclosed Stairwell A',
        fromFloor: 1,
        toFloor: 4,
        position: { x: -14.5, z: 0, width: 3.5, depth: 6 },
        sourceIds: [
          { sourceId: planSourceId, page: 1 },
          { sourceId: planSourceId, page: 2 },
          { sourceId: planSourceId, page: 3 },
        ],
      },
      {
        id: 'stair-east-b',
        name: 'East Pressurized Stairwell B',
        fromFloor: 1,
        toFloor: 4,
        position: { x: 14.5, z: 0, width: 3.5, depth: 6 },
        sourceIds: [
          { sourceId: planSourceId, page: 1 },
          { sourceId: planSourceId, page: 2 },
          { sourceId: planSourceId, page: 3 },
        ],
      },
    ],
    fireZones: [
      {
        id: 'fz-302-primary',
        floor: 3,
        roomId: 'f3-server',
        areaLabel: 'Server & UPS Room 302 (Observed Flames & Black Smoke)',
        position: [-6.5, 10.5, -5.5],
        radiusMeters: 4.2,
        hasFlames: true,
        flameIntensity: 0.85,
        smokeDensity: 0.9,
        smokeColor: 'black',
        movementNote: 'Pushing under top of door D3-302 into Central Spine Corridor 3C',
        provenance: 'observation',
        sourceId: planSourceId,
        reportedAt: new Date(Date.now() - 180000).toISOString(),
        buildingRevision,
      },
      {
        id: 'fz-3c-smoke',
        floor: 3,
        roomId: 'f3-corridor',
        areaLabel: 'Central Spine Corridor 3C (Smoke Only — No Flames Reported)',
        position: [-1.0, 10.8, 0.5],
        radiusMeters: 3.6,
        hasFlames: false,
        flameIntensity: 0,
        smokeDensity: 0.65,
        smokeColor: 'gray',
        movementNote: 'Stratifying along ceiling toward East Lab 305',
        provenance: 'observation',
        sourceId: planSourceId,
        reportedAt: new Date(Date.now() - 140000).toISOString(),
        buildingRevision,
      },
    ],
    stagingCandidates: [
      {
        id: 'stg-truck-south',
        type: 'truck_staging',
        label: 'LAFD Aerial Truck 3 Staging — S Broadway Main Entrance Curb',
        coordinates: { lat: 34.0503, lng: -118.2481 },
        localPosition: [-6, 0, 20.5],
        status: 'selected',
        placedBy: 'research_candidate',
        risks: [
          'Deep bracketed terra-cotta cornice & L3 West cast-iron bay window glass above S Broadway sidewalk',
          'Historic Broadway pedestrian & transit corridor clearance',
        ],
        outstandingChecks: [
          'Verify high-flow municipal hydrant at S Broadway & W 3rd St intersection',
          'Confirm aerial turntable clearance beneath overhead streetcar cables',
        ],
        routeDistanceMeters: 1150,
        routeDurationSeconds: 165,
        stationName: 'LAFD Station 3 (Fremont Ave)',
        buildingRevision,
      },
      {
        id: 'stg-truck-west',
        type: 'truck_staging',
        label: 'LAFD Engine 9 Staging — W 3rd St Sandstone Base & Dual FDC Apron',
        coordinates: { lat: 34.0507, lng: -118.2476 },
        localPosition: [-25.5, 0, 1.5],
        status: 'candidate',
        placedBy: 'research_candidate',
        risks: ['Narrow service curb along W 3rd Street adjacent to steel service doors'],
        outstandingChecks: ['Charge dual brass Siamese FDC AUTO SPKR STANDPIPE on W 3rd St sandstone wall'],
        routeDistanceMeters: 980,
        routeDurationSeconds: 140,
        stationName: 'LAFD Station 9 (7th & Towne)',
        buildingRevision,
      },
      {
        id: 'stg-med-east',
        type: 'medical_post',
        label: 'EMS Field Triage & Rescue Post — S Broadway East Upwind Apron',
        coordinates: { lat: 34.0501, lng: -118.2484 },
        localPosition: [13.5, 0, 20.5],
        status: 'selected',
        placedBy: 'research_candidate',
        risks: ['Monitor WSW wind gusts (31 km/h); positioned upwind of L3 West smoke plume'],
        outstandingChecks: ['Maintain clear LAFD Rescue Ambulance egress lane on W 3rd St'],
        routeDistanceMeters: 1150,
        routeDurationSeconds: 165,
        stationName: 'LAFD Rescue 3 / Downtown EMS',
        buildingRevision,
      },
    ],
    quarantinedItems: [],
    scenarioAssumptions: {
      fuelAssumptions:
        'Assumes high synthetic polymer cable insulation & 48 kWh LiFePO4 UPS rack load in L3 Server Room 302 (Sheet A-103).',
      openingsAssumptions:
        'Assumes Door D3-302 is partially unlatched (per caller observation of smoke entering Corridor 3C); Stairwell A & B fire doors assumed closed.',
      compartmentAssumptions:
        'Assumes 1-hour rated corridor partitions on Level 3, except unverified glass partition along East Wing Prototyping Lab 305.',
      suppressionAssumptions:
        'Assumes pre-action dry-pipe system in Room 302 has NOT discharged (caller heard alarm bells only, no water flow observed).',
      ventilationAssumptions:
        'Outdoor WNW/WSW wind (22 km/h) cannot alone establish indoor smoke flow unless L3 West mullioned glazing fails; scenario models internal buoyancy-driven corridor spread first.',
    },
  };
}

export function createInitialIncidentState(): IncidentState {
  const buildingName = 'The Bradbury Building (304 S Broadway)';
  const address = '304 S Broadway, Los Angeles, CA 90013';
  const pdfBytes = buildRealArchitecturalPdfBytes(buildingName, address);
  const sha256 = crypto.createHash('sha256').update(pdfBytes).digest('hex').slice(0, 16);

  const planSource: SourceDocument = {
    id: 'src-arch-pdf-1',
    title: 'HABS & LADBS Architectural Plan Set A-101..A-201 (PDF, 4 Sheets)',
    originalTitle: '304_S_Broadway_Bradbury_Building_Plans_L1_L4.pdf',
    url: '/api/evidence/pdf?building=The%20Bradbury%20Building%20(304%20S%20Broadway)',
    mimeType: 'application/pdf',
    status: 'applied',
    byteLength: pdfBytes.byteLength,
    sha256,
    pageCount: 4,
    matchedFloor: 3,
    sourceDate: '2024-09-12',
    previewUrl: buildPlanPageSvgDataUrl(buildingName, 3, address),
    pages: [
      {
        pageNumber: 1,
        label: 'Level 1 — Brownstone Arcade Entrance 101, Fire Command 102 & W 3rd St Service Bay 104',
        svgDataUrl: buildPlanPageSvgDataUrl(buildingName, 1, address),
        extractedSummary:
          '34m x 24m footprint. Arched Arizona brownstone sandstone entrance on S Broadway, Skylit Central Atrium Court (101), Fire Command (102), W 3rd St Service Bay & 480V Switchgear (104), Cast-Iron Stairs A (West) & B (East).',
      },
      {
        pageNumber: 2,
        label: 'Level 2 — Open Atrium Balcony Gallery, Media Loft 201 & Telecom IDF 202',
        svgDataUrl: buildPlanPageSvgDataUrl(buildingName, 2, address),
        extractedSummary:
          'Level 2 (+4.5m): Open Design Loft Studio 201 (20m x 9m) overlooking the central skylit court, perimeter Roman brick piers, Gallery Corridor 2C, and North Telecom IDF 202.',
      },
      {
        pageNumber: 3,
        label: 'Level 3 — Server & Media Vault 302, Gallery Corridor 3C & East Architecture Studio 305',
        svgDataUrl: buildPlanPageSvgDataUrl(buildingName, 3, address),
        extractedSummary:
          'Level 3 (+8.5m, Fire Origin Floor): Server & UPS Vault 302 (11m x 8m, NW bay) opens to Gallery Corridor 3C (26m x 3.5m). East Architecture Studio 305 (12m x 9m, SE) has interior glass wall to 3C. West Room 301 under renovation.',
      },
      {
        pageNumber: 4,
        label: 'Level 4 — Peaked Victorian Glass Atrium Skylight, Terra-Cotta Cornice & Roof HVAC',
        svgDataUrl: buildPlanPageSvgDataUrl(buildingName, 4, address),
        extractedSummary:
          'Level 4 (+12.5m) & Roof (+16.0m): Pressed Roman brick load-bearing piers, carved terra-cotta cornice, central peaked Victorian glass-and-steel skylight over the atrium, and rooftop HVAC chillers.',
      },
    ],
    extractedElements: [
      'f1-lobby',
      'f1-command',
      'f1-corridor',
      'f1-loading',
      'f2-open',
      'f2-corridor',
      'f3-server',
      'f3-corridor',
      'f3-east-lab',
      'f3-west-storage',
      'stair-west-a',
      'stair-east-b',
    ],
    buildingRevision: 1,
  };

  const photoSource: SourceDocument = {
    id: 'src-ext-photo-1',
    title: '304 S Broadway & W 3rd St Exterior Elevation & Cladding Survey',
    originalTitle: '304_S_Broadway_Bradbury_Facade_Survey.jpg',
    url: '/src/assets/images/bradbury_exterior_corner_1792123638843.jpg',
    mimeType: 'image/jpeg',
    status: 'applied',
    byteLength: 184680,
    sha256: '9f4c2e81b03d7a14',
    sourceDate: '2025-11-04',
    previewUrl: '/src/assets/images/bradbury_exterior_corner_1792123638843.jpg',
    extractedElements: ['f1-lobby', 'f3-server'],
    buildingRevision: 1,
  };

  const personEntries = [
    {
      id: 'pe-floor3-lab',
      label: '2 architects seen behind glass partition in East Studio 305',
      count: 2,
      floor: 3,
      roomId: 'f3-east-lab',
      areaLabel: 'East Studio 305 (Floor 3)',
      position: [6.5, 9.5, 6.5] as [number, number, number],
      mobilityOrInjury: 'Coughing from atrium gallery smoke; waving near SE bay window',
      lastKnownTime: '14:12',
      provenance: 'observation' as const,
      sourceId: 'src-arch-pdf-1',
      buildingRevision: 1,
    },
    {
      id: 'pe-floor1-lobby',
      label: '1 security concierge reported on Floor 1 (exact room unconfirmed)',
      count: 1,
      floor: 1,
      areaLabel: 'Floor 1 (Floor-only report)',
      position: [-4, 1.0, 4] as [number, number, number],
      lastKnownTime: '14:10',
      provenance: 'relayed' as const,
      buildingRevision: 1,
    },
    {
      id: 'pe-unknown-loc',
      label: '2 skylight restoration contractors on lobby sign-in log (location unknown)',
      count: 2,
      floor: undefined,
      areaLabel: 'Unknown floor / location in building',
      lastKnownTime: '13:45 visitor log',
      provenance: 'relayed' as const,
      buildingRevision: 1,
    },
  ];

  const peopleSummary = reconcilePeopleSummary(personEntries, 1, 5);
  const scene = createDefaultSceneForBuilding(buildingName, 1, planSource.id, photoSource.id);

  const initialTrace: ResearchTraceData = {
    runId: 'trace-run-initial-1',
    buildingRevision: 1,
    clueTrigger: 'Caller reported structure fire at "The Bradbury Building, 304 S Broadway & W 3rd St, Los Angeles"',
    status: 'completed',
    startedAt: new Date(Date.now() - 165000).toISOString(),
    completedAt: new Date(Date.now() - 110000).toISOString(),
    branches: [
      {
        id: 'identity_geo',
        title: 'Identity & Geography',
        subagentName: 'Geo-Identity Subagent',
        status: 'completed',
        summary: 'Matched 304 S Broadway & W 3rd St (34.0505°N, 118.2479°W) · LAFD Sta 3 (2m) & Sta 9 (3m)',
        sourceIds: ['src-ext-photo-1'],
        findings: [
          'Verified landmark match: **The Bradbury Building (304 S Broadway)**, corner of S Broadway & W 3rd St, Historic Core, Los Angeles, CA 90013.',
          'Primary apparatus access via **South Broadway** (Main Entrance & Aerial Truck Staging) and **W 3rd Street** (Sandstone service wall & Dual Siamese FDC standpipe).',
          'Nearest stations: **LAFD Station 3** (1.1 km, ~2.5 min drive) and **LAFD Station 9** (0.98 km, ~2 min drive).',
        ],
        steps: [
          {
            id: 'st-geo-1',
            label: 'Geocode "304 S Broadway, Los Angeles, CA 90013" & resolve parcel footprint',
            status: 'completed',
            toolName: 'maps.geocode + places.searchText',
            detail: 'Resolved 34.0505° N, 118.2479° W (ROOFTOP precision)',
            timestamp: new Date(Date.now() - 162000).toISOString(),
          },
          {
            id: 'st-geo-2',
            label: 'Compute LAFD apparatus approach routes & staging aprons',
            status: 'completed',
            toolName: 'routes.computeRoutes',
            detail: 'Computed driving routes from LAFD Station 3 & Station 9',
            timestamp: new Date(Date.now() - 150000).toISOString(),
          },
        ],
      },
      {
        id: 'building_specs',
        title: 'Building Specifications & Cladding',
        subagentName: 'Structural & Facade Subagent',
        status: 'completed',
        summary: '1893 Landmark Roman Brick, Brownstone & Cast-Iron Atrium Building (34m × 24m, 16m height)',
        sourceIds: ['src-arch-pdf-1', 'src-ext-photo-1'],
        findings: [
          'Historic Italian Renaissance Revival commercial landmark (**34.0m E-W × 24.0m N-S**, height **16.0m** with central skylit court).',
          'Exterior Cladding: **Rusticated Arizona brownstone sandstone ground arcade**, **pressed Roman red-orange brick piers**, **carved terra-cotta floral spandrels**, **dark cast-iron projecting bay windows**, and **peaked Victorian glass atrium skylight**.',
          'West Room 301 on Level 3 has an active interior alteration permit; exact partition layout marked **uncertain**.',
        ],
        steps: [
          {
            id: 'st-bldg-1',
            label: 'Query HABS / LADBS parcel record & architectural facade survey',
            status: 'completed',
            toolName: 'argon.searchGrounding',
            detail: 'Retrieved HABS / LADBS Plan Set A-101..A-201 (304 S Broadway)',
            timestamp: new Date(Date.now() - 158000).toISOString(),
            sourceIds: ['src-arch-pdf-1'],
          },
        ],
      },
      {
        id: 'images_plans',
        title: 'Original Images & Floor Plans',
        subagentName: 'Multimodal Plan & Photo Subagent',
        status: 'completed',
        summary: 'Ingested 4 photorealistic exterior captures + 4 floor plan sheets (L1–L4) · 10 rooms & 2 stairs',
        sourceIds: ['src-arch-pdf-1', 'src-ext-photo-1'],
        findings: [
          `Fetched 4-sheet architectural PDF (**${pdfBytes.byteLength} bytes**, SHA-256 \`${sha256}\`) and 4 street/aerial reference photographs.`,
          'Extracted L1–L4 interior geometry and mapped exterior Roman brick piers, brownstone arches, cast-iron bay windows, and central glass skylight.',
          'Validated merged 3D scene: finite coordinates, verified bounds, zero duplicate envelopes.',
        ],
        steps: [
          {
            id: 'st-plan-1',
            label: 'Retrieve raw bytes for 304_S_Broadway_Bradbury_Building_Plans_L1_L4.pdf',
            status: 'completed',
            toolName: 'http.fetchBytes',
            detail: `application/pdf · ${pdfBytes.byteLength} bytes · 4 sheets (L1–L4)`,
            timestamp: new Date(Date.now() - 145000).toISOString(),
            sourceIds: ['src-arch-pdf-1'],
          },
          {
            id: 'st-plan-2',
            label: 'Multimodal exterior cladding & interior floor plan synthesis (gemini-4-argon)',
            status: 'completed',
            toolName: 'argon.analyzeMultimodalScene',
            detail: 'Synthesized 4 floors, Roman brick/brownstone/cast-iron shell, 10 rooms & 2 stairwells',
            timestamp: new Date(Date.now() - 120000).toISOString(),
            sourceIds: ['src-arch-pdf-1', 'src-ext-photo-1'],
          },
        ],
      },
      {
        id: 'materials_systems',
        title: 'Materials, Hazards & Systems',
        subagentName: 'Systems & Hazmat Subagent',
        status: 'completed',
        summary: 'Roman brick piers · Central glass skylight chimney risk · 48 kWh LiFePO4 UPS in L3 Rm 302',
        sourceIds: ['src-arch-pdf-1', 'src-ext-photo-1'],
        findings: [
          'Exterior & Atrium Materials: **Pressed Roman brick piers**, **brownstone sandstone base**, **cast-iron bay windows**, and **central peaked glass skylight** over the open atrium.',
          'Documented Hazards (**Sheet A-103**): **48 kWh LiFePO4 UPS battery banks** in L3 Server & Media Vault 302; **480V main switchgear** in L1 Room 104.',
          'Suppression: **Pre-action dry-pipe system** in Room 302; wet-pipe sprinklers on perimeter galleries; dual brass Siamese FDC on W 3rd St sandstone wall.',
        ],
        steps: [
          {
            id: 'st-mat-1',
            label: 'Cross-check exterior cladding photos & MEP schedule on Sheet A-201',
            status: 'completed',
            toolName: 'argon.inspectSystems',
            detail: 'Mapped brick/brownstone/cast-iron exterior & L3 LiFePO4 battery hazard',
            timestamp: new Date(Date.now() - 125000).toISOString(),
            sourceIds: ['src-arch-pdf-1', 'src-ext-photo-1'],
          },
        ],
      },
      {
        id: 'weather',
        title: 'Local Weather Observation',
        subagentName: 'Meteorological Subagent',
        status: 'completed',
        summary: '22.4°C · 48% RH · Wind FROM WSW (245°) at 19 km/h (gusts 31 km/h)',
        sourceIds: [],
        findings: [
          'Observed at Historic Core / Downtown Los Angeles (34.0505, -118.2479): **22.4°C**, **48% relative humidity**, Clear / Afternoon Breeze.',
          'Wind blowing **FROM WSW (245°)** — pushing exterior smoke plume toward **ENE (65°)** across S Broadway at **19 km/h** (gusts 31 km/h).',
        ],
        steps: [
          {
            id: 'st-wx-1',
            label: 'Lookup real-time Downtown LA wind & weather at 34.0505, -118.2479',
            status: 'completed',
            toolName: 'weather.currentConditions',
            detail: '22.4°C · RH 48% · WSW 19 km/h',
            timestamp: new Date(Date.now() - 148000).toISOString(),
          },
        ],
      },
    ],
  };

  const tBase = Date.now() - 190000;

  return {
    id: 'inc-bradbury-la-304',
    shareToken: 'fs-bradbury-304-la',
    shareExpiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    revision: 5,
    buildingRevision: 1,
    title: 'The Bradbury Building (304 S Broadway) — Level 3 Server & Vault Fire',
    status: 'monitoring',
    callState: {
      active: true,
      muted: false,
      startedAt: new Date(tBase).toISOString(),
      callerLocation: 'Evacuated via West Cast-Iron Stair A to S Broadway sidewalk (safe outside)',
      callerRelationship: 'Building Operations & Studio Manager (Direct witness)',
      questionsAskedCount: 3,
    },
    building: {
      name: buildingName,
      address,
      coordinates: { lat: 34.0505, lng: -118.2479 },
      placeId: 'ChIJ_Bradbury_304SBroadway_LA',
      googleMapsUri:
        'https://www.google.com/maps/search/?api=1&query=The+Bradbury+Building+304+S+Broadway+Los+Angeles+CA+90013&utm_campaign=gmp_mcp_codeassist_v1_aistudio',
      use: 'Historic Landmark Atrium, Media & Architecture Studios, Ground Retail',
      floorCount: 4,
      heightMeters: 16,
      constructionType: '1893 Pressed Roman Brick, Arizona Brownstone Sandstone, Cast-Iron & Peaked Glass Skylight Atrium',
      renovationNotes: 'West Room 301 on Level 3 has unverified 2025 renovation partitions',
      nearbyStations: [
        {
          id: 'st-lafd-3',
          name: 'LAFD Fire Station 3 (Downtown Command)',
          address: '108 N Fremont Ave, Los Angeles, CA 90012',
          coordinates: { lat: 34.0568, lng: -118.2535 },
          distanceMeters: 1150,
          durationSeconds: 165,
          googleMapsUri:
            'https://www.google.com/maps/dir/?api=1&origin=34.0568,-118.2535&destination=34.0505,-118.2479&travelmode=driving&utm_campaign=gmp_mcp_codeassist_v1_aistudio',
        },
        {
          id: 'st-lafd-9',
          name: 'LAFD Fire Station 9 (Historic Core / Skid Row)',
          address: '430 E 7th St, Los Angeles, CA 90014',
          coordinates: { lat: 34.0419, lng: -118.2468 },
          distanceMeters: 980,
          durationSeconds: 140,
          googleMapsUri:
            'https://www.google.com/maps/dir/?api=1&origin=34.0419,-118.2468&destination=34.0505,-118.2479&travelmode=driving&utm_campaign=gmp_mcp_codeassist_v1_aistudio',
        },
      ],
      accessRoads: [
        'South Broadway (Main Brownstone Arched Entrance & LAFD Truck 3 Staging)',
        'W 3rd Street (Rusticated Sandstone Service Wall & Dual Brass Siamese FDC)',
        'W 3rd & Broadway Upwind Intersection (EMS Triage & Rescue Post)',
      ],
    },
    facts: [
      {
        id: 'fact-loc-1',
        category: 'location',
        statement:
          'The Bradbury Building (304 S Broadway & W 3rd St, Los Angeles) — Level 3 Server & Media Vault 302.',
        provenance: 'observation',
        confidence: 'confirmed_report',
        floor: 3,
        roomId: 'f3-server',
        areaLabel: 'Server & Media Vault 302',
        reportedBy: 'Caller (Maya Lin, Studio Manager)',
        createdAt: new Date(tBase + 5000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'fact-fire-1',
        category: 'fire_smoke',
        statement:
          'Active orange flames at LiFePO4 UPS battery rack in Room 302; thick black smoke pushing into Gallery Corridor 3C and venting from L3 West cast-iron bay window.',
        provenance: 'observation',
        confidence: 'confirmed_report',
        floor: 3,
        roomId: 'f3-server',
        areaLabel: 'Server Room 302 & Gallery Corridor 3C',
        reportedBy: 'Caller (Maya Lin)',
        createdAt: new Date(tBase + 15000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'fact-people-1',
        category: 'people_life_risk',
        statement:
          '5 people unaccounted for in total: 2 architects directly seen in 3rd floor East Studio 305 behind glass; 1 concierge relayed on Floor 1 (room unknown); 2 skylight contractors on sign-in log with unknown floor/location.',
        provenance: 'observation',
        confidence: 'confirmed_report',
        floor: 3,
        roomId: 'f3-east-lab',
        areaLabel: 'East Studio 305 (2 seen) + Floor 1 (1 relayed) + Unknown (2)',
        reportedBy: 'Caller (Maya Lin)',
        createdAt: new Date(tBase + 35000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'fact-haz-1',
        category: 'hazards',
        statement:
          '48 kWh LiFePO4 UPS battery banks in Room 302; central skylit atrium vertical smoke draft risk; ornamental terra-cotta cornice overhang on S Broadway.',
        provenance: 'document',
        confidence: 'confirmed_report',
        floor: 3,
        roomId: 'f3-server',
        sourceId: 'src-arch-pdf-1',
        sourcePage: 3,
        reportedBy: 'Argon Plan & Facade Analysis',
        createdAt: new Date(tBase + 65000).toISOString(),
        buildingRevision: 1,
      },
    ],
    peopleSummary,
    sources: [planSource, photoSource],
    scene,
    weather: {
      temperatureCelsius: 22.4,
      relativeHumidity: 48,
      windSpeedKmh: 19,
      windGustKmh: 31,
      windDirectionFromDeg: 245,
      windCardinalFrom: 'WSW',
      conditionText: 'Clear / Downtown Breeze',
      conditionType: 'CLEAR',
      precipitationText: '0.0 mm (Dry)',
      placeName: 'Historic Core / 304 S Broadway, Los Angeles, CA',
      observationTime: new Date(Date.now() - 300000).toISOString(),
      sourceName: 'Google Maps Weather API',
      sourceUrl:
        'https://developers.google.com/maps/documentation/weather?utm_campaign=gmp_mcp_codeassist_v1_aistudio',
      buildingRevision: 1,
    },
    timeline: [
      {
        id: 'evt-call-1',
        type: 'caller_utterance',
        speaker: 'Caller (Maya Lin)',
        speakerRole: 'caller',
        text: "I'm reporting a fire inside The Bradbury Building at 304 South Broadway at the corner of West 3rd Street in Downtown Los Angeles! A lithium UPS battery rack in Server & Media Vault 302 on the 3rd floor burst into flames, and thick black smoke is pouring along the 3rd floor gallery and out the West bay windows!",
        createdAt: new Date(tBase + 4000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'evt-ct-1',
        type: 'call_taker_utterance',
        speaker: 'AI Call-Taker',
        speakerRole: 'call_taker',
        text: 'I have **The Bradbury Building (304 S Broadway)** at W 3rd Street, Level 3 **Server & Media Vault 302**, and I am glad you evacuated safely. Are there still people inside the building?',
        createdAt: new Date(tBase + 11000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'evt-trace-1',
        type: 'research_trace',
        speaker: 'FireSight Research Agents',
        speakerRole: 'research_orchestrator',
        text: 'Resolved **The Bradbury Building (304 S Broadway, Los Angeles)** rooftop parcel (`34.0505° N, 118.2479° W`), ingested **4 photorealistic street & aerial captures** (pressed Roman brick piers, Arizona brownstone arches, cast-iron bay windows, central peaked glass skylight, W 3rd St dual FDC), extracted **L1–L4 HABS floor plans**, and mapped **LAFD Station 3 & 9** approaches.',
        createdAt: new Date(tBase + 14000).toISOString(),
        buildingRevision: 1,
        traceData: initialTrace,
      },
      {
        id: 'evt-call-2',
        type: 'caller_utterance',
        speaker: 'Caller (Maya Lin)',
        speakerRole: 'caller',
        text: 'Yes—5 people total are still unaccounted for! Before I ran down the West Stairwell, I saw 2 architects inside East Studio 305 waving behind the interior glass wall because Gallery Corridor 3C is filling with black smoke. Also, 1 concierge was on Level 1, and 2 skylight contractors signed in earlier—I do not know which floor they are on.',
        createdAt: new Date(tBase + 32000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'evt-ct-2',
        type: 'call_taker_utterance',
        speaker: 'AI Call-Taker',
        speakerRole: 'call_taker',
        text: 'Logged **5 people total**: **2 observed** in Level 3 East Studio 305, **1 reported** on Level 1, and **2 contractors** at unknown locations. Did you hear sprinklers activating in Room 302, or see smoke rising into the central skylit atrium?',
        createdAt: new Date(tBase + 42000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'evt-model-1',
        type: 'model_update',
        speaker: 'Argon Spatial Modeler',
        speakerRole: 'firesight_ai',
        text: 'Reconstructed the 3D architectural exterior of **The Bradbury Building** (pressed Roman brick piers, brownstone ground arches, projecting cast-iron bay windows, peaked Victorian glass atrium skylight) and interior floor plans (L1–L4), plus 3D LAFD Aerial Ladder Truck & + EMS Triage Post.',
        createdAt: new Date(tBase + 70000).toISOString(),
        buildingRevision: 1,
        modelUpdate: {
          updateId: 'mu-rev1-1',
          buildingRevision: 1,
          summary:
            'Synthesized **Bradbury Roman Brick, Brownstone & Skylight 3D Exterior + L1–L4 Rooms** · Placed **3D LAFD Truck 3** on S Broadway & **+ EMS Triage Post** at W 3rd',
          focusElementId: 'f3-server',
          focusFloor: 3,
          sourceRefs: [
            { sourceId: 'src-arch-pdf-1', title: '304_S_Broadway_Bradbury_Plans_L1_L4.pdf', page: 3 },
            { sourceId: 'src-ext-photo-1', title: '304_S_Broadway_Bradbury_Facade_Survey.jpg' },
          ],
          quarantinedCount: 0,
        },
      },
      {
        id: 'evt-ai-initial-1',
        type: 'ai_answer',
        speaker: 'FireSight',
        speakerRole: 'firesight_ai',
        text: [
          '### The Bradbury Building (304 S Broadway) — Architectural & Tactical Synthesis',
          'Cross-referenced **Caller Maya Lin’s** observations with **HABS / LADBS Plan Set A-101..A-201** and street-level facade photography (`REV #1`):',
          '',
          '| Compartment | Observed State | Material & Tactical Note |',
          '| :--- | :--- | :--- |',
          '| **L3 Vault 302** (`f3-server`) | **Flames + Black Smoke** | Roman brick pier & cast-iron bay · **48 kWh LiFePO4 UPS** |',
          '| **L3 Gallery 3C** (`f3-corridor`) | **Smoke Only** (No Flames) | Borders central skylit atrium; smoke banking east |',
          '| **L3 East Studio 305** (`f3-east-lab`) | **2 Architects Seen** | SE brick corner · Rescue via **East Stair B** |',
          '| **L3 West Room 301** (`f3-west-storage`) | **Uncertain Layout** | SW corner bay · 2025 permit unverified |',
          '| **L1 Atrium Lobby** (`f1-lobby`) | **1 Concierge Relayed** | Arched brownstone base · **480V** in W 3rd bay |',
          '| **Unknown Floor** | **2 Contractors** | Visitor log only; not placed on 3D floor |',
        ].join('\n'),
        createdAt: new Date(tBase + 85000).toISOString(),
        buildingRevision: 1,
        sourceCitations: [
          { sourceId: 'src-arch-pdf-1', title: 'HABS / LADBS Plan Set A-101..A-201 (PDF)', page: 3, elementId: 'f3-server' },
          { sourceId: 'src-ext-photo-1', title: '304 S Broadway Exterior Survey' },
        ],
        considerationsForDispatch: [
          '**Primary Rescue Access**: **East Enclosed Stairwell B** (`stair-east-b`) off W 3rd St connects directly to the East end of Gallery 3C adjacent to **East Studio 305** (2 observed architects).',
          '**Atrium Skylight & Staging**: **LAFD Truck 3** staged on S Broadway apron; monitor **central peaked glass skylight** for vertical smoke accumulation and watch **terra-cotta cornice** above West bay.',
        ],
      },
      {
        id: 'evt-field-1',
        type: 'field_report',
        speaker: 'LAFD Engine 3 · Capt. Rivera',
        speakerRole: 'responder',
        text: 'On scene at 304 S Broadway & W 3rd St. Heavy black smoke pushing from 3rd floor corner cast-iron bay window of the Bradbury Building. Staged Engine 3 & Truck 3 on S Broadway; charging dual brass FDC on W 3rd St sandstone wall.',
        createdAt: new Date(tBase + 115000).toISOString(),
        captureTime: new Date(tBase + 110000).toISOString(),
        buildingRevision: 1,
        fieldReport: {
          reportId: 'fr-initial-1',
          reporterName: 'LAFD Engine 3 · Capt. Rivera',
          captureTime: new Date(tBase + 110000).toISOString(),
          publishedAt: new Date(tBase + 115000).toISOString(),
          floor: 3,
          roomId: 'f3-server',
          placeLabel: '304 S Broadway & W 3rd Corner viewing L3 Cast-Iron Bay',
          humanDescription:
            'On scene at 304 S Broadway (The Bradbury Building). Heavy black smoke venting from L3 corner cast-iron bay window above the brownstone entrance arch. Pressed Roman brick piers intact. Charging dual brass FDC standpipe on W 3rd St.',
          aiVisualSummary:
            'Matches **Level 3 Server & Media Vault 302** West bay window on **Sheet A-103**. Roman brick pier and carved terra-cotta spandrel intact.',
          photoDataUrl: '/src/assets/images/responder_scene_camera_1792123645217.jpg',
          deliveryStatus: 'delivered',
          linkedElementId: 'f3-server',
          buildingRevision: 1,
        },
      },
      {
        id: 'evt-field-2',
        type: 'field_report',
        speaker: 'LAFD Truck 3 · Capt. Chen',
        speakerRole: 'responder',
        text: 'Aerial ladder tip positioned at Level 3 West cast-iron bay window! Active orange flames blowing out of Server Vault 302; applying elevated master stream while Interior Rescue Team advances via East Stair B toward Studio 305 for the 2 trapped architects.',
        createdAt: new Date(tBase + 145000).toISOString(),
        captureTime: new Date(tBase + 142000).toISOString(),
        buildingRevision: 1,
        fieldReport: {
          reportId: 'fr-initial-2',
          reporterName: 'LAFD Truck 3 · Capt. Chen',
          captureTime: new Date(tBase + 142000).toISOString(),
          publishedAt: new Date(tBase + 145000).toISOString(),
          floor: 3,
          roomId: 'f3-server',
          placeLabel: 'L3 West Cast-Iron Bay Window — Exterior Flame Blow-Out',
          humanDescription:
            'Window glass failed on Level 3 cast-iron bay; heavy orange flame roll-out licking up the pressed Roman brick spandrel toward Level 4. LAFD Truck 3 aerial ladder stream suppressing exterior lap-over while Rescue 3 enters East Studio 305.',
          aiVisualSummary:
            'Confirms exterior window auto-exposure hazard from **Room 302 (`f3-server`)** toward **Level 4 Conference Hall 401**. Verify 1-hour progression slider for unchecked upper-floor & skylight spread.',
          photoDataUrl: '/src/assets/images/bradbury_responder_blowout_photo_1792126218687.jpg',
          deliveryStatus: 'delivered',
          linkedElementId: 'f3-server',
          buildingRevision: 1,
        },
      },
    ],
  };
}

/**
 * Creates a clean Empty Standby Incident State for starting demo recordings from an empty workspace & chat.
 */
export function createEmptyStandbyIncidentState(): IncidentState {
  const now = new Date().toISOString();
  return {
    id: 'inc-standby-empty',
    shareToken: 'fs-standby-demo',
    shareExpiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    revision: 1,
    buildingRevision: 1,
    title: 'Standby — Awaiting 911 Emergency Call Intake',
    status: 'standby',
    demoScenarioId: 'standby',
    demoRunning: false,
    demoStepIndex: 0,
    demoTotalSteps: 8,
    callState: {
      active: false,
      muted: false,
      questionsAskedCount: 0,
    },
    building: null,
    facts: [],
    peopleSummary: reconcilePeopleSummary([], 1, 0),
    sources: [],
    scene: {
      buildingRevision: 1,
      envelopeId: 'env-standby-1',
      units: 'meters',
      orientationDeg: 0,
      dimensions: { width: 34, depth: 24, height: 16 },
      facadeSummary: 'Awaiting building identification and multimodal research',
      roofSummary: 'Awaiting aerial and architectural plan verification',
      structuralNotes: ['Launch Demo Scenario 1 (Mockup Asset Demo) or Demo Scenario 2 (Live AI Research Demo) to begin'],
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
    },
    weather: {
      temperatureCelsius: null,
      relativeHumidity: null,
      windSpeedKmh: null,
      windGustKmh: null,
      windDirectionFromDeg: null,
      windCardinalFrom: null,
      conditionText: 'Standby',
      conditionType: 'CLEAR',
      precipitationText: null,
      placeName: 'Awaiting Incident Coordinates',
      observationTime: now,
      sourceName: 'Google Maps Weather API',
      sourceUrl: null,
      buildingRevision: 1,
    },
    timeline: [],
  };
}

/**
 * Creates the complete San Francisco Ferry Building ("Live AI Research Demo") incident state
 * at 1 Ferry Building, The Embarcadero, San Francisco, CA 94111.
 */
export function createFerryBuildingIncidentState(): IncidentState {
  const baseBradbury = createInitialIncidentState();
  const buildingName = 'San Francisco Ferry Building';
  const address = '1 Ferry Building, The Embarcadero, San Francisco, CA 94111';
  const pdfBytes = buildRealArchitecturalPdfBytes(buildingName, address);
  const pdfSha256 = crypto.createHash('sha256').update(pdfBytes).digest('hex');
  const tBase = Date.now() - 120000;

  const planSource: SourceDocument = {
    id: 'src-arch-pdf-1',
    title: '1_Ferry_Building_SF_Nave_Plans_A101_A104.pdf',
    originalTitle:
      'Port of San Francisco Historic Engineering Archive — Ferry Building Grand Nave & Mezzanine Plans (Sheets A-101 to A-104)',
    url: '/api/sources/src-arch-pdf-1/raw.pdf',
    mimeType: 'application/pdf',
    status: 'applied',
    byteLength: pdfBytes.byteLength,
    sha256: pdfSha256,
    pageCount: 4,
    sourceDate: '2024-09-12',
    previewUrl: '/src/assets/images/ferry_floorplan_l2_1792126216995.jpg',
    pages: [
      {
        pageNumber: 1,
        label: 'Level 1 — Embarcadero Arched Marketplace Arcade & Ferry Terminal Concourse',
        svgDataUrl: buildPlanPageSvgDataUrl(buildingName, 1, address),
        extractedSummary:
          'Level 1 (Elev +0.0m, Height 4.2m): 660ft Grand Marketplace Nave (`f1-lobby`), Fire Command & Port Security (`f1-command`), North Pier 14 Service Corridor (`f1-corridor`), Bay Switchgear & FDC Vault (`f1-loading`), West Stair A & East Stair B.',
      },
      {
        pageNumber: 2,
        label: 'Level 2 — Grand Nave Mezzanine Gallery, North Vault 204 & Clock Tower Lab 208',
        svgDataUrl: '/src/assets/images/ferry_floorplan_l2_1792126216995.jpg',
        extractedSummary:
          'Level 2 (Elev +4.2m, Height 4.0m): North Electrical & Commercial Kitchen Vault 204 (`f3-server`), Central Skylit Nave Gallery (`f3-corridor`), East Clock Tower Marine Lab 208 (`f3-east-lab`), West Mezzanine Suite (`f3-west-storage`).',
      },
      {
        pageNumber: 3,
        label: 'Level 3 — Port Commission Offices, Clock Tower Pedestal & Nave Skylight Trusses',
        svgDataUrl: '/src/assets/images/ferry_floorplan_l2_1792126216995.jpg',
        extractedSummary:
          'Level 3 (Elev +8.2m, Height 4.0m): Upper Nave Truss Gallery, North Transformer Vault 302 (`f3-server`), Central Spine Gallery (`f3-corridor`), and East Clock Tower Suite 305 (`f3-east-lab`, 2 trapped staff waving at window).',
      },
      {
        pageNumber: 4,
        label: 'Level 4 — 245ft Central Clock Tower Belfry, Peaked Glass Skylight Monitor & Roof HVAC',
        svgDataUrl: buildPlanPageSvgDataUrl(buildingName, 4, address),
        extractedSummary:
          'Level 4 (Elev +12.2m, Height 3.8m): Central Clock Tower Pedestal & Mechanical Room (`f4-conf`), Peaked Steel-and-Glass Skylight Monitor (`f4-corridor`), and Bay Roof Deck (`f4-terrace`).',
      },
    ],
    extractedElements: [
      'Envelope: Colusa Gray Sandstone Beaux-Arts Arched Facade & 245ft Central Clock Tower',
      'Level 3 North Vault 302 / 204 (f3-server, High-Voltage Transformer & Battery Bank)',
      'Level 3 Central Grand Nave Gallery (f3-corridor, Open Steel-and-Glass Skylit Atrium)',
      'Level 3 East Clock Tower Suite 305 / 208 (f3-east-lab, 2 Trapped Staff Waving at Window)',
      'West Stairwell A (stair-west-a) & East Pressurized Stairwell B (stair-east-b)',
    ],
    buildingRevision: 1,
  };

  const photoSource: SourceDocument = {
    id: 'src-ext-photo-1',
    title: '1_Ferry_Building_Embarcadero_ClockTower_Survey.jpg',
    originalTitle: 'Street View & SFFD Pre-Incident Survey — 1 Ferry Building, The Embarcadero, San Francisco',
    url: '/src/assets/images/ferry_exterior_clocktower_1792126213230.jpg',
    mimeType: 'image/jpeg',
    status: 'applied',
    byteLength: 46820,
    sha256: crypto.createHash('sha256').update('ferry_exterior_clocktower').digest('hex'),
    sourceDate: '2025-02-01',
    previewUrl: '/src/assets/images/ferry_exterior_clocktower_1792126213230.jpg',
    extractedElements: [
      'Colusa gray-white sandstone ashlar masonry with continuous ground-floor Romanesque/Beaux-Arts arched colonnade',
      '2nd & 3rd floor repeating Venetian arched windows with Corinthian pilasters along The Embarcadero',
      'Iconic 245-foot Central Clock Tower with 4 illuminated clock dials rising above the skylit nave',
      'SFFD Engine 13 land access on The Embarcadero + SFFD Fireboat 35 berth at Pier 14',
    ],
    buildingRevision: 1,
  };

  const ferryScene: SceneSpec = {
    ...baseBradbury.scene,
    envelopeId: 'env-ferry-sf-1',
    facadeSummary:
      '1898 Colusa Gray Sandstone Beaux-Arts Arched Arcade, Venetian Arched Windows & 245ft Central Clock Tower (1 Ferry Building, SF)',
    roofSummary:
      'Full-length peaked Victorian steel-and-glass skylight monitor over the Grand Nave + 245ft Central Clock Tower',
    structuralNotes: [
      'Colusa gray sandstone exterior masonry supported by riveted steel frame and arched colonnade.',
      'Full-length central skylit nave creates rapid horizontal and vertical smoke migration toward the Clock Tower.',
      'East Pressurized Stairwell B provides protected rescue access to East Clock Tower Suite 305 / 208.',
    ],
    fireZones: [
      {
        id: 'fz-ferry-vault-302',
        floor: 3,
        roomId: 'f3-server',
        areaLabel: 'North Transformer & Kitchen Vault 302/204 (Active Fire)',
        position: [-8, 10.2, -3.5],
        radiusMeters: 4.5,
        hasFlames: true,
        flameIntensity: 0.94,
        smokeDensity: 0.96,
        smokeColor: 'black',
        movementNote:
          'Active orange flames blowing out of North-West Venetian arched windows beside the Clock Tower; dense black smoke banking into Grand Nave Gallery.',
        provenance: 'observation',
        sourceId: 'src-arch-pdf-1',
        reportedAt: new Date(tBase).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'fz-ferry-nave-smoke',
        floor: 3,
        roomId: 'f3-corridor',
        areaLabel: 'Grand Nave Skylit Gallery 3C (Smoke Migration Only — No Flames)',
        position: [0, 10.4, 1.0],
        radiusMeters: 4.2,
        hasFlames: false,
        flameIntensity: 0,
        smokeDensity: 0.72,
        smokeColor: 'gray',
        movementNote: 'Stratified gray/black smoke banking beneath the peaked steel-and-glass skylight trusses.',
        provenance: 'observation',
        reportedAt: new Date(tBase + 20000).toISOString(),
        buildingRevision: 1,
      },
    ],
    stagingCandidates: [
      {
        id: 'stg-truck-south',
        type: 'truck_staging',
        label: 'SFFD Engine 13 & Truck 13 — Embarcadero Clock Tower Plaza',
        coordinates: { lat: 37.7954, lng: -122.3939 },
        localPosition: [-6.5, 0, 21.5],
        status: 'selected',
        placedBy: 'dispatcher',
        risks: ['Overhead F-Market streetcar catenary wires along The Embarcadero median'],
        outstandingChecks: ['Confirm Pier 14 Fireboat 35 manifold pressure'],
        routeDistanceMeters: 1120,
        routeDurationSeconds: 150,
        stationName: 'SFFD Station 13 (Sansome St)',
        buildingRevision: 1,
      },
      {
        id: 'stg-truck-west',
        type: 'truck_staging',
        label: 'SFFD Rescue Squad 2 — North Arcade & FDC Standpipe',
        coordinates: { lat: 37.7958, lng: -122.3941 },
        localPosition: [-26.5, 0, -2.5],
        status: 'candidate',
        placedBy: 'research_candidate',
        risks: ['Smoke plume drifting NE toward Bay Pier 14'],
        outstandingChecks: ['Charge dual Siamese FDC standpipe at North Service Bay'],
        routeDistanceMeters: 1380,
        routeDurationSeconds: 175,
        stationName: 'SFFD Station 35 (Pier 22½)',
        buildingRevision: 1,
      },
      {
        id: 'stg-med-sw',
        type: 'medical_post',
        label: 'EMS Triage Post — Embarcadero Palm Plaza (Upwind)',
        coordinates: { lat: 37.7952, lng: -122.3943 },
        localPosition: [-20.5, 0, 21.5],
        status: 'selected',
        placedBy: 'dispatcher',
        risks: ['Keep clear of Embarcadero northbound apparatus lane'],
        outstandingChecks: ['Stage 2 ALS ambulances for Clock Tower Suite rescues'],
        routeDistanceMeters: 1150,
        routeDurationSeconds: 155,
        stationName: 'SFFD EMS Medic 13',
        buildingRevision: 1,
      },
    ],
  };

  const ferryTrace: ResearchTraceData = {
    runId: 'trace-ferry-live-1',
    buildingRevision: 1,
    clueTrigger: 'Live AI Research: "San Francisco Ferry Building, 1 Ferry Building, The Embarcadero"',
    status: 'completed',
    startedAt: new Date(tBase + 5000).toISOString(),
    completedAt: new Date(tBase + 15000).toISOString(),
    branches: [
      {
        id: 'identity_geo',
        title: 'Identity & Geography',
        subagentName: 'Geo-Identity Subagent',
        status: 'completed',
        summary: 'Geocoded 1 Ferry Building, San Francisco (37.7955°N, 122.3937°W) · SFFD Station 13 & Fireboat 35',
        sourceIds: [],
        findings: [
          'Resolved "San Francisco Ferry Building" at 1 Ferry Building, The Embarcadero, San Francisco, CA 94111.',
          'Mapped SFFD Station 13 (Sansome St, 2.5 min ETA) and SFFD Fireboat Station 35 (Pier 22½).',
        ],
        steps: [
          {
            id: 'f-geo-1',
            label: 'Geocode "1 Ferry Building, San Francisco, CA" & resolve parcel footprint',
            status: 'completed',
            toolName: 'maps.geocode',
            detail: '37.7955° N, 122.3937° W (ROOFTOP)',
            timestamp: new Date(tBase + 8000).toISOString(),
          },
        ],
      },
      {
        id: 'building_specs',
        title: 'Building Specifications',
        subagentName: 'Structural & Occupancy Subagent',
        status: 'completed',
        summary: '1898 Beaux-Arts Colusa Sandstone Arcade · 245ft Central Clock Tower · Skylit Grand Nave',
        sourceIds: ['src-arch-pdf-1'],
        findings: [
          'Steel-frame & Colusa gray sandstone landmark with 660ft Grand Nave skylight and 245ft central Clock Tower.',
          'Level 1 Marketplace Arcade, Level 2–3 Mezzanine & Port Commission Suites, Level 4 Clock Tower Pedestal.',
        ],
        steps: [
          {
            id: 'f-spec-1',
            label: 'Query Port of SF structural & historic architectural records',
            status: 'completed',
            toolName: 'argon.searchGrounding',
            detail: 'Beaux-Arts Sandstone + Steel Truss Nave',
            timestamp: new Date(tBase + 10000).toISOString(),
          },
        ],
      },
      {
        id: 'images_plans',
        title: 'Original Images & Floor Plans',
        subagentName: 'Multimodal Plan & Photo Subagent',
        status: 'completed',
        summary: 'Ingested Sheet A-102 Grand Nave Blueprint + Embarcadero Clock Tower Street View & Satellite GIS',
        sourceIds: ['src-arch-pdf-1', 'src-ext-photo-1'],
        findings: [
          'Extracted North Electrical/Kitchen Vault 204/302 fire origin, Grand Nave Atrium, and East Clock Tower Lab 208/305.',
          'Matched Colusa sandstone arches, Venetian 2nd-story windows, and 245ft Clock Tower for 3D reconstruction.',
        ],
        steps: [
          {
            id: 'f-plan-1',
            label: 'Fetch & parse Ferry Building CAD floor plans and exterior photography with Argon',
            status: 'completed',
            toolName: 'argon.multimodalInspect',
            detail: 'Sheet A-102 + 4 Reference Captures verified',
            timestamp: new Date(tBase + 13000).toISOString(),
          },
        ],
      },
      {
        id: 'materials_systems',
        title: 'Materials, Hazards & Systems',
        subagentName: 'Systems & Hazmat Subagent',
        status: 'completed',
        summary: '480V Vault Transformer + Commercial Kitchen Hoods · Full-Length Nave Skylight Smoke Draft',
        sourceIds: ['src-arch-pdf-1'],
        findings: [
          'High-voltage transformer & battery backup in North Vault 204/302; rapid vertical smoke rise into steel-and-glass nave.',
        ],
        steps: [
          {
            id: 'f-mat-1',
            label: 'Inspect MEP schedule & atrium smoke control dampers',
            status: 'completed',
            toolName: 'argon.inspectSystems',
            detail: 'Dual FDC on North Apron + Pier 14 Fireboat manifold',
            timestamp: new Date(tBase + 14000).toISOString(),
          },
        ],
      },
      {
        id: 'weather',
        title: 'Local Weather Observation',
        subagentName: 'Meteorological Subagent',
        status: 'completed',
        summary: '16.8°C · 68% RH · Wind FROM WNW (285°) at 24 km/h (gusts 36 km/h) across Embarcadero',
        sourceIds: [],
        findings: [
          'Bay breeze from WNW (285°) at 24 km/h pushes exterior window plume eastward toward Pier 14 and San Francisco Bay.',
        ],
        steps: [
          {
            id: 'f-wx-1',
            label: 'Query real-time SF Embarcadero weather at 37.7955, -122.3937',
            status: 'completed',
            toolName: 'weather.currentConditions',
            detail: '16.8°C · RH 68% · WNW 24 km/h',
            timestamp: new Date(tBase + 145000).toISOString(),
          },
        ],
      },
    ],
  };

  return {
    ...baseBradbury,
    id: 'inc-ferry-sf-1',
    shareToken: 'fs-ferry-sf-1',
    title: 'San Francisco Ferry Building (1 Ferry Building) — Grand Nave & Vault Fire',
    status: 'monitoring',
    demoScenarioId: 'ferry_live',
    demoRunning: false,
    demoStepIndex: 8,
    demoTotalSteps: 8,
    building: {
      name: buildingName,
      address,
      coordinates: { lat: 37.7955, lng: -122.3937 },
      placeId: 'ChIJ_FerryBuilding_SF',
      googleMapsUri:
        'https://www.google.com/maps/search/?api=1&query=San+Francisco+Ferry+Building+1+Ferry+Building+San+Francisco+CA+94111&utm_campaign=gmp_mcp_codeassist_v1_aistudio',
      use: 'Historic Waterfront Ferry Terminal, Marketplace Arcade & Port/Tech Offices',
      floorCount: 4,
      heightMeters: 16,
      constructionType:
        '1898 Colusa Gray Sandstone Beaux-Arts Arched Arcade, Steel-Truss Peaked Glass Nave & 245ft Clock Tower',
      renovationNotes: '2003 Landmark Restoration — Open 660ft skylit atrium nave spans Levels 1–3',
      nearbyStations: [
        {
          id: 'st-sffd-13',
          name: 'SFFD Fire Station 13 (Financial District)',
          address: '530 Sansome St, San Francisco, CA 94111',
          coordinates: { lat: 37.7948, lng: -122.4017 },
          distanceMeters: 1120,
          durationSeconds: 150,
          googleMapsUri:
            'https://www.google.com/maps/dir/?api=1&origin=37.7948,-122.4017&destination=37.7955,-122.3937&travelmode=driving&utm_campaign=gmp_mcp_codeassist_v1_aistudio',
        },
        {
          id: 'st-sffd-35',
          name: 'SFFD Fireboat Station 35 (Pier 22½)',
          address: '399 The Embarcadero, San Francisco, CA 94105',
          coordinates: { lat: 37.7892, lng: -122.3879 },
          distanceMeters: 1380,
          durationSeconds: 175,
          googleMapsUri:
            'https://www.google.com/maps/dir/?api=1&origin=37.7892,-122.3879&destination=37.7955,-122.3937&travelmode=driving&utm_campaign=gmp_mcp_codeassist_v1_aistudio',
        },
      ],
      accessRoads: [
        'The Embarcadero (West Arched Colonnade & Clock Tower Plaza Aerial Staging)',
        'Embarcadero Palm Plaza (Upwind EMS Triage Zone)',
        'Pier 14 & Bay Apron (SFFD Fireboat 35 Marine Manifold Access)',
      ],
    },
    sources: [planSource, photoSource],
    scene: ferryScene,
    weather: {
      temperatureCelsius: 16.8,
      relativeHumidity: 68,
      windSpeedKmh: 24,
      windGustKmh: 36,
      windDirectionFromDeg: 285,
      windCardinalFrom: 'WNW',
      conditionText: 'Bay Breeze / Partly Cloudy',
      conditionType: 'PARTLY_CLOUDY',
      precipitationText: '0.0 mm (Dry)',
      placeName: '1 Ferry Building, The Embarcadero, San Francisco, CA',
      observationTime: new Date().toISOString(),
      sourceName: 'Google Maps Weather API',
      sourceUrl:
        'https://developers.google.com/maps/documentation/weather?utm_campaign=gmp_mcp_codeassist_v1_aistudio',
      buildingRevision: 1,
    },
    timeline: [
      {
        id: 'evt-ferry-call-1',
        type: 'caller_utterance',
        speaker: 'Caller (Marcus Vance)',
        speakerRole: 'caller',
        text: '911! We have an active fire at the San Francisco Ferry Building, 1 Ferry Building on The Embarcadero! An electrical vault and commercial kitchen hood in North Vault 204/302 just exploded into orange flames, and thick black smoke is pouring out the Venetian arched windows beside the Clock Tower!',
        createdAt: new Date(tBase + 2000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'evt-ferry-ct-1',
        type: 'call_taker_utterance',
        speaker: 'AI Call-Taker',
        speakerRole: 'call_taker',
        text: 'I have the **San Francisco Ferry Building (1 Ferry Building, The Embarcadero)** and SFFD units are being dispatched now. Are you outside in a safe area, and did you see anyone trapped on the upper gallery floors?',
        createdAt: new Date(tBase + 6000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'evt-ferry-trace-1',
        type: 'research_trace',
        speaker: 'FireSight Research Agents',
        speakerRole: 'research_orchestrator',
        text: 'Live AI Research completed for **San Francisco Ferry Building (1 Ferry Building, San Francisco)**: geocoded waterfront parcel (`37.7955° N, 122.3937° W`), retrieved **Port of SF Sheet A-102 CAD blueprint** & **4 street/aerial reference captures** (Colusa gray sandstone arcade, 245ft Clock Tower, 660ft skylit nave, Pier 14 Fireboat berth), and queried live Embarcadero wind (`WNW 24 km/h`).',
        createdAt: new Date(tBase + 12000).toISOString(),
        buildingRevision: 1,
        traceData: ferryTrace,
      },
      {
        id: 'evt-ferry-model-1',
        type: 'model_update',
        speaker: 'Argon Spatial Modeler',
        speakerRole: 'firesight_ai',
        text: 'Reconstructed the 3D **San Francisco Ferry Building** (Colusa gray sandstone Beaux-Arts arched colonnade, 245ft central Clock Tower with 4 clock faces, peaked glass skylight nave, and Embarcadero staging) from live research sources.',
        createdAt: new Date(tBase + 16000).toISOString(),
        buildingRevision: 1,
        modelUpdate: {
          updateId: 'mu-ferry-rev1',
          buildingRevision: 1,
          summary:
            'Synthesized **3D Ferry Building Colusa Sandstone Arcade + 245ft Clock Tower + Grand Nave Floors** · Placed **SFFD Engine 13** & **+ EMS Triage Post**',
          focusElementId: 'f3-server',
          focusFloor: 3,
          sourceRefs: [
            { sourceId: 'src-arch-pdf-1', title: '1_Ferry_Building_SF_Nave_Plans_A101_A104.pdf', page: 2 },
            { sourceId: 'src-ext-photo-1', title: '1_Ferry_Building_Embarcadero_ClockTower_Survey.jpg' },
          ],
          quarantinedCount: 0,
        },
      },
      {
        id: 'evt-ferry-call-2',
        type: 'caller_utterance',
        speaker: 'Caller (Marcus Vance)',
        speakerRole: 'caller',
        text: "I'm out on the Embarcadero palm plaza now. Looking up to the right of the Clock Tower, there are 2 staff members trapped inside East Clock Tower Suite 208/305 waving for help at the window because smoke filled the central nave gallery! Also 1 security guard was on Level 1, and 2 visitors are unaccounted for.",
        createdAt: new Date(tBase + 22000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'evt-ferry-team-1',
        type: 'team_message',
        speaker: 'SFFD Engine 13 · Capt. Miller',
        speakerRole: 'responder',
        text: 'Engine 13 and Truck 13 on scene at 1 Ferry Building. Staging primary aerial on The Embarcadero in front of the Clock Tower arch; EMS Triage Post established on upwind Palm Plaza. Fireboat 35 tying up at Pier 14.',
        createdAt: new Date(tBase + 28000).toISOString(),
        buildingRevision: 1,
      },
      {
        id: 'evt-ferry-field-1',
        type: 'field_report',
        speaker: 'SFFD Engine 13 · Capt. Miller',
        speakerRole: 'responder',
        text: 'Uploading on-scene photo from The Embarcadero apron: heavy orange flames and thick black smoke blowing out of the Venetian arched windows beside the Clock Tower! Two master streams operating from Engine 13 while Rescue Team enters East Stairwell B.',
        createdAt: new Date(tBase + 35000).toISOString(),
        captureTime: new Date(tBase + 34000).toISOString(),
        buildingRevision: 1,
        fieldReport: {
          reportId: 'fr-ferry-1',
          reporterName: 'SFFD Engine 13 · Capt. Miller',
          captureTime: new Date(tBase + 34000).toISOString(),
          publishedAt: new Date(tBase + 35000).toISOString(),
          floor: 3,
          roomId: 'f3-server',
          placeLabel: 'Embarcadero Apron viewing Clock Tower & North Vault Window Blow-Out',
          humanDescription:
            'Active orange flame blow-out through 2nd/3rd story Venetian arched sandstone windows just north of the central 245ft Clock Tower. SFFD Engine 13 & Truck 13 applying deck-gun master streams from The Embarcadero.',
          aiVisualSummary:
            'Corroborates **North Electrical/Kitchen Vault (`f3-server`)** window breach on **Sheet A-102**. WNW 24 km/h bay wind is pushing the upper smoke column toward the central Clock Tower belfry and Grand Nave skylight.',
          photoDataUrl: '/src/assets/images/ferry_responder_fire_photo_1792126219138.jpg',
          deliveryStatus: 'delivered',
          linkedElementId: 'f3-server',
          buildingRevision: 1,
        },
      },
      {
        id: 'evt-ferry-ai-1',
        type: 'ai_answer',
        speaker: 'FireSight',
        speakerRole: 'firesight_ai',
        text: [
          '### San Francisco Ferry Building (1 Ferry Building) — Live Tactical Synthesis',
          'Synthesized **Caller Marcus Vance’s** report, **Port of SF Sheet A-102**, and **Capt. Miller’s On-Scene Photo** (`REV #1`):',
          '',
          '- **Active Fire Origin**: **North Vault 204/302 (`f3-server`)** — high-voltage transformer & kitchen hood fire venting flames out the Embarcadero Venetian arches.',
          '- **Life-Safety Priority (5 Unaccounted Total)**: **2 staff observed waving** in **East Clock Tower Suite 208/305 (`f3-east-lab`)** (rendered as 3D human rescue models), **1 security officer** on Level 1, and **2 visitors** at unknown locations.',
          '- **Wind & Skylight Plume**: **WNW 24 km/h** wind pushes smoke along the 660ft peaked glass nave; use **East Pressurized Stairwell B (`stair-east-b`)** for protected rescue access.',
        ].join('\n'),
        createdAt: new Date(tBase + 42000).toISOString(),
        buildingRevision: 1,
        sourceCitations: [
          { sourceId: 'src-arch-pdf-1', title: 'Sheet A-102 — Ferry Building Grand Nave Plan', page: 2, elementId: 'f3-east-lab' },
          { sourceId: 'src-ext-photo-1', title: '1 Ferry Building Clock Tower Survey' },
        ],
        considerationsForDispatch: [
          '**Priority Rescue Vector**: Direct Interior Rescue via **East Pressurized Stairwell B (`stair-east-b`)** to extract the **2 trapped occupants** in **East Clock Tower Suite (`f3-east-lab`)** without traversing the smoke-filled Grand Nave.',
          '**Marine & Aerial Coordination**: Maintain **SFFD Engine 13** exterior stream on North Vault arches to prevent vertical lap-over into the **245ft Clock Tower** and skylight trusses.',
        ],
      },
    ],
  };
}


