/**
 * 데모 3(코엑스) 출동 편성·대응단계 — 공식 기준에 근거한 시연용 편성.
 *
 * 근거 (공식 자료)
 *  [규칙] 「긴급구조대응활동 및 현장지휘에 관한 규칙」(행정안전부령) 제10조(재난현장 표준작전절차),
 *         제15조의2(대응단계 발령기준: 현장지휘관이 발령, 세부 기준은 긴급구조대응계획)
 *  [서울] 「서울특별시 사고 및 재난 현장 긴급구조 지휘에 관한 조례 시행규칙」(규칙 제4303호)
 *         제3조·별표1 소방서 출동기준: 기본출동 1개대(관할 센터) / 1차출동 4개대 이상(관할·인접 센터,
 *           관할서 현장대응단) / 2차출동 1~2개대 추가(관할서 센터 전부) — 2차출동 예시: 대형건물·일반상가
 *         제3조② 관할 소방력으로 어려우면 종합상황실에 지원출동 요청 → 즉시 인접 소방관서 출동지령
 *         제4조 공동관할구역: 인접 소방관서가 더 가까우면 1차출동대에 편성
 *         제6조·별표2 대응단계: 1단계 = 1개 소방서 전 소방력(인명피해 10명 미만, 다중이용장소 재난)
 *           / 2단계 = 2~5개 소방서(인명피해 10~20명, 인명대피 100명 이상, 다중이용장소 10명 이상 인명피해)
 *           / 3단계 = 6개 이상 소방서(인명피해 20명 이상, 인명대피 200명 이상)
 *         제8조 지휘권자: 비상발령 전 선착대장·지휘대장 / 대응 1·2단계 자치구 긴급구조통제단장(소방서장)
 *           ※ 2026-11 입법예고 개정안: 1단계 관할 소방서장, 2단계 본부 현장대응단장, 3단계 본부장
 *         제12조 현장 상황판단회의
 *  [SOP] 소방청 「재난현장 표준작전절차」 SOP 100(선착대장 지휘선언·대응단계 발령 요청·RIT),
 *         101(현장지휘소 위치), 102(지휘 이양), 106(상황판단회의), 200(선착대·후착대 차량 배치·급수),
 *         202(진입 순서), 216(지하가화재), 217(지하층화재), 235(소방시설 활용), 402(다수사상자·임시
 *         현장응급의료소: 소장·분류반·응급처치반·이송반, 보건소장 도착 시 이양)
 *
 * 소방서·119안전센터 주소와 좌표: 카카오 로컬 검색(2026-11-28 확인).
 * 도로 거리·소요 시간: 카카오모빌리티 길찾기 API, 2026-11-28(토) 13:15 측정, **일반 차량 기준**.
 * 가정: 송파100은 송파소방서 청사(오금로51길 56)에서 출동(구조대 위치 미확인). 차량 배치 위치·임무 배분,
 *   대피 인원 등은 시연용 시나리오다.
 */
import type {
  NearbyFireStation,
  ResponseLevelState,
  ResponseUnit,
  SceneSpec,
  StagingCandidate,
} from './incident-engine.ts';

export const COEX_ROUTE_MEASURED_AT = '2026-11-28(토) 13:15, 일반 차량 기준';

export type CoexPhase = ResponseUnit['dispatchPhase'];
const PHASE_ORDER: Record<CoexPhase, number> = { initial: 0, level1: 1, level2: 2 };

const ST = {
  gangnam: '강남소방서 (테헤란로 629)',
  yeongdong: '강남 영동119안전센터 (도산대로 320)',
  yeoksam: '강남 역삼119안전센터 (역삼로 236)',
  suseo: '강남 수서119안전센터 (광평로31길 6)',
  gaepo: '강남 개포119안전센터 (논현로10길 19)',
  segok: '강남 세곡119안전센터 (밤고개로 268)',
  jamsil: '송파 잠실119안전센터 (석촌호수로 151) · 인접',
  garak: '송파 가락119안전센터 (양재대로 932) · 타관할',
  seochoC: '서초 서초119안전센터 (효령로 400) · 타관할',
  seocho: '서초소방서 119구조대 (사평대로 67) · 타관할',
  songpa: '송파소방서 (오금로51길 56) · 타관할 · 구조대 위치 가정',
} as const;

const u = (
  callSign: string,
  kind: ResponseUnit['kind'],
  station: string,
  role: string,
  dispatchPhase: CoexPhase,
  routeDistanceMeters: number,
  routeDurationSeconds: number,
  outOfJurisdiction = false
): ResponseUnit => ({
  callSign,
  kind,
  station,
  role,
  dispatchPhase,
  routeDistanceMeters,
  routeDurationSeconds,
  ...(outOfJurisdiction ? { outOfJurisdiction } : {}),
});

/** 배치 위치별 출동 차량 (도착 시간은 해당 배치 위치까지 카카오 길찾기 실측) */
export const COEX_UNITS = {
  north: [
    u('삼성펌프', 'pump', ST.gangnam, '선착 · 지휘선언 · 급기측(북문) 주 진입 [SOP 100·216]', 'initial', 1278, 621),
    u('삼성탱크', 'tanker', ST.gangnam, '삼성펌프 급수 연결 후 소화전 점령 [SOP 200 3.1.1]', 'initial', 1278, 621),
    u('삼성100', 'rescue', ST.gangnam, '식당 홀 구조대상자 3명 구조 (서측 계단 방향)', 'initial', 1278, 621),
    u('수서펌프', 'pump', ST.suseo, '후착 · 북문 수관 2선 연장, 화점 직상층(1층) 경계 [SOP 200·202]', 'level1', 5531, 1702),
  ],
  east: [
    u('영동펌프', 'pump', ST.yeongdong, '동문 연결송수구 송수 · 1층 방화문 경계관창 [SOP 217 2.5]', 'initial', 3069, 635),
    u('개포펌프', 'pump', ST.gaepo, '후착 · 영동대로 소화전 점령, 영동펌프 급수 [SOP 200 3.1.2]', 'level1', 6759, 1910),
    u('송파100', 'rescue', ST.songpa, '위치 미상 2명 인명검색 (동측·화장실) [SOP 202 4]', 'level2', 10596, 2267, true),
  ],
  west: [
    u('역삼펌프', 'pump', ST.yeoksam, '서측 특별피난계단 1 엄호 방수 · 구조 동선 확보', 'initial', 2817, 690),
    u('서초100', 'rescue', ST.seocho, '위치 미상 2명 인명검색 (서측) · 교차탐색 [SOP 202 5.2]', 'level2', 11526, 1516, true),
    u('서초펌프', 'pump', ST.seochoC, '서측 2차 진입 · 서초100 엄호', 'level2', 4903, 1200, true),
  ],
  south: [
    u('잠실펌프', 'pump', ST.jamsil, '배기측 삼성역 연결통로 방화셔터 차단 · 출입구 통제·유도 [SOP 216·217]', 'initial', 3281, 926, true),
    u('가락펌프', 'pump', ST.garak, '삼성역 연결통로 연기 차단 지원 · 송풍기 배연', 'level2', 5725, 1336, true),
  ],
  command: [
    u('현장대응단 지휘차', 'command', ST.gangnam, '현장지휘소 · 지휘권 선언 · 방재센터 정보 수집 [SOP 101·235]', 'initial', 972, 477),
    u('세곡펌프', 'pump', ST.segok, '신속동료구조팀(RIT) · 지휘소 대기 [SOP 100 4.6]', 'level1', 7635, 1938),
  ],
  medical: [
    u('삼성구급', 'ambulance', ST.gangnam, '임시 현장응급의료소장 · 분류반 [SOP 402 2]', 'initial', 1335, 625),
    u('영동구급', 'ambulance', ST.yeongdong, '응급처치반 · 연기 흡입 주방 직원', 'initial', 3185, 666),
    u('역삼구급', 'ambulance', ST.yeoksam, '이송반 · 병원 수용능력 확인·분산 이송', 'level1', 3487, 897),
    u('수서구급', 'ambulance', ST.suseo, '이송 · 아동 구조대상자', 'level1', 5588, 1706),
    u('개포구급', 'ambulance', ST.gaepo, '이송 대기', 'level1', 6483, 1852),
    u('서초구급', 'ambulance', ST.seochoC, '추가 사상자 대비', 'level2', 5573, 1359, true),
    u('잠실구급', 'ambulance', ST.jamsil, '삼성역 방면 대피자 처치', 'level2', 4159, 1225, true),
  ],
} satisfies Record<string, ResponseUnit[]>;

export const ALL_COEX_UNITS: ResponseUnit[] = Object.values(COEX_UNITS).flat();

const earliest = (units: ResponseUnit[]) =>
  units.reduce<ResponseUnit | null>(
    (best, x) => (!best || (x.routeDurationSeconds ?? 1e9) < (best.routeDurationSeconds ?? 1e9) ? x : best),
    null
  );

function staging(
  id: string,
  type: StagingCandidate['type'],
  label: string,
  coordinates: { lat: number; lng: number },
  localPosition: [number, number, number],
  units: ResponseUnit[],
  risks: string[],
  outstandingChecks: string[],
  rev: number
): StagingCandidate {
  const first = earliest(units);
  return {
    id,
    type,
    label,
    coordinates,
    localPosition,
    status: 'selected',
    placedBy: 'research_candidate',
    risks,
    outstandingChecks,
    routeDistanceMeters: first?.routeDistanceMeters,
    routeDurationSeconds: first?.routeDurationSeconds,
    stationName: units.map((x) => x.callSign).join(' · '),
    units,
    buildingRevision: rev,
  };
}

export function createCoexStaging(rev: number): StagingCandidate[] {
  return [
    staging(
      'stg-north',
      'truck_staging',
      '북문 GATE (봉은사로) — 급기측 주 진입',
      { lat: 37.51337, lng: 127.0584 },
      [4, 0, -22],
      COEX_UNITS.north,
      ['급기·배기 확인 후 급기측 진입 원칙 (SOP 216 2.9) — 바람 불어오는 쪽'],
      ['봉은사로 쪽 소화전 위치 확인', '진입로 라이트라인 설치 (SOP 217 2.1)'],
      rev
    ),
    staging(
      'stg-east',
      'truck_staging',
      '동문 GATE (영동대로)',
      { lat: 37.51219, lng: 127.06081 },
      [31, 0, 3],
      COEX_UNITS.east,
      ['영동대로 차량 통행 많음 — 진입 차선 통제 필요', '지상층으로 연기 유입 차단 필요 (SOP 217 2.5)'],
      ['동문 측 연결송수구·옥내소화전 위치 확인'],
      rev
    ),
    staging(
      'stg-west',
      'truck_staging',
      '서문 (테헤란로87길) — 서측 특별피난계단 1',
      { lat: 37.51176, lng: 127.05752 },
      [-31, 0, 0],
      COEX_UNITS.west,
      ['이면도로 — 대형차 회차 공간 부족'],
      ['서측 특별피난계단 1 지상 출구 위치 확인'],
      rev
    ),
    staging(
      'stg-south',
      'truck_staging',
      '남측 밀레니엄광장 · 삼성역 연결 — 배기측',
      { lat: 37.50943, lng: 127.06185 },
      [22, 0, 22],
      COEX_UNITS.south,
      ['연기가 흘러나오는 배기측 — 진입 금지, 차단·대피 유도만', '삼성역 출입구 인파와 동선 겹침'],
      ['지하철 운행 통제 요청 (SOP 216 2.1)', '연결통로 방화셔터·방연셔터 작동 확인 (SOP 216 2.5)'],
      rev
    ),
    staging(
      'stg-command',
      'truck_staging',
      '현장지휘소 — 봉은사역 사거리 (바람 불어오는 쪽)',
      { lat: 37.51426, lng: 127.06023 },
      [27, 0, -24],
      COEX_UNITS.command,
      ['영동대로·봉은사로 교차로 — 경찰 교통 통제 협조 (SOP 100 1.2.3)'],
      ['방재센터 관계자 지휘소 합류 (SOP 235)', '상황판단회의 (SOP 106)'],
      rev
    ),
    staging(
      'stg-med-north',
      'medical_post',
      '임시응급의료소 — 북측 봉은사로변 (바람 불어오는 쪽)',
      { lat: 37.5147, lng: 127.057 },
      [-16, 0, -21],
      COEX_UNITS.medical,
      ['연기는 남남동쪽(테헤란로·삼성역 방면)으로 흐름 — 의료소는 북측 유지'],
      ['보건소장 도착 시 응급의료소로 전환 (SOP 402 3)', 'START 중증도 분류 · 특정 병원 집중 방지 (SOP 402 1)'],
      rev
    ),
  ];
}

/** 발령 단계까지의 차량만 장면에 남긴다 (해당 단계 차량이 없는 위치는 숨김) */
export function coexSceneForPhase(scene: SceneSpec, phase: CoexPhase): SceneSpec {
  const limit = PHASE_ORDER[phase];
  const stagingCandidates = scene.stagingCandidates
    .map((stg) => {
      if (!stg.units) return stg;
      const units = stg.units.filter((x) => PHASE_ORDER[x.dispatchPhase] <= limit);
      if (units.length === 0) return null;
      const first = earliest(units);
      return {
        ...stg,
        units,
        stationName: units.map((x) => x.callSign).join(' · '),
        routeDistanceMeters: first?.routeDistanceMeters,
        routeDurationSeconds: first?.routeDurationSeconds,
      };
    })
    .filter((x): x is StagingCandidate => x !== null);
  return { ...scene, stagingCandidates };
}

const km = (m: number) => `${(m / 1000).toFixed(1)}km`;
const min = (s: number) => `약 ${Math.round(s / 60)}분`;

function station(
  id: string,
  name: string,
  address: string,
  lat: number,
  lng: number,
  distanceMeters: number,
  durationSeconds: number
): NearbyFireStation {
  return {
    id,
    name,
    address: `${address} · 도로 ${km(distanceMeters)} · ${min(durationSeconds)}`,
    coordinates: { lat, lng },
    distanceMeters,
    durationSeconds,
  };
}

/** 출동 소방서·안전센터 (거리·시간은 그 소속 첫 차량의 배치 위치까지) */
export function createCoexStations(): NearbyFireStation[] {
  return [
    station('st-samseong', '강남소방서 (삼성펌프·삼성탱크·삼성100·삼성구급·지휘차)', '서울 강남구 테헤란로 629', 37.51029, 127.06694, 1278, 621),
    station('st-yeongdong', '영동119안전센터 (영동펌프·영동구급)', '서울 강남구 도산대로 320', 37.52214, 127.03692, 3069, 635),
    station('st-yeoksam', '역삼119안전센터 (역삼펌프·역삼구급)', '서울 강남구 역삼로 236', 37.49713, 127.04244, 2817, 690),
    station('st-jamsil', '잠실119안전센터 · 송파 인접 (잠실펌프·잠실구급)', '서울 송파구 석촌호수로 151', 37.50731, 127.09388, 3281, 926),
    station('st-seocho-c', '서초119안전센터 · 서초 (서초펌프·서초구급)', '서울 서초구 효령로 400', 37.48803, 127.02759, 4903, 1200),
    station('st-garak', '가락119안전센터 · 송파 (가락펌프)', '서울 송파구 양재대로 932', 37.4946, 127.10648, 5725, 1336),
    station('st-seocho', '서초소방서 119구조대 (서초100)', '서울 서초구 사평대로 67', 37.49843, 126.99186, 11526, 1516),
    station('st-suseo', '수서119안전센터 (수서펌프·수서구급)', '서울 강남구 광평로31길 6', 37.48492, 127.09284, 5531, 1702),
    station('st-gaepo', '개포119안전센터 (개포펌프·개포구급)', '서울 강남구 논현로10길 19', 37.4747, 127.04989, 6759, 1852),
    station('st-segok', '세곡119안전센터 (세곡펌프)', '서울 강남구 밤고개로 268', 37.47045, 127.10716, 7635, 1938),
    station('st-songpa', '송파소방서 (송파100 · 구조대 위치 가정)', '서울 송파구 오금로51길 56', 37.49993, 127.14264, 10596, 2267),
  ];
}

export const COEX_RESPONSE_LEVELS: Record<'level1' | 'level2', ResponseLevelState> = {
  level1: {
    level: 1,
    label: '대응 1단계',
    basis:
      '다중이용장소 재난 — 서울시 긴급구조 지휘 조례 시행규칙 별표2 (1개 소방서 전 소방력) · 지휘: 강남소방서장(자치구 긴급구조통제단장)',
  },
  level2: {
    level: 2,
    label: '대응 2단계',
    basis:
      '인명대피 100명 이상 · 다중이용장소 — 같은 규칙 별표2 (2~5개 소방서 소방력: 강남·서초·송파) · 지휘: 강남소방서장(현행 제8조)',
  },
};

/** 출동 편성표(마크다운) — 상황실 지령 이벤트에 사용 */
export function coexDispatchTableMarkdown(phase: CoexPhase | 'all' = 'all'): string {
  const PHASE_KO: Record<CoexPhase, string> = { initial: '최초', level1: '1단계', level2: '2단계' };
  const rows = ALL_COEX_UNITS.filter((x) => phase === 'all' || x.dispatchPhase === phase)
    .slice()
    .sort((a, b) => (a.routeDurationSeconds ?? 0) - (b.routeDurationSeconds ?? 0))
    .map(
      (x) =>
        `| **${x.callSign}** | ${PHASE_KO[x.dispatchPhase]}${x.outOfJurisdiction ? ' · 타관할' : ''} | ${x.role} | ${
          x.routeDurationSeconds ? min(x.routeDurationSeconds) : '-'
        } |`
    );
  return ['| 호출명 | 출동 | 임무 | 도착 예상 |', '| :--- | :--- | :--- | :--- |', ...rows].join('\n');
}

export const COEX_UNIT_COUNTS = {
  initial: ALL_COEX_UNITS.filter((x) => x.dispatchPhase === 'initial').length,
  level1: ALL_COEX_UNITS.filter((x) => x.dispatchPhase === 'level1').length,
  level2: ALL_COEX_UNITS.filter((x) => x.dispatchPhase === 'level2').length,
  total: ALL_COEX_UNITS.length,
};
