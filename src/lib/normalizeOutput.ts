import type { InterviewFeedbackOutput, MeetingMinutesOutput } from '@/lib/types'

/** Turn LLM string-or-object list items into plain strings for inputs and export. */
export function formatListEntry(item: unknown): string {
  if (typeof item === 'string') return item.trim() || ''
  if (item && typeof item === 'object') {
    const o = item as Record<string, unknown>
    const text =
      o.risk ??
      o.description ??
      o.text ??
      o.follow_up ??
      o.item ??
      o.summary ??
      o.note
    if (typeof text === 'string' && text.trim()) return text.trim()
    const parts = Object.values(o).filter((v) => typeof v === 'string' && v.trim()) as string[]
    if (parts.length) return parts.join(' — ')
  }
  if (item == null) return ''
  return String(item)
}

export function normalizeStringList(items: unknown[] | undefined | null): string[] {
  if (!items?.length) return []
  return items.map(formatListEntry).filter((s) => s.length > 0)
}

function hasContent(...values: string[]): boolean {
  return values.some((value) => value.trim().length > 0)
}

export function normalizeMeetingOutput(data: MeetingMinutesOutput): MeetingMinutesOutput {
  return {
    ...data,
    executive_summary:
      typeof data.executive_summary === 'string' ? data.executive_summary : formatListEntry(data.executive_summary),
    discussion_points: (data.discussion_points || [])
      .map((d) => {
        const participants = Array.isArray(d.participants)
          ? d.participants
              .map((p) => (typeof p === 'string' ? p : formatListEntry(p)))
              .filter((p) => p.trim().length > 0)
          : []
        return {
          topic: typeof d.topic === 'string' ? d.topic : formatListEntry(d.topic),
          summary: typeof d.summary === 'string' ? d.summary : formatListEntry(d.summary),
          participants,
        }
      })
      .filter((d) => hasContent(d.topic, d.summary, ...d.participants)),
    decisions: (data.decisions || [])
      .map((d) => ({
        decision: typeof d.decision === 'string' ? d.decision : formatListEntry(d.decision),
        rationale: typeof d.rationale === 'string' ? d.rationale : formatListEntry(d.rationale),
        owner: typeof d.owner === 'string' ? d.owner : formatListEntry(d.owner),
      }))
      .filter((d) => hasContent(d.decision, d.rationale, d.owner)),
    action_items: (data.action_items || [])
      .map((a) => ({
        task: typeof a.task === 'string' ? a.task : formatListEntry(a.task),
        owner: typeof a.owner === 'string' ? a.owner : formatListEntry(a.owner),
        due_date: typeof a.due_date === 'string' ? a.due_date : formatListEntry(a.due_date),
        priority: typeof a.priority === 'string' ? a.priority : formatListEntry(a.priority),
      }))
      .filter((a) => hasContent(a.task, a.owner, a.due_date, a.priority)),
    risks: normalizeStringList(data.risks as unknown[]),
    follow_ups: normalizeStringList(data.follow_ups as unknown[]),
  }
}

export function normalizeInterviewOutput(data: InterviewFeedbackOutput): InterviewFeedbackOutput {
  const sk = data.skill_observations || ({} as InterviewFeedbackOutput['skill_observations'])
  return {
    ...data,
    candidate_summary:
      typeof data.candidate_summary === 'string'
        ? data.candidate_summary
        : formatListEntry(data.candidate_summary),
    skill_observations: {
      technical_skills: formatListEntry(sk.technical_skills) || '',
      communication: formatListEntry(sk.communication) || '',
      problem_solving: formatListEntry(sk.problem_solving) || '',
      culture_fit: formatListEntry(sk.culture_fit) || '',
    },
    strengths: normalizeStringList(data.strengths as unknown[]),
    concerns: normalizeStringList(data.concerns as unknown[]),
    communication_assessment:
      typeof data.communication_assessment === 'string'
        ? data.communication_assessment
        : formatListEntry(data.communication_assessment),
    rationale: typeof data.rationale === 'string' ? data.rationale : formatListEntry(data.rationale),
    follow_up_questions: normalizeStringList(data.follow_up_questions as unknown[]),
  }
}
