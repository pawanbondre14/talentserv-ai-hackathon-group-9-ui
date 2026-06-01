import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { PageLoader } from '@/components/ui/PageLoader'

/**
 * Wraps sign-in / sign-up: redirect signed-in users to dashboard;
 * on session-expired, sign out first so <SignIn /> can render.
 */
export function AuthGuestPage({
  children,
  sessionExpired,
}: {
  children: React.ReactNode
  sessionExpired?: boolean
}) {
  const { isLoaded, isSignedIn, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!isLoaded || !sessionExpired || !isSignedIn || signingOut) return
    let cancelled = false
    setSigningOut(true)
    signOut({ redirectUrl: window.location.pathname }).finally(() => {
      if (!cancelled) setSigningOut(false)
    })
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, sessionExpired, signOut, signingOut])

  if (!isLoaded || signingOut) {
    return <PageLoader message={signingOut ? 'Signing out…' : 'Loading…'} />
  }

  if (isSignedIn && !sessionExpired) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
