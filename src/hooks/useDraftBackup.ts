import { useEffect } from 'react'

const PREFIX = 'meetingfeed-draft:'
const VERSION = 1

export interface DraftBackup<T> {
  data: T
  baseOutputUpdatedAt: string | null
  savedAt: string
}

interface DraftBackupEnvelope<T> extends DraftBackup<T> {
  version: typeof VERSION
}

function isDraftBackupEnvelope<T>(value: unknown): value is DraftBackupEnvelope<T> {
  return (
    value !== null &&
    typeof value === 'object' &&
    (value as { version?: unknown }).version === VERSION &&
    'data' in value
  )
}

export function useDraftBackup(
  sessionId: string | undefined,
  data: unknown,
  enabled: boolean,
  baseOutputUpdatedAt: string | null = null,
) {
  const serialized = JSON.stringify({
    version: VERSION,
    data,
    baseOutputUpdatedAt,
    savedAt: new Date().toISOString(),
  } satisfies DraftBackupEnvelope<unknown>)

  useEffect(() => {
    if (!sessionId || !enabled) return
    try {
      sessionStorage.setItem(`${PREFIX}${sessionId}`, serialized)
    } catch {
      /* quota */
    }
  }, [sessionId, serialized, enabled])
}

export function loadDraftBackup<T>(sessionId: string): DraftBackup<T> | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${sessionId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (isDraftBackupEnvelope<T>(parsed)) {
      return parsed
    }
    return {
      data: parsed as T,
      baseOutputUpdatedAt: null,
      savedAt: '',
    }
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
