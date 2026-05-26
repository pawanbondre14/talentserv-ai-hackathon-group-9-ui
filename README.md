# MeetPilot AI — Frontend

React + Vite single-page application for **meeting minutes** and **interview feedback**: authenticated workflows, transcript input, OneDrive import, AI output editing, export, and session chat.

**Related docs:** [Project README](./Project_README.md) · [Backend README](../talentserv-ai-hackathon-group-9-backend/README.md) · [OneDrive setup](../talentserv-ai-hackathon-group-9-backend/TEAMS_ONEDRIVE_SETUP.md)

---

## What this frontend does

| Feature | User flow |
|---------|-----------|
| **Authentication** | Clerk sign-in / sign-up; protected dashboard and sessions |
| **New session** | Paste transcript, upload `.txt`, or import from OneDrive (`.txt`, `.vtt`) |
| **AI processing** | Trigger backend `POST …/process`; view structured results |
| **Session detail** | Edit fields, autosave, export (MD, PDF, DOCX, TXT) |
| **History** | Search past sessions by content, filter by mode/status |
| **Teams / OneDrive** | Connect Microsoft account; browse folders; import transcripts (or demo mocks) |
| **Session chat** | Q&A about transcript and AI output after processing |
| **Interview mode** | Scorecards, blind mode, optional panel transcript paste |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 + Framer Motion |
| Auth | Clerk (`@clerk/clerk-react`) |
| Routing | React Router 7 |
| HTTP | Axios (`src/lib/api.ts`) |

---

## Implementation phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **1** | Vite + Tailwind + Clerk provider, protected layout, Dashboard | Done |
| **2** | Session detail, process button, structured output viewer | Done |
| **3** | New session (paste + upload), history search, autosave | Done |
| **4** | Teams / OneDrive tab — OAuth connect, folder browser, import | Done |
| **5** | Interview options panel (JD, scorecard, blind mode, panel paste) | Done |
| **6** | Session chat panel on processed sessions | Done |

---

## Project structure

```
src/
├── main.tsx                 # Clerk provider, app mount
├── App.tsx                  # Route definitions
├── pages/
│   ├── Landing.tsx
│   ├── SignIn.tsx / SignUp.tsx
│   ├── Dashboard.tsx
│   ├── NewSession.tsx       # Paste, upload, Teams/OneDrive tabs
│   ├── SessionDetail.tsx    # Output, edit, export, chat
│   └── History.tsx
├── components/
│   ├── auth/                # ProtectedRoute, ClerkRoot
│   ├── teams/               # TeamsImportPanel (OneDrive browser)
│   ├── interview/           # InterviewOptionsPanel
│   ├── output/              # Export, AI status, structured viewers
│   └── ui/
├── hooks/                   # useApi
└── lib/                     # api.ts, export.ts, utils
```

---

## Routes

| Path | Access | Page |
|------|--------|------|
| `/` | Public | Landing |
| `/sign-in`, `/sign-up` | Public | Clerk auth |
| `/dashboard` | Protected | Session overview |
| `/new` | Protected | Create session + generate AI |
| `/history` | Protected | Search all sessions |
| `/session/:id` | Protected | View/edit output, chat, export |

---

## Backend integration

Set in `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8000
```

The API client sends the Clerk session token on protected routes (same Clerk app as backend `CLERK_ISSUER`).

### Main API calls

| UI action | Backend endpoint |
|-----------|------------------|
| Create session (paste) | `POST /api/sessions` |
| Upload `.txt` | `POST /api/ingest/upload` |
| Process transcript | `POST /api/sessions/{id}/process` |
| Load session + output | `GET /api/sessions/{id}/full` |
| Save edits | `PATCH /api/sessions/{id}/output` |
| Search history | `GET /api/sessions?q=...` |
| Microsoft status | `GET /api/microsoft/status` |
| Microsoft connect | `GET /api/microsoft/auth-url` |
| Browse OneDrive | `GET /api/onedrive/browse?folder_id=root` |
| Import OneDrive file | `POST /api/onedrive/import` |
| Chat message | `POST /api/sessions/{id}/chat` |
| Scorecards | `GET /api/interview/scorecards` |

---

## Setup & run

```bash
cd talentserv-ai-hackathon-group-9-ui
npm install
copy .env.example .env
npm run dev
```

Open **http://localhost:5173**

### Production build

```bash
npm run build
npm run preview
```

---

## Demo script (for judges)

1. **Sign in** with Clerk.
2. **New session** → paste sample from backend `samples/interview_multi_agent_sample.txt`.
3. Select **Interview** → enable **Generate AI after import** → Process.
4. Open **Session detail** → show rating, strengths, concerns, skill sections.
5. **Export** PDF or DOCX.
6. **History** → search a keyword from the transcript.
7. **Teams / OneDrive** tab → connect Microsoft (live) or use demo folders (no Azure).
8. Browse a folder → **Import** a `.vtt` or `.txt` file.
9. **Chat** → ask: *“What were the main technical strengths?”*

---

## Deploy to Vercel

1. **Root directory:** `talentserv-ai-hackathon-group-9-ui`
2. **Build command:** `npm run build`
3. **Environment variables:**
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` — deployed backend URL
4. Update backend `CORS_ORIGINS` and `FRONTEND_URL` to your Vercel URL.

```bash
cd talentserv-ai-hackathon-group-9-ui
vercel
```

---

## Development notes

- Backend must run on `VITE_API_URL` before processing transcripts.
- If Microsoft connect returns 401, sign in via UI first — do not open auth URL directly in the browser.
- For AI demo without API billing: set backend `LLM_MOCK=true`.
- For multi-agent demo: backend `LANGGRAPH_ENABLED=true` + long sample transcript.
- **Recordings shortcut** in the OneDrive tab is shown only before Microsoft is connected.

---

## Related docs

| Document | Purpose |
|----------|---------|
| [Project_README.md](./Project_README.md) | Architecture, phases, feature checklist |
| [Backend README](../talentserv-ai-hackathon-group-9-backend/README.md) | API, env vars, deploy |
| [TEAMS_ONEDRIVE_SETUP.md](../talentserv-ai-hackathon-group-9-backend/TEAMS_ONEDRIVE_SETUP.md) | Azure app registration + OneDrive config |
| [MULTI_AGENT_PLAN.md](./MULTI_AGENT_PLAN.md) | LangGraph design |
| [Sample transcripts](../talentserv-ai-hackathon-group-9-backend/samples/README.md) | Demo `.txt` / `.vtt` files |
