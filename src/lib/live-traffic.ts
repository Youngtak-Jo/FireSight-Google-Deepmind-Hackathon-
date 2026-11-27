/**
 * 실시간 도로 상황·출동 소요시간·도로 CCTV 연동 (서버 전용)
 *
 * 방송사 교통정보도 대부분 아래 공공 원천 자료를 받아 내보내므로, 원천 API를 직접 쓴다.
 *  1) 카카오모빌리티 자동차 길찾기 — 실시간 교통을 반영한 소요시간 (KAKAO_REST_API_KEY)
 *     GET https://apis-navi.kakaomobility.com/v1/directions?origin=x,y&destination=x,y
 *  2) 서울 실시간 도시데이터 — 주요 장소(예: 강남 MICE 관광특구)의 도로소통·사고통제·날씨·혼잡도 (SEOUL_OPEN_API_KEY)
 *     GET http://openapi.seoul.go.kr:8088/{KEY}/json/citydata/1/5/{장소명}
 *  3) ITS 국가교통정보센터 CCTV 화상정보 — 실시간 스트리밍 주소 (ITS_API_KEY)
 *     GET https://openapi.its.go.kr:9443/cctvInfo?apiKey=..&type=its|ex&cctvType=1&minX..&getType=json
 *
 * 응답 필드 이름이 문서마다 조금씩 달라서, 파싱은 키 이름을 대소문자 구분 없이 깊이 탐색해 찾는다.
 * 키가 없으면 'no_key', 호출이 실패하면 'error' 상태와 이유를 돌려주고, 화면은 추정값으로 되돌아간다.
 */

export type LiveSourceStatus = 'ok' | 'no_key' | 'error' | 'not_applicable';

export interface LiveSourceState {
  status: LiveSourceStatus;
  message?: string;
  fetchedAt?: string;
}

export interface LiveEta {
  stationId: string;
  stationName: string;
  targetLabel: string;
  durationSec: number | null;
  distanceM: number | null;
  /** 경로 중 '정체' 구간 수 (카카오 road traffic_state 기준, 있으면) */
  congestedSegments?: number;
  estimatedDurationSec?: number;
}

export interface LiveRoadSegment {
  roadName: string;
  from?: string;
  to?: string;
  speedKmh: number | null;
  level: string; // 원활 / 서행 / 정체 등 원문
}

export interface LiveAccident {
  time?: string;
  type?: string;
  info: string;
}

export interface LiveCityData {
  areaName: string;
  avgMessage?: string;
  avgLevel?: string;
  avgSpeedKmh?: number | null;
  roads: LiveRoadSegment[];
  accidents: LiveAccident[];
  weather?: { tempC?: number | null; humidity?: number | null; windDir?: string; windSpeed?: number | null; text?: string };
  crowd?: { level?: string; message?: string; min?: number | null; max?: number | null };
}

export interface LiveCctv {
  name: string;
  url: string;
  format?: string;
  lat: number;
  lng: number;
  distanceM: number;
  roadType: 'its' | 'ex';
}

export interface LiveOverview {
  fetchedAt: string;
  sources: { kakao: LiveSourceState; seoul: LiveSourceState; its: LiveSourceState };
  etas: LiveEta[];
  city: LiveCityData | null;
  cctv: LiveCctv[];
  links: Array<{ label: string; url: string }>;
}

// ---------------------------------------------------------------------------
// 공통 유틸

export function isRealKey(v?: string | null): v is string {
  if (!v) return false;
  const t = v.trim();
  return t.length > 8 && !/^MY_|your_|placeholder/i.test(t);
}

export function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** 객체 안에서 키(대소문자 무시)를 깊이 우선으로 찾아 첫 값을 돌려준다 */
export function deepFind(obj: unknown, key: string, maxDepth = 8): unknown {
  const target = key.toLowerCase();
  const seen = new Set<unknown>();
  const walk = (o: unknown, depth: number): unknown => {
    if (!o || typeof o !== 'object' || depth > maxDepth || seen.has(o)) return undefined;
    seen.add(o);
    if (Array.isArray(o)) {
      for (const item of o) {
        const r = walk(item, depth + 1);
        if (r !== undefined) return r;
      }
      return undefined;
    }
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (k.toLowerCase() === target) return v;
    }
    for (const v of Object.values(o as Record<string, unknown>)) {
      const r = walk(v, depth + 1);
      if (r !== undefined) return r;
    }
    return undefined;
  };
  return walk(obj, 0);
}

function pick(o: unknown, ...keys: string[]): unknown {
  if (!o || typeof o !== 'object') return undefined;
  const entries = Object.entries(o as Record<string, unknown>);
  for (const key of keys) {
    const hit = entries.find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (hit && hit[1] !== undefined && hit[1] !== null && hit[1] !== '') return hit[1];
  }
  return undefined;
}

function asArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') return [v];
  return [];
}

function str(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}

// ---------------------------------------------------------------------------
// 1) 카카오모빌리티 길찾기

export function parseKakaoDirections(json: unknown): { durationSec: number | null; distanceM: number | null; congestedSegments: number } {
  const route = asArray(pick(json, 'routes'))[0];
  const code = num(pick(route, 'result_code'));
  if (code !== null && code !== 0) {
    throw new Error(`길찾기 실패 (result_code ${code}: ${str(pick(route, 'result_msg')) ?? '경로 없음'})`);
  }
  const summary = pick(route, 'summary');
  let congested = 0;
  for (const section of asArray(pick(route, 'sections'))) {
    for (const road of asArray(pick(section, 'roads'))) {
      // traffic_state: 0 정보없음, 1 정체, 2 지체, 3 서행, 4 원활 (카카오 문서 기준)
      const s = num(pick(road, 'traffic_state'));
      if (s === 1 || s === 2) congested += 1;
    }
  }
  return {
    durationSec: num(pick(summary, 'duration')),
    distanceM: num(pick(summary, 'distance')),
    congestedSegments: congested,
  };
}

// ---------------------------------------------------------------------------
// 2) 서울 실시간 도시데이터

export function parseSeoulCityData(json: unknown, areaName: string): LiveCityData {
  const result = deepFind(json, 'RESULT');
  const resultCode = str(pick(result, 'RESULT.CODE', 'CODE'));
  if (resultCode && !/^INFO-000$/i.test(resultCode)) {
    const msg = str(pick(result, 'RESULT.MESSAGE', 'MESSAGE')) ?? resultCode;
    throw new Error(`서울 도시데이터 응답 오류: ${msg}`);
  }

  const avg = deepFind(json, 'AVG_ROAD_DATA');
  const roadsRaw = asArray(deepFind(json, 'ROAD_TRAFFIC_STTS')).flatMap((x) => {
    // ROAD_TRAFFIC_STTS 가 { AVG_ROAD_DATA, ROAD_TRAFFIC_STTS: [...] } 로 한 번 더 감싸진 경우
    const inner = pick(x, 'ROAD_TRAFFIC_STTS');
    return inner ? asArray(inner) : [x];
  });
  const roads: LiveRoadSegment[] = roadsRaw
    .filter((r) => pick(r, 'ROAD_NM') !== undefined)
    .map((r) => ({
      roadName: str(pick(r, 'ROAD_NM')) ?? '도로',
      from: str(pick(r, 'START_ND_NM')),
      to: str(pick(r, 'END_ND_NM')),
      speedKmh: num(pick(r, 'SPD', 'ROAD_TRAFFIC_SPD')),
      level: str(pick(r, 'IDX', 'ROAD_TRAFFIC_IDX')) ?? '정보없음',
    }));

  const accidents: LiveAccident[] = asArray(deepFind(json, 'ACDNT_CNTRL_STTS'))
    .map((a) => ({
      time: str(pick(a, 'ACDNT_OCCR_DT')),
      type: str(pick(a, 'ACDNT_TYPE', 'ACDNT_DTYPE')),
      info: str(pick(a, 'ACDNT_INFO')) ?? '',
    }))
    .filter((a) => a.info || a.type);

  const w = asArray(deepFind(json, 'WEATHER_STTS'))[0];
  const p = asArray(deepFind(json, 'LIVE_PPLTN_STTS'))[0];

  return {
    areaName: str(deepFind(json, 'AREA_NM')) ?? areaName,
    avgMessage: str(pick(avg, 'ROAD_MSG')),
    avgLevel: str(pick(avg, 'ROAD_TRAFFIC_IDX')),
    avgSpeedKmh: num(pick(avg, 'ROAD_TRAFFIC_SPD')),
    roads,
    accidents,
    weather: w
      ? {
          tempC: num(pick(w, 'TEMP')),
          humidity: num(pick(w, 'HUMIDITY')),
          windDir: str(pick(w, 'WIND_DIRCT')),
          windSpeed: num(pick(w, 'WIND_SPD')),
          text: str(pick(w, 'PCP_MSG', 'SKY_STTS')),
        }
      : undefined,
    crowd: p
      ? {
          level: str(pick(p, 'AREA_CONGEST_LVL')),
          message: str(pick(p, 'AREA_CONGEST_MSG')),
          min: num(pick(p, 'AREA_PPLTN_MIN')),
          max: num(pick(p, 'AREA_PPLTN_MAX')),
        }
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// 3) ITS CCTV

export function parseItsCctv(
  json: unknown,
  center: { lat: number; lng: number },
  roadType: 'its' | 'ex'
): LiveCctv[] {
  const data = asArray(deepFind(json, 'data'));
  return data
    .map((c) => {
      const lat = num(pick(c, 'coordy'));
      const lng = num(pick(c, 'coordx'));
      const url = str(pick(c, 'cctvurl'));
      if (lat === null || lng === null || !url) return null;
      return {
        name: str(pick(c, 'cctvname')) ?? 'CCTV',
        url,
        format: str(pick(c, 'cctvformat')),
        lat,
        lng,
        distanceM: Math.round(haversineM(center, { lat, lng })),
        roadType,
      } as LiveCctv;
    })
    .filter((c): c is LiveCctv => c !== null)
    .sort((a, b) => a.distanceM - b.distanceM);
}

// ---------------------------------------------------------------------------
// 호출 (캐시 포함)

const cache = new Map<string, { at: number; value: unknown }>();
async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await fn();
  cache.set(key, { at: Date.now(), value });
  return value;
}

async function fetchJson(url: string, init?: RequestInit, timeoutMs = 8000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status} ${text.slice(0, 160)}`);
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`JSON이 아닌 응답: ${text.slice(0, 160)}`);
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new Error('응답 시간 초과');
    throw err;
  } finally {
    clearTimeout(t);
  }
}

export interface LiveOverviewInput {
  center: { lat: number; lng: number };
  stations: Array<{
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
    durationSeconds?: number;
    /** 이 센터 차량이 가는 위치 (없으면 공통 target) */
    target?: { label: string; coordinates: { lat: number; lng: number } };
  }>;
  target: { label: string; coordinates: { lat: number; lng: number } };
  seoulAreaName?: string;
  env: { KAKAO_REST_API_KEY?: string; SEOUL_OPEN_API_KEY?: string; ITS_API_KEY?: string };
}

export async function buildLiveOverview(input: LiveOverviewInput): Promise<LiveOverview> {
  const now = new Date().toISOString();
  const { env, center, stations, target } = input;

  const sources: LiveOverview['sources'] = {
    kakao: { status: 'no_key', message: 'KAKAO_REST_API_KEY 없음 — 직선거리 추정값 사용' },
    seoul: input.seoulAreaName
      ? { status: 'no_key', message: 'SEOUL_OPEN_API_KEY 없음' }
      : { status: 'not_applicable', message: '서울 실시간 도시데이터 대상 장소가 아님' },
    its: { status: 'no_key', message: 'ITS_API_KEY 없음' },
  };

  // 1) 출동 소요시간
  const targetOf = (st: (typeof stations)[number]) => st.target ?? target;
  const etas: LiveEta[] = stations.map((st) => ({
    stationId: st.id,
    stationName: st.name,
    targetLabel: targetOf(st).label,
    durationSec: null,
    distanceM: null,
    estimatedDurationSec: st.durationSeconds,
  }));
  if (isRealKey(env.KAKAO_REST_API_KEY)) {
    try {
      await Promise.all(
        etas.map(async (eta, i) => {
          const st = stations[i];
          const url =
            `https://apis-navi.kakaomobility.com/v1/directions?origin=${st.coordinates.lng},${st.coordinates.lat}` +
            `&destination=${targetOf(st).coordinates.lng},${targetOf(st).coordinates.lat}&priority=TIME&summary=false`;
          const json = await cached(`kakao:${env.KAKAO_REST_API_KEY}:${url}`, 60_000, () =>
            fetchJson(url, { headers: { Authorization: `KakaoAK ${env.KAKAO_REST_API_KEY}` } })
          );
          const parsed = parseKakaoDirections(json);
          eta.durationSec = parsed.durationSec;
          eta.distanceM = parsed.distanceM;
          eta.congestedSegments = parsed.congestedSegments;
        })
      );
      sources.kakao = { status: 'ok', fetchedAt: now };
    } catch (err: any) {
      sources.kakao = { status: 'error', message: String(err?.message || err) };
    }
  }

  // 2) 서울 실시간 도시데이터
  let city: LiveCityData | null = null;
  if (input.seoulAreaName && isRealKey(env.SEOUL_OPEN_API_KEY)) {
    try {
      const url = `http://openapi.seoul.go.kr:8088/${encodeURIComponent(env.SEOUL_OPEN_API_KEY)}/json/citydata/1/5/${encodeURIComponent(input.seoulAreaName)}`;
      const json = await cached(`seoul:${env.SEOUL_OPEN_API_KEY}:${input.seoulAreaName}`, 60_000, () => fetchJson(url));
      city = parseSeoulCityData(json, input.seoulAreaName);
      sources.seoul = { status: 'ok', fetchedAt: now };
    } catch (err: any) {
      sources.seoul = { status: 'error', message: String(err?.message || err) };
    }
  }

  // 3) ITS CCTV (반경 약 3km 사각형, 국도·고속도로)
  let cctv: LiveCctv[] = [];
  if (isRealKey(env.ITS_API_KEY)) {
    try {
      const d = 0.03;
      const box = `&minX=${(center.lng - d).toFixed(5)}&maxX=${(center.lng + d).toFixed(5)}&minY=${(center.lat - d).toFixed(5)}&maxY=${(center.lat + d).toFixed(5)}`;
      const lists = await Promise.all(
        (['its', 'ex'] as const).map(async (type) => {
          const url = `https://openapi.its.go.kr:9443/cctvInfo?apiKey=${encodeURIComponent(env.ITS_API_KEY!)}&type=${type}&cctvType=1${box}&getType=json`;
          const json = await cached(`its:${env.ITS_API_KEY}:${type}:${box}`, 300_000, () => fetchJson(url));
          return parseItsCctv(json, center, type);
        })
      );
      cctv = lists.flat().sort((a, b) => a.distanceM - b.distanceM).slice(0, 8);
      sources.its = {
        status: 'ok',
        fetchedAt: now,
        message: cctv.length === 0 ? '반경 약 3km 안에 공개된 국도·고속도로 CCTV가 없습니다' : undefined,
      };
    } catch (err: any) {
      sources.its = { status: 'error', message: String(err?.message || err) };
    }
  }

  return {
    fetchedAt: now,
    sources,
    etas,
    city,
    cctv,
    links: [
      { label: '서울 TOPIS 교통정보·CCTV', url: 'https://topis.seoul.go.kr/' },
      { label: '서울 실시간 도시데이터 지도', url: 'https://data.seoul.go.kr/SeoulRtd/map' },
      { label: 'ITS 국가교통정보센터', url: 'https://www.its.go.kr/' },
    ],
  };
}
