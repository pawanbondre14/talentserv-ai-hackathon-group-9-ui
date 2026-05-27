# HackFeed: Meeting Feedback Generator - Project Plan

**Submission pack:** [docs/submissions/README.md](./docs/submissions/README.md) · Groomed requirements: [01-GROOMED_REQUIREMENTS.md](./docs/submissions/01-GROOMED_REQUIREMENTS.md) · Implementation summary: [02-SOLUTION_IMPLEMENTATION_PLAN.md](./docs/submissions/02-SOLUTION_IMPLEMENTATION_PLAN.md)

**Challenge**: Challenge 7: Meeting Feedback Generator  
**Architecture**: Python FastAPI Backend + React/Vite Frontend  
**Deployment**: Backend → Render/Railway, Frontend → Vercel

---

## 📋 Tech Stack Breakdown

| Component | Technology | Rationale |
|---|---|---|
| **Backend** | Python FastAPI | Type-safe, async-ready, ideal for AI/LLM pipelines |
| **Frontend** | React 18 + Vite | Fast HMR, modern build, great with Tailwind |
| **Styling** | Tailwind CSS + shadcn/ui | Modern, accessible components out of the box |
| **Auth** | Clerk | Fastest integration, built-in protected routes |
| **AI Processing** | OpenAI + **LangGraph** | Structured JSON nodes, map-reduce for long transcripts |
| **Speech-to-Text** | Web Speech API (browser) | Free, client-side, + fallback to manual transcription |
| **Export** | jsPDF, docx (npm) | PDF & Word export on frontend |
| **Testing** | Pytest (backend) + Vitest/Jest (frontend) | Standard stacks, good coverage |
| **Database** | PostgreSQL (optional tier) or JSON storage | Store user sessions, transcripts, outputs |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                      │
│  • Auth Guard (Clerk)  • Transcript Input  • Output Viewer    │
│  • Export UI           • History Dashboard                     │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS REST API
┌──────────────────▼──────────────────────────────────────────┐
│              FastAPI Python Backend                           │
│  • Auth Validation (Clerk JWT)                                │
│  • Transcript Ingestion & Normalization                        │
│  • LangGraph pipelines (meeting / interview, single + multi)   │
│  • JSON Output Structuring                                     │
│  • Session Management                                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
    [Clerk]  [OpenAI API] [PostgreSQL]
```

---

## 📅 Phases & Work Breakdown

### **PHASE 1: Infrastructure & Authentication **

**Goal**: Core project structure, auth wired, deployments ready  
**Parallel Path**: Backend + Frontend can start simultaneously

#### Backend (Python)
- [ ] Initialize FastAPI project (`pip install fastapi uvicorn python-dotenv openai pydantic`)
- [ ] Set up project structure:
  ```
  backend/
  ├── main.py                    (FastAPI app entry)
  ├── config.py                  (env vars, settings)
  ├── auth.py                    (Clerk JWT validation)
  ├── routes/
  │   ├── __init__.py
  │   ├── transcripts.py          (POST upload, paste)
  │   └── process.py              (POST process, GET results)
  ├── services/
  │   ├── __init__.py
  │   ├── transcript_processor.py (normalization, cleanup)
  │   ├── llm.py                  (OpenAI API calls, prompts)
  │   └── export_service.py       (JSON output formatting)
  ├── models/
  │   ├── __init__.py
  │   ├── schemas.py              (Pydantic models)
  │   └── responses.py
  ├── prompts/
  │   ├── meeting_minutes.py
  │   └── interview_feedback.py
  └── requirements.txt
  ```
- [ ] Set up Clerk JWT validation middleware
- [ ] Create `.env.example` with all needed variables
- [ ] Deploy skeleton to Render/Railway (ready for future pushes)

#### Frontend (React)
- [ ] Initialize Vite React project (`npm create vite@latest`)
- [ ] Install dependencies: `tailwind`, `shadcn/ui`, `@clerk/nextjs` equivalent for React, `axios`
- [ ] Set up folder structure:
  ```
  frontend/
  ├── src/
  │   ├── components/
  │   │   ├── Auth/
  │   │   │   ├── ProtectedRoute.jsx
  │   │   │   └── LoginButton.jsx
  │   │   ├── Transcript/
  │   │   │   ├── TranscriptInput.jsx
  │   │   │   └── ModeSelector.jsx
  │   │   ├── Output/
  │   │   │   ├── OutputViewer.jsx
  │   │   │   ├── EditorPanel.jsx
  │   │   │   └── ExportButtons.jsx
  │   │   └── Common/
  │   │       └── Header.jsx
  │   ├── pages/
  │   │   ├── Dashboard.jsx
  │   │   ├── Process.jsx
  │   │   └── History.jsx
  │   ├── services/
  │   │   └── api.js
  │   ├── hooks/
  │   │   └── useAuth.js
  │   ├── styles/
  │   │   └── globals.css
  │   └── App.jsx
  ├── tailwind.config.js
  ├── vite.config.js
  └── package.json
  ```
- [ ] Configure Clerk authentication in Vite
- [ ] Set up Tailwind + shadcn/ui theme (modern dark mode or light mode)
- [ ] Deploy skeleton to Vercel (ready for future pushes)

#### Deliverables
- ✅ GitHub repo created with both folders
- ✅ Clerk dashboard configured + API keys in `.env`
- ✅ Backend running locally on `http://localhost:8000`
- ✅ Frontend running locally on `http://localhost:5173`
- ✅ Protected route visible (login wall works)
- ✅ Both deployed to cloud (skeleton only, minimal endpoints)

---

### **PHASE 2: Core Backend API & Transcript Processing**

**Goal**: All backend endpoints ready, OpenAI integration working  
**Depends on**: Phase 1 complete

#### Backend Development

**2.1 Transcript Ingestion Endpoints**
- [ ] `POST /api/upload` — Handle file uploads (txt, docx, pdf)
- [ ] `POST /api/paste` — Accept pasted text
- [ ] `POST /api/mock-audio` — Mock audio-to-text (for hackathon, return sample transcript)
- [ ] Each endpoint returns `transcript_id`, normalized text, metadata (word count, speaker count if detectable)

**2.2 Transcript Processor Service**
- [ ] Normalize whitespace, remove HTML tags, handle encoding issues
- [ ] Add speaker labels if missing (e.g., `[Unknown Speaker 1]`)
- [ ] Token counter: Warn if transcript exceeds model context limits
- [ ] Auto-detect language (if non-English, may warn about model limitations)
- [ ] Handle edge case: Empty or near-empty transcripts (min 50 words)

**2.3 OpenAI Prompts & Modes**

Create two **robust prompts** in `prompts/` folder:

**Meeting Minutes Prompt** (in `meeting_minutes.py`):
```python
def get_meeting_minutes_prompt(transcript: str) -> str:
    return f"""
You are an expert meeting scribe. Analyze the following meeting transcript and extract structured meeting minutes.

TRANSCRIPT:
{transcript}

Return a JSON object with these REQUIRED fields:
{{
  "executive_summary": "2-3 sentence summary of main topics and outcomes",
  "discussion_points": [
    {{"topic": "...", "summary": "...", "participants": ["Person A", "Person B"]}},
    ...
  ],
  "decisions": [
    {{"decision": "...", "rationale": "...", "owner": "Person Name"}},
    ...
  ],
  "action_items": [
    {{
      "task": "specific action",
      "owner": "assigned to",
      "due_date": "YYYY-MM-DD or 'not specified'",
      "priority": "High|Medium|Low"
    }},
    ...
  ],
  "risks": ["risk 1", "risk 2", ...],
  "follow_ups": ["follow up question or next step", ...]
}}

If a field is not found in the transcript, return empty array [] or appropriate null value.
Focus on accuracy and factual extraction from the transcript.
"""
```

**Interview Feedback Prompt** (in `interview_feedback.py`):
```python
def get_interview_feedback_prompt(transcript: str) -> str:
    return f"""
You are an experienced hiring manager reviewing an interview transcript. Extract structured feedback.

TRANSCRIPT:
{transcript}

Return a JSON object with these REQUIRED fields:
{{
  "candidate_summary": "2-3 sentence overall impression",
  "skill_observations": {{
    "technical_skills": "assessment of technical abilities shown",
    "communication": "how well they articulated ideas",
    "problem_solving": "approach to challenges",
    "culture_fit": "alignment with company values (if detectable)"
  }},
  "strengths": ["strength 1", "strength 2", ...],
  "concerns": ["concern 1", "concern 2", ...],
  "communication_assessment": "professional communication quality",
  "rating": "Proceed|Hold|Reject",
  "rationale": "brief reason for rating",
  "follow_up_questions": [
    "question to clarify in next round",
    ...
  ]
}}

Base rating on evidence from transcript only. Be fair and objective.
"""
```

- [ ] Implement `llm.py` (`app/services/llm.py`):
  - Initialize OpenAI client with `OPENAI_API_KEY`
  - Function: `complete_json(...)` → meeting / interview / JD structured JSON
  - Error handling: If model returns invalid JSON, retry once or return helpful error
  - Token counting before API call to prevent overages

**2.4 Process Endpoints**
- [ ] `POST /api/process` — Main endpoint
  - Accepts: `transcript_id`, `mode` ("meeting" | "interview")
  - Calls OpenAI with appropriate prompt
  - Returns: `output_id`, structured JSON result, processing time
  - Saves to database/storage

- [ ] `GET /api/result/{output_id}` — Retrieve processed output
  - Returns structured JSON + metadata

**2.5 Edge Case Handling**
- [ ] Empty transcript → Return error: "Please provide at least 50 words"
- [ ] Token limit exceeded → Chunk transcript or return: "Transcript too long, please provide <2hr meeting"
- [ ] OpenAI API error → Return friendly error + retry advice
- [ ] Invalid JSON from model → Log error, return fallback structure

#### Deliverables
- ✅ All endpoints tested with manual curl/Postman calls
- ✅ Sample meeting transcript + sample interview transcript committed to repo
- ✅ Expected outputs for both modes committed
- ✅ Backend handles all 5 edge cases gracefully
- ✅ `.env` example includes all Clerk + OpenAI keys

---

### **PHASE 2.5: LangGraph Multi-Agent Pipelines (8-12 hours)**

**Goal**: Orchestrate all transcript analysis with **LangGraph** from the first implementation step — no custom asyncio orchestrator.  
**Depends on**: Phase 2 `llm.py` + `POST /api/sessions/{id}/process`  
**Plan**: [MULTI_AGENT_PLAN.md](./MULTI_AGENT_PLAN.md)

#### Stack additions
- `langgraph`, `langchain-core`, `langchain-openai` (OpenAI models: `gpt-4o`, `gpt-4o-mini`)
- `app/graphs/` — parent `StateGraph` + `meeting_graph` / `interview_graph` subgraphs

#### Phase A — LangGraph foundation (do this first)
- [ ] `TranscriptState` in `app/graphs/state.py` (chunks, `agent_trace`, `final_output`)
- [ ] Parent graph: `preprocess` → `route_strategy` → `single_shot` → `validate_output` → `END`
- [ ] `app/services/graph_runner.py` — `compiled_graph.ainvoke()` from FastAPI
- [ ] `process.py` calls `graph_runner` instead of `process_transcript` directly
- [ ] `LANGGRAPH_ENABLED` feature flag for safe rollback

#### Phase B — Meeting subgraph
- [ ] LangGraph **`Send`** map-reduce: per-chunk `summarize_chunk` (fast model)
- [ ] Merge + `synthesize_minutes` (strong model) → existing meeting JSON schema

#### Phase C — Interview subgraph
- [ ] Classify chunks → parallel dimension reviewers → evidence → synthesize → fairness
- [ ] Hook existing JD / panel / blind logic from `interview_processor.py`

#### Phase D — Hardening
- [ ] `astream` + progress UI; optional checkpointer for long jobs
- [ ] `strategy`: `single` | `multi` | `auto` on process endpoint

#### Deliverables
- ✅ All processing paths run through one compiled LangGraph
- ✅ Short transcripts use `single_shot` node; long transcripts use map-reduce subgraphs
- ✅ `agent_trace` stored for debugging / demo

---

### **PHASE 3: Frontend UI & Integration (8-10 hours)**

**Goal**: Complete UI flows, connects to backend API  
**Depends on**: Phase 1 complete, Phase 2 mostly complete

#### Frontend Components

**3.1 Dashboard / Landing**
- [ ] Header with Clerk user profile + logout
- [ ] Two buttons: "New Meeting Minutes" | "New Interview Feedback"
- [ ] Recent outputs list (if user has history)
- [ ] Clean, modern design (Tailwind + shadcn/ui)

**3.2 Transcript Input Screen** (`TranscriptInput.jsx`)
- [ ] Mode selector (Meeting | Interview) at top
- [ ] Three input options:
  1. **Paste Text**: Large textarea, auto-detects content
  2. **Upload File**: File input (accept `.txt`, `.docx`)
  3. **Mock Teams Import**: Dropdown select from mock meetings (e.g., "Sprint Planning 5/22")
- [ ] Word count display (live update)
- [ ] "Submit & Process" button (disabled if <50 words)
- [ ] Loading spinner while waiting for backend

**3.3 Output Viewer Screen** (`OutputViewer.jsx` + `EditorPanel.jsx`)
After processing, display structured output with editable sections:

For **Meeting Minutes** mode:
- [ ] Executive Summary (editable textarea)
- [ ] Discussion Points (collapsible sections)
- [ ] Decisions (editable list)
- [ ] Action Items (table with Task | Owner | Due Date | Priority)
- [ ] Risks (editable list)
- [ ] Follow-ups (editable list)

For **Interview Feedback** mode:
- [ ] Candidate Summary (editable)
- [ ] Skill Observations (nested editable fields)
- [ ] Strengths | Concerns (editable lists)
- [ ] Rating (dropdown: Proceed | Hold | Reject)
- [ ] Follow-up Questions (editable list)

Design pattern: Each section should show a "Generated by AI" badge and allow inline editing with a visual "Edited" indicator.

**3.4 Export UI** (`ExportButtons.jsx`)
- [ ] Copy as Markdown (clipboard)
- [ ] Download as PDF (via jsPDF)
- [ ] Download as DOCX (via docx npm package)
- [ ] Share link (generates shareable read-only URL — future feature, placeholder for now)

**3.5 API Integration** (`services/api.js`)
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Authorization': `Bearer ${clerkToken}`
  }
});

export const uploadTranscript = (file) => api.post('/api/upload', formData);
export const pasteTranscript = (text) => api.post('/api/paste', { text });
export const processTranscript = (transcriptId, mode) =>
  api.post('/api/process', { transcript_id: transcriptId, mode });
export const getResult = (outputId) => api.get(`/api/result/${outputId}`);
```

**3.6 State Management**
- [ ] Use React Context or Zustand for:
  - Current user auth state
  - Selected mode (meeting | interview)
  - Current transcript & output
  - Edit history (for undo)

**3.7 Theme & Styling**
- [ ] Tailwind config: Modern dark mode (or light mode + toggle)
- [ ] shadcn/ui components: Button, Card, Badge, Input, Textarea, Select, Dialog
- [ ] Responsive: Mobile-first (works on phone after a meeting)
- [ ] Accessibility: ARIA labels, keyboard navigation

#### Deliverables
- ✅ All screens render without errors
- ✅ Integration with backend working end-to-end (can paste transcript → see output)
- ✅ Edit functionality works (user can modify output)
- ✅ Export buttons work (Markdown copy + PDF download tested)
- ✅ Deployed to Vercel

---

### **PHASE 4: Testing & Quality Assurance (4-6 hours)**

**Goal**: 5–10 test cases across stack, edge cases covered

#### Backend Testing (`tests/test_*.py` with Pytest)

**4.1 Transcript Processing**
- [ ] Test: Empty transcript rejected
- [ ] Test: Very long transcript (>100k tokens) warns correctly
- [ ] Test: Special characters & encoding handled
- [ ] Test: Speaker labels auto-added if missing

**4.2 OpenAI Integration**
- [ ] Test: Meeting minutes prompt returns valid JSON structure
- [ ] Test: Interview feedback prompt returns valid JSON structure
- [ ] Test: Malformed model response handled gracefully
- [ ] Test: Action items with missing owners handled

**4.3 API Endpoints**
- [ ] Test: `POST /api/upload` with valid file
- [ ] Test: `POST /api/upload` with invalid file (returns error)
- [ ] Test: `POST /api/paste` with text
- [ ] Test: `POST /api/process` returns correct mode output
- [ ] Test: `GET /api/result/{id}` returns stored result

#### Frontend Testing (`tests/` with Vitest or Jest)

**4.4 Component Tests**
- [ ] Test: TranscriptInput disables submit if <50 words
- [ ] Test: Mode selector changes output template
- [ ] Test: Export buttons generate correct formats

**4.5 Integration Tests**
- [ ] Test: End-to-end flow from paste → process → view output

#### Manual Test Cases
- [ ] Use provided sample meeting transcript → verify Minutes output quality
- [ ] Use provided sample interview transcript → verify Feedback output quality
- [ ] Test all three input methods (paste, upload, mock import)
- [ ] Test edge case: Transcript with one speaker only
- [ ] Test edge case: Very short transcript (still generates output, not crash)

#### Deliverables
- ✅ `tests/` folder with all test files
- ✅ Test commands in `Makefile` or npm scripts (`npm test`, `pytest`)
- ✅ All 10 tests passing
- ✅ Screenshot or CI log showing test results committed to repo
- ✅ README includes "How to Run Tests" section

---

### **PHASE 5: Deployment, Documentation & Polish (4-6 hours)**

**Goal**: Production-ready deployment, clear README, demo-ready

#### Backend Deployment
- [ ] Push backend to Render or Railway:
  - Set environment variables (Clerk keys, OpenAI API key, database URL if used)
  - Verify health check endpoint works
  - Test one API call from production
  - Document production URL

#### Frontend Deployment
- [ ] Deploy to Vercel:
  - Configure environment variables (`VITE_API_URL`, Clerk keys)
  - Verify login flow works
  - Test end-to-end with production backend
  - Enable auto-deploys from GitHub

#### Documentation
- [ ] **README.md** includes:
  - Project overview & screenshots
  - Tech stack
  - Setup instructions (local dev)
  - Deployment instructions (backend + frontend)
  - How to run tests
  - Known limitations & edge cases
  - Privacy/responsible AI notice (required for Challenge 7)

- [ ] **SETUP.md**:
  - Detailed steps for local development
  - Env var examples
  - Database setup (if applicable)

- [ ] **API_DOCS.md** (or `/api/docs`):
  - Endpoint list with request/response examples
  - Error codes

#### Privacy & Responsible Use
- [ ] Add banner in UI: "⚠️ This app uses AI to process your meeting transcripts. Ensure all participants consent to AI analysis. Data is not stored beyond your session."
- [ ] Include statement in README about data handling

#### Polish & Edge Case UX
- [ ] Error messages are user-friendly ("Please provide at least 50 words" not "ValueError: input_length < 50")
- [ ] Loading states are clear (spinner + "Processing with AI...")
- [ ] Empty states handled (e.g., "No action items identified" not blank)
- [ ] Mobile responsive tested on phone/tablet

#### Demo & Evidence
- [ ] Record 3-5 minute demo video:
  1. Paste a sample transcript
  2. Select mode (meeting or interview)
  3. Show processing
  4. Edit output
  5. Export as PDF
- [ ] Upload demo video to repo or YouTube (link in README)
- [ ] Screenshot showing agentic programming evidence (Cursor/Claude Code sessions)

#### Deliverables
- ✅ Both backend and frontend deployed and accessible
- ✅ Production URLs in README
- ✅ All docs complete
- ✅ Privacy banner visible in app
- ✅ Demo video uploaded
- ✅ GitHub repo polished with clear structure

---

## 🎯 Evaluation Alignment

| Criterion | Weight | How This Plan Addresses It |
|---|---|---|
| **Functional Implementation** | 30% | Phase 3 + 4: Full UI, all modes, export working |
| **Transcript Processing Quality** | 20% | Phase 2: Robust prompts, edge case handling, tested |
| **Auth & Protected Access** | 10% | Phase 1: Clerk integrated, all routes protected |
| **Teams Integration Readiness** | 10% | Phase 3: Mock import flow shown, labeled as mock |
| **Test Cases** | 10% | Phase 4: 10 tests across stack, passing |
| **Agentic Programming Evidence** | 10% | README: Screenshot of Cursor/Claude Code usage |
| **Code Quality & Demo** | 10% | Phase 5: Clean code, demo video, good README |

---

## ⚡ Quick Start Commands (Post-Phase-1)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
export CLERK_API_KEY="your_key"
export OPENAI_API_KEY="your_key"
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
export VITE_API_URL="http://localhost:8000"
npm run dev
# Open http://localhost:5173
```

---

## 🚨 Critical Path & Risks

**Critical Path** (longest dependency chain):
1. Phase 1 setup (6-8 hrs) → Phase 2 backend (8-10 hrs) → Phase 3 frontend (8-10 hrs) → Phase 4 tests (4-6 hrs)
2. Total: **26-34 hours** (fits in 48-hour hackathon with buffer)

**Risks to Mitigate**:
- **Clerk setup takes longer than expected** → Start very early, use Clerk docs + templates
- **OpenAI API errors** → Implement robust retry logic + fallback responses early
- **File upload handling** → Test with real `.docx` files early, not last minute
- **PDF export library issues** → Test `jsPDF` rendering in Phase 3, not Phase 5
- **Token limits** → Implement transcript chunking in Phase 2 before Phase 3

---

## 📊 Success Criteria

By end of Phase 5, you should have:
- ✅ 1 GitHub repo with clean branch history
- ✅ Live deployed URLs for both backend + frontend
- ✅ 5–10 passing tests with evidence
- ✅ Sample outputs for both modes committed
- ✅ Clear README with setup + deployment instructions
- ✅ Privacy notice in UI
- ✅ Demo video showing all features working
- ✅ No console errors or warnings (within reason)

---

