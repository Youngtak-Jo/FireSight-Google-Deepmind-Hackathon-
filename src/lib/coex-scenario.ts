/**
 * 데모 3 — 코엑스몰 지하1층 식당가 화재 (서울 강남구 영동대로 513, 강남소방서 관할)
 *
 * 시연용 시나리오다. 건물 이름·주소·주변 도로·출입구·연결 역, 소방서·119안전센터 위치는
 * 공개 자료와 구글 지도(2026-11 확인) 기준이다. 호실 배치·인원·기상·도착 시간은 시연을 위한 가정값이다.
 *  - 강남소방서 = 삼성119안전센터와 같은 청사: 서울 강남구 테헤란로 629 (코엑스에서 직선 약 730m)
 *  - 영동119안전센터: 강남구 도산대로 320 (도로 3.1km·약 8분) / 역삼119안전센터: 강남구 역삼로 236 (도로 3.5km·약 9분) — 카카오내비 실측
 *  - 출동대 편성·차량 배치·대응단계는 coex-dispatch.ts (공개 자료 기반 시연용 편성)
 *  - 도착 시간·도로거리: 카카오모빌리티 길찾기 API 실측(2026-11-28 토요일). 구글 지도는 한국 길찾기 미지원
 *
 * 차량 호출명 규칙 (현장 사용 방식)
 *  - 펌프차: 119안전센터 이름 + '펌프' (삼성펌프, 영동펌프)
 *  - 구급차: 119안전센터 이름 + '구급' (삼성구급, 영동구급, 역삼구급)
 *  - 구조대: 소방서에만 있으며 차 번호 100 (강남소방서 = 삼성100), 추가 구조대는 서초100·송파100
 */
import {
  reconcilePeopleSummary,
  type IncidentState,
  type ResearchTraceData,
  type SceneFloor,
  type SceneSpec,
  type SourceDocument,
  type PersonLocationEntry,
} from './incident-engine.ts';
import {
  createCoexStaging,
  createCoexStations,
  coexDispatchTableMarkdown,
  COEX_RESPONSE_LEVELS,
  COEX_UNIT_COUNTS,
  COEX_ROUTE_MEASURED_AT,
} from './coex-dispatch.ts';
import {
  buildSchematicPlanSvg,
  svgToDataUrl,
  COEX_GEOCODE_MAP_URL,
} from './coex-visuals.ts';

export const COEX_BUILDING_NAME = '코엑스 (스타필드 코엑스몰)';
export const COEX_ADDRESS = '서울특별시 강남구 영동대로 513 (삼성동)';
export const COEX_COORDS = { lat: 37.51194, lng: 127.05889 };

const PLAN_ID = 'src-coex-plan';
const SITE_ID = 'src-coex-site';
const REV = 1;

const BUILDING_DIMS = { width: 48, depth: 30, height: 11 };

export function createCoexFloors(): SceneFloor[] {
  const src = (page: number) => [{ sourceId: PLAN_ID, page }];
  return [
    {
      level: -1,
      name: '지하1층 — 스타필드 코엑스몰 식당가·중앙 통로',
      use: '지하 쇼핑몰 (식당가·매장·광장), 삼성역 연결통로',
      heightMeters: 5.5,
      elevationMeters: -5.5,
      sourceIds: src(-1),
      rooms: [
        {
          id: 'b1-kitchen',
          name: '식당가 B-12 한식당 주방',
          floor: -1,
          bounds: { x: -14, z: -9, width: 8, depth: 8 },
          type: 'kitchen',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['b1-dining'],
          doors: [{ id: 'd-b1-kitchen', x: -14, z: -5, orientation: 'ew', connectsTo: 'b1-dining' }],
          windows: [],
          sourceIds: src(-1),
          materials: ['스테인리스 주방 설비', '천장 속 공용 배기 덕트'],
          hazards: ['도시가스 배관·화구', '튀김기 식용유', '배기 덕트 기름때'],
        },
        {
          id: 'b1-dining',
          name: '식당가 B-12 한식당 홀',
          floor: -1,
          bounds: { x: -14, z: -1, width: 8, depth: 8 },
          type: 'dining',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['b1-kitchen', 'b1-concourse'],
          doors: [{ id: 'd-b1-dining', x: -14, z: 3, orientation: 'ew', connectsTo: 'b1-concourse' }],
          windows: [],
          sourceIds: src(-1),
          materials: ['목재 테이블·의자', '천장 흡음재'],
        },
        {
          id: 'b1-foodcourt',
          name: '식당가 A구역 음식점',
          floor: -1,
          bounds: { x: -1, z: -5, width: 14, depth: 16 },
          type: 'dining',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['b1-concourse'],
          doors: [{ id: 'd-b1-food', x: -1, z: 3, orientation: 'ew', connectsTo: 'b1-concourse' }],
          windows: [],
          sourceIds: src(-1),
          hazards: ['점포별 주방 화구'],
        },
        {
          id: 'b1-plaza',
          name: '별마당도서관 방면 광장',
          floor: -1,
          bounds: { x: 14, z: -4, width: 16, depth: 14 },
          type: 'lobby',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['b1-concourse'],
          doors: [],
          windows: [],
          sourceIds: src(-1),
          materials: ['대형 개방 공간 (층고 높음)'],
        },
        {
          id: 'b1-concourse',
          name: '지하1층 중앙 통로',
          floor: -1,
          bounds: { x: 0, z: 5, width: 44, depth: 4 },
          type: 'corridor',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['b1-dining', 'b1-foodcourt', 'b1-plaza', 'b1-retail', 'b1-samseong-link'],
          doors: [],
          windows: [],
          sourceIds: src(-1),
        },
        {
          id: 'b1-retail',
          name: '남측 매장가 (의류·잡화)',
          floor: -1,
          bounds: { x: -2, z: 11, width: 36, depth: 8 },
          type: 'retail',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['b1-concourse'],
          doors: [],
          windows: [],
          sourceIds: src(-1),
          materials: ['의류·잡화 (가연물 많음)'],
        },
        {
          id: 'b1-samseong-link',
          name: '삼성역 연결통로 (밀레니엄 광장 방면)',
          floor: -1,
          bounds: { x: 20, z: 11, width: 8, depth: 8 },
          type: 'corridor',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['b1-concourse'],
          doors: [],
          windows: [],
          sourceIds: src(-1),
        },
      ],
    },
    {
      level: 1,
      name: '1층 — 컨벤션 로비·그랜드볼룸',
      use: '컨벤션센터 1층 (그랜드볼룸, 로비, 방재센터)',
      heightMeters: 6,
      elevationMeters: 0,
      sourceIds: src(1),
      rooms: [
        {
          id: 'f1-ballroom',
          name: '그랜드볼룸',
          floor: 1,
          bounds: { x: -13, z: -2, width: 20, depth: 22 },
          type: 'lobby',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['f1-lobby'],
          doors: [],
          windows: [],
          sourceIds: src(1),
        },
        {
          id: 'f1-lobby',
          name: '1층 로비 (동문 GATE 방면)',
          floor: 1,
          bounds: { x: 8, z: 6, width: 30, depth: 14 },
          type: 'lobby',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['f1-ballroom', 'f1-fcc'],
          doors: [{ id: 'd-f1-east', x: 23, z: 6, orientation: 'ns' }],
          windows: [{ id: 'w-f1-east', wall: 'east', offset: 0, width: 12 }],
          sourceIds: src(1),
        },
        {
          id: 'f1-fcc',
          name: '방재센터 (위치 시연용)',
          floor: 1,
          bounds: { x: 14, z: -8, width: 10, depth: 8 },
          type: 'office',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['f1-lobby'],
          doors: [],
          windows: [],
          sourceIds: src(1),
          materials: ['화재 수신기·CCTV·방송 설비'],
        },
      ],
    },
    {
      level: 2,
      name: '2층 — 아셈볼룸·컨퍼런스룸(북)',
      use: '컨벤션센터 2층 (아셈볼룸, 컨퍼런스룸)',
      heightMeters: 5,
      elevationMeters: 6,
      sourceIds: src(2),
      rooms: [
        {
          id: 'f2-asem',
          name: '아셈볼룸',
          floor: 2,
          bounds: { x: -12, z: -2, width: 22, depth: 22 },
          type: 'lobby',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['f2-corridor'],
          doors: [],
          windows: [],
          sourceIds: src(2),
        },
        {
          id: 'f2-conf',
          name: '컨퍼런스룸(북)',
          floor: 2,
          bounds: { x: 12, z: -6, width: 20, depth: 10 },
          type: 'office',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['f2-corridor'],
          doors: [],
          windows: [],
          sourceIds: src(2),
        },
        {
          id: 'f2-corridor',
          name: '2층 로비 복도',
          floor: 2,
          bounds: { x: 8, z: 7, width: 30, depth: 8 },
          type: 'corridor',
          uncertainty: 'approximate_geometry',
          connectedRoomIds: ['f2-asem', 'f2-conf'],
          doors: [],
          windows: [],
          sourceIds: src(2),
        },
      ],
    },
  ];
}

const COEX_STAIRS = [
  {
    id: 'stair-west-1',
    name: '서측 특별피난계단 1',
    fromFloor: -1,
    toFloor: 2,
    position: { x: -21, z: 4, width: 3, depth: 5 },
    sourceIds: [{ sourceId: PLAN_ID, page: -1 }],
  },
  {
    id: 'stair-east-2',
    name: '동측 피난계단 2',
    fromFloor: -1,
    toFloor: 2,
    position: { x: 22, z: -12, width: 3, depth: 4 },
    sourceIds: [{ sourceId: PLAN_ID, page: -1 }],
  },
];

export function createCoexScene(now = Date.now()): SceneSpec {
  return {
    buildingRevision: REV,
    envelopeId: 'env-1-coex-mall',
    units: 'meters',
    orientationDeg: 0,
    dimensions: { ...BUILDING_DIMS },
    facadeSummary: 'COEX 컨벤션센터 유리 커튼월 외벽 (시연용 단순화)',
    roofSummary: 'COEX 평지붕 (시연용 단순화)',
    structuralNotes: [
      '지하1층 스타필드 코엑스몰과 지상 컨벤션센터가 연결된 복합 건물 (시연용 단순화 모델)',
      '지하1층은 삼성역(2호선)·봉은사역(9호선) 연결통로와 이어짐',
      '호실 배치는 시연용 가정이며 실제 도면이 아님',
    ],
    floors: createCoexFloors(),
    stairs: COEX_STAIRS,
    fireZones: [
      {
        id: 'fz-b1-kitchen',
        floor: -1,
        roomId: 'b1-kitchen',
        areaLabel: '식당가 B-12 한식당 주방 (화염·검은 연기)',
        position: [-14, -3.4, -9],
        radiusMeters: 3.8,
        hasFlames: true,
        flameIntensity: 0.85,
        smokeDensity: 0.9,
        smokeColor: 'black',
        movementNote: '주방 배기 덕트를 타고 천장 속으로 연기 확산',
        provenance: 'observation',
        sourceId: PLAN_ID,
        reportedAt: new Date(now - 180000).toISOString(),
        buildingRevision: REV,
      },
      {
        id: 'fz-b1-concourse',
        floor: -1,
        roomId: 'b1-concourse',
        areaLabel: '지하1층 중앙 통로 (연기만, 화염 없음)',
        position: [-4, -3.0, 5],
        radiusMeters: 4.2,
        hasFlames: false,
        flameIntensity: 0,
        smokeDensity: 0.7,
        smokeColor: 'gray',
        movementNote: '천장을 따라 별마당도서관 방면·삼성역 연결통로 쪽으로 이동',
        provenance: 'observation',
        sourceId: PLAN_ID,
        reportedAt: new Date(now - 150000).toISOString(),
        buildingRevision: REV,
      },
      {
        id: 'fz-b1-plaza',
        floor: -1,
        roomId: 'b1-plaza',
        areaLabel: '별마당도서관 방면 광장 (옅은 연기)',
        position: [12, -2.6, -3],
        radiusMeters: 3.2,
        hasFlames: false,
        flameIntensity: 0,
        smokeDensity: 0.35,
        smokeColor: 'white',
        movementNote: '광장 천장부에 옅은 연기 체류 (선착대 보고)',
        provenance: 'relayed',
        reportedAt: new Date(now - 60000).toISOString(),
        buildingRevision: REV,
      },
    ],
    stagingCandidates: createCoexStaging(REV),
    quarantinedItems: [],
    scenarioAssumptions: {
      fuelAssumptions:
        '한식당 주방의 식용유·가스 화구와 천장 속 배기 덕트 기름때를 주 가연물로 가정합니다. 남측 매장가의 의류·잡화도 확대 시 가연물이 됩니다.',
      compartmentAssumptions:
        '식당가 점포 사이 칸막이는 천장 속이 뚫려 있다고 가정합니다(덕트·배관 관통부). 방화셔터 작동 여부는 확인되지 않았습니다.',
      openingsAssumptions:
        '점포 출입구는 열려 있고, 중앙 통로는 별마당도서관 광장과 삼성역 연결통로까지 막힘 없이 이어진다고 가정합니다.',
      ventilationAssumptions:
        '지하 공간이라 외부 바람(북북서풍)의 영향은 작고, 제연설비가 충분히 작동하지 않으면 연기가 천장부터 통로 전체로 퍼진다고 가정합니다.',
      suppressionAssumptions:
        '주방 스프링클러는 작동했지만 덕트 속 화재는 꺼지지 않았다고 가정합니다(선착대 보고 기준). 진압하지 않을 경우를 보여주는 예상 시나리오입니다.',
    },
  };
}

function buildPlanSource(scene: SceneSpec): SourceDocument {
  const pages = scene.floors.map((fl) => {
    const stairs = scene.stairs.filter((s) => s.fromFloor <= fl.level && s.toFloor >= fl.level);
    const svg = buildSchematicPlanSvg(fl, `코엑스 ${fl.name}`, BUILDING_DIMS, stairs);
    return {
      pageNumber: fl.level,
      label: fl.name,
      svgDataUrl: svgToDataUrl(svg),
      extractedSummary:
        fl.level === -1
          ? '지하1층: 식당가(B-12 한식당 주방·홀, A구역), 중앙 통로, 별마당도서관 방면 광장, 남측 매장가, 삼성역 연결통로, 서측·동측 피난계단. (시연용 가정 배치)'
          : fl.level === 1
            ? '1층: 그랜드볼룸, 동문 GATE 방면 로비, 방재센터. (시연용 가정 배치)'
            : '2층: 아셈볼룸, 컨퍼런스룸(북), 로비 복도. (시연용 가정 배치)',
    };
  });
  return {
    id: PLAN_ID,
    title: '코엑스 지하1층·1층·2층 시연용 평면도 (가상)',
    originalTitle: 'COEX_시연용_평면도_B1_1F_2F.svg',
    url: pages[0].svgDataUrl,
    mimeType: 'image/svg+xml',
    status: 'applied',
    pageCount: pages.length,
    matchedFloor: -1,
    previewUrl: pages[0].svgDataUrl,
    pages,
    extractedElements: scene.floors.flatMap((f) => f.rooms.map((r) => r.id)).concat(
      scene.stairs.map((s) => s.id)
    ),
    buildingRevision: REV,
  };
}

function buildSiteSource(): SourceDocument {
  return {
    id: SITE_ID,
    title: '코엑스 위치도·출입구 (시연용 도식)',
    originalTitle: 'COEX_시연용_위치도.svg',
    url: COEX_GEOCODE_MAP_URL,
    mimeType: 'image/svg+xml',
    status: 'applied',
    previewUrl: COEX_GEOCODE_MAP_URL,
    extractedElements: ['b1-samseong-link', 'f1-lobby'],
    buildingRevision: REV,
  };
}

export function createCoexIncidentState(): IncidentState {
  const now = Date.now();
  const tBase = now - 190000;
  const scene = createCoexScene(now);
  const planSource = buildPlanSource(scene);
  const siteSource = buildSiteSource();

  const personEntries: PersonLocationEntry[] = [
    {
      id: 'pe-b1-dining-family',
      label: '가족 3명(성인 1·아동 2) — 식당 홀 안쪽 좌석',
      count: 3,
      floor: -1,
      roomId: 'b1-dining',
      areaLabel: '식당가 B-12 한식당 홀 (지하1층)',
      position: [-15, -4.6, -2],
      mobilityOrInjury: '아동 2명 포함 · 연기 흡입 우려',
      lastKnownTime: '14:12',
      provenance: 'observation',
      sourceId: PLAN_ID,
      buildingRevision: REV,
    },
    {
      id: 'pe-b1-staff',
      label: '주방 직원 1명 — 연기 흡입 (지하1층, 정확한 위치 미상)',
      count: 1,
      floor: -1,
      areaLabel: '지하1층 (위치 미상)',
      position: [-8, -4.6, 1],
      mobilityOrInjury: '연기 흡입 · 기침',
      lastKnownTime: '14:13',
      provenance: 'relayed',
      buildingRevision: REV,
    },
    {
      id: 'pe-unknown-restroom',
      label: '화장실 간 일행 2명 — 연락 안 됨 (위치 미상)',
      count: 2,
      floor: undefined,
      areaLabel: '위치 미상',
      lastKnownTime: '14:05',
      provenance: 'relayed',
      buildingRevision: REV,
    },
  ];
  const peopleSummary = reconcilePeopleSummary(personEntries, REV, 6);

  const ts = (offsetMs: number) => new Date(tBase + offsetMs).toISOString();

  const trace: ResearchTraceData = {
    runId: 'trace-coex-1',
    buildingRevision: REV,
    clueTrigger: '신고자가 "코엑스몰 지하 1층 식당가 한식당 주방 화재"를 신고',
    status: 'completed',
    startedAt: ts(12000),
    completedAt: ts(60000),
    branches: [
      {
        id: 'identity_geo',
        title: '위치·출동 경로',
        subagentName: '위치 조사 AI',
        status: 'completed',
        summary: '영동대로 513 (북위 37.5119°, 동경 127.0589°) · 강남소방서 도로 1.2km · 최초 출동 9대',
        sourceIds: [SITE_ID],
        findings: [
          '건물 확인: **코엑스 (스타필드 코엑스몰)**, 서울 강남구 영동대로 513. 강남소방서 관할.',
          '차량 진입: 영동대로 쪽 **동문 GATE**, 봉은사로 쪽 **북문 GATE**. 지하는 **삼성역 5·6번 출구(밀레니엄 광장)**, **봉은사역 7번 출구(아셈플라자)**와 연결.',
          '최초 출동(관할 + 가장 가까운 타관할): **강남소방서**에서 **삼성펌프**(선착)·**삼성100**·**삼성구급**·**현장대응단 지휘차**, **영동119안전센터**에서 **영동펌프**·**영동구급**, **역삼119안전센터**에서 **역삼펌프**·**역삼구급**, 송파소방서 **잠실119안전센터**에서 **잠실펌프**(타관할, 삼성역 쪽 가장 가까운 펌프차).',
          `도착 시간은 카카오내비 도로 경로 실측값(${COEX_ROUTE_MEASURED_AT}) — 긴급차량은 더 빠를 수 있으며, 실행 시 실시간 교통 탭에서 갱신.`,
        ],
        steps: [
          {
            id: 'st-coex-geo-1',
            label: '"영동대로 513 코엑스" 위치 확인',
            status: 'completed',
            toolName: 'maps.geocode',
            detail: '북위 37.5119°, 동경 127.0589°',
            timestamp: ts(15000),
          },
          {
            id: 'st-coex-geo-2',
            label: '동문·북문·서문·남측 진입 경로와 차량 배치 위치 계산',
            status: 'completed',
            toolName: 'routes.computeRoutes',
            detail: '삼성펌프 → 동문 1.2km·약 8분, 영동펌프 → 북문 3.1km·약 10분, 역삼펌프 → 서문 2.8km·약 11분, 잠실펌프 → 남측 3.3km·약 11분 (일반 차량 기준)',
            timestamp: ts(25000),
          },
        ],
      },
      {
        id: 'building_specs',
        title: '건물 구조·용도',
        subagentName: '건물 정보 조사 AI',
        status: 'completed',
        summary: '지하 쇼핑몰 + 지상 컨벤션센터 복합 건물 · 다중이용시설',
        sourceIds: [PLAN_ID],
        findings: [
          '지하1층 **스타필드 코엑스몰**(식당가·매장·별마당도서관)과 지상 **컨벤션센터**(1층 그랜드볼룸, 2층 아셈볼룸)가 연결된 복합 건물.',
          '주말 오후라 지하몰 이용객이 많을 것으로 예상 → 대피 인원 파악이 우선.',
          '화재층이 **지하**라 연기가 빠져나갈 곳이 적고, 연결통로를 따라 **삼성역 쪽으로 연기가 이동**할 수 있음.',
        ],
        steps: [
          {
            id: 'st-coex-bldg-1',
            label: '코엑스 시설 구성 조회',
            status: 'completed',
            toolName: 'argon.searchGrounding',
            detail: '컨벤션센터 층별 시설, 지하몰·지하철 연결 정보 확인',
            timestamp: ts(22000),
          },
        ],
      },
      {
        id: 'images_plans',
        title: '도면·사진',
        subagentName: '도면 분석 AI',
        status: 'completed',
        summary: '시연용 평면도 3장(지하1층·1층·2층) · 호실 13곳 · 피난계단 2곳',
        sourceIds: [PLAN_ID, SITE_ID],
        findings: [
          '실제 도면을 구할 수 없어 **시연용 가정 평면도**로 3D를 구성했습니다. 실제 대응에는 방재센터 도면 확인이 필요합니다.',
          '지하1층: 식당가 B-12 한식당(화점) 남쪽으로 **중앙 통로**, 동쪽으로 **별마당도서관 방면 광장**, 남동쪽 끝에 **삼성역 연결통로**.',
        ],
        steps: [
          {
            id: 'st-coex-plan-1',
            label: '시연용 평면도로 3D 구조 생성',
            status: 'completed',
            toolName: 'argon.analyzeMultimodalScene',
            detail: '3개 층 · 호실 13곳 · 계단 2곳',
            timestamp: ts(40000),
            sourceIds: [PLAN_ID],
          },
        ],
      },
      {
        id: 'materials_systems',
        title: '위험요소·소방설비',
        subagentName: '위험요소 조사 AI',
        status: 'completed',
        summary: '주방 가스·식용유 · 배기 덕트 기름때 · 지하 제연 확인 필요',
        sourceIds: [PLAN_ID],
        findings: [
          '주방: **도시가스 화구·튀김기 식용유**, 천장 속 **공용 배기 덕트** 기름때 → 덕트 화재로 옆 점포 확대 위험.',
          '확인 필요: **가스 중간밸브 차단**, **제연설비·방화셔터 작동**, 방재센터 수신기 경보 구역.',
        ],
        steps: [
          {
            id: 'st-coex-haz-1',
            label: '식당가 주방 위험요소 확인',
            status: 'completed',
            toolName: 'argon.inspectSystems',
            detail: '가스·식용유·덕트',
            timestamp: ts(45000),
          },
        ],
      },
      {
        id: 'weather',
        title: '현장 기상',
        subagentName: '기상 조사 AI',
        status: 'completed',
        summary: '9°C · 습도 45% · 북북서풍 11 km/h (시연용 가정값)',
        sourceIds: [],
        findings: [
          '삼성동 일대 **9°C**, 습도 **45%**, **북북서풍 11 km/h**(순간 18 km/h). (시연용 가정값)',
          '출입구로 나온 연기는 **남남동쪽(테헤란로·삼성역 방면)**으로 흐름 → 임시응급의료소는 **북측 봉은사로변**에 설치.',
        ],
        steps: [
          {
            id: 'st-coex-wx-1',
            label: '삼성동 현재 기상 조회',
            status: 'completed',
            toolName: 'weather.currentConditions',
            detail: '9°C · 45% · NNW 11 km/h',
            timestamp: ts(20000),
          },
        ],
      },
    ],
  };

  return {
    id: 'inc-coex-b1-foodcourt',
    shareToken: 'fs-coex-b1',
    shareExpiresAt: new Date(now + 4 * 3600 * 1000).toISOString(),
    revision: 5,
    buildingRevision: REV,
    title: '코엑스몰 지하1층 식당가 주방 화재',
    status: 'monitoring',
    responseLevel: { ...COEX_RESPONSE_LEVELS.level2, issuedAt: ts(150000) },
    callState: {
      active: true,
      muted: false,
      startedAt: ts(0),
      callerLocation: '별마당도서관 방면으로 대피 후 지상 출구로 이동 중',
      callerRelationship: '식당가 이용객 (직접 목격)',
      questionsAskedCount: 2,
    },
    building: {
      name: COEX_BUILDING_NAME,
      seoulCityDataArea: '강남 MICE 관광특구',
      address: COEX_ADDRESS,
      coordinates: { ...COEX_COORDS },
      googleMapsUri:
        'https://www.google.com/maps/search/?api=1&query=%EC%BD%94%EC%97%91%EC%8A%A4+%EC%98%81%EB%8F%99%EB%8C%80%EB%A1%9C+513',
      use: '전시·컨벤션센터, 지하 쇼핑몰(스타필드 코엑스몰), 별마당도서관',
      floorCount: 3,
      heightMeters: BUILDING_DIMS.height,
      constructionType: '지하 쇼핑몰 + 지상 컨벤션센터 복합 건물 (시연용 단순화 모델)',
      renovationNotes: '호실 배치는 시연용 가정 — 실제 대응 시 방재센터 도면으로 확인 필요',
      nearbyStations: createCoexStations(),
      accessRoads: [
        '영동대로 — 동문 GATE (삼성펌프·삼성100·송파100)',
        '봉은사로 — 북문 GATE (영동펌프·개포펌프), 임시응급의료소, 봉은사역 사거리 현장지휘소',
        '봉은사로86길·테헤란로87길 — 서문 (역삼펌프·서초100)',
        '영동대로 남측 밀레니엄광장 — 삼성역 연결 (잠실펌프·수서펌프)',
        '테헤란로·삼성역 — 지하 연결통로 (연기 이동 방향)',
      ],
    },
    facts: [
      {
        id: 'fact-coex-loc',
        category: 'location',
        statement: '코엑스몰 지하1층 식당가 B-12 한식당 주방 (서울 강남구 영동대로 513).',
        provenance: 'observation',
        confidence: 'confirmed_report',
        floor: -1,
        roomId: 'b1-kitchen',
        areaLabel: '식당가 B-12 한식당 주방',
        reportedBy: '신고자',
        createdAt: ts(4000),
        buildingRevision: REV,
      },
      {
        id: 'fact-coex-fire',
        category: 'fire_smoke',
        statement: '주방에서 불길이 올라오고 검은 연기가 중앙 통로 천장을 따라 퍼지는 중.',
        provenance: 'observation',
        confidence: 'confirmed_report',
        floor: -1,
        roomId: 'b1-kitchen',
        areaLabel: '주방 → 중앙 통로',
        reportedBy: '신고자',
        createdAt: ts(6000),
        buildingRevision: REV,
      },
      {
        id: 'fact-coex-people',
        category: 'people_life_risk',
        statement:
          '구조대상자 총 6명: 식당 홀 안쪽 가족 3명(아동 2명 포함, 직접 목격), 주방 직원 1명 연기 흡입(위치 미상), 화장실 간 일행 2명 연락 안 됨.',
        provenance: 'observation',
        confidence: 'confirmed_report',
        floor: -1,
        roomId: 'b1-dining',
        areaLabel: '식당 홀 3명 + 지하1층 1명 + 위치 미상 2명',
        reportedBy: '신고자',
        createdAt: ts(35000),
        buildingRevision: REV,
      },
      {
        id: 'fact-coex-haz',
        category: 'hazards',
        statement: '주방 도시가스 화구·식용유, 천장 속 배기 덕트 기름때. 가스 중간밸브 차단 확인 필요.',
        provenance: 'document',
        confidence: 'uncertain',
        floor: -1,
        roomId: 'b1-kitchen',
        sourceId: PLAN_ID,
        sourcePage: -1,
        reportedBy: 'AI 위험요소 조사',
        createdAt: ts(60000),
        buildingRevision: REV,
      },
    ],
    peopleSummary,
    sources: [planSource, siteSource],
    scene,
    weather: {
      temperatureCelsius: 9,
      relativeHumidity: 45,
      windSpeedKmh: 11,
      windGustKmh: 18,
      windDirectionFromDeg: 338,
      windCardinalFrom: 'NNW',
      conditionText: '맑음 (시연용 가정값)',
      conditionType: 'CLEAR',
      precipitationText: '강수 없음',
      placeName: '서울 강남구 삼성동 (시연용 가정값)',
      observationTime: new Date(now - 300000).toISOString(),
      sourceName: '시연용 가정값',
      sourceUrl: null,
      buildingRevision: REV,
    },
    timeline: [
      {
        id: 'evt-coex-call-1',
        type: 'caller_utterance',
        speaker: '신고자',
        speakerRole: 'caller',
        text: '119죠? 불났어요! 코엑스몰 지하 1층 식당가인데요, 한식당 주방에서 불길이 확 올라오고 검은 연기가 엄청 나와요!',
        createdAt: ts(4000),
        buildingRevision: REV,
      },
      {
        id: 'evt-coex-ct-1',
        type: 'call_taker_utterance',
        speaker: 'AI 접수요원',
        speakerRole: 'call_taker',
        text: '코엑스몰 지하 1층 식당가 한식당 주방 화재로 접수했습니다. 소방차가 출동합니다. 지금 신고자분은 안전한 곳에 계신가요? 건물 밖으로 나오셨나요?',
        createdAt: ts(11000),
        buildingRevision: REV,
      },
      {
        id: 'evt-coex-trace-1',
        type: 'research_trace',
        speaker: 'FireSight 조사 AI',
        speakerRole: 'research_orchestrator',
        text: '**코엑스(영동대로 513)** 위치와 진입로(**북문·동문·서문**, 삼성역·봉은사역 연결통로)를 확인하고, 시연용 평면도로 **지하1층 식당가·1층·2층** 3D 구조를 만들었습니다. **최초 출동지령**(서울시 규칙 별표1 1차출동: 관할·인접 119안전센터 + 관할서 현장대응단, 공동관할 인접 **잠실펌프** 포함) 9대: 삼성펌프·삼성탱크·삼성100·삼성구급·현장대응단 지휘차, 영동펌프·영동구급, 역삼펌프, 잠실펌프.',
        createdAt: ts(14000),
        buildingRevision: REV,
        traceData: trace,
      },
      {
        id: 'evt-coex-call-2',
        type: 'caller_utterance',
        speaker: '신고자',
        speakerRole: 'caller',
        text: '저는 별마당도서관 쪽으로 빠져나왔어요. 그런데 그 식당 안쪽 자리에 아이 둘 데리고 온 가족 세 명이 아직 못 나온 것 같아요. 주방 직원 한 분은 연기를 많이 마셨다고 했고, 화장실 간 일행 두 명은 연락이 안 된대요. 식당가에 사람이 엄청 많았는데 다들 별마당이랑 삼성역 쪽으로 몰려 나가고 있어요.',
        createdAt: ts(32000),
        buildingRevision: REV,
      },
      {
        id: 'evt-coex-ct-2',
        type: 'call_taker_utterance',
        speaker: 'AI 접수요원',
        speakerRole: 'call_taker',
        text: '구조대상자 6명으로 기록했습니다. 연기가 따라올 수 있으니 엘리베이터는 타지 마시고 별마당 쪽 출구 계단으로 지상까지 나가 주세요. 혹시 그 식당 주방에 가스통이나 기름 같은 위험한 물건이 있었나요?',
        createdAt: ts(42000),
        buildingRevision: REV,
      },
      {
        id: 'evt-coex-model-1',
        type: 'model_update',
        speaker: 'FireSight 3D 모델러',
        speakerRole: 'firesight_ai',
        text: '**코엑스 지하1층 식당가·1층·2층** 3D 구조를 만들고(시연용 평면도 기준), 최초 출동대를 배치했습니다: 연기가 남남동(삼성역 쪽)으로 흐르므로 **북문을 급기측 주 진입**(SOP 216 2.9)으로 삼성펌프·삼성탱크·삼성100, **동문** 영동펌프, **서문** 역삼펌프, **배기측 삼성역 연결부** 잠실펌프(차단·대피 유도), **봉은사역 사거리** 현장지휘소, **북측 봉은사로변** 임시응급의료소.',
        createdAt: ts(70000),
        buildingRevision: REV,
        modelUpdate: {
          updateId: 'mu-coex-1',
          buildingRevision: REV,
          summary:
            '**코엑스 지하1층 식당가** 3D 구성 · 화점 **B-12 한식당 주방** · 최초 출동대 출입구별 배치 · **임시응급의료소** 봉은사로변',
          focusElementId: 'b1-kitchen',
          focusFloor: -1,
          sourceRefs: [
            { sourceId: PLAN_ID, title: 'COEX_시연용_평면도_B1_1F_2F.svg', page: -1 },
            { sourceId: SITE_ID, title: 'COEX_시연용_위치도.svg' },
          ],
          quarantinedCount: 0,
        },
      },
      {
        id: 'evt-coex-field-1',
        type: 'field_report',
        speaker: '삼성펌프 · 선착대장',
        speakerRole: 'responder',
        text: '삼성펌프 현장도착, 삼성펌프 현장지휘. 북문 GATE(급기측) 배치, 삼성탱크 급수 연결. 방재센터 확인: 지하1층 B-12 감지기 작동, 스프링클러 작동 중, 제연설비 가동·식당가 방화셔터 일부 미작동. 배기 덕트 따라 천장 속 연기 확산, 중앙 통로 연기 하강. 다중이용장소 화재 — 대응 1단계 발령 요청.',
        createdAt: ts(90000),
        captureTime: ts(86000),
        buildingRevision: REV,
        fieldReport: {
          reportId: 'fr-coex-1',
          reporterName: '삼성펌프 · 선착대장',
          captureTime: ts(86000),
          publishedAt: ts(90000),
          floor: -1,
          roomId: 'b1-kitchen',
          placeLabel: '지하1층 식당가 B-12 주방',
          humanDescription:
            '선착대장 지휘선언(SOP 100 1.1). 방재센터 수신반에서 B-12 감지기 작동·스프링클러 작동·제연설비 가동 확인, 식당가 방화셔터 일부 미작동(SOP 235). 배기 덕트 따라 천장 속 연기 확산, 중앙 통로 연기 하강(바닥에서 약 1.5m). 급기측 북문으로 라이트라인 설치 후 진입. 다중이용장소 화재로 대응 1단계 발령 요청(SOP 100 1.3).',
          aiVisualSummary:
            '보고 내용이 **B-12 주방(`b1-kitchen`)** 화점과 일치합니다. **배기 덕트 화재**로 옆 점포 천장 속 확대 가능성 — 미작동 방화셔터는 관창 배치로 대신 차단(SOP 216 2.5). (사진 없음 — 대원 보고 내용만 반영)',
          deliveryStatus: 'delivered',
          linkedElementId: 'b1-kitchen',
          buildingRevision: REV,
        },
      },
      {
        id: 'evt-coex-dispatch-1',
        type: 'team_message',
        speaker: '강남소방서 현장대응단장',
        speakerRole: 'dispatcher',
        text: [
          '**대응 1단계 발령** — 코엑스몰 지하1층 식당가, 다중이용장소 재난 (서울시 긴급구조 지휘 조례 시행규칙 별표2).',
          '현장대응단장 지휘권 선언(SOP 102), 현장지휘소 봉은사역 사거리(SOP 101). **강남소방서 전 소방력** 투입·비상소집:',
          '',
          coexDispatchTableMarkdown('level1'),
          '',
          `최초 ${COEX_UNIT_COUNTS.initial}대 + 1단계 ${COEX_UNIT_COUNTS.level1}대. 도착 시간은 카카오내비 실측(${COEX_ROUTE_MEASURED_AT}).`,
        ].join('\n'),
        createdAt: ts(100000),
        buildingRevision: REV,
      },
      {
        id: 'evt-coex-ai-1',
        type: 'ai_answer',
        speaker: 'FireSight',
        speakerRole: 'firesight_ai',
        text: [
          '### 코엑스몰 지하1층 식당가 화재 — 상황 종합',
          '신고·선착대 보고·시연용 평면도를 종합했습니다 (`정보 수정 #1`):',
          '',
          '| 구역 | 상태 | 대응 참고 (SOP) |',
          '| :--- | :--- | :--- |',
          '| **B-12 한식당 주방** (`b1-kitchen`) | **화염 + 검은 연기** | 배기 덕트 확대 주의 · 미작동 방화셔터는 관창으로 차단 (216 2.5) |',
          '| **B-12 한식당 홀** (`b1-dining`) | **구조대상자 3명** (아동 2) | 서측 특별피난계단 1 · 구조 우선 (216·203) |',
          '| **중앙 통로** (`b1-concourse`) | **연기만** (화염 없음) | 급기측(북문) 진입 원칙 (216 2.9) · 라이트라인 (217 2.1) |',
          '| **삼성역 연결통로** (`b1-samseong-link`) | 연기 유입 우려 | **지하철 운행 통제** (216 2.1) · 출입구 통제·유도요원 (217 2.4) |',
          '| **지하1층 위치 미상** | 주방 직원 1명 (연기 흡입) | 임시 현장응급의료소 분류반 (402 2) |',
          '| **위치 미상** | 일행 2명 연락 안 됨 | 화장실 등 인명검색 중점지역 (202 4.2) |',
        ].join('\n'),
        createdAt: ts(110000),
        buildingRevision: REV,
        sourceCitations: [
          { sourceId: PLAN_ID, title: '코엑스 시연용 평면도 (지하1층)', page: -1, elementId: 'b1-kitchen' },
          { sourceId: SITE_ID, title: '코엑스 위치도 (시연용)' },
        ],
        considerationsForDispatch: [
          '**대응 2단계 상향 기준 점검** (서울시 규칙 별표2): 인명대피 **100명 이상**, 다중이용장소 인명피해 10명 이상, 인명피해 10~20명 중 하나면 2단계(2~5개 소방서). 신고자 진술상 별마당·삼성역 쪽 대피 인원이 많음 → **배기측(삼성역 연결부) 대피 인원 확인** 필요.',
          '**구조 인력**: 삼성100 1개 대로 식당 홀 3명 구조와 위치 미상 2명 검색을 동시에 못 함. 2단계 시 **서초100·송파100**(일반 차량 기준 약 25분·38분) — 도착 전까지 삼성100이 구조 후 1차 검색(SOP 202 5.1 우선탐색).',
          '**안전**: 지하 진입 대원 2인 1조·진입 현황 관리(SOP 201 3.7), **세곡펌프 RIT** 지휘소 대기(SOP 100 4.6), 지하 무선 통신 보조설비·간이중계기(SOP 216 2.4).',
          '**구급**: 임시 현장응급의료소장 = 선착 구급대원(삼성구급), 분류반·응급처치반·이송반 구성, START 분류 후 특정 병원 집중 방지(SOP 402). **보건소장 도착 시 응급의료소로 이양**(SOP 402 3).',
          '**유관기관**: 서울교통공사(삼성역 2호선)·9호선(봉은사역) **운행 통제**, 경찰 교통 통제, 도시가스 차단, 방재센터 관계자 지휘소 합류.',
        ],
      },
      {
        id: 'evt-coex-field-2',
        type: 'field_report',
        speaker: '잠실펌프 · 대장',
        speakerRole: 'responder',
        text: '잠실펌프 남측 삼성역 연결부 도착. 연결통로 방화셔터 1개소 미작동, 연기 유입 중 — 관창 배치해 차단. 연결통로·별마당 방면으로 쇼핑객·지하철 이용객 약 300명 대피 중, 출입구 통제·유도요원 배치. 대피 인원 100명 이상.',
        createdAt: ts(130000),
        captureTime: ts(126000),
        buildingRevision: REV,
        fieldReport: {
          reportId: 'fr-coex-2',
          reporterName: '잠실펌프 · 대장',
          captureTime: ts(126000),
          publishedAt: ts(130000),
          floor: -1,
          roomId: 'b1-samseong-link',
          placeLabel: '지하1층 삼성역 연결통로',
          humanDescription:
            '연결통로 방화셔터 1개소 미작동, 연기 유입 — 관창 배치로 차단(SOP 216 2.5). 쇼핑객·지하철 이용객 약 300명 별마당·삼성역 방면 대피 중, 출입구 통제·유도요원 배치(SOP 217 2.4). 서울교통공사에 운행 통제 요청 필요(SOP 216 2.1).',
          aiVisualSummary:
            '**인명대피 약 300명**은 서울시 규칙 별표2의 **대응 2단계 기준(인명대피 100명 이상)**에 해당합니다. 배기측이므로 이 방향으로는 진입하지 말고 차단·대피 유도만 유지하세요. (사진 없음 — 대원 보고 내용만 반영)',
          deliveryStatus: 'delivered',
          linkedElementId: 'b1-samseong-link',
          buildingRevision: REV,
        },
      },
      {
        id: 'evt-coex-dispatch-2',
        type: 'team_message',
        speaker: '강남소방서장 · 긴급구조통제단장',
        speakerRole: 'dispatcher',
        text: [
          '**대응 2단계 발령** — 인명대피 100명 이상, 다중이용장소 (별표2). 강남소방서장 지휘권 인수(SOP 102, 현행 규칙 제8조).',
          '종합상황실 지원출동 요청(규칙 제3조②) → 인접 **서초·송파** 소방력 출동:',
          '',
          coexDispatchTableMarkdown('level2'),
          '',
          `총 ${COEX_UNIT_COUNTS.total}대 (최초 ${COEX_UNIT_COUNTS.initial} · 1단계 ${COEX_UNIT_COUNTS.level1} · 2단계 ${COEX_UNIT_COUNTS.level2}). 1차 상황판단회의 소집(SOP 106, 규칙 제12조).`,
        ].join('\n'),
        createdAt: ts(150000),
        buildingRevision: REV,
      },
      {
        id: 'evt-coex-field-3',
        type: 'field_report',
        speaker: '삼성100 · 구조대장',
        speakerRole: 'responder',
        text: '삼성100 진입. 식당 홀 안쪽 좌석에서 구조대상자 3명(성인 1, 아동 2) 확인, 서측 특별피난계단 1로 구조 중. 주방 직원 1명 중앙 통로에서 발견, 임시응급의료소 인계. 화장실 쪽 2명 1차 검색 중 — 서초100(서측)·송파100(동측) 도착 시 교차탐색 인계.',
        createdAt: ts(170000),
        captureTime: ts(166000),
        buildingRevision: REV,
        fieldReport: {
          reportId: 'fr-coex-3',
          reporterName: '삼성100 · 구조대장',
          captureTime: ts(166000),
          publishedAt: ts(170000),
          floor: -1,
          roomId: 'b1-dining',
          placeLabel: '지하1층 식당가 B-12 한식당 홀',
          humanDescription:
            '식당 홀 안쪽 좌석에서 구조대상자 3명(성인 1, 아동 2) 확인, 서측 특별피난계단 1로 구조 중. 주방 직원 1명 중앙 통로에서 발견, 임시응급의료소 인계. 화장실 쪽 2명 1차 검색 중 — 서초100(서측)·송파100(동측) 도착 시 교차탐색(SOP 202 5.2) 인계.',
          aiVisualSummary:
            '**식당 홀(`b1-dining`)** 구조대상자 3명 위치와 일치합니다. 위치 미상 **2명**은 서초100(약 25분)·송파100(약 38분) 도착 전까지 삼성100 우선탐색을 유지하세요. (사진 없음 — 대원 보고 내용만 반영)',
          deliveryStatus: 'delivered',
          linkedElementId: 'b1-dining',
          buildingRevision: REV,
        },
      },
    ],
  };
}
