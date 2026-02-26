# AGENTS.md

> Project map for AI agents. Keep this file up-to-date as the project evolves.

## Project Overview

Chef's Mind AI is a multi-agent AI platform for restaurant management, orchestrating specialized agents (SousChef, GastroCount, GastroMind, FoodFrame) via LangGraph to assist with recipes, cost management, research, and media generation.

## Tech Stack

- **Language:** TypeScript (ESM, Node.js 20+)
- **Backend:** Express.js
- **Frontend (prod):** Next.js 14 + App Router (`frontend-enhanced/`)
- **Frontend (sandbox):** React 18 + Vite 5 (`client/`)
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM
- **Agent Framework:** LangGraph (`@langchain/langgraph`)
- **AI APIs:** OpenAI, Google Vertex AI, Google Generative AI
- **Auth:** Passport.js + Express Session + Google OAuth + JWT
- **UI:** shadcn/ui + Radix UI + Tailwind CSS
- **Real-time:** Socket.IO + WebSockets
- **Testing:** Vitest + Playwright

## Project Structure

```
.
├── server/                    # Express backend (API + LangGraph orchestration)
│   ├── enhanced-server.ts     # Main server entry point
│   ├── index.ts               # Legacy server entry
│   ├── routes.ts              # Route registrations
│   ├── agents/                # Agent orchestrator
│   │   └── orchestrator.ts    # LangGraph invocation entry point
│   ├── graph/                 # LangGraph state machine
│   │   ├── graph.ts           # StateGraph: nodes + edges + routing
│   │   ├── types.ts           # AgentState type
│   │   ├── stream-utils.ts    # SSE/WebSocket streaming helpers
│   │   └── nodes/             # Individual agent + control nodes
│   │       ├── router.ts      # Intent classifier → picks agent
│   │       ├── chef.ts        # SousChef node
│   │       ├── accountant.ts  # GastroCount node
│   │       ├── researcher.ts  # GastroMind node
│   │       ├── media.ts       # FoodFrame node (visuals only)
│   │       ├── quality_control.ts  # Output validator
│   │       └── answer.ts      # Response formatter
│   ├── config/                # Server-side configuration
│   │   ├── agent-routing.ts   # Intent keyword → agent routing rules
│   │   ├── llm-config.ts      # Per-agent LLM model config
│   │   ├── media-config.ts    # Media generation config (Vertex AI)
│   │   └── models.ts          # Model definitions
│   ├── routes/                # Express route handlers (by domain)
│   ├── middleware/            # Auth, rate limiting, RBAC, SafeMode
│   ├── services/              # Business logic services
│   ├── auth.ts                # Auth setup (Passport, Google OAuth, JWT)
│   ├── db.ts                  # Database connection (Drizzle + Neon)
│   ├── session.ts             # Session config (Redis)
│   ├── health.ts              # /health endpoint
│   ├── metrics.ts             # Prometheus metrics
│   └── storage.ts             # File/asset storage helpers
│
├── frontend-enhanced/         # Next.js 14 production frontend (App Router)
│   └── src/
│       ├── app/               # Next.js App Router pages & layouts
│       ├── components/        # React components (shadcn/ui + custom)
│       ├── config/
│       │   └── agents.ts      # Canonical agent definitions (UI source of truth)
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Utilities and helpers
│       ├── styles/            # Global CSS, Tailwind config
│       └── types/             # TypeScript type definitions
│
├── client/                    # React + Vite sandbox frontend (dev/testing)
│
├── shared/
│   └── schema.ts              # Drizzle ORM schema (single source of truth for DB)
│
├── drizzle/
│   └── migrations/            # Database migration files
│
├── .ai-factory/               # AI agent context
│   ├── DESCRIPTION.md         # Project specification and tech stack
│   └── ARCHITECTURE.md        # Architecture decisions and guidelines
│
├── .context/                  # Living project context
│   ├── decisions/             # Architecture Decision Records (ADRs)
│   ├── evolution/             # Session evolution logs
│   └── README_CONTEXT.md      # Context system guide
│
├── docs/                      # Project documentation
├── checkpoints/               # Project state snapshots
├── drizzle.config.ts          # Drizzle Kit config
├── docker-compose.yml         # Local dev services
├── docker-compose.prod.yml    # Production services
├── Dockerfile                 # Container definition
└── package.json               # Root dependencies + scripts
```

## Key Entry Points

| File | Purpose |
|------|---------|
| `server/enhanced-server.ts` | Express server — main backend entry point |
| `server/agents/orchestrator.ts` | Agent system — invoke LangGraph for a request |
| `server/graph/graph.ts` | LangGraph StateGraph definition |
| `shared/schema.ts` | Drizzle ORM schema — single source of truth for DB |
| `frontend-enhanced/src/app/layout.tsx` | Next.js root layout |
| `frontend-enhanced/src/config/agents.ts` | Canonical agent definitions (UI) |
| `server/config/agent-routing.ts` | Canonical agent routing rules (backend) |
| `drizzle.config.ts` | Drizzle Kit migration config |
| `docker-compose.yml` | Local dev: PostgreSQL + Redis |
| `Taskfile.yml` | Build automation — all dev/build/test/docker tasks |

## Canonical Agents (v2.5 LOCKED)

| ID | Label | Domain | Constraint |
|---|---|---|---|
| `souschef` | SousChef | Recipes, prep, plating, ops | — |
| `gastrocount` | GastroCount | Costs, inventory, reports | — |
| `gastromind` | GastroMind | Research, trends, insights | — |
| `foodframe` | FoodFrame | Photos, video, creative | **Visuals only — no text gen** |

## Dev Ports

| Service | Port | Notes |
|---------|------|-------|
| API Backend | 5003 | Main dev port (legacy: 5001) |
| Frontend (prod) | 3001 | `frontend-enhanced` Next.js |
| Frontend (sandbox) | 3000 | `client` Vite |
| PostgreSQL | 5432 | docker-compose |
| Prometheus | 9090 | Optional metrics |

## Documentation

| Document | Path | Description |
|----------|------|-------------|
| README | README.md | Project overview and port matrix |
| Development Guide | DEVELOPMENT.md | Developer onboarding — setup, ports, scripts |
| Checkpoint | CHECKPOINT.md | Current project state snapshot (v2.5) |
| Changelog | CHANGELOG.md | Version history |
| ADRs | .context/decisions/ | Architecture Decision Records |
| Context | .context/README_CONTEXT.md | Living context system guide |

## AI Context Files

| File | Purpose |
|------|---------|
| AGENTS.md | This file — project structure map |
| .ai-factory/DESCRIPTION.md | Project specification and tech stack |
| .ai-factory/ARCHITECTURE.md | Architecture decisions and guidelines |
| .claude/skills/chefs-mind-agent-routing/SKILL.md | Agent routing patterns for this project |
| .context/decisions/ | Architecture Decision Records |
