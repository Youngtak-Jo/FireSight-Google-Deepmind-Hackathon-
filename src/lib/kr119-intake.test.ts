import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KR119_INTAKE_ITEMS,
  computeIntakeProgress,
  buildRuleBasedCallTakerReply,
  formatIntakeChecklistForPrompt,
  EVACUATION_GUIDANCE,
  TRAPPED_GUIDANCE,
  CLOSING_LINE,
  type IntakeTimelineEventLike,
} from './kr119-intake.ts';

const caller = (text: string): IntakeTimelineEventLike => ({ type: 'caller_utterance', text });
const taker = (text: string): IntakeTimelineEventLike => ({ type: 'call_taker_utterance', text });
const q = (id: string) => KR119_INTAKE_ITEMS.find((it) => it.id === id)!.question;
const statusOf = (events: IntakeTimelineEventLike[], id: string) =>
  computeIntakeProgress(events).items.find((s) => s.item.id === id)!.status;

test('빈 통화는 재난 유형(무엇이 타는지)부터 묻는다', () => {
  assert.equal(buildRuleBasedCallTakerReply([]), q('incident_type'));
});

test('출동지령 정보(유형 → 위치)를 가장 먼저 받는다', () => {
  const events = [caller('불이 났어요! 2층 창문에서 검은 연기가 나와요.')];
  const p = computeIntakeProgress(events);
  assert.equal(statusOf(events, 'incident_type'), 'covered');
  assert.equal(statusOf(events, 'fire_smoke'), 'covered');
  assert.equal(statusOf(events, 'fire_floor'), 'covered');
  assert.equal(p.nextItem?.id, 'location');
});

test('건물 종류만 말하면 위치로 보지 않고, 이름·주소가 있어야 위치로 본다', () => {
  assert.equal(statusOf([caller('3층 빌라에서 불이 났어요')], 'location'), 'pending');
  assert.equal(statusOf([caller('그린빌라예요')], 'location'), 'covered');
  assert.equal(statusOf([caller('화성시 동탄대로 123이에요')], 'location'), 'covered');
  assert.equal(statusOf([caller('101동 1203호요')], 'location'), 'covered');
  assert.equal(statusOf([caller('주소는 모르는데 전봇대 번호가 1658223이에요')], 'location'), 'covered');
});

test('"모르겠어요"는 방금 물어본 항목을 모름으로 처리하고 다시 묻지 않는다', () => {
  const events = [
    caller('불이 났어요, 화성시 동탄대로 123 그린빌라예요'),
    taker(q('caller_safety')),
    caller('저는 밖으로 나왔어요'),
    taker(q('people')),
    caller('잘 모르겠어요'),
  ];
  assert.equal(statusOf(events, 'people'), 'unknown');
  assert.notEqual(computeIntakeProgress(events).nextItem?.id, 'people');
});

test('키워드 없는 짧은 대답("없어요")도 방금 물어본 항목의 답으로 본다', () => {
  const events = [caller('불이야! 화성시 동탄대로 123'), taker(q('hazards')), caller('없어요')];
  assert.equal(statusOf(events, 'hazards'), 'covered');
});

test('신고자가 안에 있지만 움직일 수 있으면 대피 안내를 먼저 한다 (한 번만)', () => {
  const events = [caller('불이 났어요, 화성시 동탄대로 123 그린빌라 3층이에요. 지금 집 안에 있어요')];
  const reply = buildRuleBasedCallTakerReply(events);
  assert.ok(reply.startsWith(EVACUATION_GUIDANCE));

  const afterGuidance = [...events, taker(reply), caller('네 알겠어요')];
  assert.ok(!buildRuleBasedCallTakerReply(afterGuidance).includes(EVACUATION_GUIDANCE));
});

test('갇혀 나올 수 없는 신고자에게는 계단 대피 대신 문틈 막기·구조 대기를 안내한다', () => {
  const events = [caller('불이 났는데 연기가 방으로 들어와서 못 나가겠어요, 화성시 동탄대로 123 그린빌라 3층이에요')];
  const p = computeIntakeProgress(events);
  assert.equal(p.callerTrapped, true);
  const reply = buildRuleBasedCallTakerReply(events);
  assert.ok(reply.startsWith(TRAPPED_GUIDANCE));
  assert.ok(!reply.includes('계단으로 대피'));
});

test('밖으로 나왔다고 하면 신고자 안전 항목이 채워진다', () => {
  const events = [caller('저 밖으로 나왔어요')];
  const p = computeIntakeProgress(events);
  assert.equal(statusOf(events, 'caller_safety'), 'covered');
  assert.equal(p.callerSafe, true);
  assert.equal(p.callerMayBeInside, false);
});

test('모든 항목을 받으면 출동 안내와 "끊지 마세요"로 마무리한다', () => {
  const events: IntakeTimelineEventLike[] = [];
  for (const it of KR119_INTAKE_ITEMS) {
    events.push(taker(it.question));
    events.push(caller('모르겠어요'));
  }
  const p = computeIntakeProgress(events);
  assert.equal(p.coveredCount, p.total);
  assert.equal(buildRuleBasedCallTakerReply(events), CLOSING_LINE);
});

test('작성 중(isPartial) 발화는 판단에 쓰지 않는다', () => {
  const events = [{ type: 'caller_utterance', text: '화성시 동탄대로 123', isPartial: true }];
  assert.equal(statusOf(events, 'location'), 'pending');
});

test('AI 프롬프트용 요약에 진행도와 다음 항목이 들어간다', () => {
  const text = formatIntakeChecklistForPrompt([caller('불이 났어요')]);
  assert.match(text, /119 접수 체크리스트 \(\d+\/10\)/);
  assert.match(text, /다음 우선 항목: 발생 위치/);
});

test('영어 데모 발화도 주요 항목을 인식한다', () => {
  const events = [
    caller('Black smoke is getting thicker in the 3rd floor corridor at 304 S Broadway, 2 people are trapped.'),
  ];
  for (const id of ['incident_type', 'location', 'fire_smoke', 'fire_floor', 'people']) {
    assert.equal(statusOf(events, id), 'covered', id);
  }
});

test('"저는 밖으로 나왔어요"나 "그린빌라예요"를 신고자 정보로 오인하지 않는다', () => {
  const events = [caller('저는 밖으로 나왔는데 그린빌라예요')];
  assert.equal(statusOf(events, 'caller_info'), 'pending');
  assert.equal(statusOf([caller('2층에 사는 주민이에요')], 'caller_info'), 'covered');
});

test('전체 접수 흐름: 모든 항목을 차례로 묻고 마지막에 마무리 안내를 한다', () => {
  const script = [
    '불이 났어요! 3층짜리 빌라 2층 창문에서 검은 연기가 나와요.',
    '화성시 동탄대로 123, 그린빌라예요.',
    '저는 밖으로 나왔는데 3층에 할머니 한 분이 아직 안 나오셨어요.',
    '다친 사람은 없는 것 같아요.',
    '잘 모르겠어요.',
    '1층 필로티 주차장에 차가 꽉 차 있어서 소방차 들어가기 힘들 것 같아요.',
    '김민수고요, 2층에 사는 주민이에요.',
  ];
  const events: IntakeTimelineEventLike[] = [];
  const replies: string[] = [];
  for (const line of script) {
    events.push(caller(line));
    const reply = buildRuleBasedCallTakerReply(events);
    replies.push(reply);
    events.push(taker(reply));
  }
  assert.equal(replies[replies.length - 2], q('caller_info'));
  assert.equal(replies[replies.length - 1], CLOSING_LINE);
  assert.equal(new Set(replies).size, replies.length, '같은 질문을 반복하지 않는다');
});

test('코엑스 데모 신고: "코엑스몰"을 위치로, "연기를 많이 마셨다"를 부상자로 인식하고 "주방 직원"은 신고자 정보로 보지 않는다', () => {
  const first = [caller('119죠? 불났어요! 코엑스몰 지하 1층 식당가인데요, 한식당 주방에서 불길이 확 올라오고 검은 연기가 엄청 나와요!')];
  for (const id of ['incident_type', 'location', 'fire_smoke', 'fire_floor']) {
    assert.equal(statusOf(first, id), 'covered', id);
  }
  const second = [
    ...first,
    caller('저는 별마당도서관 쪽으로 빠져나왔어요. 주방 직원 한 분은 연기를 많이 마셨다고 했어요.'),
  ];
  assert.equal(statusOf(second, 'injuries'), 'covered');
  assert.equal(statusOf(second, 'caller_info'), 'pending');
});
