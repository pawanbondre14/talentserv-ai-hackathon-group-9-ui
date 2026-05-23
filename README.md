# MeetPilot AI — Frontend

React + Vite UI for **Turn talk into action with AI AI**.

## Phase 1

- Clerk sign-in / sign-up
- Protected dashboard, new session (paste transcript), history search
- Dark modern layout with privacy banner

## Setup

```bash
cd talentserv-ai-hackathon-group-9-ui
npm install
cp .env.example .env
```

Set in `.env`:

- `VITE_CLERK_PUBLISHABLE_KEY` — from [Clerk Dashboard](https://dashboard.clerk.com)
- `VITE_API_URL` — backend URL (default `http://localhost:8000`)

## Run

```bash
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

## Deploy to Vercel

1. **Root Directory** (Project Settings → General): `talentserv-ai-hackathon-group-9-ui`  
   If you deploy only the UI repo, use `.` (repo root).

2. **Build command** must be `npm run build` — not `vite build`.  
   `vercel.json` in this folder sets that automatically.

3. **Environment variables** (Project Settings → Environment Variables):
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` — your deployed backend URL (e.g. `https://your-api.onrender.com`)

4. From this folder:

```bash
cd talentserv-ai-hackathon-group-9-ui
vercel
```

5. Update backend `CORS_ORIGINS` and `FRONTEND_URL` to your Vercel URL (e.g. `https://your-app.vercel.app`).
