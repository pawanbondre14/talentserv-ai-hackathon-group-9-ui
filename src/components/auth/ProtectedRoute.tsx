import { useAuth } from '@clerk/clerk-react'
import { Navigate, Outlet } from 'react-router-dom'
import { PageLoader } from '@/components/ui/PageLoader'

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <PageLoader message="Checking your session…" />
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
