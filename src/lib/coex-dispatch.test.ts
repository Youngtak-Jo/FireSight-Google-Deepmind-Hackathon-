import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_COEX_UNITS, coexSceneForPhase, createCoexStations } from './coex-dispatch.ts';
import { createCoexIncidentState } from './coex-scenario.ts';

const state = createCoexIncidentState();

test('출동 편성: 총 21대 (펌프 9 · 탱크 1 · 구조 3 · 구급 7 · 지휘 1)', () => {
  const count = (k: string) => ALL_COEX_UNITS.filter((x) => x.kind === k).length;
  assert.equal(ALL_COEX_UNITS.length, 21);
  assert.equal(count('pump'), 9);
  assert.equal(count('tanker'), 1);
  assert.equal(count('rescue'), 3);
  assert.equal(count('ambulance'), 7);
  assert.equal(count('command'), 1);
  assert.equal(new Set(ALL_COEX_UNITS.map((x) => x.callSign)).size, 21, '호출명 중복 없음');
});

test('호출명 규칙: 펌프·구급은 센터 이름, 구조대는 소방서 차 번호 100', () => {
  for (const x of ALL_COEX_UNITS) {
    if (x.kind === 'pump') assert.match(x.callSign, /^[가-힣]+펌프$/, x.callSign);
    if (x.kind === 'ambulance') assert.match(x.callSign, /^[가-힣]+구급$/, x.callSign);
    if (x.kind === 'tanker') assert.match(x.callSign, /^[가-힣]+탱크$/, x.callSign);
    if (x.kind === 'rescue') assert.match(x.callSign, /^(삼성|서초|송파)100$/, x.callSign);
  }
});

test('타관할 차량은 서초·송파 소속이며, 대응 2단계 전에는 인접 잠실펌프만 출동한다', () => {
  const out = ALL_COEX_UNITS.filter((x) => x.outOfJurisdiction).map((x) => x.callSign).sort();
  assert.deepEqual(out, ['가락펌프', '서초100', '서초구급', '서초펌프', '송파100', '잠실구급', '잠실펌프'].sort());
  const early = ALL_COEX_UNITS.filter((x) => x.outOfJurisdiction && x.dispatchPhase !== 'level2').map((x) => x.callSign);
  assert.deepEqual(early, ['잠실펌프'], '대응 1단계는 1개 소방서(강남) 전 소방력 — 타관할은 공동관할 인접 1대만');
  for (const x of ALL_COEX_UNITS.filter((y) => y.dispatchPhase === 'level1')) {
    assert.ok(!x.outOfJurisdiction, `${x.callSign}: 1단계 추가 차량은 강남소방서 소속`);
  }
});

test('단계별 장면: 최초 9대 → 1단계 15대 → 2단계 21대', () => {
  const n = (p: 'initial' | 'level1' | 'level2') =>
    coexSceneForPhase(state.scene, p).stagingCandidates.flatMap((s) => s.units ?? []);
  assert.equal(n('initial').length, 9);
  assert.ok(n('initial').every((x) => x.dispatchPhase === 'initial'));
  assert.equal(n('level1').length, 15);
  assert.ok(!n('level1').some((x) => x.callSign === '서초100'));
  assert.equal(n('level2').length, 21);
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

test('시나리오: 선착대 지휘선언 → 대응 1단계 → 대피 100명 이상 보고 → 대응 2단계 순서', () => {
  assert.equal(state.responseLevel?.level, 2);
  const ids = state.timeline.map((e) => e.id);
  const at = (id: string) => ids.indexOf(id);
  assert.ok(at('evt-coex-field-1') < at('evt-coex-dispatch-1'), '선착대 보고 후 1단계');
  assert.ok(at('evt-coex-dispatch-1') < at('evt-coex-field-2'));
  assert.ok(at('evt-coex-field-2') < at('evt-coex-dispatch-2'), '대피 인원 보고 후 2단계');
  const d1 = state.timeline[at('evt-coex-dispatch-1')];
  const d2 = state.timeline[at('evt-coex-dispatch-2')];
  assert.match(d1.text, /대응 1단계/);
  assert.match(d2.text, /대응 2단계/);
  assert.match(d2.text, /서초100/);
  assert.match(d2.text, /송파100/);
  assert.match(state.timeline[at('evt-coex-field-1')].text, /현장지휘/, '선착대장 지휘선언 (SOP 100)');
});
