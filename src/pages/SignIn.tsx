import { SignIn } from '@clerk/clerk-react'
import { Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export function SignInPage() {
  const location = useLocation()
  const sessionExpired =
    (location.state as { reason?: string } | null)?.reason === 'session-expired'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {sessionExpired && (
        <p className="mb-4 max-w-sm rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-100">
          Your session expired. Sign in again to continue.
        </p>
      )}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">MeetingFeed AI</h1>
        <p className="mt-2 text-sm text-slate-400">Meeting Feed Generator — sign in to continue</p>
      </div>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  )
}
