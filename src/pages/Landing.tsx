import { useAuth } from '@clerk/clerk-react'
import { Link, Navigate } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  Cloud,
  FileText,
  MessageSquare,
  Shield,
  Sparkles,
  Upload,
  Users,
  Zap,
} from 'lucide-react'
import { FadeIn, StaggerItem, StaggerList } from '@/components/ui/FadeIn'
import { PageLoader } from '@/components/ui/PageLoader'
import { Card } from '@/components/ui/Card'
import { PublicNav } from '@/components/layout/PublicNav'

const features = [
  {
    icon: Calendar,
    title: 'Meeting minutes',
    description:
      'Executive summary, decisions, action items, risks, and follow-ups — structured from any transcript.',
    color: 'from-blue-500/25 to-indigo-600/10 border-indigo-500/30',
  },
  {
    icon: Users,
    title: 'Interview feedback',
    description:
      'Strengths, concerns, skill ratings, and hiring recommendations with optional JD and scorecard context.',
    color: 'from-violet-500/25 to-purple-600/10 border-violet-500/30',
  },
  {
    icon: Cloud,
    title: 'Teams & OneDrive',
    description:
      'Import transcripts from your Recordings folder or try demo meetings while you connect Microsoft.',
    color: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30',
  },
  {
    icon: FileText,
    title: 'Export & edit',
    description:
      'Refine AI output in the app, then export to Markdown, PDF, or Word for stakeholders.',
    color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30',
  },
]

const steps = [
  {
    step: '01',
    title: 'Bring your transcript',
    detail: 'Paste text, upload a file, or import from Teams / OneDrive.',
    icon: Upload,
  },
  {
    step: '02',
    title: 'Run AI analysis',
    detail: 'Choose meeting minutes or interview mode — Claude or OpenAI powers the output.',
    icon: Zap,
  },
  {
    step: '03',
    title: 'Review & share',
    detail: 'Edit sections, search past sessions, and export when you are ready.',
    icon: MessageSquare,
  },
]

export function Landing() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <PageLoader message="Preparing MeetPilot…" />
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="animate-float-slower absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <PublicNav />

      <main className="relative mx-auto max-w-6xl px-4 pb-24 md:px-8">
        <section className="py-16 text-center md:py-24">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              Turn talk into action with AI
            </span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl md:leading-[1.1]">
              Meeting notes &{' '}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
                interview feedback
              </span>
              <br className="hidden sm:block" />
              in minutes
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
              MeetPilot AI transforms Teams transcripts, uploads, or pasted notes into structured
              deliverables for your team or hiring pipeline. Sign in to save sessions, search
              history, and export polished reports.
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition-transform hover:scale-[1.02] hover:bg-indigo-500"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/sign-in"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-surface-border)] bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur transition-colors hover:border-indigo-500/40 hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.32}>
            <p className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                Clerk authentication
              </span>
              <span>·</span>
              <span>No password storage in this app</span>
              <span>·</span>
              <span>Your transcripts stay in your workspace</span>
            </p>
          </FadeIn>
        </section>

        <section className="py-12">
          <FadeIn>
            <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-indigo-300">
              How it works
            </h2>
          </FadeIn>
          <StaggerList className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map(({ step, title, detail, icon: Icon }) => (
              <StaggerItem key={step}>
                <Card className="relative h-full overflow-hidden border-indigo-500/20 bg-gradient-to-b from-white/[0.06] to-transparent">
                  <span className="text-4xl font-bold text-indigo-500/20">{step}</span>
                  <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
                    <Icon className="h-5 w-5 text-indigo-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{detail}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </section>

        <section className="py-12">
          <FadeIn>
            <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
              Everything you need after the call
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-400">
              Built for hackathon speed and real workflows — from sprint retros to candidate debriefs.
            </p>
          </FadeIn>
          <StaggerList className="mt-10 grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description, color }) => (
              <StaggerItem key={title}>
                <Card
                  hover
                  className={`h-full border bg-gradient-to-br ${color}`}
                >
                  <Icon className="h-6 w-6 text-indigo-300" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </section>

        <FadeIn delay={0.1}>
          <section className="mt-8 overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold text-white md:text-3xl">Ready to pilot your next meeting?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
              Create an account with email and password, then start your first session in under a
              minute.
            </p>
            <Link
              to="/sign-up"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-900 transition-transform hover:scale-[1.02]"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </FadeIn>
      </main>
    </div>
  )
}
