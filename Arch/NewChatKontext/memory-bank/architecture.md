# Architecture
## Backend
- Endpoints: /api/enhanced-agent/chat, /api/import, /api/dbadmin, /api/calendar, /metrics, /health.
- QA‑Gate middleware for agent responses (auto‑correction + scoring).
- Backups: nightly + manual POST /api/db/backup; retention; SHA256 triple verification.
- Google MCP: Calendar/Sheets/Docs helpers; OAuth unified routing.

## Data
- Postgres schemas (6 tables): orders, purchase_orders, suppliers, attachments, notes, calendar_links. UUIDs, indexes, Zod validation.

## Observability
- Lightweight Prometheus collector; /health aliases across variants.
- TODO(P2): histogram/summary for AI latency (p95); acceptance metrics per route.

## Security
- JWT + RBAC; SAFE_MODE with X‑Confirm‑Code for sensitive ops.

## Context Transport (v1.1)
- Files: CONTEXT.md, SESSION.md, CHECKPOINT.json, last_session.json.
- Functions: serialize_context(), load_context(), merge_context().
