import { ScorecardChart } from '@/components/interview/ScorecardChart'
import type { InterviewFeedbackOutput, QaPair } from '@/lib/types'
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
  const qa = data.qa_pairs?.length ? data.qa_pairs : []
  const jd = data.jd_analysis

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
        {data.panel_notes && (
          <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Panel: {data.panel_notes}
          </p>
        )}
      </Card>

      {jd && (
        <Card className="border-indigo-500/30">
          <h3 className="text-sm font-semibold text-white">JD fit analysis</h3>
          <p className="mt-2 text-2xl font-bold text-indigo-300">
            {jd.overall_fit_score}
            <span className="text-sm font-normal text-slate-400"> / 10</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">{jd.summary}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-xs font-medium uppercase text-emerald-400">Matched</h4>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-300">
                {(jd.matched_requirements ?? []).map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase text-amber-400">Gaps</h4>
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
          <h3 className="text-sm font-semibold text-white">Role scorecard</h3>
          <div className="mt-4">
            <ScorecardChart scores={data.scorecard_scores} />
          </div>
        </Card>
      )}

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

      <QaPairsCard pairs={qa} onChange={(qa_pairs) => update({ qa_pairs })} />

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

function QaPairsCard({
  pairs,
  onChange,
}: {
  pairs: QaPair[]
  onChange: (pairs: QaPair[]) => void
}) {
  if (!pairs.length) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-white">Q ↔ A mapping</h3>
        <p className="mt-2 text-sm text-slate-500">No Q&A pairs identified</p>
      </Card>
    )
  }
  return (
    <Card>
      <h3 className="text-sm font-semibold text-white">Q ↔ A mapping</h3>
      <ul className="mt-3 space-y-4">
        {pairs.map((pair, i) => (
          <li key={i} className="rounded-lg border border-[var(--color-surface-border)] bg-black/20 p-3">
            <label className="text-xs text-slate-400">Question</label>
            <input
              value={pair.question}
              onChange={(e) => {
                const next = [...pairs]
                next[i] = { ...pair, question: e.target.value }
                onChange(next)
              }}
              className="mt-1 w-full rounded border border-[var(--color-surface-border)] bg-black/30 px-2 py-1 text-sm text-white"
            />
            <label className="mt-2 block text-xs text-slate-400">Answer summary</label>
            <textarea
              value={pair.answer}
              onChange={(e) => {
                const next = [...pairs]
                next[i] = { ...pair, answer: e.target.value }
                onChange(next)
              }}
              rows={2}
              className="mt-1 w-full rounded border border-[var(--color-surface-border)] bg-black/30 px-2 py-1 text-sm text-white"
            />
          </li>
        ))}
      </ul>
    </Card>
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
