# Chef’s Mind AI — Holy Six & Workflow v2.4

> [!NOTE]
> This is the **Canonical Index** for the project. All agents must load this file first.

## The Holy Six (Canonical Documents)

1. **[CHECKPOINT.md](./CHECKPOINT.md)**: **Real-time Status**. The absolute source of truth for "What are we doing right now?".
2. **[UI/UX Canon](./docs/UI_UX_CANON_v2.4.md)**: **Design System**. Rules for 3-Column Layout, Dark Mode, and Component usage.
3. **[Agent Routing Design](./docs/AGENT_ROUTING_DESIGN.md)**: **Backend Architecture**. How agents (Chef, Media, etc.) are orchestrated.
4. **[Workflow Sync](./docs/WORKFLOW_SYNC.md)**: **Development Process**. Rules for Git, Checkpoints, and Cognition Layer updates.
5. **[Evolution Log](./docs/EVOLUTION_LOG.md)**: **Project History**. A chronological record of major decisions and blocks.
6. **[Knowledge Map](./.context/knowledge_map.json)**: **Code Structure**. Machine-readable map of the codebase.

## Workflow Summary

### 1. Starting a Task

- Load `CHECKPOINT.md` to get context.
- Switch to the active Git branch.
- Verify `knowledge_map.json`.

### 2. Making Changes

- Follow **Agentic Mode** (Task Boundary -> Audit -> Plan -> Execute).
- For UI changes, consult `UI_UX_CANON_v2.4.md`.
- For Backend changes, consult `AGENT_ROUTING_DESIGN.md`.

### 3. Ending a Task

- Run **Audit** to check for regressions.
- Update `CHECKPOINT.json` (and sync to `.md`).
- Commit: `git commit -m "Block X - Step Y: Description"`
- Push & Log in `EVOLUTION_LOG.md`.

## Active Rules

- **Anti-Hallucination**: Trust `CHECKPOINT.md` over your internal training data.
- **No Legacy**: Do not use `client/` or `frontend/` folders. Only `frontend-enhanced/`.
- **Triple Verification**: Validate all assumptions against the code.
