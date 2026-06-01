import type {
  InterviewFeedbackOutput,
  MeetingMinutesOutput,
  QaPair,
  ScorecardScore,
} from '@/lib/types'

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

function asRecord(item: unknown): Record<string, unknown> | null {
  return item && typeof item === 'object' ? (item as Record<string, unknown>) : null
}

function asList(items: unknown): unknown[] {
  if (Array.isArray(items)) return items
  return items == null ? [] : [items]
}

function finiteNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function normalizeStringList(items: unknown): string[] {
  return asList(items).map(formatListEntry).filter((s) => s.length > 0)
}

function normalizeRating(value: unknown): InterviewFeedbackOutput['rating'] {
  const rating = formatListEntry(value).toLowerCase()
  if (rating === 'proceed') return 'Proceed'
  if (rating === 'reject') return 'Reject'
  return 'Hold'
}

function normalizeQaPairs(items: unknown): QaPair[] {
  return asList(items)
    .map((item) => {
      const o = asRecord(item)
      if (!o) {
        return { question: formatListEntry(item), answer: '', notes: '' }
      }
      return {
        question: formatListEntry(o.question ?? o.q ?? o.prompt ?? o.question_text),
        answer: formatListEntry(o.answer ?? o.a ?? o.response ?? o.summary ?? o.answer_summary),
        notes: formatListEntry(o.notes ?? o.note ?? o.evidence),
      }
    })
    .filter((q) => q.question || q.answer || q.notes)
}

function normalizeScorecardScores(items: unknown): ScorecardScore[] {
  return asList(items)
    .map((item) => {
      const o = asRecord(item)
      if (!o) {
        return { criterion: formatListEntry(item), score: 0 }
      }
      return {
        criterion: formatListEntry(o.criterion ?? o.label ?? o.name),
        criterion_id: formatListEntry(o.criterion_id ?? o.id) || undefined,
        score: finiteNumber(o.score ?? o.rating ?? o.value),
        notes: formatListEntry(o.notes ?? o.note ?? o.rationale) || undefined,
      }
    })
    .filter((s) => s.criterion || s.notes || s.score > 0)
}

function normalizeJdAnalysis(
  value: unknown,
): InterviewFeedbackOutput['jd_analysis'] | undefined {
  const jd = asRecord(value)
  if (!jd) return undefined
  return {
    overall_fit_score: finiteNumber(jd.overall_fit_score ?? jd.score ?? jd.fit_score),
    matched_requirements: normalizeStringList(
      jd.matched_requirements ?? jd.matches ?? jd.requirements,
    ),
    gaps: normalizeStringList(jd.gaps ?? jd.gap_analysis),
    summary: formatListEntry(jd.summary ?? jd.overview ?? jd.analysis),
  }
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
  const panelNotes =
    data.panel_notes == null ? undefined : formatListEntry(data.panel_notes)
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
    rating: normalizeRating(data.rating),
    rationale: typeof data.rationale === 'string' ? data.rationale : formatListEntry(data.rationale),
    follow_up_questions: normalizeStringList(data.follow_up_questions as unknown[]),
    qa_pairs: normalizeQaPairs(data.qa_pairs),
    scorecard_scores: normalizeScorecardScores(data.scorecard_scores),
    jd_analysis: normalizeJdAnalysis(data.jd_analysis),
    panel_notes: panelNotes,
  }
}
