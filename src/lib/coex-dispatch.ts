/**
 * 데모 3(코엑스) 출동대 편성 — 재난현장 대응 절차를 참고한 시연용 편성.
 *
 * 근거로 삼은 공개 자료
 *  - 대응단계: 대응 1단계는 관할 소방서 전 소방력(+인접 소방서) 투입, 인명피해 우려 시 초기에 높은 단계로
 *    발령하고 나중에 낮추는 '하향식' 대응 (2017 제천 화재 이후 소방청 지침).
 *  - 강남 역삼동 빌딩 화재(2026-10-20) 브리핑 순서: 선착 → 다수 인명피해 우려 판단 → 현장대응단장
 *    지휘권 선언 → 대응 1단계(전 차량 출동) → 임시응급의료소 설치 → 소방서장 지휘권 선언 → 상황판단회의.
 *  - 코엑스 2층 식당 주방 화재(2025-04-25): 신고 3분 후 도착, 차량 33대·인원 120여 명, 1,200여 명 대피.
 *
 * 소방서·119안전센터 주소와 좌표: 카카오 로컬 검색(2026-11-28 확인).
 * 도로 거리·소요 시간: 카카오모빌리티 길찾기 API, 2026-11-28(토) 10:58 측정, **일반 차량 기준**.
 *   긴급차량은 신호·차로 우선으로 이보다 빨리 도착할 수 있다.
 * 가정: 서초100은 서초소방서(사평대로 67, 서초119구조대) 출동, 송파100은 송파소방서 청사(오금로51길 56)에서
 *   출동한다고 가정(구조대 위치 미확인). 차량 배치 위치는 출입구 기준 시연용 배치다.
 */
import type {
  NearbyFireStation,
  ResponseLevelState,
  ResponseUnit,
  SceneSpec,
  StagingCandidate,
} from './incident-engine.ts';

export const COEX_ROUTE_MEASURED_AT = '2026-11-28(토) 10:58, 일반 차량 기준';

const ST = {
  gangnam: '강남소방서 (테헤란로 629)',
  yeongdong: '강남 영동119안전센터 (도산대로 320)',
  yeoksam: '강남 역삼119안전센터 (역삼로 236)',
  suseo: '강남 수서119안전센터 (광평로31길 6)',
  gaepo: '강남 개포119안전센터 (논현로10길 19)',
  jamsil: '송파 잠실119안전센터 (석촌호수로 151) · 타관할',
  seocho: '서초소방서 119구조대 (사평대로 67) · 타관할',
  songpa: '송파소방서 (오금로51길 56) · 타관할 · 구조대 위치 가정',
} as const;

const u = (
  callSign: string,
  kind: ResponseUnit['kind'],
  station: string,
  role: string,
  dispatchPhase: ResponseUnit['dispatchPhase'],
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
  east: [
    u('삼성펌프', 'pump', ST.gangnam, '선착 · 동문 옥내소화전 연결 후 주 진입', 'initial', 1159, 487),
    u('삼성100', 'rescue', ST.gangnam, '식당 홀 구조대상자 3명 구조', 'initial', 1159, 487),
    u('송파100', 'rescue', ST.songpa, '위치 미상 2명 인명검색 (동측·화장실)', 'level1', 9946, 2124, true),
  ],
  north: [
    u('영동펌프', 'pump', ST.yeongdong, '북문 진입 · 연결송수구 송수', 'initial', 3128, 618),
    u('개포펌프', 'pump', ST.gaepo, '급수 지원 · 봉은사로 소화전 점령', 'level1', 6115, 1477),
  ],
  west: [
    u('역삼펌프', 'pump', ST.yeoksam, '서측 특별피난계단 1 엄호 방수', 'initial', 2803, 658),
    u('서초100', 'rescue', ST.seocho, '위치 미상 2명 인명검색 (서측)', 'level1', 8162, 1704, true),
  ],
  south: [
    u('잠실펌프', 'pump', ST.jamsil, '삼성역 연결통로 연기 차단 · 지하철 이용객 대피 유도', 'initial', 3281, 689, true),
    u('수서펌프', 'pump', ST.suseo, '남측 2차 진입 · 배연 지원', 'level1', 5128, 1191),
  ],
  command: [u('현장대응단 지휘차', 'command', ST.gangnam, '현장지휘소 · 지휘권 선언', 'initial', 972, 424)],
  medical: [
    u('삼성구급', 'ambulance', ST.gangnam, '연기 흡입 주방 직원 우선 이송', 'initial', 1335, 541),
    u('영동구급', 'ambulance', ST.yeongdong, '임시응급의료소 중증도 분류', 'initial', 3185, 622),
    u('역삼구급', 'ambulance', ST.yeoksam, '아동 포함 가족 3명 처치·이송', 'initial', 3338, 789),
    u('잠실구급', 'ambulance', ST.jamsil, '추가 사상자 대비', 'level1', 4003, 988, true),
    u('수서구급', 'ambulance', ST.suseo, '추가 사상자 대비', 'level1', 5882, 1523),
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
      'stg-east',
      'truck_staging',
      '동문 GATE (영동대로)',
      { lat: 37.51219, lng: 127.06081 },
      [31, 0, 3],
      COEX_UNITS.east,
      ['영동대로 차량 통행 많음 — 진입 차선 통제 필요', '연기 흐름(남남동)의 옆쪽 — 진입 시 공기호흡기 착용'],
      ['동문 측 옥내소화전·송수구 위치 확인'],
      rev
    ),
    staging(
      'stg-north',
      'truck_staging',
      '북문 GATE (봉은사로)',
      { lat: 37.51337, lng: 127.0584 },
      [4, 0, -22],
      COEX_UNITS.north,
      ['북문 진입로 폭 확인 필요'],
      ['봉은사로 쪽 소화전 위치 확인'],
      rev
    ),
    staging(
      'stg-west',
      'truck_staging',
      '서문 (테헤란로87길)',
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
      '남측 밀레니엄광장 · 삼성역 연결 (영동대로)',
      { lat: 37.50943, lng: 127.06185 },
      [22, 0, 22],
      COEX_UNITS.south,
      ['연기가 흘러가는 쪽(풍하측) — 대원 공기호흡기 필수', '삼성역 출입구 인파와 동선 겹침'],
      ['서울교통공사 삼성역에 연결통로 차단·무정차 통과 요청 여부 확인'],
      rev
    ),
    staging(
      'stg-command',
      'truck_staging',
      '현장지휘소 — 봉은사역 사거리 (바람 불어오는 쪽)',
      { lat: 37.51426, lng: 127.06023 },
      [27, 0, -24],
      COEX_UNITS.command,
      ['영동대로·봉은사로 교차로 — 교통 통제 경찰 협조'],
      ['방재센터 관계자 지휘소 합류 요청'],
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
      ['보건소장 도착 시 응급의료소로 전환', '구급차 출입·이송 동선 확보'],
      rev
    ),
  ];
}

/** 대응 1단계 발령 전에는 최초 출동 차량만 보이게 한다 (추가 출동 차량만 있는 위치는 숨김) */
export function coexSceneForPhase(scene: SceneSpec, phase: 'initial' | 'level1'): SceneSpec {
  if (phase === 'level1') return scene;
  const stagingCandidates = scene.stagingCandidates
    .map((stg) => {
      if (!stg.units) return stg;
      const units = stg.units.filter((x) => x.dispatchPhase === 'initial');
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
    station('st-samseong', '강남소방서 (삼성펌프·삼성100·삼성구급·지휘차)', '서울 강남구 테헤란로 629', 37.51029, 127.06694, 1159, 487),
    station('st-yeongdong', '영동119안전센터 (영동펌프·영동구급)', '서울 강남구 도산대로 320', 37.52214, 127.03692, 3128, 618),
    station('st-yeoksam', '역삼119안전센터 (역삼펌프·역삼구급)', '서울 강남구 역삼로 236', 37.49713, 127.04244, 2803, 658),
    station('st-jamsil', '잠실119안전센터 · 송파 (잠실펌프·잠실구급)', '서울 송파구 석촌호수로 151', 37.50731, 127.09388, 3281, 689),
    station('st-suseo', '수서119안전센터 (수서펌프·수서구급)', '서울 강남구 광평로31길 6', 37.48492, 127.09284, 5128, 1191),
    station('st-gaepo', '개포119안전센터 (개포펌프)', '서울 강남구 논현로10길 19', 37.4747, 127.04989, 6115, 1477),
    station('st-seocho', '서초소방서 119구조대 (서초100)', '서울 서초구 사평대로 67', 37.49843, 126.99186, 8162, 1704),
    station('st-songpa', '송파소방서 (송파100 · 구조대 위치 가정)', '서울 송파구 오금로51길 56', 37.49993, 127.14264, 9946, 2124),
  ];
}

export const COEX_RESPONSE_LEVEL: ResponseLevelState = {
  level: 1,
  label: '대응 1단계',
  basis: '지하 다중이용시설 · 구조대상자 6명(위치 미상 2명) · 지하철 연결통로로 연기 확산 — 인명피해 우려로 초기 상향 발령',
};

/** 출동 편성표(마크다운) — 상황실 지령 이벤트에 사용 */
export function coexDispatchTableMarkdown(phase: 'initial' | 'level1' | 'all' = 'all'): string {
  const rows = ALL_COEX_UNITS.filter((x) => phase === 'all' || x.dispatchPhase === phase)
    .slice()
    .sort((a, b) => (a.routeDurationSeconds ?? 0) - (b.routeDurationSeconds ?? 0))
    .map(
      (x) =>
        `| **${x.callSign}** | ${x.dispatchPhase === 'initial' ? '최초' : '추가'}${x.outOfJurisdiction ? ' · 타관할' : ''} | ${x.role} | ${
          x.routeDurationSeconds ? min(x.routeDurationSeconds) : '-'
        } |`
    );
  return ['| 호출명 | 출동 | 임무 | 도착 예상 |', '| :--- | :--- | :--- | :--- |', ...rows].join('\n');
}
