/**
 * 코엑스 데모용 시연 도식 (브라우저·서버 공용, 외부 의존성 없음)
 *
 * 실제 사진이나 공식 도면이 아니라 화면 시연을 위해 단순화한 그림이다.
 * 모든 그림에 "시연용 도식" 표시를 넣어 실제 자료로 오해하지 않게 한다.
 */
import type { SceneFloor } from './incident-engine';
import type { BuildingReferencePhoto } from './three-assets';

const FONT = "Pretendard, 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function watermark(w: number, h: number): string {
  return `<text x="${w - 12}" y="${h - 12}" text-anchor="end" font-family="${FONT}" font-size="13" fill="#f59e0b" opacity="0.9">시연용 도식 · 실제 도면·사진 아님</text>`;
}

const ROOM_FILL: Record<string, string> = {
  kitchen: '#7f1d1d',
  dining: '#78350f',
  retail: '#312e81',
  corridor: '#27272a',
  lobby: '#14532d',
  office: '#1f2937',
  mechanical: '#713f12',
  stairwell: '#065f46',
};

/**
 * SceneFloor(호실 배치)로부터 평면도 SVG를 만든다.
 * 좌표계: x = 동(+)/서(-), z = 남(+)/북(-), 단위 m.
 */
export function buildSchematicPlanSvg(
  floor: SceneFloor,
  title: string,
  building: { width: number; depth: number },
  stairs: Array<{ name: string; position: { x: number; z: number; width: number; depth: number } }> = []
): string {
  const W = 960;
  const H = 640;
  const margin = 70;
  const scale = Math.min((W - margin * 2) / building.width, (H - margin * 2 - 40) / building.depth);
  const ox = W / 2;
  const oz = H / 2 + 20;
  const px = (x: number) => ox + x * scale;
  const pz = (z: number) => oz + z * scale;

  const rooms = floor.rooms
    .map((r) => {
      const x0 = px(r.bounds.x - r.bounds.width / 2);
      const z0 = pz(r.bounds.z - r.bounds.depth / 2);
      const w = r.bounds.width * scale;
      const d = r.bounds.depth * scale;
      const fill = ROOM_FILL[r.type] || '#3f3f46';
      const dashed = r.uncertainty === 'approximate_geometry' ? ' stroke-dasharray="8 6"' : '';
      return `
      <rect x="${x0}" y="${z0}" width="${w}" height="${d}" fill="${fill}" fill-opacity="0.75" stroke="#e4e4e7" stroke-width="2"${dashed}/>
      <text x="${x0 + w / 2}" y="${z0 + d / 2}" text-anchor="middle" dominant-baseline="middle" font-family="${FONT}" font-size="${Math.max(11, Math.min(17, w / 9))}" fill="#fafafa">${esc(r.name)}</text>`;
    })
    .join('');

  const stairEls = stairs
    .map((s) => {
      const x0 = px(s.position.x - s.position.width / 2);
      const z0 = pz(s.position.z - s.position.depth / 2);
      const w = s.position.width * scale;
      const d = s.position.depth * scale;
      return `<rect x="${x0}" y="${z0}" width="${w}" height="${d}" fill="#10b981" fill-opacity="0.35" stroke="#34d399" stroke-width="2"/>
      <text x="${x0 + w / 2}" y="${z0 - 6}" text-anchor="middle" font-family="${FONT}" font-size="11" fill="#6ee7b7">${esc(s.name)}</text>`;
    })
    .join('');

  const outline = `<rect x="${px(-building.width / 2)}" y="${pz(-building.depth / 2)}" width="${building.width * scale}" height="${building.depth * scale}" fill="none" stroke="#a1a1aa" stroke-width="3"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0b1220"/>
  <text x="24" y="38" font-family="${FONT}" font-size="22" font-weight="700" fill="#f4f4f5">${esc(title)}</text>
  <text x="24" y="62" font-family="${FONT}" font-size="13" fill="#a1a1aa">${esc(floor.use)}</text>
  <g font-family="${FONT}" font-size="13" fill="#94a3b8">
    <text x="${W / 2}" y="${pz(-building.depth / 2) - 14}" text-anchor="middle">북 ↑ (봉은사로 방면)</text>
    <text x="${W / 2}" y="${pz(building.depth / 2) + 24}" text-anchor="middle">남 ↓ (테헤란로·삼성역 방면)</text>
    <text x="${px(building.width / 2) + 10}" y="${oz}" text-anchor="start">동 → (영동대로)</text>
  </g>
  ${outline}
  ${rooms}
  ${stairEls}
  ${watermark(W, H)}
</svg>`;
  return svg;
}

/** 코엑스 블록 주변 도로·출입구·역 위치를 보여주는 시연용 위치도 */
export function buildCoexSiteMapSvg(): string {
  const W = 960;
  const H = 540;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0b1220"/>
  <!-- 도로 -->
  <rect x="0" y="70" width="${W}" height="46" fill="#1e293b"/>
  <rect x="0" y="430" width="${W}" height="46" fill="#1e293b"/>
  <rect x="780" y="0" width="56" height="${H}" fill="#1e293b"/>
  <rect x="110" y="0" width="34" height="${H}" fill="#1e293b"/>
  <g font-family="${FONT}" fill="#cbd5e1" font-size="16" font-weight="600">
    <text x="420" y="99">봉은사로</text>
    <text x="420" y="459">테헤란로</text>
    <text x="815" y="270" transform="rotate(90 815 270)">영동대로</text>
    <text x="131" y="190" font-size="13" transform="rotate(90 131 190)">봉은사로86길 · 테헤란로87길</text>
  </g>
  <!-- 코엑스 블록 -->
  <rect x="170" y="140" width="580" height="265" fill="#0f766e" fill-opacity="0.18" stroke="#2dd4bf" stroke-width="2"/>
  <rect x="300" y="190" width="300" height="160" fill="#38bdf8" fill-opacity="0.18" stroke="#7dd3fc" stroke-width="2"/>
  <text x="450" y="262" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="700" fill="#e0f2fe">코엑스</text>
  <text x="450" y="290" text-anchor="middle" font-family="${FONT}" font-size="14" fill="#bae6fd">지하: 스타필드 코엑스몰</text>
  <!-- 화점 -->
  <circle cx="360" cy="230" r="11" fill="#ef4444"/>
  <text x="378" y="235" font-family="${FONT}" font-size="13" fill="#fecaca">화점 (지하1층 식당가)</text>
  <!-- 출입구 -->
  <g font-family="${FONT}" font-size="13" fill="#fde68a">
    <rect x="430" y="132" width="40" height="12" fill="#f59e0b"/><text x="478" y="143">북문 GATE</text>
    <rect x="742" y="250" width="12" height="40" fill="#f59e0b"/><text x="690" y="244">동문 GATE</text>
  </g>
  <!-- 지하철 -->
  <g font-family="${FONT}" font-size="13" fill="#86efac">
    <circle cx="808" cy="453" r="10" fill="#22c55e"/><text x="690" y="420">삼성역 (2호선)</text>
    <circle cx="300" cy="93" r="10" fill="#a16207"/><text x="220" y="62">봉은사역 (9호선)</text>
  </g>
  <text x="24" y="34" font-family="${FONT}" font-size="20" font-weight="700" fill="#f4f4f5">코엑스 위치도 (서울 강남구 영동대로 513)</text>
  ${watermark(W, H)}
</svg>`;
  return svg;
}

function buildExteriorIllustrationSvg(): string {
  const W = 960;
  const H = 600;
  const mullions = Array.from({ length: 24 }, (_, i) => {
    const x = 140 + i * 28;
    return `<line x1="${x}" y1="200" x2="${x}" y2="470" stroke="#bae6fd" stroke-opacity="0.35" stroke-width="2"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset="1" stop-color="#0b1220"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7dd3fc" stop-opacity="0.55"/><stop offset="1" stop-color="#0ea5e9" stop-opacity="0.25"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect x="0" y="470" width="${W}" height="130" fill="#1e293b"/>
  <rect x="120" y="190" width="700" height="280" fill="url(#glass)" stroke="#e0f2fe" stroke-width="3"/>
  ${mullions}
  <line x1="120" y1="290" x2="820" y2="290" stroke="#e0f2fe" stroke-opacity="0.5" stroke-width="3"/>
  <line x1="120" y1="380" x2="820" y2="380" stroke="#e0f2fe" stroke-opacity="0.5" stroke-width="3"/>
  <rect x="110" y="176" width="720" height="16" fill="#cbd5e1"/>
  <text x="470" y="250" text-anchor="middle" font-family="${FONT}" font-size="46" font-weight="800" fill="#ffffff" letter-spacing="8">COEX</text>
  <rect x="400" y="430" width="140" height="40" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="470" y="456" text-anchor="middle" font-family="${FONT}" font-size="15" fill="#fde68a">동문 GATE</text>
  <text x="24" y="38" font-family="${FONT}" font-size="20" font-weight="700" fill="#f4f4f5">코엑스 컨벤션센터 동측 외관 (영동대로 방면)</text>
  ${watermark(W, H)}
</svg>`;
  return svg;
}

function buildMallIllustrationSvg(): string {
  const W = 960;
  const H = 600;
  const shops = [0, 1, 2, 3]
    .map((i) => {
      const x = 60 + i * 110;
      const h = 220 - i * 30;
      return `<rect x="${x}" y="${170 + i * 15}" width="90" height="${h}" fill="#78350f" fill-opacity="0.7" stroke="#fbbf24" stroke-opacity="0.5"/>`;
    })
    .join('');
  const shopsR = [0, 1, 2, 3]
    .map((i) => {
      const x = 810 - i * 110;
      const h = 220 - i * 30;
      return `<rect x="${x}" y="${170 + i * 15}" width="90" height="${h}" fill="#312e81" fill-opacity="0.7" stroke="#a5b4fc" stroke-opacity="0.5"/>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#18181b"/>
  <polygon points="0,600 960,600 600,330 360,330" fill="#3f3f46"/>
  <polygon points="0,0 960,0 600,150 360,150" fill="#27272a"/>
  ${shops}${shopsR}
  <rect x="380" y="160" width="200" height="34" fill="#0f172a" stroke="#f59e0b"/>
  <text x="480" y="183" text-anchor="middle" font-family="${FONT}" font-size="17" fill="#fde68a">식당가 · 별마당도서관 →</text>
  <ellipse cx="300" cy="120" rx="210" ry="60" fill="#52525b" fill-opacity="0.55"/>
  <ellipse cx="420" cy="100" rx="180" ry="45" fill="#3f3f46" fill-opacity="0.6"/>
  <rect x="40" y="470" width="120" height="28" fill="#16a34a"/>
  <text x="100" y="489" text-anchor="middle" font-family="${FONT}" font-size="14" fill="#ffffff">비상구 →</text>
  <text x="24" y="38" font-family="${FONT}" font-size="20" font-weight="700" fill="#f4f4f5">코엑스몰 지하1층 중앙 통로 (천장 연기 하강 예시)</text>
  ${watermark(W, H)}
</svg>`;
  return svg;
}

export const COEX_GEOCODE_MAP_URL = svgToDataUrl(buildCoexSiteMapSvg());

export const COEX_REFERENCE_PHOTOS: BuildingReferencePhoto[] = [
  {
    id: 'coex-illust-site',
    title: '코엑스 블록 위치도',
    angleLabel: '위치도 · 시연용 도식',
    materialTags: ['봉은사로 북문', '영동대로 동문', '삼성역 연결'],
    caption:
      '코엑스 블록과 주변 도로(봉은사로·영동대로·테헤란로·봉은사로86길), 북문·동문 GATE, 삼성역·봉은사역 위치를 단순화한 시연용 그림입니다.',
    sourceLabel: '시연용 도식 (실제 지도 아님)',
    dataUrl: COEX_GEOCODE_MAP_URL,
  },
  {
    id: 'coex-illust-exterior',
    title: '컨벤션센터 동측 외관',
    angleLabel: '동측 · 시연용 도식',
    materialTags: ['유리 커튼월', '금속 멀리언', '동문 GATE'],
    caption: '영동대로 쪽 동측 외관을 단순화한 시연용 그림입니다. 실제 외관 사진이 아닙니다.',
    sourceLabel: '시연용 도식 (실제 사진 아님)',
    dataUrl: svgToDataUrl(buildExteriorIllustrationSvg()),
  },
  {
    id: 'coex-illust-mall',
    title: '코엑스몰 지하1층 중앙 통로',
    angleLabel: '지하1층 · 시연용 도식',
    materialTags: ['식당가', '천장 연기 하강', '비상구 유도등'],
    caption:
      '지하 상가 중앙 통로에서 천장을 따라 연기가 내려오는 모습을 단순화한 시연용 그림입니다.',
    sourceLabel: '시연용 도식 (실제 사진 아님)',
    dataUrl: svgToDataUrl(buildMallIllustrationSvg()),
  },
];

/** 건물 자료 화면 '외장재·화재 특성' 탭용 (시연용 가정 포함) */
export const COEX_MATERIAL_SPECS = [
  {
    id: 'coex-mat-kitchen-duct',
    name: '식당가 주방 배기 덕트',
    location: '지하1층 식당가 각 주방 → 천장 속 공용 배기 덕트',
    swatchHex: '#dc2626',
    accentHex: '#dc2626',
    fireBehavior:
      '덕트 안 기름때에 불이 붙으면 천장 속을 따라 옆 점포와 통로로 연기·화염이 번질 수 있습니다. (시연용 가정)',
  },
  {
    id: 'coex-mat-gas',
    name: '도시가스 배관·주방 화구',
    location: '지하1층 식당가 주방',
    swatchHex: '#f59e0b',
    accentHex: '#f59e0b',
    fireBehavior: '가스 중간밸브 차단 여부 확인이 필요합니다. 차단 전까지 재발화 위험이 있습니다. (시연용 가정)',
  },
  {
    id: 'coex-mat-ceiling',
    name: '지하 상가 천장·내장재',
    location: '지하1층 중앙 통로·매장',
    swatchHex: '#a855f7',
    accentHex: '#a855f7',
    fireBehavior:
      '지하 공간이라 연기가 빠져나갈 곳이 적어 천장부터 빠르게 차오릅니다. 제연설비 작동 여부가 대피에 큰 영향을 줍니다. (시연용 가정)',
  },
  {
    id: 'coex-mat-curtainwall',
    name: '컨벤션센터 유리 커튼월',
    location: '지상 1~2층 외벽',
    swatchHex: '#0284c7',
    accentHex: '#0284c7',
    fireBehavior: '지하 화재에서는 직접 영향이 적지만, 지하 출입구로 나온 연기가 외벽을 따라 올라갈 수 있습니다. (시연용 가정)',
  },
];
