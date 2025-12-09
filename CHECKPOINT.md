# CHECKPOINT.md — The Single Source of Truth

**Status:** Session Closed (Ready for New Baseline)
**Version:** v2.4-holy-six-complete
**Date:** 2025-12-09

> [!IMPORTANT]
> This file is automatically synchronized from `CHECKPOINT.json`. Do not edit manually.

## 1. Active Context

- **Active Block:** Block 9 — Media Studio Advanced Features
- **Active Step:** Canonization Complete. Ready for Sidebar Repair.
- **Last Action:** Project Canonize: Holy Six Bootstrap v2.4
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
