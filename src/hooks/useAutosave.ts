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
  const serialized = JSON.stringify(value)
  const valueRef = useRef(value)
  const serializedRef = useRef(serialized)
  const enabledRef = useRef(enabled)
  const inFlightRef = useRef(false)
  const pendingRef = useRef(false)
  const generationRef = useRef(0)
  const lastSavedSerializedRef = useRef<string | null>(null)
  const isFirst = useRef(true)

  useEffect(() => {
    saveFnRef.current = saveFn
    valueRef.current = value
    serializedRef.current = serialized
    enabledRef.current = enabled
  }, [saveFn, value, serialized, enabled])

  const flushLatest = useCallback(async (generation: number) => {
    if (!enabledRef.current || generation !== generationRef.current) return

    if (inFlightRef.current) {
      pendingRef.current = true
      setStatus('pending')
      return
    }

    inFlightRef.current = true
    try {
      while (enabledRef.current && generation === generationRef.current) {
        pendingRef.current = false
        setStatus('saving')

        const valueToSave = valueRef.current
        const serializedToSave = serializedRef.current
        const saveFnToUse = saveFnRef.current

        try {
          await saveFnToUse(valueToSave)
          lastSavedSerializedRef.current = serializedToSave
        } catch {
          if (generation === generationRef.current) {
            setStatus('error')
          }
          return
        }

        if (!enabledRef.current || generation !== generationRef.current) return

        if (!pendingRef.current && serializedRef.current === serializedToSave) {
          setStatus('saved')
          return
        }

        setStatus('pending')
      }
    } finally {
      inFlightRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      generationRef.current += 1
      isFirst.current = true
      pendingRef.current = false
      return
    }
    if (isFirst.current) {
      isFirst.current = false
      lastSavedSerializedRef.current = serialized
      return
    }
    if (serialized === lastSavedSerializedRef.current) return

    setStatus('pending')
    const generation = generationRef.current
    const timer = setTimeout(() => {
      void flushLatest(generation)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [serialized, enabled, delayMs, saveFn, flushLatest])

  return enabled ? status : 'idle'
}
