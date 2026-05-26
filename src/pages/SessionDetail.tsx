import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Sparkles, Save } from 'lucide-react'
import { AutosaveIndicator } from '@/components/ui/AutosaveIndicator'
import { Card } from '@/components/ui/Card'
import { useAutosave } from '@/hooks/useAutosave'
import { clearDraftBackup, loadDraftBackup, useDraftBackup } from '@/hooks/useDraftBackup'
import {
  AiStatusPanel,
  loadAiMeta,
  saveAiMeta,
  type AiRunStatus,
} from '@/components/output/AiStatusBadge'
import { ExportBar } from '@/components/output/ExportBar'
import {
  InterviewOptionsPanel,
  defaultInterviewOptions,
} from '@/components/interview/InterviewOptionsPanel'
import { FloatingSessionChat } from '@/components/chat/FloatingSessionChat'
import { InterviewOutputEditor } from '@/components/output/InterviewOutputEditor'
import { MeetingOutputEditor } from '@/components/output/MeetingOutputEditor'
import { useApi } from '@/hooks/useApi'
import {
  fetchSessionFull,
  getApiErrorMessage,
  processSession,
  updateSessionOutput,
  type InterviewProcessOptions,
  type SessionWithOutput,
} from '@/lib/api'
import type { InterviewFeedbackOutput, MeetingMinutesOutput } from '@/lib/types'

const emptyMeeting = (): MeetingMinutesOutput => ({
  executive_summary: '',
  discussion_points: [],
  decisions: [],
  action_items: [],
  risks: [],
  follow_ups: [],
})

const emptyInterview = (): InterviewFeedbackOutput => ({
  candidate_summary: '',
  skill_observations: {
    technical_skills: '',
    communication: '',
    problem_solving: '',
    culture_fit: '',
  },
  strengths: [],
  concerns: [],
  communication_assessment: '',
  rating: 'Hold',
  rationale: '',
  follow_up_questions: [],
})

export function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const api = useApi()
  const [session, setSession] = useState<SessionWithOutput | null>(null)
  const [output, setOutput] = useState<MeetingMinutesOutput | InterviewFeedbackOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [aiStatus, setAiStatus] = useState<AiRunStatus>('idle')
  const [aiProvider, setAiProvider] = useState<string | null>(null)
  const [aiTruncated, setAiTruncated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveOk, setSaveOk] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [interviewOptions, setInterviewOptions] = useState<InterviewProcessOptions>(
    defaultInterviewOptions,
  )
  const outputRef = useRef<MeetingMinutesOutput | InterviewFeedbackOutput | null>(null)

  useEffect(() => {
    outputRef.current = output
  }, [output])

  const load = useCallback(async () => {
    if (!id) return
    const data = await fetchSessionFull(api, id)
    setSession(data)
    if (data.interview_meta) {
      const m = data.interview_meta
      setInterviewOptions({
        jd_text: m.jd_text,
        scorecard_id: m.scorecard_id,
        blind_mode: m.blind_mode,
        candidate_name: m.candidate_name,
        candidate_email: m.candidate_email,
        panel_transcripts: null,
      })
    }
    const draft = id ? loadDraftBackup<MeetingMinutesOutput | InterviewFeedbackOutput>(id) : null
    const raw = data.output?.edited_json ?? data.output?.ai_json
    if (draft && data.status === 'ready') {
      setOutput(draft)
    } else if (raw && data.mode === 'meeting') {
      setOutput({ ...emptyMeeting(), ...(raw as unknown as MeetingMinutesOutput) })
    } else if (raw && data.mode === 'interview') {
      setOutput({ ...emptyInterview(), ...(raw as unknown as InterviewFeedbackOutput) })
    } else {
      setOutput(null)
    }

    if (data.status === 'processing') {
      setAiStatus('processing')
    } else if (data.status === 'ready' && data.output) {
      const meta = id ? loadAiMeta(id) : null
      setAiStatus('done')
      setAiProvider(meta?.provider ?? null)
      setAiTruncated(meta?.truncated ?? false)
    } else if (data.status === 'error') {
      setAiStatus('error')
    } else {
      setAiStatus('idle')
    }
  }, [api, id])

  useEffect(() => {
    load().catch(() => setError('Session not found or API unavailable.'))
  }, [load])

  const hasOutput = output !== null && session?.status === 'ready'

  const saveOutput = useCallback(
    async (data: MeetingMinutesOutput | InterviewFeedbackOutput) => {
      if (!id) return
      await updateSessionOutput(api, id, data as unknown as Record<string, unknown>)
      if (outputRef.current && JSON.stringify(outputRef.current) === JSON.stringify(data)) {
        clearDraftBackup(id)
      }
    },
    [api, id],
  )

  const autosaveStatus = useAutosave(
    output as MeetingMinutesOutput | InterviewFeedbackOutput,
    saveOutput,
    Boolean(hasOutput && output),
  )

  useDraftBackup(id, output, Boolean(hasOutput && output))

  const titleDisplay = useMemo(() => session?.title ?? '', [session?.title])

  async function handleProcess() {
    if (!id) return
    setProcessing(true)
    setAiStatus('processing')
    setAiProvider(null)
    setError(null)
    try {
      const result = await processSession(
        api,
        id,
        session?.mode === 'interview' ? interviewOptions : null,
      )
      setSession({ ...session!, ...result.session, output: result.output })
      setAiStatus('done')
      setAiProvider(result.provider)
      setAiTruncated(result.truncated)
      saveAiMeta(id, {
        provider: result.provider,
        truncated: result.truncated,
        completedAt: new Date().toISOString(),
      })
      const raw = result.output.edited_json ?? result.output.ai_json
      if (session?.mode === 'interview' || result.session.mode === 'interview') {
        setOutput((raw as unknown as InterviewFeedbackOutput) || emptyInterview())
      } else {
        setOutput((raw as unknown as MeetingMinutesOutput) || emptyMeeting())
      }
    } catch (err: unknown) {
      setAiStatus('error')
      setError(
        getApiErrorMessage(
          err,
          'Processing failed. Check API keys or set LLM_MOCK=true.',
        ),
      )
    } finally {
      setProcessing(false)
    }
  }

  async function handleSave() {
    if (!id || !output) return
    setSaving(true)
    setSaveOk(false)
    try {
      await saveOutput(output)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 2000)
    } catch {
      setError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (error && !session) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-red-300">{error}</p>
        <Link to="/history" className="mt-4 inline-block text-sm text-indigo-400">
          Back to history
        </Link>
      </div>
    )
  }

  if (!session) {
    return <p className="text-slate-500">Loading session…</p>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/history"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to history
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{titleDisplay}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {session.mode} · {session.status} · {session.word_count} words
          </p>
          {hasOutput && (
            <div className="mt-2">
              <AutosaveIndicator status={autosaveStatus} />
            </div>
          )}
          <div className="mt-3">
            <AiStatusPanel
              mode={session.mode}
              status={aiStatus}
              provider={aiProvider}
              truncated={aiTruncated}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!hasOutput && (
            <button
              type="button"
              onClick={handleProcess}
              disabled={processing || session.word_count < 50}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {processing ? 'Processing…' : 'Generate with AI'}
            </button>
          )}
          {hasOutput && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/50 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saveOk ? 'Saved' : 'Save edits'}
            </button>
          )}
          {hasOutput && (
            <button
              type="button"
              onClick={handleProcess}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-surface-border)] px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Regenerate
            </button>
          )}
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      {session.mode === 'interview' && (
        <InterviewOptionsPanel value={interviewOptions} onChange={setInterviewOptions} />
      )}

      {session.word_count < 50 && !hasOutput && (
        <p className="text-sm text-amber-200/90">
          Add at least 50 words to the transcript before generating AI output.
        </p>
      )}

      {hasOutput && output && (
        <Card className="sticky top-0 z-10 border-indigo-500/30 bg-[var(--color-surface-elevated)]/95">
          <p className="mb-3 text-xs text-slate-400">Export your edited output</p>
          <ExportBar mode={session.mode} title={session.title} data={output} />
        </Card>
      )}

      {hasOutput && output && session.mode === 'meeting' && (
        <MeetingOutputEditor
          data={output as MeetingMinutesOutput}
          onChange={setOutput as (d: MeetingMinutesOutput) => void}
        />
      )}

      {hasOutput && output && session.mode === 'interview' && (
        <InterviewOutputEditor
          data={output as InterviewFeedbackOutput}
          onChange={setOutput as (d: InterviewFeedbackOutput) => void}
        />
      )}

      {!hasOutput && (
        <Card>
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-sm font-medium text-indigo-300"
          >
            {showTranscript ? 'Hide' : 'Show'} transcript
          </button>
          {showTranscript && (
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-sm text-slate-300">
              {session.transcript_text || '(empty)'}
            </pre>
          )}
        </Card>
      )}

      {id && (
        <FloatingSessionChat
          sessionId={id}
          mode={session.mode}
          enabled={hasOutput}
          sessionTitle={session.title}
        />
      )}
    </div>
  )
}
