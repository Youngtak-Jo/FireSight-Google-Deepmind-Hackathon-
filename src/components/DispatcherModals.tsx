import * as React from 'react';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  SlidersHorizontal,
  Building2,
  Users,
  Flame,
  Loader2,
  Smartphone,
} from 'lucide-react';
import { DialogRoot, DialogContent } from './ui/base-primitives';
import type { IncidentState, Perspective } from '../lib/incident-engine';

export function ShareIncidentDialog({
  open,
  onOpenChange,
  shareUrl,
  incident,
  onSwitchToResponder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  incident: IncidentState;
  onSwitchToResponder: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="현장대원에게 사건 화면 공유"
        description="대원이 휴대폰으로 이 링크를 열면 현장대원 화면으로 바로 들어와 3D 건물, 실시간 음성·카메라 지원, 현장보고를 함께 쓸 수 있습니다."
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>사건 ID: {incident.id}</span>
              <span>링크 만료: {new Date(incident.shareExpiresAt).toLocaleTimeString('ko-KR')}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                data-testid="share-incident-url-input"
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                data-testid="copy-share-url-btn"
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    링크 복사
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
            {/* Deterministic SVG QR representation for mobile demo */}
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-white p-2">
              <QrCode className="h-20 w-20 text-zinc-950" />
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                휴대폰으로 현장대원 연결
              </div>
              <p className="text-zinc-400 leading-relaxed">
                휴대폰 브라우저나 다른 탭에서 이 링크를 열면 가입 없이 바로 실시간 사건방(버전 #{incident.buildingRevision})에 들어옵니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onSwitchToResponder();
                }}
                data-testid="preview-responder-link-btn"
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/50 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25"
              >
                지금 현장대원 화면 열기
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}

export function ReconcileFactsDialog({
  open,
  onOpenChange,
  incident,
  onSubmitCorrection,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: IncidentState;
  onSubmitCorrection: (payload: Record<string, any>) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = React.useState<'building' | 'people' | 'fire'>('people');
  const [submitting, setSubmitting] = React.useState(false);

  // Building Identity state
  const [newBuildingName, setNewBuildingName] = React.useState('블루빌라');
  const [newAddress, setNewAddress] = React.useState('경기도 화성시 동탄대로 125');

  // People Accountability state
  const [totalPeople, setTotalPeople] = React.useState(5);
  const [floorSeenCount, setFloorSeenCount] = React.useState(2);
  const [floorSeenLevel, setFloorSeenLevel] = React.useState(3);
  const [roomSeenId, setRoomSeenId] = React.useState('f3-east-lab');
  const [unknownLocationCount, setUnknownLocationCount] = React.useState(3);

  // Fire / Smoke state
  const [fireFloor, setFireFloor] = React.useState(3);
  const [fireRoomId, setFireRoomId] = React.useState('f3-corridor');
  const [fireAreaLabel, setFireAreaLabel] = React.useState('3층 서쪽 301호');
  const [hasFlames, setHasFlames] = React.useState(false);
  const [smokeColor, setSmokeColor] = React.useState<'white' | 'gray' | 'black'>('gray');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (activeTab === 'building') {
        await onSubmitCorrection({
          correctionType: 'building_identity',
          newBuildingName,
          newAddress,
        });
      } else if (activeTab === 'people') {
        await onSubmitCorrection({
          correctionType: 'people_accountability',
          totalPeople: Number(totalPeople),
          floorSeenCount: Number(floorSeenCount),
          floorSeenLevel: Number(floorSeenLevel),
          roomSeenId: roomSeenId || undefined,
          unknownLocationCount: Number(unknownLocationCount),
        });
      } else if (activeTab === 'fire') {
        await onSubmitCorrection({
          correctionType: 'fire_smoke_update',
          fireFloor: Number(fireFloor),
          fireRoomId,
          fireAreaLabel,
          hasFlames,
          smokeColor,
        });
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="사건 정보 정정"
        description="건물 정보, 요구조자 현황, 화염·연기 관찰 내용을 고치면 사건 화면 전체에 반영됩니다."
      >
        <div className="space-y-4 text-xs">
          {/* Sub-navigation */}
          <div className="flex gap-1.5 border-b border-zinc-800 pb-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('people')}
              data-testid="tab-correct-people"
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'people'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              요구조자 현황
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fire')}
              data-testid="tab-correct-fire"
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'fire'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              화염·연기 구역
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('building')}
              data-testid="tab-correct-building"
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'building'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              건물 정보
            </button>
          </div>

          <form onSubmit={handleApply} className="space-y-3">
            {activeTab === 'people' && (
              <div className="space-y-3">
                <p className="text-zinc-400">
                  신고된 전체 인원과, 층·호실까지 확인된 인원, 위치를 모르는 인원을 나눠서 기록합니다.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                      신고된 전체 인원
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={totalPeople}
                      onChange={(e) => setTotalPeople(Number(e.target.value))}
                      data-testid="correct-total-people-input"
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                      위치 모르는 인원
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={unknownLocationCount}
                      onChange={(e) => setUnknownLocationCount(Number(e.target.value))}
                      data-testid="correct-unknown-people-input"
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                      해당 층 확인 인원
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={floorSeenCount}
                      onChange={(e) => setFloorSeenCount(Number(e.target.value))}
                      data-testid="correct-floor-seen-count-input"
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                      확인된 층
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={floorSeenLevel}
                      onChange={(e) => setFloorSeenLevel(Number(e.target.value))}
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                    호실 ID (층만 알고 호실을 모르면 비워 두세요)
                  </label>
                  <input
                    type="text"
                    value={roomSeenId}
                    onChange={(e) => setRoomSeenId(e.target.value)}
                    placeholder="예: f3-east-lab (층만 알면 비워 두기)"
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                  />
                </div>
              </div>
            )}

            {activeTab === 'fire' && (
              <div className="space-y-3">
                <p className="text-zinc-400">
                  화염이 보인다는 보고와 연기만 보인다는 보고를 구분합니다. 연기만 있는 구역은 3D에 불꽃을 그리지 않습니다.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                      층
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={4}
                      value={fireFloor}
                      onChange={(e) => setFireFloor(Number(e.target.value))}
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                      연기 색
                    </label>
                    <select
                      value={smokeColor}
                      onChange={(e) => setSmokeColor(e.target.value as any)}
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                    >
                      <option value="white">흰 연기</option>
                      <option value="gray">회색 연기</option>
                      <option value="black">검은 연기</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                    구역·호실 이름
                  </label>
                  <input
                    type="text"
                    value={fireAreaLabel}
                    onChange={(e) => setFireAreaLabel(e.target.value)}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                  />
                </div>
                <label className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFlames}
                    onChange={(e) => setHasFlames(e.target.checked)}
                    data-testid="correct-has-flames-checkbox"
                    className="rounded border-zinc-700"
                  />
                  <span className="font-medium text-zinc-200">
                    화염 직접 목격 (연기만 보고된 경우 체크 해제)
                  </span>
                </label>
              </div>
            )}

            {activeTab === 'building' && (
              <div className="space-y-3">
                <p className="text-amber-300">
                  건물을 정정하면 건물 정보 버전이 올라가고(#{incident.buildingRevision} → #{incident.buildingRevision + 1}), 이전 건물 구조와 층 위치는 무효가 되며, AI 조사를 새로 시작합니다.
                </p>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                    정정할 건물 이름
                  </label>
                  <input
                    type="text"
                    value={newBuildingName}
                    onChange={(e) => setNewBuildingName(e.target.value)}
                    data-testid="correct-building-name-input"
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                    정정할 주소
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    data-testid="correct-building-address-input"
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                type="submit"
                disabled={submitting}
                data-testid="apply-correction-btn"
                className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                정정 내용 적용
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
