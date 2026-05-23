import { useAuth } from '@clerk/clerk-react'
import { useMemo } from 'react'
import { createApiClient } from '@/lib/api'

export function useApi() {
  const { getToken } = useAuth()

  return useMemo(
    () =>
      createApiClient(async () => {
        try {
          return await getToken()
        } catch {
          return null
        }
      }),
    [getToken],
  )
}
