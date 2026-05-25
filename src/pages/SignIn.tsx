import { SignIn } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { AuthGuestPage } from '@/components/auth/AuthGuestPage'
import { PublicNav } from '@/components/layout/PublicNav'
import { FadeIn } from '@/components/ui/FadeIn'

export function SignInPage() {
  const location = useLocation()
  const sessionExpired =
    (location.state as { reason?: string } | null)?.reason === 'session-expired'

  return (
    <AuthGuestPage sessionExpired={sessionExpired}>
      <div className="relative min-h-screen">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="animate-float-slow absolute left-1/4 top-24 h-72 w-72 rounded-full bg-indigo-600/15 blur-3xl" />
          <div className="animate-float-slower absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
        </div>
        <PublicNav />
        <div className="relative flex flex-col items-center justify-center px-4 py-12">
          {sessionExpired && (
            <FadeIn>
              <p className="mb-4 max-w-sm rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-100">
                Your session expired. Sign in again to continue.
              </p>
            </FadeIn>
          )}
          <FadeIn delay={0.05}>
            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25"
              >
                <Sparkles className="h-7 w-7 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-400">Sign in to access your sessions and AI output</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.12}>
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/dashboard"
              signUpFallbackRedirectUrl="/dashboard"
            />
          </FadeIn>
        </div>
      </div>
    </AuthGuestPage>
  )
}
