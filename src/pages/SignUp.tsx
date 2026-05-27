import { SignUp } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { AuthGuestPage } from '@/components/auth/AuthGuestPage'
import { PublicNav } from '@/components/layout/PublicNav'
import { FadeIn } from '@/components/ui/FadeIn'

export function SignUpPage() {
  return (
    <AuthGuestPage>
      <div className="relative min-h-screen">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="animate-float-slow absolute left-1/3 top-20 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
          <div className="animate-float-slower absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
        </div>
        <PublicNav />
        <div className="relative flex flex-col items-center justify-center px-4 py-12">
          <FadeIn>
            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25"
              >
                <Sparkles className="h-7 w-7 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Create your account</h1>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Email and password sign-up — start turning transcripts into meeting minutes or
                interview feedback in minutes.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/dashboard"
              signInFallbackRedirectUrl="/dashboard"
            />
          </FadeIn>
        </div>
      </div>
    </AuthGuestPage>
  )
}
