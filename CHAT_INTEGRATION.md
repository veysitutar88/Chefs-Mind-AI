# Chat Integration — 2026-02-26

## Root causes found

### 1. Proxy port mismatch
`frontend-enhanced/next.config.js` was routing all `/api/*` rewrites to
`http://localhost:5003`, but the backend's `PORT` is **5001** (set in `.env`
and validated by `env.schema.ts`). Every API call from the browser was hitting
a non-existent server and returning a network error.

### 2. Response field name mismatch
`server/routes/enhanced-agent-chat.ts` returns:
```json
{ "ok": true, "response": "<text>", "agent": "...", ... }
```
`frontend-enhanced/src/app/page.tsx` read the reply as:
```ts
data.reply || data.message
```
Neither field exists on the backend response, so the assistant bubble always
showed the hardcoded fallback string instead of the real answer.

---

## Fixes applied

| File | Change |
|------|--------|
| `frontend-enhanced/next.config.js` | Changed all four rewrite destinations from `http://localhost:5003` → `http://localhost:5001` |
| `frontend-enhanced/src/app/page.tsx` | Changed response extraction from `data.reply \|\| data.message` → `data.response \|\| data.reply \|\| data.message` |

---

## No auth changes needed

`jwtAuthMiddleware` (applied globally in `routes.ts`) is advisory-only: when no
`Authorization` header is present it simply calls `next()` without blocking.
The `enhanced-agent-chat` router does not apply the `authenticate` guard, so
unauthenticated requests succeed without any bypass flag.

---

## How to verify

### Start backend
```bash
# From project root  (C:\Projects\Chefs-Mind-AI\.claude\worktrees\sweet-lamarr)
npm run dev
# or: npx ts-node --esm server/index.ts
# Backend listens on http://localhost:5001
```

### Start frontend
```bash
cd frontend-enhanced
npm run dev
# Frontend listens on http://localhost:3000
```

### Manual smoke test
1. Open `http://localhost:3000`
2. The default agent is **souschef**
3. Type any message (e.g. "What can you cook?") and press Send
4. Expected: a reply appears in the assistant bubble containing text like
   `"Chef: \"What can you cook?\". Classified as: cooking."`
5. Browser **Network** tab → POST `/api/enhanced-agent/chat` → status **200**,
   response body contains `{ "ok": true, "response": "..." }`
6. Browser **Console** → no errors

### Quick curl test (bypasses frontend proxy entirely)
```bash
curl -X POST http://localhost:5001/api/enhanced-agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello chef"}' | jq .
```
Expected response shape:
```json
{
  "ok": true,
  "response": "Chef: \"Hello chef\". Classified as: cooking.",
  "agent": "Chef",
  "intent": "cooking",
  "reasoning": "...",
  "latency": 100,
  "qa": { "score": 90, "corrected": false }
}
```

---

## Remaining issues (known limitations)

- **Stub responses**: `enhanced-agent-chat.ts` currently returns a templated
  string (`"<Agent>: \"<message>\". Classified as: <intent>."`) rather than a
  real LLM answer. This is a known TODO in the route handler — actual agent
  invocation is scaffolded but not wired to a live model.
- **DATABASE_URL**: `.env` sets `DATABASE_URL=file:./dev.db`. If Zod's
  `z.string().url()` rejects the `file:` scheme at startup, set it to an
  absolute path: `DATABASE_URL=file:///absolute/path/dev.db` or swap the
  validator to `z.string().min(1)` for SQLite.
