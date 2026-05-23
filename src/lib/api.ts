import axios, { type AxiosInstance } from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function createApiClient(getToken: () => Promise<string | null>): AxiosInstance {
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

export interface SessionWithOutput extends SessionDetail {
  output: OutputRecord | null
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

export async function processSession(client: AxiosInstance, sessionId: string) {
  const { data } = await client.post<ProcessResult>(`/api/sessions/${sessionId}/process`)
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
