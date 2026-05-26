import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronRight,
  Cloud,
  FileText,
  FlaskConical,
  Folder,
  Link2,
  Loader2,
  Unlink,
} from 'lucide-react'
import { AiStatusPanel, saveAiMeta } from '@/components/output/AiStatusBadge'
import { Card } from '@/components/ui/Card'
import { useApi } from '@/hooks/useApi'
import {
  browseOneDriveFolder,
  disconnectMicrosoft,
  getMicrosoftAuthUrl,
  getMicrosoftStatus,
  getApiErrorMessage,
  importOneDriveFile,
  processSession,
  type InterviewProcessOptions,
  type OneDriveBrowseItem,
} from '@/lib/api'
import { cn } from '@/lib/utils'

type FolderStackItem = { id: string; name: string }

const MOCK_RECORDINGS_FOLDER_ID = 'mock-recordings'

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
  const [items, setItems] = useState<OneDriveBrowseItem[]>([])
  const [folderStack, setFolderStack] = useState<FolderStackItem[]>([
    { id: 'root', name: 'OneDrive' },
  ])
  const [integrationMode, setIntegrationMode] = useState('mock')
  const [msConnected, setMsConnected] = useState(false)
  const [azureConfigured, setAzureConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const currentFolder = folderStack[folderStack.length - 1]

  const loadFolder = useCallback(
    async (folderId: string) => {
      setLoading(true)
      setError(null)
      try {
        const [status, browse] = await Promise.all([
          getMicrosoftStatus(api),
          browseOneDriveFolder(api, folderId),
        ])
        setMsConnected(status.connected)
        setAzureConfigured(status.azure_configured)
        setIntegrationMode(browse.integration_mode)
        setItems(browse.items)
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Could not load OneDrive folder.'))
      } finally {
        setLoading(false)
      }
    },
    [api],
  )

  useEffect(() => {
    loadFolder(currentFolder.id)
  }, [loadFolder, currentFolder.id])

  useEffect(() => {
    const teams = searchParams.get('teams')
    if (teams === 'connected') {
      setNotice('Microsoft account connected. Browse your OneDrive for .txt or .vtt files.')
      setSearchParams({}, { replace: true })
      loadFolder(currentFolder.id)
    }
    if (teams === 'error') {
      setError('Microsoft sign-in failed or was cancelled.')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, loadFolder, currentFolder.id])

  function openFolder(item: OneDriveBrowseItem) {
    setFolderStack((prev) => [...prev, { id: item.id, name: item.name }])
  }

  function navigateToFolder(index: number) {
    setFolderStack((prev) => prev.slice(0, index + 1))
  }

  function openRecordingsShortcut() {
    setFolderStack([
      { id: 'root', name: 'OneDrive' },
      {
        id: integrationMode === 'live' ? 'recordings' : MOCK_RECORDINGS_FOLDER_ID,
        name: 'Recordings',
      },
    ])
  }

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
        getApiErrorMessage(err, 'Connect is not available. Use demo folders below.'),
      )
    }
  }

  async function handleDisconnect() {
    await disconnectMicrosoft(api)
    setMsConnected(false)
    setNotice('Microsoft account disconnected.')
    setFolderStack([{ id: 'root', name: 'OneDrive' }])
  }

  async function handleImport(item: OneDriveBrowseItem) {
    setImportingId(item.id)
    setError(null)
    try {
      const source = integrationMode === 'live' ? 'onedrive' : 'mock'
      const { session } = await importOneDriveFile(api, {
        item_id: item.id,
        source,
        mode,
        title: item.name.replace(/\.[^.]+$/, ''),
        file_name: item.name,
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
              <Cloud className="h-3.5 w-3.5" /> Live — OneDrive
            </>
          ) : (
            <>
              <FlaskConical className="h-3.5 w-3.5" /> Demo — sample folders
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
          Azure app not configured on the server — demo folders are shown. Production uses
          Microsoft Graph to browse your personal OneDrive for <strong>.txt</strong> and{' '}
          <strong>.vtt</strong> files.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-400">
          {folderStack.map((folder, index) => (
            <span key={folder.id} className="inline-flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
              <button
                type="button"
                onClick={() => navigateToFolder(index)}
                className={cn(
                  'hover:text-white',
                  index === folderStack.length - 1 && 'font-medium text-white',
                )}
              >
                {folder.name}
              </button>
            </span>
          ))}
        </nav>
        {currentFolder.id === 'root' && !msConnected && (
          <button
            type="button"
            onClick={openRecordingsShortcut}
            className="rounded-md border border-[var(--color-surface-border)] px-2 py-1 text-xs text-slate-300 hover:text-white"
          >
            Recordings shortcut
          </button>
        )}
      </div>

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

      {loading && <p className="text-sm text-slate-500">Loading folder…</p>}

      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-start gap-2">
              {item.kind === 'folder' ? (
                <Folder className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              ) : (
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{item.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.kind === 'folder'
                    ? 'Folder'
                    : `${item.extension || 'file'}${item.modified_at ? ` · ${new Date(item.modified_at).toLocaleString()}` : ''}`}
                </p>
              </div>
            </div>
            {item.kind === 'folder' ? (
              <button
                type="button"
                disabled={Boolean(importingId)}
                onClick={() => openFolder(item)}
                className="shrink-0 rounded-lg border border-[var(--color-surface-border)] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white disabled:opacity-50"
              >
                Open
              </button>
            ) : (
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
            )}
          </Card>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-sm text-slate-500">
            No folders or transcript files (.txt, .vtt) in this folder.
          </p>
        )}
      </div>
    </div>
  )
}
