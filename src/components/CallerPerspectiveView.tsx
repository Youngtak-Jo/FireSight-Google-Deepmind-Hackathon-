import * as React from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Send,
  Radio,
  ShieldAlert,
  Loader2,
  Volume2,
} from 'lucide-react';
import {
  MessageScroller,
  Message,
  MessageHeader,
  MessageBubble,
  InputGroup,
} from './ui/base-primitives';
import type { IncidentState } from '../lib/incident-engine';

/** 119 접수 흐름을 따라 눌러볼 수 있는 예시 신고 문장 (가상의 주소) */
const DEMO_CALLER_STATEMENTS: Array<{ label: string; text: string; tone?: 'warn' }> = [
  { label: '① 화재 발생', text: '불이 났어요! 3층짜리 빌라 2층 창문에서 검은 연기가 나와요.' },
  { label: '② 주소', text: '화성시 동탄대로 123, 그린빌라예요.' },
  { label: '③ 구조대상자', text: '저는 밖으로 나왔는데 3층에 할머니 한 분이 아직 안 나오셨어요.' },
  { label: '④ 모르겠음', text: '잘 모르겠어요.' },
  { label: '⑤ 진입 장애', text: '1층 필로티 주차장에 차가 꽉 차 있어서 소방차 들어가기 힘들 것 같아요.' },
  { label: '⚠ 갇힘', text: '연기가 방으로 들어와서 못 나가겠어요!', tone: 'warn' },
  {
    label: '⚠ 건물 정정',
    text: '아, 잘못 말했어요! 옆 건물 화성시 동탄대로 125 블루빌라예요.',
    tone: 'warn',
  },
];

export function CallerPerspectiveView({
  incident,
  liveSession,
  onSendCallerTypedStatement,
  onCallControl,
}: {
  incident: IncidentState;
  liveSession: {
    connected: boolean;
    connecting: boolean;
    muted: boolean;
    error: string | null;
    audioLevel: number;
    startSession: () => Promise<void>;
    stopSession: () => void;
    toggleMute: () => void;
    sendTextPromptToLive: (text: string) => void;
  };
  onSendCallerTypedStatement: (text: string) => Promise<void>;
  onCallControl: (action: 'start' | 'mute' | 'unmute' | 'end') => Promise<void>;
}) {
  const [typedDraft, setTypedDraft] = React.useState('');
  const [sending, setSending] = React.useState(false);

  // Filter ONLY caller and call_taker messages — never expose internal team messages, research, or responder info!
  const callerConversation = React.useMemo(
    () =>
      incident.timeline.filter(
        (evt) => evt.type === 'caller_utterance' || evt.type === 'call_taker_utterance'
      ),
    [incident.timeline]
  );

  const handleSubmitTypedFallback = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = typedDraft.trim();
    if (!text || sending) return;
    setSending(true);
    setTypedDraft('');
    try {
      if (liveSession.connected) {
        liveSession.sendTextPromptToLive(text);
      }
      await onSendCallerTypedStatement(text);
    } finally {
      setSending(false);
    }
  };

  const isCallActive = liveSession.connected || incident.callState.active;
  const isMuted = liveSession.connected ? liveSession.muted : incident.callState.muted;

  const handleStartCall = async () => {
    await onCallControl('start');
    await liveSession.startSession();
  };

  const handleToggleMute = async () => {
    if (liveSession.connected) {
      liveSession.toggleMute();
    } else {
      await onCallControl(isMuted ? 'unmute' : 'mute');
    }
  };

  const handleEndCall = async () => {
    liveSession.stopSession();
    await onCallControl('end');
  };

  return (
    <div
      data-testid="caller-perspective-surface"
      className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden border-x border-zinc-800/80 bg-zinc-950"
    >
      {/* Focused Emergency Call Header & Controls */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isCallActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                }`}
              />
              <h2 className="text-sm font-semibold text-zinc-100">
                119 화재 신고 · 신고자 화면
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              AI 접수요원(Gemini Live 음성)과 연결되며, 상황실 요원이 함께 확인합니다.
            </p>
          </div>

          {/* Primary Call Controls: Start Call, Mute, End */}
          <div className="flex items-center gap-2">
            {!isCallActive ? (
              <button
                type="button"
                onClick={handleStartCall}
                disabled={liveSession.connecting}
                data-testid="caller-start-call-btn"
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/60 bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
              >
                {liveSession.connecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Phone className="h-3.5 w-3.5" />
                )}
                119 전화 걸기
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  data-testid="caller-mute-btn"
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                    isMuted
                      ? 'border-amber-500/60 bg-amber-500/20 text-amber-200'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <MicOff className="h-3.5 w-3.5 text-amber-400" />
                      음소거 해제
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-emerald-400" />
                      음소거
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  data-testid="caller-end-call-btn"
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-500/60 bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  통화 종료
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Voice Status Meter */}
        {liveSession.connected && (
          <div className="mt-3 flex items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-950/20 px-3 py-1.5 text-xs">
            <span className="flex items-center gap-2 text-emerald-300">
              <Volume2 className="h-3.5 w-3.5 animate-pulse" />
              실시간 음성 연결됨 ({liveSession.muted ? '마이크 꺼짐' : '듣는 중'})
            </span>
            <div className="flex items-center gap-1">
              {[0.15, 0.3, 0.5, 0.7, 0.9].map((thresh, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-1 rounded-xs transition-all ${
                    liveSession.audioLevel >= thresh ? 'bg-emerald-400' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {liveSession.error && (
          <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-950/30 px-3 py-1.5 text-xs text-amber-200">
            {liveSession.error} — 아래 입력창으로 글로 신고할 수 있습니다.
          </div>
        )}
      </div>

      {/* Caller's Own Conversation Transcript (Isolated from internal team/research) */}
      <MessageScroller
        itemCount={callerConversation.length}
        liveRevision={incident.revision}
      >
        {callerConversation.map((evt) => (
          <Message
            key={evt.id}
            id={evt.id}
            className={
              evt.speakerRole === 'caller'
                ? 'border-red-500/25 bg-red-950/15 ml-6'
                : 'border-zinc-800 bg-zinc-900/70 mr-6'
            }
          >
            <MessageHeader
              speaker={evt.speaker}
              badge={evt.speakerRole === 'caller' ? '나' : '119'}
              timestamp={evt.createdAt}
              icon={
                evt.speakerRole === 'caller' ? (
                  <Phone className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Radio className="h-3.5 w-3.5 text-amber-400" />
                )
              }
            />
            <MessageBubble isPartial={evt.isPartial} className="text-xs">
              {evt.text}
            </MessageBubble>
          </Message>
        ))}
      </MessageScroller>

      {/* Quick Demo Caller Statements + Clearly Labeled Typed Caller-Statement Fallback */}
      <InputGroup>
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <span className="font-mono text-[10px] uppercase text-zinc-400">
            예시 신고:
          </span>
          {DEMO_CALLER_STATEMENTS.map((demo) => (
            <button
              key={demo.label}
              type="button"
              onClick={() => setTypedDraft(demo.text)}
              className={`rounded-xs border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] hover:bg-zinc-800 ${
                demo.tone === 'warn' ? 'text-amber-300' : 'text-zinc-300'
              }`}
            >
              {demo.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmitTypedFallback} className="space-y-2">
          <label
            htmlFor="caller-typed-fallback"
            className="block font-mono text-[10px] uppercase tracking-wider text-zinc-300"
          >
            글로 신고하기 (AI 접수요원과 상황실 기록에 바로 전달됩니다)
          </label>
          <div className="flex gap-2">
            <input
              id="caller-typed-fallback"
              type="text"
              value={typedDraft}
              onChange={(e) => setTypedDraft(e.target.value)}
              placeholder="신고 내용을 입력하세요…"
              data-testid="caller-typed-input"
              className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!typedDraft.trim() || sending}
              data-testid="caller-send-statement-btn"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              보내기
            </button>
          </div>
        </form>
      </InputGroup>
    </div>
  );
}
