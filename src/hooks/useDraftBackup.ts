import { useEffect } from 'react'

const PREFIX = 'meetingfeed-draft:'
const DRAFT_MARKER = 'meetingfeed-draft-v1'

type DraftBackupEnvelope<T> = {
  marker: typeof DRAFT_MARKER
  data: T
  serverVersion: string | null
  savedAt: string
}

function isDraftBackupEnvelope<T>(value: unknown): value is DraftBackupEnvelope<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'marker' in value &&
    (value as { marker?: unknown }).marker === DRAFT_MARKER &&
    'data' in value
  )
}

export function useDraftBackup(
  sessionId: string | undefined,
  data: unknown,
  enabled: boolean,
  serverVersion?: string | null,
) {
  const serialized = JSON.stringify(data) ?? 'null'

  useEffect(() => {
    if (!sessionId || !enabled) return
    try {
      const draft: DraftBackupEnvelope<unknown> = {
        marker: DRAFT_MARKER,
        data: JSON.parse(serialized) as unknown,
        serverVersion: serverVersion ?? null,
        savedAt: new Date().toISOString(),
      }
      sessionStorage.setItem(`${PREFIX}${sessionId}`, JSON.stringify(draft))
    } catch {
      /* quota */
    }
  }, [sessionId, serialized, enabled, serverVersion])
}

export function loadDraftBackup<T>(sessionId: string, serverVersion?: string | null): T | null {
  try {
    const key = `${PREFIX}${sessionId}`
    const raw = sessionStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    const hasServerVersion = arguments.length >= 2

    if (isDraftBackupEnvelope<T>(parsed)) {
      const currentServerVersion = serverVersion ?? null
      if (hasServerVersion && parsed.serverVersion !== currentServerVersion) {
        sessionStorage.removeItem(key)
        return null
      }
      return parsed.data
    }

    if (hasServerVersion) {
      sessionStorage.removeItem(key)
      return null
    }
    return parsed as T
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
