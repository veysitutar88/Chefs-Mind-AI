# Project Prompt for Chef's Mind AI

## Core Identity
You are working on Chef's Mind AI, an AI-powered restaurant management platform that combines multi-agent orchestration (Chef, Accountant, Researcher, Media Studio, QA-Gate) with culinary operations, financial tracking, and media generation.

## Architecture Overview
- **Frontend**: Next.js 15 application in `frontend-enhanced/` directory
- **Backend**: Node.js/Express server in `server/` directory  
- **Database**: PostgreSQL with Drizzle ORM
- **Agents**: 5 specialized AI agents with intent routing
- **UI Framework**: Tailwind CSS with shadcn/ui components

## Key Directories
- `server/` - Backend API routes, agents, services
- `frontend-enhanced/` - Modern Next.js frontend with 3-column layout
- `shared/` - Shared types and schemas
- `docs/` - Documentation and design specs
- `.kilocode/rules/` - Project context and checkpoints

## Behavior Rules (v2.3)

1. Antigravity Limit Handling:
   Automatically fallback to KiloCode when Antigravity is limited.

2. Heavy Task Fragmentation:
   Never run huge patches — always break large tasks into atomic units.

3. Mandatory Post-Task Sync:
   - Update CHECKPOINT.json
   - Update SESSION.md
   - Update memory-bank files
   - Git add → commit → push
   - Validate build and backend types

4. Context Obedience:
   Always load and respect CHECKPOINT.md, docs/nd/*, and docs/UI_SPEC_v2.2.md.

## Development Guidelines
- Follow the hybrid vertical/horizontal development strategy
- Maintain backward compatibility when possible
- Write tests for new functionality
- Update documentation when making significant changes
- Use the QA-Gate for output validation

## Current Status
- Multi-agent routing is implemented and functional
- Media Studio has basic generation capabilities
- Database persistence for chat history, orders, and suppliers
- Google OAuth integration with refresh token support

## SAFE_UI_RULES_v2.4 — UI and Context Safety (Project Level)

### Canonical UI (production UI only):
- frontend-enhanced/src/app/page.tsx
- frontend-enhanced/src/components/ui/*
- docs/UI_SPEC_v2.2.md
- docs/Chef’s Mind AI — Unified Master Context (D-FILE v2.1.6 → v2.2 Integration).txt
- docs/Unified Master Context (JSON Edition)FullD-File.json

### Legacy / ARCHIVE — DO NOT TOUCH:
- GooAiSt/*
- any folder named "legacy", "old-ui", "archive", "tmp-ui"
- any old context files in project root or docs unless explicitly listed as canonical above

### Global Constraints for KiloCode (MANDATORY):
- Do NOT open, modify, or create files under GooAiSt/* unless the task explicitly provides the full path.
- Do NOT attempt project-wide “cleanup”, “normalize”, or “refactor” of UI.
- Every UI-related task MUST specify exact files with full paths (e.g. frontend-enhanced/src/components/ui/RightSidebar.tsx).
- If different versions of the same component exist (e.g. GooAiSt and frontend-enhanced), ALWAYS use the version in frontend-enhanced.
- Reject tasks or suggestions based on outdated UI layouts, legacy code, or old templates.

### Priority Rules:
- frontend-enhanced always overrides GooAiSt or any other UI skeletons.
- UI changes must strictly follow:
  - docs/UI_SPEC_v2.2.md
  - Unified Master Context (D-FILE + JSON D-FILE)

## KILO_BEHAVIOR_RULES_v2.4 — Project-Specific Behavior for KiloCode

### 1. Scope & Index Use
1.1. KiloCode must use its code index, but only within the canonical project scope:
     - src/ and server/ folders of the active project
     - frontend-enhanced/*
     - docs/* (only for reading, not editing)
1.2. KiloCode should treat the following as ARCHIVE or NO-GO zones (read-only or ignored):
     - GooAiSt/*
     - any folder named: legacy, old-ui, archive, tmp-ui, backup
     - node_modules, .next, dist, build, coverage, .git

### 2. Single-File Focus
2.1. Every task should focus on ONE file or ONE small component at a time.
2.2. If the user does not specify a file, KiloCode must:
     - propose a concrete file path first,
     - wait for confirmation OR infer the most likely file and state it clearly.

### 3. No Project-Wide Refactors by Default
3.1. KiloCode must not attempt:
     - full-project refactors,
     - “cleanup all UI”,
     - “normalize everything”,
     unless the user explicitly confirms this and lists specific targets.
3.2. Large transformations (many files) must be split into small, explicit tasks.

### 4. Answer Style & Token Use
4.1. Default response style: short, focused, implementation-oriented.
     - 3–7 lines of explanation max, unless the user asks for more.
4.2. Planning is allowed, but:
     - keep plans compact (bullet list, 3–5 steps),
     - avoid long theoretical essays.
4.3. If the user asks for a “small change” or “micro fix”, 
     KiloCode must avoid generating multi-page output or huge diffs.

### 5. Workflow Preference
5.1. Preferred workflow for code changes:
     - Step 1: Identify the file(s) and show a short summary of current content.
     - Step 2: Propose a minimal patch.
     - Step 3: Apply patch.
     - Step 4: Run minimal checks (build/test) only if asked.
5.2. KiloCode must NOT invent new folders or architectures; it must follow:
     - PROJECT_SOURCE_MAP
     - UI_SPEC_v2.2
     - CHECKPOINT.md

### 6. Safety on Over-Expansion
6.1. If KiloCode detects that a task would require:
     - editing many files,
     - or rewriting entire modules,
     it must STOP and respond:
     “This task is too broad. Please provide a smaller, file-specific instruction.”
6.2. If internal reasoning starts to grow too long, KiloCode must deliberately shorten it
     and move to implementation.
