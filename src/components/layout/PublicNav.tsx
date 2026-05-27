import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function PublicNav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-[var(--color-surface)]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-white">MeetPilot AI</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/sign-in"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.02] hover:bg-indigo-500"
          >
            Get started
          </Link>
        </nav>
      </div>
    </motion.header>
  )
}
