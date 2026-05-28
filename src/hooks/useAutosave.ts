import { useCallback, useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

export function useAutosave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  enabled: boolean,
  delayMs = 1500,
  resetKey: string | null = null,
) {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const saveFnRef = useRef(saveFn)
  const serialized = JSON.stringify(value)
  const valueRef = useRef(value)
  const serializedRef = useRef(serialized)
  const enabledRef = useRef(enabled)
  const generationRef = useRef(0)
  const inFlightGenerationRef = useRef<number | null>(null)
  const pendingGenerationRef = useRef<number | null>(null)
  const isFirst = useRef(true)

  useEffect(() => {
    saveFnRef.current = saveFn
    valueRef.current = value
    serializedRef.current = serialized
    enabledRef.current = enabled
  }, [saveFn, value, serialized, enabled])

  useEffect(() => {
    generationRef.current += 1
    pendingGenerationRef.current = null
    isFirst.current = true
    setStatus('idle')
  }, [resetKey])

  const flushLatest = useCallback(async (generation: number) => {
    if (!enabledRef.current || generation !== generationRef.current) return

    if (inFlightGenerationRef.current === generation) {
      pendingGenerationRef.current = generation
      setStatus('pending')
      return
    }

    inFlightGenerationRef.current = generation
    try {
      while (enabledRef.current && generation === generationRef.current) {
        pendingGenerationRef.current = null
        const valueToSave = valueRef.current
        const serializedToSave = serializedRef.current

        setStatus('saving')
        try {
          await saveFnRef.current(valueToSave)
        } catch {
          if (enabledRef.current && generation === generationRef.current) {
            setStatus('error')
          }
          return
        }

        if (!enabledRef.current || generation !== generationRef.current) return

        if (
          pendingGenerationRef.current !== generation &&
          serializedRef.current === serializedToSave
        ) {
          setStatus('saved')
          return
        }

        setStatus('pending')
      }
    } finally {
      if (inFlightGenerationRef.current === generation) {
        inFlightGenerationRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      generationRef.current += 1
      pendingGenerationRef.current = null
      isFirst.current = true
      setStatus('idle')
      return
    }
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    setStatus('pending')
    const generation = generationRef.current
    const timer = window.setTimeout(() => {
      void flushLatest(generation)
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [serialized, enabled, delayMs, resetKey, flushLatest])

  return status
}
