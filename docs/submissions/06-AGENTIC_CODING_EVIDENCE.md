# Agentic Coding Evidence

## Summary

Agentic AI tools were used from **project kickoff (Phase 0)** through implementation, testing, debugging, and documentation — not added after the product was complete.

The repo includes a version-controlled Cursor toolkit (`.cursor/agents/`, `.cursor/skills/`) and architecture diagrams that document both **product flows** and the **agentic development loop** — see [03-PRODUCT_TECHNICAL_ARCHITECTURE.md](./03-PRODUCT_TECHNICAL_ARCHITECTURE.md#agentic-development-loop).

---

## Where AI Assistance Was Used

### 1) Requirement understanding and grooming (Phase 0)

- Converted Challenge 7 into groomed stories, scope, and acceptance criteria.
- Used [PROJECT_PLAN.md](../../PROJECT_PLAN.md) for tech stack, phased work breakdown, and evaluation alignment.
- Used agent **planner** to split delivery into Phases 1–6.
- Used agent **architect** for stack choice (Clerk, Supabase, dual JSON modes, LangGraph as optional toggle).
- Skill **meetpilot-kickoff** seeded `01-GROOMED_REQUIREMENTS.md` and `02-SOLUTION_IMPLEMENTATION_PLAN.md`.

### 2) Architecture and design (Phases 0–2.5)

- Two-mode processing contract and structured JSON schemas ([PROJECT_PLAN.md](../../PROJECT_PLAN.md)).
- Single-shot vs LangGraph routing (`auto` + `MULTI_WORD_THRESHOLD`) per [MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md).
- Live Microsoft integration + demo fallback design.
- Flow diagrams captured in architecture doc: system context, user journey, backend sequence, LangGraph pipeline, deployment topology.

### 3) Prompt and AI pipeline implementation (Phases 2–2.5)

- Meeting minutes and interview feedback prompt templates.
- JD-fit analysis, chunk classification, specialist review, fairness checks — implemented per [MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md) meeting/interview subgraphs.
- JSON output constraints for deterministic UI rendering.

### 4) Coding and refactoring (Phases 1–6)

- Skills **meetpilot-backend-dev** and **meetpilot-frontend-dev** guided route/service/graph and React page work.
- Skill **meetpilot-feature-slice** scoped each PR-sized milestone.
- Refactors into `app/services/`, `app/graphs/`, and `app/prompts/`.

### 5) Testing and validation (ongoing per phase)

- Agent **test-engineer** for pytest modules (`test_graph_phase_*`, `test_interview_phase5`, ingest, chat, Teams mocks).
- Updates to `04-TEST_PLAN_AND_TEST_CASES.md` as features landed.

### 6) Debugging and iteration

- Agent **debugger** for auth token flow, transcript parsing, LLM JSON parse failures, integration fallbacks.
- Safer defaults: `LLM_MOCK`, mock Teams mode, clearer 4xx/409 errors.

### 7) Documentation and submission packaging

- Agent **submission-scribe** + skill **hackathon-submission-docs** maintained deliverables continuously.
- Architecture flow diagrams added to `03-PRODUCT_TECHNICAL_ARCHITECTURE.md` for evaluator clarity.


---

## Responsible use statement

- AI-generated suggestions were reviewed by team members before merge.
- Final code decisions and security-sensitive configuration were human-validated.
- Sensitive credentials and personal data were not intentionally shared in public evidence artifacts.
