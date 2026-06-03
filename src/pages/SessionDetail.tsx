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
import { InlineAlert } from '@/components/ui/InlineAlert'
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
import { normalizeInterviewOutput, normalizeMeetingOutput } from '@/lib/normalizeOutput'
import type { InterviewFeedbackOutput, MeetingMinutesOutput } from '@/lib/types'

type SessionOutput = MeetingMinutesOutput | InterviewFeedbackOutput

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

function normalizeOutputForMode(
  mode: 'meeting' | 'interview',
  data: SessionOutput,
): SessionOutput {
  return mode === 'interview'
    ? normalizeInterviewOutput(data as InterviewFeedbackOutput)
    : normalizeMeetingOutput(data as MeetingMinutesOutput)
}

function readOutputFromRecord(
  mode: 'meeting' | 'interview',
  raw: Record<string, unknown> | null | undefined,
): SessionOutput | null {
  if (!raw) return null
  return normalizeOutputForMode(
    mode,
    mode === 'interview'
      ? ({
          ...emptyInterview(),
          ...(raw as unknown as InterviewFeedbackOutput),
        } as InterviewFeedbackOutput)
      : ({
          ...emptyMeeting(),
          ...(raw as unknown as MeetingMinutesOutput),
        } as MeetingMinutesOutput),
  )
}

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
  const [persistedOutputSerialized, setPersistedOutputSerialized] = useState<string | null>(null)
  const outputRef = useRef<SessionOutput | null>(null)
  const sessionRef = useRef<SessionWithOutput | null>(null)
  const processingRef = useRef(false)
  const saveChainRef = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    outputRef.current = output
  }, [output])

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const load = useCallback(async (sessionId: string, isActive: () => boolean) => {
    const data = await fetchSessionFull(api, sessionId)
    if (!isActive()) return
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
    const raw = data.output?.edited_json ?? data.output?.ai_json
    const serverOutput = readOutputFromRecord(data.mode, raw)
    const serverSerialized = serverOutput ? JSON.stringify(serverOutput) : null
    const baseUpdatedAt = data.output?.updated_at ?? data.updated_at ?? null
    const draft = loadDraftBackup<SessionOutput>(sessionId, baseUpdatedAt)
    setPersistedOutputSerialized(serverSerialized)

    if (draft && data.status === 'ready') {
      setOutput(normalizeOutputForMode(data.mode, draft))
    } else if (serverOutput) {
      setOutput(serverOutput)
    } else {
      setOutput(null)
    }

    if (data.status === 'processing') {
      setAiStatus('processing')
    } else if (data.status === 'ready' && data.output) {
      const meta = loadAiMeta(sessionId)
      setAiStatus('done')
      setAiProvider(meta?.provider ?? null)
      setAiTruncated(meta?.truncated ?? false)
    } else if (data.status === 'error') {
      setAiStatus('error')
    } else {
      setAiStatus('idle')
    }
  }, [api])

  useEffect(() => {
    if (!id) return
    let active = true
    setSession(null)
    setOutput(null)
    setPersistedOutputSerialized(null)
    setError(null)
    load(id, () => active).catch((err: unknown) => {
      if (active) {
        setError(getApiErrorMessage(err, 'Session not found or could not be loaded.'))
      }
    })
    return () => {
      active = false
    }
  }, [id, load])

  const isCurrentSession = Boolean(id && session?.id === id)
  const hasOutput = isCurrentSession && output !== null && session?.status === 'ready'
  const outputSerialized = useMemo(() => (output ? JSON.stringify(output) : null), [output])
  const outputBaseUpdatedAt = session?.output?.updated_at ?? session?.updated_at ?? null
  const hasUnsavedLocalOutput =
    Boolean(hasOutput && outputSerialized) && outputSerialized !== persistedOutputSerialized

  const queueOutputSave = useCallback(
    (
      sessionId: string,
      mode: 'meeting' | 'interview',
      data: SessionOutput,
      options?: { allowDuringProcessing?: boolean; forceClearDraft?: boolean },
    ) => {
      const normalized = normalizeOutputForMode(mode, data)
      const serializedToSave = JSON.stringify(normalized)
      const write = async () => {
        if (sessionRef.current?.id !== sessionId) return
        if (!options?.allowDuringProcessing && processingRef.current) return

        const saved = await updateSessionOutput(
          api,
          sessionId,
          normalized as unknown as Record<string, unknown>,
        )
        setSession((current) =>
          current?.id === sessionId ? { ...current, output: saved } : current,
        )
        setPersistedOutputSerialized(serializedToSave)

        const currentOutput = outputRef.current
        const currentSerialized = currentOutput
          ? JSON.stringify(normalizeOutputForMode(mode, currentOutput))
          : null
        if (options?.forceClearDraft || currentSerialized === serializedToSave) {
          clearDraftBackup(sessionId)
        }
      }

      const next = saveChainRef.current.catch(() => undefined).then(write)
      saveChainRef.current = next.catch(() => undefined)
      return next
    },
    [api],
  )

  const saveOutput = useCallback(
    async (data: SessionOutput) => {
      if (!id) return
      const current = sessionRef.current
      if (!current || current.id !== id || processingRef.current) return
      await queueOutputSave(id, current.mode, data)
    },
    [id, queueOutputSave],
  )

  const autosaveStatus = useAutosave(
    output as SessionOutput,
    saveOutput,
    Boolean(hasOutput && output && !processing),
  )

  useDraftBackup(
    id,
    output,
    Boolean(hasUnsavedLocalOutput && output && !processing),
    outputBaseUpdatedAt,
  )

  const titleDisplay = useMemo(() => session?.title ?? '', [session?.title])

  async function handleProcess() {
    if (!id || !session || !isCurrentSession) return
    const sessionId = id
    const mode = session.mode
    processingRef.current = true
    setProcessing(true)
    setAiStatus('processing')
    setAiProvider(null)
    setError(null)
    try {
      await saveChainRef.current.catch(() => undefined)
      const result = await processSession(
        api,
        sessionId,
        mode === 'interview' ? interviewOptions : null,
      )
      if (sessionRef.current?.id !== sessionId) return
      setSession({ ...session, ...result.session, output: result.output })
      setAiStatus('done')
      setAiProvider(result.provider)
      setAiTruncated(result.truncated)
      saveAiMeta(sessionId, {
        provider: result.provider,
        truncated: result.truncated,
        completedAt: new Date().toISOString(),
      })
      const resultMode = result.session.mode
      const raw = result.output.ai_json ?? result.output.edited_json
      const generatedOutput =
        readOutputFromRecord(resultMode, raw) ??
        (resultMode === 'interview' ? emptyInterview() : emptyMeeting())
      setOutput(generatedOutput)
      await queueOutputSave(sessionId, resultMode, generatedOutput, {
        allowDuringProcessing: true,
        forceClearDraft: true,
      })
    } catch (err: unknown) {
      setAiStatus('error')
      setError(getApiErrorMessage(err, 'AI processing failed. Try again in a moment.'))
    } finally {
      processingRef.current = false
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
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not save changes.'))
    } finally {
      setSaving(false)
    }
  }

  if (error && !session) {
    return (
      <div className="mx-auto max-w-3xl">
        <InlineAlert variant="error">{error}</InlineAlert>
        <Link to="/history" className="mt-4 inline-block text-sm text-indigo-400">
          Back to history
        </Link>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="h-64 animate-pulse rounded-xl bg-white/5" />
        <p className="text-center text-sm text-slate-500">Loading session…</p>
      </div>
    )
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
          {(processing || aiStatus !== 'idle') && (
            <div className="mt-3">
              <AiStatusPanel
                mode={session.mode}
                status={processing ? 'processing' : aiStatus}
                provider={aiProvider}
                truncated={aiTruncated}
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!hasOutput && (
            <button
              type="button"
              onClick={handleProcess}
              disabled={processing || session.word_count < 50}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {!processing && <Sparkles className="h-4 w-4" />}
              {processing ? 'Processing…' : 'Generate with AI'}
            </button>
          )}
          {hasOutput && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || processing}
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

      <InlineAlert variant="error">{error}</InlineAlert>

      {session.mode === 'interview' && !processing && (
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
