import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_COEX_UNITS, coexSceneForPhase, createCoexStations } from './coex-dispatch.ts';
import { createCoexIncidentState } from './coex-scenario.ts';

const state = createCoexIncidentState();

test('출동 편성: 총 15대 (펌프 6 · 구조 3 · 구급 5 · 지휘 1)', () => {
  const count = (k: string) => ALL_COEX_UNITS.filter((x) => x.kind === k).length;
  assert.equal(ALL_COEX_UNITS.length, 15);
  assert.equal(count('pump'), 6);
  assert.equal(count('rescue'), 3);
  assert.equal(count('ambulance'), 5);
  assert.equal(count('command'), 1);
  assert.equal(new Set(ALL_COEX_UNITS.map((x) => x.callSign)).size, 15, '호출명 중복 없음');
});

test('호출명 규칙: 펌프·구급은 센터 이름, 구조대는 소방서 차 번호 100', () => {
  for (const x of ALL_COEX_UNITS) {
    if (x.kind === 'pump') assert.match(x.callSign, /^[가-힣]+펌프$/, x.callSign);
    if (x.kind === 'ambulance') assert.match(x.callSign, /^[가-힣]+구급$/, x.callSign);
    if (x.kind === 'rescue') assert.match(x.callSign, /^(삼성|서초|송파)100$/, x.callSign);
  }
});

test('타관할 차량(서초100·송파100·잠실펌프·잠실구급)은 타관할로 표시된다', () => {
  const out = ALL_COEX_UNITS.filter((x) => x.outOfJurisdiction).map((x) => x.callSign).sort();
  assert.deepEqual(out, ['서초100', '송파100', '잠실구급', '잠실펌프'].sort());
});

test('대응 1단계 전에는 최초 출동 9대만 장면에 보인다', () => {
  const initial = coexSceneForPhase(state.scene, 'initial');
  const units = initial.stagingCandidates.flatMap((s) => s.units ?? []);
  assert.equal(units.length, 9);
  assert.ok(units.every((x) => x.dispatchPhase === 'initial'));
  assert.ok(!units.some((x) => x.callSign === '서초100'));
  const full = coexSceneForPhase(state.scene, 'level1');
  assert.equal(full.stagingCandidates.flatMap((s) => s.units ?? []).length, 15);
});

test('모든 차량에 도로 경로 거리·시간이 있고, 위치 좌표는 서울 안이다', () => {
  for (const x of ALL_COEX_UNITS) {
    assert.ok((x.routeDistanceMeters ?? 0) > 0 && (x.routeDurationSeconds ?? 0) > 0, x.callSign);
  }
  for (const st of createCoexStations()) {
    assert.ok(st.coordinates.lat > 37.4 && st.coordinates.lat < 37.7, st.id);
    assert.ok(st.coordinates.lng > 126.8 && st.coordinates.lng < 127.2, st.id);
  }
});

test('시나리오에 대응 1단계 발령과 상황실 지령 이벤트가 있다', () => {
  assert.equal(state.responseLevel?.level, 1);
  const dispatch = state.timeline.find((e) => e.id === 'evt-coex-dispatch-1');
  assert.ok(dispatch);
  assert.equal(dispatch!.speakerRole, 'dispatcher');
  assert.match(dispatch!.text, /대응 1단계/);
  assert.match(dispatch!.text, /서초100/);
  assert.match(dispatch!.text, /송파100/);
});
