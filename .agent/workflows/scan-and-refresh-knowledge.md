---
description: Workflow: scan-and-refresh-knowledge
---
# Workflow: scan-and-refresh-knowledge

# Purpose: rescan the codebase and refresh `.context/knowledge_map.json` and `.context/heatmap.json`

You are the Knowledge Refresh Agent for the "Chef's Mind AI / June Six" project.

When this workflow is triggered, follow these steps EXACTLY and DO NOT skip user confirmations.

1. DETECT CURRENT GIT STATE
   - Read the current HEAD commit hash: call it `current_hash`.
   - If the repository is not clean (there are unstaged or uncommitted changes), warn the user:
     "Scan will use the current working tree, not a clean commit. Continue? (yes/no)"
   - If the user answers "no", stop.

2. SCAN PROJECT STRUCTURE
   - Walk the project tree and build a list of relevant source files:
     - include: `client/`, `server/`, `src/` and other code folders used in this project;
     - exclude: `node_modules`, `.git`, `.next`, `.husky`, `.kilocode`, `.context`, build/output folders, large binary assets.
   - Group files into logical modules using folder structure and naming (for example: `AuthSystem`, `MenuEngine`, `Pricing`, `Media`, `Infra`).
   - For each module, collect:
     - list of file paths,
     - minimal tags (e.g. ["auth","tokens"], ["menu","pricing"], ["infra","logging"]).

3. UPDATE knowledge_map.json
   - Read `.context/templates/knowledge_map_template.json` to understand the schema.
   - Load existing `.context/knowledge_map.json` if it exists.
   - Produce a new JSON object with:
     - `"version": "1.0"`,
     - `"nodes"`: one entry per logical module with `files` and `tags`,
     - `"edges"`: inferred relationships (imports, API calls, shared types) between modules.
   - Try to preserve existing module names when possible, so diffs stay readable.
   - Overwrite `.context/knowledge_map.json` with the new JSON, formatted with 2-space indentation.
   - Show a short summary of modules and edges to the user for confirmation.

4. UPDATE heatmap.json
   - Read `.context/templates/heatmap_template.json` to understand the schema.
   - Load existing `.context/heatmap.json` if it exists; otherwise start from an empty structure.
   - Set `last_scan_hash` to `current_hash`.
   - For each scanned file:
     - compute its current Git blob hash (or a deterministic fingerprint),
     - if this file was present previously with the same hash:
         - keep its `confidence` as is, unless the user asks to reset,
     - if the file is new or the hash changed since the last scan:
         - set `confidence` to `0.0`,
         - set `reason` to `"file_changed_since_last_scan"`,
         - set `last_known_hash` to the new hash.
   - Remove entries for files that no longer exist.
   - Overwrite `.context/heatmap.json` with the updated JSON.
   - Explain to the user how many files were marked as changed / unchanged.

5. OPTIONAL EVOLUTION LOG ENTRY
   - Ask the user:
     "Do you want to add an evolution entry describing this knowledge refresh? (yes/no)"
   - If "yes":
     - Use `.context/templates/evolution_template.md`.
     - Create a new file in `.context/evolution/`:
       `.context/evolution/YYYY-MM-DD_<current_hash>_knowledge-refresh.md`
     - Fill fields:
       - Business Context: periodic knowledge refresh / index update.
       - Decision: rescan project and update knowledge_map + heatmap.
       - Modified Files: list `.context/knowledge_map.json`, `.context/heatmap.json` and the new evolution file.
       - Reasoning: why this refresh was needed (e.g. many structural changes).
       - Risks / TODO: note that agents should now trust this scan hash.
     - Show the content to the user for review.

6. FINAL REPORT
   - Output a clear final report:
     - current HEAD hash,
     - path of updated `.context/knowledge_map.json`,
     - path of updated `.context/heatmap.json`,
     - number of modules and edges in the knowledge map,
     - number of files marked as changed vs unchanged in the heatmap,
     - path of the evolution file (if created).
   - Remind:
     "Agents should now treat `last_scan_hash` as the latest trusted analysis point."
