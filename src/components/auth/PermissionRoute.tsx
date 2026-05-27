import { Navigate } from 'react-router-dom'
import { usePermissions } from '@/hooks/usePermissions'
import { hasAllPermissions, hasAnyPermission } from '@/lib/permissions'

type PermissionRouteProps = {
  children: React.ReactNode
  /** Require all listed permissions */
  permissions?: string[]
  /** Require any one of these permissions (used when permissions is empty) */
  anyOf?: string[]
  redirectTo?: string
}

export function PermissionRoute({
  children,
  permissions = [],
  anyOf = [],
  redirectTo = '/forbidden',
}: PermissionRouteProps) {
  const { permissions: userPerms, loading } = usePermissions()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--color-muted)]">
        Loading…
      </div>
    )
  }

  const allowed =
    permissions.length > 0
      ? hasAllPermissions(userPerms, permissions)
      : anyOf.length > 0
        ? hasAnyPermission(userPerms, anyOf)
        : true

  if (!allowed) {
    return <Navigate to={redirectTo} replace state={{ forbidden: true }} />
  }

  return <>{children}</>
}
