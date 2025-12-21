# Workflow: Architect → Implementer

> **Version:** 1.0  
> **Date:** 2025-12-05  
> **Roles:** Architect (Opus 4.5 Thinking), Implementer (Gemini 3 Pro)

---

## QA Clarification

> [!IMPORTANT]
> **QA is NOT a development agent.**  
> QA exists only as an internal system layer (QA-Gate middleware) inside Chef's Mind AI runtime.  
> It validates product agent responses, not code generation.  
> See: [QA_CLEANUP_NOTE.md](../docs/QA_CLEANUP_NOTE.md)

---

## Roles

| Role | Model | Responsibility |
|------|-------|----------------|
| **Architect** | Claude Opus 4.5 (Thinking) | Context, planning, task definition |
| **Implementer** | Gemini 3 Pro (High/Low) | Diff generation, verification steps |

---

## Workflow Steps

### Phase 1: Architect (Planning)

#### Step 1.1 — Load Context

```text
1. Load CHECKPOINT.md
2. Load SESSION.md
3. Load .context/knowledge_map.json
4. Load .context/agent_state.json
5. Load relevant .context/evolution/* logs
6. Identify current Block/Step
```

#### Step 1.2 — Analyze Requirements

```text
1. Parse user request
2. Map to affected files via knowledge_map
3. Check heatmap.json for stale confidence
4. Identify dependencies and risks
```

#### Step 1.3 — Write Implementation Plan

```text
1. Create/update implementation_plan.md with:
   - Goal description
   - Proposed changes (per component/file)
   - Verification plan
2. Review with user if needed
3. On approval, proceed to Implementer phase
```

#### Step 1.4 — Define Tasks for Implementer

```text
1. Break plan into atomic file-level tasks
2. For each task, specify:
   - Target file (absolute path)
   - Change description
   - Expected behavior
   - Verification method
```

---

### Phase 2: Implementer (Execution)

#### Step 2.1 — Generate Diffs

```text
For each task from Architect:
1. Read current file content
2. Generate unified diff (git-style)
3. DO NOT apply changes
4. Output diff in markdown code block with `diff` language
```

#### Step 2.2 — Describe Verification

```text
For each diff, document:
1. Build check: `npm run build`
2. Type check: `npx tsc --noEmit`
3. Expected UI behavior (if frontend)
4. Expected API behavior (if backend)
```

#### Step 2.3 — Report to Architect

```text
1. Summarize all diffs generated
2. List any blockers or ambiguities
3. Await Architect approval before applying
```

---

### Phase 3: Application (Manual)

```text
1. User reviews diffs
2. User or Implementer applies approved diffs
3. Run verification commands
4. Update CHECKPOINT.md
5. Update SESSION.md
6. Commit with cognition layer sync
```

---

## Prohibited

- ❌ QA Agent in workflow
- ❌ KiloCode in workflow
- ❌ Auto-apply without approval
- ❌ Skipping cognition layer updates

---

## Example Handoff

**Architect Output:**

```markdown
## Task for Implementer

**File:** `frontend-enhanced/src/hooks/useMediaGenerator.ts`  
**Action:** Add retry logic with exponential backoff  
**Details:** MAX_RETRIES=3, base delay 1000ms  
**Verify:** Build passes, no TS errors
```

**Implementer Output:**

```diff
+ const MAX_RETRIES = 3;
+ const backoff = (n: number) => 1000 * Math.pow(2, n);
```

---

## Notes

- Architect owns **what** and **why**
- Implementer owns **how** (code)
- User owns **approval**
