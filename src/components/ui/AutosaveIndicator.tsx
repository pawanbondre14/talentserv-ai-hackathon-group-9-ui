import { Cloud, CloudOff, Loader2 } from 'lucide-react'
import type { AutosaveStatus } from '@/hooks/useAutosave'
import { cn } from '@/lib/utils'

export function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === 'idle') return null

  const config = {
    pending: { text: 'Unsaved changes…', className: 'text-slate-400' },
    saving: { text: 'Saving…', className: 'text-amber-300' },
    saved: { text: 'All changes saved', className: 'text-emerald-300' },
    error: { text: 'Save failed — retry or use Save', className: 'text-red-300' },
  }[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[var(--color-surface-border)] bg-black/30 px-2.5 py-1 text-xs',
        config.className,
      )}
    >
      {status === 'saving' ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : status === 'error' ? (
        <CloudOff className="h-3 w-3" />
      ) : (
        <Cloud className="h-3 w-3" />
      )}
      {config.text}
    </span>
  )
}
