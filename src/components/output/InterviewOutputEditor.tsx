import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Brain,
  Briefcase,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  MessageSquareQuote,
  Mic,
  Plus,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  User,
  Users,
  Wrench,
} from 'lucide-react'
import { ScorecardChart } from '@/components/interview/ScorecardChart'
import type { InterviewFeedbackOutput, QaPair } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const RATINGS = ['Proceed', 'Hold', 'Reject'] as const

const EMPTY_QA: QaPair = { question: '', answer: '', notes: '' }

function SectionHeader({
  icon: Icon,
  title,
  accent = 'indigo',
}: {
  icon: LucideIcon
  title: string
  accent?: 'indigo' | 'sky' | 'emerald' | 'amber' | 'rose' | 'violet'
}) {
  const accents = {
    indigo: 'bg-indigo-500/15 text-indigo-400',
    sky: 'bg-sky-500/15 text-sky-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    rose: 'bg-rose-500/15 text-rose-400',
    violet: 'bg-violet-500/15 text-violet-400',
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', accents[accent])}>
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  multiline,
  icon: Icon,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  icon?: LucideIcon
  rows?: number
}) {
  const inputClassName = cn(
    'w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 text-sm text-white outline-none transition-colors',
    'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30',
    Icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2',
  )

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-500" aria-hidden />}
        {label}
      </label>
      <div className="relative mt-1">
        {Icon && (
          <Icon
            className={cn(
              'pointer-events-none absolute left-3 h-4 w-4 text-slate-500',
              multiline ? 'top-3' : 'top-1/2 -translate-y-1/2',
            )}
            aria-hidden
          />
        )}
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={inputClassName} />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClassName} />
        )}
      </div>
    </div>
  )
}

function EmptyHint({ label }: { label: string }) {
  return <p className="mt-2 text-xs text-slate-500">{label}</p>
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--color-surface-border)] px-3 py-1.5 text-xs font-medium text-indigo-300 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-200"
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  )
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-500/15 hover:text-red-400"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
    </button>
  )
}

function removeAtIndex<T>(stored: T[] | undefined, displayed: T[], index: number): T[] {
  const current = stored?.length ? [...stored] : [...displayed]
  current.splice(index, 1)
  return current
}

const SKILL_FIELDS = [
  { key: 'technical_skills' as const, label: 'Technical', icon: Wrench },
  { key: 'communication' as const, label: 'Communication', icon: MessageSquare },
  { key: 'problem_solving' as const, label: 'Problem solving', icon: Brain },
  { key: 'culture_fit' as const, label: 'Culture fit', icon: Users },
] as const

export function InterviewOutputEditor({
  data,
  onChange,
}: {
  data: InterviewFeedbackOutput
  onChange: (d: InterviewFeedbackOutput) => void
}) {
  const update = (patch: Partial<InterviewFeedbackOutput>) => onChange({ ...data, ...patch })
  const sk = data.skill_observations || {
    technical_skills: '',
    communication: '',
    problem_solving: '',
    culture_fit: '',
  }
  const qaPairs = data.qa_pairs?.length ? data.qa_pairs : [EMPTY_QA]
  const jd = data.jd_analysis

  return (
    <div className="space-y-6">
      <Card>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs text-violet-300">
          <Sparkles className="h-3 w-3" aria-hidden />
          AI generated
        </span>
        <div className="mt-4 space-y-4">
          <SectionHeader icon={User} title="Candidate overview" accent="violet" />
          <Field
            label="Candidate summary"
            icon={User}
            value={data.candidate_summary || ''}
            onChange={(v) => update({ candidate_summary: v })}
            multiline
          />
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Star className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              Rating
            </label>
            <div className="relative mt-1">
              <Star className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
              <select
                value={data.rating || 'Hold'}
                onChange={(e) => update({ rating: e.target.value as InterviewFeedbackOutput['rating'] })}
                className="w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-indigo-500"
              >
                {RATINGS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Field
            label="Rationale"
            icon={Lightbulb}
            value={data.rationale || ''}
            onChange={(v) => update({ rationale: v })}
            multiline
            rows={2}
          />
        </div>
        {data.panel_notes && (
          <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Panel: {data.panel_notes}
          </p>
        )}
      </Card>

      {jd && (
        <Card className="border-indigo-500/30">
          <SectionHeader icon={Briefcase} title="JD fit analysis" accent="indigo" />
          <p className="mt-3 text-2xl font-bold text-indigo-300">
            {jd.overall_fit_score}
            <span className="text-sm font-normal text-slate-400"> / 10</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">{jd.summary}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-medium uppercase text-emerald-400">
                <Target className="h-3.5 w-3.5" aria-hidden />
                Matched
              </h4>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-300">
                {(jd.matched_requirements ?? []).map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-medium uppercase text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                Gaps
              </h4>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-300">
                {(jd.gaps ?? []).map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {data.scorecard_scores && data.scorecard_scores.length > 0 && (
        <Card>
          <SectionHeader icon={Target} title="Role scorecard" accent="sky" />
          <div className="mt-4">
            <ScorecardChart scores={data.scorecard_scores} />
          </div>
        </Card>
      )}

      <Card>
        <SectionHeader icon={Brain} title="Skill observations" accent="sky" />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {SKILL_FIELDS.map(({ key, label, icon }) => (
            <Field
              key={key}
              label={label}
              icon={icon}
              value={sk[key] || ''}
              onChange={(v) =>
                update({
                  skill_observations: { ...sk, [key]: v },
                })
              }
              multiline
              rows={2}
            />
          ))}
        </div>
      </Card>

      <QaPairsCard
        stored={data.qa_pairs}
        pairs={qaPairs}
        onChange={(qa_pairs) => update({ qa_pairs })}
      />

      <StringListCard
        title="Strengths"
        icon={TrendingUp}
        accent="emerald"
        items={data.strengths}
        emptyLabel="None identified — add your own below."
        addLabel="Add strength"
        onChange={(strengths) => update({ strengths })}
      />
      <StringListCard
        title="Concerns"
        icon={AlertTriangle}
        accent="rose"
        items={data.concerns}
        emptyLabel="None identified — add your own below."
        addLabel="Add concern"
        onChange={(concerns) => update({ concerns })}
      />

      <Card>
        <SectionHeader icon={Mic} title="Communication assessment" accent="amber" />
        <div className="mt-3">
          <Field
            label="Assessment"
            icon={Mic}
            value={data.communication_assessment || ''}
            onChange={(v) => update({ communication_assessment: v })}
            multiline
            rows={2}
          />
        </div>
      </Card>

      <StringListCard
        title="Follow-up questions"
        icon={HelpCircle}
        accent="violet"
        items={data.follow_up_questions}
        emptyLabel="None identified — add your own below."
        addLabel="Add follow-up question"
        onChange={(follow_up_questions) => update({ follow_up_questions })}
      />
    </div>
  )
}

function QaPairsCard({
  stored,
  pairs,
  onChange,
}: {
  stored: QaPair[] | undefined
  pairs: QaPair[]
  onChange: (pairs: QaPair[]) => void
}) {
  return (
    <Card>
      <SectionHeader icon={MessageSquareQuote} title="Q ↔ A mapping" accent="indigo" />
      {!stored?.length && <EmptyHint label="None identified — add your own below." />}
      <ul className="mt-3 space-y-4">
        {pairs.map((pair, i) => (
          <li
            key={i}
            className="space-y-3 rounded-lg border border-[var(--color-surface-border)] bg-black/15 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">Q&A {i + 1}</span>
              <RemoveButton
                label={`Remove Q&A ${i + 1}`}
                onClick={() => onChange(removeAtIndex(stored, pairs, i))}
              />
            </div>
            <Field
              label="Question"
              icon={HelpCircle}
              value={pair.question}
              onChange={(v) => {
                const next = [...(stored?.length ? stored : pairs)]
                next[i] = { ...pair, question: v }
                onChange(next)
              }}
            />
            <Field
              label="Answer summary"
              icon={MessageSquare}
              value={pair.answer}
              onChange={(v) => {
                const next = [...(stored?.length ? stored : pairs)]
                next[i] = { ...pair, answer: v }
                onChange(next)
              }}
              multiline
              rows={2}
            />
          </li>
        ))}
      </ul>
      <AddButton label="Add Q&A pair" onClick={() => onChange([...pairs, { ...EMPTY_QA }])} />
    </Card>
  )
}

function StringListCard({
  title,
  icon: SectionIcon,
  accent,
  items,
  emptyLabel,
  addLabel,
  onChange,
}: {
  title: string
  icon: LucideIcon
  accent: 'indigo' | 'sky' | 'emerald' | 'amber' | 'rose' | 'violet'
  items: string[] | undefined
  emptyLabel: string
  addLabel: string
  onChange: (items: string[]) => void
}) {
  const displayItems = items?.length ? items : ['']

  return (
    <Card>
      <SectionHeader icon={SectionIcon} title={title} accent={accent} />
      {!items?.length && <EmptyHint label={emptyLabel} />}
      <ul className="mt-3 space-y-2">
        {displayItems.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <SectionIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                value={item}
                placeholder={`Enter ${addLabel.replace(/^Add /i, '').toLowerCase()}…`}
                onChange={(e) => {
                  const next = [...(items?.length ? items : [''])]
                  next[i] = e.target.value
                  onChange(next)
                }}
                className="w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
            <RemoveButton
              label={`Remove ${addLabel.replace(/^Add /i, '').toLowerCase()} ${i + 1}`}
              onClick={() => onChange(removeAtIndex(items, displayItems, i))}
            />
          </li>
        ))}
      </ul>
      <AddButton label={addLabel} onClick={() => onChange([...displayItems, ''])} />
    </Card>
  )
}
