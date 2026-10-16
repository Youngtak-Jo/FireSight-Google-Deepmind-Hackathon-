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
                Emergency Fire Intake Line · Caller View
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              Connected to AI Call-Taker (Gemini Live Voice) with human dispatcher oversight.
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
                Start Call
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
                      Unmute
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-emerald-400" />
                      Mute
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
                  End Call
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
              Gemini Live Audio Stream Active ({liveSession.muted ? 'Mic Muted' : 'Listening 16kHz PCM'})
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
            {liveSession.error} — Typed caller statement fallback below remains active.
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
              badge={evt.speakerRole === 'caller' ? 'YOU (CALLER)' : 'AI CALL-TAKER'}
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
            Demo Statements:
          </span>
          <button
            type="button"
            onClick={() =>
              setTypedDraft(
                'Black smoke is getting thicker in the 3rd floor gallery corridor 3C at 304 S Broadway, still no flames in the hallway itself, and the 2 architects in East Studio 305 are sealing the door.'
              )
            }
            className="rounded-xs border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-300 hover:bg-zinc-800"
          >
            Report Hallway Smoke Only
          </button>
          <button
            type="button"
            onClick={() =>
              setTypedDraft(
                'Wait—correction! The fire is actually next door at 317 S Broadway (Grand Central Market Annex), Los Angeles, CA 90013!'
              )
            }
            className="rounded-xs border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] text-amber-300 hover:bg-zinc-800"
          >
            Correct Building Identity
          </button>
        </div>

        <form onSubmit={handleSubmitTypedFallback} className="space-y-2">
          <label
            htmlFor="caller-typed-fallback"
            className="block font-mono text-[10px] uppercase tracking-wider text-zinc-300"
          >
            Typed Caller-Statement Fallback (Routes directly to AI Call-Taker & Transcript)
          </label>
          <div className="flex gap-2">
            <input
              id="caller-typed-fallback"
              type="text"
              value={typedDraft}
              onChange={(e) => setTypedDraft(e.target.value)}
              placeholder="Type caller statement to AI call-taker…"
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
              Send Statement
            </button>
          </div>
        </form>
      </InputGroup>
    </div>
  );
}
