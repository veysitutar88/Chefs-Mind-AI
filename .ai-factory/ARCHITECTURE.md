# Architecture: Layered Architecture

## Overview

Chef's Mind AI uses a **Layered Architecture** — a pragmatic horizontal separation of concerns
that maps cleanly to the existing codebase structure. Each layer has a single responsibility
and may only depend on the layer directly below it.

This pattern was chosen for its simplicity and low operational overhead, making it well-suited
for a small-medium team managing a complex multi-agent AI backend with a separate Next.js
production frontend. The LangGraph agent system sits inside the **Business Logic layer** as a
specialized sub-system, keeping infrastructure concerns (Express routes, database) separate
from agent execution logic.

## Decision Rationale

- **Project type:** Multi-agent AI platform (restaurant management)
- **Tech stack:** TypeScript, Express.js, Next.js 14, PostgreSQL + Drizzle ORM
- **Key factor:** Existing code already follows a natural horizontal layer structure;
  Layered Architecture formalizes and enforces it without introducing migration cost

## Layers

```
┌──────────────────────────────────────────────────────────┐
│  Presentation Layer                                       │
│  server/routes/   server/middleware/                      │
│  frontend-enhanced/src/app/   client/src/                 │
├──────────────────────────────────────────────────────────┤
│  Business Logic Layer                                     │
│  server/services/   server/agents/   server/graph/        │
│  server/graph/nodes/   server/auth.ts                     │
├──────────────────────────────────────────────────────────┤
│  Data Access Layer                                        │
│  server/db.ts   server/storage.ts   server/session.ts     │
│  shared/schema.ts                                         │
├──────────────────────────────────────────────────────────┤
│  Infrastructure / External                                │
│  PostgreSQL   Redis   OpenAI API   Google Vertex AI       │
│  Google OAuth   Prometheus                                │
└──────────────────────────────────────────────────────────┘
```

## Folder Structure

```
server/
├── routes/                  # [Presentation] Express route handlers — thin, no logic
│   ├── auth.ts              #   Auth endpoints (login, oauth, logout)
│   ├── agents.ts            #   Agent chat/stream endpoints
│   ├── media.ts             #   Media generation endpoints
│   └── ...
├── middleware/              # [Presentation] Cross-cutting: auth guard, RBAC, rate limit
│   ├── auth.ts
│   ├── rbac.ts
│   └── safeMode.ts
├── services/                # [Business Logic] Pure business logic — no HTTP/DB knowledge
│   ├── agentService.ts
│   ├── mediaService.ts
│   └── ...
├── agents/                  # [Business Logic] LangGraph entry point
│   └── orchestrator.ts      #   Converts HTTP request → graph invocation
├── graph/                   # [Business Logic] LangGraph state machine
│   ├── graph.ts             #   StateGraph definition (nodes + edges)
│   ├── types.ts             #   AgentState type
│   ├── stream-utils.ts      #   Streaming helpers
│   └── nodes/               #   Agent nodes (no HTTP, no direct DB)
│       ├── router.ts
│       ├── chef.ts
│       ├── accountant.ts
│       ├── researcher.ts
│       ├── media.ts
│       ├── quality_control.ts
│       └── answer.ts
├── db.ts                    # [Data Access] Drizzle client — exports `db`
├── storage.ts               # [Data Access] File/asset storage helpers
├── session.ts               # [Data Access] Redis session store setup
└── enhanced-server.ts       # [Presentation] Server bootstrap — mounts routes

shared/
└── schema.ts                # [Data Access] Drizzle ORM table definitions

frontend-enhanced/src/
├── app/                     # [Presentation] Next.js App Router pages + layouts
├── components/              # [Presentation] React components
├── hooks/                   # [Business Logic] Client-side logic (TanStack Query, state)
├── lib/                     # [Business Logic] Client utilities, API client helpers
├── config/
│   └── agents.ts            # Canonical agent definitions (frontend source of truth)
└── types/                   # TypeScript types shared across frontend layers
```

## Dependency Rules

```
Presentation  →  Business Logic  →  Data Access  →  Infrastructure
```

- ✅ `routes/` may call `services/` and `agents/orchestrator.ts`
- ✅ `services/` may call `db.ts` and `storage.ts`
- ✅ `graph/nodes/` may call `services/` (for data access patterns)
- ✅ `db.ts` uses `shared/schema.ts`
- ✅ `middleware/` may call `services/` for auth checks
- ❌ `routes/` must NOT contain business logic (no agent decision code in routes)
- ❌ `graph/nodes/` must NOT import from `routes/` or `middleware/`
- ❌ `services/` must NOT import Express types (`Request`, `Response`)
- ❌ `shared/schema.ts` must NOT import from `server/` (it belongs to Data Access)
- ❌ No layer may skip layers — routes must not call `db` directly

## Layer Communication

**HTTP request flow (backend):**
```
HTTP Request
  → routes/agents.ts           (validates input, calls service)
  → services/agentService.ts   (orchestrates, calls orchestrator)
  → agents/orchestrator.ts     (invokes LangGraph graph)
  → graph/nodes/router.ts      (classifies intent)
  → graph/nodes/chef.ts        (agent logic, may call services for DB)
  → services/someService.ts    (data access via db.ts)
  → db.ts                      (Drizzle query)
  → PostgreSQL
```

**Frontend data flow:**
```
app/page.tsx (Server Component)
  → fetch / Server Action       (HTTP to Express backend)
  → hooks/useAgent.ts           (TanStack Query, client state)
  → lib/apiClient.ts            (API call helpers)
```

**Streaming (agent responses):**
```
routes/agents.ts  →  graph/stream-utils.ts  →  graph/graph.ts.stream()
  → SSE chunks sent to frontend via Socket.IO or text/event-stream
```

## Key Principles

1. **Routes are thin** — A route handler should: validate input → call a service → return the result. No business logic, no LangGraph calls directly.

2. **Services own business logic** — If you're making a decision about the domain (which agent to use, how to format a cost report), that belongs in `services/` or `graph/nodes/`.

3. **Nodes are stateless** — LangGraph nodes receive `AgentState`, return `Partial<AgentState>`. No Express `req`/`res` objects, no direct database calls (use services instead).

4. **FoodFrame is media-only** — The `media` node must never add conversational text to `messages`. It returns `mediaAssets: string[]` only.

5. **`shared/schema.ts` is the DB contract** — All database table definitions live here. Frontend types may import Zod schemas derived from this file via `drizzle-zod`.

## Code Examples

### Route handler (Presentation Layer — thin)

```typescript
// server/routes/agents.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { runAgentStream } from '../services/agentService';

const router = Router();

router.post('/chat', requireAuth, async (req, res) => {
  const { message, sessionId } = req.body;
  // ✅ Validate → delegate → respond
  await runAgentStream({ message, sessionId, userId: req.user!.id }, res);
});

export default router;
```

### Service (Business Logic Layer)

```typescript
// server/services/agentService.ts
import { runAgent } from '../agents/orchestrator';
import type { Response } from 'express';
// ✅ May use db.ts, orchestrator — does NOT import Express Router or route types

export async function runAgentStream(
  input: { message: string; sessionId: string; userId: string },
  res: Response
): Promise<void> {
  // business logic: validate session, enrich context, invoke graph
  const state = await runAgent(input);
  res.json(state);
}
```

### Graph node (Business Logic Layer — no HTTP)

```typescript
// server/graph/nodes/chef.ts
import { ChatOpenAI } from '@langchain/openai';
import type { AgentState } from '../types';
// ✅ No Express, no db import — pure state transformation

export async function chefNode(state: AgentState): Promise<Partial<AgentState>> {
  const llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.7 });
  const response = await llm.invoke(state.messages);
  return { messages: [...state.messages, response] };
}
```

### Data access (Data Access Layer)

```typescript
// server/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
// ✅ Single db export consumed by services

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

## Anti-Patterns

- ❌ **Fat routes** — Do not put LLM calls, Drizzle queries, or agent logic directly in route handlers
- ❌ **Express leaking into nodes** — LangGraph nodes must not receive `req`/`res` objects
- ❌ **Direct DB in nodes** — Graph nodes should call `services/` for data, not `db` directly
- ❌ **FoodFrame text output** — The media node must never generate conversational text
- ❌ **Skipping layers** — A route must not call `db.ts` directly (bypasses service logic and caching)
- ❌ **Frontend importing server internals** — `frontend-enhanced/` must only consume public API endpoints, never server-side modules
- ❌ **Shared schema importing server code** — `shared/schema.ts` is infrastructure-only; no Express/services imports
