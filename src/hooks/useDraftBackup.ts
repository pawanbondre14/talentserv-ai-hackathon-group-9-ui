import { useEffect } from 'react'

const PREFIX = 'meetingfeed-draft:'
const VERSION = 1

interface DraftBackup<T> {
  version: typeof VERSION
  baseUpdatedAt: string | null
  data: T
}

function storageKey(sessionId: string) {
  return `${PREFIX}${sessionId}`
}

export function useDraftBackup(
  sessionId: string | undefined,
  data: unknown,
  enabled: boolean,
  baseUpdatedAt: string | null,
) {
  const serialized = JSON.stringify({
    version: VERSION,
    baseUpdatedAt,
    data,
  } satisfies DraftBackup<unknown>)

  useEffect(() => {
    if (!sessionId || !enabled) return
    try {
      sessionStorage.setItem(storageKey(sessionId), serialized)
    } catch {
      /* quota */
    }
  }, [sessionId, serialized, enabled])
}

export function loadDraftBackup<T>(sessionId: string, baseUpdatedAt: string | null): T | null {
  try {
    const key = storageKey(sessionId)
    const raw = sessionStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<DraftBackup<T>>
    if (
      parsed.version !== VERSION ||
      !('data' in parsed) ||
      parsed.baseUpdatedAt !== baseUpdatedAt
    ) {
      sessionStorage.removeItem(key)
      return null
    }

    return parsed.data ?? null
  } catch {
    return null
  }
}

export function clearDraftBackup(sessionId: string) {
  try {
    sessionStorage.removeItem(storageKey(sessionId))
  } catch {
    /* ignore */
  }
}
