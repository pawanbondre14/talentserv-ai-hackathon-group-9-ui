import { useAuth } from '@clerk/clerk-react'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { createApiClient } from '@/lib/api'

export function useApi() {
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const resolveToken = useCallback(
    async (options?: { skipCache?: boolean }) => {
      try {
        return await getToken(options?.skipCache ? { skipCache: true } : undefined)
      } catch {
        return null
      }
    },
    [getToken],
  )

  const onUnauthorized = useCallback(() => {
    navigate('/sign-in', { replace: true, state: { reason: 'session-expired' } })
  }, [navigate])

  return useMemo(
    () => createApiClient(resolveToken, onUnauthorized),
    [resolveToken, onUnauthorized],
  )
}
