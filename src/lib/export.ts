import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'
import type { InterviewFeedbackOutput, MeetingMinutesOutput } from '@/lib/types'

export function meetingToMarkdown(data: MeetingMinutesOutput, title: string): string {
  const sections = [
    `# ${title}`,
    '',
    '## Executive summary',
    data.executive_summary || '_None_',
    '',
    '## Discussion points',
    ...(data.discussion_points?.length
      ? data.discussion_points.map(
          (d) =>
            `### ${d.topic}\n${d.summary}\n_Participants: ${(d.participants || []).join(', ') || '—'}_`,
        )
      : ['_None identified_']),
    '',
    '## Decisions',
    ...(data.decisions?.length
      ? data.decisions.map((d) => `- **${d.decision}** (${d.owner}): ${d.rationale}`)
      : ['_None identified_']),
    '',
    '## Action items',
    '| Task | Owner | Due | Priority |',
    '|------|-------|-----|----------|',
    ...(data.action_items?.length
      ? data.action_items.map(
          (a) => `| ${a.task} | ${a.owner} | ${a.due_date} | ${a.priority} |`,
        )
      : ['| _None identified_ | | | |']),
    '',
    '## Risks',
    ...(data.risks?.length ? data.risks.map((r) => `- ${r}`) : ['_None identified_']),
    '',
    '## Follow-ups',
    ...(data.follow_ups?.length ? data.follow_ups.map((f) => `- ${f}`) : ['_None identified_']),
  ]
  return sections.join('\n')
}

export function interviewToMarkdown(data: InterviewFeedbackOutput, title: string): string {
  const sk = data.skill_observations || ({} as InterviewFeedbackOutput['skill_observations'])
  const sections = [
    `# ${title}`,
    '',
    '## Candidate summary',
    data.candidate_summary || '_None_',
    '',
    `## Rating: **${data.rating || 'Hold'}**`,
    data.rationale || '',
    '',
    '## Skill observations',
    `- Technical: ${sk.technical_skills || 'Not assessed'}`,
    `- Communication: ${sk.communication || 'Not assessed'}`,
    `- Problem solving: ${sk.problem_solving || 'Not assessed'}`,
    `- Culture fit: ${sk.culture_fit || 'Not assessed'}`,
    '',
    '## Strengths',
    ...(data.strengths?.length ? data.strengths.map((s) => `- ${s}`) : ['_None identified_']),
    '',
    '## Concerns',
    ...(data.concerns?.length ? data.concerns.map((c) => `- ${c}`) : ['_None identified_']),
    '',
    '## Communication',
    data.communication_assessment || '_None_',
    '',
    '## Follow-up questions',
    ...(data.follow_up_questions?.length
      ? data.follow_up_questions.map((q) => `- ${q}`)
      : ['_None identified_']),
  ]

  if (data.jd_analysis) {
    const jd = data.jd_analysis
    sections.push(
      '',
      '## JD fit',
      `Score: ${jd.overall_fit_score}/10`,
      jd.summary || '',
      '',
      '### Matched requirements',
      ...(jd.matched_requirements?.length
        ? jd.matched_requirements.map((m) => `- ${m}`)
        : ['_None_']),
      '',
      '### Gaps',
      ...(jd.gaps?.length ? jd.gaps.map((g) => `- ${g}`) : ['_None_']),
    )
  }

  if (data.scorecard_scores?.length) {
    sections.push('', '## Scorecard')
    for (const s of data.scorecard_scores) {
      sections.push(`- ${s.criterion}: ${s.score}/5 — ${s.notes || ''}`)
    }
  }

  if (data.qa_pairs?.length) {
    sections.push('', '## Q&A')
    for (const q of data.qa_pairs) {
      sections.push(`**Q:** ${q.question}`, `**A:** ${q.answer}`, '')
    }
  }

  return sections.join('\n')
}

export async function copyMarkdown(md: string) {
  await navigator.clipboard.writeText(md)
}

export function downloadPlainText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, filename)
}

export function downloadMarkdown(md: string, filename: string) {
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, filename)
}

export function downloadPdf(title: string, body: string, filename: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 48
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2
  doc.setFontSize(16)
  doc.text(title, margin, margin)
  doc.setFontSize(10)
  const split = doc.splitTextToSize(body, pageWidth)
  doc.text(split, margin, margin + 24)
  doc.save(filename)
}

export async function downloadDocx(title: string, body: string, filename: string) {
  const paragraphs = body.split('\n').map(
    (line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line || ' ',
            bold: line.startsWith('#'),
          }),
        ],
        heading: line.startsWith('# ')
          ? HeadingLevel.HEADING_1
          : line.startsWith('## ')
            ? HeadingLevel.HEADING_2
            : undefined,
      }),
  )
  const doc = new Document({
    sections: [{ children: [new Paragraph({ text: title, heading: HeadingLevel.TITLE }), ...paragraphs] }],
  })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
