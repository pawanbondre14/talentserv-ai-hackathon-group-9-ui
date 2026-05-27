import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-shimmer rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5', className)}
      aria-hidden
    />
  )
}

export function SessionCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-elevated)]/90 p-5">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}
