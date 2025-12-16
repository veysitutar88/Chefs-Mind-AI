# .context/templates/
Templates for Cognition Layer components.

---

## evolution_template.md
````markdown
# <Change Title> — <YYYY-MM-DD>

## Business Context
<Why this change was needed>

## Decision
<Specific solution applied>

## Modified Files
- path/to/file1
- path/to/file2

## Reasoning
<Why this approach was picked>

## Risks / TODO
- <pending tasks>
````

---

## decision_template.md
````markdown
# <Decision Title>
Date: YYYY-MM-DD

## Problem
<What triggered this decision>

## Solution
<Chosen long-term strategy>

## Affected Modules
- module/file paths

## Arguments
<Why this option is best>

## Open Questions
- <unresolved issues>
````

---

## knowledge_map_template.json
```json
{
  "version": "1.0",
  "nodes": {
    "ModuleName": {
      "files": ["path/to/file"],
      "tags": ["tag1", "tag2"]
    }
  },
  "edges": [
    { "from": "ModuleA", "to": "ModuleB", "type": "dependency" }
  ]
}
```

---

## heatmap_template.json
```json
{
  "last_scan_hash": "<git-hash>",
  "files": {
    "path/to/file": {
      "last_known_hash": "<hash>",
      "confidence": 1.0,
      "reason": "initial_scan"
    }
  }
}
```

---

## agent_state_template.json
```json
{
  "agents": {
    "agent-name": {
      "last_scan_hash": "<hash>",
      "last_full_scan": "<ISO-datetime>"
    }
  }
}
```

---

# README_CONTEXT.md (GitHub version)
````markdown
# Cognition Layer Overview

This repository uses a **Git-native cognition layer** stored inside `.context/`.

## Purpose
To provide deterministic long-term memory for all agents and developers through Git.

## Rules
1. All agents must scan `.context/` before reasoning.
2. Each commit that changes logic must update `.context/evolution/`.
3. Architectural decisions belong in `.context/decisions/`.
4. `knowledge_map.json` must reflect module structure.
5. `heatmap.json` must reflect which files were updated since last scan.
6. No commit should bypass the cognition layer.

## Folder Structure
```
.context/
  evolution/        # Short-term change logs linked to commits
  decisions/        # Long-term architectural decisions
  knowledge_map.json
  heatmap.json
  agent_state.json
  README_CONTEXT.md
```
````

---

# LICENSE (recommended MIT)
```
MIT License

Copyright (c) <year> <Your Name>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
