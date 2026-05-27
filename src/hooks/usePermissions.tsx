import { useAuth } from '@clerk/clerk-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchMe, type MeResponse } from '@/lib/api'
import { hasAllPermissions, hasAnyPermission, hasPermission } from '@/lib/permissions'
import { useApi } from '@/hooks/useApi'

type PermissionsContextValue = {
  me: MeResponse | null
  roles: string[]
  permissions: string[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  can: (permission: string) => boolean
  canAny: (...permissions: string[]) => boolean
  canAll: (...permissions: string[]) => boolean
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null)

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const client = useApi()
  const { isLoaded, isSignedIn } = useAuth()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setMe(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMe(client)
      setMe(data)
    } catch {
      setMe(null)
      setError('Could not load permissions.')
    } finally {
      setLoading(false)
    }
  }, [client, isLoaded, isSignedIn])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const permissions = me?.permissions ?? []
  const roles = me?.roles ?? []

  const value = useMemo<PermissionsContextValue>(
    () => ({
      me,
      roles,
      permissions,
      loading,
      error,
      refresh,
      can: (p) => hasPermission(permissions, p),
      canAny: (...ps) => hasAnyPermission(permissions, ps),
      canAll: (...ps) => hasAllPermissions(permissions, ps),
    }),
    [me, roles, permissions, loading, error, refresh],
  )

  return (
    <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
  )
}

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext)
  if (!ctx) {
    throw new Error('usePermissions must be used within PermissionsProvider')
  }
  return ctx
}
