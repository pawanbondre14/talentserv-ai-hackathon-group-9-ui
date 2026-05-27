# Source Code and Deployment Details

## Repository Structure

- Frontend: `talentserv-ai-hackathon-group-9-ui`
- Backend: `talentserv-ai-hackathon-group-9-backend`
- Submission docs: `docs/submissions`

## Planning and design references

| Document | Location | Purpose |
|----------|----------|---------|
| Project plan | [PROJECT_PLAN.md](../../PROJECT_PLAN.md) | Phased delivery, tech stack, risks, success criteria |
| Multi-agent plan | [MULTI_AGENT_PLAN.md](../../MULTI_AGENT_PLAN.md) | LangGraph graphs, nodes, routing, backend layout |
| Architecture (submission) | [03-PRODUCT_TECHNICAL_ARCHITECTURE.md](./03-PRODUCT_TECHNICAL_ARCHITECTURE.md) | Evaluator-facing diagrams and summary |
| Backend setup | [TEAMS_ONEDRIVE_SETUP.md](../../../talentserv-ai-hackathon-group-9-backend/TEAMS_ONEDRIVE_SETUP.md) | Microsoft OAuth / OneDrive integration |

## Local Setup

## Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase project (Postgres)
- Clerk project
- OpenAI API key (or mock mode)

## Backend Run

```bash
cd talentserv-ai-hackathon-group-9-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

## Frontend Run

```bash
cd talentserv-ai-hackathon-group-9-ui
npm install
# create .env manually with keys below
npm run dev
```

App URL: `http://localhost:5173`

## Environment Variables

## Backend (`.env`)

Minimum:

- `DATABASE_URL`
- `CLERK_ISSUER`
- `CLERK_JWKS_URL`
- `OPENAI_API_KEY` (or `LLM_MOCK=true`)

Common optional:

- `LANGGRAPH_ENABLED=true`
- `MULTI_WORD_THRESHOLD=800`
- `CHUNK_MAX_WORDS=800`
- `CORS_ORIGINS`
- `FRONTEND_URL`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_TENANT_ID`
- `AZURE_SCOPES`
- `AZURE_REDIRECT_URI`
- `MS_TOKEN_ENCRYPTION_KEY`

## Frontend (`.env`)

Set manually (frontend `.env.example` not currently present):

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL=http://localhost:8000`

## Deployment Details

See **Deployment Topology** diagram in [03-PRODUCT_TECHNICAL_ARCHITECTURE.md](./03-PRODUCT_TECHNICAL_ARCHITECTURE.md#deployment-topology).

### Deployed URLs (production)

| Service | URL |
|---------|-----|
| **Frontend** | https://pbmeetpilotai.vercel.app |
| **Backend API** | https://talentserv-ai-hackathon-group-9-bac.vercel.app |
| **API docs (Swagger)** | https://talentserv-ai-hackathon-group-9-bac.vercel.app/docs |

### Production environment (Vercel)

**Frontend** (`pbmeetpilotai.vercel.app`):

- `VITE_API_URL=https://talentserv-ai-hackathon-group-9-bac.vercel.app`
- `VITE_CLERK_PUBLISHABLE_KEY` — from Clerk dashboard (production instance)

**Backend** (`talentserv-ai-hackathon-group-9-bac.vercel.app`):

- `FRONTEND_URL=https://pbmeetpilotai.vercel.app`
- `CORS_ORIGINS=https://pbmeetpilotai.vercel.app` (add `http://localhost:5173` for local dev if needed)
- `DATABASE_URL` — Supabase pooler URL (port `6543` for serverless)
- `CLERK_ISSUER`, `CLERK_JWKS_URL`, `OPENAI_API_KEY` (or `LLM_MOCK=true` for demo)

## Frontend (hosting)

- Target: Vercel
- `vercel.json` exists with Vite build + SPA rewrite.

## Backend (hosting)

- Target: Vercel (serverless FastAPI)
- For Supabase in serverless contexts, use transaction pooler URL (port `6543`).
- Ensure `CORS_ORIGINS` and `FRONTEND_URL` match https://pbmeetpilotai.vercel.app

## Test / Verification Commands

Backend tests:

```bash
cd talentserv-ai-hackathon-group-9-backend
pytest
```

Frontend build:

```bash
cd talentserv-ai-hackathon-group-9-ui
npm run build
```

## Security and Secrets Checklist

- Do not commit real `.env` values.
- Do not expose API keys/tokens in README/video/screenshots.
- Validate no credentials are embedded in client-side code.

## Sample Data Included

- Transcript samples are available in `talentserv-ai-hackathon-group-9-backend/samples`.
