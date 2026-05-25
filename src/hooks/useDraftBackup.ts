import { useEffect } from 'react'

const PREFIX = 'meetingfeed-draft:'

export function useDraftBackup(sessionId: string | undefined, data: unknown, enabled: boolean) {
  const serialized = JSON.stringify(data)

  useEffect(() => {
    if (!sessionId || !enabled) return
    try {
      sessionStorage.setItem(`${PREFIX}${sessionId}`, serialized)
    } catch {
      /* quota */
    }
  }, [sessionId, serialized, enabled])
}

export function loadDraftBackup<T>(sessionId: string): T | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${sessionId}`)
    return raw ? (JSON.parse(raw) as T) : null
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
