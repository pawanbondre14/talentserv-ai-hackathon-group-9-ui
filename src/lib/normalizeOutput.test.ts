import { describe, expect, it } from 'vitest'
import { normalizeMeetingOutput } from '@/lib/normalizeOutput'
import type { MeetingMinutesOutput } from '@/lib/types'

describe('normalizeMeetingOutput', () => {
  it('drops blank placeholder rows before saving meeting output', () => {
    const output: MeetingMinutesOutput = {
      executive_summary: 'Summary',
      discussion_points: [
        { topic: '   ', summary: '', participants: ['  '] },
        { topic: '', summary: 'Real discussion', participants: [] },
      ],
      decisions: [
        { decision: '', rationale: ' ', owner: '' },
        { decision: 'Ship the fix', rationale: '', owner: 'Eng' },
      ],
      action_items: [
        { task: '', owner: '', due_date: '', priority: '   ' },
        { task: 'Notify users', owner: '', due_date: '', priority: 'High' },
      ],
      risks: [' ', 'Regression risk'],
      follow_ups: [''],
    }

    expect(normalizeMeetingOutput(output)).toMatchObject({
      discussion_points: [{ topic: '', summary: 'Real discussion', participants: [] }],
      decisions: [{ decision: 'Ship the fix', rationale: '', owner: 'Eng' }],
      action_items: [{ task: 'Notify users', owner: '', due_date: '', priority: 'High' }],
      risks: ['Regression risk'],
      follow_ups: [],
    })
  })
})
