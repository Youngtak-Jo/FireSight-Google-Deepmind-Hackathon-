import * as THREE from 'three';
import type { SceneSpec, FireSmokeZone } from './incident-engine';

export interface BuildingReferencePhoto {
  id: string;
  title: string;
  angleLabel: string;
  materialTags: string[];
  caption: string;
  sourceLabel: string;
  dataUrl: string;
}

export const RESPONDER_CAMERA_PHOTO_URL =
  '/src/assets/images/responder_scene_camera_1792123645217.jpg';

export const BRADBURY_RESPONDER_BLOWOUT_PHOTO_URL =
  '/src/assets/images/bradbury_responder_blowout_photo_1792126218687.jpg';

export const FERRY_RESPONDER_FIRE_PHOTO_URL =
  '/src/assets/images/ferry_responder_fire_photo_1792126219138.jpg';

export const FLOORPLAN_SHEET_URLS: Record<number, string> = {
  1: '/src/assets/images/bradbury_floorplan_l1_1792124790927.jpg',
  2: '/src/assets/images/bradbury_floorplan_l2_1792124792612.jpg',
  3: '/src/assets/images/bradbury_floorplan_l3_1792124793694.jpg',
  4: '/src/assets/images/bradbury_floorplan_l4_1792124795692.jpg',
};

export const FERRY_FLOORPLAN_SHEET_URL =
  '/src/assets/images/ferry_floorplan_l2_1792126216995.jpg';

/**
 * Photorealistic street-level & aerial reference photographs of
 * The Bradbury Building (304 S Broadway & W 3rd St, Los Angeles, CA 90013)
 */
export const BUILDING_REFERENCE_PHOTOS: BuildingReferencePhoto[] = [
  {
    id: 'ref-photo-sw-corner',
    title: '304 S Broadway & W 3rd St Corner Elevation',
    angleLabel: 'SW Corner · Street View Capture',
    materialTags: [
      'Pressed Roman Brick',
      'Brownstone Sandstone Arcade',
      'Cast-Iron Bay Windows',
    ],
    caption:
      '1893 Italian Renaissance Revival landmark at 304 S Broadway & W 3rd St. Rusticated Arizona brownstone ground-floor arched colonnade, pressed Roman brick piers, projecting 3-sided cast-iron bay windows, wrought-iron fire escapes, and deep bracketed terra-cotta cornice.',
    sourceLabel: 'Street View Imagery · 304 S Broadway, LA',
    dataUrl: '/src/assets/images/bradbury_exterior_corner_1792123638843.jpg',
  },
  {
    id: 'ref-photo-facade-detail',
    title: 'Roman Brick Piers, Terra-Cotta Frieze & L3 Smoke Venting',
    angleLabel: 'West Elevation · Material Close-Up',
    materialTags: [
      'Carved Terra-Cotta Spandrel',
      'Roman Brick Masonry',
      'Cast-Iron Mullions',
    ],
    caption:
      'Close-up of the Level 3 West bay on South Broadway showing carved terra-cotta floral friezes, sandstone lintels, recessed dark cast-iron window frames, and active dark smoke venting from Room 302.',
    sourceLabel: 'Architectural Cladding Survey · West Bay',
    dataUrl: '/src/assets/images/bradbury_facade_detail_1792123640398.jpg',
  },
  {
    id: 'ref-photo-service-fdc',
    title: 'W 3rd Street Sandstone Base, Service Entry & Dual FDC',
    angleLabel: 'North/West Service Side · W 3rd St',
    materialTags: [
      'Rusticated Brownstone Base',
      'Dual Brass FDC Standpipe',
      'Steel Service Doors',
    ],
    caption:
      'W 3rd Street elevation showing the rusticated brownstone sandstone blocks, dual brass Siamese Fire Department Connection (FDC AUTO SPKR STANDPIPE), steel service doors leading to Stairwell B, and red fire lane curb.',
    sourceLabel: 'LAFD Pre-Incident Access Survey · W 3rd St',
    dataUrl: '/src/assets/images/bradbury_service_fdc_1792123642295.jpg',
  },
  {
    id: 'ref-photo-roof-skylight',
    title: 'Central Peaked Victorian Glass Atrium Skylight & Roof HVAC',
    angleLabel: 'Nadir / Oblique Aerial · Roof Level',
    materialTags: [
      'Victorian Glass & Steel Skylight',
      'Terra-Cotta Parapet',
      'Rooftop HVAC Chillers',
    ],
    caption:
      'Aerial view of The Bradbury Building rooftop featuring the central peaked glass-and-steel skylight over the 5-story open atrium court, surrounded by Roman brick parapets and perimeter HVAC chiller units.',
    sourceLabel: 'Google Aerial Oblique · 34.0505°N, 118.2479°W',
    dataUrl: '/src/assets/images/bradbury_rooftop_skylight_1792123643409.jpg',
  },
];

/**
 * Photorealistic street-level & aerial reference photographs of
 * San Francisco Ferry Building (1 Ferry Building, The Embarcadero, San Francisco, CA 94111)
 */
export const FERRY_BUILDING_REFERENCE_PHOTOS: BuildingReferencePhoto[] = [
  {
    id: 'ferry-photo-clocktower',
    title: '1 Ferry Building — Embarcadero Facade & 245ft Clock Tower',
    angleLabel: 'West Embarcadero · Street View Capture',
    materialTags: [
      'Colusa Gray Sandstone',
      'Beaux-Arts Arched Arcade',
      '245ft Central Clock Tower',
    ],
    caption:
      '1898 Beaux-Arts landmark designed by A. Page Brown along The Embarcadero. Features a 660-foot Colusa sandstone arched arcade, repeating 2nd-story Venetian arched windows, peaked steel-and-glass nave skylight, and central clock tower.',
    sourceLabel: 'Street View Imagery · 1 Ferry Building, SF',
    dataUrl: '/src/assets/images/ferry_exterior_clocktower_1792126213230.jpg',
  },
  {
    id: 'ferry-photo-fire-scene',
    title: 'North Wing Level 2 Vault 204 Window Blow-Out & SFFD Engine 13',
    angleLabel: 'NW Arcade · On-Scene Responder Capture',
    materialTags: [
      'Sandstone Venetian Arch',
      'Steel Skylight Truss',
      'SFFD Engine 13 Attack Line',
    ],
    caption:
      'Active flames and black smoke venting from the 2nd-floor North Electrical & Kitchen Vault 204 beside the central Clock Tower while SFFD Engine 13 deploys deck guns from The Embarcadero.',
    sourceLabel: 'SFFD Field Recon · Embarcadero Apron',
    dataUrl: '/src/assets/images/ferry_responder_fire_photo_1792126219138.jpg',
  },
  {
    id: 'ferry-photo-satellite',
    title: 'Bay Waterfront Pier 14 Fireboat Berth & Embarcadero Staging',
    angleLabel: 'Nadir Satellite · GIS Parcel Overlay',
    materialTags: [
      'Pier 14 Fireboat Berth',
      'Embarcadero Plaza EMS Zone',
      '660ft Skylit Nave Roof',
    ],
    caption:
      'High-resolution aerial orthoimagery showing SFFD land approach along The Embarcadero, EMS Triage Zone on the pedestrian palm plaza, and SFFD Fireboat staging on the San Francisco Bay side.',
    sourceLabel: 'Google Aerial GIS · 37.7955°N, 122.3937°W',
    dataUrl: '/src/assets/images/ferry_geocode_satellite_1792126214862.jpg',
  },
  {
    id: 'ferry-photo-blueprint',
    title: 'Sheet A-102 — Level 2 Grand Nave Gallery & Vault 204 Blueprint',
    angleLabel: 'CAD Architectural Record · Level 2',
    materialTags: [
      'Grand Nave Atrium 2N',
      'North Vault 204 (Origin)',
      'East Clock Tower Lab 208',
    ],
    caption:
      'Architectural floor plan of Level 2 showing the full-length Grand Nave Skylit Atrium, North Electrical Vault 204 fire origin, West Stairwell A, East Stairwell B, and East Clock Tower Lab 208 (2 trapped occupants).',
    sourceLabel: 'Port of SF Historic Engineering Archive · Sheet A-102',
    dataUrl: '/src/assets/images/ferry_floorplan_l2_1792126216995.jpg',
  },
];

/**
 * Photorealistic satellite-hybrid geocoded parcel & LAFD approach map for 304 S Broadway, Los Angeles
 */
export const GEOCODE_MAP_PREVIEW_SVG =
  '/src/assets/images/bradbury_geocode_satellite_1792124796503.jpg';

export const FERRY_GEOCODE_MAP_PREVIEW =
  '/src/assets/images/ferry_geocode_satellite_1792126214862.jpg';

export function getBuildingVisualAssets(buildingName?: string, address?: string) {
  const hay = `${buildingName || ''} ${address || ''}`.toLowerCase();
  if (hay.includes('ferry') || hay.includes('embarcadero')) {
    return {
      isFerry: true,
      geocodeMapUrl: FERRY_GEOCODE_MAP_PREVIEW,
      coordsLabel: '1 Ferry Building · 37.7955°N, 122.3937°W',
      geocodeLabel: '1 Ferry Building · 37.7955°N, 122.3937°W',
      referencePhotos: FERRY_BUILDING_REFERENCE_PHOTOS,
      photos: FERRY_BUILDING_REFERENCE_PHOTOS,
    };
  }
  return {
    isFerry: false,
    geocodeMapUrl: GEOCODE_MAP_PREVIEW_SVG,
    coordsLabel: '304 S Broadway · 34.0505°N, 118.2479°W',
    geocodeLabel: '304 S Broadway · 34.0505°N, 118.2479°W',
    referencePhotos: BUILDING_REFERENCE_PHOTOS,
    photos: BUILDING_REFERENCE_PHOTOS,
  };
}

function isFerryScene(spec: SceneSpec): boolean {
  const s = `${spec.envelopeId} ${spec.facadeSummary} ${spec.roofSummary}`.toLowerCase();
  return s.includes('ferry') || s.includes('clock tower') || s.includes('colusa');
}

// Cached procedural textures
let cachedRomanBrickTex: THREE.CanvasTexture | null = null;
let cachedSandstoneTex: THREE.CanvasTexture | null = null;
let cachedSignTex: THREE.CanvasTexture | null = null;
let cachedFireGlowTex: THREE.CanvasTexture | null = null;
let cachedSmokeCloudTex: THREE.CanvasTexture | null = null;

function createRomanBrickTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedRomanBrickTex) return cachedRomanBrickTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Warm terracotta mortar base
  ctx.fillStyle = '#683924';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 32;
  const cols = 8;
  const rowH = 512 / rows;
  const colW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (colW / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const y = r * rowH;
      const red = 172 + ((r * 11 + c * 17) % 34);
      const green = 78 + ((r * 7 + c * 13) % 22);
      const blue = 48 + ((r * 5 + c * 7) % 16);
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 3);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  cachedRomanBrickTex = tex;
  return tex;
}

function createSandstoneBlockTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedSandstoneTex) return cachedSandstoneTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#7c4d34';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 10;
  const cols = 5;
  const rowH = 512 / rows;
  const colW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (colW / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const y = r * rowH;
      const red = 186 + ((r * 9 + c * 13) % 24);
      const green = 118 + ((r * 7 + c * 11) % 18);
      const blue = 80 + ((r * 5 + c * 9) % 14);
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fillRect(x + 3, y + 3, colW - 6, rowH - 6);
      // Rusticated bevel highlight
      ctx.strokeStyle = 'rgba(255, 228, 196, 0.22)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 5, y + 5, colW - 10, rowH - 10);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  cachedSandstoneTex = tex;
  return tex;
}

function createBradburyPlaqueTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedSignTex) return cachedSignTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#1e1612';
  ctx.fillRect(0, 0, 512, 96);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 84);

  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('THE BRADBURY BUILDING', 256, 48);

  const tex = new THREE.CanvasTexture(canvas);
  cachedSignTex = tex;
  return tex;
}

export function getFireGlowTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedFireGlowTex) return cachedFireGlowTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(128, 128, 6, 128, 128, 124);
  grad.addColorStop(0.0, 'rgba(255, 255, 240, 1.0)');
  grad.addColorStop(0.22, 'rgba(254, 240, 138, 0.96)');
  grad.addColorStop(0.48, 'rgba(249, 115, 22, 0.88)');
  grad.addColorStop(0.75, 'rgba(220, 38, 38, 0.48)');
  grad.addColorStop(1.0, 'rgba(153, 27, 27, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  cachedFireGlowTex = new THREE.CanvasTexture(canvas);
  return cachedFireGlowTex;
}

export function getSmokeCloudTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedSmokeCloudTex) return cachedSmokeCloudTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Multi-lobed billowy cloud puff for realistic volumetric smoke
  const lobes = [
    { x: 128, y: 128, r: 108, a: 0.85 },
    { x: 96, y: 108, r: 76, a: 0.65 },
    { x: 160, y: 114, r: 74, a: 0.65 },
    { x: 114, y: 156, r: 72, a: 0.6 },
    { x: 152, y: 148, r: 70, a: 0.6 },
  ];

  for (const l of lobes) {
    const g = ctx.createRadialGradient(l.x, l.y, 8, l.x, l.y, l.r);
    g.addColorStop(0.0, `rgba(241, 245, 249, ${l.a})`);
    g.addColorStop(0.45, `rgba(203, 213, 225, ${l.a * 0.72})`);
    g.addColorStop(0.78, `rgba(148, 163, 184, ${l.a * 0.32})`);
    g.addColorStop(1.0, 'rgba(100, 116, 139, 0.0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
    ctx.fill();
  }

  cachedSmokeCloudTex = new THREE.CanvasTexture(canvas);
  return cachedSmokeCloudTex;
}

/**
 * Helper: Creates a true 3D extruded Romanesque Arched Bay for Level 1 Ground Floor
 * with rectangular outer bounds and a semi-circular arched cutout + raised voussoir arch ring & keystone.
 */
function createRomanesqueArchedBay(
  bayWidth: number,
  bayHeight: number,
  wallDepth: number,
  archRadius: number,
  sandstoneMat: THREE.Material,
  trimMat: THREE.Material,
  darkIronMat: THREE.Material,
  awningMat: THREE.Material,
  isGrandEntrance = false
): THREE.Group {
  const bayGroup = new THREE.Group();

  const springY = bayHeight - archRadius - 0.55;

  // 1. Extruded Sandstone Wall with Semi-Circular Arch Cutout
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-bayWidth / 2, 0);
  wallShape.lineTo(bayWidth / 2, 0);
  wallShape.lineTo(bayWidth / 2, bayHeight);
  wallShape.lineTo(-bayWidth / 2, bayHeight);
  wallShape.closePath();

  const holePath = new THREE.Path();
  holePath.moveTo(-archRadius, 0);
  holePath.lineTo(-archRadius, springY);
  holePath.absarc(0, springY, archRadius, Math.PI, 0, true);
  holePath.lineTo(archRadius, 0);
  holePath.closePath();
  wallShape.holes.push(holePath);

  const extrudeGeo = new THREE.ExtrudeGeometry(wallShape, {
    depth: wallDepth,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  extrudeGeo.translate(0, 0, -wallDepth / 2);
  const archWallMesh = new THREE.Mesh(extrudeGeo, sandstoneMat);
  archWallMesh.castShadow = true;
  archWallMesh.receiveShadow = true;
  bayGroup.add(archWallMesh);

  // 2. Raised 3D Voussoir Arch Ring (Half-Torus framing the semi-circular arch)
  const archRingGeo = new THREE.TorusGeometry(archRadius + 0.08, 0.16, 10, 24, Math.PI);
  const archRingFront = new THREE.Mesh(archRingGeo, trimMat);
  archRingFront.position.set(0, springY, wallDepth / 2 + 0.04);
  bayGroup.add(archRingFront);

  // Inner concentric arch molding for grand entrance
  if (isGrandEntrance) {
    const innerRingGeo = new THREE.TorusGeometry(archRadius - 0.14, 0.12, 10, 24, Math.PI);
    const innerRing = new THREE.Mesh(innerRingGeo, trimMat);
    innerRing.position.set(0, springY, wallDepth / 2 + 0.02);
    bayGroup.add(innerRing);
  }

  // 3. Projecting Keystone at Crown of Arch
  const keystone = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.52, wallDepth + 0.28),
    trimMat
  );
  keystone.position.set(0, springY + archRadius + 0.1, 0);
  bayGroup.add(keystone);

  // 4. Carved Stone Impost Capitals at Arch Springline
  const pierSideW = (bayWidth - archRadius * 2) / 2;
  for (const s of [-1, 1]) {
    const capital = new THREE.Mesh(
      new THREE.BoxGeometry(pierSideW + 0.22, 0.26, wallDepth + 0.24),
      trimMat
    );
    capital.position.set(
      s * (archRadius + pierSideW / 2),
      springY,
      0
    );
    bayGroup.add(capital);
  }

  // 5. Storefront Transom Bar, Wrought-Iron Grille or Burgundy Awning
  const transomBar = new THREE.Mesh(
    new THREE.BoxGeometry(archRadius * 2, 0.14, 0.18),
    darkIronMat
  );
  transomBar.position.set(0, springY, 0);
  bayGroup.add(transomBar);

  if (isGrandEntrance) {
    // Ornate Wrought-Iron Entrance Gate Bars + "THE BRADBURY BUILDING" Sign
    for (let gx = -archRadius + 0.25; gx <= archRadius - 0.25; gx += 0.32) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, springY, 6),
        darkIronMat
      );
      bar.position.set(gx, springY / 2, 0);
      bayGroup.add(bar);
    }
    const plaqueTex = createBradburyPlaqueTexture();
    const plaqueMat = new THREE.MeshBasicMaterial({
      map: plaqueTex || undefined,
      color: plaqueTex ? 0xffffff : 0xfbbf24,
    });
    const plaque = new THREE.Mesh(
      new THREE.BoxGeometry(bayWidth - 0.2, 0.52, 0.14),
      plaqueMat
    );
    plaque.position.set(0, bayHeight + 0.18, wallDepth / 2 + 0.12);
    bayGroup.add(plaque);
  } else {
    // Sloped Storefront Fabric Awning under the arch springline (like the Street View photo)
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(archRadius * 1.92, 0.12, 0.95),
      awningMat
    );
    awning.position.set(0, springY - 0.15, wallDepth / 2 + 0.42);
    awning.rotation.x = 0.38;
    bayGroup.add(awning);
  }

  return bayGroup;
}

/**
 * Helper: Creates a 3-sided polygonal projecting dark Cast-Iron Bay Window rising across Levels 2–4
 * (Exact match to The Bradbury Building's iconic dark bay windows in the Street View photo)
 */
function createCastIronProjectingBay(
  height: number,
  castIronMat: THREE.Material,
  glassMat: THREE.Material,
  ornateReliefMat: THREE.Material
): THREE.Group {
  const bay = new THREE.Group();
  const frontW = 1.65;
  const projDepth = 0.85;
  const sideW = 0.95;

  // Central front face frame
  for (const xOff of [-frontW / 2, 0, frontW / 2]) {
    const mullion = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, height, 0.16),
      castIronMat
    );
    mullion.position.set(xOff, height / 2, projDepth);
    bay.add(mullion);
  }

  // Front glass pane
  const frontGlass = new THREE.Mesh(
    new THREE.BoxGeometry(frontW - 0.12, height - 0.3, 0.08),
    glassMat
  );
  frontGlass.position.set(0, height / 2, projDepth);
  bay.add(frontGlass);

  // Angled 45-degree Left & Right Cheek Panes (3-sided polygonal bay)
  for (const side of [-1, 1]) {
    const cheekGroup = new THREE.Group();
    cheekGroup.position.set(side * (frontW / 2 + 0.32), height / 2, projDepth / 2);
    cheekGroup.rotation.y = side * (Math.PI / 4.2);

    const cheekGlass = new THREE.Mesh(
      new THREE.BoxGeometry(sideW, height - 0.3, 0.08),
      glassMat
    );
    cheekGroup.add(cheekGlass);

    const outerPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, height, 0.16),
      castIronMat
    );
    outerPost.position.set((side * sideW) / 2, 0, 0);
    cheekGroup.add(outerPost);

    bay.add(cheekGroup);
  }

  // Ornate Horizontal Cast-Iron Spandrel Panels & Cornice Mouldings at each floor level
  const floorDivisions = 3;
  const flH = height / floorDivisions;
  for (let i = 0; i <= floorDivisions; i++) {
    const y = i * flH;
    const spandrelH = i === 0 || i === floorDivisions ? 0.35 : 0.62;
    const frontSpandrel = new THREE.Mesh(
      new THREE.BoxGeometry(frontW + 0.25, spandrelH, projDepth + 0.15),
      i === floorDivisions ? castIronMat : ornateReliefMat
    );
    frontSpandrel.position.set(0, y, projDepth / 2);
    bay.add(frontSpandrel);

    // Window sash horizontal meeting rail
    if (i < floorDivisions) {
      const sashRail = new THREE.Mesh(
        new THREE.BoxGeometry(frontW + 0.8, 0.08, projDepth + 0.08),
        castIronMat
      );
      sashRail.position.set(0, y + flH * 0.52, projDepth / 2);
      bay.add(sashRail);
    }
  }

  return bay;
}

/**
 * Helper: Creates an authentic Black Wrought-Iron Exterior Fire Escape
 * with balcony platforms at Levels 2, 3, 4 and diagonal zig-zag iron stairs + roof gooseneck ladder.
 */
function createWroughtIronFireEscape(
  ironMat: THREE.Material
): THREE.Group {
  const escapeGroup = new THREE.Group();
  const balconyW = 2.6;
  const balconyD = 1.05;

  // Balconies at Level 2 (y=4.2), Level 3 (y=8.2), Level 4 (y=12.2)
  const levelsY = [4.2, 8.2, 12.2];
  for (let idx = 0; idx < levelsY.length; idx++) {
    const y = levelsY[idx];
    // Grated iron platform frame
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(balconyW, 0.09, balconyD),
      ironMat
    );
    deck.position.set(0, y, balconyD / 2);
    escapeGroup.add(deck);

    // Top handrail
    const railFront = new THREE.Mesh(
      new THREE.BoxGeometry(balconyW, 0.06, 0.06),
      ironMat
    );
    railFront.position.set(0, y + 0.9, balconyD);
    escapeGroup.add(railFront);

    for (const side of [-1, 1]) {
      const railSide = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.06, balconyD),
        ironMat
      );
      railSide.position.set(side * (balconyW / 2), y + 0.9, balconyD / 2);
      escapeGroup.add(railSide);

      // Diagonal cantilever support bracket under balcony
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 1.25, 0.07),
        ironMat
      );
      bracket.position.set(side * (balconyW / 2 - 0.15), y - 0.45, balconyD / 2);
      bracket.rotation.x = -0.68;
      escapeGroup.add(bracket);
    }

    // Vertical iron balusters across front railing
    for (let bx = -balconyW / 2; bx <= balconyW / 2; bx += 0.28) {
      const picket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.9, 5),
        ironMat
      );
      picket.position.set(bx, y + 0.45, balconyD);
      escapeGroup.add(picket);
    }

    // Diagonal iron stair flight connecting down to previous level
    if (idx < levelsY.length - 1) {
      const stairLen = 4.4;
      const stairStringer = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.1, stairLen),
        ironMat
      );
      stairStringer.position.set(0, y + 2.0, balconyD * 0.62);
      stairStringer.rotation.y = Math.PI / 2;
      stairStringer.rotation.x = idx % 2 === 0 ? 0.88 : -0.88;
      escapeGroup.add(stairStringer);
    }
  }

  // Vertical iron ladder from L4 balcony up over the roof cornice (y=12.2..16.8)
  for (const lx of [-0.24, 0.24]) {
    const rail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 4.8, 6),
      ironMat
    );
    rail.position.set(lx, 14.5, balconyD * 0.85);
    escapeGroup.add(rail);
  }
  for (let ry = 12.5; ry <= 16.6; ry += 0.38) {
    const rung = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.04, 0.04),
      ironMat
    );
    rung.position.set(0, ry, balconyD * 0.85);
    escapeGroup.add(rung);
  }

  return escapeGroup;
}

/**
 * Creates the 3D architectural exterior shell of The Bradbury Building (304 S Broadway, Los Angeles)
 * matching the Street View photography with:
 * - True 3D extruded semi-circular Romanesque sandstone arches along Level 1 (S Broadway & W 3rd St)
 * - Grand corner/center entrance arch with "THE BRADBURY BUILDING" plaque & wrought-iron gate
 * - Pressed Roman red-orange brick piers & carved terra-cotta floral spandrel bands (Levels 2–4)
 * - 3-sided polygonal projecting dark cast-iron bay windows & top-floor paired arched windows
 * - Black wrought-iron exterior fire escapes with diagonal stairs
 * - Deep bracketed Renaissance Revival cornice with 3D modillion dentils + central peaked glass skylight
 */
export function createBuildingExteriorShell(
  spec: SceneSpec,
  mode: 'cutaway' | 'full_exterior' | 'wireframe'
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_exterior_shell';

  const bWidth = spec.dimensions.width || 34;
  const bDepth = spec.dimensions.depth || 24;
  const bHeight = spec.dimensions.height || 16;

  if (mode === 'wireframe') {
    const envGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
    const edges = new THREE.EdgesGeometry(envGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x71717a,
      transparent: true,
      opacity: 0.45,
    });
    const wire = new THREE.LineSegments(edges, lineMat);
    wire.position.set(0, bHeight / 2, 0);
    group.add(wire);
    return group;
  }

  const isCutaway = mode === 'cutaway';
  const isFerry = isFerryScene(spec);
  const brickTex = createRomanBrickTexture();
  const stoneTex = createSandstoneBlockTexture();

  // Authentic Architectural Materials (Adapts between Red-Brick Bradbury & Colusa-Sandstone SF Ferry Building!)
  const romanBrickMat = new THREE.MeshStandardMaterial({
    color: isFerry ? 0xcbd5e1 : 0xc25938,
    map: isFerry ? undefined : brickTex || undefined,
    bumpMap: (isFerry ? stoneTex : brickTex) || undefined,
    bumpScale: 0.08,
    roughness: isFerry ? 0.68 : 0.76,
    metalness: 0.08,
  });

  const brownstoneMat = new THREE.MeshStandardMaterial({
    color: isFerry ? 0x94a3b8 : 0xb67652,
    map: isFerry ? undefined : stoneTex || undefined,
    bumpMap: stoneTex || undefined,
    bumpScale: 0.1,
    roughness: isFerry ? 0.72 : 0.82,
    metalness: 0.06,
  });

  const terraCottaMat = new THREE.MeshStandardMaterial({
    color: isFerry ? 0xe2e8f0 : 0xd97b48,
    roughness: 0.62,
    metalness: 0.14,
  });

  const darkCorniceMat = new THREE.MeshStandardMaterial({
    color: isFerry ? 0x475569 : 0x3d2217,
    roughness: 0.55,
    metalness: 0.28,
  });

  const castIronMat = new THREE.MeshStandardMaterial({
    color: 0x22262b,
    roughness: 0.38,
    metalness: 0.82,
  });

  const ornateIronReliefMat = new THREE.MeshStandardMaterial({
    color: 0x2f353d,
    roughness: 0.45,
    metalness: 0.75,
  });

  const fireEscapeIronMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.42,
    metalness: 0.85,
  });

  const awningMat = new THREE.MeshStandardMaterial({
    color: 0x5c231c,
    roughness: 0.85,
    metalness: 0.05,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.14,
    metalness: 0.15,
    transparent: true,
    opacity: isCutaway ? 0.16 : 0.48,
  });

  // 1. North & West Upper Masonry Backing Walls (with window openings on West so L3 fire vents out!)
  const northWall = new THREE.Mesh(
    new THREE.BoxGeometry(bWidth, bHeight - 4.0, 0.48),
    romanBrickMat
  );
  northWall.position.set(0, 4.0 + (bHeight - 4.0) / 2, -bDepth / 2);
  northWall.castShadow = true;
  northWall.receiveShadow = true;
  group.add(northWall);

  // 2. LEVEL 1 GROUND FLOOR: True 3D Extruded Romanesque Sandstone Arched Colonnade
  const numBaysX = 7;
  const numBaysZ = 5;
  const stepX = bWidth / numBaysX;
  const stepZ = bDepth / numBaysZ;
  const groundH = 4.15;

  // South Broadway (z = +bDepth/2) & North (z = -bDepth/2) Arched Colonnades
  for (let i = 0; i < numBaysX; i++) {
    const cx = -bWidth / 2 + (i + 0.5) * stepX;
    const isMainEntrance = i === 1 || i === 3;
    const southArchBay = createRomanesqueArchedBay(
      stepX - 0.04,
      groundH,
      0.72,
      Math.min(1.65, stepX * 0.36),
      brownstoneMat,
      terraCottaMat,
      castIronMat,
      awningMat,
      i === 1 // Grand Entrance Portal near SW corner like the photo!
    );
    southArchBay.position.set(cx, 0, bDepth / 2);
    group.add(southArchBay);

    if (!isMainEntrance) {
      const northArchBay = createRomanesqueArchedBay(
        stepX - 0.04,
        groundH,
        0.65,
        Math.min(1.55, stepX * 0.34),
        brownstoneMat,
        terraCottaMat,
        castIronMat,
        awningMat,
        false
      );
      northArchBay.position.set(cx, 0, -bDepth / 2);
      northArchBay.rotation.y = Math.PI;
      group.add(northArchBay);
    }
  }

  // West 3rd Street (x = -bWidth/2) & East (x = +bWidth/2) Arched Colonnades
  for (let j = 0; j < numBaysZ; j++) {
    const cz = -bDepth / 2 + (j + 0.5) * stepZ;
    const westArchBay = createRomanesqueArchedBay(
      stepZ - 0.04,
      groundH,
      0.72,
      Math.min(1.6, stepZ * 0.35),
      brownstoneMat,
      terraCottaMat,
      castIronMat,
      awningMat,
      j === numBaysZ - 1
    );
    westArchBay.position.set(-bWidth / 2, 0, cz);
    westArchBay.rotation.y = -Math.PI / 2;
    group.add(westArchBay);

    const eastArchBay = createRomanesqueArchedBay(
      stepZ - 0.04,
      groundH,
      0.72,
      Math.min(1.6, stepZ * 0.35),
      brownstoneMat,
      terraCottaMat,
      castIronMat,
      awningMat,
      false
    );
    eastArchBay.position.set(bWidth / 2, 0, cz);
    eastArchBay.rotation.y = Math.PI / 2;
    group.add(eastArchBay);
  }

  // Heavy Carved Sandstone Belt Course Cornice above Level 1 Arches (y = 4.15m)
  const l1BeltCourse = new THREE.Mesh(
    new THREE.BoxGeometry(bWidth + 0.9, 0.42, bDepth + 0.9),
    terraCottaMat
  );
  l1BeltCourse.position.set(0, 4.18, 0);
  group.add(l1BeltCourse);

  // Dual Brass Siamese FDC Standpipe Connection on W 3rd St Sandstone Base
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.88,
  });
  const fdcPlaque = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.65, 0.95),
    brassMat
  );
  fdcPlaque.position.set(-bWidth / 2 - 0.38, 1.35, 2.2);
  group.add(fdcPlaque);

  // 3. LEVELS 2–4: Pressed Roman Brick Structural Piers, Terra-Cotta Spandrels & Paired Top-Floor Arches
  const upperH = bHeight - 4.2;

  // South & North Brick Piers + Top-Floor Paired Romanesque Window Arches
  for (let i = 0; i <= numBaysX; i++) {
    const x = -bWidth / 2 + i * stepX;
    for (const zSign of [-1, 1]) {
      const z = (zSign * bDepth) / 2;
      const isCorner = i === 0 || i === numBaysX;
      const pierW = isCorner ? 1.35 : 0.88;
      const pier = new THREE.Mesh(
        new THREE.BoxGeometry(pierW, upperH, 0.68),
        romanBrickMat
      );
      pier.position.set(x, 4.2 + upperH / 2, z);
      pier.castShadow = true;
      group.add(pier);

      // Decorative terra-cotta pilaster capital at top of pier
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(pierW + 0.18, 0.38, 0.82),
        terraCottaMat
      );
      cap.position.set(x, bHeight - 0.55, z);
      group.add(cap);
    }

    // Between piers: Spandrels, Recessed Sash Windows, and Level 4 Paired Arched Windows
    if (i < numBaysX) {
      const cx = -bWidth / 2 + (i + 0.5) * stepX;
      // In cutaway mode, keep center-right bays (i = 3, 4, 5) open on L2-L3 so interior rooms & people are crystal clear,
      // while keeping all piers, L1 arches, L4 arches, and bay windows intact!
      const isCutawayWindowBay = isCutaway && (i === 3 || i === 4);

      for (const lv of [2, 3, 4]) {
        const floorY = (lv - 1) * 4.0;
        // Carved Terra-Cotta Floral Spandrel Band under each floor
        if (!isCutawayWindowBay || lv === 4) {
          const spandrel = new THREE.Mesh(
            new THREE.BoxGeometry(stepX - 0.4, 0.58, 0.56),
            terraCottaMat
          );
          spandrel.position.set(cx, floorY + 0.18, bDepth / 2);
          group.add(spandrel);

          // Central vertical brick mullion dividing each bay into paired twin windows (just like the photo!)
          const twinDivider = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 3.2, 0.52),
            romanBrickMat
          );
          twinDivider.position.set(cx, floorY + 2.0, bDepth / 2);
          group.add(twinDivider);
        }

        // Level 4 (Top Floor) Paired Romanesque Semi-Circular Window Arches!
        if (lv === 4) {
          for (const subSign of [-1, 1]) {
            const subX = cx + subSign * (stepX * 0.21);
            const topArch = new THREE.Mesh(
              new THREE.TorusGeometry(stepX * 0.16, 0.12, 8, 16, Math.PI),
              terraCottaMat
            );
            topArch.position.set(subX, bHeight - 1.15, bDepth / 2 + 0.28);
            group.add(topArch);
          }
        }
      }
    }
  }

  // West (W 3rd St) & East Brick Piers, Spandrels & Paired Top-Floor Arches
  for (let j = 0; j <= numBaysZ; j++) {
    const z = -bDepth / 2 + j * stepZ;
    for (const xSign of [-1, 1]) {
      const x = (xSign * bWidth) / 2;
      if (j > 0 && j < numBaysZ) {
        const pier = new THREE.Mesh(
          new THREE.BoxGeometry(0.68, upperH, 0.88),
          romanBrickMat
        );
        pier.position.set(x, 4.2 + upperH / 2, z);
        pier.castShadow = true;
        group.add(pier);
      }
    }

    if (j < numBaysZ) {
      const cz = -bDepth / 2 + (j + 0.5) * stepZ;
      for (const xSign of [-1, 1]) {
        const x = (xSign * bWidth) / 2;
        const skipEastCutaway = isCutaway && xSign === 1 && (j === 2 || j === 3);

        for (const lv of [2, 3, 4]) {
          const floorY = (lv - 1) * 4.0;
          if (!skipEastCutaway || lv === 4) {
            const spandrel = new THREE.Mesh(
              new THREE.BoxGeometry(0.56, 0.58, stepZ - 0.4),
              terraCottaMat
            );
            spandrel.position.set(x, floorY + 0.18, cz);
            group.add(spandrel);

            const twinDivider = new THREE.Mesh(
              new THREE.BoxGeometry(0.52, 3.2, 0.32),
              romanBrickMat
            );
            twinDivider.position.set(x, floorY + 2.0, cz);
            group.add(twinDivider);
          }

          // Top Floor Paired Romanesque Window Arches on W 3rd St & East elevations
          if (lv === 4) {
            for (const subSign of [-1, 1]) {
              const subZ = cz + subSign * (stepZ * 0.21);
              const topArch = new THREE.Mesh(
                new THREE.TorusGeometry(stepZ * 0.16, 0.12, 8, 16, Math.PI),
                terraCottaMat
              );
              topArch.rotation.y = Math.PI / 2;
              topArch.position.set(x + xSign * 0.28, bHeight - 1.15, subZ);
              group.add(topArch);
            }
          }
        }
      }
    }
  }

  // 4. ICONIC 3-SIDED POLYGONAL PROJECTING DARK CAST-IRON BAY WINDOWS (Levels 2–3/4)
  const bayH = upperH - 2.6; // Stops below the L4 arched windows, exactly like the Street View photo!
  // South Broadway Projecting Cast-Iron Bays (bays 0, 1, 2, 5, 6)
  for (const bayIdx of [0, 1, 2, 5, 6]) {
    const bx = -bWidth / 2 + (bayIdx + 0.5) * stepX;
    const castBay = createCastIronProjectingBay(
      bayH,
      castIronMat,
      glassMat,
      ornateIronReliefMat
    );
    castBay.position.set(bx, 4.35, bDepth / 2 + 0.15);
    group.add(castBay);
  }

  // W 3rd Street Projecting Cast-Iron Bays (bays 1, 3, 4)
  for (const bayIdxZ of [1, 3, 4]) {
    const bz = -bDepth / 2 + (bayIdxZ + 0.5) * stepZ;
    const castBayW = createCastIronProjectingBay(
      bayH,
      castIronMat,
      glassMat,
      ornateIronReliefMat
    );
    castBayW.rotation.y = -Math.PI / 2;
    castBayW.position.set(-bWidth / 2 - 0.15, 4.35, bz);
    group.add(castBayW);
  }

  // 5. BLACK WROUGHT-IRON EXTERIOR FIRE ESCAPES (South Broadway & W 3rd Street, matching photo!)
  const southFireEscape = createWroughtIronFireEscape(fireEscapeIronMat);
  southFireEscape.position.set(-bWidth / 2 + 2.5 * stepX, 0, bDepth / 2 + 0.35);
  group.add(southFireEscape);

  const westFireEscape = createWroughtIronFireEscape(fireEscapeIronMat);
  westFireEscape.rotation.y = -Math.PI / 2;
  westFireEscape.position.set(-bWidth / 2 - 0.35, 0, -bDepth / 2 + 2.5 * stepZ);
  group.add(westFireEscape);

  // 6. DEEP OVERHANGING ITALIAN RENAISSANCE REVIVAL BRACKETED CORNICE + DENTIL MODILLIONS
  const corniceFrieze = new THREE.Mesh(
    new THREE.BoxGeometry(bWidth + 0.95, 0.65, bDepth + 0.95),
    terraCottaMat
  );
  corniceFrieze.position.set(0, bHeight - 0.32, 0);
  group.add(corniceFrieze);

  const corniceOverhang = new THREE.Mesh(
    new THREE.BoxGeometry(bWidth + 2.3, 0.58, bDepth + 2.3),
    darkCorniceMat
  );
  corniceOverhang.position.set(0, bHeight + 0.28, 0);
  corniceOverhang.castShadow = true;
  group.add(corniceOverhang);

  const parapetWall = new THREE.Mesh(
    new THREE.BoxGeometry(bWidth + 0.6, 0.65, bDepth + 0.6),
    romanBrickMat
  );
  parapetWall.position.set(0, bHeight + 0.78, 0);
  group.add(parapetWall);

  // 3D Carved Modillion Brackets (Corbels) spaced under the overhanging cornice
  for (let mx = -bWidth / 2 - 0.6; mx <= bWidth / 2 + 0.6; mx += 1.25) {
    for (const zSign of [-1, 1]) {
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.48, 0.72),
        terraCottaMat
      );
      bracket.position.set(mx, bHeight - 0.05, zSign * (bDepth / 2 + 0.68));
      group.add(bracket);
    }
  }
  for (let mz = -bDepth / 2 - 0.6; mz <= bDepth / 2 + 0.6; mz += 1.25) {
    for (const xSign of [-1, 1]) {
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.48, 0.22),
        terraCottaMat
      );
      bracket.position.set(xSign * (bWidth / 2 + 0.68), bHeight - 0.05, mz);
      group.add(bracket);
    }
  }

  // 7. ICONIC CENTRAL PEAKED VICTORIAN GLASS & STEEL ATRIUM SKYLIGHT + ORNATE ATRIUM BALCONY RAILINGS
  const skylightW = 14.5;
  const skylightD = 8.6;

  // Skylight masonry curb around the open atrium shaft
  const skylightCurb = new THREE.Mesh(
    new THREE.BoxGeometry(skylightW + 0.8, 0.85, skylightD + 0.8),
    terraCottaMat
  );
  skylightCurb.position.set(0, bHeight + 0.72, 0);
  group.add(skylightCurb);

  // Hipped/Peaked Victorian Glass Skylight Roof
  const gableGeo = new THREE.CylinderGeometry(4.6, 4.6, skylightW, 3);
  const skylightGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x7dd3fc,
    roughness: 0.12,
    metalness: 0.22,
    transparent: true,
    opacity: 0.55,
  });
  const skylightPrism = new THREE.Mesh(gableGeo, skylightGlassMat);
  skylightPrism.rotation.z = Math.PI / 2;
  skylightPrism.rotation.x = -Math.PI / 6;
  skylightPrism.scale.set(0.52, 1, 1);
  skylightPrism.position.set(0, bHeight + 1.65, 0);
  group.add(skylightPrism);

  // Victorian Steel Truss Ribs along the peaked skylight
  for (let rx = -skylightW / 2; rx <= skylightW / 2; rx += 1.45) {
    const ribFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.2, skylightD),
      castIronMat
    );
    ribFrame.position.set(rx, bHeight + 1.55, 0);
    group.add(ribFrame);
  }

  // Rooftop Mechanical Chiller Units & Exhaust Fans on North/East Roof Deck
  const hvacMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.48,
    metalness: 0.62,
  });
  for (const hx of [-11.5, 11.5]) {
    const chiller = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.45, 2.5), hvacMat);
    chiller.position.set(hx, bHeight + 0.95, -6.8);
    group.add(chiller);
  }

  // 8. If SF Ferry Building: Add Iconic 245ft Central Beaux-Arts Clock Tower with 4 Clock Dials, Belfry Arches & Flag!
  if (isFerry) {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(0, bHeight, bDepth / 2 - 2.6);

    // Base pedestal
    const ped = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.2, 5.2), terraCottaMat);
    ped.position.set(0, 1.6, 0);
    towerGroup.add(ped);

    // Main Clock Tower Shaft
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(4.8, 10.5, 4.8), romanBrickMat);
    shaft.position.set(0, 8.4, 0);
    shaft.castShadow = true;
    towerGroup.add(shaft);

    // 4 Illuminated Clock Faces (North, South, East, West) with Hands!
    const dialMat = new THREE.MeshBasicMaterial({ color: 0xfefce8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 });
    for (const face of [
      { pos: [0, 10.6, 2.44], rotY: 0 },
      { pos: [0, 10.6, -2.44], rotY: Math.PI },
      { pos: [2.44, 10.6, 0], rotY: Math.PI / 2 },
      { pos: [-2.44, 10.6, 0], rotY: -Math.PI / 2 },
    ] as const) {
      const dialGroup = new THREE.Group();
      dialGroup.position.set(face.pos[0], face.pos[1], face.pos[2]);
      dialGroup.rotation.y = face.rotY;

      const rim = new THREE.Mesh(new THREE.RingGeometry(1.32, 1.52, 24), rimMat);
      dialGroup.add(rim);

      const faceDisc = new THREE.Mesh(new THREE.CircleGeometry(1.35, 24), dialMat);
      faceDisc.position.z = -0.01;
      dialGroup.add(faceDisc);

      // Clock hands
      const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 0.04), rimMat);
      hourHand.position.set(0.2, 0.2, 0.02);
      hourHand.rotation.z = -0.7;
      dialGroup.add(hourHand);

      const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.05, 0.04), rimMat);
      minHand.position.set(0, 0.42, 0.03);
      dialGroup.add(minHand);

      towerGroup.add(dialGroup);
    }

    // Belfry Arcade Tier & Lantern Cupola
    const belfry = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.4, 3.8), brownstoneMat);
    belfry.position.set(0, 15.3, 0);
    towerGroup.add(belfry);

    const cupola = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 2.2, 2.8, 8), terraCottaMat);
    cupola.position.set(0, 18.4, 0);
    towerGroup.add(cupola);

    // Flagpole & US Flag at Summit
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.2, 8), hvacMat);
    pole.position.set(0, 21.2, 0);
    towerGroup.add(pole);

    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.9, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    flag.position.set(0.82, 22.2, 0);
    towerGroup.add(flag);

    group.add(towerGroup);
  }

  return group;
}

/**
 * Builds the surrounding Downtown Los Angeles urban streetscape at
 * 304 S Broadway & W 3rd Street:
 * - South Broadway & W 3rd St asphalt roadways, lane markings, and 4 white zebra crosswalks
 * - Raised concrete sidewalks, red fire-lane curbs, yellow fire hydrants
 * - Historic Downtown LA twin-globe ornamental streetlamps, traffic signals & overhead catenary wires
 * - Street trees and neighboring historic buildings (Adjoining East Brick Block, Million Dollar Theatre West Block, North Loft Annex)
 */
export function createUrbanContextEnvironment(spec: SceneSpec): THREE.Group {
  const urban = new THREE.Group();
  urban.name = 'urban_context_environment';

  const bW = spec.dimensions.width || 34;
  const bD = spec.dimensions.depth || 24;

  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x161922,
    roughness: 0.92,
    metalness: 0.05,
  });
  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.82,
    metalness: 0.06,
  });
  const curbRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.6,
  });
  const whitePaintMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });
  const yellowPaintMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

  // 1. Base Asphalt Road Plane
  const roadPlane = new THREE.Mesh(new THREE.PlaneGeometry(170, 170), asphaltMat);
  roadPlane.rotation.x = -Math.PI / 2;
  roadPlane.position.y = -0.02;
  roadPlane.receiveShadow = true;
  urban.add(roadPlane);

  // 2. Main Building Concrete Sidewalk Apron (304 S Broadway Parcel)
  const mainSidewalkW = bW + 9;
  const mainSidewalkD = bD + 9;
  const mainSidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(mainSidewalkW, 0.22, mainSidewalkD),
    sidewalkMat
  );
  mainSidewalk.position.set(0, 0.09, 0);
  mainSidewalk.receiveShadow = true;
  urban.add(mainSidewalk);

  // Red Painted Fire Lane Curbs on South Broadway & W 3rd Street
  const southFireCurb = new THREE.Mesh(
    new THREE.BoxGeometry(bW + 4, 0.25, 0.35),
    curbRedMat
  );
  southFireCurb.position.set(0, 0.11, mainSidewalkD / 2);
  urban.add(southFireCurb);

  const westFireCurb = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.25, bD + 4),
    curbRedMat
  );
  westFireCurb.position.set(-mainSidewalkW / 2, 0.11, 0);
  urban.add(westFireCurb);

  // 3. SOUTH BROADWAY (South Roadway, z = +16.5 to +32.5) & W 3RD STREET (West Roadway, x = -21.5 to -37.5)
  const southRoadCenterZ = mainSidewalkD / 2 + 8.5;
  const westRoadCenterX = -mainSidewalkW / 2 - 8.5;

  // Double-yellow centerlines on South Broadway (E-W in local coords)
  for (const offsetZ of [-0.22, 0.22]) {
    const yellowLine = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 0.16),
      yellowPaintMat
    );
    yellowLine.rotation.x = -Math.PI / 2;
    yellowLine.position.set(0, 0.01, southRoadCenterZ + offsetZ);
    urban.add(yellowLine);
  }

  // Double-yellow centerlines on W 3rd Street (N-S in local coords)
  for (const offsetX of [-0.22, 0.22]) {
    const yellowLineW = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 140),
      yellowPaintMat
    );
    yellowLineW.rotation.x = -Math.PI / 2;
    yellowLineW.position.set(westRoadCenterX + offsetX, 0.01, 0);
    urban.add(yellowLineW);
  }

  // Dashed white lane dividers on South Broadway & W 3rd St
  for (let dx = -60; dx <= 60; dx += 5.5) {
    if (Math.abs(dx - westRoadCenterX) < 10) continue;
    for (const laneZ of [southRoadCenterZ - 4.2, southRoadCenterZ + 4.2]) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.14), whitePaintMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(dx, 0.01, laneZ);
      urban.add(dash);
    }
  }
  for (let dz = -60; dz <= 60; dz += 5.5) {
    if (Math.abs(dz - southRoadCenterZ) < 10) continue;
    for (const laneX of [westRoadCenterX - 4.2, westRoadCenterX + 4.2]) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 2.6), whitePaintMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(laneX, 0.01, dz);
      urban.add(dash);
    }
  }

  // 4. High-Visibility White Zebra Crosswalks at S Broadway & W 3rd St Intersection (matching Street View!)
  // East Crosswalk across S Broadway
  for (let cz = southRoadCenterZ - 7.0; cz <= southRoadCenterZ + 7.0; cz += 1.15) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.55), whitePaintMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(-mainSidewalkW / 2 + 1.2, 0.015, cz);
    urban.add(stripe);

    const stripeWest = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.55), whitePaintMat);
    stripeWest.rotation.x = -Math.PI / 2;
    stripeWest.position.set(westRoadCenterX - 8.8, 0.015, cz);
    urban.add(stripeWest);
  }
  // North Crosswalk across W 3rd St
  for (let cx = westRoadCenterX - 7.0; cx <= westRoadCenterX + 7.0; cx += 1.15) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 3.4), whitePaintMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(cx, 0.015, mainSidewalkD / 2 - 1.2);
    urban.add(stripe);

    const stripeSouth = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 3.4), whitePaintMat);
    stripeSouth.rotation.x = -Math.PI / 2;
    stripeSouth.position.set(cx, 0.015, southRoadCenterZ + 8.8);
    urban.add(stripeSouth);
  }

  // 5. Yellow LAFD Fire Hydrants & Historic Downtown LA Twin-Globe Streetlamps
  const hydrantYellow = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.35,
    metalness: 0.4,
  });
  for (const [hx, hz] of [
    [-mainSidewalkW / 2 + 1.1, mainSidewalkD / 2 - 3.5],
    [6.5, mainSidewalkD / 2 - 0.8],
    [-mainSidewalkW / 2 + 0.8, -4.5],
  ]) {
    const hydGroup = new THREE.Group();
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.25, 0.85, 12),
      hydrantYellow
    );
    barrel.position.y = 0.62;
    hydGroup.add(barrel);
    const bonnet = new THREE.Mesh(
      new THREE.SphereGeometry(0.23, 12, 10),
      hydrantYellow
    );
    bonnet.position.y = 1.05;
    hydGroup.add(bonnet);
    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.48, 8),
      hydrantYellow
    );
    nozzle.rotation.z = Math.PI / 2;
    nozzle.position.y = 0.78;
    hydGroup.add(nozzle);
    hydGroup.position.set(hx, 0, hz);
    urban.add(hydGroup);
  }

  // Historic Twin-Globe Cast-Iron Streetlamps along S Broadway & W 3rd St
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.75,
  });
  const globeMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7 });
  for (const [lx, lz] of [
    [-14, mainSidewalkD / 2 - 0.9],
    [-2, mainSidewalkD / 2 - 0.9],
    [11, mainSidewalkD / 2 - 0.9],
    [-mainSidewalkW / 2 + 0.9, 8],
    [-mainSidewalkW / 2 + 0.9, -6],
  ]) {
    const lamp = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 4.6, 10), poleMat);
    post.position.y = 2.4;
    lamp.add(post);
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.08), poleMat);
    crossArm.position.y = 4.65;
    lamp.add(crossArm);
    for (const gx of [-0.42, 0.42]) {
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), globeMat);
      globe.position.set(gx, 4.88, 0);
      lamp.add(globe);
    }
    lamp.position.set(lx, 0, lz);
    urban.add(lamp);
  }

  // Corner Traffic Signal Pole with Mast Arm, Red/Green Signal Head & Street Sign ("W 3RD ST / S BROADWAY")
  const signalGroup = new THREE.Group();
  const sigPole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 6.8, 12), poleMat);
  sigPole.position.y = 3.5;
  signalGroup.add(sigPole);
  const mastArm = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.14, 0.14), poleMat);
  mastArm.position.set(-3.1, 6.4, 0);
  signalGroup.add(mastArm);
  const sigHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 1.15, 0.38),
    new THREE.MeshStandardMaterial({ color: 0x18181b })
  );
  sigHousing.position.set(-4.8, 5.9, 0);
  signalGroup.add(sigHousing);
  const redLens = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  redLens.position.set(-4.8, 6.25, 0.18);
  signalGroup.add(redLens);
  const greenLens = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x22c55e })
  );
  greenLens.position.set(-4.8, 5.55, 0.18);
  signalGroup.add(greenLens);
  // Blue street blade sign
  const streetSign = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.32, 0.06),
    new THREE.MeshBasicMaterial({ color: 0x1d4ed8 })
  );
  streetSign.position.set(-1.8, 6.42, 0.12);
  signalGroup.add(streetSign);
  signalGroup.position.set(-mainSidewalkW / 2 + 1.1, 0, mainSidewalkD / 2 - 1.1);
  urban.add(signalGroup);

  // Overhead Transit Catenary Wires spanning across the intersection (just like the Street View photo!)
  const wireMat = new THREE.LineBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.65,
  });
  const wirePoints = [
    new THREE.Vector3(-55, 8.8, southRoadCenterZ - 3),
    new THREE.Vector3(55, 8.8, southRoadCenterZ - 3),
    new THREE.Vector3(-55, 9.1, southRoadCenterZ + 3),
    new THREE.Vector3(55, 9.1, southRoadCenterZ + 3),
    new THREE.Vector3(westRoadCenterX - 2.5, 9.0, -50),
    new THREE.Vector3(westRoadCenterX - 2.5, 9.0, 50),
  ];
  for (let w = 0; w < wirePoints.length; w += 2) {
    const wg = new THREE.BufferGeometry().setFromPoints([
      wirePoints[w],
      wirePoints[w + 1],
    ]);
    urban.add(new THREE.Line(wg, wireMat));
  }

  // 6. Street Trees in Sidewalk Tree Wells
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.78 });
  for (const [tx, tz] of [
    [-mainSidewalkW / 2 + 1.2, -10.5],
    [15.5, mainSidewalkD / 2 - 1.2],
    [-38.5, 11.5],
    [32.5, 15.0],
  ]) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 2.8, 8), trunkMat);
    trunk.position.y = 1.4;
    tree.add(trunk);
    const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(1.85, 1), foliageMat);
    canopy.position.y = 3.6;
    tree.add(canopy);
    tree.position.set(tx, 0, tz);
    urban.add(tree);
  }

  // 7. SURROUNDING NEIGHBORING DOWNTOWN LA BUILDINGS (Matching the Street View Context!)
  const neighborBuffBrick = new THREE.MeshStandardMaterial({
    color: 0x857462,
    roughness: 0.85,
    metalness: 0.08,
  });
  const neighborCreamStone = new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    roughness: 0.82,
    metalness: 0.1,
  });
  const neighborDarkWin = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.5,
  });

  // A. Adjoining Historic Buff-Brick Row Building on East side along S Broadway (Right side of Street View photo!)
  const eastNeighborW = 20;
  const eastNeighborH = 12.8;
  const eastNeighborD = 21;
  const eastNeighborX = bW / 2 + eastNeighborW / 2 + 4.5;
  const eastNeighbor = new THREE.Group();
  eastNeighbor.position.set(eastNeighborX, 0, -1.0);

  const eastSidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(eastNeighborW + 5, 0.22, eastNeighborD + 7),
    sidewalkMat
  );
  eastSidewalk.position.set(0, 0.09, 0.5);
  eastNeighbor.add(eastSidewalk);

  const eastBody = new THREE.Mesh(
    new THREE.BoxGeometry(eastNeighborW, eastNeighborH, eastNeighborD),
    neighborBuffBrick
  );
  eastBody.position.set(0, eastNeighborH / 2, 0);
  eastNeighbor.add(eastBody);

  const eastCornice = new THREE.Mesh(
    new THREE.BoxGeometry(eastNeighborW + 0.9, 0.55, eastNeighborD + 0.9),
    neighborCreamStone
  );
  eastCornice.position.set(0, eastNeighborH + 0.2, 0);
  eastNeighbor.add(eastCornice);

  // Window grid on East Neighbor
  for (let wy = 2.6; wy <= 10.6; wy += 3.4) {
    for (let wx = -eastNeighborW / 2 + 2.5; wx <= eastNeighborW / 2 - 2.5; wx += 3.6) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 0.2), neighborDarkWin);
      win.position.set(wx, wy, eastNeighborD / 2 + 0.08);
      eastNeighbor.add(win);
    }
  }
  urban.add(eastNeighbor);

  // B. Million Dollar Theatre / 300 S Broadway Block across W 3rd Street (Left side of Street View photo!)
  const westNeighborW = 22;
  const westNeighborH = 14.5;
  const westNeighborD = 22;
  const westNeighborX = westRoadCenterX - 8.5 - westNeighborW / 2 - 2.5;
  const westNeighbor = new THREE.Group();
  westNeighbor.position.set(westNeighborX, 0, -1.0);

  const westSidewalkPad = new THREE.Mesh(
    new THREE.BoxGeometry(westNeighborW + 6, 0.22, westNeighborD + 7),
    sidewalkMat
  );
  westSidewalkPad.position.set(0, 0.09, 0.5);
  westNeighbor.add(westSidewalkPad);

  const westBody = new THREE.Mesh(
    new THREE.BoxGeometry(westNeighborW, westNeighborH, westNeighborD),
    neighborCreamStone
  );
  westBody.position.set(0, westNeighborH / 2, 0);
  westNeighbor.add(westBody);

  for (let wy = 3.0; wy <= 12.2; wy += 3.4) {
    for (let wz = -westNeighborD / 2 + 3.0; wz <= westNeighborD / 2 - 3.0; wz += 4.0) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 1.8), neighborDarkWin);
      win.position.set(westNeighborW / 2 + 0.08, wy, wz);
      westNeighbor.add(win);
    }
  }
  urban.add(westNeighbor);

  // C. North Historic Core Loft Annex behind W 3rd St Alley
  const northNeighbor = new THREE.Mesh(
    new THREE.BoxGeometry(42, 15, 14),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.88 })
  );
  northNeighbor.position.set(2, 7.5, -bD / 2 - 16);
  urban.add(northNeighbor);

  return urban;
}

/**
 * Builds an ultra-realistic, multi-layered animated 3D Fire & Volumetric Smoke Plume
 * for a given FireSmokeZone, including exterior window blow-out flames & smoke for perimeter rooms!
 */
export function createRealisticFireAndSmokeZone(
  fz: Pick<
    FireSmokeZone,
    | 'id'
    | 'floor'
    | 'areaLabel'
    | 'position'
    | 'radiusMeters'
    | 'hasFlames'
    | 'flameIntensity'
    | 'smokeDensity'
    | 'smokeColor'
  >,
  bWidth: number,
  bDepth: number
): { group: THREE.Group; interactiveTarget: THREE.Object3D } {
  const zoneGroup = new THREE.Group();
  const center = new THREE.Vector3(fz.position[0], fz.position[1], fz.position[2]);
  zoneGroup.position.copy(center);

  const fireTex = getFireGlowTexture();
  const smokeTex = getSmokeCloudTexture();

  let primaryInteractive: THREE.Object3D = zoneGroup;

  // 1. Floor Thermal Hazard Ring & Glowing Ember Bed
  const ringGeo = new THREE.RingGeometry(
    Math.max(0.6, fz.radiusMeters - 0.28),
    fz.radiusMeters,
    36
  );
  const ringMat = new THREE.MeshBasicMaterial({
    color: fz.hasFlames ? 0xff4500 : 0x94a3b8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  const floorOffsetY = (fz.floor - 1) * 4 + 0.16 - center.y;
  ringMesh.position.set(0, floorOffsetY, 0);
  zoneGroup.add(ringMesh);
  primaryInteractive = ringMesh;

  const sizeBoost =
    Math.max(1.0, Math.min(2.3, fz.radiusMeters / 3.6)) *
    (0.78 + (fz.flameIntensity || 0.7) * 0.55);

  // CRITICAL DISTINCTION: Render active flames ONLY when fz.hasFlames is true!
  if (fz.hasFlames && fz.flameIntensity > 0) {
    // A. Incandescent Magma / Ember Floor Bed
    const emberBedGeo = new THREE.CircleGeometry(
      Math.min(5.2, fz.radiusMeters * 0.78),
      32
    );
    const emberBedMat = new THREE.MeshBasicMaterial({
      map: fireTex || undefined,
      color: 0xff6b00,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const emberBed = new THREE.Mesh(emberBedGeo, emberBedMat);
    emberBed.rotation.x = -Math.PI / 2;
    emberBed.position.set(0, floorOffsetY + 0.06, 0);
    zoneGroup.add(emberBed);

    // B. Volumetric Additive Flame Sprites (scales dynamically with 60-minute progression!)
    const isSpreadZone = fz.id.startsWith('scenario-') || fz.id.startsWith('assumed-');
    const flameCount = isSpreadZone ? 14 : Math.min(26, Math.round(18 * sizeBoost));
    for (let i = 0; i < flameCount; i++) {
      const isCore = i < 5;
      const angle = (i / flameCount) * Math.PI * 2 + (i % 3) * 0.4;
      const radialDist = isCore
        ? (i % 2) * 0.5
        : (0.3 + ((i * 7) % 10) / 10) * Math.min(4.2, fz.radiusMeters * 0.58);

      const spriteMat = new THREE.SpriteMaterial({
        map: fireTex || undefined,
        color: isCore ? 0xfef08a : i % 2 === 0 ? 0xf97316 : 0xef4444,
        transparent: true,
        opacity: isCore ? 0.99 : 0.94,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      const baseScale = (isCore ? 2.9 : 2.5 + (i % 4) * 0.55) * Math.min(1.65, sizeBoost);
      const baseY = floorOffsetY + (isCore ? 1.15 : 1.45 + (i % 5) * 0.48 * sizeBoost);
      sprite.position.set(
        Math.cos(angle) * radialDist,
        baseY,
        Math.sin(angle) * radialDist
      );
      sprite.scale.set(baseScale, baseScale * 1.55, 1);
      sprite.userData = {
        animateType: 'fire_sprite',
        baseY,
        baseScaleX: baseScale,
        baseScaleY: baseScale * 1.55,
        phase: i * 0.57,
        speed: 4.8 + (i % 5) * 0.85,
      };
      zoneGroup.add(sprite);
      if (i === 0) primaryInteractive = sprite;
    }

    // C. Rising Glowing Embers / Sparks
    const sparkCount = isSpreadZone ? 10 : 18;
    for (let e = 0; e < sparkCount; e++) {
      const sparkMat = new THREE.SpriteMaterial({
        map: fireTex || undefined,
        color: e % 2 === 0 ? 0xfde047 : 0xfb923c,
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const spark = new THREE.Sprite(sparkMat);
      const ang = (e / sparkCount) * Math.PI * 2;
      const rad = ((e * 13) % 10) * 0.28 * Math.min(1.6, sizeBoost);
      const startY = floorOffsetY + 0.5 + (e % 6) * 0.65;
      spark.position.set(Math.cos(ang) * rad, startY, Math.sin(ang) * rad);
      spark.scale.set(0.52, 0.52, 1);
      spark.userData = {
        animateType: 'fire_ember',
        baseX: Math.cos(ang) * rad,
        baseY: floorOffsetY + 0.4,
        baseZ: Math.sin(ang) * rad,
        maxRise: (4.2 + (e % 4) * 1.1) * Math.min(1.6, sizeBoost),
        phase: e * 0.41,
      };
      zoneGroup.add(spark);
    }

    // D. High-Intensity Flickering PointLight ONLY on primary origin zone (avoids multi-light WebGL shader recompilation stalls!)
    if (!isSpreadZone) {
      const fireLight = new THREE.PointLight(0xff5500, 7.5 * Math.min(1.5, sizeBoost), 32);
      fireLight.position.set(0, 1.4, 0);
      fireLight.userData = {
        animateType: 'fire_light',
        baseIntensity: 7.5 * Math.min(1.5, sizeBoost),
        phase: 0.2,
      };
      zoneGroup.add(fireLight);
    }

    // E. MULTI-FACADE EXTERIOR WINDOW VENTING FLAMES & BILLOWING SMOKE PLUMES!
    const addExteriorWindowBlowout = (
      outX: number,
      outZ: number,
      dirX: number,
      dirZ: number,
      plumeCount: number
    ) => {
      const winFlameTotal = isSpreadZone ? 7 : 10;
      for (let w = 0; w < winFlameTotal; w++) {
        const winFlameMat = new THREE.SpriteMaterial({
          map: fireTex || undefined,
          color: w < 3 ? 0xfef08a : w % 2 === 0 ? 0xf97316 : 0xef4444,
          transparent: true,
          opacity: 0.96,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const winFlame = new THREE.Sprite(winFlameMat);
        const wy = 0.4 + w * 0.48 * Math.min(1.4, sizeBoost);
        const lateral = ((w % 3) - 1) * 1.45;
        const fx = outX + dirX * (0.45 + w * 0.14) + (dirZ !== 0 ? lateral : 0);
        const fzPos = outZ + dirZ * (0.45 + w * 0.14) + (dirX !== 0 ? lateral : 0);
        winFlame.position.set(fx, wy, fzPos);
        const fScale = (2.5 + (w % 3) * 0.55) * Math.min(1.55, sizeBoost);
        winFlame.scale.set(fScale, fScale * 1.65, 1);
        winFlame.userData = {
          animateType: 'fire_sprite',
          baseY: wy,
          baseScaleX: fScale,
          baseScaleY: fScale * 1.65,
          phase: w * 0.65,
          speed: 5.8,
        };
        zoneGroup.add(winFlame);
      }

      // Billowing Exterior Smoke & Fire-Lit Plume rising up the facade & above the roof!
      const effectivePlumeCount = isSpreadZone ? Math.min(10, plumeCount) : plumeCount;
      for (let es = 0; es < effectivePlumeCount; es++) {
        const t = es / effectivePlumeCount;
        const isFireLit = es < Math.round(effectivePlumeCount * 0.42);
        const extSmokeMat = new THREE.SpriteMaterial({
          map: smokeTex || undefined,
          color: isFireLit ? 0xf97316 : es < effectivePlumeCount * 0.7 ? 0x475569 : 0x94a3b8,
          transparent: true,
          opacity: isFireLit ? 0.88 : 0.78 - t * 0.2,
          depthWrite: false,
        });
        const extSmoke = new THREE.Sprite(extSmokeMat);
        const sy = 1.0 + t * (10.5 * Math.min(1.45, sizeBoost));
        const sx =
          outX +
          dirX * (1.1 + t * 2.4) +
          t * 2.2 +
          Math.sin(es * 1.7) * 0.75;
        const sz =
          outZ +
          dirZ * (1.1 + t * 2.4) +
          t * 1.8 +
          Math.cos(es * 1.3) * 0.75;
        const sScale = (2.8 + t * 4.5) * Math.min(1.4, sizeBoost);
        extSmoke.position.set(sx, sy, sz);
        extSmoke.scale.set(sScale, sScale, 1);
        extSmoke.userData = {
          animateType: 'smoke_sprite',
          baseX: sx,
          baseY: sy,
          baseZ: sz,
          baseScale: sScale,
          phase: es * 0.48,
        };
        zoneGroup.add(extSmoke);
      }
    };

    // 1. West Facade (W 3rd St) Blow-Out when room is in West wing or fire expands
    if (center.x < -2.2 || fz.radiusMeters > 5.2) {
      const extOffsetX = -bWidth / 2 - center.x - 0.35;
      addExteriorWindowBlowout(extOffsetX, 1.2, -1, 0, 14);
    }

    // 2. South Main Facade (S Broadway / Embarcadero Arched Windows!) Blow-Out when fire spreads to South/Central rooms
    if (center.z > 0.8 || fz.radiusMeters > 4.6) {
      const extOffsetZ = bDepth / 2 - center.z + 0.35;
      addExteriorWindowBlowout(0, extOffsetZ, 0, 1, 14);
    }

    // 3. East Facade Blow-Out when fire spreads to East wing
    if (center.x > 2.5) {
      const extOffsetX = bWidth / 2 - center.x + 0.35;
      addExteriorWindowBlowout(extOffsetX, 0, 1, 0, 12);
    }

    // 4. Roof Skylight & Atrium Crown Eruption (at +35m..+60m or Floor 4 fire)
    if (fz.floor >= 4 || fz.id.includes('roof-breakout')) {
      for (let rf = 0; rf < 12; rf++) {
        const crownMat = new THREE.SpriteMaterial({
          map: fireTex || undefined,
          color: rf < 5 ? 0xfef08a : 0xf97316,
          transparent: true,
          opacity: 0.96,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const crown = new THREE.Sprite(crownMat);
        const rx = ((rf % 4) - 1.5) * 2.4;
        const rz = (Math.floor(rf / 4) - 1) * 2.0;
        const ry = 3.2 + (rf % 3) * 1.1;
        crown.position.set(rx, ry, rz);
        const cScale = 3.8 + (rf % 3) * 0.95;
        crown.scale.set(cScale, cScale * 1.65, 1);
        crown.userData = {
          animateType: 'fire_sprite',
          baseY: ry,
          baseScaleX: cScale,
          baseScaleY: cScale * 1.65,
          phase: rf * 0.5,
          speed: 6.2,
        };
        zoneGroup.add(crown);
      }
    }
  }

  // 2. Interior Volumetric Billowing Smoke Cloud Plume (Rendered for BOTH active fire and smoke-only zones!)
  const baseSmokeColor = fz.hasFlames
    ? 0x94a3b8
    : fz.smokeColor === 'black'
    ? 0x64748b
    : fz.smokeColor === 'gray'
    ? 0x94a3b8
    : 0xe2e8f0;

  const puffCount =
    fz.id.startsWith('scenario-') || fz.id.startsWith('assumed-')
      ? 10
      : Math.max(14, Math.round(fz.radiusMeters * 3.5));
  for (let i = 0; i < puffCount; i++) {
    const angle = (i / puffCount) * Math.PI * 2 + (i % 4) * 0.5;
    const dist = ((i * 5) % 10) * 0.095 * fz.radiusMeters;
    const isUnderlit = fz.hasFlames && i < Math.round(puffCount * 0.35);

    const puffMat = new THREE.SpriteMaterial({
      map: smokeTex || undefined,
      color: isUnderlit ? 0xfb923c : baseSmokeColor,
      transparent: true,
      opacity: Math.min(0.84, Math.max(0.52, fz.smokeDensity * 0.78)),
      depthWrite: false,
    });
    const puffSprite = new THREE.Sprite(puffMat);
    const heightLayer = (i % 5) * 0.56 * Math.min(1.4, sizeBoost);
    const baseY = floorOffsetY + 1.35 + heightLayer;
    const baseX = Math.cos(angle) * dist;
    const baseZ = Math.sin(angle) * dist;
    const puffScale = (2.2 + (i % 4) * 0.6) * Math.min(1.35, sizeBoost);

    puffSprite.position.set(baseX, baseY, baseZ);
    puffSprite.scale.set(puffScale, puffScale * 0.88, 1);
    puffSprite.userData = {
      animateType: 'smoke_sprite',
      baseX,
      baseY,
      baseZ,
      baseScale: puffScale,
      phase: i * 0.37,
    };
    zoneGroup.add(puffSprite);
  }

  return { group: zoneGroup, interactiveTarget: primaryInteractive };
}

/**
 * Builds articulated 3D Human Rescue Models (요구조자) standing & waving for help inside a room,
 * replacing simple spheres with recognizable multi-part 3D human figures + rescue locator ring!
 */
export function createTrappedPerson3DAsset(
  count: number,
  isSelected: boolean
): THREE.Group {
  const rescueGroup = new THREE.Group();
  rescueGroup.name = 'trapped_people_3d_asset';

  const figureCount = Math.min(4, Math.max(1, count));

  // 1. Tactical Floor Rescue Locator Ring & Contact Shadow Disc
  const ringRadius = 0.85 + (figureCount - 1) * 0.38;
  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(ringRadius, 28),
    new THREE.MeshBasicMaterial({
      color: 0x083344,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.02;
  rescueGroup.add(shadowDisc);

  const locatorRing = new THREE.Mesh(
    new THREE.RingGeometry(ringRadius - 0.16, ringRadius, 32),
    new THREE.MeshBasicMaterial({
      color: isSelected ? 0xfbbf24 : 0x22d3ee,
      side: THREE.DoubleSide,
    })
  );
  locatorRing.rotation.x = -Math.PI / 2;
  locatorRing.position.y = 0.04;
  rescueGroup.add(locatorRing);

  // Materials for articulated 3D human figures
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.45,
    metalness: 0.05,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.7,
  });
  const shoesMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.6,
  });
  const vestBandMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  for (let i = 0; i < figureCount; i++) {
    const person = new THREE.Group();
    const offsetX = (i - (figureCount - 1) / 2) * 0.95;
    const offsetZ = (i % 2) * 0.35;
    person.position.set(offsetX, 0, offsetZ);
    // Face outward toward South/West cutaway camera
    person.rotation.y = -0.35 + i * 0.25;

    const jacketColor = isSelected
      ? 0xfbbf24
      : i % 2 === 0
      ? 0x06b6d4
      : 0x38bdf8;
    const jacketMat = new THREE.MeshStandardMaterial({
      color: jacketColor,
      emissive: jacketColor,
      emissiveIntensity: 0.35,
      roughness: 0.35,
      metalness: 0.15,
    });

    // Shoes (Feet)
    for (const sx of [-0.14, 0.14]) {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.26), shoesMat);
      shoe.position.set(sx, 0.06, 0.04);
      person.add(shoe);

      // Legs
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.08, 0.82, 10),
        pantsMat
      );
      leg.position.set(sx, 0.5, 0);
      person.add(leg);
    }

    // Torso (Jacket)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.68, 0.26), jacketMat);
    torso.position.set(0, 1.22, 0);
    torso.castShadow = true;
    person.add(torso);

    // High-contrast reflective rescue band across chest
    const chestBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.1, 0.28),
      vestBandMat
    );
    chestBand.position.set(0, 1.26, 0);
    person.add(chestBand);

    // Head & Hair Cap
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), skinMat);
    head.position.set(0, 1.78, 0);
    person.add(head);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.205, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hair.position.set(0, 1.8, -0.02);
    person.add(hair);

    // Left Arm (angled outward for balance)
    const leftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.055, 0.62, 8),
      jacketMat
    );
    leftArm.position.set(-0.32, 1.24, 0);
    leftArm.rotation.z = 0.35;
    person.add(leftArm);

    // Right Arm (Raised overhead waving for rescue! Animated in render loop)
    const rightShoulderPivot = new THREE.Group();
    rightShoulderPivot.position.set(0.28, 1.48, 0);
    rightShoulderPivot.rotation.z = 2.45;
    rightShoulderPivot.userData = {
      animateType: 'person_wave',
      baseRotZ: 2.45,
      phase: i * 1.3,
    };

    const rightArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.055, 0.64, 8),
      jacketMat
    );
    rightArm.position.set(0, 0.28, 0);
    rightShoulderPivot.add(rightArm);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), skinMat);
    rightHand.position.set(0, 0.62, 0);
    rightShoulderPivot.add(rightHand);

    person.add(rightShoulderPivot);
    rescueGroup.add(person);
  }

  // Overhead Glowing Rescue Indicator Ring so figures are easy to spot through floors
  const overheadHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.44, 24),
    new THREE.MeshBasicMaterial({
      color: isSelected ? 0xfbbf24 : 0x22d3ee,
      side: THREE.DoubleSide,
    })
  );
  overheadHalo.rotation.x = -Math.PI / 2;
  overheadHalo.position.set(0, 2.35, 0);
  rescueGroup.add(overheadHalo);

  return rescueGroup;
}

/**
 * Builds a detailed 3D Aerial Ladder Fire Truck asset (LAFD Engine / Truck 3)
 */
export function createFireTruck3DAsset(isSelected: boolean): THREE.Group {
  const truck = new THREE.Group();
  truck.name = 'fire_truck_3d_asset';

  const redPaint = new THREE.MeshStandardMaterial({
    color: isSelected ? 0xef4444 : 0xdc2626,
    roughness: 0.32,
    metalness: 0.35,
  });
  const whiteRoof = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
    metalness: 0.2,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    roughness: 0.25,
    metalness: 0.85,
  });
  const darkChassis = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.8,
    metalness: 0.3,
  });
  const windshieldMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.15,
    metalness: 0.7,
  });

  // Chassis bed
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.45, 2.1), darkChassis);
  chassis.position.set(0, 0.5, 0);
  truck.add(chassis);

  // Rear apparatus body
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.45, 2.05), redPaint);
  body.position.set(-0.85, 1.35, 0);
  body.castShadow = true;
  truck.add(body);

  // Chrome roll-up equipment compartments
  const locker = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.95, 2.12), chromeMat);
  locker.position.set(-0.85, 1.32, 0);
  truck.add(locker);

  // Forward crew cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.65, 2.05), redPaint);
  cab.position.set(1.9, 1.45, 0);
  cab.castShadow = true;
  truck.add(cab);

  const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.22, 2.08), whiteRoof);
  cabRoof.position.set(1.9, 2.32, 0);
  truck.add(cabRoof);

  // Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 1.85), windshieldMat);
  windshield.position.set(2.76, 1.75, 0);
  truck.add(windshield);

  // Front chrome bumper
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 2.2), chromeMat);
  bumper.position.set(2.88, 0.55, 0);
  truck.add(bumper);

  // Emergency LED lightbar
  const lightbar = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.18, 1.4),
    new THREE.MeshBasicMaterial({ color: 0xff2222 })
  );
  lightbar.position.set(2.3, 2.5, 0);
  truck.add(lightbar);

  // Turntable & Aerial Ladder Boom
  const turntable = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.3, 16), chromeMat);
  turntable.position.set(-1.6, 2.22, 0);
  truck.add(turntable);

  const ladderBoom = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.28, 0.65), chromeMat);
  ladderBoom.position.set(0.3, 2.95, 0);
  ladderBoom.rotation.z = 0.24;
  truck.add(ladderBoom);

  // 6 Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.36, 16);
  wheelGeo.rotateX(Math.PI / 2);
  for (const wx of [-1.95, -0.55, 1.85]) {
    for (const wz of [-1.05, 1.05]) {
      const wheel = new THREE.Mesh(wheelGeo, darkChassis);
      wheel.position.set(wx, 0.46, wz);
      truck.add(wheel);
    }
  }

  return truck;
}

/**
 * Builds a 3D Emergency Medical Triage Post (+ Cross Medical Pavilion & Rescue Ambulance)
 */
export function createMedicalPost3DAsset(isSelected: boolean): THREE.Group {
  const medGroup = new THREE.Group();
  medGroup.name = 'medical_post_3d_asset';

  const tentWhite = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.45,
    metalness: 0.1,
  });
  const emsTeal = new THREE.MeshStandardMaterial({
    color: isSelected ? 0x10b981 : 0x059669,
    roughness: 0.4,
    metalness: 0.2,
  });
  const redCrossMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
  });

  // Triage Base Pad
  const pad = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.16, 4.4), emsTeal);
  pad.position.set(0, 0.08, 0);
  medGroup.add(pad);

  // Medical Canopy Tent Body
  const tentWalls = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.9, 3.6), tentWhite);
  tentWalls.position.set(0, 1.05, 0);
  tentWalls.castShadow = true;
  medGroup.add(tentWalls);

  // Peaked Pyramid Roof
  const roofGeo = new THREE.ConeGeometry(2.85, 1.15, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, emsTeal);
  roof.position.set(0, 2.55, 0);
  medGroup.add(roof);

  // Prominent White Badge + Red Medical Cross (+) on Roof Top & Side
  const roofDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.15, 0.12, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  roofDisk.position.set(0, 3.16, 0);
  medGroup.add(roofDisk);

  const crossBar1 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.18, 0.46), redCrossMat);
  crossBar1.position.set(0, 3.22, 0);
  medGroup.add(crossBar1);

  const crossBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 1.45), redCrossMat);
  crossBar2.position.set(0, 3.22, 0);
  medGroup.add(crossBar2);

  // Front Wall Red Cross (+) Emblem
  const frontCrossH = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.34, 0.08), redCrossMat);
  frontCrossH.position.set(0, 1.25, 1.82);
  medGroup.add(frontCrossH);

  const frontCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.1, 0.08), redCrossMat);
  frontCrossV.position.set(0, 1.25, 1.82);
  medGroup.add(frontCrossV);

  return medGroup;
}
