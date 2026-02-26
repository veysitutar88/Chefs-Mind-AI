# Development Guide — Chef's Mind AI

Developer onboarding guide for the Chef's Mind AI multi-agent platform.

## Prerequisites

- **Node.js** 20+
- **npm** (package manager)
- **PostgreSQL** 15+ (or Docker)
- **Redis** (for session store)
- **Python** 3.11+ (for security scanning tools)

## Quick Start

> **Recommended:** Use [Task](https://taskfile.dev) — `task install` and `task dev` replace all the npm commands below.

```bash
# 1. Install dependencies
task install          # or: npm install && cd frontend-enhanced && npm install && cd ..

# 2. Copy env and fill in secrets
cp .env.example .env

# 3. Run database migrations
task db:migrate       # or: npm run drizzle:migrate

# 4. Start both backend and frontend
task dev              # or: npm run dev
```

## Task Quick Reference

Install Task: https://taskfile.dev/installation/

| Task | Description |
|------|-------------|
| `task install` | Install all dependencies (root + frontend-enhanced) |
| `task dev` | Start backend + Next.js frontend |
| `task dev:back` | Backend only (port 5001) |
| `task dev:front` | Next.js frontend only (port 3001) |
| `task build` | Compile TypeScript → dist/ |
| `task build:all` | Build server + Next.js |
| `task typecheck` | TypeScript type check |
| `task lint` | ESLint |
| `task lint:fix` | ESLint with auto-fix |
| `task fmt` | Prettier format |
| `task test` | Unit + integration tests |
| `task test:coverage` | Tests with coverage |
| `task test:e2e` | Playwright e2e tests |
| `task db:generate` | Generate Drizzle migration |
| `task db:migrate` | Apply migrations |
| `task db:push` | Push schema (dev only) |
| `task db:studio` | Open Drizzle Studio |
| `task infra:up` | Start PostgreSQL (dev) |
| `task infra:down` | Stop PostgreSQL (dev) |
| `task docker:build` | Build production image |
| `task docker:prod:up` | Start full prod stack |
| `task ci` | Full CI gate (lint + tsc + test + build) |
| `task smoke` | Health check smoke test |
| `task clean` | Remove build artefacts |
| `task info` | Show build info (git, node, port) |

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | API port — default `5003` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `DATABASE_READONLY_URL` | — | Read replica (optional) |
| `REDIS_URL` | ✅ | Redis connection string |
| `SESSION_SECRET` | ✅ | Express session secret (strong random string) |
| `CONFIRM_CODE` | ✅ | SafeMode guard value for destructive ops |
| `SAFE_MODE` | ✅ | `on` or `off` — enables `X-Confirm-Code` guard |
| `CORS_ORIGIN` | ✅ | Comma-separated allowed origins |
| `NEXT_PUBLIC_API_BASE` | ✅ | Frontend → API URL (e.g. `http://localhost:5003`) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | ✅ | OAuth callback (e.g. `http://localhost:5003/auth/google/callback`) |
| `OPENAI_API_KEY` | ✅ | OpenAI API key (SousChef, GastroCount, GastroMind) |
| `GOOGLE_API_KEY` | — | Google Generative AI key (FoodFrame) |

## Dev Ports

| Service | Port | Notes |
|---------|------|-------|
| API Backend | **5003** | Express server (legacy: 5001) |
| Next.js Frontend | **3001** | `frontend-enhanced/` production app |
| React/Vite Frontend | **3000** | `client/` dev sandbox |
| PostgreSQL | 5432 | docker-compose or local |
| Prometheus | 9090 | optional metrics scraping |

## Startup Order

```
[PostgreSQL:5432] → [API:5003] → [Frontend:3001]
```

```bash
# Option A: Start everything
npm run dev          # starts backend (5001) + Next.js frontend (3001) concurrently

# Option B: Start individually
npm run dev:back     # backend only on port 5001
npm run dev:front    # frontend only on port 3001 (cd frontend-enhanced && next dev)
```

> **Windows:** Use `npm run dev:win` — kills ports 3000/3001 first and starts with cross-env.

## Project Structure

```
├── server/                 # Express backend
│   ├── agents/             #   Orchestrator entry point
│   ├── graph/              #   LangGraph state machine + nodes
│   ├── routes/             #   Thin HTTP route handlers
│   ├── services/           #   Business logic
│   ├── middleware/         #   Auth, RBAC, rate limiting
│   ├── config/             #   Agent routing, LLM config
│   └── enhanced-server.ts  #   Server entry point
├── frontend-enhanced/      # Next.js 14 production frontend (App Router)
├── client/                 # React + Vite dev sandbox
├── shared/
│   └── schema.ts           # Drizzle ORM schema — single source of truth
├── drizzle/                # Database migrations
└── .ai-factory/            # Architecture & project spec
```

## Architecture

This project follows **Layered Architecture**. See [.ai-factory/ARCHITECTURE.md](.ai-factory/ARCHITECTURE.md) for full details.

```
Presentation  →  Business Logic  →  Data Access  →  Infrastructure
(routes/)        (services/, graph/nodes/)  (db.ts)   (PostgreSQL, Redis)
```

**Key rules:**
- Route handlers are thin — validate input, call a service, return result. No LLM calls in routes.
- LangGraph nodes are stateless — receive `AgentState`, return `Partial<AgentState>`. No `req`/`res`.
- FoodFrame is media-only — never generates conversational text.
- No layer skipping — routes must not call `db.ts` directly.

## Canonical Agents (v2.5 LOCKED)

| ID | Label | Domain | Constraint |
|----|-------|--------|------------|
| `souschef` | SousChef | Recipes, prep, plating | — |
| `gastrocount` | GastroCount | Costs, inventory, reports | — |
| `gastromind` | GastroMind | Research, trends, insights | — |
| `foodframe` | FoodFrame | Photos, video, creative | **Visuals only — no text** |

Do not add, rename, or remove agents without updating all four locations:
1. `server/config/agent-routing.ts`
2. `frontend-enhanced/src/config/agents.ts`
3. `server/graph/graph.ts` (conditional edges)
4. `server/graph/nodes/` (node file)

## Database

```bash
# Generate migration after schema change
npm run drizzle:generate

# Apply migrations
npm run drizzle:migrate

# Push schema directly (dev only)
npm run db:push

# Open Drizzle Studio
npx drizzle-kit studio
```

Schema lives in `shared/schema.ts`. Never modify `drizzle/migrations/` by hand.

## Testing

```bash
# Unit + integration tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# End-to-end (Playwright)
npm run test:e2e

# Media agent integration test
npm run test:media
```

## SafeMode

Destructive routes (DB backup, etc.) require the `X-Confirm-Code` header:

```bash
curl -X POST http://localhost:5003/api/db/backup \
  -H "Authorization: Bearer $JWT" \
  -H "X-Confirm-Code: $CONFIRM_CODE"
```

Set `SAFE_MODE=off` in `.env` to disable the guard during development (not recommended).

## API Documentation

Swagger UI is served at runtime:

```
http://localhost:5003/docs/api
http://localhost:5003/docs/openapi.json
```

## Linting & Type Checking

```bash
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run check          # TypeScript type check
npm run ci:lint-tsc    # Both (CI gate)
```

## Useful Links

| Resource | Path |
|----------|------|
| Project spec | [.ai-factory/DESCRIPTION.md](.ai-factory/DESCRIPTION.md) |
| Architecture | [.ai-factory/ARCHITECTURE.md](.ai-factory/ARCHITECTURE.md) |
| Project map | [AGENTS.md](AGENTS.md) |
| Checkpoint | [CHECKPOINT.md](CHECKPOINT.md) |
| Agent routing design | [docs/AGENT_ROUTING_DESIGN.md](docs/AGENT_ROUTING_DESIGN.md) |
| UI/UX canon | [docs/UI_UX_CANON_v2.4.md](docs/UI_UX_CANON_v2.4.md) |
| ADRs | [.context/decisions/](.context/decisions/) |
| Evolution log | [docs/EVOLUTION_LOG.md](docs/EVOLUTION_LOG.md) |
