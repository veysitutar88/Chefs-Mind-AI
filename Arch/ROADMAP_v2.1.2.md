# Chef’s Mind AI — Finishing Plan (v2.1.2)
**Generated:** 2025-11-11T17:55:31Z  
**Mode:** LOCAL (Surface deploy deferred)  
**Strategy:** Hybrid with priority on Vertical Slices (Blocks)

---

## 0) Current Readiness (from audits)
- **P1 (Critical): 100%** — base layers present (DB, API, Auth, Agents, Routes).
- **P2 (Important): ~83%** — metrics detail, UI common components pending.
- **Overall e2e readiness:** ~91% (needs vertical slices consolidation).

---

## 1) Vertical Slices to Finish (E2E)
### Block 1 — MVP User Flow (Login → Dashboard → Chat → Answer)
**Goal:** user logs in with Google and chats with Chef agent; answer appears in UI.  
**Status:** in-progress  
**Tasks:**
1. Fix dev deps: `typescript@5.6.3`, `cross-env`, `@types/express`, `@types/cors`; `tsconfig: skipLibCheck:true` (temporary).
2. Ensure `.env.local` contains: `PORT=5003`, `SESSION_SECRET`, `DATABASE_URL` (or in-memory fallback), Google OAuth keys + redirect.
3. Obtain **refresh token** (OAuth Playground), verify `/auth/google/status → ok:true`.
4. UI: Add “Login with Google” → redirect to `/dashboard`.
5. UI: Add Chat component on `/dashboard`; POST to `/api/enhanced-agent/chat` (Chef-only for MVP).
6. Smoke: `health`, `metrics`, `auth status`, `chat` happy-path.
**Acceptance:** register/login → ask question → see Chef response; no 4xx/5xx; `/health`=200; metrics served.

### Block 2 — Multi‑Agent Routing
**Goal:** orchestrator routes to the right agent (Chef/Accountant/Researcher/Media/QA).  
**Status:** pending  
**Tasks:**
1. Intent classifier + policy map (topics → agent).
2. Backend: `/api/enhanced-agent/chat` adds `agent` selection + metadata.
3. UI: agent badges + source-of-truth pill (who answered).
4. QA‑Gate: score + correctedResponse surfaced in UI.
**Acceptance:** 5 intents → 5 agents respond correctly (golden prompts).

### Block 3 — Data Persistence
**Goal:** stable data layer + last session resume.  
**Status:** partial  
**Tasks:**
1. Persist chat sessions + messages; enable 7‑day cleanup (already implemented — verify cron/flag).
2. CRUD: orders & suppliers (minimal UIs) behind RBAC.
3. Google Calendar: create event from chat action (confirm `/api/calendar/create` pass).
4. Backup: UI to trigger `/api/db/backup` and list backups.
**Acceptance:** chat history survives reload; manual backup works and appears in list; calendar smoke 200 OK.

### Block 4 — Media Studio
**Goal:** images (Imagen/DALL·E) + video (Veo) with asset list.  
**Status:** pending  
**Tasks:**
1. UI: simple form (prompt, model, size) + gallery.
2. Backend: guard providers; fallbacks for missing keys; log model meta.
3. Storage: save generated asset metadata; download link.
**Acceptance:** generate image & video; assets listed; missing creds handled gracefully.

### Block 5 — Analytics & Polish
**Goal:** insights, reports, stability.  
**Status:** pending  
**Tasks:**
1. Dashboard: p95 latency, request rate, error rate, OAuth status.
2. Reports export: daily/weekly MD to `/out/reports/` + CHANGELOG append.
3. Common UI components: StatusIndicator, HealthBadge, Skeleton.
4. E2E: Playwright suite for login/chat/backup/calendar/media (E2E_MODE stubs allowed).
**Acceptance:** all dashboards render; Playwright suite green on CI; no major console errors.

---

## 2) Cross‑Cutting Fixes (from audit)
- **TypeScript:** resolve ~44 errors in enhanced graph/media; keep MVP path minimal for Block 1.
- **Routes:** fix `routes.ts L472` (esbuild parse); or exclude problematic route in MVP.
- **ENV:** standardize `.env` (dev defaults for PORT, API URL, DB/Redis fallbacks).
- **OAuth/Vertex:** persist refresh token; add Vertex credentials for Imagen/Veo when available.
- **Prometheus:** add oauth_* counters + histogram for chat latency.

---

## 3) CI/CD & Quality Gates
- **CI steps:**
  1. `lint` (flat ESLint config, no peer conflicts),
  2. `tsc --noEmit`,
  3. `build` (vite split: clean prod, no dev deps),
  4. `test:e2e` (Playwright, E2E_MODE for stubs).
- **Metrics:** export `/metrics` in all variants; scrape config + alerts for error spikes.
- **Artifacts:** `out/reports/*.md|json` (health, metrics snapshot, backup logs).

---

## 4) Ownership & Timebox (realistic)
- **Week 1:** Block 1 (MVP user flow) — *critical path*.
- **Week 2:** Block 2 (multi‑agent) + start Block 3 (persistence basics).
- **Week 3:** Finish Block 3; start Block 4 (media UI).
- **Week 4:** Block 4 finish; Block 5 (analytics, polish) + E2E hardening.
> Итог: 3–4 недели до demo‑complete / prod‑ready (без Surface deploy).

---

## 5) Readiness Estimate (today)
- **Functional readiness:** ~91%
- **Block 1 completion gap:** ~6–8%
- **Block 2–5 scope remaining:** ~35–40% of total effort
- **Overall to v2.2.0 (prod‑ready):** ~4 weeks with current scope

---

## 6) Acceptance Matrix (per block)
| Block | API | UI | Auth | DB | QA/E2E | Done when |
|------|-----|----|-----|----|--------|-----------|
| 1 MVP | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | user login → chat → answer |
| 2 Routing | ✅ | ✅ | — | — | ⚠️ | 5 intents → correct agent |
| 3 Data | ✅ | ✅ | — | ✅ | ⚠️ | history/backup/calendar OK |
| 4 Media | ✅ | ✅ | — | ✅ | ⚠️ | image+video generated |
| 5 Analytics | ✅ | ✅ | — | — | ✅ | dashboards + CI green |

---

## 7) Concrete Commands (starter set)
```bash
# deps and types
npm i -D typescript@5.6.3 cross-env @types/express @types/cors

# sanity checks
curl -s http://localhost:5003/health
curl -s http://localhost:5003/metrics | head -n 20
curl -s http://localhost:5003/auth/google/status

# MVP chat (Chef)
curl -s -X POST http://localhost:5003/api/enhanced-agent/chat   -H "Content-Type: application/json"   -d '{"message":"Привет! Сколько гостей на банкет 119€?"}'
```

---

## 8) Risks & Mitigations
- **OAuth ok:false** → получить refresh-token (Playground), проверить scopes.
- **TypeScript build fail** → минимальный путь для MVP + постепенное закрытие 44 ошибок.
- **Missing .env in prod** → ship `.env.sample`, validate on boot.
- **Media keys** → graceful degradation (UI hints + server guards).

---

## 9) Definition of Done (Project)
- Blocks 1–5 acceptances satisfied.
- CI: lint + tsc + build + e2e pass on default branch.
- `/metrics` stable; alerting configured.
- `CTX_CHEFS_MIND_AI_ULTIMATE.md/json` auto‑updated after each major session.
- Demo recorded and attached to `RELEASE_NOTES v2.2.0`.
