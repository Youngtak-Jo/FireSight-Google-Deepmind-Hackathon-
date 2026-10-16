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
        title="Share Incident Workspace with Field Responders"
        description="Responders opening this link on their phone enter the Responder perspective directly with shared 3D model, Live voice/camera support, and field reporting."
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>INCIDENT ID: {incident.id}</span>
              <span>TOKEN EXPIRES: {new Date(incident.shareExpiresAt).toLocaleTimeString()}</span>
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
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Link
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
                Mobile Responder Handoff
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Opening this HTTPS link on any mobile browser or second tab joins the live incident room (`Revision #{incident.buildingRevision}`) with zero account setup.
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
                Open Responder Perspective Now
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
  const [newBuildingName, setNewBuildingName] = React.useState('500 Howard Street Annex');
  const [newAddress, setNewAddress] = React.useState('500 Howard Street, San Francisco, CA 94105');

  // People Accountability state
  const [totalPeople, setTotalPeople] = React.useState(5);
  const [floorSeenCount, setFloorSeenCount] = React.useState(2);
  const [floorSeenLevel, setFloorSeenLevel] = React.useState(3);
  const [roomSeenId, setRoomSeenId] = React.useState('f3-east-lab');
  const [unknownLocationCount, setUnknownLocationCount] = React.useState(3);

  // Fire / Smoke state
  const [fireFloor, setFireFloor] = React.useState(3);
  const [fireRoomId, setFireRoomId] = React.useState('f3-corridor');
  const [fireAreaLabel, setFireAreaLabel] = React.useState('Floor 3 West Room 301');
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
        title="Reconcile & Correct Incident Facts"
        description="Update building identity, people accountability, or fire/smoke observations across the incident workspace."
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
              People Accountability
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
              Fire vs. Smoke Zone
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
              Building Identity
            </button>
          </div>

          <form onSubmit={handleApply} className="space-y-3">
            {activeTab === 'people' && (
              <div className="space-y-3">
                <p className="text-zinc-400">
                  Separates total reported people from floor/room observations and unknown locations.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                      Total People Reported
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
                      Unknown Location Count
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
                      Observed Count on Floor
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
                      Observed Floor Level
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
                    Room ID (Leave blank if Floor-Only / Room Unknown)
                  </label>
                  <input
                    type="text"
                    value={roomSeenId}
                    onChange={(e) => setRoomSeenId(e.target.value)}
                    placeholder="e.g. f3-east-lab (or leave empty for floor-only)"
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                  />
                </div>
              </div>
            )}

            {activeTab === 'fire' && (
              <div className="space-y-3">
                <p className="text-zinc-400">
                  Explicitly distinguishes active flame reports from smoke-only reports (smoke without flames never renders flame geometry).
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                      Floor Level
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
                      Smoke Color
                    </label>
                    <select
                      value={smokeColor}
                      onChange={(e) => setSmokeColor(e.target.value as any)}
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100"
                    >
                      <option value="white">White Smoke</option>
                      <option value="gray">Gray Smoke</option>
                      <option value="black">Black Smoke</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                    Area / Room Label
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
                    Flames directly observed (Uncheck if ONLY smoke is reported)
                  </span>
                </label>
              </div>
            )}

            {activeTab === 'building' && (
              <div className="space-y-3">
                <p className="text-amber-300">
                  Correcting the building identity increments Building Revision (#{incident.buildingRevision} → #{incident.buildingRevision + 1}), invalidates prior building geometry and floor locations, and launches a fresh parallel research investigation.
                </p>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-400 mb-1">
                    Corrected Building Name
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
                    Corrected Street Address
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
                Apply Accepted Correction
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
