# Product / Technical Architecture Document

## Architecture Summary

MeetPilot AI is a two-tier web application:

- Frontend: React + Vite SPA with Clerk authentication and protected routes.
- Backend: FastAPI service exposing session, processing, import, and chat APIs.
- Data: Supabase PostgreSQL for users, sessions, outputs, metadata, and chat.
- AI: OpenAI-backed processing with optional LangGraph orchestration.
- Integrations: Clerk (auth), Microsoft Graph/OneDrive (transcript import), export toolchain (PDF/DOCX/MD/TXT).

**Related planning docs:** [PROJECT_PLAN.md](../../PROJECT_PLAN.md) (overall build) · [MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md) (LangGraph pipeline detail)

**Diagram index:** [System context](#system-context-diagram) · [End-to-end user flow](#end-to-end-user-flow) · [Backend processing flow](#backend-processing-flow) · [LangGraph pipeline](#langgraph-ai-pipeline) · [Deployment topology](#deployment-topology) · [Agentic dev loop](#agentic-development-loop)

---

## System Context Diagram

External systems and major MeetPilot components.

```mermaid
flowchart TB
  subgraph Users
    U[Meeting host / Hiring panel / Recruiter]
  end

  subgraph MeetPilot["MeetPilot AI"]
    FE[React + Vite SPA]
    BE[FastAPI Backend]
    DB[(Supabase PostgreSQL)]
  end

  subgraph External["External Services"]
    CLERK[Clerk Auth]
    OAI[OpenAI API]
    MS[Microsoft Graph / OneDrive]
  end

  U -->|Browser| FE
  FE -->|JWT Bearer API calls| BE
  FE -->|Sign-in / session| CLERK
  BE -->|Verify JWT| CLERK
  BE -->|Sessions, outputs, chat| DB
  BE -->|LLM + LangGraph| OAI
  BE -->|OAuth + transcript import| MS
  FE -->|Client-side export MD/PDF/DOCX/TXT| U
```

---

## End-to-End User Flow

Primary journey from sign-in through export and optional chat.

```mermaid
flowchart TD
  A[Landing / Sign in via Clerk] --> B[Protected Dashboard]
  B --> C{Create session}
  C -->|Paste| D[NewSession — paste transcript]
  C -->|Upload .txt / .vtt| E[NewSession — file upload]
  C -->|OneDrive / Teams| F[Import panel — live or demo mode]

  D --> G[Select mode: meeting or interview]
  E --> G
  F --> G

  G --> H[Backend: normalize + validate word count]
  H --> I{Process session}
  I --> J[AI pipeline — single-shot or LangGraph]
  J --> K[Structured JSON stored in Supabase]
  K --> L[SessionDetail — review and edit output]

  L --> M{User actions}
  M -->|Save edits| K
  M -->|Export| N[MD / PDF / DOCX / TXT download]
  M -->|Chat| O[Context-aware Q&A on transcript + output]
  M -->|History| P[Search and reopen past sessions]

  subgraph InterviewExtras["Interview-only options"]
    G --> Q[Scorecard / JD / blind mode / panel merge]
    Q --> H
  end
```

**Step summary**

1. User authenticates via Clerk.
2. User creates a session via paste, upload, or OneDrive/Teams import.
3. Backend normalizes the transcript and validates minimum input quality.
4. Processing runs in selected mode (`meeting` or `interview`).
5. Structured output JSON is stored and returned to the UI.
6. User edits output, exports, searches history, and optionally chats with session context.

---

## Backend Processing Flow

Request path from ingest through persistence.

```mermaid
sequenceDiagram
  participant UI as React SPA
  participant API as FastAPI Routes
  participant SVC as Services
  participant GR as Graph Runner
  participant LG as LangGraph / LLM
  participant DB as Supabase Postgres

  UI->>API: POST /api/sessions (create)
  API->>DB: Insert SessionRecord (draft)

  UI->>API: POST ingest / upload / OneDrive import
  API->>SVC: normalize_transcript()
  SVC->>DB: Update transcript + word_count

  UI->>API: POST /api/sessions/{id}/process
  API->>DB: status = processing
  API->>GR: run pipeline (mode, strategy)
  alt LangGraph enabled + auto/multi
    GR->>LG: parent graph → subgraph
  else Single-shot
    GR->>LG: complete_json (one call)
  end
  LG-->>GR: structured JSON
  GR->>SVC: validate_output
  SVC->>DB: Save Output + status = ready
  API-->>UI: ai_json response

  UI->>API: PATCH output / POST chat
  API->>DB: Persist edits / chat messages
```

**Route domains**

| Domain | Key routes | Responsibility |
|--------|------------|----------------|
| Sessions | `sessions.py` | CRUD, list, search, stats |
| Ingest | `ingest.py` | Upload, parse, normalize |
| Process | `process.py` | AI pipeline, output patch |
| Interview | `interview.py` | Scorecards, panel merge |
| Microsoft | `microsoft.py`, `onedrive.py` | OAuth, browse, import |
| Chat | `chat.py` | Session-context Q&A |

---

## LangGraph AI Pipeline

Optional multi-agent path when `LANGGRAPH_ENABLED=true` and routing selects a subgraph.

**Authoritative design reference:** [MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md) — when to use single vs multi-agent, design principles, `TranscriptState`, parent graph, meeting/interview subgraphs, FastAPI integration, and phased rollout (sections 1–8, 13–17).

```mermaid
flowchart TD
  START([POST /process]) --> PRE[preprocess]
  PRE --> BUD[budget_check]
  BUD --> ROUTE{route_strategy}

  ROUTE -->|single / short transcript| SS[single_shot LLM call]
  ROUTE -->|auto or multi + meeting mode| MG[meeting_graph]
  ROUTE -->|auto or multi + interview mode| IG[interview_graph]

  subgraph MeetingSub["Meeting subgraph"]
    MG --> MB[begin_meeting]
    MB --> MS[summarize_chunk parallel]
    MS --> ML[link_entities]
    ML --> MA[merge_actions]
    MA --> MYS[synthesize_minutes]
  end

  subgraph InterviewSub["Interview subgraph"]
    IG --> IB[begin_interview]
    IB --> IC[classify_chunk parallel]
    IC --> IA[aggregate_classifications]
    IA --> IR[review_technical / communication / culture]
    IR --> IE[extract_evidence]
    IE --> IS[synthesize_hiring]
    IS --> IF[fairness_check]
  end

  SS --> VAL[validate_output]
  MYS --> VAL
  IF --> VAL
  VAL --> END([JSON to DB + UI])
```

**Routing rules (auto strategy)**

| Condition | Path |
|-----------|------|
| `strategy=single` | `single_shot` |
| `strategy=multi` | Mode-specific subgraph |
| `strategy=auto` + words ≥ `MULTI_WORD_THRESHOLD` (800) + multiple chunks | Subgraph |
| Interview + panel transcripts | `single_shot` (panel merge handled separately) |

### Processing modes

- **Meeting minutes** — summary, discussion points, decisions, action items, risks, follow-ups.
- **Interview feedback** — skills, strengths, concerns, communication, rating, follow-up questions.

### Prompting strategy

- Strict JSON output constraints.
- Transcript-grounded extraction only.
- Stable key schema for frontend rendering and editing.

---

## Deployment Topology

Production-style layout (Vercel + hosted API + Supabase).

```mermaid
flowchart LR
  subgraph Client
    B[Browser]
  end

  subgraph Vercel["Vercel — Frontend"]
    SPA[Static Vite build + SPA rewrite]
  end

  subgraph APIHost["Backend host"]
    UV[Uvicorn / FastAPI]
  end

  subgraph Data["Supabase"]
    POOL[(Postgres transaction pooler :6543)]
  end

  subgraph SaaS
    C[Clerk]
    O[OpenAI]
    AZ[Azure AD + Graph]
  end

  B --> SPA
  SPA -->|HTTPS + CORS| UV
  UV --> POOL
  SPA --> C
  UV --> C
  UV --> O
  UV --> AZ
```

| Layer | Technology | Production URL |
|-------|------------|----------------|
| Frontend | Vercel | https://pbmeetpilotai.vercel.app |
| Backend | Vercel (FastAPI) | https://talentserv-ai-hackathon-group-9-bac.vercel.app |
| Database | Supabase Postgres | Pooler URL in env (port `6543` for serverless) |
| Config | Environment variables | No secrets in repo |

See [07-SOURCE_CODE_AND_DEPLOYMENT_DETAILS.md](./07-SOURCE_CODE_AND_DEPLOYMENT_DETAILS.md) for setup commands and env keys.

---

---

## Frontend Architecture

- Framework: React 19 + Vite 8 + Tailwind.
- Routing: React Router with `ProtectedRoute`.
- Auth integration: Clerk provider + tokenized API requests.
- Major pages:
  - `Landing`, `SignIn`, `SignUp`
  - `Dashboard`, `NewSession`, `SessionDetail`, `History`
- Key components:
  - Teams import panel (live/demo mode).
  - Interview options panel.
  - Output editors and export bar.
  - Privacy disclosure banner.

---

## Backend Architecture

- Framework: FastAPI + SQLAlchemy + Pydantic.
- Auth: Clerk JWT verification (`issuer` + `jwks`).
- Session domain:
  - Session CRUD/list/search/stats.
  - Processing state transitions (`draft`, `processing`, `ready`, `error`).
- Processing domain:
  - `process` endpoint + structured output persistence.
  - Interview metadata persistence (scorecard/JD/blind mode).
- Integrations domain:
  - Microsoft OAuth + OneDrive browse/import.
  - Teams legacy alias routes for compatibility.
- Chat domain:
  - Session-context question-answer exchange with persistence.

## AI Agent / Pipeline Architecture

### Processing Modes

- Meeting minutes extraction.
- Interview feedback extraction.

### Orchestration Paths

- Single-shot path: one model call for shorter transcripts.
- Multi-agent path (LangGraph enabled):
  - Meeting: chunk summarize in parallel -> merge entities/actions -> synthesize.
  - Interview: classify chunks -> specialist reviews (technical/communication/culture) -> synthesis -> fairness check.

## Data Model (Conceptual)

```mermaid
erDiagram
  USER ||--o{ SESSION : owns
  SESSION ||--o| OUTPUT : has
  SESSION ||--o{ CHAT_MESSAGE : has
  SESSION ||--o| INTERVIEW_META : optional

  USER {
    string clerk_user_id PK
  }
  SESSION {
    uuid id PK
    string mode
    string status
    text transcript
    int word_count
  }
  OUTPUT {
    json ai_json
    json edited_json
  }
  INTERVIEW_META {
    string scorecard_id
    bool blind_mode
    text jd_text
  }
  CHAT_MESSAGE {
    uuid id PK
    string role
    text content
  }
```

- User (mapped to Clerk identity).
- SessionRecord (title, mode, source, transcript, status, word_count).
- Output (ai_json, edited_json).
- Interview metadata (JD text, scorecard id, blind mode, candidate identifiers).
- Chat messages per session.

---

## Security and Privacy Controls

- Third-party auth only (no custom password storage).
- Token-based protected API access.
- UI privacy banner and consent warning for AI-processed transcripts.
- Blind mode with PII redaction pathway for interview analysis.
- Demo mode support for integration failures to avoid unsafe workarounds.

---

## Key Design Decisions

- Chosen Clerk to reduce auth implementation risk and speed delivery.
- Chosen structured JSON outputs for deterministic UI rendering and export.
- Added LangGraph only as optional toggle to preserve fallback reliability.
- Added mock Teams/OneDrive mode to keep demo unblocked without full Azure setup.
- Defined Cursor agents/skills at repo kickoff so AI-assisted work follows the same phase loop as human delivery (see agentic loop above).
