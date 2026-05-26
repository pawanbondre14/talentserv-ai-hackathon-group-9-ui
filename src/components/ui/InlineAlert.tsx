import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { AlertVariant } from '@/lib/messages'

const styles: Record<AlertVariant, string> = {
  error: 'bg-red-500/10 text-red-300',
  success: 'bg-emerald-500/10 text-emerald-200',
  warning: 'bg-amber-500/10 text-amber-200',
}

export function InlineAlert({
  variant,
  children,
  className,
}: {
  variant: AlertVariant
  children: ReactNode
  className?: string
}) {
  if (!children) return null
  return (
    <p className={cn('rounded-lg px-3 py-2 text-sm', styles[variant], className)} role="alert">
      {children}
    </p>
  )
}
