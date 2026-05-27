import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { AlertVariant } from '@/lib/messages'

export const INLINE_ALERT_DISMISS_MS = 3000

const styles: Record<AlertVariant, string> = {
  error: 'bg-red-500/10 text-red-300',
  success: 'bg-emerald-500/10 text-emerald-200',
  warning: 'bg-amber-500/10 text-amber-200',
}

function messageKey(children: ReactNode): string {
  if (children == null || children === false) return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  return String(children)
}

export function InlineAlert({
  variant,
  children,
  className,
  autoDismissMs = INLINE_ALERT_DISMISS_MS,
  onDismiss,
}: {
  variant: AlertVariant
  children: ReactNode
  className?: string
  /** Milliseconds before auto-hide; set to 0 to keep visible until children clears. */
  autoDismissMs?: number
  /** Called when the alert auto-dismisses (use to clear parent state). */
  onDismiss?: () => void
}) {
  const [visible, setVisible] = useState(false)
  const key = messageKey(children)

  useEffect(() => {
    if (!key) {
      setVisible(false)
      return
    }

    setVisible(true)

    if (autoDismissMs <= 0) return

    const timer = window.setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, autoDismissMs)

    return () => window.clearTimeout(timer)
  }, [key, autoDismissMs, onDismiss])

  if (!key || !visible) return null

  return (
    <p className={cn('rounded-lg px-3 py-2 text-sm', styles[variant], className)} role="alert">
      {children}
    </p>
  )
}
