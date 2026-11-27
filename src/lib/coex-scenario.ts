/**
 * 데모 3 — 코엑스몰 지하1층 식당가 화재 (서울 강남구 영동대로 513, 강남소방서 관할)
 *
 * 시연용 시나리오다. 건물 이름·주소·주변 도로·출입구·연결 역, 소방서·119안전센터 위치는
 * 공개 자료와 구글 지도(2026-11 확인) 기준이다. 호실 배치·인원·기상·도착 시간은 시연을 위한 가정값이다.
 *  - 강남소방서 = 삼성119안전센터와 같은 청사: 서울 강남구 테헤란로 629 (코엑스에서 직선 약 730m)
 *  - 영동119안전센터: 강남구 도산대로 320 (직선 약 2.2km) / 역삼119안전센터: 강남구 역삼로 236 (직선 약 2.2km)
 *  - 코엑스 동문 정류장(영동대로), 봉은사.코엑스북문 정류장(봉은사로) 위치 기준으로 차량 배치
 *  - 구글 지도는 한국 자동차 길찾기를 지원하지 않아 도착 시간은 직선거리 기반 추정값
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
    stagingCandidates: [
      {
        id: 'stg-samseong-pump',
        type: 'truck_staging',
        label: '삼성펌프 — 영동대로 동문 GATE 앞',
        coordinates: { lat: 37.51219, lng: 127.06081 },
        localPosition: [31, 0, 3],
        status: 'selected',
        placedBy: 'research_candidate',
        risks: ['영동대로 차량 통행 많음 — 진입 차선 통제 필요'],
        outstandingChecks: ['동문 측 송수구·옥내소화전 위치 확인'],
        routeDistanceMeters: 727,
        routeDurationSeconds: 180,
        stationName: '강남소방서·삼성119안전센터 (테헤란로 629)',
        buildingRevision: REV,
      },
      {
        id: 'stg-yeongdong-pump',
        type: 'truck_staging',
        label: '영동펌프 — 봉은사로 북문 GATE 앞',
        coordinates: { lat: 37.51356, lng: 127.05756 },
        localPosition: [4, 0, -22],
        status: 'candidate',
        placedBy: 'research_candidate',
        risks: ['북문 진입로 폭 확인 필요'],
        outstandingChecks: ['봉은사로 쪽 소화전 위치 확인'],
        routeDistanceMeters: 2240,
        routeDurationSeconds: 420,
        stationName: '영동119안전센터 (도산대로 320)',
        buildingRevision: REV,
      },
      {
        id: 'stg-med-north',
        type: 'medical_post',
        label: '임시응급의료소 — 북측 봉은사로변 (바람 불어오는 쪽) · 삼성구급·역삼구급',
        coordinates: { lat: 37.5147, lng: 127.057 },
        localPosition: [-16, 0, -21],
        status: 'selected',
        placedBy: 'research_candidate',
        risks: ['연기는 남남동쪽(테헤란로·삼성역 방면)으로 흐름 — 의료소는 북측 유지'],
        outstandingChecks: ['보건소장 도착 시 응급의료소로 전환', '구급차 출입 동선 확보'],
        routeDistanceMeters: 727,
        routeDurationSeconds: 180,
        stationName: '삼성구급 · 역삼구급',
        buildingRevision: REV,
      },
    ],
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
        summary: '영동대로 513 (북위 37.5119°, 동경 127.0589°) · 강남소방서·삼성119안전센터 직선 0.7km',
        sourceIds: [SITE_ID],
        findings: [
          '건물 확인: **코엑스 (스타필드 코엑스몰)**, 서울 강남구 영동대로 513. 강남소방서 관할.',
          '차량 진입: 영동대로 쪽 **동문 GATE**, 봉은사로 쪽 **북문 GATE**. 지하는 **삼성역 5·6번 출구(밀레니엄 광장)**, **봉은사역 7번 출구(아셈플라자)**와 연결.',
          '출동: **강남소방서·삼성119안전센터**(테헤란로 629, 직선 약 0.7km)에서 **삼성펌프**(선착)·**삼성100**(구조)·**삼성구급**, **영동119안전센터**(도산대로 320)에서 **영동펌프**, **역삼119안전센터**(역삼로 236)에서 **역삼구급**. (도착 시간은 직선거리 기반 추정)',
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
            label: '동문·북문 GATE 진입 경로와 차량 배치 위치 계산',
            status: 'completed',
            toolName: 'routes.computeRoutes',
            detail: '삼성펌프(테헤란로 629) → 동문 GATE 0.7km, 영동펌프(도산대로 320) → 북문 GATE 2.2km',
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
      nearbyStations: [
        {
          id: 'st-samseong',
          name: '강남소방서·삼성119안전센터 (삼성펌프·삼성구급·삼성100)',
          address: '서울 강남구 테헤란로 629 · 직선 0.7km · 도착 시간은 추정',
          coordinates: { lat: 37.51029, lng: 127.06686 },
          distanceMeters: 727,
          durationSeconds: 180,
        },
        {
          id: 'st-yeongdong',
          name: '영동119안전센터 (영동펌프·영동구급)',
          address: '서울 강남구 도산대로 320 · 직선 2.2km · 도착 시간은 추정',
          coordinates: { lat: 37.52206, lng: 127.03694 },
          distanceMeters: 2240,
          durationSeconds: 420,
        },
        {
          id: 'st-yeoksam',
          name: '역삼119안전센터 (역삼구급)',
          address: '서울 강남구 역삼로 236 · 직선 2.2km · 도착 시간은 추정',
          coordinates: { lat: 37.49719, lng: 127.04244 },
          distanceMeters: 2190,
          durationSeconds: 420,
        },
      ],
      accessRoads: [
        '영동대로 — 동문 GATE (삼성펌프 배치)',
        '봉은사로 — 북문 GATE (영동펌프 배치 후보, 임시응급의료소)',
        '봉은사로86길·테헤란로87길 — 서측 이면도로',
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
        text: '**코엑스(영동대로 513)** 위치와 진입로(**동문·북문 GATE**, 삼성역·봉은사역 연결통로)를 확인하고, 시연용 평면도로 **지하1층 식당가·1층·2층** 3D 구조를 만들었습니다. 출동: **삼성펌프**(선착)·**영동펌프**, **삼성100**, **삼성구급**·**역삼구급**.',
        createdAt: ts(14000),
        buildingRevision: REV,
        traceData: trace,
      },
      {
        id: 'evt-coex-call-2',
        type: 'caller_utterance',
        speaker: '신고자',
        speakerRole: 'caller',
        text: '저는 별마당도서관 쪽으로 빠져나왔어요. 그런데 그 식당 안쪽 자리에 아이 둘 데리고 온 가족 세 명이 아직 못 나온 것 같아요. 주방 직원 한 분은 연기를 많이 마셨다고 했고, 화장실 간 일행 두 명은 연락이 안 된대요.',
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
        text: '**코엑스 지하1층 식당가·1층·2층** 3D 구조를 만들고(시연용 평면도 기준), **삼성펌프**를 동문 GATE 앞에, **임시응급의료소**를 북측 봉은사로변(바람 불어오는 쪽)에 배치했습니다.',
        createdAt: ts(70000),
        buildingRevision: REV,
        modelUpdate: {
          updateId: 'mu-coex-1',
          buildingRevision: REV,
          summary:
            '**코엑스 지하1층 식당가** 3D 구성 · 화점 **B-12 한식당 주방** · **삼성펌프** 동문 GATE · **임시응급의료소** 봉은사로변',
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
        id: 'evt-coex-ai-1',
        type: 'ai_answer',
        speaker: 'FireSight',
        speakerRole: 'firesight_ai',
        text: [
          '### 코엑스몰 지하1층 식당가 화재 — 상황 종합',
          '신고 내용과 시연용 평면도를 종합했습니다 (`정보 수정 #1`):',
          '',
          '| 구역 | 상태 | 대응 참고 |',
          '| :--- | :--- | :--- |',
          '| **B-12 한식당 주방** (`b1-kitchen`) | **화염 + 검은 연기** | 가스 화구·식용유 · **배기 덕트 확대 주의** |',
          '| **B-12 한식당 홀** (`b1-dining`) | **구조대상자 3명** (아동 2) | 서측 특별피난계단 1이 가장 가까움 |',
          '| **중앙 통로** (`b1-concourse`) | **연기만** (화염 없음) | 천장 따라 광장·삼성역 쪽으로 이동 |',
          '| **삼성역 연결통로** (`b1-samseong-link`) | 연기 유입 우려 | 지하철 이용객 대피 동선과 겹침 |',
          '| **지하1층 위치 미상** | 주방 직원 1명 (연기 흡입) | 삼성구급 우선 이송 대상 |',
          '| **위치 미상** | 일행 2명 연락 안 됨 | 3D에 표시하지 않음 · 수색 필요 |',
        ].join('\n'),
        createdAt: ts(85000),
        buildingRevision: REV,
        sourceCitations: [
          { sourceId: PLAN_ID, title: '코엑스 시연용 평면도 (지하1층)', page: -1, elementId: 'b1-kitchen' },
          { sourceId: SITE_ID, title: '코엑스 위치도 (시연용)' },
        ],
        considerationsForDispatch: [
          '**구조**: 구조대상자 6명 중 3명만 위치 확인 → **삼성100** 투입 후 위치 미상 2명 수색에 인원이 부족하면 **서초100** 추가 출동 요청 검토.',
          '**연기 확산**: 지하 중앙 통로 → **삼성역 연결통로** 방향. 방재센터에 **제연설비 가동·방화셔터 작동** 확인, 지하철 쪽 대피 통제 요청.',
          '**가스**: 식당가 **가스 중간밸브 차단** 확인 전까지 재발화 위험.',
          '**구급**: **삼성구급** 주방 직원 연기 흡입 우선 이송, **역삼구급**은 아동 포함 가족 3명 대비. 임시응급의료소는 북측 봉은사로변(풍상측).',
        ],
      },
      {
        id: 'evt-coex-field-1',
        type: 'field_report',
        speaker: '삼성펌프 · 선착대장',
        speakerRole: 'responder',
        text: '삼성펌프 현장 도착, 동문 GATE 앞 배치. 지하1층 식당가 B-12 주방 화염 확인. 스프링클러 작동 중이나 배기 덕트 따라 천장 속으로 연기 확산. 중앙 통로 연기 하강, 별마당 광장까지 옅은 연기. 옥내소화전 연결해 진입합니다.',
        createdAt: ts(115000),
        captureTime: ts(110000),
        buildingRevision: REV,
        fieldReport: {
          reportId: 'fr-coex-1',
          reporterName: '삼성펌프 · 선착대장',
          captureTime: ts(110000),
          publishedAt: ts(115000),
          floor: -1,
          roomId: 'b1-kitchen',
          placeLabel: '지하1층 식당가 B-12 주방',
          humanDescription:
            '지하1층 식당가 B-12 주방 화염 확인. 스프링클러 작동 중이나 배기 덕트 따라 천장 속으로 연기 확산. 중앙 통로 연기 하강(바닥에서 약 1.5m), 별마당 광장까지 옅은 연기. 동문 GATE 쪽 옥내소화전 연결 후 진입.',
          aiVisualSummary:
            '보고 내용이 **B-12 주방(`b1-kitchen`)** 화점과 일치합니다. **배기 덕트 화재**로 옆 점포(식당가 A구역) 천장 속 확대 가능성이 있습니다. (사진 없음 — 대원 보고 내용만 반영)',
          deliveryStatus: 'delivered',
          linkedElementId: 'b1-kitchen',
          buildingRevision: REV,
        },
      },
      {
        id: 'evt-coex-field-2',
        type: 'field_report',
        speaker: '삼성100 · 구조대장',
        speakerRole: 'responder',
        text: '삼성100 진입. 식당 홀 안쪽 좌석에서 구조대상자 3명(성인 1, 아동 2) 확인, 서측 특별피난계단 1로 구조 중. 주방 직원 1명 중앙 통로에서 발견, 삼성구급 인계. 화장실 쪽 2명은 수색 중이며 인원 부족 시 서초100 지원 요청 예정.',
        createdAt: ts(145000),
        captureTime: ts(142000),
        buildingRevision: REV,
        fieldReport: {
          reportId: 'fr-coex-2',
          reporterName: '삼성100 · 구조대장',
          captureTime: ts(142000),
          publishedAt: ts(145000),
          floor: -1,
          roomId: 'b1-dining',
          placeLabel: '지하1층 식당가 B-12 한식당 홀',
          humanDescription:
            '식당 홀 안쪽 좌석에서 구조대상자 3명(성인 1, 아동 2) 확인, 서측 특별피난계단 1로 구조 중. 주방 직원 1명 중앙 통로에서 발견, 삼성구급 인계. 화장실 쪽 2명 수색 중 — 인원 부족 시 서초100 지원 요청 예정.',
          aiVisualSummary:
            '**식당 홀(`b1-dining`)** 구조대상자 3명 위치와 일치합니다. 남은 위치 미상 **2명** 수색을 위해 **서초100** 추가 출동 요청 시점을 검토하세요. (사진 없음 — 대원 보고 내용만 반영)',
          deliveryStatus: 'delivered',
          linkedElementId: 'b1-dining',
          buildingRevision: REV,
        },
      },
    ],
  };
}
