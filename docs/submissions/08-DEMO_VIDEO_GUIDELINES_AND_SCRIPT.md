# Demo Video Guidelines and Script (10-12 Minutes)

## Mandatory Guardrails

- Use only group number and challenge name.
- Do not mention individual member names.
- Do not show credentials, tokens, personal data, or confidential internal information.

## Recommended Timeline

- Introduction and methodology: 2-4 minutes
- Application demo: 4-6 minutes
- Wrap-up: 1-2 minutes

## Recording Checklist

- Clean browser profile (no sensitive bookmarks/account info visible).
- Use sample transcripts only.
- Keep `.env`/token files closed.
- Pre-open app tabs and terminal windows needed for smooth flow.

## Script

## 1) Introduction and Methodology (2-4 min)

1. "We are Group 9 presenting Challenge 7: Meeting Feedback Generator."
2. Explain problem statement:
   - Raw transcript -> actionable minutes or hiring feedback.
3. Explain workflow:
   - Authenticated access.
   - Optional: show **End-to-End User Flow** or **LangGraph pipeline** from [03-PRODUCT_TECHNICAL_ARCHITECTURE.md](./03-PRODUCT_TECHNICAL_ARCHITECTURE.md) (30–45 sec).
   - Input options (paste/upload/OneDrive import).
   - Two processing modes.
   - Editable output and exports.
4. Explain AI methodology:
   - Prompt-driven structured JSON extraction.
   - Optional LangGraph multi-agent path for long transcripts ([MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md) · [architecture diagram](./03-PRODUCT_TECHNICAL_ARCHITECTURE.md#langgraph-ai-pipeline)).
   - Phased delivery from foundation to integrations ([PROJECT_PLAN.md](../../PROJECT_PLAN.md)).
   - Human review before sharing/export.

## 2) Application Demo (4-6 min)

**Live app:** https://pbmeetpilotai.vercel.app (API: https://talentserv-ai-hackathon-group-9-bac.vercel.app)

1. Show sign-in and protected route access.
2. Create a new session (paste or upload transcript).
3. Run Meeting mode and show structured output sections.
4. Run Interview mode and show:
   - Rating,
   - skill observations,
   - strengths/concerns,
   - optional JD/scorecard enrichment.
5. Show output edit and save.
6. Show export options (PDF/DOCX/Markdown/TXT).
7. Show Teams/OneDrive tab:
   - Live connect if available, else demo fallback.
8. Show test evidence quickly (test logs/screenshots).
9. Show known limitations clearly (audio STT and other partials).

## 3) Wrap-up (1-2 min)

1. Share rough effort split across:
   - grooming,
   - planning,
   - implementation,
   - testing,
   - review,
   - deployment.
2. Key learning from agentic coding:
   - faster scaffolding,
   - faster iteration,
   - need for human validation.
3. What would improve next:
   - audio STT,
   - stronger frontend test coverage,
   - queue-based long transcript processing.

## Suggested Closing Line

"This submission demonstrates both working functionality and the engineering process used to deliver it with agentic coding practices."
