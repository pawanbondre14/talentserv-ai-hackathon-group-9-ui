import { useEffect, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { SessionChatContent } from '@/components/chat/SessionChatPanel'
import { cn } from '@/lib/utils'

export function FloatingSessionChat({
  sessionId,
  mode,
  enabled,
  sessionTitle,
}: {
  sessionId: string
  mode: 'meeting' | 'interview'
  enabled: boolean
  sessionTitle?: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!enabled) setOpen(false)
  }, [enabled])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close chat overlay"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Session chat"
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-cyan-500/30',
            'bg-[var(--color-surface-elevated)] shadow-2xl shadow-black/50',
            'bottom-24 right-4 left-4 h-[min(70vh,32rem)] sm:left-auto sm:w-[min(100vw-2rem,24rem)]',
          )}
        >
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-surface-border)] bg-cyan-500/10 px-4 py-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-white">Ask about this session</h3>
              {sessionTitle && (
                <p className="truncate text-xs text-slate-400">{sessionTitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-black/30 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2">
            <p className="mb-2 shrink-0 text-xs text-slate-500">
              Answers use only this session&apos;s transcript and AI output.
            </p>
            <SessionChatContent
              sessionId={sessionId}
              mode={mode}
              enabled={enabled}
              active={open}
              messagesAreaClassName="flex-1"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
          'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]',
          open
            ? 'bg-slate-700 text-white hover:bg-slate-600'
            : enabled
              ? 'bg-gradient-to-br from-cyan-500 to-indigo-600 text-white hover:scale-105 hover:shadow-cyan-500/25'
              : 'bg-slate-700/90 text-slate-400 hover:bg-slate-600',
        )}
        aria-label={open ? 'Close chat' : 'Open session chat'}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  )
}
