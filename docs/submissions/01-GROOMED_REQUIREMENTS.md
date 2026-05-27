# Groomed Requirements Document

> **Working plan:** Detailed phased breakdown and tech stack rationale are in [PROJECT_PLAN.md](../../PROJECT_PLAN.md). Multi-agent processing scope is in [MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md).

## Challenge

Challenge 7: Meeting Feedback Generator.

The product ingests transcript content and generates structured AI outputs in two modes:

- Meeting Minutes
- Interview/Candidate Feedback

## Problem Statement

Raw meeting and interview transcripts are difficult to convert into actionable summaries. Teams need structured minutes, decisions, and action items for meetings, and consistent evidence-based candidate evaluations for hiring.

## Scope

### In Scope (Current Submission)

- Third-party authentication with protected routes (Clerk).
- Transcript ingestion via paste, file upload (`.txt`, `.vtt`), and OneDrive/Teams-style import (live or demo mode).
- Two output modes:
  - Meeting minutes JSON.
  - Interview feedback JSON.
- Editable AI output and persistent save.
- Export to Markdown, PDF, DOCX, and plain text.
- Session history and search.
- Interview extras: scorecards, JD analysis, blind mode, panel merge API.
- Post-session chat on processed transcript context.

### Out of Scope / Partial for this Hackathon Iteration

- Full end-to-end audio upload + speech-to-text processing pipeline.
- Fully productionized Teams enterprise integration across all tenant scenarios.
- Advanced analytics dashboards (trends, benchmark scoring, etc.).

## Assumptions

- Users authenticate through Clerk and do not manage passwords in-app.
- Transcript quality directly affects output quality; normalization is applied, but semantic cleanup is limited.
- Long transcripts may be chunked and routed to multi-agent processing when LangGraph is enabled (see [LangGraph pipeline diagram](./03-PRODUCT_TECHNICAL_ARCHITECTURE.md#langgraph-ai-pipeline) and [MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md)).
- Microsoft integration can run in demo mode when Azure credentials are not configured.
- Supabase PostgreSQL is available for persistent session/output storage.

## User Personas

- Meeting host needing minutes, decisions, and action tracking.
- Hiring panel member needing structured candidate feedback.
- Recruiter reviewing interview evidence and recommendation.

## User Stories

1. As an authenticated user, I want to create a session from pasted text so I can quickly generate structured output.
2. As an authenticated user, I want to upload transcript files so I can avoid manual copy-paste.
3. As a user, I want to choose meeting vs interview mode so output format matches context.
4. As a user, I want editable output before export so I can correct or refine AI-generated sections.
5. As a user, I want exports (PDF/DOCX/Markdown/TXT) so I can share results with stakeholders.
6. As a user, I want OneDrive/Teams import (or demo equivalent) so I can use existing transcript sources.
7. As a recruiter, I want scorecards/JD fit/blind mode so interview evaluation is consistent and less biased.
8. As a user, I want session search/history so I can retrieve prior summaries.

## Acceptance Criteria

### Authentication

- Clerk sign-in/sign-up available.
- Protected routes block unauthenticated access.
- Auth token is attached to API calls; session-expired UX is handled.

### Transcript Ingestion

- Paste input supports minimum word validation.
- Upload supports `.txt` and `.vtt` with file size limits and parse handling.
- OneDrive/Teams import works in live mode (Azure configured) or mock/demo mode.

### Processing Modes

- Meeting mode returns required sections (`executive_summary`, `discussion_points`, `decisions`, `action_items`, `risks`, `follow_ups`).
- Interview mode returns required sections (`candidate_summary`, `skill_observations`, `strengths`, `concerns`, `communication_assessment`, `rating`, `follow_up_questions`) plus project-specific extras (`qa_pairs`, `scorecard_scores`, optional `jd_analysis`).

### Output / Export

- User can edit output and save updates.
- Export supports Markdown, PDF, DOCX, TXT.

### Testing

- Automated backend tests cover ingestion, auth/session handling, processing flows, graph routing/chunking, and integration mocks.

## Requirement-to-Implementation Status

### Completed

- Auth + protected routes.
- Paste/upload/OneDrive ingestion.
- Meeting + interview processing modes.
- Editable outputs with persistence.
- Multi-format export.
- Teams/OneDrive integration readiness (live + demo fallback).
- Test suite with multiple automated cases.

### Partial / Gap

- Audio ingestion + speech-to-text is not yet implemented as a complete production flow.

## Risks and Mitigations

- Transcript noise/unstructured text: normalized before processing, with minimum word guardrails.
- Long transcript quality/cost: chunking + strategy routing + model tiering.
- Auth/provider outage: clear error messaging, local dev skip-auth mode for development only.
