import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useApi } from '@/hooks/useApi'
import { fetchSessions, type SessionListItem } from '@/lib/api'

export function RecentSessions() {
  const api = useApi()
  const [items, setItems] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions(api, { limit: 5 })
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [api])

  if (loading) return <p className="text-sm text-slate-500">Loading recent sessions…</p>
  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Clock className="h-5 w-5 text-indigo-400" />
          Recent sessions
        </h2>
        <Link to="/history" className="text-sm text-indigo-400 hover:text-indigo-300">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link key={item.id} to={`/session/${item.id}`}>
            <Card hover className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{item.title}</p>
                  {item.snippet && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.snippet}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs capitalize text-slate-500">{item.status}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
