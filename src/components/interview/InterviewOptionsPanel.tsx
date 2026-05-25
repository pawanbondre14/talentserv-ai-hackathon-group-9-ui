import { useEffect, useState } from 'react'
import { EyeOff, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useApi } from '@/hooks/useApi'
import { fetchScorecards, type InterviewProcessOptions, type ScorecardTemplate } from '@/lib/api'

export const defaultInterviewOptions = (): InterviewProcessOptions => ({
  jd_text: null,
  scorecard_id: null,
  blind_mode: false,
  candidate_name: null,
  candidate_email: null,
  panel_transcripts: null,
})

export function InterviewOptionsPanel({
  value,
  onChange,
}: {
  value: InterviewProcessOptions
  onChange: (v: InterviewProcessOptions) => void
}) {
  const api = useApi()
  const [scorecards, setScorecards] = useState<ScorecardTemplate[]>([])
  const [panel2, setPanel2] = useState('')
  const [showPanel, setShowPanel] = useState(Boolean(value.panel_transcripts?.length))

  useEffect(() => {
    fetchScorecards(api)
      .then(setScorecards)
      .catch(() => setScorecards([]))
  }, [api])

  useEffect(() => {
    if (value.panel_transcripts?.[0]) {
      setPanel2(value.panel_transcripts[0])
      setShowPanel(true)
    }
  }, [value.panel_transcripts])

  const update = (patch: Partial<InterviewProcessOptions>) => onChange({ ...value, ...patch })

  function syncPanel(extra: string) {
    setPanel2(extra)
    const trimmed = extra.trim()
    update({ panel_transcripts: trimmed ? [trimmed] : null })
  }

  return (
    <Card className="border-violet-500/20 bg-violet-500/5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
        <Users className="h-4 w-4 text-violet-400" />
        Interview options
      </h3>
      <p className="mt-1 text-xs text-slate-400">
        JD scoring, role scorecard, blind review, and optional second interviewer transcript.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs text-slate-400">Candidate name (optional)</label>
          <input
            value={value.candidate_name ?? ''}
            onChange={(e) => update({ candidate_name: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="For your records only — not sent to AI when blind mode is on"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Candidate email (optional)</label>
          <input
            type="email"
            value={value.candidate_email ?? ''}
            onChange={(e) => update({ candidate_email: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs text-slate-400">Role scorecard</label>
        <select
          value={value.scorecard_id ?? ''}
          onChange={(e) => update({ scorecard_id: e.target.value || null })}
          className="mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
        >
          <option value="">None</option>
          {scorecards.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="text-xs text-slate-400">Job description (for JD fit scoring)</label>
        <textarea
          value={value.jd_text ?? ''}
          onChange={(e) => update({ jd_text: e.target.value || null })}
          rows={4}
          className="mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
          placeholder="Paste JD text to get overall fit score, matched requirements, and gaps…"
        />
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={value.blind_mode}
          onChange={(e) => update({ blind_mode: e.target.checked })}
          className="rounded border-slate-600 bg-black/30 text-violet-600"
        />
        <EyeOff className="h-4 w-4 text-violet-400" />
        Blind review — redact names, email, phone before AI
      </label>

      <div className="mt-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={showPanel}
            onChange={(e) => {
              setShowPanel(e.target.checked)
              if (!e.target.checked) syncPanel('')
            }}
            className="rounded border-slate-600 bg-black/30 text-violet-600"
          />
          Merge second interviewer transcript (panel)
        </label>
        {showPanel && (
          <textarea
            value={panel2}
            onChange={(e) => syncPanel(e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Paste another interviewer's notes or transcript…"
          />
        )}
      </div>
    </Card>
  )
}
