# Test Plan and Test Cases

> **LangGraph test scope** aligns with [MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md) (implementation phases A–C). **Feature scope** aligns with [PROJECT_PLAN.md](../../PROJECT_PLAN.md).

## Test Strategy

Testing combines automated backend tests and manual end-to-end UI checks.

- Automated focus: API contracts, processing logic, graph routing/chunking, integration adapters.
- Manual focus: auth UX, protected routing, editable output UX, export flows, and Teams import user journey.

## Scope Covered

- Session creation/list/detail/search/delete.
- Transcript ingestion parsing (`.txt`, `.vtt`) and normalization.
- Meeting + interview processing flows.
- LangGraph phases (A/B/C) and strategy routing.
- Interview phase-5 additions: scorecards, JD fit, blind mode metadata.
- Teams/OneDrive mock service and import behavior.
- Session chat API.

## Automated Test Evidence (Backend)

Existing test modules include:

- `test_health.py`
- `test_sessions_auth.py`
- `test_ingest_upload.py`
- `test_search.py`
- `test_delete_session.py`
- `test_llm_parse.py`
- `test_normalize.py`
- `test_vtt_parser.py`
- `test_graph_phase_a.py`
- `test_graph_phase_b.py`
- `test_graph_phase_c.py`
- `test_interview_phase5.py`
- `test_teams_mock.py`
- `test_onedrive_service.py`
- `test_chat.py`
- `test_session_stats.py`

## Core Test Cases

### Happy Path

1. Create session with meeting transcript paste -> process -> output persisted.
2. Create interview session with options (JD + scorecard) -> process -> output includes rating, `qa_pairs`, `scorecard_scores`, `jd_analysis`.
3. Import transcript from OneDrive/demo -> process -> navigate to session detail.
4. Edit output and save -> refresh -> edited content remains.
5. Export same output as Markdown/PDF/DOCX/TXT.

### Validation / Negative

1. Transcript too short fails minimum-word validation on process endpoint.
2. Upload rejects unsupported extension.
3. Upload rejects oversized file.
4. Invalid mode is rejected (`meeting|interview` only).
5. Unauthorized request fails on protected APIs when auth is required.

### Edge and Robustness

1. `.vtt` transcript conversion strips timing header and preserves speaker text.
2. Auto-strategy routes short transcript to single-shot.
3. Auto-strategy routes long transcript to mode-specific graph.
4. Missing optional output sections handled safely (no crash, defaults shown).
5. Teams integration fallback works in mock mode when Azure is unavailable.

## Manual Test Plan

1. Sign in/sign up flow with Clerk.
2. Verify all protected routes redirect unauthenticated users.
3. New session mode switching (meeting/interview).
4. Paste and upload UX with loading and error states.
5. Teams panel:
   - Live connect (if configured).
   - Demo folder import path.
6. Session detail:
   - Output render and inline edits.
   - Autosave indicator.
   - Chat query and response.
7. Export and file opening verification.
8. Privacy banner visibility check.

## Current Test Gaps (Known)

- No complete automated frontend test suite in this repository.
- No completed automated audio/STT test coverage because audio STT flow is not fully implemented.
- Performance/load testing not yet formalized.

## Final Submission Evidence To Attach

- `pytest` terminal output screenshot/log.
- Screenshots of manual auth, import, processing, export, and chat flows.
- Short clip or screenshot proving deployment run (if hosted).
