# Chef’s Mind AI — CONTEXT (v2.1.2)
**Updated:** 2025-11-11 19:59:11  
**Mode:** LOCAL (Surface deploy deferred)  
**Strategy:** Hybrid — build vertically by blocks, refine horizontally by layers.

---

## 0) PURPOSE
Единый контекст для любых LLM/агентов (Kilo Code, GPT, Gemini, Claude, Perplexity), описывающий текущее состояние, цели и правила работы. Используется Memory Bank’ом для восстановления мышления и корректного продолжения работ.

---

## 1) CURRENT FOCUS — Block 0: Infra‑fix (Finish & PR)
**Goal:** выровнять среду и поведение сервисов для стабильной работы vertical slices.

- Single source of truth: **PORT=5001** везде (`.env`, `.env.sample`, `docker-compose`, frontend API URL, E2E `baseURL`, npm scripts).
- Feature flag: `ENABLE_VIDEO=false` → `POST /api/media/video/generate` ⇒ **200** `{"ok":false,"reason":"video_disabled"}` (никаких 501).
- `/health` payload включает `port` и `video_enabled`.
- Smoke/E2E: зелёные; затем **open PR → merge → tag**.

**Acceptance for Block 0**
- `npm run dev`/Docker на 5001 без конфликтов портов.
- `/health` → `{ ok:true, port:5001, video_enabled:false }`
- `/metrics` доступен, экспортирует prom-client заголовки.
- `POST /api/media/video/generate` → 200 с `reason:"video_disabled"`
- Headed Playwright: pass; отчёты сохранены в `/out/reports`.

---

## 2) PROJECT STATUS SNAPSHOT
- **Checkpoint:** v2.1.2 (local). Nightly CI 02:00 UTC — активен.
- **Agents:** Chef, Accountant (Google MCP), Researcher (Perplexity), Media (Imagen/Veo; video зафлажен), QA‑Gate — готовы.
- **Routes mounted:** `/api/enhanced-agent/chat`, `/api/import`, `/api/dbadmin`, `/api/calendar`, `/api/health`, `/metrics`, `/auth/google/status`.
- **DB (6):** `orders`, `purchase_orders`, `suppliers`, `attachments`, `notes`, `calendar_links` (UUID, индексы, Zod‑схемы).
- **Security:** JWT + RBAC, SAFE_MODE (X‑Confirm‑Code), backup/restore с triple SHA256.
- **Observability:** Prometheus‑совместимые метрики + `/health` алиасы.

---

## 3) NEXT BLOCKS (Vertical Roadmap)
- **Block 1 — MVP user flow**: Google Login/Register UI → Dashboard с Agent Chat → `POST /api/enhanced-agent/chat` вывод ответа (демо).
- **Block 2 — Multi‑Agent routing**: Orchestrator intent → маршрутизация к Chef/Accountant/Researcher/Media/QA‑Gate.
- **Block 3 — Persistence**: Chat history, Orders CRUD, Calendar (Google) UI, Backup/Restore UI.
- **Block 4 — Media Studio**: UI, Imagen/DALL·E, Veo (когда `ENABLE_VIDEO=true`).
- **Block 5 — Analytics/Polish**: Дашборды, отчёты, perf/security, E2E hardening.

---

## 4) HORIZONTAL (Definition/Polish) — Когда >80% фич готовы
- Единые UI‑компоненты (StatusIndicator, HealthBadge, Skeleton) — **P2/NTH**.
- Детализация метрик: p95 длительности AI‑операций, гистограммы — **P2**.
- Оптимизация токенов и контекста (см. `.kilocode/rules/optimization-guidelines.md`).

---

## 5) WORKING PRINCIPLES (UNIFIED v1.1)
- **Context First** → перед задачей читать Memory Bank.
- **Plan Before Code** → план → код → тест → обзор → лог.
- **Minimal Assumptions** → без фантазий, только проверенные факты.
- **QA Everywhere** → валидировать каждый шаг.
- **Persistent Context** → `CONTEXT.md`/`SESSION.md`/`CHECKPOINT.json`/`last_session.json`.
- **Hybrid Strategy** → Build vertically, polish horizontally.

---

## 6) RUNTIME FLAGS & ENV (authoritative)
- `PORT=5001` (dev)
- `ENABLE_VIDEO=false` (до запуска Block 4)
- OAuth: Google (активен), Accountant/Calendar via MCP
- SAFE_MODE=on (требует `X-Confirm-Code` для опасных операций)

---

## 7) HEALTH & METRICS (must)
- `/health` → `{ ok:true, port, video_enabled }`
- `/metrics` → prom-client header present
- Nightly CI 02:00 UTC: health/metrics/smoke репорты в `/out/reports`

---

## 8) FILES TO LOAD (Memory Bank)
```
@/MASTER_CONTEXT_GUIDE_FULL.md
@/MASTER_CHECKPOINT_2025-11-06.md
@/.kilocode/rules/agent-protocol.md
@/.kilocode/workflows/workflows-extensions.md
@/.kilocode/rules/optimization-guidelines.md
@/SESSION.md
@/CHECKPOINT.json
```
*Опционально:* `FINAL_REPORT.md`, `FRONTEND_AUDIT_REPORT_2025-10-29.md`, `metrics_analysis.json`

---

## 9) TASK QUEUE (today)
1) Finish Block 0 acceptance (порты, health, video flag) → **PR**  
2) Сохранить артефакты: `/out/reports/block0_verification.md` + `CHANGELOG.md`  
3) Подготовить Block 1 план (UI Login/Chat) → `/out/reports/block1_plan.md`

---

## 10) RISKS
- Расхождение портов/URL между `.env`, Docker и E2E.
- Неполная детализация метрик (сложно ловить регресс).
- Неподключённые UI common‑компоненты (визуальная несогласованность).

---

## 11) GLOSSARY
- **Vertical slice** — сквозная фича (UI→API→DB→тест).
- **Definition/Horizontal** — поперечная шлифовка (рефактор, perf, UX).
- **Memory Bank** — набор файлов контекста для восстановления состояния.
