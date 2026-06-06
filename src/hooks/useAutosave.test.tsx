import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, useEffect } from 'react'
import { cleanup, render } from '@testing-library/react'
import { useAutosave, type AutosaveController } from './useAutosave'

interface DeferredSave {
  value: string
  resolve: () => void
  reject: (err: unknown) => void
}

let latestController: AutosaveController<string> | null = null

function Harness({
  value,
  saveFn,
}: {
  value: string
  saveFn: (value: string) => Promise<void>
}) {
  const controller = useAutosave(value, saveFn, true, 10)

  useEffect(() => {
    latestController = controller
  }, [controller])

  return null
}

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    latestController = null
    cleanup()
    vi.useRealTimers()
  })

  it('serializes overlapping saves so the latest value is written last', async () => {
    const deferredSaves: DeferredSave[] = []
    let serverValue = 'initial'
    const saveFn = vi.fn(
      (value: string) =>
        new Promise<void>((resolve, reject) => {
          deferredSaves.push({
            value,
            resolve: () => {
              serverValue = value
              resolve()
            },
            reject,
          })
        }),
    )

    const { rerender } = render(<Harness value="initial" saveFn={saveFn} />)

    rerender(<Harness value="older edit" saveFn={saveFn} />)
    await act(async () => {
      vi.advanceTimersByTime(10)
      await flushPromises()
    })

    expect(saveFn).toHaveBeenCalledTimes(1)
    expect(deferredSaves[0]?.value).toBe('older edit')

    rerender(<Harness value="newer edit" saveFn={saveFn} />)
    await act(async () => {
      vi.advanceTimersByTime(10)
      await flushPromises()
    })

    expect(saveFn).toHaveBeenCalledTimes(1)

    await act(async () => {
      deferredSaves[0]?.resolve()
      await flushPromises()
    })

    expect(saveFn).toHaveBeenCalledTimes(2)
    expect(deferredSaves[1]?.value).toBe('newer edit')

    await act(async () => {
      deferredSaves[1]?.resolve()
      await flushPromises()
    })

    expect(serverValue).toBe('newer edit')
  })

  it('retries an explicit save after an in-flight autosave fails', async () => {
    const deferredSaves: DeferredSave[] = []
    let serverValue = 'initial'
    const saveFn = vi.fn(
      (value: string) =>
        new Promise<void>((resolve, reject) => {
          deferredSaves.push({
            value,
            resolve: () => {
              serverValue = value
              resolve()
            },
            reject,
          })
        }),
    )

    const { rerender } = render(<Harness value="initial" saveFn={saveFn} />)

    rerender(<Harness value="manual edit" saveFn={saveFn} />)
    await act(async () => {
      vi.advanceTimersByTime(10)
      await flushPromises()
    })

    expect(saveFn).toHaveBeenCalledTimes(1)

    const savePromise = latestController?.saveNow('manual edit')
    await act(async () => {
      deferredSaves[0]?.reject(new Error('network'))
      await flushPromises()
    })

    expect(saveFn).toHaveBeenCalledTimes(2)
    expect(deferredSaves[1]?.value).toBe('manual edit')

    await act(async () => {
      deferredSaves[1]?.resolve()
      await savePromise
      await flushPromises()
    })

    expect(serverValue).toBe('manual edit')
  })
})
