# Project Decisions

> **Canonical Source:** `MASTER_CONTEXT_v2.1.6.mdown`

## Architecture Decisions
- **Monorepo Structure:** `server/` (Backend), `frontend-enhanced/` (New UI), `frontend/` (Legacy).
- **Multi-Agent System:** 5 specialized agents (Chef, Accountant, Researcher, Media, QA) routed by a central Orchestrator.
- **Database:** PostgreSQL with Drizzle ORM for type safety and migrations.
- **Authentication:** Google OAuth + RBAC (Role-Based Access Control).

## UI Decisions
- **Framework:** Next.js + Tailwind + shadcn/ui.
- **Design Style:** "ChatGPT with Projects" layout.
  - **Left Sidebar:** Agents list.
  - **Center:** Chat interface.
  - **Right Sidebar:** Tools (Search, Media, Calendar).
- **Aesthetics:** Dark mode, Na’Vi-blue accent, minimalist "fine dining" feel.

## Media Generation
- **Providers:** Abstraction layer supporting Imagen, Veo, DALL·E.
- **Prompt Enhancer:** `EnhancedMediaTool` service to optimize prompts before generation.
- **Storage:** `media_assets` table + local/cloud storage.

## Security
- **Safe Mode:** Confirmation required for destructive operations (backups, DB resets).
- **QA-Gate:** Dedicated agent layer to validate AI responses and prevent hallucinations.
