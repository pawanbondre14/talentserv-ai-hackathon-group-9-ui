import { Link, Outlet, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { FileText, History, LayoutDashboard, PlusCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PrivacyBanner } from '@/components/layout/PrivacyBanner'
import { PageTransition } from '@/components/layout/PageTransition'
import { PermissionsProvider, usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/permissions'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.SESSIONS_READ },
  { to: '/new', label: 'New session', icon: PlusCircle, permission: PERMISSIONS.SESSIONS_CREATE },
  { to: '/history', label: 'History', icon: History, permission: PERMISSIONS.SESSIONS_READ },
]

function AppShellNav() {
  const { can } = usePermissions()
  const location = useLocation()
  const nav = navItems.filter((item) => can(item.permission))

  return (
    <>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map(({ to, label, icon: Icon }) => {
          const active =
            location.pathname === to ||
            (to !== '/dashboard' && location.pathname.startsWith(to))
          return (
            <Link key={to} to={to} className="relative block">
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-indigo-500/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'text-indigo-200' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

function MobileNav() {
  const { can } = usePermissions()
  const location = useLocation()
  const nav = navItems.filter((item) => can(item.permission))

  return (
    <nav className="flex gap-2 text-xs">
      {nav.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={cn(
            'rounded-md px-2 py-1',
            location.pathname === to || location.pathname.startsWith(`${to}/`)
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400',
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

export function AppShell() {
  return (
    <PermissionsProvider>
      <AppShellInner />
    </PermissionsProvider>
  )
}

function AppShellInner() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-surface-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl md:flex">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 border-b border-[var(--color-surface-border)] px-5 py-5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">MeetPilot AI</p>
            <p className="text-xs text-[var(--color-muted)]">Turn talk into action with AI</p>
          </div>
        </Link>
        <AppShellNav />
        <div className="border-t border-[var(--color-surface-border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-muted)]">Account</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-2 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-elevated)]/60 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              <span className="font-semibold">MeetPilot AI</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
          <MobileNav />
        </header>
        <PrivacyBanner />
        <main className="flex-1 p-4 md:p-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
