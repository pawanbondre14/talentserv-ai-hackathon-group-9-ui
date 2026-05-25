import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Cloud, FlaskConical, Link2, Loader2, Unlink } from 'lucide-react'
import { AiStatusPanel, saveAiMeta } from '@/components/output/AiStatusBadge'
import { Card } from '@/components/ui/Card'
import { useApi } from '@/hooks/useApi'
import {
  disconnectMicrosoft,
  fetchTeamsTranscripts,
  getMicrosoftAuthUrl,
  getMicrosoftStatus,
  getApiErrorMessage,
  importTeamsTranscript,
  processSession,
  type InterviewProcessOptions,
  type TeamsTranscriptListItem,
} from '@/lib/api'
import { cn } from '@/lib/utils'

export function TeamsImportPanel({
  mode,
  runAi,
  interviewOptions,
}: {
  mode: 'meeting' | 'interview'
  runAi: boolean
  interviewOptions?: InterviewProcessOptions
}) {
  const api = useApi()
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<TeamsTranscriptListItem[]>([])
  const [integrationMode, setIntegrationMode] = useState('mock')
  const [msConnected, setMsConnected] = useState(false)
  const [azureConfigured, setAzureConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [status, transcripts] = await Promise.all([
        getMicrosoftStatus(api),
        fetchTeamsTranscripts(api),
      ])
      setMsConnected(status.connected)
      setAzureConfigured(status.azure_configured)
      setIntegrationMode(transcripts.integration_mode)
      setItems(transcripts.items)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not load Teams transcripts.'))
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const teams = searchParams.get('teams')
    if (teams === 'connected') {
      setNotice('Microsoft account connected. You can import from OneDrive Recordings.')
      setSearchParams({}, { replace: true })
      load()
    }
    if (teams === 'error') {
      setError('Microsoft sign-in failed or was cancelled.')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, load])

  async function handleConnect() {
    setError(null)
    if (!isLoaded) return
    if (!isSignedIn) {
      setError('Sign in to MeetPilot AI first, then connect Microsoft.')
      navigate('/sign-in')
      return
    }
    try {
      const { url } = await getMicrosoftAuthUrl(api)
      window.location.href = url
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(err, 'Connect is not available. Use demo meetings below.'),
      )
    }
  }

  async function handleDisconnect() {
    await disconnectMicrosoft(api)
    setMsConnected(false)
    setNotice('Microsoft account disconnected.')
    load()
  }

  async function handleImport(item: TeamsTranscriptListItem) {
    setImportingId(item.id)
    setError(null)
    try {
      const source = item.source === 'onedrive' ? 'onedrive' : 'mock'
      const { session } = await importTeamsTranscript(api, {
        meeting_id: item.id,
        source,
        mode,
        title: item.title,
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
      setError(getApiErrorMessage(err, 'Import failed.'))
    } finally {
      setImportingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            integrationMode === 'live'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-violet-500/20 text-violet-300',
          )}
        >
          {integrationMode === 'live' ? (
            <>
              <Cloud className="h-3.5 w-3.5" /> Live — OneDrive / Teams
            </>
          ) : (
            <>
              <FlaskConical className="h-3.5 w-3.5" /> Demo — sample meetings
            </>
          )}
        </span>
        {msConnected && (
          <span className="text-xs text-slate-500">Microsoft account linked</span>
        )}
      </div>

      {azureConfigured && (
        <div className="flex flex-wrap gap-2">
          {!msConnected ? (
            <button
              type="button"
              onClick={handleConnect}
              disabled={!isLoaded || !isSignedIn}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2f2f2f] px-3 py-2 text-sm font-medium text-white hover:bg-[#3d3d3d] disabled:opacity-50"
            >
              <Link2 className="h-4 w-4" />
              Connect Microsoft account
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDisconnect}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-surface-border)] px-3 py-2 text-sm text-slate-300 hover:text-white"
            >
              <Unlink className="h-4 w-4" />
              Disconnect
            </button>
          )}
        </div>
      )}

      {!azureConfigured && (
        <p className="text-xs text-slate-500">
          Azure app not configured on the server — demo meetings are shown. Production would use
          Microsoft Graph API to read your OneDrive <strong>Recordings</strong> folder.
        </p>
      )}

      {notice && (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{notice}</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      {importingId && runAi && <AiStatusPanel mode={mode} status="processing" />}
      {importingId && !runAi && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-surface-border)] bg-black/20 px-4 py-3 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          Importing transcript…
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Loading meetings…</p>}

      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="font-medium text-white">{item.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {item.source} · {item.file_name || 'transcript'} ·{' '}
                {item.date ? new Date(item.date).toLocaleString() : '—'}
              </p>
            </div>
            <button
              type="button"
              disabled={Boolean(importingId)}
              onClick={() => handleImport(item)}
              className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {importingId === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Import'
              )}
            </button>
          </Card>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-sm text-slate-500">No transcripts found in Recordings folder.</p>
        )}
      </div>
    </div>
  )
}
