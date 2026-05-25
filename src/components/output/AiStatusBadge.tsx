import { CheckCircle2, FlaskConical, Loader2, Sparkles, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AiRunStatus = 'idle' | 'processing' | 'done' | 'error'

const MODE_LABELS = {
  meeting: 'Meeting Minutes',
  interview: 'Interview Feedback',
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

  if (status === 'processing') {
    return (
      <div
        className={cn(
          'inline-flex flex-wrap items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-sm text-amber-100',
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-300" />
        <span>
          Generating <strong className="font-semibold">{modeLabel}</strong>…
        </span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-sm text-red-200',
          className,
        )}
        role="status"
      >
        <XCircle className="h-4 w-4 shrink-0" />
        <span>{modeLabel} generation failed</span>
      </div>
    )
  }

  const isMock = provider?.toLowerCase() === 'mock'
  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
        isMock
          ? 'border-violet-500/40 bg-violet-500/15 text-violet-100'
          : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100',
        className,
      )}
      role="status"
    >
      {isMock ? (
        <FlaskConical className="h-4 w-4 shrink-0 text-violet-300" />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
      )}
      <span>
        Done · <strong className="font-semibold">{modeLabel}</strong>
        {' · '}
        {providerLabel(provider)}
      </span>
      {truncated && (
        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-200">
          transcript truncated
        </span>
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

  return (
    <div
      className={cn(
        'rounded-xl border p-4 backdrop-blur',
        status === 'processing' && 'border-amber-500/30 bg-amber-500/10',
        status === 'done' && 'border-emerald-500/30 bg-emerald-500/10',
        status === 'error' && 'border-red-500/30 bg-red-500/10',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {status === 'processing' && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <Loader2 className="h-5 w-5 animate-spin text-amber-300" />
            </div>
          )}
          {status === 'done' && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
              <Sparkles className="h-5 w-5 text-emerald-300" />
            </div>
          )}
          {status === 'error' && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/20">
              <XCircle className="h-5 w-5 text-red-300" />
            </div>
          )}
          <div>
            <p className="font-medium text-white">
              {status === 'processing' && `AI is generating ${modeLabel}`}
              {status === 'done' && `${modeLabel} ready`}
              {status === 'error' && `Could not generate ${modeLabel}`}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {status === 'processing' &&
                'This may take 15–60 seconds. Check your backend terminal for live logs.'}
              {status === 'done' &&
                `Generated via ${providerLabel(provider)}${truncated ? ' · transcript was shortened' : ''}`}
              {status === 'error' && 'See the error message below or backend logs for details.'}
            </p>
          </div>
        </div>
        <AiStatusBadge mode={mode} status={status} provider={provider} truncated={truncated} />
      </div>
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
