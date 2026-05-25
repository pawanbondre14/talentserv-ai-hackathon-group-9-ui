import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkRoot } from '@/components/auth/ClerkRoot'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkRoot>
        <App />
      </ClerkRoot>
    </BrowserRouter>
  </StrictMode>,
)
