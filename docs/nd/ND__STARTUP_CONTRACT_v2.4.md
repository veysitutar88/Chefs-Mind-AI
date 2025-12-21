# ND — Startup Contract (v2.4)

Purpose:
Lock a deterministic startup procedure to prevent context drift after v2.4 freeze.

---

## 1. Canon Anchors (Immutable Facts)

- Repository: Chefs-Mind-AI
- Local Path (Windows): C:\Projects\Chefs-Mind-AI
- Canonical Branch: main
- UI Freeze Tag: ui-canon-v2.4
- Canonical Commit: e37ff0a
- UI State: Frozen
- Dev Verification: frontend-enhanced / npm run dev / OK / port 3001

---

## 2. Single Source of Truth

CHECKPOINT.md (repo root) is the ONLY source of truth.

Declared explicitly inside CHECKPOINT.md:

- “The Single Source of Truth”
- “No other context file overrides this document”

Any conflict is resolved in favor of CHECKPOINT.md.

---

## 3. Mandatory Startup Order (Every Session)

Before any reasoning or action:

1) Read CHECKPOINT.md fully.
2) Read docs/nd/ND__INDEX.md.
3) Follow ND rules strictly.
4) Treat everything else as non-canonical unless CHECKPOINT.md explicitly references it.

Agent must report which files were read before proceeding.

---

## 4. Hard Prohibitions (Drift Prevention)

- No new architecture
- No refactor
- No UI polish
- No auto-updating canon
- No creating alternative sources of truth
- No interpreting legacy context as canon

---

## 5. Version Discipline

- v2.4 is Frozen.
- Any change requires:
  1) New TASK_SPEC
  2) New version bump (v2.5+)
  3) New tag after freeze

---

## 6. Final Rule

If ambiguity exists:

1) CHECKPOINT.md wins
2) ui-canon-v2.4 anchors UI
3) Everything else is reference, telemetry, or archive
