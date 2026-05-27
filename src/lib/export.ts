import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'
import { formatListEntry } from '@/lib/normalizeOutput'
import type { InterviewFeedbackOutput, MeetingMinutesOutput } from '@/lib/types'

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
}

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
    ...(data.risks?.length
      ? data.risks.map((r) => `- ${formatListEntry(r)}`)
      : ['_None identified_']),
    '',
    '## Follow-ups',
    ...(data.follow_ups?.length
      ? data.follow_ups.map((f) => `- ${formatListEntry(f)}`)
      : ['_None identified_']),
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

type PdfLayout = {
  margin: number
  pageWidth: number
  pageHeight: number
  contentWidth: number
  y: number
}

function createPdfLayout(doc: jsPDF): PdfLayout {
  const margin = 48
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  return {
    margin,
    pageWidth,
    pageHeight,
    contentWidth: pageWidth - margin * 2,
    y: margin,
  }
}

function ensurePdfSpace(doc: jsPDF, layout: PdfLayout, needed: number) {
  if (layout.y + needed > layout.pageHeight - layout.margin) {
    doc.addPage()
    layout.y = layout.margin
  }
}

function writePdfLines(
  doc: jsPDF,
  layout: PdfLayout,
  lines: string[],
  opts: { fontSize?: number; indent?: number; lineGap?: number; bold?: boolean } = {},
) {
  const fontSize = opts.fontSize ?? 10
  const indent = opts.indent ?? 0
  const lineGap = opts.lineGap ?? 4
  const x = layout.margin + indent

  doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
  doc.setFontSize(fontSize)

  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, layout.contentWidth - indent)
    const blockHeight = wrapped.length * (fontSize + lineGap)
    ensurePdfSpace(doc, layout, blockHeight)
    doc.text(wrapped, x, layout.y)
    layout.y += blockHeight
  }
}

function isTableRow(line: string) {
  return line.trim().startsWith('|') && line.includes('|', 1)
}

function isTableSeparator(line: string) {
  return /^\|[\s\-:|]+\|$/.test(line.trim())
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => stripInlineMarkdown(c.trim()))
}

function renderPdfTable(doc: jsPDF, layout: PdfLayout, rows: string[][]) {
  if (!rows.length) return

  const colCount = rows[0].length
  const colWidth = layout.contentWidth / colCount
  const cellPad = 6
  const fontSize = 9
  const lineGap = 3

  doc.setFontSize(fontSize)

  for (let r = 0; r < rows.length; r++) {
    const isHeader = r === 0
    const cellLines = rows[r].map((cell) =>
      doc.splitTextToSize(cell || '—', colWidth - cellPad * 2),
    )
    const rowHeight =
      Math.max(...cellLines.map((lines) => lines.length)) * (fontSize + lineGap) + cellPad * 2

    ensurePdfSpace(doc, layout, rowHeight + 4)

    const rowTop = layout.y
    if (isHeader) {
      doc.setFillColor(241, 245, 249)
      doc.rect(layout.margin, rowTop - fontSize, layout.contentWidth, rowHeight, 'F')
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setFont('helvetica', 'normal')
    }

    doc.setDrawColor(226, 232, 240)
    doc.rect(layout.margin, rowTop - fontSize, layout.contentWidth, rowHeight)

    let x = layout.margin
    for (let c = 0; c < colCount; c++) {
      doc.text(cellLines[c] ?? ['—'], x + cellPad, rowTop)
      if (c < colCount - 1) {
        doc.line(x + colWidth, rowTop - fontSize, x + colWidth, rowTop - fontSize + rowHeight)
      }
      x += colWidth
    }

    layout.y = rowTop - fontSize + rowHeight + 6
  }

  doc.setFont('helvetica', 'normal')
  layout.y += 4
}

function renderMarkdownToPdf(doc: jsPDF, title: string, markdown: string) {
  const layout = createPdfLayout(doc)
  const displayTitle = stripInlineMarkdown(title.replace(/_/g, ' '))

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(30, 41, 59)
  ensurePdfSpace(doc, layout, 28)
  doc.text(displayTitle, layout.margin, layout.y)
  layout.y += 28

  doc.setTextColor(71, 85, 105)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.text(`Generated ${dateStr}`, layout.margin, layout.y)
  layout.y += 20

  doc.setTextColor(15, 23, 42)
  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trimEnd()

    if (!line.trim()) {
      layout.y += 6
      i++
      continue
    }

    if (line.startsWith('# ')) {
      i++
      continue
    }

    if (isTableRow(line)) {
      const tableRows: string[][] = []
      while (i < lines.length && isTableRow(lines[i])) {
        if (!isTableSeparator(lines[i])) {
          tableRows.push(parseTableRow(lines[i]))
        }
        i++
      }
      renderPdfTable(doc, layout, tableRows)
      continue
    }

    if (line.startsWith('## ')) {
      layout.y += 8
      writePdfLines(doc, layout, [stripInlineMarkdown(line.slice(3))], {
        fontSize: 13,
        bold: true,
        lineGap: 2,
      })
      layout.y += 4
      i++
      continue
    }

    if (line.startsWith('### ')) {
      layout.y += 4
      writePdfLines(doc, layout, [stripInlineMarkdown(line.slice(4))], {
        fontSize: 11,
        bold: true,
        lineGap: 2,
      })
      i++
      continue
    }

    if (line.startsWith('- ')) {
      writePdfLines(doc, layout, [`• ${stripInlineMarkdown(line.slice(2))}`], {
        indent: 12,
        lineGap: 3,
      })
      i++
      continue
    }

    if (line.startsWith('_') && line.endsWith('_')) {
      writePdfLines(doc, layout, [stripInlineMarkdown(line)], {
        fontSize: 9,
        lineGap: 2,
      })
      i++
      continue
    }

    writePdfLines(doc, layout, [stripInlineMarkdown(line)], { lineGap: 4 })
    i++
  }
}

export function downloadPdf(title: string, body: string, filename: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  renderMarkdownToPdf(doc, title, body)
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
