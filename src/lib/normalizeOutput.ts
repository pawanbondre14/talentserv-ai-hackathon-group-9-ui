import type {
  ActionItem,
  Decision,
  DiscussionPoint,
  InterviewFeedbackOutput,
  JdAnalysis,
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

function toList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (value == null) return []
  return [value]
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : formatListEntry(value)
}

export function normalizeStringList(items: unknown): string[] {
  return toList(items).map(formatListEntry).filter((s) => s.length > 0)
}

function normalizeDiscussionPoint(item: unknown): DiscussionPoint {
  const d = asObject(item)
  return {
    topic: text(d.topic ?? item),
    summary: text(d.summary),
    participants: normalizeStringList(d.participants),
  }
}

function normalizeDecision(item: unknown): Decision {
  const d = asObject(item)
  return {
    decision: text(d.decision ?? item),
    rationale: text(d.rationale),
    owner: text(d.owner),
  }
}

function normalizeActionItem(item: unknown): ActionItem {
  const a = asObject(item)
  return {
    task: text(a.task ?? item),
    owner: text(a.owner),
    due_date: text(a.due_date),
    priority: text(a.priority),
  }
}

function normalizeQaPair(item: unknown): QaPair {
  const q = asObject(item)
  return {
    question: text(q.question ?? item),
    answer: text(q.answer),
    notes: text(q.notes),
  }
}

function normalizeScorecardScore(item: unknown): ScorecardScore {
  const s = asObject(item)
  return {
    criterion: text(s.criterion ?? item),
    criterion_id: typeof s.criterion_id === 'string' ? s.criterion_id : undefined,
    score: Number(s.score) || 0,
    notes: text(s.notes) || undefined,
  }
}

function normalizeJdAnalysis(item: unknown): JdAnalysis {
  const jd = asObject(item)
  return {
    overall_fit_score: Number(jd.overall_fit_score) || 0,
    matched_requirements: normalizeStringList(jd.matched_requirements),
    gaps: normalizeStringList(jd.gaps),
    summary: text(jd.summary ?? item),
  }
}

export function normalizeMeetingOutput(data: MeetingMinutesOutput): MeetingMinutesOutput {
  return {
    ...data,
    executive_summary:
      typeof data.executive_summary === 'string' ? data.executive_summary : formatListEntry(data.executive_summary),
    discussion_points: toList(data.discussion_points).map(normalizeDiscussionPoint),
    decisions: toList(data.decisions).map(normalizeDecision),
    action_items: toList(data.action_items).map(normalizeActionItem),
    risks: normalizeStringList(data.risks),
    follow_ups: normalizeStringList(data.follow_ups),
  }
}

export function normalizeInterviewOutput(data: InterviewFeedbackOutput): InterviewFeedbackOutput {
  const sk = asObject(data.skill_observations)
  const normalized: InterviewFeedbackOutput = {
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
    strengths: normalizeStringList(data.strengths),
    concerns: normalizeStringList(data.concerns),
    communication_assessment:
      typeof data.communication_assessment === 'string'
        ? data.communication_assessment
        : formatListEntry(data.communication_assessment),
    rationale: typeof data.rationale === 'string' ? data.rationale : formatListEntry(data.rationale),
    rating: ['Proceed', 'Hold', 'Reject'].includes(data.rating) ? data.rating : 'Hold',
    follow_up_questions: normalizeStringList(data.follow_up_questions),
  }
  if (data.qa_pairs != null) normalized.qa_pairs = toList(data.qa_pairs).map(normalizeQaPair)
  if (data.scorecard_scores != null) {
    normalized.scorecard_scores = toList(data.scorecard_scores).map(normalizeScorecardScore)
  }
  if (data.jd_analysis != null) normalized.jd_analysis = normalizeJdAnalysis(data.jd_analysis)
  return normalized
}
