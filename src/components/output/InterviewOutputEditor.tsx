import type { InterviewFeedbackOutput } from '@/lib/types'
import { Card } from '@/components/ui/Card'

const RATINGS = ['Proceed', 'Hold', 'Reject'] as const

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

  return (
    <div className="space-y-6">
      <Card>
        <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">AI generated</span>
        <label className="mt-3 block text-xs text-slate-400">Candidate summary</label>
        <textarea
          value={data.candidate_summary || ''}
          onChange={(e) => update({ candidate_summary: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
        />
        <label className="mt-4 block text-xs text-slate-400">Rating</label>
        <select
          value={data.rating || 'Hold'}
          onChange={(e) => update({ rating: e.target.value as InterviewFeedbackOutput['rating'] })}
          className="mt-1 rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
        >
          {RATINGS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <label className="mt-4 block text-xs text-slate-400">Rationale</label>
        <textarea
          value={data.rationale || ''}
          onChange={(e) => update({ rationale: e.target.value })}
          rows={2}
          className="mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
        />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-white">Skill observations</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(
            [
              ['technical_skills', 'Technical'],
              ['communication', 'Communication'],
              ['problem_solving', 'Problem solving'],
              ['culture_fit', 'Culture fit'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-slate-400">{label}</label>
              <textarea
                value={sk[key] || ''}
                onChange={(e) =>
                  update({
                    skill_observations: { ...sk, [key]: e.target.value },
                  })
                }
                rows={2}
                className="mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-2 py-1 text-sm text-white"
              />
            </div>
          ))}
        </div>
      </Card>

      <StringListCard title="Strengths" items={data.strengths} onChange={(strengths) => update({ strengths })} />
      <StringListCard title="Concerns" items={data.concerns} onChange={(concerns) => update({ concerns })} />

      <Card>
        <label className="text-sm font-semibold text-white">Communication assessment</label>
        <textarea
          value={data.communication_assessment || ''}
          onChange={(e) => update({ communication_assessment: e.target.value })}
          rows={2}
          className="mt-2 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
        />
      </Card>

      <StringListCard
        title="Follow-up questions"
        items={data.follow_up_questions}
        onChange={(follow_up_questions) => update({ follow_up_questions })}
      />
    </div>
  )
}

function StringListCard({
  title,
  items,
  onChange,
}: {
  title: string
  items: string[] | undefined
  onChange: (items: string[]) => void
}) {
  const list = items?.length ? items : []
  return (
    <Card>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {list.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">None identified</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {list.map((item, i) => (
            <li key={i}>
              <input
                value={item}
                onChange={(e) => {
                  const next = [...list]
                  next[i] = e.target.value
                  onChange(next)
                }}
                className="w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
