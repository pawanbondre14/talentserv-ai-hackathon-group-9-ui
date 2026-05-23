export interface DiscussionPoint {
  topic: string
  summary: string
  participants: string[]
}

export interface Decision {
  decision: string
  rationale: string
  owner: string
}

export interface ActionItem {
  task: string
  owner: string
  due_date: string
  priority: string
}

export interface MeetingMinutesOutput {
  executive_summary: string
  discussion_points: DiscussionPoint[]
  decisions: Decision[]
  action_items: ActionItem[]
  risks: string[]
  follow_ups: string[]
}

export interface SkillObservations {
  technical_skills: string
  communication: string
  problem_solving: string
  culture_fit: string
}

export interface InterviewFeedbackOutput {
  candidate_summary: string
  skill_observations: SkillObservations
  strengths: string[]
  concerns: string[]
  communication_assessment: string
  rating: 'Proceed' | 'Hold' | 'Reject'
  rationale: string
  follow_up_questions: string[]
}

export interface OutputRecord {
  id: string
  session_id: string
  ai_json: Record<string, unknown> | null
  edited_json: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface SessionWithOutput {
  id: string
  title: string
  mode: 'meeting' | 'interview'
  source: string
  status: string
  word_count: number
  created_at: string
  updated_at: string
  transcript_text: string | null
  teams_meeting_id: string | null
  output: OutputRecord | null
}
