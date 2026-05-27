/** Permission keys — keep in sync with backend app/constants/permissions.py */

export const PERMISSIONS = {
  SESSIONS_READ: 'sessions:read',
  SESSIONS_WRITE: 'sessions:write',
  SESSIONS_DELETE: 'sessions:delete',
  SESSIONS_CREATE: 'sessions:create',
  SESSIONS_READ_ALL: 'sessions:read_all',
  SESSIONS_WRITE_ALL: 'sessions:write_all',
  SESSIONS_PROCESS: 'sessions:process',
  INGEST_UPLOAD: 'ingest:upload',
  OUTPUT_EDIT: 'output:edit',
  CHAT_USE: 'chat:use',
  INTERVIEW_READ: 'interview:read',
  INTERVIEW_PROCESS: 'interview:process',
  INTEGRATIONS_MICROSOFT: 'integrations:microsoft',
  INTEGRATIONS_TEAMS: 'integrations:teams',
  INTEGRATIONS_ONEDRIVE: 'integrations:onedrive',
  RBAC_MANAGE: 'rbac:manage',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export function hasPermission(
  userPermissions: readonly string[] | Set<string> | undefined,
  required: string,
): boolean {
  if (!userPermissions) return false
  if (userPermissions instanceof Set) return userPermissions.has(required)
  return userPermissions.includes(required)
}

export function hasAnyPermission(
  userPermissions: readonly string[] | Set<string> | undefined,
  required: string[],
): boolean {
  return required.some((p) => hasPermission(userPermissions, p))
}

export function hasAllPermissions(
  userPermissions: readonly string[] | Set<string> | undefined,
  required: string[],
): boolean {
  return required.every((p) => hasPermission(userPermissions, p))
}
