# CHECKPOINT.md — The Single Source of Truth

🔒 Version Declaration (Canonical)                        Current Version: v2.4 (Active / Frozen)
Status: Context Freeze Completed
Scope: UI / Sidebar / Media Canon Repair

v3.0 Status: PLANNED
v3.0 has NOT started.
No tasks, specs, or architecture changes may reference v3.0 until v2.4 is fully stabilized.

> [!IMPORTANT]
> This file is now the PRIMARY SOURCE OF TRUTH for the project.
> No other context file overrides this document.
> `CHECKPOINT.json` is DEPRECATED and should be ignored.

## 1. Active Context

- **Active Block:** Block 9 — Media Studio Advanced Features
- **Active Step:** Canonization Complete. Ready for Sidebar Repair.
- **Last Action:** Context Freeze & Restoration
- **Current Sprint:** Deep V3 Audit & Cognition Fix

## 2. Infrastructure Status

- **Backend**: `server/` (Node/Express). Orchestrator uses Mocks.
- **Frontend**: `frontend-enhanced/` (Next.js 14).
  - **Sidebar**: ✅ **FIXED** — Using `components/layout/RightSidebar` (widget-based, Block 8 Followups visible).
  - **Media**: Fragmentation between Chat (FoodFrame) and Page (`/media`).
- **Cognition**: `knowledge_map.json` rebuilt against `frontend-enhanced`.

## 3.  Deployment & Environment

- **Env**: `.env` (Missing Media Keys).
- **Database**: Drizzle ORM (PostgreSQL).
- **Git Branch**: `feature/block0-infra-fix`.

## 4. Deprecated Context Files

The following files are considered legacy/deprecated and should not be used as sources of truth:

- `CHECKPOINT.json` (Use `CHECKPOINT.md`)
- `.context/agent_state.json` (Stale)
