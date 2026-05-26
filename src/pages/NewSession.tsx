import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Upload } from 'lucide-react'
import { FadeIn } from '@/components/ui/FadeIn'
import { AiStatusPanel, saveAiMeta, type AiRunStatus } from '@/components/output/AiStatusBadge'
import { TeamsImportPanel } from '@/components/teams/TeamsImportPanel'
import { Card } from '@/components/ui/Card'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { useApi } from '@/hooks/useApi'
import {
  InterviewOptionsPanel,
  defaultInterviewOptions,
} from '@/components/interview/InterviewOptionsPanel'
import {
  createSession,
  getApiErrorMessage,
  processSession,
  type InterviewProcessOptions,
  uploadTranscriptFile,
} from '@/lib/api'
import { getOAuthMessage } from '@/lib/messages'
import { cn } from '@/lib/utils'

type InputTab = 'paste' | 'upload' | 'teams'

export function NewSession() {
  const [params, setParams] = useSearchParams()
  const initialMode = params.get('mode') === 'interview' ? 'interview' : 'meeting'
  const [mode, setMode] = useState<'meeting' | 'interview'>(initialMode)
  const [tab, setTab] = useState<InputTab>(() =>
    params.get('teams') ? 'teams' : 'paste',
  )
  const [teamsNotice, setTeamsNotice] = useState<string | null>(null)
  const [teamsError, setTeamsError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<AiRunStatus>('idle')
  const [runAi, setRunAi] = useState(true)
  const [interviewOptions, setInterviewOptions] = useState<InterviewProcessOptions>(
    defaultInterviewOptions,
  )
  const api = useApi()
  const navigate = useNavigate()

  useEffect(() => {
    const teams = params.get('teams')
    const message = params.get('message')
    if (teams === 'connected') {
      setTab('teams')
      setTeamsNotice(getOAuthMessage(message, 'connected'))
      setTeamsError(null)
      setParams({}, { replace: true })
    }
    if (teams === 'error') {
      setTab('teams')
      setTeamsError(getOAuthMessage(message, 'error'))
      setTeamsNotice(null)
      setParams({}, { replace: true })
    }
  }, [params, setParams])

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0
  const canSubmit = wordCount >= 50

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setAiStatus(runAi ? 'processing' : 'idle')
    setError(null)
    try {
      const session = await uploadTranscriptFile(api, file, mode, title.trim() || undefined)
      if (runAi) {
        const result = await processSession(
          api,
          session.id,
          mode === 'interview' ? interviewOptions : null,
        )
        saveAiMeta(session.id, {
          provider: result.provider,
          truncated: result.truncated,
          completedAt: new Date().toISOString(),
        })
      }
      navigate(`/session/${session.id}`)
    } catch (err: unknown) {
      setAiStatus('error')
      setError(getApiErrorMessage(err, 'Upload failed.'))
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setAiStatus(runAi ? 'processing' : 'idle')
    setError(null)
    try {
      const session = await createSession(api, {
        title: title.trim() || undefined,
        mode,
        source: 'paste',
        transcript_text: transcript.trim(),
      })
      if (runAi) {
        const result = await processSession(
          api,
          session.id,
          mode === 'interview' ? interviewOptions : null,
        )
        saveAiMeta(session.id, {
          provider: result.provider,
          truncated: result.truncated,
          completedAt: new Date().toISOString(),
        })
      }
      navigate(`/session/${session.id}`)
    } catch (err: unknown) {
      setAiStatus('error')
      setError(
        getApiErrorMessage(
          err,
          'Failed to create session. Check API and database connection.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-bold text-white">New session</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Import from Teams / OneDrive, upload a file, or paste a transcript.
        </p>
      </FadeIn>

      <FadeIn delay={0.08}>
      <Card>
        <div className="space-y-5">
          <div className="flex gap-2 rounded-lg bg-black/30 p-1">
            {(['meeting', 'interview'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors',
                  mode === m
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white',
                )}
              >
                {m === 'meeting' ? 'Meeting minutes' : 'Interview feedback'}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">Title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              placeholder="e.g. Sprint planning — May 23"
            />
          </div>

          <div className="flex gap-1 border-b border-[var(--color-surface-border)]">
            {(
              [
                ['teams', 'Teams / OneDrive'],
                ['paste', 'Paste'],
                ['upload', 'Upload'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'px-3 py-2 text-sm font-medium',
                  tab === key
                    ? 'border-b-2 border-indigo-500 text-white'
                    : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'interview' && (
            <InterviewOptionsPanel value={interviewOptions} onChange={setInterviewOptions} />
          )}

          {tab === 'teams' && (
            <TeamsImportPanel
              mode={mode}
              runAi={runAi}
              interviewOptions={mode === 'interview' ? interviewOptions : undefined}
              initialNotice={teamsNotice}
              initialError={teamsError}
            />
          )}

          {tab === 'upload' && (
            <div className="space-y-4">
              {runAi && (loading || aiStatus !== 'idle') ? (
                <AiStatusPanel
                  mode={mode}
                  status={loading ? 'processing' : aiStatus}
                />
              ) : loading ? (
                <div className="flex items-center gap-2 rounded-lg border border-[var(--color-surface-border)] bg-black/20 px-4 py-3 text-sm text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  Uploading transcript…
                </div>
              ) : (
                <label
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-surface-border)] bg-black/20 px-4 py-8 text-sm text-slate-400 hover:border-indigo-500/50"
                >
                  <Upload className="h-4 w-4" />
                  Choose .txt transcript file
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
            </div>
          )}

          {tab === 'paste' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={12}
                  className="w-full resize-y rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                  placeholder="Paste your meeting or interview transcript here…"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {wordCount} words {wordCount < 50 && '(minimum 50 required)'}
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={runAi}
                  onChange={(e) => setRunAi(e.target.checked)}
                  className="rounded border-slate-600 bg-black/30 text-indigo-600"
                />
                Generate AI output immediately after saving
              </label>

              {runAi && (loading || aiStatus !== 'idle') && (
                <AiStatusPanel mode={mode} status={loading ? 'processing' : aiStatus} />
              )}

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading && !runAi && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading && runAi ? 'Generating…' : runAi ? 'Save & generate' : 'Save draft'}
              </button>
            </form>
          )}

          {tab !== 'paste' && (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={runAi}
                disabled={loading}
                onChange={(e) => setRunAi(e.target.checked)}
                className="rounded border-slate-600 bg-black/30 text-indigo-600 disabled:opacity-50"
              />
              Generate AI output after import
            </label>
          )}

          {error && tab !== 'teams' && <InlineAlert variant="error">{error}</InlineAlert>}
        </div>
      </Card>
      </FadeIn>
    </div>
  )
}
