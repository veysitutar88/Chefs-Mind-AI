# Chef’s Mind AI — Project Checkpoint (v2.5)

**Date:** 2025-12-26  
**Status:** Operational (v2.5 Prep Complete)

---

### 1. PROJECT META

- **Project Name:** Chef’s Mind AI
- **UI Version:** 2.5 (Enhanced Console)
- **Ops Version:** 2.5 (PCL/ND Pack active)
- **Agent Version:** 2.5 (Unified Canon)
- **Runtime Status:**
  - **Port:** 3010 (Stable)
  - **Server:** Next.js 16 (Turbopack)
  - **Stability:** UI Boot restored and verified.

---

### 2. AGENT CANON (LOCKED)

| ID | Label | Subtitle | Scope |
| :--- | :--- | :--- | :--- |
| **souschef** | SousChef | Recipes • Prep • Plating | Text, Recipes, Ops |
| **gastrocount** | GastroCount | Costs • Inventory • Reports | Finance, Data |
| **gastromind** | GastroMind | Research • Trends • Insights | Search, Research |
| **foodframe** | FoodFrame | Photos • Video • Creative | **Visuals only** (No text gen) |

*Note: Legacy AI suffixes ("AI Sous-Chef", etc.) are deprecated and removed from UI.*

---

### 3. UI STATE

- **Left Sidebar:** Unified. Single source of truth (src/config/agents.ts). Uses card-based premium UI.

- **Settings Page:** Accessible at `/settings`. Panelled layout (General, AI, Account).
- **Model Selector:** UI present in headers and media modules but not functionally wired to backend.
- **Right Sidebar:** Partially operational widget-based tool panel (data sources not yet aligned).
- **Known UX Issues:**
  - Multiple stubs in Tool Sidebar show "Not connected" (intentional neutral state).

---

### 4. ORCHESTRATION / MODELS

- **Routing:** Core strategy is Auto-Routing by the orchestrator.

- **Manual Override:** UI controls (ModelSwitcher) are visible but not currently sending selection state to backend orchestrator.
- **FoodFrame Constraints:** Strictly limited to photo/video generation; no conversational output.

---

### 5. ANTIGRAVITY ROLE

- **Definition:** Antigravity is a runtime execution tool.

- **Boundaries:**
  - Does NOT hold project memory.
  - Does NOT define project canon.
  - Executes strictly according to human-provided instructions and validated Blueprints.

---

### 6. FIXED TODAY

- **Agent Unification:** Renamed all routes and UI strings to match Unified Canon IDs and Labels.

- **ID/Label Separation:** Internal IDs (e.g., `souschef`) are distinct from UI Labels (`SousChef`).
- UI Stability: Restored dev server boot on port 3010; fixed broken npm scripts via direct npx execution.
- **Settings UI Layout:** Resolved overlap issue by making sidebars responsive (LeftSidebar hidden < lg, RightSidebar hidden < xl) and stabilizing flexbox properties (min-w-0, flex-shrink-0, overflow-x-hidden).

---

### 7. OPEN ISSUES

- **6 Dev Overlay Issues (Deferred):**
  1. Hydration Error (root/layout) - mismatched server/client state.
  2. ModelSwitcher.tsx:31:35 - Failed to fetch (Backend not connected).
  3. useSidebarData.ts:112:36 - Failed to fetch (Backend not connected).
  4. useSidebarData.ts:140:36 - Failed to fetch (Backend not connected).
  5. useSidebarData.ts:172:36 - Failed to fetch (Backend not connected).
  6. useSidebarData.ts:203:36 - Failed to fetch (Backend not connected).

- **i18n Wiring:** Language switchers (EN/RU) in UI are present but not connected to a translation system.
- **Model Wiring:** Integration of UI model selection with the backend execution service.
- **Visual Inconsistencies:** Minor token drift to be addressed in the final UI-Finish pass.

---

### 8. NEXT STEP: UI-FINISH

- **Model Strategy:** Implement selection state propagation (Auto vs. Manual).
- **i18n Implementation:** Wire the translation layer for EN/RU parity.

---
**END OF CHECKPOINT**
