import * as React from 'react';
import {
  Radio,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  RefreshCw,
  Share2,
  Send,
  CheckCircle2,
  Loader2,
  Sparkles,
  User,
  FilePlus2,
  PhoneOff,
} from 'lucide-react';
import { DialogRoot, DialogContent, MarkdownText } from './ui/base-primitives';
import type { IncidentState } from '../lib/incident-engine';
import type { LiveTranscriptItem } from '../lib/use-live-session';
import { floorLabelKo } from '../lib/ko-terms';

export function ResponderToolbar({
  incident,
  responderName,
  onChangeResponderName,
  liveSession,
  onPublishFieldReport,
  onShareLiveSummary,
}: {
  incident: IncidentState;
  responderName: string;
  onChangeResponderName: (name: string) => void;
  liveSession: {
    connected: boolean;
    connecting: boolean;
    muted: boolean;
    cameraActive: boolean;
    facingMode: 'environment' | 'user';
    error: string | null;
    transcripts: LiveTranscriptItem[];
    audioLevel: number;
    startSession: () => Promise<void>;
    stopSession: () => void;
    toggleMute: () => void;
    startCamera: (videoEl: HTMLVideoElement | null, mode?: 'environment' | 'user') => Promise<void>;
    stopCamera: () => void;
    flipCamera: () => Promise<void>;
    captureSnapshotDataUrl: () => string;
    sendTextPromptToLive: (text: string) => void;
  };
  onPublishFieldReport: (payload: {
    reportId: string;
    reporterName: string;
    captureTime: string;
    floor?: number;
    roomId?: string;
    placeLabel?: string;
    humanDescription: string;
    photoDataUrl?: string;
  }) => Promise<void>;
  onShareLiveSummary: (summaryText: string) => Promise<void>;
}) {
  const [liveDrawerOpen, setLiveDrawerOpen] = React.useState(false);
  const [reportModalOpen, setReportModalOpen] = React.useState(false);
  const [livePromptInput, setLivePromptInput] = React.useState('');

  // Field Report Form State
  const [reportDescription, setReportDescription] = React.useState('');
  const [reportFloor, setReportFloor] = React.useState<string>('3');
  const [reportRoomId, setReportRoomId] = React.useState<string>('f3-corridor');
  const [reportPhotoUrl, setReportPhotoUrl] = React.useState<string>('');
  const [reportCaptureTime, setReportCaptureTime] = React.useState<string>('');
  const [reportId, setReportId] = React.useState<string>('');
  const [publishingReport, setPublishingReport] = React.useState(false);
  const [sharingLiveId, setSharingLiveId] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const openFieldReportSheet = React.useCallback(() => {
    const snap = liveSession.captureSnapshotDataUrl();
    setReportPhotoUrl(snap);
    setReportCaptureTime(new Date().toISOString());
    setReportId(`fr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    if (!reportDescription) {
      setReportDescription(
        '302호 앞 복도에 짙은 검은 연기가 바닥에서 약 1.2m 높이까지 내려옴. 방문이 뜨거움. 동쪽 B계단은 연기 없음.'
      );
    }
    setReportModalOpen(true);
  }, [liveSession, reportDescription]);

  const handleToggleCameraInLive = async () => {
    if (liveSession.cameraActive) {
      liveSession.stopCamera();
    } else {
      if (!liveSession.connected && !liveSession.connecting) {
        await liveSession.startSession();
      }
      await liveSession.startCamera(videoRef.current);
    }
  };

  const handleSubmitFieldReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim() && !reportPhotoUrl) return;
    setPublishingReport(true);
    try {
      const floorNum = reportFloor ? Number(reportFloor) : undefined;
      const matchedFloor = incident.scene.floors.find((f) => f.level === floorNum);
      const matchedRoom = matchedFloor?.rooms.find((r) => r.id === reportRoomId);
      const placeLabel = matchedRoom
        ? `${floorLabelKo(floorNum)} · ${matchedRoom.name}`
        : floorNum
        ? `${floorLabelKo(floorNum)} (호실 미상)`
        : '층 미상 / 건물 외부';

      await onPublishFieldReport({
        reportId: reportId || `fr-${Date.now()}`,
        reporterName: responderName,
        captureTime: reportCaptureTime || new Date().toISOString(),
        floor: floorNum,
        roomId: matchedRoom?.id,
        placeLabel,
        humanDescription: reportDescription.trim(),
        photoDataUrl: reportPhotoUrl || undefined,
      });
      setReportModalOpen(false);
    } finally {
      setPublishingReport(false);
    }
  };

  const availableRooms = React.useMemo(() => {
    const fl = incident.scene.floors.find((f) => f.level === Number(reportFloor));
    return fl?.rooms || [];
  }, [incident.scene.floors, reportFloor]);

  return (
    <>
      {/* Compact Responder Field Action Bar */}
      <div
        data-testid="responder-toolbar"
        className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs"
      >
        {/* Participant Display Name (no account setup required) */}
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <label htmlFor="responder-name-input" className="text-[11px] text-zinc-400">
            소속 / 이름:
          </label>
          <input
            id="responder-name-input"
            type="text"
            value={responderName}
            onChange={(e) => onChangeResponderName(e.target.value)}
            data-testid="responder-name-input"
            className="w-40 rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs font-medium text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Field Assistant Actions: Live Voice/Camera Support + Share Field Report */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLiveDrawerOpen(true)}
            data-testid="responder-live-support-btn"
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
              liveSession.connected
                ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-200'
                : 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
            }`}
          >
            <Radio
              className={`h-3.5 w-3.5 ${
                liveSession.connected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
              }`}
            />
            {liveSession.connected ? '실시간 지원 중' : '실시간 음성·카메라 지원'}
          </button>

          <button
            type="button"
            onClick={openFieldReportSheet}
            data-testid="open-field-report-btn"
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/50 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            상황보고 공유
          </button>
        </div>
      </div>

      {/* 1. Responder Live Voice + Camera Assistance Modal (Personal Session — Explicit Share Only) */}
      <DialogRoot open={liveDrawerOpen} onOpenChange={setLiveDrawerOpen}>
        <DialogContent
          title={`현장대원 실시간 지원 · ${responderName}`}
          description="사건 상황을 알고 있는 AI와 음성·카메라로 대화합니다. 중요한 내용은 '사건방에 공유'를 눌러 기록에 올리세요."
          className="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Voice & Camera Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-900/80 p-3">
              <div className="flex items-center gap-2">
                {!liveSession.connected ? (
                  <button
                    type="button"
                    onClick={() => liveSession.startSession()}
                    disabled={liveSession.connecting}
                    data-testid="start-responder-live-btn"
                    className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {liveSession.connecting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Radio className="h-3.5 w-3.5" />
                    )}
                    실시간 음성 시작
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={liveSession.toggleMute}
                      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
                    >
                      {liveSession.muted ? (
                        <>
                          <MicOff className="h-3.5 w-3.5 text-amber-400" />
                          마이크 켜기
                        </>
                      ) : (
                        <>
                          <Mic className="h-3.5 w-3.5 text-emerald-400" />
                          마이크 끄기
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={liveSession.stopSession}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-500/50 bg-red-600/90 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                    >
                      <PhoneOff className="h-3.5 w-3.5" />
                      실시간 종료
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleCameraInLive}
                  data-testid="toggle-responder-camera-btn"
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                    liveSession.cameraActive
                      ? 'border-amber-500/60 bg-amber-500/20 text-amber-200'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  {liveSession.cameraActive ? (
                    <>
                      <CameraOff className="h-3.5 w-3.5 text-amber-400" />
                      카메라 전송 중지
                    </>
                  ) : (
                    <>
                      <Camera className="h-3.5 w-3.5 text-emerald-400" />
                      카메라 화면 AI에 보내기
                    </>
                  )}
                </button>

                {liveSession.cameraActive && (
                  <button
                    type="button"
                    onClick={liveSession.flipCamera}
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    카메라 전환 ({liveSession.facingMode === 'environment' ? '후면' : '전면'})
                  </button>
                )}
              </div>
            </div>

            {/* Camera Preview Feed */}
            <div
              className={`relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 ${
                liveSession.cameraActive ? 'block' : 'hidden'
              }`}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                className="h-48 w-full object-cover bg-zinc-900"
              />
              <div className="absolute bottom-2 left-2 rounded-xs bg-black/75 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                카메라 전송 중 (초당 1장)
              </div>
            </div>

            {/* Personal Live Transcript List with Explicit Share to Room Action */}
            <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border border-zinc-800 bg-zinc-950 p-3">
              {liveSession.transcripts.length === 0 ? (
                <p className="text-center text-xs text-zinc-500 py-4">
                  실시간 음성을 시작하거나 아래에 질문을 입력하세요. AI는 정보 수정 #{incident.buildingRevision} 기준의 사건 정보(층, 계단, 위험요소, 구조대상자 수)를 모두 알고 있습니다.
                </p>
              ) : (
                liveSession.transcripts.map((t) => (
                  <div
                    key={t.utteranceId}
                    className="flex items-start justify-between gap-2 rounded-sm border border-zinc-800/80 bg-zinc-900/70 p-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-zinc-200">{t.speaker}: </span>
                      <MarkdownText content={t.text} className="inline text-zinc-300" />
                    </div>
                    <button
                      type="button"
                      disabled={sharingLiveId === t.utteranceId}
                      onClick={async () => {
                        setSharingLiveId(t.utteranceId);
                        try {
                          await onShareLiveSummary(`${t.speaker}: ${t.text}`);
                        } finally {
                          setSharingLiveId(null);
                        }
                      }}
                      title="이 내용을 공유 사건 기록에 올리기"
                      className="shrink-0 inline-flex items-center gap-1 rounded-xs border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-amber-300 hover:bg-zinc-700"
                    >
                      <Share2 className="h-2.5 w-2.5" />
                      사건방에 공유
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Send text prompt into Live session */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!livePromptInput.trim()) return;
                liveSession.sendTextPromptToLive(livePromptInput);
                setLivePromptInput('');
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={livePromptInput}
                onChange={(e) => setLivePromptInput(e.target.value)}
                placeholder="AI에게 질문하세요 (예: '305호에서 가장 가까운 계단은?')…"
                className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100"
              />
              <button
                type="submit"
                disabled={!liveSession.connected || !livePromptInput.trim()}
                className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
              >
                보내기
              </button>
            </form>
          </div>
        </DialogContent>
      </DialogRoot>

      {/* 2. Share Field Report Dialog */}
      <DialogRoot open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent
          title="사건방에 상황보고 올리기"
          description="현장 사진, 위치, 대원이 직접 본 내용을 올립니다. AI 사진 분석은 따로 붙고, 대원이 쓴 내용은 바뀌지 않습니다."
        >
          <form onSubmit={handleSubmitFieldReport} className="space-y-3 text-xs">
            {reportPhotoUrl && (
              <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
                <img
                  src={reportPhotoUrl}
                  alt="현장 사진 미리보기"
                  className="h-40 w-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                  층
                </label>
                <select
                  value={reportFloor}
                  onChange={(e) => {
                    setReportFloor(e.target.value);
                    const fl = incident.scene.floors.find(
                      (f) => f.level === Number(e.target.value)
                    );
                    setReportRoomId(fl?.rooms[0]?.id || '');
                  }}
                  data-testid="field-report-floor-select"
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100"
                >
                  <option value="">층 미상 / 건물 외부</option>
                  {incident.scene.floors.map((fl) => (
                    <option key={fl.level} value={String(fl.level)}>
                      {floorLabelKo(fl.level)} — {fl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                  구역 / 호실
                </label>
                <select
                  value={reportRoomId}
                  onChange={(e) => setReportRoomId(e.target.value)}
                  data-testid="field-report-room-select"
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100"
                >
                  <option value="">층만 지정 / 호실 미상</option>
                  {availableRooms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name} ({rm.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                대원 관찰 내용 (직접 작성)
              </label>
              <textarea
                rows={3}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                data-testid="field-report-description-input"
                placeholder="본 상황, 연기, 문 상태, 구조대상자 접촉 여부 등을 적어 주세요…"
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="font-mono text-[10px] text-zinc-400">
                보고자: {responderName} · ID: {reportId}
              </span>
              <button
                type="submit"
                disabled={publishingReport || (!reportDescription.trim() && !reportPhotoUrl)}
                data-testid="submit-field-report-btn"
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {publishingReport ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                상황보고 올리기
              </button>
            </div>
          </form>
        </DialogContent>
      </DialogRoot>
    </>
  );
}
