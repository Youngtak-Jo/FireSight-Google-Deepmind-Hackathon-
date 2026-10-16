import * as React from 'react';
import {
  Flame,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Share2,
  SlidersHorizontal,
  Box,
  Map as MapIcon,
  Building2,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { ConversationTimeline } from './components/ConversationTimeline';
import { ThreeSceneWorkspace, type Selected3DElement } from './components/ThreeSceneWorkspace';
import { MapWorkspace } from './components/MapWorkspace';
import { BuildingReferenceView } from './components/BuildingReferenceView';
import { CallerPerspectiveView } from './components/CallerPerspectiveView';
import { ResponderToolbar } from './components/ResponderFieldPanel';
import { ShareIncidentDialog, ReconcileFactsDialog } from './components/DispatcherModals';
import { SourcePreviewDialog } from './components/SourcePreviewDialog';
import {
  useLiveSession,
  releaseGlobalMicrophoneOwnership,
} from './lib/use-live-session';
import type {
  IncidentState,
  Perspective,
  SourceDocument,
} from './lib/incident-engine';

export default function App() {
  // Determine initial perspective from URL query string (Responder phone link opens Responder directly)
  const [perspective, setPerspective] = React.useState<Perspective>(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('perspective');
    if (p === 'responder' || p === 'caller' || p === 'dispatcher') {
      return p;
    }
    if (params.get('token')) {
      return 'responder';
    }
    return 'dispatcher';
  });

  const [incident, setIncident] = React.useState<IncidentState | null>(null);
  const [shareUrl, setShareUrl] = React.useState<string>('');
  const [mapsApiKey, setMapsApiKey] = React.useState<string | null>(null);
  const [responderName, setResponderName] = React.useState<string>('LAFD Engine 3 · Capt. Rivera');

  // Workspace view mode (3D Scene, Building & Reference Photos, or Google Map)
  const [workspaceMode, setWorkspaceMode] = React.useState<'3d' | 'building' | 'map'>('3d');
  // Mobile tab when on narrow screens
  const [mobileTab, setMobileTab] = React.useState<'timeline' | '3d' | 'building' | 'map'>('timeline');

  // Resizable left panel width percentage (scene gets most of the width by default: 36% chat / 64% scene)
  const [leftWidthPct, setLeftWidthPct] = React.useState<number>(36);
  const isResizingRef = React.useRef<boolean>(false);

  // 3D Scene Inspection State
  const [selectedFloor, setSelectedFloor] = React.useState<number | 'all'>('all');
  const [selected3DElement, setSelected3DElement] = React.useState<Selected3DElement | null>(null);

  // Source Document Preview Modal State
  const [previewSource, setPreviewSource] = React.useState<SourceDocument | null>(null);
  const [previewPage, setPreviewPage] = React.useState<number>(1);
  const [sourceDialogOpen, setSourceDialogOpen] = React.useState<boolean>(false);

  // Dispatcher Modals
  const [shareDialogOpen, setShareDialogOpen] = React.useState<boolean>(false);
  const [reconcileDialogOpen, setReconcileDialogOpen] = React.useState<boolean>(false);

  // Fetch initial state & connect to /ws/incident for real-time cross-device sync
  React.useEffect(() => {
    let mounted = true;
    fetch('/api/incident')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data.state) setIncident(data.state);
        if (data.shareUrl) setShareUrl(data.shareUrl);
        if (data.mapsApiKey) setMapsApiKey(data.mapsApiKey);
      })
      .catch((err) => console.error('Initial incident load failed:', err));

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}/ws/incident`;
    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    const connectWs = () => {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'incident_state' && msg.state && mounted) {
            setIncident(msg.state);
          }
        } catch {}
      };
      ws.onclose = () => {
        if (mounted) {
          reconnectTimer = window.setTimeout(connectWs, 2000);
        }
      };
    };
    connectWs();

    return () => {
      mounted = false;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  // Desktop split pane drag resizer
  React.useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isResizingRef.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      setLeftWidthPct(Math.max(26, Math.min(54, pct)));
    };
    const handlePointerUp = () => {
      isResizingRef.current = false;
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // Server call-control helper
  const handleCallControl = React.useCallback(
    async (action: 'start' | 'mute' | 'unmute' | 'end') => {
      const resp = await fetch('/api/incident/call-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.state) setIncident(data.state);
      }
    },
    []
  );

  // Independent Gemini Live Sessions for Caller vs Responder
  const callerLiveSession = useLiveSession({
    role: 'caller',
    participantName: 'Caller (Maya Lin)',
    onServerCallStateChange: handleCallControl,
  });

  const responderLiveSession = useLiveSession({
    role: 'responder',
    participantName: responderName,
  });

  // Switch Demo Perspective without transferring mic ownership silently or creating new incidents
  const handlePerspectiveChange = (nextPerspective: Perspective) => {
    if (nextPerspective === perspective) return;
    // Never transfer microphone ownership silently: suspend active voice capture before switching voice modes
    if (perspective === 'responder' && responderLiveSession.connected) {
      responderLiveSession.stopSession();
    }
    setPerspective(nextPerspective);
    const url = new URL(window.location.href);
    url.searchParams.set('perspective', nextPerspective);
    window.history.replaceState({}, '', url.toString());
  };

  // API Handlers
  const handleSendTeamMessage = async (text: string) => {
    const speaker = perspective === 'responder' ? responderName : 'Dispatcher';
    const resp = await fetch('/api/incident/team-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        speaker,
        role: perspective,
        idempotencyKey: `team-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.state) setIncident(data.state);
    }
  };

  const handleAskAi = async (text: string) => {
    const speaker = perspective === 'responder' ? responderName : 'Dispatcher';
    const resp = await fetch('/api/incident/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        speaker,
        role: perspective,
        idempotencyKey: `ask-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.state) setIncident(data.state);
    }
  };

  const handleSendCallerTypedStatement = async (text: string) => {
    const resp = await fetch('/api/incident/caller-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        speaker: 'Caller (Jiwon Park)',
        idempotencyKey: `caller-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.state) setIncident(data.state);
    }
  };

  const handlePublishFieldReport = async (payload: {
    reportId: string;
    reporterName: string;
    captureTime: string;
    floor?: number;
    roomId?: string;
    placeLabel?: string;
    humanDescription: string;
    photoDataUrl?: string;
  }) => {
    const resp = await fetch('/api/incident/field-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.state) setIncident(data.state);
    }
  };

  const handleShareLiveSummary = async (summaryText: string) => {
    const resp = await fetch('/api/incident/share-live-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: summaryText,
        speaker: `${responderName} (Live Support)`,
        idempotencyKey: `liveshare-${Date.now()}`,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.state) setIncident(data.state);
    }
  };

  const handleSubmitCorrection = async (payload: Record<string, any>) => {
    const resp = await fetch('/api/incident/correction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        author: perspective === 'responder' ? responderName : 'Dispatcher',
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.state) setIncident(data.state);
    }
  };

  const handleTriggerResearch = async () => {
    if (!incident) return;
    await fetch('/api/incident/trigger-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buildingName: incident.building?.name,
        address: incident.building?.address,
        clueTrigger: 'Dispatcher requested verification refresh',
      }),
    });
  };

  const handleStartDemo = React.useCallback(
    async (scenario: 'bradbury_mockup' | 'ferry_live') => {
      setSelectedFloor('all');
      setSelected3DElement(null);
      setWorkspaceMode('3d');
      setMobileTab('3d');
      if (scenario === 'ferry_live') {
        setResponderName('SFFD Truck 1 · Capt. Vance');
      } else {
        setResponderName('LAFD Engine 3 · Capt. Rivera');
      }
      const resp = await fetch('/api/incident/start-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.state) setIncident(data.state);
      }
    },
    []
  );

  const handleResetStandby = React.useCallback(async () => {
    setSelectedFloor('all');
    setSelected3DElement(null);
    const resp = await fetch('/api/incident/reset-standby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.state) setIncident(data.state);
    }
  }, []);

  // Poll incident state while automated 1-second demo sequencer is streaming
  React.useEffect(() => {
    if (!incident?.demoRunning) return;
    const timer = window.setInterval(() => {
      fetch('/api/incident')
        .then((r) => r.json())
        .then((data) => {
          if (data.state) setIncident(data.state);
        })
        .catch(() => {});
    }, 550);
    return () => window.clearInterval(timer);
  }, [incident?.demoRunning]);

  const handleOpenSource = React.useCallback((source: SourceDocument, page = 1) => {
    setPreviewSource(source);
    setPreviewPage(page);
    setSourceDialogOpen(true);
  }, []);

  const handleFocus3DElement = React.useCallback(
    (floor?: number, element?: Selected3DElement) => {
      setWorkspaceMode('3d');
      setMobileTab('3d');
      if (typeof floor === 'number') {
        setSelectedFloor(floor);
      } else {
        setSelectedFloor('all');
      }
      if (element) {
        setSelected3DElement(element);
      }
    },
    []
  );

  if (!incident) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-300">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
          <span>Loading FireSight Incident Workspace…</span>
        </div>
      </div>
    );
  }

  const isCallActive = callerLiveSession.connected || incident.callState.active;
  const isCallMuted = callerLiveSession.connected
    ? callerLiveSession.muted
    : incident.callState.muted;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Compact Application Header */}
      <header
        data-testid="firesight-header"
        className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950 px-3.5 py-2"
      >
        {/* Left: Brand & Incident Identity */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-amber-500/40 bg-amber-500/15">
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-100">FireSight</span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block shrink-0" />

          <div className="min-w-0 flex-1 hidden sm:block">
            <div className="flex items-center gap-2 min-w-0">
              <h1
                data-testid="header-building-name"
                className="truncate text-xs font-semibold text-zinc-100"
              >
                {incident.building?.name || incident.title}
              </h1>
              <span
                data-testid="header-building-revision"
                className="shrink-0 rounded-xs border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-medium text-amber-300"
              >
                REV #{incident.buildingRevision}
              </span>
            </div>
            <p className="truncate text-[11px] text-zinc-400 hidden md:block">
              {incident.building?.address}
            </p>
          </div>
        </div>

        {/* Center: Demo Perspective Selector (Dispatcher | Caller | Responder) */}
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Demo perspective selector"
            className="inline-flex items-center rounded-md border border-zinc-800 bg-zinc-900 p-0.5"
          >
            <span className="px-2 font-mono text-[10px] uppercase text-zinc-400 hidden lg:inline">
              Demo Perspective:
            </span>
            {(['dispatcher', 'caller', 'responder'] as Perspective[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePerspectiveChange(p)}
                data-testid={`perspective-btn-${p}`}
                className={`rounded-sm px-2.5 py-1 text-xs font-medium capitalize transition ${
                  perspective === p
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Call Controls (always accessible in Dispatch during a call) & Dispatcher Actions */}
        <div className="flex items-center gap-2">
          {/* Active Call Controls in Header */}
          {perspective !== 'caller' && (
            <div
              data-testid="header-call-controls"
              className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/90 px-2 py-1"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isCallActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
              <span className="font-mono text-[10px] text-zinc-300 hidden sm:inline">
                {isCallActive ? 'CALL ACTIVE' : 'CALL ENDED'}
              </span>
              {isCallActive ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      callerLiveSession.connected
                        ? callerLiveSession.toggleMute()
                        : handleCallControl(isCallMuted ? 'unmute' : 'mute')
                    }
                    data-testid="header-call-mute-btn"
                    title={isCallMuted ? 'Unmute active caller' : 'Mute active caller'}
                    className={`rounded-xs px-1.5 py-0.5 text-[11px] font-medium transition ${
                      isCallMuted
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                    }`}
                  >
                    {isCallMuted ? (
                      <span className="inline-flex items-center gap-1">
                        <MicOff className="h-3 w-3 text-amber-400" />
                        Unmute
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Mic className="h-3 w-3 text-emerald-400" />
                        Mute
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      callerLiveSession.stopSession();
                      void handleCallControl('end');
                    }}
                    data-testid="header-call-end-btn"
                    title="End active caller intake"
                    className="inline-flex items-center gap-1 rounded-xs bg-red-600/90 px-1.5 py-0.5 text-[11px] font-medium text-white hover:bg-red-500"
                  >
                    <PhoneOff className="h-3 w-3" />
                    End
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCallControl('start')}
                  data-testid="header-call-resume-btn"
                  className="inline-flex items-center gap-1 rounded-xs bg-emerald-600/90 px-1.5 py-0.5 text-[11px] font-medium text-white hover:bg-emerald-500"
                >
                  <Phone className="h-3 w-3" />
                  Resume Call
                </button>
              )}
            </div>
          )}

          {/* Dispatcher Actions: Reconcile Facts & Share Incident */}
          {perspective === 'dispatcher' && (
            <>
              <button
                type="button"
                onClick={() => setReconcileDialogOpen(true)}
                data-testid="open-reconcile-modal-btn"
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Reconcile Facts</span>
              </button>

              <button
                type="button"
                onClick={() => setShareDialogOpen(true)}
                data-testid="share-incident-btn"
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/50 bg-amber-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 shadow-xs hover:bg-amber-400"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share Incident
              </button>
            </>
          )}
        </div>
      </header>

      {/* Responder Sub-Toolbar when in Responder Perspective */}
      {perspective === 'responder' && (
        <ResponderToolbar
          incident={incident}
          responderName={responderName}
          onChangeResponderName={setResponderName}
          liveSession={responderLiveSession}
          onPublishFieldReport={handlePublishFieldReport}
          onShareLiveSummary={handleShareLiveSummary}
        />
      )}

      {/* Main Content Area by Perspective */}
      {perspective === 'caller' ? (
        <main className="flex-1 overflow-hidden bg-zinc-950">
          <CallerPerspectiveView
            incident={incident}
            liveSession={callerLiveSession}
            onSendCallerTypedStatement={handleSendCallerTypedStatement}
            onCallControl={handleCallControl}
          />
        </main>
      ) : (
        <main className="relative flex flex-1 min-h-0 flex-col md:flex-row overflow-hidden">
          {/* Mobile View Switcher Bar (< md) */}
          <div className="shrink-0 flex md:hidden items-center justify-around border-b border-zinc-800 bg-zinc-900/90 p-1">
            <button
              type="button"
              onClick={() => setMobileTab('timeline')}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm py-1 text-xs font-medium ${
                mobileTab === 'timeline'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'text-zinc-400'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Timeline ({incident.timeline.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('3d')}
              className={`flex-1 inline-flex items-center justify-center gap-1 rounded-sm py-1 text-xs font-medium ${
                mobileTab === '3d'
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400'
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              3D Scene
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('building')}
              className={`flex-1 inline-flex items-center justify-center gap-1 rounded-sm py-1 text-xs font-medium ${
                mobileTab === 'building'
                  ? 'bg-emerald-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Building
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('map')}
              className={`flex-1 inline-flex items-center justify-center gap-1 rounded-sm py-1 text-xs font-medium ${
                mobileTab === 'map'
                  ? 'bg-sky-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              Map
            </button>
          </div>

          {/* Left Pane: Chronological Conversation & Research Trace Timeline */}
          <section
            aria-label="Incident Conversation Timeline"
            style={{ width: `${leftWidthPct}%` }}
            className={`flex-1 md:flex-none md:h-full min-h-0 shrink-0 border-r border-zinc-800 max-md:!w-full ${
              mobileTab === 'timeline' ? 'flex flex-col' : 'hidden md:flex md:flex-col'
            }`}
          >
            <ConversationTimeline
              incident={incident}
              perspective={perspective}
              participantName={perspective === 'responder' ? responderName : 'Dispatcher'}
              onSendTeamMessage={handleSendTeamMessage}
              onAskAi={handleAskAi}
              onOpenSource={handleOpenSource}
              onFocus3DElement={handleFocus3DElement}
              onTriggerResearch={handleTriggerResearch}
              onOpenBuildingReference={() => {
                setWorkspaceMode('building');
                setMobileTab('building');
              }}
              onStartDemo={handleStartDemo}
              onResetStandby={handleResetStandby}
            />
          </section>

          {/* Desktop Resizable Splitter Handle */}
          <div
            role="separator"
            aria-orientation="vertical"
            onPointerDown={() => {
              isResizingRef.current = true;
            }}
            title="Drag to resize timeline and 3D workspace"
            className="hidden md:flex w-1.5 cursor-col-resize items-center justify-center bg-zinc-900 hover:bg-amber-500/50 transition-colors"
          >
            <div className="h-8 w-0.5 rounded-full bg-zinc-700" />
          </div>

          {/* Right Pane: Large 3D Scene & Google Maps Platform Workspace */}
          <section
            aria-label="Spatial 3D and Map Workspace"
            className={`flex-1 h-full flex-col overflow-hidden bg-zinc-950 ${
              mobileTab === 'timeline' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Workspace Mode Switcher (3D Building Scene | Original Exterior & Photos | Google Map & Routes) */}
            <div className="hidden md:flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('3d')}
                  data-testid="workspace-mode-3d"
                  className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition ${
                    workspaceMode === '3d'
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <Box className="h-3.5 w-3.5 text-amber-500" />
                  3D Building Scene
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('building')}
                  data-testid="workspace-mode-building"
                  className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition ${
                    workspaceMode === 'building'
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  Photos & Floor Plans
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('map')}
                  data-testid="workspace-mode-map"
                  className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition ${
                    workspaceMode === 'map'
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <MapIcon className="h-3.5 w-3.5 text-sky-400" />
                  Google Map & Approach Routes
                </button>
              </div>
            </div>

            {/* Visual Content Container */}
            <div className="flex flex-1 overflow-hidden">
              {((workspaceMode === '3d' && mobileTab === 'timeline') || mobileTab === '3d') && (
                <div className="w-full h-full overflow-hidden">
                  <ThreeSceneWorkspace
                    incident={incident}
                    selectedFloor={selectedFloor}
                    onSelectFloor={setSelectedFloor}
                    selectedElement={selected3DElement}
                    onSelectElement={setSelected3DElement}
                    onOpenSource={handleOpenSource}
                    isDispatcher={perspective === 'dispatcher'}
                    onStartDemoScenario={handleStartDemo}
                    onSelectStagingCandidate={(stagingId, status) =>
                      void handleSubmitCorrection({
                        correctionType: 'staging_selection',
                        stagingId,
                        stagingStatus: status,
                      })
                    }
                    onPlaceCustomStaging={(type, localPosition) =>
                      void handleSubmitCorrection({
                        correctionType: 'staging_selection',
                        customStaging: {
                          type,
                          label:
                            type === 'truck_staging'
                              ? 'Dispatcher Placed Truck Staging'
                              : 'Dispatcher Placed Medical Post',
                          localPosition,
                          coordinates: {
                            lat:
                              (incident.building?.coordinates.lat || 37.7915) +
                              (Math.random() - 0.5) * 0.0008,
                            lng:
                              (incident.building?.coordinates.lng || -122.3985) +
                              (Math.random() - 0.5) * 0.0008,
                          },
                        },
                      })
                    }
                  />
                </div>
              )}

              {((workspaceMode === 'building' && mobileTab === 'timeline') ||
                mobileTab === 'building') && (
                <div className="w-full h-full overflow-hidden">
                  <BuildingReferenceView
                    incident={incident}
                    onOpenSource={handleOpenSource}
                    onJumpTo3DFloor={(floor) => {
                      setSelectedFloor(floor);
                      setWorkspaceMode('3d');
                      setMobileTab('3d');
                    }}
                  />
                </div>
              )}

              {((workspaceMode === 'map' && mobileTab === 'timeline') || mobileTab === 'map') && (
                <div className="w-full h-full overflow-hidden">
                  <MapWorkspace
                    incident={incident}
                    mapsApiKey={mapsApiKey}
                    isDispatcher={perspective === 'dispatcher'}
                    onSwitchTo3D={() => {
                      setWorkspaceMode('3d');
                      setMobileTab('3d');
                    }}
                    onSelectStagingCandidate={(stagingId, status) =>
                      void handleSubmitCorrection({
                        correctionType: 'staging_selection',
                        stagingId,
                        stagingStatus: status,
                      })
                    }
                    onPlaceCustomStaging={(type, localPosition) =>
                      void handleSubmitCorrection({
                        correctionType: 'staging_selection',
                        customStaging: {
                          type,
                          label:
                            type === 'truck_staging'
                              ? 'Dispatcher Map Staging Pin'
                              : 'Dispatcher Map Medical Post',
                          localPosition,
                          coordinates: {
                            lat: (incident.building?.coordinates.lat || 37.7915) - 0.0004,
                            lng: (incident.building?.coordinates.lng || -122.3985) + 0.0005,
                          },
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {/* Source Document / Permit Sheet Preview Dialog */}
      <SourcePreviewDialog
        source={previewSource}
        initialPage={previewPage}
        open={sourceDialogOpen}
        onOpenChange={setSourceDialogOpen}
        onFocusFloorIn3D={(floor) => handleFocus3DElement(floor)}
      />

      {/* Dispatcher Share Incident Link Modal */}
      <ShareIncidentDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareUrl={shareUrl}
        incident={incident}
        onSwitchToResponder={() => handlePerspectiveChange('responder')}
      />

      {/* Dispatcher Reconcile / Correct Facts Modal */}
      <ReconcileFactsDialog
        open={reconcileDialogOpen}
        onOpenChange={setReconcileDialogOpen}
        incident={incident}
        onSubmitCorrection={handleSubmitCorrection}
      />
    </div>
  );
}
