import * as React from 'react';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  Layers,
  Hash,
  Calendar,
  Download,
} from 'lucide-react';
import { DialogRoot, DialogContent } from './ui/base-primitives';
import type { SourceDocument } from '../lib/incident-engine';

export function SourcePreviewDialog({
  source,
  initialPage = 1,
  open,
  onOpenChange,
  onFocusFloorIn3D,
}: {
  source: SourceDocument | null;
  initialPage?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFocusFloorIn3D?: (floor: number) => void;
}) {
  const [selectedPage, setSelectedPage] = React.useState(initialPage);

  React.useEffect(() => {
    setSelectedPage(initialPage || 1);
  }, [initialPage, source?.id]);

  if (!source) return null;

  const activePageObj =
    source.pages?.find((p) => p.pageNumber === selectedPage) || source.pages?.[0];

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={source.title}
        description={
          source.originalTitle
            ? `Original Filing: ${source.originalTitle} · Building Revision #${source.buildingRevision}`
            : `Verified Incident Evidence Source · Building Revision #${source.buildingRevision}`
        }
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-4">
          {/* Verification metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-zinc-300">
              <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Status: {source.status.toUpperCase()}
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                MIME: {source.mimeType}
              </span>
              {source.byteLength && (
                <span className="font-mono text-[11px] text-zinc-400">
                  {(source.byteLength / 1024).toFixed(1)} KB
                </span>
              )}
              {source.sourceDate && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                  <Calendar className="h-3 w-3" />
                  {source.sourceDate}
                </span>
              )}
              {source.sha256 && (
                <span
                  title={`SHA-256: ${source.sha256}`}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400"
                >
                  <Hash className="h-3 w-3" />
                  SHA256: {source.sha256.slice(0, 12)}…
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {typeof source.matchedFloor === 'number' && onFocusFloorIn3D && (
                <button
                  type="button"
                  onClick={() => {
                    onFocusFloorIn3D(source.matchedFloor!);
                    onOpenChange(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Inspect Floor {source.matchedFloor} in 3D
                </button>
              )}
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
                >
                  {source.mimeType === 'application/pdf' ? (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      Open Binary PDF
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open Raw Source
                    </>
                  )}
                </a>
              )}
            </div>
          </div>

          {/* Multi-page selector for architectural PDFs */}
          {source.pages && source.pages.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Architectural Sheets:
              </span>
              {source.pages.map((p) => (
                <button
                  key={p.pageNumber}
                  type="button"
                  onClick={() => setSelectedPage(p.pageNumber)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                    selectedPage === p.pageNumber
                      ? 'border-amber-500/60 bg-amber-500/15 text-amber-200'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  Page {p.pageNumber}: {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Visual sheet / photo preview */}
          {activePageObj ? (
            <div className="space-y-2">
              <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                <img
                  src={activePageObj.svgDataUrl}
                  alt={activePageObj.label}
                  className="mx-auto max-h-[440px] w-full object-contain rounded-sm"
                />
              </div>
              <div className="rounded-md border border-zinc-800/80 bg-zinc-900/60 p-3 text-xs text-zinc-300">
                <span className="font-semibold text-zinc-100">
                  Sheet Analysis ({activePageObj.label}):{' '}
                </span>
                {activePageObj.extractedSummary}
              </div>
            </div>
          ) : source.previewUrl ? (
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-2">
              <img
                src={source.previewUrl}
                alt={source.title}
                className="mx-auto max-h-[440px] w-full object-contain rounded-sm"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-300">
              <FileText className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <p className="font-medium text-zinc-100">{source.title}</p>
                <p className="text-zinc-400 mt-0.5">
                  Source URL: <code className="font-mono">{source.url}</code>
                </p>
              </div>
            </div>
          )}

          {/* Extracted structural elements */}
          {source.extractedElements && source.extractedElements.length > 0 && (
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3 space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Extracted Spatial & Structural Elements Applied to 3D Scene
              </div>
              <div className="flex flex-wrap gap-1.5">
                {source.extractedElements.map((el, i) => (
                  <span
                    key={i}
                    className="rounded-sm border border-zinc-700/80 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-200"
                  >
                    {el}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
