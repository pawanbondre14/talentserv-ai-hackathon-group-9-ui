# MeetPilot AI — Frontend

React + Vite single-page application for **meeting minutes** and **interview feedback**: authenticated workflows, transcript input, AI output editing, export, Teams import, and session chat.

**Parent project:** [../README.md](../README.md) · **Backend API:** [../talentserv-ai-hackathon-group-9-backend/README.md](../talentserv-ai-hackathon-group-9-backend/README.md)

---

## 1. What this frontend does

| Feature | User flow |
|---------|-----------|
| **Authentication** | Clerk sign-in / sign-up; protected dashboard and sessions |
| **New session** | Paste transcript, upload `.txt`, select meeting vs interview mode |
| **AI processing** | Trigger backend `POST …/process`; view structured results |
| **Session detail** | Edit fields, autosave, export (MD, PDF, DOCX, TXT) |
| **History** | Search past sessions by content, filter by mode/status |
| **Teams / OneDrive** | Connect Microsoft account; import VTT transcripts (or demo mocks) |
| **Session chat** | Q&A about transcript and AI output after processing |
| **Privacy** | Banner explaining data handling |

---

## 2. Tech stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Build | Vite |
| Styling | Tailwind CSS |
| Auth | Clerk (`@clerk/clerk-react`) |
| Routing | React Router |
| HTTP | Fetch / API helper to FastAPI backend |

---

## 3. Project structure

```
src/
├── main.tsx              # Clerk provider, app mount
├── App.tsx               # Route definitions
├── pages/
│   ├── Landing.tsx       # Public landing
│   ├── SignIn.tsx / SignUp.tsx
│   ├── Dashboard.tsx     # Recent sessions
│   ├── NewSession.tsx    # Transcript input, mode, Teams tab
│   ├── SessionDetail.tsx # Output viewer, edit, export, chat
│   └── History.tsx       # Search & filters
├── components/
│   ├── auth/             # ProtectedRoute
│   ├── layout/           # AppShell, header
│   ├── transcript/       # Input, mode selector
│   ├── output/           # Structured viewers, export
│   └── ...               # Teams, chat, privacy banner
├── hooks/                # Auth, API helpers
└── lib/                  # API client, utilities
```

---

## 4. Routes

| Path | Access | Page |
|------|--------|------|
| `/` | Public | Landing |
| `/sign-in`, `/sign-up` | Public | Clerk auth |
| `/dashboard` | Protected | Session overview |
| `/new` | Protected | Create session + generate AI |
| `/history` | Protected | Search all sessions |
| `/session/:id` | Protected | View/edit output, chat, export |

---

## 5. Backend integration

Set in `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8000
```

The API client sends the Clerk session token on protected routes (same Clerk app as backend `CLERK_ISSUER`).

### Main API calls (via backend)

| UI action | Backend endpoint |
|-----------|------------------|
| Create session | `POST /api/sessions` |
| Process transcript | `POST /api/sessions/{id}/process` |
| Load session + output | `GET /api/sessions/{id}/full` |
| Save edits | `PATCH /api/sessions/{id}/output` |
| Search history | `GET /api/sessions/search` |
| Chat message | `POST /api/sessions/{id}/chat` |
| Microsoft connect | `GET /api/microsoft/auth-url` (authenticated) |
| Import Teams VTT | `POST /api/teams/import` |

---

## 6. Setup & run

```bash
cd talentserv-ai-hackathon-group-9-ui
npm install
copy .env.example .env
```

Edit `.env` with Clerk publishable key and backend URL.

```bash
npm run dev
```

Open **http://localhost:5173**

### Production build

```bash
npm run build
npm run preview
```

---

## 7. Frontend implementation plan (completed phases)

| Step | Deliverable | Status |
|------|-------------|--------|
| 1 | Vite + Tailwind + Clerk provider | Done |
| 2 | Protected layout + Dashboard | Done |
| 3 | New session (paste + upload + mode) | Done |
| 4 | Session detail + process button | Done |
| 5 | Structured output viewer + inline edit | Done |
| 6 | Export MD / PDF / DOCX / TXT | Done |
| 7 | History search + filters | Done |
| 8 | Teams / OneDrive tab + import UX | Done |
| 9 | Session chat panel | Done |
| 10 | Autosave + draft backup | Done |

---

## 8. Demo script (for judges)

1. **Sign in** with Clerk (or team demo account).  
2. **New session** → paste sample from backend `samples/interview_multi_agent_sample.txt`.  
3. Select **Interview** → **Generate** / Process.  
4. Open **Session detail** → show rating, strengths, concerns, skill sections.  
5. **Export** PDF — show deliverable artifact.  
6. **History** → search keyword from transcript.  
7. **Teams tab** → demo import (mock if Azure not configured).  
8. **Chat** → ask: *“Summarize the main technical strengths.”*

---

## 9. Deploy to Vercel

1. **Root directory:** `talentserv-ai-hackathon-group-9-ui` (or repo root if UI-only repo).  
2. **Build command:** `npm run build` (see `vercel.json` in this folder).  
3. **Environment variables:**
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` — deployed backend URL  
4. Update backend `CORS_ORIGINS` and `FRONTEND_URL` to your Vercel URL.

```bash
cd talentserv-ai-hackathon-group-9-ui
vercel
```

---

## 10. Development notes

- Backend must run on `VITE_API_URL` before processing transcripts.  
- If Microsoft connect returns 401, sign in via UI first — do not open auth URL directly in browser.  
- For AI demo without OpenAI billing: set backend `LLM_MOCK=true`.  
- For multi-agent demo: backend `LANGGRAPH_ENABLED=true` + long sample transcript.

---

## 11. Related docs

- [Project README](../README.md) — architecture, solution plan, team template  
- [Backend README](../talentserv-ai-hackathon-group-9-backend/README.md) — API, LangGraph, env vars  
- [Sample transcripts](../talentserv-ai-hackathon-group-9-backend/samples/README.md)  
