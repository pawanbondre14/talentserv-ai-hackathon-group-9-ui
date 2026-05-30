import { useEffect } from 'react'

const PREFIX = 'meetingfeed-draft:'
const DRAFT_VERSION = 1

export interface DraftBackup<T> {
  value: T
  serverUpdatedAt: string | null
  legacy: boolean
}

export function useDraftBackup(
  sessionId: string | undefined,
  data: unknown,
  enabled: boolean,
  serverUpdatedAt?: string | null,
) {
  const serialized = JSON.stringify(data)

  useEffect(() => {
    if (!sessionId || !enabled || serialized === undefined) return
    try {
      sessionStorage.setItem(
        `${PREFIX}${sessionId}`,
        JSON.stringify({
          version: DRAFT_VERSION,
          value: JSON.parse(serialized),
          serverUpdatedAt: serverUpdatedAt ?? null,
          savedAt: new Date().toISOString(),
        }),
      )
    } catch {
      /* quota */
    }
  }, [sessionId, serialized, enabled, serverUpdatedAt])
}

export function loadDraftBackup<T>(sessionId: string): DraftBackup<T> | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${sessionId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object') {
      const draft = parsed as Record<string, unknown>
      if (draft.version === DRAFT_VERSION && 'value' in draft) {
        return {
          value: draft.value as T,
          serverUpdatedAt:
            typeof draft.serverUpdatedAt === 'string' ? draft.serverUpdatedAt : null,
          legacy: false,
        }
      }
    }
    return { value: parsed as T, serverUpdatedAt: null, legacy: true }
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
