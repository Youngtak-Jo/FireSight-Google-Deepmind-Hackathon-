import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLiveOverview,
  isRealKey,
  parseKakaoDirections,
  parseSeoulCityData,
  parseItsCctv,
  deepFind,
} from './live-traffic.ts';

const COEX = { lat: 37.51194, lng: 127.05889 };

// 응답 예시는 공개 문서·활용 사례에 나온 구조를 따라 만든 테스트용 데이터다 (실제 값 아님)
const KAKAO_SAMPLE = {
  trans_id: 't1',
  routes: [
    {
      result_code: 0,
      result_msg: '길찾기 성공',
      summary: { distance: 1180, duration: 263 },
      sections: [
        {
          roads: [
            { name: '테헤란로', traffic_state: 4 },
            { name: '영동대로', traffic_state: 1 },
            { name: '영동대로', traffic_state: 3 },
          ],
        },
      ],
    },
  ],
};

const SEOUL_SAMPLE = {
  CITYDATA: {
    AREA_NM: '강남 MICE 관광특구',
    AREA_CD: 'POI001',
    LIVE_PPLTN_STTS: [
      { AREA_CONGEST_LVL: '붐빔', AREA_CONGEST_MSG: '사람이 몰려있어요', AREA_PPLTN_MIN: '36000', AREA_PPLTN_MAX: '38000' },
    ],
    ROAD_TRAFFIC_STTS: {
      AVG_ROAD_DATA: { ROAD_MSG: '전체적으로 차량 흐름이 느려요', ROAD_TRAFFIC_IDX: '서행', ROAD_TRAFFIC_SPD: 17 },
      ROAD_TRAFFIC_STTS: [
        { ROAD_NM: '테헤란로', START_ND_NM: '선릉역', END_ND_NM: '역삼역', START_ND_XY: '127.04900_37.50450', SPD: 30, IDX: '원활' },
        { ROAD_NM: '영동대로', START_ND_NM: '봉은사역', END_ND_NM: '삼성역', START_ND_XY: '127.06081_37.51219', SPD: 12, IDX: '정체' },
        { ROAD_NM: '봉은사로', START_ND_NM: '코엑스북문', END_ND_NM: '삼성중앙역', START_ND_XY: '127.05756_37.51356', SPD: '23', IDX: '서행' },
      ],
    },
    ACDNT_CNTRL_STTS: [{ ACDNT_OCCR_DT: '2026-11-28 14:10', ACDNT_TYPE: '공사', ACDNT_INFO: '테헤란로 1개 차로 통제' }],
    WEATHER_STTS: [{ TEMP: '8.5', HUMIDITY: '41', WIND_DIRCT: '북서', WIND_SPD: '3.2' }],
  },
  RESULT: { 'RESULT.CODE': 'INFO-000', 'RESULT.MESSAGE': '정상 처리되었습니다.' },
};

const ITS_SAMPLE = {
  response: {
    datacount: 2,
    data: [
      { cctvname: '[국도] 먼 CCTV', cctvurl: 'https://cctv.example/far.m3u8', coordx: 127.08, coordy: 37.53, cctvformat: 'HLS' },
      { cctvname: '[국도] 가까운 CCTV', cctvurl: 'https://cctv.example/near.m3u8', coordx: 127.062, coordy: 37.513, cctvformat: 'HLS' },
    ],
  },
};

test('키 판별: 예시 값(MY_...)이나 빈 값은 키로 보지 않는다', () => {
  assert.equal(isRealKey(undefined), false);
  assert.equal(isRealKey('MY_KAKAO_REST_API_KEY'), false);
  assert.equal(isRealKey('   '), false);
  assert.equal(isRealKey('a1b2c3d4e5f6g7h8'), true);
});

test('카카오 길찾기: 소요시간·거리와 정체 구간 수를 읽는다', () => {
  const r = parseKakaoDirections(KAKAO_SAMPLE);
  assert.equal(r.durationSec, 263);
  assert.equal(r.distanceM, 1180);
  assert.equal(r.congestedSegments, 1);
});

test('카카오 길찾기: 경로 실패 코드는 오류로 알린다', () => {
  assert.throws(
    () => parseKakaoDirections({ routes: [{ result_code: 104, result_msg: '출발지와 도착지가 너무 가까움' }] }),
    /104/
  );
});

test('서울 도시데이터: 평균 소통·도로별 속도·사고·기상·혼잡도를 읽는다', () => {
  const c = parseSeoulCityData(SEOUL_SAMPLE, '강남 MICE 관광특구', COEX);
  assert.equal(c.areaName, '강남 MICE 관광특구');
  assert.equal(c.avgLevel, '서행');
  assert.equal(c.avgSpeedKmh, 17);
  assert.equal(c.roads.length, 3);
  // 사건 위치(코엑스)에서 가까운 순: 영동대로(약 0.2km) → 봉은사로 → 테헤란로(멀리)
  assert.deepEqual(
    c.roads.map((r) => [r.roadName, r.level, r.speedKmh]),
    [
      ['영동대로', '정체', 12],
      ['봉은사로', '서행', 23],
      ['테헤란로', '원활', 30],
    ]
  );
  assert.ok((c.roads[0].distanceM ?? 0) < 300);
  assert.equal(c.accidents[0].info, '테헤란로 1개 차로 통제');
  assert.equal(c.weather?.tempC, 8.5);
  assert.equal(c.crowd?.level, '붐빔');
  assert.equal(c.crowd?.max, 38000);
});

test('서울 도시데이터: 오류 코드(예: 인증키 오류)는 오류로 알린다', () => {
  assert.throws(
    () =>
      parseSeoulCityData(
        { RESULT: { 'RESULT.CODE': 'INFO-100', 'RESULT.MESSAGE': '인증키가 유효하지 않습니다.' } },
        '강남 MICE 관광특구'
      ),
    /인증키/
  );
});

test('ITS CCTV: 가까운 순으로 정렬하고 거리를 계산한다', () => {
  const list = parseItsCctv(ITS_SAMPLE, COEX, 'its');
  assert.equal(list[0].name, '[국도] 가까운 CCTV');
  assert.ok(list[0].distanceM < list[1].distanceM);
});

test('deepFind: 키 대소문자와 깊이에 상관없이 찾는다', () => {
  assert.equal(deepFind({ a: { B: { road_msg: 'x' } } }, 'ROAD_MSG'), 'x');
});

const BASE_INPUT = {
  center: COEX,
  stations: [
    { id: 'st-samseong', name: '강남소방서·삼성119안전센터', coordinates: { lat: 37.51029, lng: 127.06686 }, durationSeconds: 180 },
  ],
  target: { label: '삼성펌프 — 동문 GATE', coordinates: { lat: 37.51219, lng: 127.06081 } },
  seoulAreaName: '강남 MICE 관광특구',
};

test('키가 없으면 실시간 호출 없이 추정값과 "키 없음" 상태를 돌려준다', async () => {
  const original = globalThis.fetch;
  let called = 0;
  globalThis.fetch = (async () => {
    called += 1;
    throw new Error('should not be called');
  }) as typeof fetch;
  try {
    const o = await buildLiveOverview({ ...BASE_INPUT, env: {} });
    assert.equal(called, 0);
    assert.equal(o.sources.kakao.status, 'no_key');
    assert.equal(o.sources.seoul.status, 'no_key');
    assert.equal(o.sources.its.status, 'no_key');
    assert.equal(o.etas[0].durationSec, null);
    assert.equal(o.etas[0].estimatedDurationSec, 180);
    assert.ok(o.links.length >= 1);
  } finally {
    globalThis.fetch = original;
  }
});

test('키가 있으면 세 곳을 호출해 실시간 값으로 채우고, 키는 카카오 헤더로만 보낸다', async () => {
  const original = globalThis.fetch;
  const calls: Array<{ url: string; auth?: string }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    const auth = (init?.headers as Record<string, string> | undefined)?.Authorization;
    calls.push({ url: String(url), auth });
    const body = String(url).includes('kakaomobility')
      ? KAKAO_SAMPLE
      : String(url).includes('openapi.seoul.go.kr')
        ? SEOUL_SAMPLE
        : ITS_SAMPLE;
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
  try {
    const o = await buildLiveOverview({
      ...BASE_INPUT,
      env: { KAKAO_REST_API_KEY: 'kakao-test-key-123', SEOUL_OPEN_API_KEY: 'seoul-test-key-123', ITS_API_KEY: 'its-test-key-123' },
    });
    assert.equal(o.sources.kakao.status, 'ok');
    assert.equal(o.sources.seoul.status, 'ok');
    assert.equal(o.sources.its.status, 'ok');
    assert.equal(o.etas[0].durationSec, 263);
    assert.equal(o.city?.roads[0].roadName, '영동대로');
    assert.ok(o.cctv.length > 0);
    const kakaoCall = calls.find((c) => c.url.includes('kakaomobility'))!;
    assert.equal(kakaoCall.auth, 'KakaoAK kakao-test-key-123');
    assert.ok(!kakaoCall.url.includes('kakao-test-key-123'), '카카오 키는 주소에 넣지 않는다');
    // 카카오 좌표 순서는 경도,위도
    assert.match(kakaoCall.url, /origin=127\.06686,37\.51029/);
  } finally {
    globalThis.fetch = original;
  }
});

test('한 곳이 실패해도 나머지는 계속 보여준다', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    if (String(url).includes('openapi.seoul.go.kr')) return new Response('server down', { status: 503 });
    const body = String(url).includes('kakaomobility') ? KAKAO_SAMPLE : ITS_SAMPLE;
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
  try {
    const o = await buildLiveOverview({
      ...BASE_INPUT,
      stations: [{ ...BASE_INPUT.stations[0], id: 'st-x' }],
      env: { KAKAO_REST_API_KEY: 'kakao-test-key-456', SEOUL_OPEN_API_KEY: 'seoul-test-key-456', ITS_API_KEY: 'its-test-key-456' },
    });
    assert.equal(o.sources.seoul.status, 'error');
    assert.match(o.sources.seoul.message!, /503/);
    assert.equal(o.sources.kakao.status, 'ok');
    assert.equal(o.city, null);
  } finally {
    globalThis.fetch = original;
  }
});

test('센터별로 자기 차량 배치 위치까지 길찾기한다', async () => {
  const original = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = (async (url: string) => {
    urls.push(String(url));
    return new Response(JSON.stringify(KAKAO_SAMPLE), { status: 200 });
  }) as typeof fetch;
  try {
    const o = await buildLiveOverview({
      ...BASE_INPUT,
      seoulAreaName: undefined,
      stations: [
        ...BASE_INPUT.stations,
        {
          id: 'st-yeongdong',
          name: '영동119안전센터',
          coordinates: { lat: 37.52206, lng: 127.03694 },
          target: { label: '영동펌프 — 북문 GATE', coordinates: { lat: 37.51356, lng: 127.05756 } },
        },
      ],
      env: { KAKAO_REST_API_KEY: 'kakao-test-key-789' },
    });
    assert.equal(o.etas[1].targetLabel, '영동펌프 — 북문 GATE');
    assert.ok(urls.some((u) => u.includes('destination=127.05756,37.51356')));
    assert.equal(o.sources.seoul.status, 'not_applicable');
  } finally {
    globalThis.fetch = original;
  }
});
