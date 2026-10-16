import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  XCircle,
  FileText,
  Cpu,
  ExternalLink,
  ArrowDown,
  Sparkles,
  Wrench,
  BookOpen,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TraceBranch, TraceStep, SourceDocument } from '../../lib/incident-engine';

/* ============================================================================
 * Rich Markdown Renderer (Supports **bold**, lists, code, and GFM tables)
 * ========================================================================== */
export function MarkdownText({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5 text-xs leading-relaxed text-zinc-200 break-words', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="leading-relaxed last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-50">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
          ul: ({ children }) => (
            <ul className="my-1 list-disc pl-4 space-y-0.5 text-zinc-200">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1 list-decimal pl-4 space-y-0.5 text-zinc-200">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <h1 className="text-sm font-bold text-zinc-100 mt-2 mb-1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-100 mt-2 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-zinc-100 mt-1.5 mb-0.5">{children}</h3>
          ),
          code: ({ className: codeClass, children }) => {
            const isBlock = Boolean(codeClass);
            if (isBlock) {
              return (
                <pre className="my-1.5 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950 p-2 font-mono text-[11px] text-zinc-200">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="rounded-xs border border-zinc-700/80 bg-zinc-800/90 px-1 py-0.5 font-mono text-[11px] text-amber-200">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber-500/60 pl-2.5 italic text-zinc-300 my-1">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-2 w-full overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/80">
              <table className="w-full table-auto border-collapse text-left text-[11px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-zinc-800 bg-zinc-900/90 font-mono text-[10px] uppercase text-zinc-300">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-800/70">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-zinc-900/40 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1.5 font-semibold text-zinc-200 leading-tight">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1.5 text-zinc-300 align-top leading-snug break-words">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* ============================================================================
 * Base UI Dialog Wrapper (stock neutral shadcn dark theme)
 * ========================================================================== */
export const DialogRoot = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogContent({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  description?: string;
}) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs transition-opacity" />
      <BaseDialog.Popup
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-2xl max-h-[90dvh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-800 bg-zinc-950 p-5 text-zinc-100 shadow-2xl focus:outline-none',
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-3">
          <div className="min-w-0">
            <BaseDialog.Title className="text-base font-semibold tracking-tight text-zinc-100 truncate">
              {title}
            </BaseDialog.Title>
            {description && (
              <BaseDialog.Description className="mt-1 text-xs text-zinc-400">
                {description}
              </BaseDialog.Description>
            )}
          </div>
          <BaseDialog.Close
            data-testid="dialog-close-btn"
            className="shrink-0 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Close
          </BaseDialog.Close>
        </div>
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

/* ============================================================================
 * Base UI Tabs & Tooltip Wrappers
 * ========================================================================== */
export const TabsRoot = BaseTabs.Root;
export const TabsList = BaseTabs.List;
export const TabsTab = BaseTabs.Tab;
export const TabsPanel = BaseTabs.Panel;

export const TooltipProvider = BaseTooltip.Provider;
export const TooltipRoot = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;

/* ============================================================================
 * Official shadcn/ui Base UI Chat Composition
 * ========================================================================== */

export interface MessageScrollerProps {
  children: React.ReactNode;
  className?: string;
  itemCount: number;
  liveRevision?: number;
}

export function MessageScroller({
  children,
  className,
  itemCount,
  liveRevision,
}: MessageScrollerProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isAtLiveEdge, setIsAtLiveEdge] = React.useState(true);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const prevCountRef = React.useRef(itemCount);

  const handleScroll = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom <= 56;
    setIsAtLiveEdge(atBottom);
    if (atBottom) {
      setUnreadCount(0);
    }
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const added = Math.max(0, itemCount - prevCountRef.current);
    prevCountRef.current = itemCount;

    if (isAtLiveEdge) {
      el.scrollTop = el.scrollHeight;
    } else if (added > 0) {
      setUnreadCount((c) => c + added);
    }
  }, [itemCount, liveRevision, isAtLiveEdge]);

  const scrollToLatest = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setIsAtLiveEdge(true);
    setUnreadCount(0);
  }, []);

  return (
    <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        data-testid="message-scroller"
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden px-3 py-2.5 space-y-2.5 scroll-smooth',
          className
        )}
      >
        {children}
      </div>

      {!isAtLiveEdge && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <button
            type="button"
            onClick={scrollToLatest}
            data-testid="jump-to-latest-btn"
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900/95 px-3 py-1.5 text-xs font-medium text-zinc-100 shadow-lg backdrop-blur-xs transition hover:bg-zinc-800"
          >
            <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
            <span>
              {unreadCount > 0
                ? `${unreadCount} new update${unreadCount > 1 ? 's' : ''} · Jump to latest`
                : 'Jump to latest'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export function Message({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      id={id}
      data-event-id={id}
      className={cn(
        'group relative flex flex-col gap-1.5 overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700/80',
        className
      )}
    >
      {children}
    </article>
  );
}

export function MessageHeader({
  speaker,
  badge,
  timestamp,
  captureTime,
  icon,
  rightSlot,
}: {
  speaker: string;
  badge?: string;
  timestamp: string;
  captureTime?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  const formattedTime = React.useMemo(() => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  }, [timestamp]);

  const formattedCapture = React.useMemo(() => {
    if (!captureTime || captureTime === timestamp) return null;
    try {
      return new Date(captureTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return null;
    }
  }, [captureTime, timestamp]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
      <div className="flex items-center gap-1.5 min-w-0 max-w-full">
        {icon && <span className="shrink-0 text-zinc-400">{icon}</span>}
        <span className="truncate text-xs font-semibold text-zinc-100">{speaker}</span>
        {badge && (
          <span
            title={badge}
            className="truncate max-w-[180px] sm:max-w-[220px] rounded-sm border border-zinc-700/80 bg-zinc-800/90 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-300"
          >
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 shrink-0 ml-auto">
        {formattedCapture && (
          <span title="Field capture timestamp" className="hidden sm:inline text-zinc-400">
            Captured {formattedCapture} ·
          </span>
        )}
        <time dateTime={timestamp}>{formattedTime}</time>
        {rightSlot}
      </div>
    </div>
  );
}

export function MessageBubble({
  children,
  className,
  isPartial,
}: {
  children: React.ReactNode;
  className?: string;
  isPartial?: boolean;
}) {
  return (
    <div
      className={cn(
        'text-xs leading-relaxed text-zinc-200 break-words min-w-0',
        isPartial && 'italic text-zinc-300',
        className
      )}
    >
      {typeof children === 'string' ? (
        <MarkdownText content={children} className={className} />
      ) : (
        children
      )}
      {isPartial && (
        <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] not-italic text-amber-300">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          live speech...
        </span>
      )}
    </div>
  );
}

export function InputGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'shrink-0 flex flex-col gap-1.5 border-t border-zinc-800 bg-zinc-950/95 p-2 sm:p-3',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ============================================================================
 * Official shadcn/ui Base UI Trace Composition
 * ========================================================================== */

function StatusIcon({ status }: { status: 'running' | 'completed' | 'failed' | 'partial_failure' | 'canceled' }) {
  if (status === 'running') {
    return <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-amber-400" />;
  }
  if (status === 'completed') {
    return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />;
  }
  if (status === 'partial_failure') {
    return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />;
  }
  if (status === 'canceled') {
    return <XCircle className="h-3.5 w-3.5 shrink-0 text-zinc-500" />;
  }
  return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />;
}

export function Trace({
  title,
  subtitle,
  status,
  defaultOpen = true,
  children,
  headerRight,
}: {
  title: string;
  subtitle?: string;
  status: 'running' | 'completed' | 'failed' | 'partial_failure' | 'canceled';
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <BaseCollapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="rounded-md border border-zinc-800 bg-zinc-950/90 overflow-hidden"
    >
      <BaseCollapsible.Trigger
        data-testid="trace-root-trigger"
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-200 hover:bg-zinc-900/80 transition-colors min-w-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          )}
          <StatusIcon status={status} />
          <span className="font-semibold text-zinc-100 truncate">{title}</span>
          {subtitle && (
            <span className="truncate text-[11px] text-zinc-400 font-normal hidden sm:inline">
              — {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {headerRight}
          <span className="rounded-sm border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-300">
            {status.replace('_', ' ')}
          </span>
        </div>
      </BaseCollapsible.Trigger>

      <BaseCollapsible.Panel className="border-t border-zinc-800/80 px-2.5 py-2 space-y-2">
        {children}
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
}

export function TraceSubagent({
  branch,
  sourcesMap,
  onSelectSource,
}: {
  branch: TraceBranch;
  sourcesMap: Map<string, SourceDocument>;
  onSelectSource: (source: SourceDocument, page?: number) => void;
}) {
  const [open, setOpen] = React.useState(branch.status === 'running');

  const branchSources = branch.sourceIds
    .map((id) => sourcesMap.get(id))
    .filter((s): s is SourceDocument => Boolean(s));

  return (
    <BaseCollapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="rounded-md border border-zinc-800/70 bg-zinc-900/40 overflow-hidden"
    >
      <BaseCollapsible.Trigger className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-zinc-800/50 transition-colors min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {open ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-zinc-400" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-zinc-400" />
          )}
          <StatusIcon status={branch.status} />
          <Cpu className="h-3 w-3 shrink-0 text-zinc-400" />
          <span className="font-medium text-zinc-200 truncate">{branch.title}</span>
        </div>
        <span className="truncate max-w-[160px] text-[11px] text-zinc-400 shrink-0">
          {branch.summary}
        </span>
      </BaseCollapsible.Trigger>

      <BaseCollapsible.Panel className="border-t border-zinc-800/60 px-2.5 py-2 space-y-2 text-xs">
        <p className="text-zinc-300 leading-relaxed">{branch.summary}</p>

        {branch.steps.length > 0 && (
          <div className="space-y-1">
            {branch.steps.map((step) => (
              <TraceTool key={step.id} step={step} />
            ))}
          </div>
        )}

        {branch.findings.length > 0 && (
          <TraceChainOfThought findings={branch.findings} />
        )}

        {branchSources.length > 0 && (
          <TraceSources sources={branchSources} onSelectSource={onSelectSource} />
        )}
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
}

export function TraceTool({ step }: { step: TraceStep }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-sm border border-zinc-800/60 bg-zinc-950/60 px-2 py-1 text-[11px]">
      <div className="flex items-start gap-1.5 min-w-0">
        <StatusIcon status={step.status} />
        <Wrench className="h-3 w-3 shrink-0 text-zinc-400 mt-0.5" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-zinc-200">{step.label}</span>
            {step.toolName && (
              <code className="rounded-xs bg-zinc-800 px-1 py-0.2 font-mono text-[10px] text-zinc-300">
                {step.toolName}
              </code>
            )}
          </div>
          {step.detail && <p className="text-zinc-400 mt-0.5 break-words">{step.detail}</p>}
        </div>
      </div>
    </div>
  );
}

export function TraceChainOfThought({ findings }: { findings: string[] }) {
  return (
    <div className="rounded-sm border border-zinc-800/70 bg-zinc-950/50 p-2 space-y-1">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
        <Sparkles className="h-3 w-3 text-amber-400" />
        <span>Cited Findings</span>
      </div>
      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-zinc-300">
        {findings.map((f, idx) => (
          <li key={idx}>
            <MarkdownText content={f} className="inline text-[11px]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TraceSources({
  sources,
  onSelectSource,
}: {
  sources: SourceDocument[];
  onSelectSource: (source: SourceDocument, page?: number) => void;
}) {
  return (
    <div className="space-y-1 pt-0.5">
      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
        <BookOpen className="h-3 w-3 text-zinc-400" />
        <span>Verified Sources ({sources.length})</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((src) => (
          <button
            key={src.id}
            type="button"
            onClick={() => onSelectSource(src, src.matchedFloor ? 2 : 1)}
            className="inline-flex items-center gap-1.5 rounded-sm border border-zinc-700/80 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-200 hover:border-amber-500/60 hover:bg-zinc-800 transition-colors max-w-full"
          >
            <FileText className="h-3 w-3 text-amber-400 shrink-0" />
            <span className="truncate max-w-[180px]">{src.title}</span>
            <span className="rounded-xs bg-zinc-800 px-1 font-mono text-[9px] uppercase text-zinc-300 shrink-0">
              {src.status}
            </span>
            <ExternalLink className="h-2.5 w-2.5 text-zinc-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
