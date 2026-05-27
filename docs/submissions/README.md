# Group 9 Submission Pack

Challenge 7: Meeting Feedback Generator

This folder contains the final submission artifacts for evaluation of both solution quality and engineering process.

## Executive Summary

MeetPilot AI converts raw meeting/interview transcripts into structured, editable outputs with authenticated access, history, export, and integration-ready ingestion flows.

**Live deployment:**

- Frontend: https://pbmeetpilotai.vercel.app
- Backend API: https://talentserv-ai-hackathon-group-9-bac.vercel.app

**Architecture:** [03-PRODUCT_TECHNICAL_ARCHITECTURE.md](./03-PRODUCT_TECHNICAL_ARCHITECTURE.md) includes mermaid flow diagrams — system context, end-to-end user journey, backend sequence, LangGraph pipeline, deployment topology, and agentic development loop.

**Detailed planning (working documents):**

| Document | Purpose |
|----------|---------|
| [PROJECT_PLAN.md](../../PROJECT_PLAN.md) | Original hackathon project plan — tech stack, phased work breakdown, risks, success criteria |
| [MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md) | LangGraph multi-agent design — routing, subgraphs, state model, node patterns, implementation phases |

### What the solution delivers

- Third-party auth with protected application routes.
- Transcript ingestion via paste, file upload (`.txt`, `.vtt`), and Teams/OneDrive import flow.
- Dual AI modes:
  - Meeting minutes (summary, discussion points, decisions, action items, risks, follow-ups).
  - Interview feedback (skills, strengths, concerns, communication, rating, follow-up questions).
- Editable output with persistence and export to Markdown/PDF/DOCX/TXT.
- Interview-focused enhancements: scorecards, JD-fit analysis, blind mode, panel merge support.
- Backend automated test coverage across ingestion, processing, graph routing, interview logic, chat, and integration mocks.

### Transparent limitations

- End-to-end audio speech-to-text pipeline is not fully completed in current implementation.
- Teams integration is production-ready in concept, with demo fallback mode used when Azure live setup is unavailable.

## Future Enhancements (Planned)

- Candidate comparison dashboard to compare two or more candidates side-by-side on scorecards, strengths, concerns, and final recommendation.
- Automated next-round communication workflow:
  - AI-generated email templates for proceed/hold/reject outcomes.
  - One-click send to candidate and hiring panel (with approval gate).
  - Calendar/call scheduling integration for HR and interviewers.
- HR workflow orchestration:
  - Move candidate to next stage automatically after reviewer approval.
  - Trigger reminders for pending feedback and overdue interview loops.
  - Export hiring packet to ATS/HR systems.
- Interview trend analytics:
  - Track decision consistency by role.
  - Identify common skill gaps across candidates.

## Deliverables Index

1. [Submission Tracker](./00-SUBMISSION_TRACKER.md)
2. [Groomed Requirements Document](./01-GROOMED_REQUIREMENTS.md)
3. [Solution / Implementation Plan](./02-SOLUTION_IMPLEMENTATION_PLAN.md)
4. [Product / Technical Architecture](./03-PRODUCT_TECHNICAL_ARCHITECTURE.md)
5. [Test Plan and Test Cases](./04-TEST_PLAN_AND_TEST_CASES.md)
6. [Detailed Critical Review](./05-DETAILED_CRITICAL_REVIEW.md)
7. [Agentic Coding Evidence](./06-AGENTIC_CODING_EVIDENCE.md)
8. [Source Code and Deployment Details](./07-SOURCE_CODE_AND_DEPLOYMENT_DETAILS.md)
9. [Demo Video Guidelines and Script](./08-DEMO_VIDEO_GUIDELINES_AND_SCRIPT.md)

### Supplementary repo planning docs

- [PROJECT_PLAN.md](../../PROJECT_PLAN.md) — full phased build plan and evaluation alignment
- [MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md) — LangGraph orchestration deep dive (referenced in architecture and Phase 2.5)

## Evaluator Quick Path (Suggested Reading Order)

1. `01-GROOMED_REQUIREMENTS.md`
2. `02-SOLUTION_IMPLEMENTATION_PLAN.md`
3. `03-PRODUCT_TECHNICAL_ARCHITECTURE.md`
4. `04-TEST_PLAN_AND_TEST_CASES.md`
5. `05-DETAILED_CRITICAL_REVIEW.md`
6. `06-AGENTIC_CODING_EVIDENCE.md`
7. `07-SOURCE_CODE_AND_DEPLOYMENT_DETAILS.md`
8. `08-DEMO_VIDEO_GUIDELINES_AND_SCRIPT.md`

## Final Checklist Before Submission

- Fill remaining placeholders (evidence links, owner names).
- Deployed URLs: frontend https://pbmeetpilotai.vercel.app · backend https://talentserv-ai-hackathon-group-9-bac.vercel.app (see [07](./07-SOURCE_CODE_AND_DEPLOYMENT_DETAILS.md)).
- Attach proof assets in `docs/submissions/evidence/`.
- Verify no secrets are present in docs/screenshots/video.
- Confirm all deliverables are merged to `main`.
