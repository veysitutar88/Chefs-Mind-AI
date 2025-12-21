# ND — Index (v2.4.1 Canon Ops Pack)

Role: Operational canon pack for stable project continuity.
Rule: This pack does NOT redefine product architecture; it enforces how canon is loaded and how drift is prevented.

## Must-read order (every new agent session)

1. [CHECKPOINT.md](../../CHECKPOINT.md) (repo root) — Single Source of Truth
2. [docs/nd/ND__STARTUP_CONTRACT_v2.4.md](ND__STARTUP_CONTRACT_v2.4.md)
3. [docs/nd/ND__NON_CANONICAL_LIST.md](ND__NON_CANONICAL_LIST.md)
4. [docs/nd/ND__A_B_EXECUTION_PLAN_v2.4.md](ND__A_B_EXECUTION_PLAN_v2.4.md)

## Canon anchors

- **UI freeze tag:** ui-canon-v2.4 @ e37ff0a
- **Canon ops tag:** canon-ops-v2.4.1 (this pack)

## Non-canonical default

Anything not explicitly referenced by CHECKPOINT.md is non-canonical by default (legacy contexts, old master files, old audits, telemetry maps).

## DB integration (DEFERRED)

Storing canon documents in database is a v2.5+ task only.
In v2.4.x we store canon ops as repo documents under `docs/nd/`.

### Why deferred

SAFE mode forbids new architecture / refactor. DB integration requires schema + UI/API touches and must be planned separately.
