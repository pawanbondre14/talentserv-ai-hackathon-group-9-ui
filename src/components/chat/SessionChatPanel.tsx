import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Send, Trash2 } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import {
  clearSessionChat,
  fetchSessionChat,
  getApiErrorMessage,
  sendSessionChat,
  type ChatMessage,
} from '@/lib/api'
import { cn } from '@/lib/utils'

const SUGGESTIONS_MEETING = [
  'What are the top action items?',
  'Summarize key decisions.',
  'Any risks mentioned?',
]

const SUGGESTIONS_INTERVIEW = [
  'What is the hiring recommendation?',
  'List main strengths and concerns.',
  'What follow-up questions were suggested?',
]

export function SessionChatContent({
  sessionId,
  mode,
  enabled,
  active,
  messagesAreaClassName,
}: {
  sessionId: string
  mode: 'meeting' | 'interview'
  enabled: boolean
  active: boolean
  messagesAreaClassName?: string
}) {
  const api = useApi()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (!enabled || !active) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSessionChat(api, sessionId)
      setMessages(data.items)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not load chat.'))
    } finally {
      setLoading(false)
    }
  }, [api, sessionId, enabled, active])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (active) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, sending, active])

  async function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content || sending || !enabled) return
    setSending(true)
    setError(null)
    setInput('')
    try {
      const result = await sendSessionChat(api, sessionId, content)
      setMessages((prev) => [...prev, result.user_message, result.assistant_message])
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to send message.'))
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  async function handleClear() {
    if (!messages.length) return
    setError(null)
    try {
      await clearSessionChat(api, sessionId)
      setMessages([])
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not clear chat.'))
    }
  }

  if (!enabled) {
    return (
      <p className="px-1 py-6 text-center text-sm text-slate-400">
        Generate AI output first, then ask questions about this session.
      </p>
    )
  }

  const suggestions = mode === 'interview' ? SUGGESTIONS_INTERVIEW : SUGGESTIONS_MEETING

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-end px-1 pb-2">
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-[var(--color-surface-border)] bg-black/25 p-3',
          messagesAreaClassName ?? 'max-h-80',
        )}
      >
        {loading && (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading chat…
          </p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-slate-500">No messages yet. Try a suggestion below.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'rounded-lg px-3 py-2 text-sm',
              m.role === 'user'
                ? 'ml-6 bg-indigo-600/30 text-indigo-100'
                : 'mr-6 bg-black/40 text-slate-200',
            )}
          >
            <span className="text-xs font-medium uppercase text-slate-500">
              {m.role === 'user' ? 'You' : 'AI'}
            </span>
            <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {sending && (
          <p className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            Thinking…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 0 && !loading && (
        <div className="mt-3 flex flex-wrap gap-2 px-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSend(s)}
              disabled={sending}
              className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-3 flex shrink-0 gap-2 border-t border-[var(--color-surface-border)] pt-3"
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this session…"
          disabled={sending}
          className="flex-1 rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-2 text-white hover:bg-cyan-500 disabled:opacity-50"
          aria-label="Send message"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

      {error && <p className="mt-2 shrink-0 text-sm text-red-300">{error}</p>}
    </div>
  )
}
