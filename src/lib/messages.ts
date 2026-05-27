export type AlertVariant = 'error' | 'success' | 'warning'

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Microsoft sign-in was cancelled. Try Connect again when you are ready.',
  consent_required:
    'Microsoft needs permission to read your files. Connect again and accept the requested permissions.',
  oauth_failed: 'Microsoft sign-in failed. Try Connect again.',
  token_exchange_failed:
    'Microsoft sign-in could not be completed. Check Azure app settings and try again.',
  invalid_state: 'Sign-in session expired. Connect Microsoft again from the app.',
  user_not_found: 'Sign in to MeetPilot first, then connect your Microsoft account.',
  unknown: 'Microsoft sign-in failed. Try Connect again.',
  connected: 'Microsoft account connected. Browse your OneDrive for .txt or .vtt files.',
}

export function getOAuthMessage(code: string | null, status: 'connected' | 'error'): string {
  if (status === 'connected') {
    return OAUTH_ERROR_MESSAGES.connected
  }
  const key = (code || 'unknown').toLowerCase()
  return OAUTH_ERROR_MESSAGES[key] ?? OAUTH_ERROR_MESSAGES.unknown
}

export function parseApiDetail(detail: unknown): string | null {
  if (!detail) return null
  if (typeof detail === 'string') return detail
  if (typeof detail === 'object' && detail !== null && 'message' in detail) {
    const msg = (detail as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg)
        }
        return null
      })
      .filter(Boolean)
    return parts.length ? parts.join(' ') : null
  }
  return null
}

export function getStatusFallback(status: number | undefined, fallback: string): string {
  if (status === 401) return 'Your session expired. Please sign in again.'
  if (status === 403) return 'You do not have permission to perform this action.'
  if (status === 404) return 'The requested item was not found.'
  if (status === 413) return 'The file is too large to upload.'
  if (status === 422) return 'The submitted data could not be processed.'
  if (status === 502 || status === 503) return 'The server is temporarily unavailable. Try again shortly.'
  if (status === 0 || status === undefined) return 'Network error. Check your connection and try again.'
  return fallback
}
