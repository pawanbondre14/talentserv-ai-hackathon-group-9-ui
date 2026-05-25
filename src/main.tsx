import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  console.warn(
    'Missing VITE_CLERK_PUBLISHABLE_KEY — add it to .env. Auth UI will not work until configured.',
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey ?? ''}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
