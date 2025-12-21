# ND — A→B Execution Plan (v2.4)

Scope:
Operate safely after confirmed v2.4 freeze.

Anchor:
main @ e37ff0a
ui-canon-v2.4
CHECKPOINT.md = Single Source of Truth

---

## Track A — Canon Hygiene (NO REFACTOR)

### A0. Hard Gates

- No new architecture
- No refactor
- No UI changes
- Only cleanup, archive, doc alignment

---

### A1. Freeze Verification

- git log -1 shows e37ff0a with tag ui-canon-v2.4
- CHECKPOINT.md declares itself primary source of truth

---

### A2. Archive Strategy (Preferred)

Create:
archive/context_legacy_YYYYMMDD/

Move (not delete):

- legacy MASTER_CONTEXT*
- Unified Master Context*
- legacy D-FILEs
- deprecated checkpoint artifacts
- old report bundles

Purpose:
Preserve historical reasoning without polluting canon.

---

### A3. Root Hygiene

- Remove known corrupt filenames
- Remove .husky_temp/ if unused
- Fix broken .gitignore entries

---

### A4. Docs Consolidation

- Keep Holy Six / UI Canon / ND docs
- Mark or archive everything else as deprecated

---

### A5. Cognition Telemetry Reset (Safe)

- Rebuild knowledge_map.json using:
  - frontend-enhanced
  - server
- Reset heatmap.json to post-freeze baseline

---

## Track B — Future Work (Requires v2.5+)

Rule:
v2.4 is Frozen.

Any work beyond cleanup requires:

- New TASK_SPEC
- New version bump
- New tag

---

## Future (v2.5+ Only)

Planned (not implemented here):

- DB table: project_canon_docs (path, version, tag, hash)
- UI view: Canon Docs

Reason:
SAFE mode forbids DB/schema changes in v2.4.x.
