import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PermissionRoute } from '@/components/auth/PermissionRoute'
import { AppShell } from '@/components/layout/AppShell'
import { PERMISSIONS } from '@/lib/permissions'
import { Dashboard } from '@/pages/Dashboard'
import { Forbidden } from '@/pages/Forbidden'
import { History } from '@/pages/History'
import { Landing } from '@/pages/Landing'
import { NewSession } from '@/pages/NewSession'
import { SessionDetail } from '@/pages/SessionDetail'
import { SignInPage } from '@/pages/SignIn'
import { SignUpPage } from '@/pages/SignUp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/forbidden" element={<Forbidden />} />
        <Route element={<AppShell />}>
          <Route
            path="/dashboard"
            element={
              <PermissionRoute permissions={[PERMISSIONS.SESSIONS_READ]}>
                <Dashboard />
              </PermissionRoute>
            }
          />
          <Route
            path="/new"
            element={
              <PermissionRoute permissions={[PERMISSIONS.SESSIONS_CREATE]}>
                <NewSession />
              </PermissionRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PermissionRoute permissions={[PERMISSIONS.SESSIONS_READ]}>
                <History />
              </PermissionRoute>
            }
          />
          <Route
            path="/session/:id"
            element={
              <PermissionRoute permissions={[PERMISSIONS.SESSIONS_READ]}>
                <SessionDetail />
              </PermissionRoute>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
