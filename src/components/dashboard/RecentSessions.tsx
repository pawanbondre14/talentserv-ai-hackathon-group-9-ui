import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SessionCardSkeleton } from '@/components/ui/Skeleton'
import { useApi } from '@/hooks/useApi'
import { fetchSessions, type SessionListItem } from '@/lib/api'

export function RecentSessions() {
  const api = useApi()
  const { isLoaded, isSignedIn } = useAuth()
  const [items, setItems] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    setLoading(true)
    fetchSessions(api, { limit: 3 })
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [api, isLoaded, isSignedIn])

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Clock className="h-5 w-5 text-indigo-400" />
          Recent sessions
        </h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Clock className="h-5 w-5 text-indigo-400" />
          Recent sessions
        </h2>
        <Link to="/history" className="text-sm text-indigo-400 transition-colors hover:text-indigo-300">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <Link to={`/session/${item.id}`}>
              <Card hover className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{item.title}</p>
                    {item.snippet && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.snippet}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-700/50 px-2 py-0.5 text-xs capitalize text-slate-400">
                    {item.status}
                  </span>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
