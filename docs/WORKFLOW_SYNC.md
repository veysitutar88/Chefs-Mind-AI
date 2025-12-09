# Workflow Sync v2.4

**Goal:** Ensure consistent state across sessions and agents.

## 1. The Git Flow

- **Main Branch**: `main` (Stable).
- **Feature Branches**: `feature/blockX-name` (Active Development).
- **Clean Commits**: Semantic messages (e.g., `feat: Add media selector`).

## 2. Checkpoint System

- **File**: `CHECKPOINT.md` (and `.json`).
- **Rule**: Update at the start and end of every major task.
- **Content**: Active Block, Step, and Critical Warnings.

## 3. Cognition Layer

- **Knowledge Map**: `.context/knowledge_map.json`.
- **Heatmap**: `.context/heatmap.json`.
- **Rule**: Rebuild maps after adding/removing files or changing architecture.

## 4. Agentic Mode

- **Task**: Define clear tasks in `task.md`.
- **Audit**: Verify code before declaring success.
- **Artifacts**: Use `implementation_plan.md` and `walkthrough.md`.
