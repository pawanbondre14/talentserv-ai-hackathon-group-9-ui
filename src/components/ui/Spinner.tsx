import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
} as const

export function Spinner({
  size = 'md',
  className,
  label,
}: {
  size?: keyof typeof sizes
  className?: string
  label?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} role="status">
      <Loader2 className={cn('animate-spin text-indigo-400', sizes[size])} aria-hidden />
      {label && <span className="text-sm text-slate-400">{label}</span>}
    </span>
  )
}
