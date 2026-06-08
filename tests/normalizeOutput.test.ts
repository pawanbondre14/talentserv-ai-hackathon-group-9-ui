import { describe, expect, it } from 'vitest'
import {
  normalizeInterviewOutput,
  normalizeMeetingOutput,
  normalizeStringList,
} from '../src/lib/normalizeOutput'
import type { InterviewFeedbackOutput, MeetingMinutesOutput } from '../src/lib/types'

describe('normalizeStringList', () => {
  it('preserves scalar and object values as list entries', () => {
    expect(normalizeStringList('Budget risk')).toEqual(['Budget risk'])
    expect(normalizeStringList({ risk: 'Scope creep' })).toEqual(['Scope creep'])
  })
})

describe('normalizeMeetingOutput', () => {
  it('normalizes object-shaped sections without dropping content', () => {
    const output = normalizeMeetingOutput({
      executive_summary: 'Summary',
      discussion_points: {
        topic: 'Budget',
        summary: 'Budget changed',
        participants: 'Alice, Bob',
      },
      decisions: { decision: 'Approve budget', owner: 'Dana', rationale: 'Critical path' },
      action_items: { task: 'Update plan', owner: 'Eli', due_date: 'Friday', priority: 'High' },
      risks: 'Budget risk',
      follow_ups: { follow_up: 'Send recap' },
    } as unknown as MeetingMinutesOutput)

    expect(output.discussion_points).toEqual([
      { topic: 'Budget', summary: 'Budget changed', participants: ['Alice, Bob'] },
    ])
    expect(output.decisions).toEqual([
      { decision: 'Approve budget', owner: 'Dana', rationale: 'Critical path' },
    ])
    expect(output.action_items).toEqual([
      { task: 'Update plan', owner: 'Eli', due_date: 'Friday', priority: 'High' },
    ])
    expect(output.risks).toEqual(['Budget risk'])
    expect(output.follow_ups).toEqual(['Send recap'])
  })
})

describe('normalizeInterviewOutput', () => {
  it('normalizes scalar and object list fields used by the editor', () => {
    const output = normalizeInterviewOutput({
      candidate_summary: 'Strong candidate',
      skill_observations: {
        technical_skills: { summary: 'Excellent React depth' },
        communication: 'Clear',
        problem_solving: 'Structured',
        culture_fit: 'Collaborative',
      },
      strengths: 'Great communicator',
      concerns: { description: 'Limited backend experience' },
      communication_assessment: 'Clear',
      rating: 'Proceed',
      rationale: 'Strong match',
      follow_up_questions: { question: 'Describe scaling experience' },
      qa_pairs: { question: 'Q1', answer: 'A1', notes: 'N1' },
      scorecard_scores: { criterion: 'Frontend', score: '4', notes: 'Strong' },
      jd_analysis: {
        overall_fit_score: '8',
        matched_requirements: 'React',
        gaps: { description: 'Node depth' },
        summary: 'Good fit',
      },
    } as unknown as InterviewFeedbackOutput)

    expect(output.skill_observations.technical_skills).toBe('Excellent React depth')
    expect(output.strengths).toEqual(['Great communicator'])
    expect(output.concerns).toEqual(['Limited backend experience'])
    expect(output.follow_up_questions).toEqual(['Describe scaling experience'])
    expect(output.qa_pairs).toEqual([{ question: 'Q1', answer: 'A1', notes: 'N1' }])
    expect(output.scorecard_scores).toEqual([
      { criterion: 'Frontend', criterion_id: undefined, score: 4, notes: 'Strong' },
    ])
    expect(output.jd_analysis).toEqual({
      overall_fit_score: 8,
      matched_requirements: ['React'],
      gaps: ['Node depth'],
      summary: 'Good fit',
    })
  })
})
