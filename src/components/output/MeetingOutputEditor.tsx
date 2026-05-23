import type { MeetingMinutesOutput } from '@/lib/types'
import { Card } from '@/components/ui/Card'

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}) {
  const className =
    'mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500'
  return (
    <div>
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={className} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={className} />
      )}
    </div>
  )
}

export function MeetingOutputEditor({
  data,
  onChange,
}: {
  data: MeetingMinutesOutput
  onChange: (d: MeetingMinutesOutput) => void
}) {
  const update = (patch: Partial<MeetingMinutesOutput>) => onChange({ ...data, ...patch })

  return (
    <div className="space-y-6">
      <Card>
        <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">AI generated</span>
        <div className="mt-3">
          <Field
            label="Executive summary"
            value={data.executive_summary || ''}
            onChange={(v) => update({ executive_summary: v })}
            multiline
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-white">Discussion points</h3>
        {(data.discussion_points?.length ? data.discussion_points : [{ topic: '', summary: '', participants: [] }]).map(
          (dp, i) => (
            <div key={i} className="mt-4 space-y-2 border-t border-[var(--color-surface-border)] pt-4 first:border-0 first:pt-0">
              <Field label="Topic" value={dp.topic} onChange={(v) => {
                const list = [...(data.discussion_points || [])]
                list[i] = { ...dp, topic: v }
                update({ discussion_points: list })
              }} />
              <Field label="Summary" value={dp.summary} onChange={(v) => {
                const list = [...(data.discussion_points || [])]
                list[i] = { ...dp, summary: v }
                update({ discussion_points: list })
              }} multiline />
            </div>
          ),
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-white">Decisions</h3>
        {(data.decisions?.length ? data.decisions : []).length === 0 && (
          <p className="mt-2 text-sm text-slate-500">None identified</p>
        )}
        {(data.decisions || []).map((d, i) => (
          <div key={i} className="mt-3 grid gap-2 md:grid-cols-2">
            <Field label="Decision" value={d.decision} onChange={(v) => {
              const list = [...(data.decisions || [])]
              list[i] = { ...d, decision: v }
              update({ decisions: list })
            }} />
            <Field label="Owner" value={d.owner} onChange={(v) => {
              const list = [...(data.decisions || [])]
              list[i] = { ...d, owner: v }
              update({ decisions: list })
            }} />
            <div className="md:col-span-2">
              <Field label="Rationale" value={d.rationale} onChange={(v) => {
                const list = [...(data.decisions || [])]
                list[i] = { ...d, rationale: v }
                update({ decisions: list })
              }} multiline />
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-white">Action items</h3>
        {(data.action_items?.length ? data.action_items : []).length === 0 && (
          <p className="mt-2 text-sm text-slate-500">None identified</p>
        )}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="pb-2 pr-2">Task</th>
                <th className="pb-2 pr-2">Owner</th>
                <th className="pb-2 pr-2">Due</th>
                <th className="pb-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {(data.action_items || []).map((a, i) => (
                <tr key={i} className="border-t border-[var(--color-surface-border)]">
                  {(['task', 'owner', 'due_date', 'priority'] as const).map((field) => (
                    <td key={field} className="py-2 pr-2 align-top">
                      <input
                        value={a[field]}
                        onChange={(e) => {
                          const list = [...(data.action_items || [])]
                          list[i] = { ...a, [field]: e.target.value }
                          update({ action_items: list })
                        }}
                        className="w-full min-w-[80px] rounded border border-[var(--color-surface-border)] bg-black/30 px-2 py-1 text-xs text-white"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-white">Risks</h3>
        <ListEditor
          items={data.risks?.length ? data.risks : []}
          emptyLabel="None identified"
          onChange={(risks) => update({ risks })}
        />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-white">Follow-ups</h3>
        <ListEditor
          items={data.follow_ups?.length ? data.follow_ups : []}
          emptyLabel="None identified"
          onChange={(follow_ups) => update({ follow_ups })}
        />
      </Card>
    </div>
  )
}

function ListEditor({
  items,
  emptyLabel,
  onChange,
}: {
  items: string[]
  emptyLabel: string
  onChange: (items: string[]) => void
}) {
  if (!items.length) return <p className="mt-2 text-sm text-slate-500">{emptyLabel}</p>
  return (
    <ul className="mt-2 space-y-2">
      {items.map((item, i) => (
        <li key={i}>
          <input
            value={item}
            onChange={(e) => {
              const next = [...items]
              next[i] = e.target.value
              onChange(next)
            }}
            className="w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
          />
        </li>
      ))}
    </ul>
  )
}
