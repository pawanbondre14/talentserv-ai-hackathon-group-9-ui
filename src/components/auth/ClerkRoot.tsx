import { ClerkProvider } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export function ClerkRoot({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  if (!publishableKey) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-red-300">
        <p>
          Missing <code className="text-red-200">VITE_CLERK_PUBLISHABLE_KEY</code> in{' '}
          <code className="text-red-200">.env</code>. Copy it from Clerk Dashboard → API keys.
        </p>
      </div>
    )
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      afterSignOutUrl="/sign-in"
    >
      {children}
    </ClerkProvider>
  )
}
