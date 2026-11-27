import * as React from 'react';
import { CheckCircle2, HelpCircle, MessageCircleQuestion, Circle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type { IncidentState } from '../lib/incident-engine';
import {
  computeIntakeProgress,
  TIER_LABELS,
  type IntakeItemStatus,
} from '../lib/kr119-intake';

const STATUS_META: Record<
  IntakeItemStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  covered: {
    label: '확인',
    className: 'text-emerald-300',
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  },
  unknown: {
    label: '모름',
    className: 'text-zinc-300',
    icon: <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />,
  },
  asked: {
    label: '답 없음',
    className: 'text-amber-300',
    icon: <MessageCircleQuestion className="h-3.5 w-3.5 text-amber-400" />,
  },
  pending: {
    label: '미확인',
    className: 'text-zinc-500',
    icon: <Circle className="h-3.5 w-3.5 text-zinc-600" />,
  },
};

/**
 * 상황실 화면용 119 신고 접수 체크리스트.
 * 신고자·접수요원 대화를 보고 어떤 항목이 확인됐는지, 다음에 무엇을 물어야 하는지 보여준다.
 */
export function Kr119IntakeChecklist({ incident }: { incident: IncidentState }) {
  const [expanded, setExpanded] = React.useState(true);

  const progress = React.useMemo(
    () =>
      computeIntakeProgress(
        incident.timeline.filter(
          (e) => e.type === 'caller_utterance' || e.type === 'call_taker_utterance'
        )
      ),
    [incident.timeline]
  );

  const pct = Math.round((progress.coveredCount / progress.total) * 100);

  return (
    <div
      data-testid="kr119-intake-checklist"
      className="shrink-0 border-b border-zinc-800 bg-zinc-900/50 px-3 py-2"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-100">119 접수 체크리스트</span>
          <span className="rounded-xs border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
            {progress.coveredCount}/{progress.total}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800">
            <span
              className="block h-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          )}
        </span>
      </button>

      {progress.callerMayBeInside && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md border border-red-500/40 bg-red-950/30 px-2 py-1.5 text-[11px] text-red-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
          {progress.callerTrapped
            ? '신고자가 갇혀 나올 수 없는 것으로 보입니다. 문 닫고 문틈 막기, 창문 쪽 구조 대기를 먼저 안내하세요.'
            : '신고자가 아직 건물 안에 있는 것으로 보입니다. 대피 안내를 먼저 하세요.'}
        </div>
      )}

      {expanded && (
        <>
          <ol className="mt-2 grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
            {progress.items.map((s) => {
              const meta = STATUS_META[s.status];
              return (
                <li
                  key={s.item.id}
                  title={s.evidence ? `신고자: "${s.evidence}"` : s.item.question}
                  className="flex items-center gap-1.5 text-[11px]"
                >
                  {meta.icon}
                  <span className="shrink-0 rounded-xs bg-zinc-800 px-1 font-mono text-[9px] text-zinc-400">
                    {TIER_LABELS[s.item.tier]}
                  </span>
                  <span className={`truncate ${meta.className}`}>{s.item.label}</span>
                </li>
              );
            })}
          </ol>

          <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-1.5 text-[11px]">
            {progress.nextItem ? (
              <>
                <span className="font-semibold text-amber-300">다음 질문 추천 · </span>
                <span className="text-zinc-200">{progress.nextItem.question}</span>
              </>
            ) : (
              <span className="text-emerald-300">
                모든 항목 확인 완료 · 출동 안내 후 &ldquo;끊으라고 할 때까지 전화를 끊지 마세요&rdquo;로
                마무리
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
