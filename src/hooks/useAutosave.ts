import { useCallback, useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

export interface AutosaveState {
  status: AutosaveStatus
  flush: () => Promise<void>
}

export function useAutosave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  enabled: boolean,
  delayMs = 1500,
): AutosaveState {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const saveFnRef = useRef(saveFn)
  const serialized = JSON.stringify(value)
  const valueRef = useRef(value)
  const serializedRef = useRef(serialized)
  const enabledRef = useRef(enabled)
  const mountedRef = useRef(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savePromiseRef = useRef<Promise<void> | null>(null)
  const saveAgainRef = useRef(false)
  const lastSavedSerializedRef = useRef<string | null>(null)
  const isFirst = useRef(true)

  const setAutosaveStatus = useCallback((nextStatus: AutosaveStatus) => {
    if (mountedRef.current) {
      setStatus(nextStatus)
    }
  }, [])

  const clearPendingTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const runSave = useCallback(async () => {
    if (!enabledRef.current) return

    if (savePromiseRef.current) {
      saveAgainRef.current = true
      await savePromiseRef.current
      return
    }

    const savePromise = (async () => {
      try {
        while (enabledRef.current && mountedRef.current) {
          saveAgainRef.current = false
          const valueToSave = valueRef.current
          const serializedToSave = serializedRef.current

          if (serializedToSave === lastSavedSerializedRef.current) {
            setAutosaveStatus('saved')
            return
          }

          setAutosaveStatus('saving')
          try {
            await saveFnRef.current(valueToSave)
            lastSavedSerializedRef.current = serializedToSave
          } catch {
            if (serializedRef.current === serializedToSave) {
              setAutosaveStatus('error')
              return
            }
            setAutosaveStatus('pending')
            saveAgainRef.current = true
          }

          if (!mountedRef.current || !enabledRef.current) return

          if (!saveAgainRef.current && serializedRef.current === serializedToSave) {
            setAutosaveStatus('saved')
            return
          }

          setAutosaveStatus('pending')
        }
      } finally {
        savePromiseRef.current = null
      }
    })()

    savePromiseRef.current = savePromise
    await savePromise
  }, [setAutosaveStatus])

  const flush = useCallback(async () => {
    clearPendingTimer()
    if (serializedRef.current === lastSavedSerializedRef.current) return
    await runSave()
  }, [clearPendingTimer, runSave])

  useEffect(() => {
    saveFnRef.current = saveFn
    valueRef.current = value
    serializedRef.current = serialized
    enabledRef.current = enabled
  }, [saveFn, value, serialized, enabled])

  useEffect(() => {
    return () => {
      mountedRef.current = false
      clearPendingTimer()
    }
  }, [clearPendingTimer])

  useEffect(() => {
    if (!enabled) {
      clearPendingTimer()
      setStatus('idle')
      isFirst.current = true
      return
    }
    if (isFirst.current) {
      isFirst.current = false
      lastSavedSerializedRef.current = serialized
      return
    }
    if (serialized === lastSavedSerializedRef.current) return

    setStatus('pending')
    clearPendingTimer()
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      void runSave()
    }, delayMs)

    return clearPendingTimer
  }, [serialized, enabled, delayMs, clearPendingTimer, runSave])

  return { status: enabled ? status : 'idle', flush }
}
