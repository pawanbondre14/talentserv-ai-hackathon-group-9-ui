import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'

export function PageLoader({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="absolute inset-0 animate-pulse-glow rounded-2xl bg-indigo-500/30 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
      </motion.div>
      <Spinner size="md" label={message} />
    </div>
  )
}
