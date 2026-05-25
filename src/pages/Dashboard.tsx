import { Link } from 'react-router-dom'
import { Briefcase, Calendar, ChevronRight, MessageSquare, Users } from 'lucide-react'
import { RecentSessions } from '@/components/dashboard/RecentSessions'
import { Card } from '@/components/ui/Card'
import { FadeIn, StaggerItem, StaggerList } from '@/components/ui/FadeIn'

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

const highlights = [
  {
    icon: Briefcase,
    title: 'Teams / OneDrive',
    description: 'Import from Recordings folder or demo data',
  },
  {
    icon: MessageSquare,
    title: 'Session chat',
    description: 'Ask AI about a meeting transcript',
  },
  {
    icon: Users,
    title: 'Interview tools',
    description: 'JD, scorecard, and panel merge options',
  },
]

export function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          Turn Teams transcripts, uploads, or pasted notes into structured meeting minutes or
          interview feedback. Paste a transcript, run AI, edit results, and export.
        </p>
      </FadeIn>

      <StaggerList className="grid gap-4 md:grid-cols-2">
        {actions.map(({ to, title, description, icon: Icon, accent }) => (
          <StaggerItem key={to}>
            <Link to={to}>
              <Card hover className={`h-full border bg-gradient-to-br ${accent}`}>
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-5 w-5 text-indigo-300" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-0.5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-400">{description}</p>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </StaggerList>

      <FadeIn delay={0.15}>
        <RecentSessions />
      </FadeIn>

      <StaggerList className="grid gap-4 md:grid-cols-3">
        {highlights.map(({ icon: Icon, title, description }) => (
          <StaggerItem key={title}>
            <Card hover>
              <Icon className="h-5 w-5 text-indigo-400" />
              <p className="mt-3 text-sm font-medium text-white">{title}</p>
              <p className="mt-1 text-xs text-slate-400">{description}</p>
            </Card>
          </StaggerItem>
        ))}
      </StaggerList>
    </div>
  )
}
