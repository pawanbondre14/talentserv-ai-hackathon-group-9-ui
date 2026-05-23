import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Briefcase, Calendar, ChevronRight, MessageSquare, Users } from 'lucide-react'
import { RecentSessions } from '@/components/dashboard/RecentSessions'
import { Card } from '@/components/ui/Card'

const actions = [
  {
    to: '/new?mode=meeting',
    title: 'Meeting minutes',
    description: 'Summaries, decisions, action items, and risks from your transcript.',
    icon: Calendar,
    accent: 'from-blue-500/20 to-indigo-600/20 border-indigo-500/30',
  },
  {
    to: '/new?mode=interview',
    title: 'Interview feedback',
    description: 'Candidate strengths, concerns, ratings, and follow-up questions.',
    icon: Users,
    accent: 'from-violet-500/20 to-purple-600/20 border-violet-500/30',
  },
]

export function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          MeetPilot AI
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          Turn Teams transcripts, uploads, or pasted notes into structured meeting minutes or
          interview feedback. Paste a transcript, run AI, edit results, and export to
          Markdown, PDF, or Word.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map(({ to, title, description, icon: Icon, accent }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.35 }}
          >
            <Link to={to}>
              <Card hover className={`h-full border bg-gradient-to-br ${accent}`}>
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-5 w-5 text-indigo-300" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-400">{description}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <RecentSessions />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <Briefcase className="h-5 w-5 text-indigo-400" />
          <p className="mt-3 text-sm font-medium text-white">Teams / OneDrive</p>
          <p className="mt-1 text-xs text-slate-400">Import from Recordings folder or demo data</p>
        </Card>
        <Card>
          <MessageSquare className="h-5 w-5 text-indigo-400" />
          <p className="mt-3 text-sm font-medium text-white">Session chat</p>
          <p className="mt-1 text-xs text-slate-400">Ask AI about a meeting — Phase 6</p>
        </Card>
        <Card>
          <Users className="h-5 w-5 text-indigo-400" />
          <p className="mt-3 text-sm font-medium text-white">HR compare & email</p>
          <p className="mt-1 text-xs text-slate-400">Candidate tools — future roadmap</p>
        </Card>
      </div>
    </div>
  )
}
