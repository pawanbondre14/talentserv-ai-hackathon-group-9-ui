import { useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

export function useAutosave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  enabled: boolean,
  delayMs = 1500,
) {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const saveFnRef = useRef(saveFn)
  saveFnRef.current = saveFn
  const serialized = JSON.stringify(value)
  const isFirst = useRef(true)

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
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
        await saveFnRef.current(value)
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    }, delayMs)

    return () => clearTimeout(timer)
  }, [serialized, enabled, delayMs, value])

  return status
}
