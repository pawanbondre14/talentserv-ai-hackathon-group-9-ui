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

export function normalizeMeetingOutput(data: MeetingMinutesOutput): MeetingMinutesOutput {
  return {
    ...data,
    executive_summary:
      typeof data.executive_summary === 'string' ? data.executive_summary : formatListEntry(data.executive_summary),
    discussion_points: (data.discussion_points || []).map((d) => ({
      topic: typeof d.topic === 'string' ? d.topic : formatListEntry(d.topic),
      summary: typeof d.summary === 'string' ? d.summary : formatListEntry(d.summary),
      participants: Array.isArray(d.participants)
        ? d.participants.map((p) => (typeof p === 'string' ? p : formatListEntry(p)))
        : [],
    })),
    decisions: (data.decisions || []).map((d) => ({
      decision: typeof d.decision === 'string' ? d.decision : formatListEntry(d.decision),
      rationale: typeof d.rationale === 'string' ? d.rationale : formatListEntry(d.rationale),
      owner: typeof d.owner === 'string' ? d.owner : formatListEntry(d.owner),
    })),
    action_items: (data.action_items || []).map((a) => ({
      task: typeof a.task === 'string' ? a.task : formatListEntry(a.task),
      owner: typeof a.owner === 'string' ? a.owner : formatListEntry(a.owner),
      due_date: typeof a.due_date === 'string' ? a.due_date : formatListEntry(a.due_date),
      priority: typeof a.priority === 'string' ? a.priority : formatListEntry(a.priority),
    })),
    risks: normalizeStringList(data.risks as unknown[]),
    follow_ups: normalizeStringList(data.follow_ups as unknown[]),
  }
}

export function normalizeInterviewOutput(data: InterviewFeedbackOutput): InterviewFeedbackOutput {
  const sk = data.skill_observations || ({} as InterviewFeedbackOutput['skill_observations'])
  const jd = data.jd_analysis
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
    qa_pairs: (data.qa_pairs || []).map((pair) => ({
      question: formatListEntry(pair.question),
      answer: formatListEntry(pair.answer),
      notes: formatListEntry(pair.notes),
    })),
    scorecard_scores: (data.scorecard_scores || []).map((score) => ({
      criterion: formatListEntry(score.criterion),
      criterion_id:
        typeof score.criterion_id === 'string' && score.criterion_id.trim()
          ? score.criterion_id
          : undefined,
      score: Number.isFinite(Number(score.score)) ? Number(score.score) : 0,
      notes: score.notes == null ? undefined : formatListEntry(score.notes),
    })),
    jd_analysis: jd
      ? {
          overall_fit_score: Number.isFinite(Number(jd.overall_fit_score))
            ? Number(jd.overall_fit_score)
            : 0,
          matched_requirements: normalizeStringList(jd.matched_requirements as unknown[]),
          gaps: normalizeStringList(jd.gaps as unknown[]),
          summary: formatListEntry(jd.summary),
        }
      : undefined,
    panel_notes: data.panel_notes == null ? undefined : formatListEntry(data.panel_notes),
  }
}
