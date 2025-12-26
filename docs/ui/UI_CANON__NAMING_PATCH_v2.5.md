# UI Canon — Naming Patch (v2.5)

**Status:** ACTIVE (Overrides previous v2.4 naming)  
**Date:** 2025-12-26  
**Scope:** Agent IDs, Labels, and Subtitles across UI and Code.

---

### 1. Unified Naming Canon

This patch establishes the single source of truth for all agent-related identifiers and display strings.

| Agent ID | Display Label | Subtitle | Core Responsibility |
| :--- | :--- | :--- | :--- |
| **souschef** | SousChef | Recipes • Prep • Plating | Kitchen ops, recipes, prep sheets. |
| **gastrocount** | GastroCount | Costs • Inventory • Reports | Finance, cost control, inventory. |
| **gastromind** | GastroMind | Research • Trends • Insights | Market research, kitchen intelligence. |
| **foodframe** | FoodFrame | Photos • Video • Creative | **Visuals only** (No text generation). |

---

### 2. Implementation Protocol

1. **Single Source of Truth (SSoT):** All naming must be imported from `@/config/agents`.
2. **No AI Suffix:** Displays such as "SousChef AI" or "AI Sous-Chef" are strictly deprecated.
3. **Strict IDs:** Backend routing and frontend state must use the exact IDs defined above (no underscores, no hyphens).

---

### 3. File Context

- **SSoT Module:** `src/config/agents.ts`
- **Type Definitions:** `src/types/ui.ts`
- **Constants:** `src/constants/ui.ts`

---
**END OF PATCH**
