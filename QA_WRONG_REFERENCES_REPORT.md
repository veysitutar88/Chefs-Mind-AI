# QA Wrong References Report

> **Generated:** 2025-12-05
> **Scope:** Identification of "QA" used as a development agent/role (prohibited) vs. system middleware (allowed).

## Findings

The following references define or imply a "QA Agent" role in the development workflow, which contradicts the current architectural rule that QA is purely internal runtime middleware.

| File | Line / Fragment | Issue | Remediation |
|------|----------------|-------|-------------|
| `docs/archive/legacy_arch/NewChatKontext/advanced-multiagent-guide.md` | L749: `You are a QA engineer and test architect.` | Defines a system prompt for a QA Agent. | **Delete** or mark as LEGACY/DEPRECATED. Ensure this file is excluded from active context context. |
| `reports/artifacts/2025-11-10/0033/PDRL_PLAN_DOCS_ENV_UPDATES.md` | L180: `\| Validate \| 5-10 мин \| QA \|` | Assigns a manual/agent task to "QA" in a plan. | **Ignore** (Historical report). Note: Do not use as template. |
| `antigravity/chefs-mind-ai-context-workflow.json` | L32: `{ "id": "qa_gate", "role": "hallucination protection" }` | Lists `qa_gate` in the peer `agents` array. | **Clarify**: Move to a separate `middleware` section or add comment that it's not a peer agent. |
| `docs/archive/legacy_arch/CTX_CHEFS_MIND_AI_ULTIMATE_v2.1.2.md` | L12: `QA Everywhere` | Implies a pervasive QA role beyond middleware. | **Update** to "Safety Layer Everywhere" or clarify context. |
| `docs/archive/legacy_arch/rules/memory-bank/architecture.md` | L34: `- QA gate — [server/middleware/qaGate.ts]` | This is actually **Correct** (refers to middleware), but listed under architecture components mixed with agents. | **Verify**: Ensure it's grouped under "Middleware" or "Safety", not "Agents". |

## Clean/Allowed References (False Positives)

These references are **Correct** and refer to the internal Runtime Middleware:

- `server/middleware/qaGate.ts` (The implementation itself)
- `server/routes/agent-chat.ts` (Importing the middleware)
- `server/agents/orchestrator.ts` (Routing logic referencing QA score)
- `tests/routes/enhanced-agent-chat.test.ts` (Mocking the middleware)

## Recommendation

1. **Strict Context**: Ensure `docs/archive/` is strictly excluded from active AI context loading to prevent "QA Agent" hallucinations.
2. **Context JSON**: Update `chefs-mind-ai-context-workflow.json` to explicitly label `qa_gate` as `type: "middleware"` to avoid ambiguity.
