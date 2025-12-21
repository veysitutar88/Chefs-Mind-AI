# Project Cognition Layer Guide

_Comprehensive Git-Native Cognitive Layer for Kilo Code Agent, Google Antigravity, and Multi‑LLM Development_

---

## 0. Purpose of This Document
This guide describes **how to build a complete, Git‑native cognition layer** for your project — a durable memory architecture that all AI agents (Kilo Code, Antigravity agents, external LLMs) can use consistently.

The guide is fully self-contained and ready to be placed into the root of your GitHub repository as:

```
COGNITION_LAYER_GUIDE.md
```

It includes:
- architecture of the cognition layer
- full `.context/` directory structure
- rules for enriched commits
- heatmap of unknown areas
- integration with Kilo Code Agent
- integration with Google Antigravity (VS Code fork)
- recommended workflows
- templates & examples

This is the **canonical version**.

---

# 1. Introduction
Modern AI-assisted development suffers from a fundamental limitation: **AI agents forget project context**, and vector databases cannot provide strict consistency.

A solution: **Git as the primary long-term project memory**, with a dedicated cognition layer stored in a structured `.context/` directory.

This guide explains how to implement this architecture.

---

# 2. Core Principles of the Cognition Layer

### ✔ 2.1 Git is the Source of Truth
Git stores:
- code
- history
- diffs
- exact state of the project at every moment

AI stores assumptions.
Vector DB stores approximations.

Git stores ground truth.

### ✔ 2.2 All Meaning Must Be Bound to Code
Every architectural decision and rationale must be attached to a real commit.

### ✔ 2.3 Vector DB Enhances, but Never Replaces Git Memory
Vector search helps discover files.
Git memory asserts correctness.

### ✔ 2.4 The Cognition Layer Is a Folder Inside the Repo
Everything lives inside:

```
.context/
```

Agents scan it automatically.
Developers read it manually.

---

# 3. Structure of `.context/`

Place this folder in the **root of the repository**.

```
.context/
  evolution/
  decisions/
  knowledge_map.json
  heatmap.json
  agent_state.json
  README_CONTEXT.md
```

Below: definitions and templates.

---

# 4. `.context/evolution/` — Evolution Log
Logs of meaningful changes. One file per significant commit.

### Template:
````markdown
# <Change Title> — <YYYY-MM-DD>

## Business Context
<Why change exists>

## Decision
<What was changed>

## Modified Files
- path/file1
- path/file2

## Reasoning
<Why this was the best option>

## Risks / TODO
- pending tasks
````

---

# 5. `.context/decisions/` — Project-Level Decisions
Contains long-term architectural decisions.

### Template:
````markdown
# <Decision Title>
Date: YYYY-MM-DD

## Problem

## Solution

## Affected Modules

## Arguments

## Open Questions
````

---

# 6. `knowledge_map.json` — Knowledge Graph
Tracks modules, their files, dependencies.

### Example:
```json
{
  "version": "1.0",
  "nodes": {
    "AuthSystem": {
      "files": [
        "src/auth/useUserAuth.ts",
        "src/auth/tokenService.ts"
      ],
      "tags": ["auth", "tokens", "security"]
    }
  },
  "edges": [
    { "from": "AuthSystem", "to": "MenuEngine", "type": "api_call" }
  ]
}
```

---

# 7. `heatmap.json` — Heatmap of Unknown Areas
Tracks what the agent knows or hasn’t scanned.

### Example:
```json
{
  "last_scan_hash": "a1b2c3d4",
  "files": {
    "src/menu/MenuEditor.tsx": {
      "last_known_hash": "x9y8z7",
      "confidence": 0.0,
      "reason": "file_changed_since_last_scan"
    }
  }
}
```

---

# 8. `agent_state.json`
Tracks last scans done by each agent (Kilo, Antigravity, etc.).

### Example:
```json
{
  "agents": {
    "kilo-main": {
      "last_scan_hash": "abcd1234",
      "last_full_scan": "2025-11-27T10:12:00Z"
    }
  }
}
```

---

# 9. `README_CONTEXT.md`
A simple description of the cognition layer for any new agent or developer.

### Recommended Content:
````markdown
# Cognition Layer Overview

This project uses a Git-native cognition layer stored in `.context/`.

All agents must:
1. Read `.context/` before answering.
2. Respect `heatmap.json` confidence levels.
3. Update evolution logs when modifying code.
````

---

# 10. Enriched Commits
Before each commit, the agent must:

1. Analyze the diff.
2. Update `.context/evolution/`.
3. Update `knowledge_map.json`.
4. Update `heatmap.json`.

Commit both code + context.

### Example Commit Message:
```
feat(auth): refactor token service + update cognition layer
```

---

# 11. Workflow with Kilo Code Agent

### Step 1 — Start a Task
Examples:
- "Проанализируй diff и обнови когнитивный слой"
- "Создай файл эволюции для текущих изменений"

### Step 2 — Kilo scans Git + `.context/`
Kilo reads:
- evolution logs
- decisions
- heatmap
- knowledge map

### Step 3 — Kilo generates enriched context files
You verify → then commit.

### Step 4 — Git push
Your GitHub repo becomes the complete memory store.

---

# 12. Workflow in Google Antigravity
Antigravity supports multi-agent parallel workflows.

Recommended setup:

### Agent 1 (Architect)
- reads `.context/` fully
- produces plans & diagrams

### Agent 2 (Kilo Code)
- modifies code
- updates evolution logs

### Agent 3 (QA)
- validates decisions & suggests improvements

All agents use `.context/` as the shared memory substrate.

---

# 13. Templates
Included in this guide:
- evolution template
- decision template
- heatmap schema
- knowledge map schema

These can be copied into `.context/templates/` if desired.

---

# 14. Best Practices
- Never commit code without updating `.context/`.
- Heatmap must always reflect fresh knowledge.
- Agents must refuse reasoning about unknown areas.
- Decisions must be stable, not hypothetical.
- `.context/` must be committed — never ignored.

---

# 15. Final Notes
This document is the **single canonical reference** for implementing a Git-native cognition layer in your project.

All agents must follow this specification.

---

_End of Document_

