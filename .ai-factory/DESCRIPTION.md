# Project: Chef's Mind AI

## Overview

Chef's Mind AI is a multi-agent AI platform for restaurant management. It orchestrates specialized AI agents (SousChef, GastroCount, GastroMind, FoodFrame) via LangGraph to assist restaurant operators with recipes, cost management, research, and media generation. The system exposes a REST/WebSocket API (Express + TypeScript) consumed by a production Next.js frontend and a Vite sandbox.

## Core Features

- **Multi-agent orchestration:** LangGraph-based routing dispatches user requests to the correct agent (Chef, Accountant, Researcher, Media)
- **SousChef Agent:** Menu creation, recipe generation, ingredient substitutions, prep & plating guidance
- **GastroCount Agent:** Cost breakdown, pricing analysis, inventory management, financial reports
- **GastroMind Agent:** External research, ingredient sourcing, food trend analysis
- **FoodFrame Agent:** AI-powered photo/video generation for dishes and menus (visuals only — no text generation)
- **Authentication:** Google OAuth, JWT bearer tokens, Passport.js session auth
- **RBAC + SafeMode:** Role-based access control with `X-Confirm-Code` guard for destructive operations
- **Real-time comms:** Socket.IO / WebSocket for streaming agent responses
- **Media generation pipeline:** Integration with Google Vertex AI and OpenAI for image/video synthesis
- **Prometheus metrics:** Observability endpoint at `/api/metrics`
- **Swagger/OpenAPI:** Auto-generated API docs at `/docs/api`

## Tech Stack

- **Language:** TypeScript (ESM, Node.js 20+)
- **Backend Framework:** Express.js (`server/enhanced-server.ts`)
- **Frontend (Production):** Next.js 14 + App Router + Server Components (`frontend-enhanced/`)
- **Frontend (Dev/Sandbox):** React 18 + Vite 5 (`client/`)
- **Database:** PostgreSQL (Neon serverless via `@neondatabase/serverless`)
- **ORM:** Drizzle ORM (schema: `shared/schema.ts`, migrations: `drizzle/migrations/`)
- **Agent Framework:** LangGraph (`@langchain/langgraph`) with LangChain OpenAI
- **AI APIs:** OpenAI, Google Vertex AI, Google Generative AI
- **Auth:** Passport.js + Express Session + Google OAuth + JWT (`jsonwebtoken`)
- **UI Components:** shadcn/ui + Radix UI + Tailwind CSS 3 + framer-motion
- **State Management (frontend):** Zustand + TanStack Query
- **Real-time:** Socket.IO + `ws`
- **Session Store:** Redis (`connect-redis`)
- **Testing:** Vitest (unit/integration) + Playwright (e2e)
- **Observability:** Prometheus (`prom-client`)
- **Containerization:** Docker + docker-compose
- **Package Manager:** npm

## Architecture Notes

- **Dual frontend architecture (ADR-0001):** `client/` is the Vite sandbox for rapid prototyping; `frontend-enhanced/` is the production Next.js app. Both share API contracts from `shared/`.
- **LangGraph orchestration (ADR-0002):** All agent requests flow through `server/agents/orchestrator.ts` → LangGraph state machine → individual agent nodes (`server/graph/nodes/`) → QC node → answer formatter.
- **Canonical agents (locked at v2.5):** souschef, gastrocount, gastromind, foodframe. Agent config lives in `src/config/agents.ts` (frontend) and `server/config/agent-routing.ts` (backend).
- **Monorepo layout:** Backend in `server/`, shared types/schema in `shared/`, production frontend in `frontend-enhanced/`, sandbox frontend in `client/`.
- **Port matrix:** API 5003 (legacy 5001), Frontend 3000/3001, PostgreSQL 5432, Prometheus 9090.

## Architecture

See `.ai-factory/ARCHITECTURE.md` for detailed architecture guidelines.
Pattern: Layered Architecture

## Non-Functional Requirements

- Logging: Morgan HTTP logger + structured server logs; append-only `reports/ACTION_LOG.md` for operational changes
- Error handling: Structured JSON error responses; SafeMode guard on destructive routes
- Security: JWT + session auth, Helmet.js CSP headers, express-rate-limit, RBAC middleware
- Observability: Prometheus metrics, Swagger UI at `/docs/api`
- Testing: Vitest for unit/integration, Playwright for e2e, smoke scripts in `scripts/`
