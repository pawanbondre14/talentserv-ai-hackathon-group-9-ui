import { usePermissions } from '@/hooks/usePermissions'
import { hasAllPermissions, hasAnyPermission } from '@/lib/permissions'

type CanProps = {
  permission?: string
  anyOf?: string[]
  allOf?: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ permission, anyOf, allOf, children, fallback = null }: CanProps) {
  const { permissions } = usePermissions()

  let allowed = true
  if (permission) allowed = permissions.includes(permission)
  else if (allOf?.length) allowed = hasAllPermissions(permissions, allOf)
  else if (anyOf?.length) allowed = hasAnyPermission(permissions, anyOf)

  return allowed ? <>{children}</> : <>{fallback}</>
}
