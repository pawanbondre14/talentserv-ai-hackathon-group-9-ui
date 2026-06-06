import { useEffect, useMemo } from 'react'

const PREFIX = 'meetingfeed-draft:'

export interface DraftBackup<T> {
  payload: T
  savedAt: string
}

function isDraftBackup<T>(value: unknown): value is DraftBackup<T> {
  return (
    value !== null &&
    typeof value === 'object' &&
    'payload' in value &&
    'savedAt' in value &&
    typeof (value as { savedAt?: unknown }).savedAt === 'string'
  )
}

export function isDraftNewerThanServer<T>(
  draft: DraftBackup<T> | null,
  serverUpdatedAt?: string | null,
) {
  if (!draft) return false
  if (!serverUpdatedAt) return true

  const draftTime = Date.parse(draft.savedAt)
  const serverTime = Date.parse(serverUpdatedAt)
  if (Number.isNaN(draftTime)) return false
  if (Number.isNaN(serverTime)) return true
  return draftTime > serverTime
}

export function useDraftBackup(sessionId: string | undefined, data: unknown, enabled: boolean) {
  const payloadSerialized = JSON.stringify(data) ?? 'null'
  const draftSerialized = useMemo(
    () =>
      JSON.stringify({
        payload: JSON.parse(payloadSerialized) as unknown,
        savedAt: new Date().toISOString(),
      }),
    [payloadSerialized],
  )

  useEffect(() => {
    if (!sessionId || !enabled) return
    try {
      sessionStorage.setItem(`${PREFIX}${sessionId}`, draftSerialized)
    } catch {
      /* quota */
    }
  }, [sessionId, draftSerialized, enabled])
}

export function loadDraftBackup<T>(sessionId: string): DraftBackup<T> | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${sessionId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (isDraftBackup<T>(parsed)) return parsed

    // Older builds stored the payload directly. Treat it as an untimed draft so
    // it can still recover sessions that do not have server output yet.
    return {
      payload: parsed as T,
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
