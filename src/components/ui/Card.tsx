import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({
  children,
  className,
  hover,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-elevated)]/90 p-5 shadow-lg shadow-black/20 backdrop-blur',
        hover && 'transition-transform hover:-translate-y-0.5 hover:border-indigo-500/30',
        className,
      )}
    >
      {children}
    </div>
  )
}
