/**
 * 119 화재 신고 접수 체크리스트 (한국 119종합상황실 접수 흐름 기준)
 *
 * 접수 순서 원칙
 *  1) 출동지령에 꼭 필요한 정보 먼저: 재난 유형(무엇이 타는지) → 발생 위치(주소·동/호수·층)
 *  2) 인명: 신고자 본인 안전 → 대피하지 못한 사람(구조대상자) → 부상자
 *  3) 현장 상황: 불꽃/연기 → 발화 층·위치 → 위험물 → 소방차 진입 여건
 *  4) 신고자 정보: 이름·건물과의 관계 (전화번호는 발신번호로 자동 확인)
 *
 * 이 모듈은 외부 의존성이 없는 순수 함수만 담고 있어 서버(server.ts)와 화면(React) 양쪽에서 같이 쓴다.
 * API 키가 없을 때는 이 규칙으로 다음 질문을 고르고, API 키가 있을 때는 AI 프롬프트에 체크리스트 상태를 넣어
 * AI가 같은 순서를 따르게 한다.
 *
 * 주의: 키워드 기반 판별은 1차 근사치다. 실제 사실 추출은 AI(Gemini)가 담당한다.
 */

export type IntakeTier = 'dispatch' | 'life' | 'situation' | 'caller';

export type IntakeItemStatus = 'covered' | 'unknown' | 'asked' | 'pending';

export interface IntakeItem {
  id: string;
  tier: IntakeTier;
  label: string;
  /** 규칙 기반(키 없음) 모드에서 접수요원이 그대로 묻는 질문 */
  question: string;
  /** 신고자 발화에 이 패턴이 있으면 해당 항목 정보를 받은 것으로 본다 */
  answerPattern: RegExp;
  /** 접수요원 발화에 이 패턴이 있으면 해당 항목을 물어본 것으로 본다 */
  askPattern: RegExp;
}

export interface IntakeTimelineEventLike {
  type: string;
  text: string;
  isPartial?: boolean;
}

export interface IntakeItemState {
  item: IntakeItem;
  status: IntakeItemStatus;
  /** 이 항목을 채운 신고자 발화 (있을 때) */
  evidence?: string;
}

export interface IntakeProgress {
  items: IntakeItemState[];
  coveredCount: number;
  total: number;
  /** 다음으로 물어볼 항목 (모두 끝났으면 undefined) */
  nextItem?: IntakeItem;
  /** 신고자가 아직 건물 안에 있거나 갇힌 것으로 보이는지 */
  callerMayBeInside: boolean;
  /** 신고자가 스스로 나올 수 없는(갇힌) 상태로 보이는지 */
  callerTrapped: boolean;
  /** 신고자가 밖으로 나와 안전한 것으로 보이는지 */
  callerSafe: boolean;
}

export const TIER_LABELS: Record<IntakeTier, string> = {
  dispatch: '출동지령',
  life: '인명',
  situation: '현장상황',
  caller: '신고자',
};

export const KR119_INTAKE_ITEMS: IntakeItem[] = [
  {
    id: 'incident_type',
    tier: 'dispatch',
    label: '재난 유형 (무엇이 타는지)',
    question: '119입니다. 무엇이 타고 있나요? 건물인지, 차량인지 말씀해 주세요.',
    answerPattern:
      /불|화재|타고|타요|탄다|연기|폭발|터졌|그을|fire|smoke|burn|flame|explos/i,
    askPattern: /무슨 일|무엇이 타|뭐가 타|어떤 불|화재인가|what.*(burn|happen)|what is on fire/i,
  },
  {
    id: 'location',
    tier: 'dispatch',
    label: '발생 위치 (주소·동/호수·층)',
    question:
      '불이 난 곳 주소가 어떻게 되나요? 아파트라면 동·호수까지 말씀해 주세요. 주소를 모르시면 근처 큰 건물, 간판, 전봇대 번호도 괜찮습니다.',
    answerPattern:
      /[가-힣]+(시|도|군|구)\s?[가-힣\d]+(구|동|읍|면|로|길)|[가-힣\d]+(로|길)\s?\d+|\d+\s?동\s?\d+\s?호|\d+\s?(번지|번길)|[가-힣A-Za-z\d]{2,}(아파트|빌라|빌딩|오피스텔|상가|타워|맨션|공장|창고|학교|병원|교회|마트|시장)|전봇대|간판|건너편|맞은편|사거리|역\s?앞|\d+\s+[A-Za-z .]+(St|Street|Ave|Avenue|Blvd|Road|Rd|Broadway|Building)\b|\baddress\b/i,
    askPattern: /주소|어디|위치|장소|address|where|location/i,
  },
  {
    id: 'caller_safety',
    tier: 'life',
    label: '신고자 안전 (건물 안/밖)',
    question: '지금 신고자분은 안전한 곳에 계신가요? 건물 밖으로 나오셨나요?',
    answerPattern:
      /밖|나왔|나와\s?있|대피했|피했|안전|안에\s?(있|갇)|갇혔|못\s?나가|나갈\s?수\s?없|집\s?안|옥상|outside|evacuat|inside|safe|trapped|can'?t get out/i,
    askPattern: /안전한 곳|안전하신|건물 밖|나오셨|어디에 계|are you safe|are you outside|where are you/i,
  },
  {
    id: 'people',
    tier: 'life',
    label: '대피 못 한 사람 (구조대상자)',
    question:
      '건물 안에 아직 대피하지 못한 사람이 있나요? 있다면 몇 명이고, 몇 층 어디쯤인지 아시나요?',
    answerPattern:
      /사람|[0-9한두세네다섯]\s?(명|분)|아이|애기|아기|노인|어르신|할머니|할아버지|가족|남아|못\s?나오|못\s?나왔|안\s?나오|갇|요구조|구조대상|아무도\s?없|다\s?나왔|모두\s?(나왔|대피)|people|person|occupant|trapped|nobody|everyone/i,
    askPattern: /대피하지 못|남아 있|안에.*사람|갇힌|요구조|구조대상|anyone (still )?inside|people inside|trapped/i,
  },
  {
    id: 'fire_smoke',
    tier: 'situation',
    label: '불꽃·연기 (색·양)',
    question: '불꽃이 보이나요, 아니면 연기만 보이나요? 연기 색깔은 어떤가요?',
    answerPattern:
      /불꽃|불길|화염|시뻘|빨간\s?불|연기|검은|까만|시커먼|흰|하얀|회색|매캐|냄새|flame|smoke|black|white|gr[ae]y/i,
    askPattern: /불꽃|연기|연기 색|flame|smoke/i,
  },
  {
    id: 'fire_floor',
    tier: 'situation',
    label: '발화 층·위치',
    question: '불이나 연기가 몇 층, 어느 쪽에서 나고 있나요?',
    answerPattern:
      /\d+\s?층|[일이삼사오육칠팔구십]층|지하|옥상|꼭대기|필로티|주차장|주방|베란다|발코니|거실|안방|창문|복도|계단|\d+(st|nd|rd|th)\s?floor|floor\s?\d|basement|roof|kitchen|corridor|hallway/i,
    askPattern: /몇 층|어느 층|어느 쪽|어디에서 (불|연기)|which floor|what floor/i,
  },
  {
    id: 'injuries',
    tier: 'life',
    label: '부상자',
    question: '다친 분이 있나요? 화상을 입거나 연기를 마신 분이 있으면 알려 주세요.',
    answerPattern:
      /다친|다쳤|부상|화상|쓰러|의식|숨\s?(을|쉬)|기침|피\s?(가|를)|연기\s?마|안\s?다쳤|다친\s?사람\s?없|injur|hurt|burned|unconscious|bleed|no one (is )?hurt/i,
    askPattern: /다친|부상|화상|injur|hurt/i,
  },
  {
    id: 'hazards',
    tier: 'situation',
    label: '위험물 (가스·배터리·화학물질)',
    question:
      '근처에 가스통(LPG), 전기차나 배터리, 기름·화학물질 같은 위험한 물건이 있나요?',
    answerPattern:
      /가스|LPG|엘피지|부탄|프로판|배터리|전기차|충전|킥보드|기름|휘발유|경유|시너|페인트|화학|위험물|산소통|gas|battery|propane|chemical|hazmat|fuel|lithium/i,
    askPattern: /위험한 물건|위험물|가스통|배터리|hazard|gas|battery|chemical/i,
  },
  {
    id: 'access',
    tier: 'situation',
    label: '소방차 진입 여건',
    question: '소방차가 들어가는 길에 불법주차나 좁은 골목 같은 장애물이 있나요?',
    answerPattern:
      /주차|골목|진입|막혀|막혔|좁|도로|입구|정문|후문|차단기|공사|못\s?들어|parking|alley|access|blocked|entrance|gate|narrow/i,
    askPattern: /소방차|들어가는 길|진입|장애물|access|blocked|entrance/i,
  },
  {
    id: 'caller_info',
    tier: 'caller',
    label: '신고자 성함·관계',
    question:
      '마지막으로 신고자분 성함과 건물과의 관계(거주자, 직원, 지나가던 분 등)를 알려 주세요.',
    answerPattern:
      /제\s?이름|이름은|성함은|사는\s?(사람|주민)|살아요|거주|주민|직원|주인|사장|관리인|관리소|경비|지나가|행인|이웃|옆집|세입자|my name|resident|employee|owner|neighbor|passerby|building manager/i,
    askPattern: /성함|이름|관계|who are you|your name|relationship/i,
  },
];

const UNKNOWN_PATTERN =
  /모르겠|몰라요|모름|잘\s?모르|확인\s?(이\s?)?안|못\s?봤|안\s?보여|기억이?\s?안|don'?t know|not sure|no idea|can'?t see/i;

const CALLER_INSIDE_PATTERN =
  /안에\s?(있|갇)|갇혔|갇혀|못\s?나가|나갈\s?수\s?없|문이\s?안\s?열|연기가\s?(들어|차)|still inside|trapped|can'?t get out/i;

const CALLER_TRAPPED_PATTERN =
  /갇혔|갇혀|못\s?나가|못\s?나오|나갈\s?수\s?없|문이\s?안\s?열|trapped|can'?t get out/i;

const CALLER_SAFE_PATTERN = /밖으로\s?나왔|밖에\s?(있|나와)|대피했|피했어|안전해|outside now|i'?m outside|evacuated|i'?m safe/i;

/** 건물 안에 있지만 움직일 수 있는 신고자용 대피 안내 */
export const EVACUATION_GUIDANCE =
  '엘리베이터는 절대 타지 마시고, 젖은 수건으로 코와 입을 막고 자세를 낮춰 계단으로 대피하세요. 문손잡이가 뜨거우면 열지 마시고, 나갈 수 없으면 창문 쪽에서 구조를 요청하거나 대피공간·경량칸막이를 이용하세요.';

/** 나갈 수 없는(갇힌) 신고자용 안내: 대피 강요 대신 연기 차단과 구조 대기 */
export const TRAPPED_GUIDANCE =
  '무리해서 나오지 마세요. 방문을 닫고 젖은 수건이나 옷으로 문틈을 막은 뒤, 자세를 낮추고 창문 쪽에서 구조를 기다리세요. 대피공간이나 경량칸막이가 있으면 그쪽으로 이동하세요. 구조대가 가고 있습니다.';

export const CLOSING_LINE =
  '알겠습니다. 소방차가 출동했습니다. 안전한 곳에서 기다려 주시고, 상황실에서 끊으라고 할 때까지 전화를 끊지 마세요.';

function findAskedItemId(callTakerText: string, alreadyHandled: Set<string>): string | undefined {
  // 접수요원이 방금 물어본 항목: 아직 처리 안 된 항목 중 질문 문구가 정확히 일치하거나 askPattern이 맞는 첫 항목
  const exact = KR119_INTAKE_ITEMS.find((it) => callTakerText.includes(it.question));
  if (exact) return exact.id;
  const byPattern = KR119_INTAKE_ITEMS.find(
    (it) => !alreadyHandled.has(it.id) && it.askPattern.test(callTakerText)
  );
  return byPattern?.id;
}

/**
 * 타임라인(신고자·접수요원 대화)으로부터 체크리스트 진행 상태를 계산한다.
 */
export function computeIntakeProgress(events: IntakeTimelineEventLike[]): IntakeProgress {
  const status = new Map<string, IntakeItemStatus>();
  const evidence = new Map<string, string>();
  for (const it of KR119_INTAKE_ITEMS) status.set(it.id, 'pending');

  let lastAskedId: string | undefined;
  let callerMayBeInside = false;
  let callerTrapped = false;
  let callerSafe = false;

  const handled = () =>
    new Set(
      [...status.entries()].filter(([, s]) => s === 'covered' || s === 'unknown').map(([id]) => id)
    );

  for (const evt of events) {
    const text = (evt.text || '').trim();
    if (!text || evt.isPartial) continue;

    if (evt.type === 'call_taker_utterance') {
      const askedId = findAskedItemId(text, handled());
      if (askedId) {
        lastAskedId = askedId;
        if (status.get(askedId) === 'pending') status.set(askedId, 'asked');
      }
      continue;
    }

    if (evt.type !== 'caller_utterance') continue;

    let matchedAny = false;
    for (const it of KR119_INTAKE_ITEMS) {
      if (status.get(it.id) === 'covered') continue;
      if (it.answerPattern.test(text)) {
        status.set(it.id, 'covered');
        evidence.set(it.id, text);
        matchedAny = true;
      }
    }

    // "모르겠어요" 같은 답은 방금 물어본 항목을 '모름'으로 처리하고 넘어간다 (다시 캐묻지 않음)
    if (UNKNOWN_PATTERN.test(text) && lastAskedId && status.get(lastAskedId) !== 'covered') {
      status.set(lastAskedId, 'unknown');
      evidence.set(lastAskedId, text);
    } else if (!matchedAny && lastAskedId && status.get(lastAskedId) === 'asked' && text.length >= 2) {
      // 물어본 항목에 키워드 없이 답한 경우(예: "네", "없어요")도 답한 것으로 본다
      status.set(lastAskedId, 'covered');
      evidence.set(lastAskedId, text);
    }

    if (CALLER_INSIDE_PATTERN.test(text)) {
      callerMayBeInside = true;
      callerSafe = false;
    }
    if (CALLER_TRAPPED_PATTERN.test(text)) {
      callerTrapped = true;
    }
    if (CALLER_SAFE_PATTERN.test(text)) {
      callerSafe = true;
      callerMayBeInside = false;
      callerTrapped = false;
    }
  }

  const items: IntakeItemState[] = KR119_INTAKE_ITEMS.map((it) => ({
    item: it,
    status: status.get(it.id) || 'pending',
    evidence: evidence.get(it.id),
  }));

  const coveredCount = items.filter((s) => s.status === 'covered' || s.status === 'unknown').length;
  // 물어봤는데 답을 못 받은 항목('asked')은 다시 캐묻지 않는다 (신고자 부담 최소화, 상황실이 화면에서 확인)
  const nextItem = items.find((s) => s.status === 'pending')?.item;

  return {
    items,
    coveredCount,
    total: items.length,
    nextItem,
    callerMayBeInside,
    callerTrapped,
    callerSafe,
  };
}

/**
 * API 키가 없을 때 사용하는 규칙 기반 접수요원 응답.
 * 신고자가 아직 안에 있으면 대피 안내를 먼저 하고, 그다음 체크리스트의 다음 질문을 붙인다.
 */
export function buildRuleBasedCallTakerReply(events: IntakeTimelineEventLike[]): string {
  const progress = computeIntakeProgress(events);
  const parts: string[] = [];

  const guidance = progress.callerTrapped ? TRAPPED_GUIDANCE : EVACUATION_GUIDANCE;
  const alreadyGaveGuidance = events.some(
    (e) => e.type === 'call_taker_utterance' && (e.text || '').includes(guidance)
  );
  if (progress.callerMayBeInside && !alreadyGaveGuidance) {
    parts.push(guidance);
  }

  if (progress.nextItem) {
    parts.push(progress.nextItem.question);
  } else {
    parts.push(CLOSING_LINE);
  }

  return parts.join(' ');
}

/**
 * AI(Gemini) 프롬프트에 넣을 체크리스트 상태 요약 (한국어).
 */
export function formatIntakeChecklistForPrompt(events: IntakeTimelineEventLike[]): string {
  const progress = computeIntakeProgress(events);
  const statusLabel: Record<IntakeItemStatus, string> = {
    covered: '확인됨',
    unknown: '신고자 모름(다시 묻지 말 것)',
    asked: '질문함·답 없음',
    pending: '미확인',
  };
  const lines = progress.items.map(
    (s, i) => `${i + 1}. [${TIER_LABELS[s.item.tier]}] ${s.item.label}: ${statusLabel[s.status]}`
  );
  const next = progress.nextItem
    ? `다음 우선 항목: ${progress.nextItem.label} (예시 질문: "${progress.nextItem.question}")`
    : '모든 항목 확인 완료 → 출동 안내와 함께 "끊으라고 할 때까지 전화를 끊지 마세요"로 마무리';
  const inside = progress.callerTrapped
    ? '⚠ 신고자가 갇혀 나올 수 없는 것으로 보임 → 무리한 대피 대신 문 닫고 문틈 막기, 창문 쪽 구조 대기 안내를 먼저 할 것'
    : progress.callerMayBeInside
      ? '⚠ 신고자가 아직 건물 안에 있는 것으로 보임 → 질문보다 대피 안내를 먼저 할 것'
      : '';
  return [`119 접수 체크리스트 (${progress.coveredCount}/${progress.total})`, ...lines, next, inside]
    .filter(Boolean)
    .join('\n');
}

/**
 * Gemini Live(실시간 음성) 접수요원용 한국어 시스템 지시문의 공통 규칙.
 */
export const KR119_CALL_TAKER_RULES = [
  '당신은 대한민국 119종합상황실의 AI 신고 접수요원입니다. 반드시 한국어로, 짧고 차분한 존댓말로 말하세요.',
  '핵심 규칙:',
  '1. 한 번에 질문은 하나만 합니다. 신고자가 이미 말한 내용은 다시 묻지 않습니다.',
  '2. 접수 순서: ① 무엇이 타는지(재난 유형) → ② 발생 위치(주소, 아파트는 동·호수, 층) → ③ 신고자 본인 안전 → ④ 대피 못 한 사람(인원·층·위치) → ⑤ 불꽃/연기 색 → ⑥ 발화 층·위치 → ⑦ 부상자 → ⑧ 위험물(LPG·배터리·화학물질) → ⑨ 소방차 진입 장애물 → ⑩ 신고자 성함·관계.',
  '3. 주소를 모르면 근처 큰 건물, 간판, 전봇대 번호, 사거리 이름으로 위치를 받습니다.',
  '4. 신고자가 아직 건물 안에 있다면 질문보다 안내가 먼저입니다. 움직일 수 있으면: 엘리베이터 금지, 젖은 수건으로 코와 입을 막고 낮은 자세로 계단 대피, 뜨거운 문은 열지 않기. 갇혀 나올 수 없으면: 무리한 대피 대신 방문을 닫고 젖은 수건으로 문틈 막기, 창문 쪽에서 구조 대기, 대피공간·경량칸막이 이용.',
  '5. "모르겠어요"라는 답은 바로 받아들이고 다음 항목으로 넘어갑니다. 위험한 곳에 다가가거나, 뜨거운 문을 열거나, 직접 불을 끄라고 요청하지 않습니다(작은 초기 화재에서 신고자가 이미 소화기를 들고 있는 경우는 예외로 안전하게 안내).',
  '6. 직접 본 것과 다른 사람에게 들은 것을 구분해서 확인합니다.',
  '7. 모든 항목을 확인했으면 소방차가 출동했다고 안내하고 "상황실에서 끊으라고 할 때까지 전화를 끊지 마세요"로 마무리합니다.',
].join('\n');
