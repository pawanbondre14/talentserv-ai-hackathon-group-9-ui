import { describe, expect, it } from 'vitest'
import { isDraftNewerThanServer, type DraftBackup } from './useDraftBackup'

const draft = (savedAt: string): DraftBackup<string> => ({
  payload: 'local edits',
  savedAt,
})

describe('isDraftNewerThanServer', () => {
  it('uses local drafts only when they are newer than the server output', () => {
    expect(
      isDraftNewerThanServer(
        draft('2026-06-06T11:05:00.000Z'),
        '2026-06-06T11:04:59.000Z',
      ),
    ).toBe(true)
    expect(
      isDraftNewerThanServer(
        draft('2026-06-06T11:04:59.000Z'),
        '2026-06-06T11:05:00.000Z',
      ),
    ).toBe(false)
  })

  it('rejects untimed legacy drafts when server output has a timestamp', () => {
    expect(isDraftNewerThanServer(draft(''), '2026-06-06T11:05:00.000Z')).toBe(false)
  })

  it('allows drafts when no server output timestamp exists', () => {
    expect(isDraftNewerThanServer(draft(''), null)).toBe(true)
  })
})
