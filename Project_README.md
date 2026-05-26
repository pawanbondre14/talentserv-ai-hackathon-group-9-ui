# MeetPilot AI (HackFeed) — Turn Talk Into Action

**Challenge:** Challenge 7 — Meeting Feedback Generator  
**Team:** Talentserv AI Hackathon — Group 9  
**Tagline:** AI-powered **meeting minutes** and **interview hiring feedback** from transcripts, with Teams/OneDrive import, session history, and post-session Q&A.

| Component | Repository folder | Stack |
|-----------|-------------------|--------|
| **Backend** | [`talentserv-ai-hackathon-group-9-backend`](./talentserv-ai-hackathon-group-9-backend) | FastAPI, Supabase Postgres, Clerk JWT, OpenAI, **LangGraph** |
| **Frontend** | [`talentserv-ai-hackathon-group-9-ui`](./talentserv-ai-hackathon-group-9-ui) | React 19, Vite, Tailwind, Clerk |

---

## 1. Problem statement

Organizations capture meetings and interviews as raw text (VTT, paste, uploads) but struggle to turn them into **actionable, structured output**:

- **Meetings:** decisions, owners, action items, risks, and follow-ups get lost in long transcripts.
- **Interviews:** hiring panels need consistent, evidence-based feedback (skills, communication, rating) without manual note synthesis.

MeetPilot AI ingests transcripts, runs specialized AI pipelines, and returns **editable JSON** the user can export (Markdown, PDF, DOCX) and search later.

---

## 2. Solution overview

| Capability | Description |
|------------|-------------|
| **Dual modes** | `meeting` → structured minutes; `interview` → hiring feedback (`Proceed` / `Hold` / `Reject`) |
| **Multi-agent AI (LangGraph)** | Map-reduce on long transcripts + parallel specialist reviewers (interview) |
| **Smart routing** | Short transcripts → single LLM call; long → multi-node graph (`strategy=auto`) |
| **Auth & persistence** | Clerk sign-in; Supabase stores sessions, outputs, chat history |
| **Teams / OneDrive** | Browse personal OneDrive folders; import `.txt` / `.vtt` via Microsoft Graph (demo mode without Azure) |
| **Post-session chat** | Ask questions about transcript + AI output in context |
| **Interview extras** | Scorecards, blind mode (PII redaction), panel transcript merge |

---

## 3. Architecture (high level)

```
┌─────────────────────────────────────────────────────────────┐
│  React UI (Vite) — Clerk auth, sessions, export, Teams tab   │
└────────────────────────────┬────────────────────────────────┘
                             │ REST /api
┌────────────────────────────▼────────────────────────────────┐
│  FastAPI — sessions, ingest, process, chat, Microsoft Graph   │
│  LangGraph parent graph → meeting_graph | interview_graph     │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         Supabase       OpenAI API      Clerk JWT
         Postgres
```

**AI pipeline (when `LANGGRAPH_ENABLED=true`):**

```
preprocess → budget_check → route_strategy
    → single_shot  OR  meeting_graph  OR  interview_graph
    → validate_output → structured JSON
```

Details: [MULTI_AGENT_PLAN.md](./MULTI_AGENT_PLAN.md) · Backend: [talentserv-ai-hackathon-group-9-backend/README.md](./talentserv-ai-hackathon-group-9-backend/README.md)

---

## 4. Solution plan / implementation plan

### 4.1 Approach

We split the hackathon into **infrastructure first**, then **core AI**, then **integrations** and **UX polish**, so judges could run the app at every milestone.

| Phase | Focus | Outcome |
|-------|--------|---------|
| **1** | Auth, DB, sessions API, React shell | End-to-end login → create session → list history |
| **2** | LLM processing, structured JSON, export | Meeting + interview modes on `/process` |
| **2.5** | LangGraph orchestration | Single graph entry; multi-agent for long transcripts |
| **3** | Search, autosave, uploads | Production-like session workflow |
| **4** | Microsoft Teams / OneDrive | OAuth + folder browser; import `.txt` / `.vtt` |
| **5** | Interview extras | Scorecards, blind mode, panel merge API |
| **6** | Session chat | RAG-style Q&A on transcript + output |

### 4.2 Key modules

| Module | Location | Responsibility |
|--------|----------|----------------|
| **Session & ingest** | `backend/app/routes/sessions.py`, `ingest.py` | CRUD, transcript upload/paste, normalization |
| **Process & output** | `backend/app/routes/process.py` | `POST …/process`, patch output, full session payload |
| **Graph runner** | `backend/app/services/graph_runner.py` | LangGraph vs legacy routing |
| **Parent graph** | `backend/app/graphs/parent.py` | Preprocess, budget, route, validate |
| **Meeting subgraph** | `backend/app/graphs/meeting/` | Chunk summarize → merge → synthesize minutes |
| **Interview subgraph** | `backend/app/graphs/interview/` | Classify chunks → parallel reviewers → hiring + fairness |
| **LLM service** | `backend/app/services/llm.py` | OpenAI client, `complete_json`, mock mode |
| **Interview tools** | `backend/app/routes/interview.py`, `interview_processor.py` | Scorecards, panel merge, blind mode |
| **Microsoft / OneDrive** | `backend/app/routes/microsoft.py`, `onedrive.py`, `teams.py` | OAuth, folder browse, VTT/TXT import |
| **Chat** | `backend/app/routes/chat.py` | Persisted session Q&A |
| **UI pages** | `frontend/src/pages/` | Dashboard, NewSession, SessionDetail, History |
| **OneDrive UI** | `frontend/src/components/teams/TeamsImportPanel.tsx` | Connect, browse, import |
| **API client** | `frontend/src/lib/api.ts` | Authenticated calls to backend |

### 4.3 Implementation sequence

1. **Supabase schema** + FastAPI health + Clerk JWT middleware  
2. **Frontend** protected routes + session create/list  
3. **Single-shot LLM** prompts (meeting minutes, interview feedback) + `POST /process`  
4. **Output viewer** + export (MD/PDF/DOCX) + editable fields  
5. **LangGraph Phase A** — wrap single-shot in parent graph + validate node  
6. **LangGraph Phase B** — meeting map-reduce (`Send` per chunk)  
7. **LangGraph Phase C** — interview classify + parallel dimension reviewers + fairness  
8. **History search** + debounced autosave  
9. **Teams/OneDrive** — OAuth, folder browser, import + demo mocks  
10. **Interview extras** — scorecards, blind mode, panel merge  
11. **Session chat** API + UI panel  

### 4.4 Team responsibilities (template — update names)

| Area | Typical ownership | Deliverables |
|------|-------------------|--------------|
| **Backend API & DB** | Member A | Sessions, auth, Supabase migrations |
| **AI / LangGraph** | Member B | Graphs, prompts, `graph_runner`, samples |
| **Frontend core** | Member C | New session, session detail, process UX |
| **Integrations** | Member D | Microsoft Graph, Teams tab, deploy |
| **QA & docs** | All | Sample transcripts, README, demo script |

> **Action for team:** Replace Member A–D with real names and GitHub handles before submission.

---

## 5. Feature checklist (for evaluators)

- [x] User authentication (Clerk)
- [x] Create session with pasted or uploaded transcript
- [x] AI generate meeting minutes (structured JSON)
- [x] AI generate interview feedback (rating, skills, evidence)
- [x] LangGraph multi-agent path for long transcripts (`LANGGRAPH_ENABLED`, `strategy=multi|auto`)
- [x] Edit and persist AI output
- [x] Export (Markdown, PDF, DOCX, TXT)
- [x] Session history with search
- [x] Teams / OneDrive folder browse + transcript import (live + mock)
- [x] Post-session chat on processed sessions
- [x] Interview scorecards, blind mode, panel merge API
- [x] `LLM_MOCK=true` for demo without API keys
- [x] Pytest coverage for graph phases (backend)

---

## 6. AI / “multi-agent” explanation (demo script)

**One-liner:** *We use LangGraph to orchestrate specialist AI steps—not a single prompt on the whole transcript.*

- **Short transcript:** one fast path (`single_shot`).
- **Long meeting:** split into chunks → summarize in parallel → merge actions → synthesize minutes.
- **Long interview:** classify each chunk → **technical / communication / culture** reviewers in parallel → synthesize hiring decision → **fairness** check.
- **Why not tool-calling agents?** Fixed workflow = predictable cost, latency, and JSON schema for production use.

Sample files: [`talentserv-ai-hackathon-group-9-backend/samples/`](./talentserv-ai-hackathon-group-9-backend/samples/README.md)

---

## 7. Quick start (local)

### Prerequisites

- Python 3.11+, Node 18+
- Supabase project, Clerk app, OpenAI API key (or `LLM_MOCK=true`)

### Backend

```bash
cd talentserv-ai-hackathon-group-9-backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # set DATABASE_URL, CLERK_*, OPENAI_API_KEY
# Optional multi-agent:
# LANGGRAPH_ENABLED=true
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd talentserv-ai-hackathon-group-9-ui
npm install
copy .env.example .env         # VITE_CLERK_PUBLISHABLE_KEY, VITE_API_URL=http://localhost:8000
npm run dev
```

Open **http://localhost:5173** · API docs **http://localhost:8000/docs**

---

## 8. Demo flow (recommended for judges)

1. Sign in → **New session** → paste `samples/interview_long_sample.txt` or `interview_multi_agent_sample.txt`.
2. Mode **Interview** → **Generate** (enable LangGraph + `strategy=multi` for multi-agent sample).
3. Open **Session detail** → review rating, strengths, concerns, skill observations.
4. **Export** PDF or DOCX → show structured output.
5. **Teams / OneDrive** tab → connect Microsoft (live) or browse demo folders → import `.vtt` / `.txt`.
6. **Chat** tab → ask “What were the main technical strengths?”
7. Repeat with **Meeting** mode + `meeting_multi_agent_sample.txt`.

---

## 9. Documentation index

| Document | Purpose |
|----------|---------|
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | Full product & phase breakdown |
| [MULTI_AGENT_PLAN.md](./MULTI_AGENT_PLAN.md) | LangGraph design, state, nodes |
| [Backend README](../talentserv-ai-hackathon-group-9-backend/README.md) | API phases, env, deploy, tests |
| [Frontend README](./README.md) | UI setup, routes, deploy |
| [TEAMS_ONEDRIVE_SETUP.md](../talentserv-ai-hackathon-group-9-backend/TEAMS_ONEDRIVE_SETUP.md) | Azure registration + OneDrive integration |
| [samples/README](../talentserv-ai-hackathon-group-9-backend/samples/README.md) | Test transcripts |

---

## 10. Agentic development evidence

Screenshots or logs of AI-assisted development (Cursor, Claude, etc.) can be placed under `docs/agentic/` for submission requirements.

---

## 11. License & acknowledgments

Hackathon submission — Talentserv AI Hackathon Group 9.  
Built with FastAPI, React, Supabase, Clerk, OpenAI, and LangGraph.
