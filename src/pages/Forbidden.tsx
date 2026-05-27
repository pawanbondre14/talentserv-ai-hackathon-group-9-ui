import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export function Forbidden() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <ShieldAlert className="h-12 w-12 text-amber-400" />
      <h1 className="text-xl font-semibold text-white">Access denied</h1>
      <p className="text-sm text-[var(--color-muted)]">
        You do not have permission to view this page. Contact an administrator if you need access.
      </p>
      <Link
        to="/dashboard"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
