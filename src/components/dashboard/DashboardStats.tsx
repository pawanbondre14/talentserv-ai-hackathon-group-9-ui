import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useApi } from '@/hooks/useApi'
import { fetchSessionStats, getApiErrorMessage, type SessionStats } from '@/lib/api'
import { cn } from '@/lib/utils'

function formatWords(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

type StatCardProps = {
  label: string
  value: number
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
  iconBg: string
  to?: string
  delay?: number
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  iconBg,
  to,
  delay = 0,
}: StatCardProps) {
  const inner = (
    <Card
      hover={Boolean(to)}
      className={cn(
        'relative overflow-hidden border bg-gradient-to-br p-5',
        accent,
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
        {to && (
          <span className="text-xs font-medium text-slate-500 transition-colors group-hover:text-indigo-300">
            View →
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-300">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </Card>
  )

  const wrapped = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </motion.div>
  )

  if (to) {
    return (
      <Link to={to} className="group block">
        {wrapped}
      </Link>
    )
  }
  return wrapped
}

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--color-surface-border)] bg-black/20 p-5">
      <div className="h-11 w-11 rounded-xl bg-white/10" />
      <div className="mt-4 h-8 w-16 rounded bg-white/10" />
      <div className="mt-2 h-4 w-24 rounded bg-white/5" />
    </div>
  )
}

export function DashboardStats() {
  const api = useApi()
  const { isLoaded, isSignedIn } = useAuth()
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    setLoading(true)
    setError(null)
    fetchSessionStats(api)
      .then(setStats)
      .catch((err: unknown) =>
        setError(getApiErrorMessage(err, 'Could not load dashboard stats.')),
      )
      .finally(() => setLoading(false))
  }, [api, isLoaded, isSignedIn])

  if (!isLoaded || !isSignedIn) return null

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Your transcripts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <p className="text-sm text-red-300/90">{error ?? 'Stats unavailable.'}</p>
    )
  }

  const inProgress = stats.processing
  const needsAttention = stats.draft + stats.error

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Your transcripts</h2>
          <p className="mt-1 text-sm text-slate-500">
            {formatWords(stats.total_words)} words analyzed · {stats.with_output} with AI output
          </p>
        </div>
        <Link
          to="/history"
          className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          View all sessions →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total sessions"
          value={stats.total}
          sub={`${stats.meeting} meetings · ${stats.interview} interviews`}
          icon={FileText}
          accent="from-slate-500/10 to-indigo-600/15 border-indigo-500/25"
          iconBg="bg-indigo-500/20 text-indigo-300"
          to="/history"
          delay={0}
        />
        <StatCard
          label="Complete"
          value={stats.ready}
          sub="AI output ready"
          icon={CheckCircle2}
          accent="from-emerald-500/10 to-teal-600/10 border-emerald-500/30"
          iconBg="bg-emerald-500/20 text-emerald-300"
          to="/history?status=ready"
          delay={0.05}
        />
        <StatCard
          label="In progress"
          value={inProgress}
          sub={inProgress > 0 ? 'Generating now' : 'None running'}
          icon={Loader2}
          accent="from-amber-500/10 to-orange-600/10 border-amber-500/30"
          iconBg={cn(
            'bg-amber-500/20 text-amber-300',
            inProgress > 0 && '[&_svg]:animate-spin',
          )}
          to="/history?status=processing"
          delay={0.1}
        />
        <StatCard
          label="Needs attention"
          value={needsAttention}
          sub={`${stats.draft} drafts · ${stats.error} errors`}
          icon={AlertCircle}
          accent="from-violet-500/10 to-purple-600/10 border-violet-500/30"
          iconBg="bg-violet-500/20 text-violet-300"
          to="/history?status=draft"
          delay={0.15}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <Link to="/history?mode=meeting">
            <Card hover className="flex items-center gap-4 border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-transparent py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Briefcase className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.meeting}</p>
                <p className="text-sm text-slate-400">Meeting minutes</p>
              </div>
            </Card>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
        >
          <Link to="/history?mode=interview">
            <Card hover className="flex items-center gap-4 border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-transparent py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                <Users className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.interview}</p>
                <p className="text-sm text-slate-400">Interview feedback</p>
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
