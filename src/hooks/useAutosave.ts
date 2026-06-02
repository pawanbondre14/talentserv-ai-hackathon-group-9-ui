import { useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

export function useAutosave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  enabled: boolean,
  delayMs = 1500,
  scopeKey = 'default',
) {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const serialized = JSON.stringify(value)
  const isFirst = useRef(true)
  const scopeRef = useRef(scopeKey)

  useEffect(() => {
    if (!enabled) {
      scopeRef.current = scopeKey
      isFirst.current = true
      setStatus('idle')
      return
    }

    if (scopeRef.current !== scopeKey) {
      scopeRef.current = scopeKey
      isFirst.current = true
      return
    }

    if (isFirst.current) {
      isFirst.current = false
      return
    }

    setStatus('pending')
    const timer = setTimeout(async () => {
      setStatus('saving')
      try {
        await saveFn(value)
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    }, delayMs)

    return () => clearTimeout(timer)
  }, [serialized, enabled, delayMs, value, saveFn, scopeKey])

  return status
}
