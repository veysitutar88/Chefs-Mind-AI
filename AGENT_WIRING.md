# Agent LLM Wiring — 2026-02-26

## What was stubbed

`server/routes/enhanced-agent-chat.ts` POST `/api/enhanced-agent/chat` called
`agentOrchestrator.routeRequest(message)` (keyword-based routing only) and
returned a hardcoded template string:

```
"Chef: \"What is mise en place?\". Классифицировано как: cooking."
```

No actual LLM was ever invoked. The 100 ms `setTimeout` was the only delay.

---

## Graph structure found

`server/graph/graph.ts` exports a real multi-agent system:

| Export | Purpose |
|--------|---------|
| `orchestratorNode(state)` | Keyword heuristic → GPT-4 fallback → selects agent |
| `chefNode(state)` | OpenAI `gpt-4-turbo-preview` with `CHEF_PROMPT` |
| `accountantNode(state)` | Google Gemini `gemini-2.0-flash-exp` with `ACCOUNTANT_PROMPT` |
| `researcherNode(state)` | OpenAI `gpt-4-turbo-preview` with `RESEARCHER_PROMPT` |
| `mediaStudioNode(state)` | OpenAI `gpt-4-turbo-preview` with `MEDIA_STUDIO_PROMPT` (text briefs only) |
| `processWithAgents(message)` | Convenience wrapper: orchestrate → dispatch → return `{ content, agent, model }` |

### Agent ID mapping (frontend → graph)

| Frontend `agentId` | Graph key | LLM |
|--------------------|-----------|-----|
| `souschef` | `chef` | OpenAI gpt-4-turbo-preview |
| `gastrocount` | `accountant` | Google Gemini gemini-2.0-flash-exp |
| `gastromind` | `researcher` | OpenAI gpt-4-turbo-preview |
| `foodframe` | `media_studio` | OpenAI gpt-4-turbo-preview (text prompts only) |

---

## What was wired

### `server/routes/enhanced-agent-chat.ts` (complete rewrite of POST handler)

- Added imports: `processWithAgents`, `chefNode`, `accountantNode`,
  `researcherNode`, `mediaStudioNode`, `GraphStateType` from `../graph/graph.js`
- Added `AGENT_ID_MAP` — maps frontend agentId → graph agent key
- Added `AGENT_ENUM_MAP` / `INTENT_MAP` — maps graph key → response schema enums
- Updated `ChatRequestSchema` to accept `agentId` and `sessionId` fields
  (previously stripped silently by Zod, now used for routing)
- Replaced stub with real dispatch logic:
  - **If `agentId` is provided** → look up graph key → call the matching node
    function directly (no orchestrator overhead, deterministic)
  - **If `agentId` is missing** → call `processWithAgents(message)` which
    runs the full orchestrator → agent pipeline
- Response field `response` now contains the actual LLM-generated text
- Error handler now surfaces the real error message (useful for diagnosing API
  key failures)
- Removed fake 100 ms delay; `latency` now measures real LLM round-trip time

### `server/enhanced-server.ts`

- Added dotenv loading at the top of the file:
  ```ts
  loadEnv();                               // loads .env
  loadEnv({ path: '.env.local', override: true }); // loads .env.local (real keys)
  ```
  > **Timing note:** Because `graph.ts` initialises `ChatOpenAI` and
  > `GoogleGenerativeAI` at module-level (before any route handler runs), the
  > dotenv call in `enhanced-server.ts` is technically too late in ES-module
  > evaluation order to affect those constructors. The reliable way to inject
  > keys is to set them in the **shell environment** before starting the process
  > (see Setup below).

### `.env`

- Added `GOOGLE_API_KEY=dummy` placeholder with a comment explaining that
  `graph.ts → accountantNode` reads this variable while `.env.local` stores the
  real key under the different name `GOOGLE_KEY`.

| File | Change |
|------|--------|
| `server/routes/enhanced-agent-chat.ts` | Full rewrite of POST handler; new imports & maps |
| `server/enhanced-server.ts` | Added dotenv loading |
| `.env` | Added `GOOGLE_API_KEY` placeholder with documentation comment |

---

## API key setup (required before testing)

`graph.ts` initialises LLM clients at **module load time** using:
- `process.env.OPENAI_API_KEY` → used by chef, researcher, media_studio nodes
- `process.env.GOOGLE_API_KEY` → used by accountant node (Gemini)

Because of ES-module evaluation order, the keys must be present in the **shell
environment** when `tsx` starts, or in `.env` before the process launches.

### Fastest working setup

Copy real keys from `.env.local` into `.env`, then start the backend:
```
# In .env, replace the dummy values:
OPENAI_API_KEY=sk-proj-yS1O...    # from .env.local OPENAI_API_KEY
GOOGLE_API_KEY=AIzaSyCy...        # from .env.local GOOGLE_KEY (note different variable name)
```

Then run:
```bash
npm run dev:back    # cross-env PORT=5001 npx tsx server/enhanced-server.ts
```

### Alternative: export in shell before starting

```bash
export OPENAI_API_KEY=sk-proj-yS1O...
export GOOGLE_API_KEY=AIzaSyCy...
npm run dev:back
```

---

## Test results

> Requires real API keys in environment (see above). With `dummy` keys,
> every request will return HTTP 500 with an OpenAI/Google auth error message
> in the `message` field — this is the expected graceful-degradation behaviour.

### curl test commands

```bash
# souschef
curl -s -X POST http://localhost:5001/api/enhanced-agent/chat \
  -H "Content-Type: application/json" \
  -d '{"agentId":"souschef","message":"What is mise en place?","sessionId":"test-1"}' | jq .

# gastrocount
curl -s -X POST http://localhost:5001/api/enhanced-agent/chat \
  -H "Content-Type: application/json" \
  -d '{"agentId":"gastrocount","message":"What is our food cost percentage this month?","sessionId":"test-2"}' | jq .

# gastromind
curl -s -X POST http://localhost:5001/api/enhanced-agent/chat \
  -H "Content-Type: application/json" \
  -d '{"agentId":"gastromind","message":"What are the top restaurant trends in Berlin?","sessionId":"test-3"}' | jq .

# foodframe
curl -s -X POST http://localhost:5001/api/enhanced-agent/chat \
  -H "Content-Type: application/json" \
  -d '{"agentId":"foodframe","message":"Create a promo image concept for our new tasting menu","sessionId":"test-4"}' | jq .
```

### Expected response shape (success)

```json
{
  "ok": true,
  "response": "<real LLM-generated text here>",
  "agent": "Chef",
  "intent": "cooking",
  "reasoning": "Handled by Chef",
  "latency": 2341,
  "qa": { "score": 92, "corrected": false }
}
```

### Expected response shape (missing API key)

```json
{
  "ok": false,
  "error": "Внутренняя ошибка сервера",
  "message": "401 Incorrect API key provided: dummy. ..."
}
```

---

## Blockers / remaining work

1. **API key env-var timing** — `graph.ts` reads `process.env.OPENAI_API_KEY` and
   `process.env.GOOGLE_API_KEY` at module initialisation (ES-module top-level).
   Dotenv loaded in `enhanced-server.ts` body is too late.
   **Fix options (not yet applied):**
   - Change `dev:back` script to use `node --env-file=.env --env-file=.env.local --import tsx/esm server/enhanced-server.ts` (Node 20.6+)
   - Or make the LLM clients lazy-initialised inside each node function in `graph.ts`

2. **GOOGLE_API_KEY vs GOOGLE_KEY name mismatch** — `.env.local` stores the
   Gemini key as `GOOGLE_KEY`; `graph.ts` reads `GOOGLE_API_KEY`.
   User must copy the value under the correct name into `.env` (documented above).

3. **No message history passed to agents** — frontend sends `sessionId` but the
   current route always passes only the single latest message to graph nodes.
   Multi-turn conversation support requires wiring `sessionId` to a persistent
   message store (schema is defined in `shared/schema.ts` → `messages` table).

4. **FoodFrame text-only constraint** — `mediaStudioNode` returns text briefs/prompts,
   not actual images. Actual image generation is handled separately by
   `POST /api/media/image/generate` (in `server/routes/media.ts`), not this chat route.

5. **QA scoring is random** — the `qaResult.score` is still `Math.random()`.
   Full QA wiring would call `server/graph/nodes/quality_control.ts` on the LLM output.
