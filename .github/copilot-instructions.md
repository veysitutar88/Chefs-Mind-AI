## Chef's Mind AI — Copilot instructions (concise)

This file gives actionable, repo-specific guidance for AI coding agents and Copilot-style assistants so they can be productive immediately.

1) Big picture (what to know fast)
  - Backend: `server/` — Express + TypeScript. Entry: `server/index.ts` (loads .env, mounts auth, metrics, health, Vite in dev).
  - Frontend: `frontend-enhanced/` (Next/Vite React app). Dev is started from root via `npm run dev` which runs `dev:client`.
  - DB: Neon/Postgres via `drizzle-orm` (configs in `drizzle.config.ts` and `shared/schema.ts`).
  - AI providers: `server/services/` contains provider wrappers (`openai.ts`, `gemini.ts`, `perplexity.ts`, `fileProcessor.ts`). Use these files when adding/adjusting LLM or image logic.

2) Standard workflows & useful commands
  - Dev (Linux/macOS): `npm run dev` (runs server + client). On Windows use the `dev:win` script: `npm run dev:win`.
  - Run server only in dev: `npm run dev:server` (tsx watch server/index.ts).
  - Build server: `npm run build:server` (runs `tsc`). Client build: `cd frontend-enhanced && npm run build`.
  - Tests: `npm test` (vitest). Integration or media tests: `npm run test:integration` / `npm run test:media`.
  - Smoke checks: `npm run smoke:media` and `npm run smoke:ci:local` (shell scripts under `scripts/`).

3) Project-specific conventions (follow these exactly)
  - Env vars: only presence is audited by agents. See `agent_brief_chefs_mind_ai_v_2025_10_12.md` for required keys. NEVER log secret values — log only present|missing flags in `logs/*.json`.
  - Session/auth: sessions are set up in `server/auth.ts` via `express-session` and `connect-pg-simple`. Routes are protected with `requireAuth` middleware. Add auth routes via `setupAuth(app)` in `server/index.ts`.
  - Health & metrics: prefer `/health` router (`server/routes/health`) and `/metrics` (prom-client). Add any service check entries to `/health` response.
  - SQL safety: use `server/services/sqlValidator.ts` for any dynamic SQL; only SELECT is allowed by project policy.
  - Logs & checkpoints: Write task outputs to `logs/task_<CODE>.json` and update checkpoint files (`chefs_mind_ai_master_checkpoint_*.md`) — agents must not print user-facing messages.

4) Integration points & examples (copy/paste ready)
  - Mount Google OAuth: edit `server/auth/google.ts` and mount in `server/index.ts` via `app.use('/auth/google', googleAuth)`; smoke `GET /auth/google/status`.
  - Add QA-Gate middleware to media routes: insert middleware before sending responses in `server/routes.ts` (look for media-related routes). Log `qa.score` to `logs/`.
  - Backup endpoints: implement `/api/db/backup` and `/api/db/restore` in `server/routes.ts` and schedule with `server/services/backupScheduler` (existing scheduler is imported in `server/index.ts`). Store backups under `out/backups/`.

5) Files to consult when editing
  - `server/index.ts` — startup, env loading, Vite dev mounting, metrics, health.
  - `server/routes.ts` — main API endpoints (chat, media, uploads, sql validation).
  - `server/services/*.ts` — AI provider wrappers and utilities.
  - `shared/schema.ts` and `drizzle.config.ts` — DB schema and migrations.
  - `frontend-enhanced/src/` — components (add `GoogleConnect.tsx` here for OAuth UI).
  - `scripts/` — smoke, CI helper scripts (use them for local verification).

6) Safety and agent rules (non-negotiable)
  - SAFE_MODE: never disable without explicit human `X-Confirm-Code`.
  - No secrets in logs. When verifying `.env` only write `{KEY: present|missing}`.
  - All edits: generate minimal diffs, include a short summary in `logs/commit_summary.txt` and a `logs/task_<CODE>.json` status file.

7) Quick examples (commands & endpoints)
  - Start dev (Windows PowerShell): `npm run dev:win` (sets NODE_ENV and runs `tsx server/index.ts`).
  - Health check: `GET http://localhost:5000/health` — should return JSON with service flags.
  - Metrics: `GET http://localhost:5000/metrics` (Prometheus format).

If anything here is unclear or you'd like more examples (e.g., exact middleware snippets or a sample `GoogleConnect.tsx`), tell me which area to expand. I'll iterate.
