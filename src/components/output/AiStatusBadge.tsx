import { CheckCircle2, FlaskConical, Loader2, Sparkles, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AiRunStatus = 'idle' | 'processing' | 'done' | 'error'

const MODE_LABELS = {
  meeting: 'Meeting Minutes',
  interview: 'Interview Feedback',
} as const

const STATUS_STYLES = {
  processing: {
    accent: 'border-l-indigo-500',
    ring: 'ring-indigo-500/20',
    icon: 'text-indigo-400',
    dot: 'bg-indigo-400',
    bar: 'from-indigo-500 via-violet-400 to-indigo-500',
  },
  done: {
    accent: 'border-l-emerald-500',
    ring: 'ring-emerald-500/20',
    icon: 'text-emerald-400',
    dot: 'bg-emerald-400',
    bar: '',
  },
  error: {
    accent: 'border-l-red-500',
    ring: 'ring-red-500/20',
    icon: 'text-red-400',
    dot: 'bg-red-400',
    bar: '',
  },
} as const

export function providerLabel(provider: string | null | undefined): string {
  if (!provider) return 'AI'
  switch (provider.toLowerCase()) {
    case 'mock':
      return 'Demo (mock)'
    case 'anthropic':
      return 'Claude'
    case 'openai':
      return 'OpenAI'
    default:
      return provider
  }
}

function StatusDot({ className }: { className: string }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span
        className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', className)}
      />
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', className)} />
    </span>
  )
}

export function AiStatusBadge({
  mode,
  status,
  provider,
  truncated,
  className,
}: {
  mode: 'meeting' | 'interview'
  status: AiRunStatus
  provider?: string | null
  truncated?: boolean
  className?: string
}) {
  if (status === 'idle') return null

  const modeLabel = MODE_LABELS[mode]
  const styles = STATUS_STYLES[status === 'processing' ? 'processing' : status === 'error' ? 'error' : 'done']
  const isMock = provider?.toLowerCase() === 'mock'

  return (
    <div
      className={cn(
        'inline-flex max-w-full flex-wrap items-center gap-2 rounded-md border border-[var(--color-surface-border)] border-l-[3px] bg-black/30 px-2.5 py-1.5 text-xs text-slate-200',
        styles.accent,
        className,
      )}
      role="status"
      aria-live={status === 'processing' ? 'polite' : undefined}
    >
      {status === 'processing' && (
        <>
          <StatusDot className={styles.dot} />
          <span>
            Generating <strong className="font-semibold text-white">{modeLabel}</strong>…
          </span>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className={cn('h-3.5 w-3.5 shrink-0', styles.icon)} />
          <span>{modeLabel} failed</span>
        </>
      )}
      {status === 'done' && (
        <>
          {isMock ? (
            <FlaskConical className="h-3.5 w-3.5 shrink-0 text-violet-400" />
          ) : (
            <CheckCircle2 className={cn('h-3.5 w-3.5 shrink-0', styles.icon)} />
          )}
          <span>
            {modeLabel} · {providerLabel(provider)}
          </span>
          {truncated && (
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-200">
              shortened
            </span>
          )}
        </>
      )}
    </div>
  )
}

export function AiStatusPanel({
  mode,
  status,
  provider,
  truncated,
}: {
  mode: 'meeting' | 'interview'
  status: AiRunStatus
  provider?: string | null
  truncated?: boolean
}) {
  if (status === 'idle') return null

  const modeLabel = MODE_LABELS[mode]
  const styles = STATUS_STYLES[status]
  const isMock = provider?.toLowerCase() === 'mock'

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-[var(--color-surface-border)] border-l-4 bg-black/25 ring-1 ring-inset',
        styles.accent,
        styles.ring,
      )}
      role="status"
      aria-live={status === 'processing' ? 'polite' : undefined}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="mt-0.5 shrink-0">
          {status === 'processing' && (
            <Loader2 className={cn('h-4 w-4 animate-spin', styles.icon)} />
          )}
          {status === 'done' &&
            (isMock ? (
              <FlaskConical className="h-4 w-4 text-violet-400" />
            ) : (
              <Sparkles className={cn('h-4 w-4', styles.icon)} />
            ))}
          {status === 'error' && <XCircle className={cn('h-4 w-4', styles.icon)} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {status === 'processing' && <StatusDot className={styles.dot} />}
            <p className="text-sm font-medium text-white">
              {status === 'processing' && `Generating ${modeLabel}`}
              {status === 'done' && `${modeLabel} ready`}
              {status === 'error' && `Could not generate ${modeLabel}`}
            </p>
            {status === 'done' && (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
                {providerLabel(provider)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {status === 'processing' && 'This may take 15–60 seconds. Please keep this page open.'}
            {status === 'done' &&
              (truncated
                ? 'Your output is ready. The transcript was shortened to fit model limits.'
                : 'Your AI output is ready to review and edit.')}
            {status === 'error' &&
              'Something went wrong. See the message below for details, then try again.'}
          </p>
        </div>
      </div>

      {status === 'processing' && (
        <div className="h-1 w-full bg-black/40">
          <div
            className={cn(
              'h-full w-full animate-shimmer bg-gradient-to-r',
              styles.bar,
            )}
          />
        </div>
      )}
    </div>
  )
}

const STORAGE_PREFIX = 'meetingfeed-ai-meta:'

export function saveAiMeta(
  sessionId: string,
  meta: { provider: string; truncated: boolean; completedAt: string },
) {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${sessionId}`, JSON.stringify(meta))
  } catch {
    /* ignore quota */
  }
}

export function loadAiMeta(sessionId: string): {
  provider: string
  truncated: boolean
  completedAt: string
} | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${sessionId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
