import * as React from 'react';
import {
  PhoneCall,
  Bot,
  Send,
  Sparkles,
  Box,
  Camera,
  FileText,
  Mic,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Radio,
  RefreshCw,
  MapPin,
  Layers,
  Building2,
  Wind,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  MessageScroller,
  Message,
  MessageHeader,
  MessageBubble,
  InputGroup,
  Trace,
  TraceSubagent,
  MarkdownText,
} from './ui/base-primitives';
import {
  releaseGlobalMicrophoneOwnership,
  registerGlobalMicrophoneStopper,
} from '../lib/use-live-session';
import type {
  IncidentState,
  TimelineEvent,
  SourceDocument,
  Perspective,
} from '../lib/incident-engine';
import type { Selected3DElement } from './ThreeSceneWorkspace';
import {
  BUILDING_REFERENCE_PHOTOS,
  GEOCODE_MAP_PREVIEW_SVG,
  getBuildingVisualAssets,
} from '../lib/three-assets';

export function ConversationTimeline({
  incident,
  perspective,
  participantName,
  onSendTeamMessage,
  onAskAi,
  onOpenSource,
  onFocus3DElement,
  onTriggerResearch,
  onOpenBuildingReference,
  onStartDemo,
  onResetStandby,
}: {
  incident: IncidentState;
  perspective: Perspective;
  participantName: string;
  onSendTeamMessage: (text: string) => Promise<void>;
  onAskAi: (text: string) => Promise<void>;
  onOpenSource: (source: SourceDocument, page?: number) => void;
  onFocus3DElement: (floor?: number, element?: Selected3DElement) => void;
  onTriggerResearch?: () => void;
  onOpenBuildingReference?: () => void;
  onStartDemo?: (scenario: 'bradbury_mockup' | 'ferry_live') => void;
  onResetStandby?: () => void;
}) {
  const [draft, setDraft] = React.useState('');
  const [submitting, setSubmitting] = React.useState<'team' | 'ai' | null>(null);
  const [dictating, setDictating] = React.useState(false);
  const [transcribing, setTranscribing] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);

  const sourcesMap = React.useMemo(() => {
    const map = new Map<string, SourceDocument>();
    for (const s of incident.sources) {
      map.set(s.id, s);
    }
    return map;
  }, [incident.sources]);

  const stopDictation = React.useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setDictating(false);
  }, []);

  const toggleDictation = React.useCallback(async () => {
    if (dictating) {
      stopDictation();
      return;
    }

    releaseGlobalMicrophoneOwnership();
    registerGlobalMicrophoneStopper(stopDictation);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setDictating(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size === 0) return;

        setTranscribing(true);
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const res = String(reader.result || '');
              const idx = res.indexOf(',');
              resolve(idx !== -1 ? res.slice(idx + 1) : res);
            };
          });
          reader.readAsDataURL(blob);
          const audioBase64 = await base64Promise;

          const resp = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64,
              mimeType: recorder.mimeType || 'audio/webm',
            }),
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.text) {
              setDraft((prev) => (prev ? `${prev} ${data.text}` : data.text));
            }
          }
        } catch (err) {
          console.warn('Dictation error:', err);
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      setDictating(true);
    } catch (err) {
      console.warn('Microphone unavailable for dictation:', err);
      setDictating(false);
    }
  }, [dictating, stopDictation]);

  const handleSendTeam = async () => {
    const trimmed = draft.trim();
    if (!trimmed || submitting) return;
    setSubmitting('team');
    setDraft('');
    try {
      await onSendTeamMessage(trimmed);
    } finally {
      setSubmitting(null);
    }
  };

  const handleAskAi = async () => {
    const trimmed = draft.trim();
    if (!trimmed || submitting) return;
    setSubmitting('ai');
    setDraft('');
    try {
      await onAskAi(trimmed);
    } finally {
      setSubmitting(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleAskAi();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendTeam();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950">
      {/* Sub-header for Timeline */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-zinc-800/80 bg-zinc-950 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Shared Incident Timeline
          </span>
          <span className="rounded-xs border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            {incident.timeline.length} events · Rev #{incident.buildingRevision}
          </span>
          {incident.demoRunning && (
            <span
              data-testid="demo-streaming-badge"
              className="inline-flex items-center gap-1 rounded-xs border border-amber-500/50 bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300 animate-pulse"
            >
              <Sparkles className="h-2.5 w-2.5" />
              DEMO LIVE · STEP {incident.demoStepIndex || 1}/{incident.demoTotalSteps || 8}
            </span>
          )}
        </div>

        {onStartDemo && incident.timeline.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onStartDemo('bradbury_mockup')}
              data-testid="subheader-demo-bradbury"
              className={`rounded-xs border px-1.5 py-0.5 font-mono text-[10px] transition ${
                incident.demoScenarioId === 'bradbury_mockup'
                  ? 'border-amber-500/60 bg-amber-500/20 text-amber-200 font-semibold'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Demo 1: Bradbury
            </button>
            <button
              type="button"
              onClick={() => onStartDemo('ferry_live')}
              data-testid="subheader-demo-ferry"
              className={`rounded-xs border px-1.5 py-0.5 font-mono text-[10px] transition ${
                incident.demoScenarioId === 'ferry_live'
                  ? 'border-sky-500/60 bg-sky-500/20 text-sky-200 font-semibold'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Demo 2: SF Ferry Live
            </button>
            {onResetStandby && (
              <button
                type="button"
                onClick={onResetStandby}
                data-testid="subheader-reset-standby"
                title="Clear workspace back to empty standby screen"
                className="rounded-xs border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chronological Message Scroller */}
      <MessageScroller
        itemCount={incident.timeline.length}
        liveRevision={incident.revision}
      >
        {incident.timeline.length === 0 ? (
          <div
            data-testid="empty-chat-standby"
            className="my-6 rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-4 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-amber-500/40 bg-amber-500/15">
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
                  Argon Live Incident Stream · Standby
                </div>
                <h3 className="mt-0.5 text-sm font-bold text-zinc-100">
                  Select a Demo Scenario to Stream Real-Time Dispatch & 3D Synthesis
                </h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Choose <span className="font-semibold text-zinc-200">Demo 1</span> for a naturally paced (<span className="font-semibold text-zinc-200">2.6–2.8s/step</span>) curated asset walkthrough, or <span className="font-semibold text-sky-300">Demo 2</span> to execute <span className="font-semibold text-sky-200">real live Gemini Argon (gemini-4-argon) Google Search, Multimodal Vision & Maps API</span> calls in real time.
                </p>
              </div>
            </div>

            {onStartDemo && (
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onStartDemo('bradbury_mockup')}
                  data-testid="chat-start-demo-bradbury"
                  className="w-full text-left rounded-md border border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 p-3 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase text-amber-300">
                      ▶ Start Demo 1 · Curated Asset Mockup
                    </span>
                    <span className="rounded-xs bg-amber-500 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-950">
                      ~2.8s Natural Pacing
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-zinc-100">
                    The Bradbury Building (304 S Broadway, Los Angeles)
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    3rd-floor West electrical vault fire, 5-story Victorian skylit atrium, 5 trapped occupants (3D human figures), and LAFD responder field photo uploads.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onStartDemo('ferry_live')}
                  data-testid="chat-start-demo-ferry"
                  className="w-full text-left rounded-md border border-sky-500/40 bg-sky-950/20 hover:bg-sky-950/40 p-3 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase text-sky-300">
                      ▶ Start Demo 2 · Real Live Argon Research & Vision
                    </span>
                    <span className="rounded-xs bg-sky-500 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-950">
                      Real Gemini Argon API
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-zinc-100">
                    San Francisco Ferry Building (1 Ferry Building, The Embarcadero)
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Executes real live <span className="text-sky-200 font-medium">gemini-4-argon</span> Google Search, Multimodal Vision on Clock Tower & CAD floor plans, live Maps Geocoding/Weather, and live field photo vision.
                  </p>
                </button>
              </div>
            )}
          </div>
        ) : (
          incident.timeline.map((evt) => (
            <TimelineEventCard
              key={evt.id}
              event={evt}
              buildingName={incident.building?.name}
              buildingAddress={incident.building?.address}
              activeBuildingRevision={incident.buildingRevision}
              sourcesMap={sourcesMap}
              onOpenSource={onOpenSource}
              onFocus3DElement={onFocus3DElement}
              onOpenBuildingReference={onOpenBuildingReference}
            />
          ))
        )}
      </MessageScroller>

      {/* Anchored Composer with Send to team & Ask AI */}
      <InputGroup>
        <div className="relative">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message as ${participantName}… (Enter = Send to team · Ctrl/Cmd+Enter = Ask AI)`}
            data-testid="shared-composer-input"
            className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900/90 px-3 py-2 pr-10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={toggleDictation}
            title={dictating ? 'Stop voice dictation' : 'Dictate into draft (gemini-3.5-transcribe)'}
            data-testid="composer-dictate-btn"
            className={`absolute right-2 top-2 rounded-sm p-1.5 transition ${
              dictating
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : transcribing
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {transcribing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : dictating ? (
              <Square className="h-3.5 w-3.5" />
            ) : (
              <Mic className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="hidden sm:block text-[10px] font-mono text-zinc-400">
            <span className="text-zinc-300">Enter</span>: Send to team (no AI reply) ·{' '}
            <span className="text-amber-300">Ctrl/Cmd+Enter</span>: Ask FireSight AI
          </div>

          <div className="flex w-full sm:w-auto items-center justify-end gap-2">
            <button
              type="button"
              disabled={!draft.trim() || submitting !== null}
              onClick={handleSendTeam}
              data-testid="send-to-team-btn"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700 disabled:opacity-40"
            >
              {submitting === 'team' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send to team
            </button>

            <button
              type="button"
              disabled={!draft.trim() || submitting !== null}
              onClick={handleAskAi}
              data-testid="ask-ai-btn"
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/50 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/25 disabled:opacity-40"
            >
              {submitting === 'ai' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              )}
              Ask AI
            </button>
          </div>
        </div>
      </InputGroup>
    </div>
  );
}

function TimelineEventCard({
  event,
  buildingName,
  buildingAddress,
  activeBuildingRevision,
  sourcesMap,
  onOpenSource,
  onFocus3DElement,
  onOpenBuildingReference,
}: {
  event: TimelineEvent;
  buildingName?: string;
  buildingAddress?: string;
  activeBuildingRevision: number;
  sourcesMap: Map<string, SourceDocument>;
  onOpenSource: (source: SourceDocument, page?: number) => void;
  onFocus3DElement: (floor?: number, element?: Selected3DElement) => void;
  onOpenBuildingReference?: () => void;
}) {
  const isObsolete =
    event.obsoleteBuildingRevision || event.buildingRevision < activeBuildingRevision;
  const [showRawAgentLog, setShowRawAgentLog] = React.useState(false);

  // 1. Natural Visual AI Research Message (Replaces nested box-in-box accordions with rich inline visuals)
  if (event.type === 'research_trace' && event.traceData) {
    const td = event.traceData;
    const visualAssets = getBuildingVisualAssets(
      buildingName || event.text,
      buildingAddress || event.text
    );
    const floorplanDoc =
      sourcesMap.get('src-arch-pdf-1') ||
      sourcesMap.get('src-floorplan-pdf') ||
      Array.from(sourcesMap.values()).find((s) => s.mimeType === 'application/pdf');
    return (
      <Message
        id={event.id}
        className={
          isObsolete
            ? 'opacity-60 border-dashed border-zinc-800'
            : 'border-zinc-800/90 bg-zinc-900/50'
        }
      >
        <MessageHeader
          speaker="FireSight Research Agents"
          badge={
            isObsolete
              ? `SUPERSEDED REV #${td.buildingRevision}`
              : `VISUAL BUILDING SYNTHESIS · REV #${td.buildingRevision}`
          }
          timestamp={event.createdAt}
          icon={<Sparkles className="h-3.5 w-3.5 text-amber-400" />}
          rightSlot={
            onOpenBuildingReference ? (
              <button
                type="button"
                onClick={onOpenBuildingReference}
                data-testid={`open-building-ref-${event.id}`}
                className="inline-flex items-center gap-1 rounded-xs border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-sans text-[10px] font-semibold text-amber-200 hover:bg-amber-500/25"
              >
                <Building2 className="h-3 w-3" />
                Building & Photos
              </button>
            ) : undefined
          }
        />

        {/* Conversational Lead Summary */}
        <MessageBubble className="text-xs text-zinc-200">
          {event.text}
        </MessageBubble>

        {/* Live Parallel Research Subagents Progress Strip */}
        <div
          data-testid="research-branches-strip"
          className="mt-2 rounded-md border border-zinc-800/90 bg-zinc-950/80 px-2.5 py-2 space-y-1.5"
        >
          <div className="flex items-center justify-between border-b border-zinc-800/70 pb-1">
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
              {td.status === 'running' ? (
                <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
              ) : (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              )}
              {td.status === 'running'
                ? 'Live Parallel Argon Subagents Executing…'
                : '5/5 Parallel Research Subagents Verified'}
            </span>
            <span className="font-mono text-[9px] text-zinc-400">
              {td.branches.filter((b) => b.status === 'completed').length}/{td.branches.length} complete
            </span>
          </div>
          <div className="space-y-1">
            {td.branches.map((branch) => {
              const isRunning = branch.status === 'running';
              return (
                <div
                  key={branch.id}
                  className="flex items-start gap-2 text-[11px] leading-snug"
                >
                  {isRunning ? (
                    <Loader2 className="mt-0.5 h-3 w-3 shrink-0 animate-spin text-amber-400" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-zinc-200">{branch.title}: </span>
                    <span className={isRunning ? 'text-amber-200/90' : 'text-zinc-400'}>
                      {branch.summary}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Stream Inside Chat (Geocode Map + Referenced Photos + Floor Plans) */}
        <div className="mt-2.5 space-y-3">
          {/* A. Inline Geocode & Building Footprint Map Card */}
          <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-zinc-800/80">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200">
                <MapPin className="h-3 w-3 text-amber-400" />
                Geocoded Parcel & Tactical Approach Vectors
              </span>
              <span className="font-mono text-[10px] text-zinc-400">
                {visualAssets.geocodeLabel}
              </span>
            </div>
            <img
              src={visualAssets.geocodeMapUrl}
              alt={`Inline geocode map for ${visualAssets.geocodeLabel}`}
              referrerPolicy="no-referrer"
              className="h-36 w-full object-cover"
            />
          </div>

          {/* B. Inline Referenced Building Photos & Exterior Material Cladding */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <Camera className="h-3 w-3 text-amber-400" />
                Referenced Exterior Photographs & Cladding Materials
              </span>
              {onOpenBuildingReference && (
                <button
                  type="button"
                  onClick={onOpenBuildingReference}
                  className="text-[10px] font-medium text-amber-300 hover:underline"
                >
                  Open 3D Exterior & Gallery →
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {visualAssets.photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onOpenBuildingReference?.()}
                  className="group overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 text-left transition hover:border-amber-500/50"
                >
                  <div className="relative h-24 w-full overflow-hidden bg-zinc-900">
                    <img
                      src={photo.dataUrl}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <span className="absolute bottom-1 left-1 rounded-xs bg-zinc-950/90 px-1.5 py-0.5 font-mono text-[9px] text-amber-200">
                      {photo.materialTags[0]}
                    </span>
                  </div>
                  <div className="px-2 py-1.5">
                    <div className="truncate text-[10px] font-semibold text-zinc-200">
                      {photo.title}
                    </div>
                    <div className="truncate font-mono text-[9px] text-zinc-400">
                      {photo.materialTags.slice(1).join(' · ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* C. Inline Extracted Structural Floor Plans (L1–L4) */}
          {floorplanDoc?.pages && floorplanDoc.pages.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Layers className="h-3 w-3 text-sky-400" />
                  Extracted Floor Plan Schematics (L1–L4)
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  Click floor to inspect
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {floorplanDoc.pages.map((pg) => (
                  <button
                    key={pg.pageNumber}
                    type="button"
                    onClick={() => onOpenSource(floorplanDoc, pg.pageNumber)}
                    className="group overflow-hidden rounded-sm border border-zinc-800 bg-zinc-950 text-left transition hover:border-sky-500/50"
                  >
                    <div className="h-16 w-full overflow-hidden bg-zinc-950">
                      <img
                        src={pg.svgDataUrl}
                        alt={pg.label}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="px-1.5 py-1 border-t border-zinc-800/80">
                      <div className="font-mono text-[9px] font-semibold text-sky-300">
                        Level {pg.pageNumber}
                      </div>
                      <div className="truncate text-[9px] text-zinc-400">
                        {pg.label.replace(/^Level \d+ — /, '')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* D. Quiet Single-Line Technical Agent Log Disclosure (Closed by default, no nested box clutter) */}
          <div className="pt-1 border-t border-zinc-800/70">
            <button
              type="button"
              onClick={() => setShowRawAgentLog((v) => !v)}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 hover:text-zinc-200"
            >
              {showRawAgentLog ? (
                <ChevronDown className="h-3 w-3 text-amber-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-zinc-500" />
              )}
              <span>
                {showRawAgentLog ? 'Hide' : 'View'} underlying agent tool execution (
                {td.branches.length} parallel branches · {td.status})
              </span>
            </button>

            {showRawAgentLog && (
              <div className="mt-2 space-y-1.5">
                {td.branches.map((branch) => (
                  <TraceSubagent
                    key={branch.id}
                    branch={branch}
                    sourcesMap={sourcesMap}
                    onSelectSource={onOpenSource}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Message>
    );
  }

  // 2. Source-Linked 3D Model Update Card
  if (event.type === 'model_update' && event.modelUpdate) {
    const mu = event.modelUpdate;
    return (
      <Message
        id={event.id}
        className={
          isObsolete
            ? 'opacity-60 border-dashed border-zinc-800'
            : 'border-amber-500/30 bg-amber-950/10'
        }
      >
        <MessageHeader
          speaker={event.speaker}
          badge={
            isObsolete
              ? `SUPERSEDED 3D REV #${mu.buildingRevision}`
              : `3D SCENE UPDATE · REV #${mu.buildingRevision}`
          }
          timestamp={event.createdAt}
          icon={<Box className="h-3.5 w-3.5 text-amber-400" />}
          rightSlot={
            <button
              type="button"
              onClick={() =>
                onFocus3DElement(
                  mu.focusFloor,
                  mu.focusElementId
                    ? { kind: 'room', id: mu.focusElementId, floor: mu.focusFloor }
                    : undefined
                )
              }
              data-testid={`open-in-3d-${event.id}`}
              className="inline-flex items-center gap-1 rounded-sm border border-amber-500/50 bg-amber-500/15 px-2 py-0.5 font-sans text-[11px] font-semibold text-amber-200 hover:bg-amber-500/25"
            >
              <Box className="h-3 w-3" />
              Open in 3D
            </button>
          }
        />

        <MessageBubble className="text-xs text-zinc-200">{mu.summary}</MessageBubble>

        {/* Source Pills */}
        {mu.sourceRefs.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {mu.sourceRefs.map((ref, idx) => {
              const src = sourcesMap.get(ref.sourceId);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => src && onOpenSource(src, ref.page || 1)}
                  className="inline-flex items-center gap-1 rounded-xs border border-zinc-700/80 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300 hover:border-amber-500/60 hover:text-zinc-100"
                >
                  <FileText className="h-2.5 w-2.5 text-amber-400" />
                  <span>{ref.title}</span>
                  {ref.page && <span className="font-mono text-amber-300">p.{ref.page}</span>}
                </button>
              );
            })}
            {mu.quarantinedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-xs border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                <AlertCircle className="h-2.5 w-2.5" />
                {mu.quarantinedCount} unverified geometry item quarantined
              </span>
            )}
          </div>
        )}
      </Message>
    );
  }

  // 3. Field Report Card (Responder Photo + Human Description vs AI Visual Summary)
  if (event.type === 'field_report' && event.fieldReport) {
    const fr = event.fieldReport;
    return (
      <Message
        id={event.id}
        className="border-emerald-500/30 bg-emerald-950/10"
      >
        <MessageHeader
          speaker={fr.reporterName}
          badge={`FIELD REPORT · ${fr.placeLabel || 'On Scene'}`}
          timestamp={event.createdAt}
          captureTime={fr.captureTime}
          icon={<Camera className="h-3.5 w-3.5 text-emerald-400" />}
          rightSlot={
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              {fr.deliveryStatus}
            </span>
          }
        />

        <div className="mt-1 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {fr.photoDataUrl && (
            <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
              <img
                src={fr.photoDataUrl}
                alt={`Field report by ${fr.reporterName}`}
                className="h-28 w-full object-cover"
              />
            </div>
          )}
          <div className={fr.photoDataUrl ? 'sm:col-span-2 space-y-1.5' : 'sm:col-span-3 space-y-1.5'}>
            {/* Human Reporter Description */}
            <div className="rounded-sm border border-zinc-800 bg-zinc-900/80 p-2">
              <div className="font-mono text-[10px] uppercase text-emerald-400">
                Responder Observation ({fr.reporterName})
              </div>
              <p className="mt-0.5 text-xs text-zinc-100">{fr.humanDescription}</p>
            </div>

            {/* Distinct AI Visual Summary */}
            {fr.aiVisualSummary && (
              <div className="rounded-sm border border-zinc-800/80 bg-zinc-950/80 p-2">
                <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-amber-300 mb-0.5">
                  {fr.aiVisualSummary.startsWith('⏳') ? (
                    <Loader2 className="h-2.5 w-2.5 shrink-0 animate-spin text-amber-400" />
                  ) : (
                    <Sparkles className="h-2.5 w-2.5 shrink-0" />
                  )}
                  <span>
                    {fr.aiVisualSummary.startsWith('⏳')
                      ? 'Argon Multimodal Vision Analyzing Photo…'
                      : 'AI Visual Summary (gemini-4-argon Vision)'}
                  </span>
                </div>
                <MarkdownText content={fr.aiVisualSummary} className="text-[11px] text-zinc-300" />
              </div>
            )}

            {(fr.floor || fr.roomId) && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    onFocus3DElement(
                      fr.floor,
                      fr.roomId
                        ? { kind: 'room', id: fr.roomId, floor: fr.floor }
                        : undefined
                    )
                  }
                  className="inline-flex items-center gap-1 max-w-full rounded-xs border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-200 hover:bg-zinc-700"
                >
                  <Box className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="truncate">Locate {fr.placeLabel} in 3D</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </Message>
    );
  }

  // 4. Correction / Consistency Notice
  if (event.type === 'correction_notice') {
    return (
      <Message id={event.id} className="border-amber-500/40 bg-amber-950/20">
        <MessageHeader
          speaker={event.speaker}
          badge={`CONSISTENCY UPDATE · REV #${event.buildingRevision}`}
          timestamp={event.createdAt}
          icon={<AlertCircle className="h-3.5 w-3.5 text-amber-400" />}
        />
        <MessageBubble className="text-xs font-medium text-amber-100">
          {event.text}
        </MessageBubble>
      </Message>
    );
  }

  // 5. Caller, AI Call-Taker, FireSight AI Answer, or Team Message
  const roleConfig = {
    caller: {
      badge: 'CALLER',
      icon: <PhoneCall className="h-3.5 w-3.5 text-red-400" />,
      cardClass: 'border-red-500/25 bg-red-950/10',
    },
    call_taker: {
      badge: 'AI CALL-TAKER',
      icon: <Radio className="h-3.5 w-3.5 text-amber-400" />,
      cardClass: 'border-zinc-800 bg-zinc-900/60',
    },
    firesight_ai: {
      badge: 'FIRESIGHT AI',
      icon: <Bot className="h-3.5 w-3.5 text-amber-400" />,
      cardClass: 'border-amber-500/25 bg-zinc-900/80',
    },
    dispatcher: {
      badge: 'DISPATCH',
      icon: <User className="h-3.5 w-3.5 text-sky-400" />,
      cardClass: 'border-zinc-800 bg-zinc-900/40',
    },
    responder: {
      badge: 'RESPONDER',
      icon: <User className="h-3.5 w-3.5 text-emerald-400" />,
      cardClass: 'border-zinc-800 bg-zinc-900/40',
    },
    research_orchestrator: {
      badge: 'RESEARCH',
      icon: <Sparkles className="h-3.5 w-3.5 text-amber-400" />,
      cardClass: 'border-zinc-800 bg-zinc-900/40',
    },
  }[event.speakerRole] || {
    badge: 'EVENT',
    icon: <User className="h-3.5 w-3.5 text-zinc-400" />,
    cardClass: 'border-zinc-800 bg-zinc-900/40',
  };

  return (
    <Message
      id={event.id}
      className={`${roleConfig.cardClass} ${isObsolete ? 'opacity-60 border-dashed' : ''}`}
    >
      <MessageHeader
        speaker={event.speaker}
        badge={isObsolete ? `${roleConfig.badge} (REV #${event.buildingRevision})` : roleConfig.badge}
        timestamp={event.createdAt}
        icon={roleConfig.icon}
      />

      <MessageBubble isPartial={event.isPartial} className="text-xs">
        {event.text}
      </MessageBubble>

      {/* Source Citations on AI Answers */}
      {event.sourceCitations && event.sourceCitations.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {event.sourceCitations.map((cit, idx) => {
            const src = sourcesMap.get(cit.sourceId);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => src && onOpenSource(src, cit.page || 1)}
                className="inline-flex items-center gap-1 max-w-full rounded-xs border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300 hover:border-amber-500/60"
              >
                <FileText className="h-2.5 w-2.5 text-amber-400 shrink-0" />
                <span className="truncate">{cit.title}</span>
                {cit.page && <span className="font-mono text-amber-300 shrink-0">p.{cit.page}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Dispatch Notes */}
      {event.considerationsForDispatch && event.considerationsForDispatch.length > 0 && (
        <div className="mt-2 rounded-sm border border-zinc-800 bg-zinc-950/80 p-2 text-[11px]">
          <div className="font-mono text-[10px] uppercase text-amber-300">
            Dispatch Considerations
          </div>
          <ul className="mt-1 list-disc pl-4 space-y-0.5 text-zinc-300">
            {event.considerationsForDispatch.map((item, i) => (
              <li key={i}>
                <MarkdownText content={item} className="inline text-[11px]" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Message>
  );
}
