# Product
## Problem & Value
- Restaurant needs unified workflows: recipes → purchasing → finance → media → reporting, powered by reliable AI agents.
- Value: end‑to‑end tasks, backups, and QA‑gated outputs; rapid demo via vertical slices; Media Studio as USP.

## MVP
- Login (Google OAuth) → Dashboard → Agent Chat (Chef) with QA‑Gate overlay; minimal schema persistence.

## Roadmap (vertical blocks)
1) Infra‑fix (now): unify port 5001 + compose + demote video endpoint to 200 when disabled; smoke/E2E green; PR merged.
2) Block 1: MVP User Flow — login→chat e2e; single agent visible in UI.
3) Block 2: Multi‑Agent routing — orchestrator + 5 agents in UI.
4) Block 3: Data persistence — chat history, orders CRUD, calendar integration, backup UI.
5) Block 4: Media Studio — Imagen/Veo/DALL·E flows & asset mgmt.
6) Block 5: Analytics & Polish — dashboards, reports, perf.
