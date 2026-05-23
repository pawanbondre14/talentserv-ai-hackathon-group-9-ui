import { Shield } from 'lucide-react'

export function PrivacyBanner() {
  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100/90 md:text-sm">
      <span className="inline-flex items-center gap-2">
        <Shield className="h-3.5 w-3.5 shrink-0" />
        AI-processed transcripts require participant consent. Data is stored in your workspace for
        history and search.
      </span>
    </div>
  )
}
