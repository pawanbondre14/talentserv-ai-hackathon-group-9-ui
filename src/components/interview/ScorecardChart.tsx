import type { ScorecardScore } from '@/lib/types'

export function ScorecardChart({ scores }: { scores: ScorecardScore[] | undefined }) {
  if (!scores?.length) return null

  return (
    <div className="space-y-3">
      {scores.map((s, i) => {
        const score = Math.min(5, Math.max(0, Number(s.score) || 0))
        const pct = (score / 5) * 100
        return (
          <div key={s.criterion_id ?? i}>
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{s.criterion}</span>
              <span className="font-medium text-violet-300">{score}/5</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            {s.notes && <p className="mt-1 text-xs text-slate-500">{s.notes}</p>}
          </div>
        )
      })}
    </div>
  )
}
