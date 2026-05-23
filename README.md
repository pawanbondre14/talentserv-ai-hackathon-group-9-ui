# MeetingFeed AI — Frontend

React + Vite UI for **Meeting Feed Generator AI**.

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

Deploy to Vercel; add the same env vars in project settings.
