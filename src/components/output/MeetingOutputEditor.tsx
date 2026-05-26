import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowRightCircle,
  Calendar,
  CheckSquare,
  Flag,
  Gavel,
  Hash,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Plus,
  ScrollText,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import type { ActionItem, Decision, MeetingMinutesOutput } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

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
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  icon?: LucideIcon
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
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={inputClassName} />
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

const EMPTY_DECISION: Decision = { decision: '', rationale: '', owner: '' }
const EMPTY_ACTION: ActionItem = { task: '', owner: '', due_date: '', priority: '' }

const ACTION_COLUMNS = [
  { key: 'task' as const, label: 'Task', icon: CheckSquare },
  { key: 'owner' as const, label: 'Owner', icon: User },
  { key: 'due_date' as const, label: 'Due', icon: Calendar },
  { key: 'priority' as const, label: 'Priority', icon: Flag },
]

export function MeetingOutputEditor({
  data,
  onChange,
}: {
  data: MeetingMinutesOutput
  onChange: (d: MeetingMinutesOutput) => void
}) {
  const update = (patch: Partial<MeetingMinutesOutput>) => onChange({ ...data, ...patch })

  const discussionPoints = data.discussion_points?.length
    ? data.discussion_points
    : [{ topic: '', summary: '', participants: [] }]
  const decisions = data.decisions?.length ? data.decisions : [EMPTY_DECISION]
  const actionItems = data.action_items?.length ? data.action_items : [EMPTY_ACTION]

  return (
    <div className="space-y-6">
      <Card>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs text-indigo-300">
          <Sparkles className="h-3 w-3" aria-hidden />
          AI generated
        </span>
        <div className="mt-4">
          <SectionHeader icon={ScrollText} title="Executive summary" accent="indigo" />
          <div className="mt-3">
            <Field
              label="Summary"
              icon={ScrollText}
              value={data.executive_summary || ''}
              onChange={(v) => update({ executive_summary: v })}
              multiline
            />
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader icon={MessageSquare} title="Discussion points" accent="sky" />
        {!data.discussion_points?.length && (
          <EmptyHint label="None identified — add your own below." />
        )}
        {discussionPoints.map((dp, i) => (
          <div
            key={i}
            className="mt-4 space-y-3 rounded-lg border border-[var(--color-surface-border)] bg-black/15 p-3 first:mt-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/15 text-sky-400">
                  {i + 1}
                </span>
                Discussion {i + 1}
              </div>
              <RemoveButton
                label={`Remove discussion ${i + 1}`}
                onClick={() =>
                  update({
                    discussion_points: removeAtIndex(data.discussion_points, discussionPoints, i),
                  })
                }
              />
            </div>
            <Field
              label="Topic"
              icon={Hash}
              value={dp.topic}
              onChange={(v) => {
                const list = [...(data.discussion_points || [])]
                list[i] = { ...dp, topic: v }
                update({ discussion_points: list })
              }}
            />
            <Field
              label="Summary"
              icon={MessageSquare}
              value={dp.summary}
              onChange={(v) => {
                const list = [...(data.discussion_points || [])]
                list[i] = { ...dp, summary: v }
                update({ discussion_points: list })
              }}
              multiline
            />
          </div>
        ))}
        <AddButton
          label="Add discussion point"
          onClick={() =>
            update({
              discussion_points: [
                ...discussionPoints,
                { topic: '', summary: '', participants: [] },
              ],
            })
          }
        />
      </Card>

      <Card>
        <SectionHeader icon={Gavel} title="Decisions" accent="emerald" />
        {!data.decisions?.length && <EmptyHint label="None identified — add your own below." />}
        {decisions.map((d, i) => (
          <div
            key={i}
            className="mt-3 rounded-lg border border-[var(--color-surface-border)] bg-black/15 p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">Decision {i + 1}</span>
              <RemoveButton
                label={`Remove decision ${i + 1}`}
                onClick={() =>
                  update({ decisions: removeAtIndex(data.decisions, decisions, i) })
                }
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Decision"
              icon={Gavel}
              value={d.decision}
              onChange={(v) => {
                const list = [...(data.decisions || [])]
                list[i] = { ...d, decision: v }
                update({ decisions: list })
              }}
            />
            <Field
              label="Owner"
              icon={User}
              value={d.owner}
              onChange={(v) => {
                const list = [...(data.decisions || [])]
                list[i] = { ...d, owner: v }
                update({ decisions: list })
              }}
            />
            <div className="md:col-span-2">
              <Field
                label="Rationale"
                icon={Lightbulb}
                value={d.rationale}
                onChange={(v) => {
                  const list = [...(data.decisions || [])]
                  list[i] = { ...d, rationale: v }
                  update({ decisions: list })
                }}
                multiline
              />
            </div>
            </div>
          </div>
        ))}
        <AddButton
          label="Add decision"
          onClick={() => update({ decisions: [...decisions, { ...EMPTY_DECISION }] })}
        />
      </Card>

      <Card>
        <SectionHeader icon={ListChecks} title="Action items" accent="amber" />
        {!data.action_items?.length && <EmptyHint label="None identified — add your own below." />}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                {ACTION_COLUMNS.map(({ key, label, icon: Icon }) => (
                  <th key={key} className="pb-2 pr-2 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-slate-600" aria-hidden />
                      {label}
                    </span>
                  </th>
                ))}
                <th className="pb-2 w-10" aria-label="Remove action item" />
              </tr>
            </thead>
            <tbody>
              {actionItems.map((a, i) => (
                <tr key={i} className="border-t border-[var(--color-surface-border)]">
                  {ACTION_COLUMNS.map(({ key, icon: Icon }) => (
                    <td key={key} className="py-2 pr-2 align-top">
                      <div className="relative min-w-[80px]">
                        <Icon
                          className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600"
                          aria-hidden
                        />
                        <input
                          value={a[key]}
                          onChange={(e) => {
                            const list = [...(data.action_items || [])]
                            list[i] = { ...a, [key]: e.target.value }
                            update({ action_items: list })
                          }}
                          className="w-full rounded border border-[var(--color-surface-border)] bg-black/30 py-1.5 pl-7 pr-2 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                    </td>
                  ))}
                  <td className="py-2 align-top">
                    <RemoveButton
                      label={`Remove action item ${i + 1}`}
                      onClick={() =>
                        update({ action_items: removeAtIndex(data.action_items, actionItems, i) })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddButton
          label="Add action item"
          onClick={() => update({ action_items: [...actionItems, { ...EMPTY_ACTION }] })}
        />
      </Card>

      <Card>
        <SectionHeader icon={AlertTriangle} title="Risks" accent="rose" />
        <ListEditor
          icon={AlertTriangle}
          items={data.risks || []}
          emptyLabel="None identified — add your own below."
          addLabel="Add risk"
          onChange={(risks) => update({ risks })}
        />
      </Card>

      <Card>
        <SectionHeader icon={ArrowRightCircle} title="Follow-ups" accent="violet" />
        <ListEditor
          icon={ArrowRightCircle}
          items={data.follow_ups || []}
          emptyLabel="None identified — add your own below."
          addLabel="Add follow-up"
          onChange={(follow_ups) => update({ follow_ups })}
        />
      </Card>
    </div>
  )
}

function ListEditor({
  icon: Icon,
  items,
  emptyLabel,
  addLabel,
  onChange,
}: {
  icon: LucideIcon
  items: string[]
  emptyLabel: string
  addLabel: string
  onChange: (items: string[]) => void
}) {
  const displayItems = items.length ? items : ['']

  return (
    <>
      {!items.length && <EmptyHint label={emptyLabel} />}
      <ul className="mt-3 space-y-2">
        {displayItems.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Icon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                value={item}
                placeholder={`Enter ${addLabel.replace(/^Add /i, '').toLowerCase()}…`}
                onChange={(e) => {
                  const next = [...(items.length ? items : [''])]
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
    </>
  )
}
