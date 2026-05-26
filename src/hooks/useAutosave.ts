import { useCallback, useEffect, useRef, useState } from 'react'

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
  const latestValueRef = useRef(value)
  const latestSerializedRef = useRef(serialized)
  const isMountedRef = useRef(true)
  const isSavingRef = useRef(false)
  const saveAgainRef = useRef(false)
  const isFirst = useRef(true)

  useEffect(() => {
    latestValueRef.current = value
    latestSerializedRef.current = serialized
  }, [serialized, value])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const flushSave = useCallback(async () => {
    if (isSavingRef.current) {
      saveAgainRef.current = true
      return
    }

    isSavingRef.current = true
    try {
      do {
        saveAgainRef.current = false
        const valueToSave = latestValueRef.current
        const serializedToSave = latestSerializedRef.current

        setStatus('saving')
        try {
          await saveFnRef.current(valueToSave)
          if (!isMountedRef.current) return
          if (latestSerializedRef.current === serializedToSave) {
            setStatus('saved')
          } else {
            setStatus('pending')
            saveAgainRef.current = true
          }
        } catch {
          if (!isMountedRef.current) return
          if (latestSerializedRef.current === serializedToSave) {
            setStatus('error')
          } else {
            setStatus('pending')
            saveAgainRef.current = true
          }
        }
      } while (saveAgainRef.current && isMountedRef.current)
    } finally {
      isSavingRef.current = false
    }
  }, [])

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
      await flushSave()
    }, delayMs)

    return () => clearTimeout(timer)
  }, [serialized, enabled, delayMs, flushSave])

  return status
}
