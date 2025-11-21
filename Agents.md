# Chef's Mind AI - Agents

> **Canonical Source:** `MASTER_CONTEXT_v2.1.6.mdown` (Section 3)

## Orchestrator
- **Role:** Central router and intent classifier.
- **File:** `server/agents/orchestrator.ts`
- **Function:** Determines intent (cooking, finance, research, media, qa) and routes to the appropriate agent.

## Active Agents

### 1. Chef
- **Role:** Culinary Expert.
- **Tasks:** Recipes, menu planning, service preparation, portion calculations.

### 2. Accountant
- **Role:** Financial Analyst.
- **Tasks:** Orders, suppliers, cost analysis, procurement.

### 3. Researcher
- **Role:** Data Researcher.
- **Tasks:** Trend analysis, supplier search, equipment research, external data.

### 4. Media Studio
- **Role:** Content Creator.
- **Tasks:** Image/Video generation (Imagen, Veo, DALL·E), Prompt Enhancer, Asset management.

### 5. QA-Gate
- **Role:** Quality Assurance.
- **Tasks:** Hallucination protection, response validation, safety checks.
