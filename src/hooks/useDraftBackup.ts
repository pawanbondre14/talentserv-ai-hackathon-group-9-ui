import { useEffect } from 'react'

const PREFIX = 'meetingfeed-draft:'

interface DraftBackupEnvelope<T> {
  version: 1
  data: T
  savedAt: string
  baseUpdatedAt: string | null
}

function isDraftBackupEnvelope<T>(value: unknown): value is DraftBackupEnvelope<T> {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<DraftBackupEnvelope<T>>
  return candidate.version === 1 && typeof candidate.savedAt === 'string' && 'data' in candidate
}

function isNewerThanServer(savedAt: string, serverUpdatedAt: string | null | undefined) {
  if (!serverUpdatedAt) return true
  const savedTime = Date.parse(savedAt)
  const serverTime = Date.parse(serverUpdatedAt)
  if (Number.isNaN(savedTime) || Number.isNaN(serverTime)) return false
  return savedTime > serverTime
}

export function useDraftBackup(
  sessionId: string | undefined,
  data: unknown,
  enabled: boolean,
  baseUpdatedAt?: string | null,
) {
  const serialized = JSON.stringify(data)

  useEffect(() => {
    if (!sessionId || !enabled) return
    try {
      const envelope: DraftBackupEnvelope<unknown> = {
        version: 1,
        data,
        savedAt: new Date().toISOString(),
        baseUpdatedAt: baseUpdatedAt ?? null,
      }
      sessionStorage.setItem(`${PREFIX}${sessionId}`, JSON.stringify(envelope))
    } catch {
      /* quota */
    }
  }, [sessionId, data, serialized, enabled, baseUpdatedAt])
}

export function loadDraftBackup<T>(
  sessionId: string,
  serverUpdatedAt?: string | null,
  hasServerOutput = false,
): T | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${sessionId}`)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    if (isDraftBackupEnvelope<T>(parsed)) {
      if (isNewerThanServer(parsed.savedAt, serverUpdatedAt)) {
        return parsed.data
      }
      clearDraftBackup(sessionId)
      return null
    }

    // Legacy drafts had no timestamp, so only trust them when the server has no output.
    return hasServerOutput ? null : (parsed as T)
  } catch {
    return null
  }
}

export function clearDraftBackup(sessionId: string) {
  try {
    sessionStorage.removeItem(`${PREFIX}${sessionId}`)
  } catch {
    /* ignore */
  }
}
