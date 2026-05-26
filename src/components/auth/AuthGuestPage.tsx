import { useAuth } from '@clerk/clerk-react'
import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'

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
  const mountedRef = useRef(true)
  const needsSessionExpiredSignOut = Boolean(sessionExpired && isSignedIn)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !sessionExpired || !isSignedIn || signingOut) return
    setSigningOut(true)
    void signOut({ redirectUrl: window.location.pathname })
      .catch(() => undefined)
      .finally(() => {
        if (mountedRef.current) {
          setSigningOut(false)
        }
      })
  }, [isLoaded, isSignedIn, sessionExpired, signOut, signingOut])

  if (!isLoaded || signingOut || needsSessionExpiredSignOut) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading…
      </div>
    )
  }

  if (isSignedIn && !sessionExpired) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
