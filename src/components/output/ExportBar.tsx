import { useState } from 'react'
import { Copy, Download, FileText } from 'lucide-react'
import type { InterviewFeedbackOutput, MeetingMinutesOutput } from '@/lib/types'
import {
  copyMarkdown,
  downloadDocx,
  downloadMarkdown,
  downloadPdf,
  downloadPlainText,
  interviewToMarkdown,
  meetingToMarkdown,
} from '@/lib/export'

export function ExportBar({
  mode,
  title,
  data,
}: {
  mode: 'meeting' | 'interview'
  title: string
  data: MeetingMinutesOutput | InterviewFeedbackOutput
}) {
  const [copied, setCopied] = useState(false)
  const md =
    mode === 'meeting'
      ? meetingToMarkdown(data as MeetingMinutesOutput, title)
      : interviewToMarkdown(data as InterviewFeedbackOutput, title)
  const safeName = title.replace(/[^\w\-]+/g, '_').slice(0, 40) || 'export'

  async function handleCopy() {
    await copyMarkdown(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/50"
      >
        <Copy className="h-3.5 w-3.5" />
        {copied ? 'Copied!' : 'Copy Markdown'}
      </button>
      <button
        type="button"
        onClick={() => downloadMarkdown(md, `${safeName}.md`)}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/50"
      >
        <FileText className="h-3.5 w-3.5" />
        .md
      </button>
      <button
        type="button"
        onClick={() => downloadPlainText(md, `${safeName}.txt`)}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/50"
      >
        .txt
      </button>
      <button
        type="button"
        onClick={() => downloadPdf(title, md, `${safeName}.pdf`)}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/50"
      >
        <Download className="h-3.5 w-3.5" />
        PDF
      </button>
      <button
        type="button"
        onClick={() => downloadDocx(title, md, `${safeName}.docx`)}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
      >
        <Download className="h-3.5 w-3.5" />
        DOCX
      </button>
    </div>
  )
}
