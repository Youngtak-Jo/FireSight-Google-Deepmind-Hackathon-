/**
 * 한국어 화면 표기용 공통 용어·변환 함수.
 *
 * 용어집 (화면 전체에서 같은 말을 쓰기 위한 기준)
 *  - Dispatcher → 상황실 / Caller → 신고자 / Responder → 현장대원
 *  - Staging (pin/candidate) → 차량 배치 위치
 *  - Medical Post / EMS Triage → 임시응급의료소 (보건소장 도착 후 응급의료소로 승격 — 승격 기능은 추후)
 *  - People Accountability / Rescues Needed → 요구조자 현황 / 요구조자
 *  - Field Report → 현장보고
 *  - Fire/Smoke zone → 화염·연기 구역, Smoke only → 연기만 (화염 없음)
 *  - Approach route → 출동 경로
 *  - Revision (REV #) → 버전
 *  - Plume drift → 연기 확산
 */

const CARDINAL_KO: Record<string, string> = {
  N: '북',
  NNE: '북북동',
  NE: '북동',
  ENE: '동북동',
  E: '동',
  ESE: '동남동',
  SE: '남동',
  SSE: '남남동',
  S: '남',
  SSW: '남남서',
  SW: '남서',
  WSW: '서남서',
  W: '서',
  WNW: '서북서',
  NW: '북서',
  NNW: '북북서',
};

/** 'WSW' → '서남서'. 모르는 값은 그대로 돌려준다. */
export function cardinalToKo(cardinal?: string | null): string {
  if (!cardinal) return '';
  return CARDINAL_KO[cardinal.trim().toUpperCase()] ?? cardinal;
}

/** 바람이 불어오는 방위 → 한국식 풍향 표기. 'WSW' → '서남서풍' */
export function windFromToKo(cardinalFrom?: string | null): string {
  const ko = cardinalToKo(cardinalFrom);
  return ko ? `${ko}풍` : '';
}

const CARDINALS_16 = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/** 각도(0°=북, 시계방향) → 16방위 한국어. 245 → '서남서' */
export function degToKo(deg?: number | null): string {
  if (deg === undefined || deg === null || Number.isNaN(deg)) return '';
  const idx = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;
  return cardinalToKo(CARDINALS_16[idx]);
}

export const STAGING_STATUS_KO: Record<string, string> = {
  candidate: '후보',
  selected: '확정',
};

export const PLACED_BY_KO: Record<string, string> = {
  research_candidate: 'AI 조사 제안',
  dispatcher: '상황실',
};

export const PROVENANCE_KO: Record<string, string> = {
  observation: '직접 목격',
  relayed: '전달받음',
  document: '문서',
  visual_inference: 'AI 사진 추정',
  assumption: '가정',
};

export const SMOKE_COLOR_KO: Record<string, string> = {
  white: '흰색',
  gray: '회색',
  grey: '회색',
  black: '검은색',
};

export const ROOM_TYPE_KO: Record<string, string> = {
  office: '사무실',
  corridor: '복도',
  stairwell: '계단실',
  server_room: '전산실',
  lobby: '로비',
  mechanical: '기계실',
  lab: '작업실',
  uncertain_area: '구조 미확인 구역',
};

export const STAGING_TYPE_KO: Record<string, string> = {
  truck_staging: '차량 배치 위치',
  medical_post: '임시응급의료소',
};

export const DELIVERY_STATUS_KO: Record<string, string> = {
  pending: '전송 중',
  delivered: '전달됨',
  failed: '전송 실패',
};

export const SOURCE_STATUS_KO: Record<string, string> = {
  discovered: '발견됨',
  retrieved: '수집됨',
  analyzed: '분석됨',
  applied: '반영됨',
  failed: '실패',
};
