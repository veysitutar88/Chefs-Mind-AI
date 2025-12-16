# Cognition Layer Overview

This project uses a Git-native Cognition Layer stored inside the `.context/` folder.

Purpose:
To provide deterministic long-term memory for all AI agents and developers, using Git as the single source of truth.

Rules:

1. Before reasoning, always load `.context/` and align with heatmap & knowledge_map.
2. Each meaningful code change must be accompanied by an update in `.context/evolution/`.
3. Long-term architectural decisions belong in `.context/decisions/`.
4. `knowledge_map.json` must describe modules and their file relationships.
5. `heatmap.json` must track which files changed since the last known analysis commit hash, so agents can mark their knowledge as stale.
6. No commit should bypass the Cognition Layer.

Folder Structure:
.context/
  evolution/        — commit-level context updates  
  decisions/        — architectural decisions  
  templates/        — templates for context files  
  knowledge_map.json  
  heatmap.json  
  agent_state.json  
  README_CONTEXT.md
