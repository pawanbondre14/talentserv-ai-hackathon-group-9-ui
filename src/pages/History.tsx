import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, FileCheck, Search, Trash2, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { FadeIn } from '@/components/ui/FadeIn'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { SessionCardSkeleton } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'
import { useApi } from '@/hooks/useApi'
import {
  deleteSession,
  fetchSessions,
  getApiErrorMessage,
  type SessionListItem,
} from '@/lib/api'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 15

type ModeFilter = 'all' | 'meeting' | 'interview'
type StatusFilter = 'all' | 'draft' | 'processing' | 'ready' | 'error'

function statusColor(status: string) {
  switch (status) {
    case 'ready':
      return 'bg-emerald-500/20 text-emerald-300'
    case 'processing':
      return 'bg-amber-500/20 text-amber-300'
    case 'error':
      return 'bg-red-500/20 text-red-300'
    default:
      return 'bg-slate-600/50 text-slate-300'
  }
}

function parseStatusFilter(value: string | null): StatusFilter {
  if (value === 'draft' || value === 'ready' || value === 'error' || value === 'processing') {
    return value
  }
  return 'all'
}

function parseModeFilter(value: string | null): ModeFilter {
  if (value === 'meeting' || value === 'interview') return value
  return 'all'
}

export function History() {
  const api = useApi()
  const { isLoaded, isSignedIn } = useAuth()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [modeFilter, setModeFilter] = useState<ModeFilter>(() =>
    parseModeFilter(searchParams.get('mode')),
  )
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() =>
    parseStatusFilter(searchParams.get('status')),
  )
  const [items, setItems] = useState<SessionListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPage = useCallback(
    async (pageOffset: number, append: boolean) => {
      if (append) setLoadingMore(true)
      else setLoading(true)
      setError(null)
      try {
        const data = await fetchSessions(api, {
          q: query.trim() || undefined,
          mode: modeFilter === 'all' ? undefined : modeFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          offset: pageOffset,
          limit: PAGE_SIZE,
        })
        setTotal(data.total)
        setItems((prev) => (append ? [...prev, ...data.items] : data.items))
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Could not load sessions.'))
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [api, query, modeFilter, statusFilter],
  )

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const timer = setTimeout(() => fetchPage(0, false), 300)
    return () => clearTimeout(timer)
  }, [fetchPage, isLoaded, isSignedIn])

  async function handleLoadMore() {
    await fetchPage(items.length, true)
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this session permanently?')) return
    setDeletingId(id)
    setNotice(null)
    try {
      await deleteSession(api, id)
      setItems((prev) => prev.filter((s) => s.id !== id))
      setTotal((t) => Math.max(0, t - 1))
      setNotice('Session deleted.')
      setTimeout(() => setNotice(null), 2500)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not delete session.'))
    } finally {
      setDeletingId(null)
    }
  }

  const hasMore = items.length < total

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-bold text-white">History</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Search titles, transcripts, and AI output. Filter by type or status.
        </p>
      </FadeIn>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search meetings, interviews, action items…"
          className="w-full rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-elevated)] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'meeting', 'interview'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModeFilter(m)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium capitalize',
              modeFilter === m
                ? 'bg-indigo-600 text-white'
                : 'bg-black/30 text-slate-400 hover:text-white',
            )}
          >
            {m === 'meeting' && <Calendar className="h-3.5 w-3.5" />}
            {m === 'interview' && <Users className="h-3.5 w-3.5" />}
            {m === 'all' ? 'All types' : m}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'draft', 'processing', 'ready', 'error'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium capitalize',
              statusFilter === s
                ? 'bg-slate-600 text-white'
                : 'bg-black/30 text-slate-400 hover:text-white',
            )}
          >
            {s === 'all' ? 'Any status' : s}
          </button>
        ))}
      </div>

      <InlineAlert variant="success">{notice}</InlineAlert>
      <InlineAlert variant="error">{error}</InlineAlert>
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <p className="text-xs text-slate-500">
          Showing {items.length} of {total} session{total !== 1 ? 's' : ''}
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.28 }}
          >
          <Link to={`/session/${item.id}`} className="block">
            <Card hover>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-white">{item.title}</h2>
                    {item.has_output && (
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300">
                        <FileCheck className="h-3 w-3" />
                        AI output
                      </span>
                    )}
                  </div>
                  {item.snippet && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">{item.snippet}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {item.mode} · {item.source} · {item.word_count} words ·{' '}
                    {new Date(item.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs capitalize',
                      statusColor(item.status),
                    )}
                  >
                    {item.status}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    disabled={deletingId === item.id}
                    className="rounded p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-300"
                    aria-label="Delete session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          </Link>
          </motion.div>
        ))}
        {!loading && items.length === 0 && (
          <Card>
            <p className="text-sm text-slate-400">No sessions match your filters.</p>
          </Card>
        )}
      </div>

      {hasMore && !loading && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full rounded-lg border border-[var(--color-surface-border)] py-2.5 text-sm text-slate-300 hover:border-indigo-500/50 hover:text-white"
        >
          {loadingMore ? <Spinner size="sm" label="Loading more…" /> : 'Load more'}
        </button>
      )}
    </div>
  )
}
