# ND — Non-Canonical List (v2.4)

Purpose:
Define what must NOT influence decisions by default.

---

## 1. Deprecated Checkpoint Artifacts

- CHECKPOINT.json
- CHECKPOINT_backup.json
- CHECKPOINT.mdown (if present)

Rule:
Deprecated. Must never override CHECKPOINT.md.

---

## 2. Legacy Master Contexts

- MASTER_CONTEXT*.mdown
- Unified Master Context*
- Legacy D-FILE artifacts

Rule:
Historical reference only. Never canon.

---

## 3. Legacy Application Folders

- client/
- frontend/
- frontend-simple/

Rule:
Out of active scope. Imports or logic depending on them are invalid unless explicitly re-approved.

---

## 4. Cognition Telemetry (Support Only)

- .context/knowledge_map.json
- .context/heatmap.json
- .context/evolution/*
- .context/agent_state.json

Rule:
Telemetry only. Never defines decisions or canon.

---

## 5. Reports and Archives

- reports/
- *.zip /*.rar archives
- old audit reports (e.g., 2025-12-07)

Rule:
Historical only.

---

## 6. Garbage / Temp Artifacts

- .husky_temp/
- corrupt filenames or directories detected in audits

Rule:
Cleanup targets. Not informational.
