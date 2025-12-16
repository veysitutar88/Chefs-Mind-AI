# CHECKPOINT.md — The Single Source of Truth

**Status:** Context Freeze Completed
**Version:** v2.4-holy-six-complete
**Date:** 2025-12-16

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
  - **Sidebar**: **CRITICAL MISMATCH** (Active=`ui/RightSidebar`, Required=`layout/RightSidebar`).
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
