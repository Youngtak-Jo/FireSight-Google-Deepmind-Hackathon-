/**
 * 코엑스 데모용 3D 외관·주변 환경 (시연용 단순화 모델)
 *
 * - 지상: 유리 커튼월 컨벤션센터 (1~2층)
 * - 지하: 지면을 반투명하게 처리해 지하1층 코엑스몰이 위에서 비쳐 보이게 함
 * - 주변: 영동대로(동), 봉은사로(북), 테헤란로(남), 아셈로(서)
 * 좌표계: x = 동(+)/서(-), z = 남(+)/북(-), y = 위(+), 단위 m
 */
import * as THREE from 'three';
import type { SceneSpec } from './incident-engine';

export function isCoexScene(spec: SceneSpec): boolean {
  return `${spec.envelopeId} ${spec.facadeSummary}`.toLowerCase().includes('coex');
}

function undergroundDepth(spec: SceneSpec): number {
  const basements = spec.floors.filter((f) => f.level < 0);
  if (basements.length === 0) return 0;
  return -Math.min(...basements.map((f) => f.elevationMeters));
}

let cachedCoexSign: THREE.CanvasTexture | null = null;
function createCoexSignTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedCoexSign) return cachedCoexSign;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 84px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('COEX', 256, 66);
  cachedCoexSign = new THREE.CanvasTexture(canvas);
  return cachedCoexSign;
}

export function createCoexUrbanEnvironment(spec: SceneSpec): THREE.Group {
  const g = new THREE.Group();
  g.name = 'coex_urban_environment';

  const bW = spec.dimensions.width || 48;
  const bD = spec.dimensions.depth || 30;
  const depth = undergroundDepth(spec);
  const apron = 5;
  const roadW = 12;

  // 1. 반투명 지면 — 지하층이 위에서 비쳐 보이도록
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.9,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(170, 170), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.03;
  g.add(ground);

  // 2. 보도(건물 둘레) — 반투명
  const walkMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.8,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  const walk = new THREE.Mesh(new THREE.BoxGeometry(bW + apron * 2, 0.12, bD + apron * 2), walkMat);
  walk.position.set(0, 0.03, 0);
  g.add(walk);

  // 3. 도로 4면 (영동대로 동, 봉은사로 북, 테헤란로 남, 아셈로 서)
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.95,
    transparent: true,
    opacity: 0.85,
  });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  const eastX = bW / 2 + apron + roadW / 2;
  const northZ = -(bD / 2 + apron + roadW / 2);
  const southZ = bD / 2 + apron + roadW / 2;
  const westX = -eastX;

  const addRoadNS = (x: number, width: number) => {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(width, 170), roadMat);
    r.rotation.x = -Math.PI / 2;
    r.position.set(x, 0.0, 0);
    g.add(r);
    const c = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 170), lineMat);
    c.rotation.x = -Math.PI / 2;
    c.position.set(x, 0.02, 0);
    g.add(c);
  };
  const addRoadEW = (z: number, width: number) => {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(170, width), roadMat);
    r.rotation.x = -Math.PI / 2;
    r.position.set(0, 0.0, z);
    g.add(r);
    const c = new THREE.Mesh(new THREE.PlaneGeometry(170, 0.2), lineMat);
    c.rotation.x = -Math.PI / 2;
    c.position.set(0, 0.02, z);
    g.add(c);
  };
  addRoadNS(eastX, roadW + 4); // 영동대로 (넓은 간선도로)
  addRoadEW(northZ, roadW); // 봉은사로
  addRoadEW(southZ, roadW + 2); // 테헤란로
  addRoadNS(westX, roadW - 2); // 아셈로

  // 횡단보도 (동문 GATE 앞)
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 4), whiteMat);
    s.rotation.x = -Math.PI / 2;
    s.position.set(eastX - 6 + i * 2, 0.025, 10);
    g.add(s);
  }

  // 4. 지하층 외곽 (반투명 콘크리트 벽 + 윤곽선)
  if (depth > 0) {
    const shellGeo = new THREE.BoxGeometry(bW + 1, depth, bD + 1);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.set(0, -depth / 2, 0);
    g.add(shell);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(shellGeo),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
    );
    edges.position.copy(shell.position);
    g.add(edges);

    // 삼성역 연결통로 (남동쪽으로 뻗는 지하 통로)
    const linkGeo = new THREE.BoxGeometry(6, 3.2, 18);
    const link = new THREE.Mesh(
      linkGeo,
      new THREE.MeshStandardMaterial({ color: 0x22c55e, transparent: true, opacity: 0.12, depthWrite: false })
    );
    link.position.set(bW / 2 - 4, -depth + 1.8, bD / 2 + 9);
    g.add(link);
    const linkEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(linkGeo),
      new THREE.LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.6 })
    );
    linkEdges.position.copy(link.position);
    g.add(linkEdges);
  }

  // 5. 가로수 (보도 바깥 줄)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
  const treeSpots: Array<[number, number]> = [];
  for (let x = -bW / 2; x <= bW / 2; x += 8) {
    treeSpots.push([x, -bD / 2 - apron + 1]);
  }
  for (let z = -bD / 2; z <= bD / 2; z += 8) {
    treeSpots.push([bW / 2 + apron - 1, z]);
  }
  for (const [x, z] of treeSpots) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.6), trunkMat);
    trunk.position.set(x, 0.8, z);
    g.add(trunk);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), leafMat);
    crown.position.set(x, 2.2, z);
    g.add(crown);
  }

  // 6. 주변 건물 (단순 블록, 시연용)
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.3 });
  const towers: Array<[number, number, number, number, number]> = [
    // x, z, w, d, h
    [eastX + 26, -22, 14, 14, 30],
    [-30, northZ - 18, 18, 12, 14],
    [-62, -6, 14, 18, 20],
  ];
  for (const [x, z, w, d, h] of towers) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), towerMat);
    t.position.set(x, h / 2, z);
    g.add(t);
  }

  return g;
}

export function createCoexExteriorShell(
  spec: SceneSpec,
  mode: 'cutaway' | 'full_exterior' | 'wireframe'
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'coex_exterior_shell';

  const bW = spec.dimensions.width || 48;
  const bD = spec.dimensions.depth || 30;
  const bH = spec.dimensions.height || 11;

  const boxGeo = new THREE.BoxGeometry(bW, bH, bD);
  if (mode === 'wireframe') {
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeo),
      new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.5 })
    );
    wire.position.set(0, bH / 2, 0);
    group.add(wire);
    return group;
  }

  const isCutaway = mode === 'cutaway';
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    metalness: 0.6,
    roughness: 0.12,
    transparent: true,
    opacity: isCutaway ? 0.14 : 0.32,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.35 });

  // 커튼월 4면 (단면 보기에서는 남측·동측 벽을 빼서 내부가 보이게 함)
  const walls: Array<{ key: string; w: number; pos: [number, number, number]; rotY: number }> = [
    { key: 'north', w: bW, pos: [0, bH / 2, -bD / 2], rotY: 0 },
    { key: 'south', w: bW, pos: [0, bH / 2, bD / 2], rotY: 0 },
    { key: 'west', w: bD, pos: [-bW / 2, bH / 2, 0], rotY: Math.PI / 2 },
    { key: 'east', w: bD, pos: [bW / 2, bH / 2, 0], rotY: Math.PI / 2 },
  ];
  for (const wall of walls) {
    if (isCutaway && (wall.key === 'south' || wall.key === 'east')) continue;
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(wall.w, bH), glassMat);
    pane.position.set(...wall.pos);
    pane.rotation.y = wall.rotY;
    group.add(pane);

    // 세로 멀리언
    const count = Math.floor(wall.w / 3);
    for (let i = 0; i <= count; i++) {
      const off = -wall.w / 2 + (i * wall.w) / count;
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, bH, 0.12), frameMat);
      if (wall.rotY === 0) m.position.set(off, bH / 2, wall.pos[2]);
      else m.position.set(wall.pos[0], bH / 2, off);
      group.add(m);
    }
  }

  // 층 경계 수평 프레임 (지상층)
  for (const fl of spec.floors.filter((f) => f.elevationMeters > 0)) {
    const band = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(bW, 0.01, bD)),
      new THREE.LineBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.6 })
    );
    band.position.set(0, fl.elevationMeters, 0);
    group.add(band);
  }

  // 지붕 (얇은 슬래브, 단면 보기에서는 반투명)
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(bW + 1.2, 0.5, bD + 1.2),
    new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.6,
      transparent: isCutaway,
      opacity: isCutaway ? 0.25 : 1,
    })
  );
  roof.position.set(0, bH + 0.25, 0);
  group.add(roof);

  // 출입 캐노피: 동문 GATE(영동대로), 북문 GATE(봉은사로)
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
  const eastCanopy = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 10), canopyMat);
  eastCanopy.position.set(bW / 2 + 1.5, 4.2, 6);
  group.add(eastCanopy);
  const northCanopy = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 3), canopyMat);
  northCanopy.position.set(4, 4.2, -bD / 2 - 1.5);
  group.add(northCanopy);

  // COEX 간판 (동측 상단)
  const signTex = createCoexSignTexture();
  if (signTex) {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 2.5),
      new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
    );
    sign.position.set(bW / 2 + 0.05, bH - 1.8, -4);
    sign.rotation.y = Math.PI / 2;
    group.add(sign);
  }

  return group;
}
