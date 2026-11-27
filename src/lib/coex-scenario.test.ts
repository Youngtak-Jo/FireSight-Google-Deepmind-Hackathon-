import test from 'node:test';
import assert from 'node:assert/strict';
import { createCoexIncidentState } from './coex-scenario.ts';
import { computeScenarioProgression, validateAndMergeScene } from './incident-engine.ts';
import { computeIntakeProgress } from './kr119-intake.ts';
import { floorLabelKo } from './ko-terms.ts';

const state = createCoexIncidentState();
const scene = state.scene;
const roomIds = new Set(scene.floors.flatMap((f) => f.rooms.map((r) => r.id)));

test('지하층 표기: 음수 층은 지하로 표시한다', () => {
  assert.equal(floorLabelKo(-1), '지하1층');
  assert.equal(floorLabelKo(-2), '지하2층');
  assert.equal(floorLabelKo(1), '1층');
});

test('코엑스 건물: 지하1층(화점)·1층·2층으로 구성되고 지하층은 지면 아래에 있다', () => {
  assert.deepEqual(
    scene.floors.map((f) => f.level),
    [-1, 1, 2]
  );
  const b1 = scene.floors.find((f) => f.level === -1)!;
  assert.ok(b1.elevationMeters < 0);
  assert.ok(b1.elevationMeters + b1.heightMeters <= 0);
});

test('호실 연결·화염 구역·구조대상자 위치가 실제 호실을 가리킨다', () => {
  for (const fl of scene.floors) {
    for (const r of fl.rooms) {
      assert.equal(r.floor, fl.level, r.id);
      for (const c of r.connectedRoomIds) assert.ok(roomIds.has(c), `${r.id} → ${c}`);
    }
  }
  for (const z of scene.fireZones) {
    assert.ok(z.roomId && roomIds.has(z.roomId), z.id);
    assert.ok(z.position.every(Number.isFinite), z.id);
  }
  const primary = scene.fireZones[0];
  assert.equal(primary.floor, -1);
  assert.equal(primary.hasFlames, true);
  assert.ok(scene.fireZones.slice(1).every((z) => !z.hasFlames), '나머지 구역은 연기만');
});

test('구조대상자 6명: 호실 확인 3명, 층만 확인 1명, 위치 미상 2명', () => {
  const p = state.peopleSummary;
  assert.equal(p.totalReported, 6);
  assert.equal(p.preciseRoomCounts['b1-dining']?.count, 3);
  assert.equal(p.floorOnlyCounts[-1], 1);
  assert.equal(p.unknownLocationCount, 2);
});

test('차량 호출명 규칙: 펌프·구급은 센터 이름, 구조대는 삼성100 (추가 시 서초100)', () => {
  const text = JSON.stringify(state);
  for (const name of ['삼성펌프', '영동펌프', '삼성구급', '역삼구급', '삼성100', '서초100']) {
    assert.ok(text.includes(name), name);
  }
  assert.ok(!/삼성구조|119안전센터 구조대/.test(text), '안전센터에는 구조대가 없다');
});

test('시연용 자료는 실제 도면·사진이 아니라고 표시한다', () => {
  for (const src of state.sources) {
    assert.match(src.title, /시연용/);
  }
  assert.match(scene.structuralNotes.join(' '), /실제 도면이 아님/);
});

test('평면도 페이지 번호가 층 번호와 같아 3D 층 이동과 맞는다', () => {
  const plan = state.sources[0];
  assert.deepEqual(
    plan.pages!.map((p) => p.pageNumber),
    scene.floors.map((f) => f.level)
  );
  for (const pg of plan.pages!) assert.ok(pg.svgDataUrl.startsWith('data:image/svg+xml'));
});

test('연소 확대 예상(지하층)에서도 좌표가 유한하고 인접 구역으로 번진다', () => {
  const zones = computeScenarioProgression(scene, 100);
  assert.ok(zones.length > scene.fireZones.length);
  for (const z of zones) assert.ok(z.position.every(Number.isFinite), z.id);
});

test('장면 검증기가 코엑스 장면을 받아들인다', () => {
  const res = validateAndMergeScene(scene, { ...scene }, scene.buildingRevision);
  assert.equal(res.accepted, true, res.rejectionReason);
});

test('데모 대화가 119 접수 체크리스트 순서를 따르고 같은 질문을 반복하지 않는다', () => {
  const calls = state.timeline.filter(
    (e) => e.type === 'caller_utterance' || e.type === 'call_taker_utterance'
  );
  const progress = computeIntakeProgress(calls);
  for (const id of ['incident_type', 'location', 'caller_safety', 'people', 'fire_smoke', 'fire_floor', 'injuries']) {
    assert.equal(progress.items.find((s) => s.item.id === id)!.status, 'covered', id);
  }
  const takerTexts = calls.filter((e) => e.type === 'call_taker_utterance').map((e) => e.text);
  assert.equal(new Set(takerTexts).size, takerTexts.length);
});

test('소방서·119안전센터는 구글 지도에서 확인한 실제 주소를 쓴다', () => {
  const stations = state.building!.nearbyStations;
  const byId = Object.fromEntries(stations.map((s) => [s.id, s]));
  assert.match(byId['st-samseong'].address, /테헤란로 629/);
  assert.match(byId['st-yeongdong'].address, /도산대로 320/);
  assert.match(byId['st-yeoksam'].address, /역삼로 236/);
  for (const st of stations) assert.ok(!/시연용 위치|주소 확인 필요/.test(st.address), st.id);
  assert.ok(!JSON.stringify(state).includes('아셈로'), '코엑스 서쪽 도로는 봉은사로86길·테헤란로87길');
});
