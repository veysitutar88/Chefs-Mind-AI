# Context (Now)
- Target: Finish **Block 0: Infra‑fix**.
  - Single source of truth: PORT=5001 everywhere (.env.sample, docker-compose, frontend API URL, E2E baseURL, scripts).
  - Feature flag: ENABLE_VIDEO=false; `/api/media/video/generate` returns **200** `{ ok:false, reason:"video_disabled" }` (no 501).
  - Health payload includes port + video flag.
  - Smoke/E2E green; open PR → merge.

- Checkpoint Status: v2.1.1 (local). Agents ready (Chef, Accountant/Google MCP, Researcher/Perplexity, Media, QA‑Gate).
- Routes mounted: /api/enhanced-agent/chat, /api/import, /api/dbadmin, /api/calendar, /api/health, /metrics.
- DB: 6 tables (orders, purchase_orders, suppliers, attachments, notes, calendar_links). Security: JWT+RBAC, SAFE_MODE, backup/restore with triple SHA256.

## Next (after Block 0)
- Block 1: MVP user flow — Login/Register UI (Google), Dashboard with Agent Chat, POST /api/enhanced-agent/chat wiring, demo.
- Artifacts → /out/reports + CHANGELOG; update Context/Checkpoint after green runs.
