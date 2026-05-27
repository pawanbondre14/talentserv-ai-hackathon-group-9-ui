import { useAuth } from '@clerk/clerk-react'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { createApiClient } from '@/lib/api'

export function useApi() {
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth()
  const navigate = useNavigate()

  const resolveToken = useCallback(
    async (options?: { skipCache?: boolean }) => {
      if (!isLoaded || !isSignedIn) return null
      try {
        return await getToken(options?.skipCache ? { skipCache: true } : undefined)
      } catch {
        return null
      }
    },
    [getToken, isLoaded, isSignedIn],
  )

  const onUnauthorized = useCallback(async () => {
    try {
      await signOut()
    } catch {
      /* continue to sign-in */
    }
    navigate('/sign-in', { replace: true, state: { reason: 'session-expired' } })
  }, [navigate, signOut])

  const onForbidden = useCallback(() => {
    navigate('/forbidden', { replace: true })
  }, [navigate])

  return useMemo(
    () => createApiClient(resolveToken, onUnauthorized, onForbidden),
    [resolveToken, onUnauthorized, onForbidden],
  )
}
