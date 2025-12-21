# Instructions & Guidelines

> **Canonical Source:** `MASTER_CONTEXT_v2.1.6.mdown` (Section 9)
> **Version:** v2.1.6
> **Updated:** 2025-11-23

## For AI Agents & Developers

### 1. Source of Truth
Always refer to **`MASTER_CONTEXT_v2.1.6.mdown`** and **`MASTER_MANIFEST.json`** before starting any task. Do not invent architecture; follow the established patterns.

### 2. Starting a New Session
1.  **Load Context:** Read `MASTER_CONTEXT_v2.1.6.mdown` and `MASTER_MANIFEST.json`.
2.  **Check Status:** Review `CHECKPOINT.json` to understand the current Block and active tasks.
3.  **State Intent:** "This is the master context... Using it as a base... Now we need to [Task]."

### 3. KiloCode Rules
- Keep `MASTER_MANIFEST.json` in `.kilocode/rules/`.
- Explicitly load the manifest when performing file operations.
- Update `CHECKPOINT.json` at the end of significant tasks or sessions.

### 4. Development Workflow
- **Plan:** Understand the requirement and check against `MASTER_CONTEXT`.
- **Implement:** Write code in the appropriate directories (`server/`, `frontend-enhanced/`).
- **Verify:** Run tests and verify against requirements.
- **Update:** Update documentation and checkpoints.

### 5. Critical Rules
- **No Hallucinations:** Verify facts against the codebase.
- **Safe Mode:** Respect `SAFE_MODE` settings for destructive DB operations.
- **UI Consistency:** Adhere to the "Fine Dining" aesthetic (Dark mode, Na’Vi blue).
