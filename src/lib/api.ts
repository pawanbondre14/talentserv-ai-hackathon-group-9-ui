import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type GetTokenFn = (options?: { skipCache?: boolean }) => Promise<string | null>

type RetryableConfig = InternalAxiosRequestConfig & { _authRetry?: boolean }

let unauthorizedHandled = false

/** User-facing message; avoids leaking raw backend auth strings in the UI. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isSessionExpiredError(err)) {
    return 'Your session expired. Please sign in again.'
  }
  if (err && typeof err === 'object' && 'response' in err) {
    const status = (err as { response?: { status?: number } }).response?.status
    if (status === 401) {
      return 'Your session expired. Please sign in again.'
    }
    const detail = (err as { response?: { data?: { detail?: string } } }).response?.data
      ?.detail
    if (detail) return String(detail)
  }
  return fallback
}

export function isSessionExpiredError(err: unknown): boolean {
  return err instanceof Error && err.name === 'SessionExpiredError'
}

function sessionExpiredError(): Error {
  const err = new Error('Session expired')
  err.name = 'SessionExpiredError'
  return err
}

export function createApiClient(
  getToken: GetTokenFn,
  onUnauthorized?: () => void,
): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use(async (config) => {
    const token = await getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => {
      unauthorizedHandled = false
      return response
    },
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || !error.config) {
        return Promise.reject(error)
      }

      const status = error.response?.status
      const config = error.config as RetryableConfig

      if (status === 401 && !config._authRetry) {
        const hadAuth = Boolean(config.headers?.Authorization)
        config._authRetry = true
        const token = await getToken({ skipCache: true })
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          return client.request(config)
        }

        if (!hadAuth) {
          return Promise.reject(error)
        }

        if (!unauthorizedHandled) {
          unauthorizedHandled = true
          onUnauthorized?.()
        }
        return Promise.reject(sessionExpiredError())
      }

      return Promise.reject(error)
    },
  )

  return client
}

export interface SessionListItem {
  id: string
  title: string
  mode: 'meeting' | 'interview'
  source: string
  status: string
  word_count: number
  created_at: string
  updated_at: string
  snippet?: string | null
  has_output?: boolean
}

export interface SessionDetail extends SessionListItem {
  transcript_text: string | null
  teams_meeting_id: string | null
}

export interface SessionListResponse {
  items: SessionListItem[]
  total: number
  query: string | null
}

export async function fetchSessions(
  client: AxiosInstance,
  params?: { q?: string; mode?: string; status?: string; offset?: number; limit?: number },
) {
  const { data } = await client.get<SessionListResponse>('/api/sessions', { params })
  return data
}

export async function deleteSession(client: AxiosInstance, sessionId: string) {
  await client.delete(`/api/sessions/${sessionId}`)
}

export async function uploadTranscriptFile(
  client: AxiosInstance,
  file: File,
  mode: 'meeting' | 'interview',
  title?: string,
) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post<SessionDetail>('/api/ingest/upload', form, {
    params: { mode, title },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function createSession(
  client: AxiosInstance,
  body: {
    title?: string
    mode: 'meeting' | 'interview'
    source?: string
    transcript_text?: string
  },
) {
  const { data } = await client.post<SessionDetail>('/api/sessions', body)
  return data
}

export interface OutputRecord {
  id: string
  session_id: string
  ai_json: Record<string, unknown> | null
  edited_json: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface InterviewMeta {
  jd_text: string | null
  scorecard_id: string | null
  blind_mode: boolean
  candidate_name: string | null
  candidate_email: string | null
}

export interface SessionWithOutput extends SessionDetail {
  output: OutputRecord | null
  interview_meta?: InterviewMeta | null
}

export interface ProcessResult {
  session: SessionDetail
  output: OutputRecord
  provider: string
  truncated: boolean
}

export async function fetchSessionFull(client: AxiosInstance, sessionId: string) {
  const { data } = await client.get<SessionWithOutput>(`/api/sessions/${sessionId}/full`)
  return data
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatListResponse {
  items: ChatMessage[]
  total: number
}

export interface ChatSendResponse {
  user_message: ChatMessage
  assistant_message: ChatMessage
  provider: string
}

export async function fetchSessionChat(client: AxiosInstance, sessionId: string) {
  const { data } = await client.get<ChatListResponse>(`/api/sessions/${sessionId}/chat`)
  return data
}

export async function sendSessionChat(
  client: AxiosInstance,
  sessionId: string,
  content: string,
) {
  const { data } = await client.post<ChatSendResponse>(`/api/sessions/${sessionId}/chat`, {
    content,
  })
  return data
}

export async function clearSessionChat(client: AxiosInstance, sessionId: string) {
  const { data } = await client.delete<{ deleted: number }>(
    `/api/sessions/${sessionId}/chat`,
  )
  return data
}

export interface InterviewProcessOptions {
  jd_text?: string | null
  scorecard_id?: string | null
  blind_mode?: boolean
  candidate_name?: string | null
  candidate_email?: string | null
  panel_transcripts?: string[] | null
}

export interface ScorecardCriterion {
  id: string
  label: string
  weight: number
}

export interface ScorecardTemplate {
  id: string
  title: string
  criteria: ScorecardCriterion[]
}

export async function fetchScorecards(client: AxiosInstance) {
  const { data } = await client.get<ScorecardTemplate[]>('/api/interview/scorecards')
  return data
}

export async function processSession(
  client: AxiosInstance,
  sessionId: string,
  interviewOptions?: InterviewProcessOptions | null,
) {
  const body =
    interviewOptions && Object.keys(interviewOptions).length > 0
      ? { interview_options: interviewOptions }
      : undefined
  const { data } = await client.post<ProcessResult>(
    `/api/sessions/${sessionId}/process`,
    body,
  )
  return data
}

export interface TeamsTranscriptListItem {
  id: string
  title: string
  date: string
  source: string
  file_name: string | null
}

export interface TeamsTranscriptListResponse {
  items: TeamsTranscriptListItem[]
  integration_mode: string
  microsoft_connected: boolean
}

export interface MicrosoftStatus {
  connected: boolean
  integration_mode: string
  azure_configured: boolean
}

export async function getMicrosoftStatus(client: AxiosInstance) {
  const { data } = await client.get<MicrosoftStatus>('/api/microsoft/status')
  return data
}

export async function getMicrosoftAuthUrl(client: AxiosInstance) {
  const { data } = await client.get<{ url: string }>('/api/microsoft/auth-url')
  return data
}

export async function disconnectMicrosoft(client: AxiosInstance) {
  await client.post('/api/microsoft/disconnect')
}

export async function fetchTeamsTranscripts(client: AxiosInstance) {
  const { data } = await client.get<TeamsTranscriptListResponse>('/api/teams/transcripts')
  return data
}

export async function importTeamsTranscript(
  client: AxiosInstance,
  body: {
    meeting_id: string
    source: 'mock' | 'onedrive'
    mode: 'meeting' | 'interview'
    title?: string
  },
) {
  const { data } = await client.post<{ session: SessionDetail; word_count: number }>(
    '/api/teams/import',
    body,
  )
  return data
}

export interface OneDriveBrowseItem {
  id: string
  name: string
  kind: 'folder' | 'file'
  size: number | null
  modified_at: string | null
  extension: string | null
}

export interface OneDriveBrowseResponse {
  folder_id: string
  folder_name: string
  breadcrumb: { id: string; name: string }[]
  items: OneDriveBrowseItem[]
  integration_mode: string
  microsoft_connected: boolean
}

export async function browseOneDriveFolder(client: AxiosInstance, folderId = 'root') {
  const { data } = await client.get<OneDriveBrowseResponse>('/api/onedrive/browse', {
    params: { folder_id: folderId },
  })
  return data
}

export async function fetchOneDriveRecordings(client: AxiosInstance) {
  const { data } = await client.get<TeamsTranscriptListResponse>('/api/onedrive/recordings')
  return data
}

export async function importOneDriveFile(
  client: AxiosInstance,
  body: {
    item_id: string
    source?: 'mock' | 'onedrive'
    mode: 'meeting' | 'interview'
    title?: string
    file_name?: string
  },
) {
  const { data } = await client.post<{ session: SessionDetail; word_count: number }>(
    '/api/onedrive/import',
    body,
  )
  return data
}

export async function updateSessionOutput(
  client: AxiosInstance,
  sessionId: string,
  edited_json: Record<string, unknown>,
) {
  const { data } = await client.patch<OutputRecord>(`/api/sessions/${sessionId}/output`, {
    edited_json,
  })
  return data
}
