import { useCallback, useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

export interface AutosaveController<T> {
  status: AutosaveStatus
  saveNow: (nextValue?: T) => Promise<void>
}

export function useAutosave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  enabled: boolean,
  delayMs = 1500,
): AutosaveController<T> {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const saveFnRef = useRef(saveFn)
  const serialized = JSON.stringify(value)
  const latestRef = useRef({ value, serialized })
  const enabledRef = useRef(enabled)
  const lastSavedSerialized = useRef(serialized)
  const isFirst = useRef(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)
  const rerunRef = useRef(false)
  const activeRunRef = useRef<Promise<void> | null>(null)

  const clearPendingTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const runLatestSave = useCallback(async function runLatestSave(
    force = false,
  ): Promise<void> {
    if (savingRef.current) {
      rerunRef.current = true
      await activeRunRef.current
      if (
        force &&
        enabledRef.current &&
        latestRef.current.serialized !== lastSavedSerialized.current
      ) {
        await runLatestSave(true)
      }
      return
    }

    let saveError: unknown
    const run = (async () => {
      let mustSave = force
      savingRef.current = true
      try {
        do {
          rerunRef.current = false
          if (!enabledRef.current && !mustSave) return

          const snapshot = latestRef.current
          if (!mustSave && snapshot.serialized === lastSavedSerialized.current) {
            continue
          }

          setStatus('saving')
          await saveFnRef.current(snapshot.value)
          lastSavedSerialized.current = snapshot.serialized
          mustSave = false

          if (latestRef.current.serialized !== snapshot.serialized) {
            rerunRef.current = true
          }
        } while (rerunRef.current)

        if (enabledRef.current || mustSave) {
          setStatus('saved')
        }
      } catch (err: unknown) {
        saveError = err
        setStatus('error')
      } finally {
        savingRef.current = false
      }
    })()

    activeRunRef.current = run
    try {
      await run
    } finally {
      if (activeRunRef.current === run) activeRunRef.current = null
    }
    if (force && saveError) throw saveError
  }, [])

  const saveNow = useCallback(async (nextValue?: T) => {
    clearPendingTimer()
    if (nextValue !== undefined) {
      const nextSerialized = JSON.stringify(nextValue)
      latestRef.current = { value: nextValue, serialized: nextSerialized }
    }
    if (!enabledRef.current) return
    await runLatestSave(true)
  }, [clearPendingTimer, runLatestSave])

  useEffect(() => {
    saveFnRef.current = saveFn
  }, [saveFn])

  useEffect(() => {
    latestRef.current = { value, serialized }
    enabledRef.current = enabled
  }, [enabled, serialized, value])

  useEffect(() => {
    if (!enabled) {
      clearPendingTimer()
      isFirst.current = true
      lastSavedSerialized.current = serialized
      return
    }
    if (isFirst.current) {
      isFirst.current = false
      lastSavedSerialized.current = serialized
      return
    }

    setStatus('pending')
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      void runLatestSave()
    }, delayMs)

    return clearPendingTimer
  }, [clearPendingTimer, serialized, enabled, delayMs, runLatestSave])

  return { status: enabled ? status : 'idle', saveNow }
}
