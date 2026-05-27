import { useEffect } from 'react'

const PREFIX = 'meetingfeed-draft:'
const DRAFT_MARKER = 'meetingfeed-output-draft'
const DRAFT_VERSION = 1

interface DraftEnvelope<T> {
  marker: typeof DRAFT_MARKER
  version: typeof DRAFT_VERSION
  savedAt: string
  serverUpdatedAt?: string | null
  payload: T
}

export interface DraftBackup<T> {
  payload: T
  savedAt: string | null
  serverUpdatedAt?: string | null
  legacy: boolean
}

export function useDraftBackup(
  sessionId: string | undefined,
  data: unknown,
  enabled: boolean,
  serverUpdatedAt?: string | null,
) {
  const serializedPayload = JSON.stringify(data)

  useEffect(() => {
    if (!sessionId || !enabled) return
    try {
      const serialized = JSON.stringify({
        marker: DRAFT_MARKER,
        version: DRAFT_VERSION,
        savedAt: new Date().toISOString(),
        serverUpdatedAt,
        payload: JSON.parse(serializedPayload),
      })
      sessionStorage.setItem(`${PREFIX}${sessionId}`, serialized)
    } catch {
      /* quota */
    }
  }, [sessionId, serializedPayload, enabled, serverUpdatedAt])
}

function isDraftEnvelope<T>(value: unknown): value is DraftEnvelope<T> {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    (value as { marker?: unknown }).marker === DRAFT_MARKER &&
    (value as { version?: unknown }).version === DRAFT_VERSION &&
    'payload' in value
  )
}

export function loadDraftBackup<T>(sessionId: string): DraftBackup<T> | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${sessionId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (isDraftEnvelope<T>(parsed)) {
      return {
        payload: parsed.payload,
        savedAt: parsed.savedAt,
        serverUpdatedAt: parsed.serverUpdatedAt,
        legacy: false,
      }
    }
    return { payload: parsed as T, savedAt: null, legacy: true }
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
