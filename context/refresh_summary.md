# Context Refresh Summary

## 1. Current Canonical Context (v2.2)

- **Version:** v2.1.6-unified-JSON / v2.2 Integration
- **Mission:** AI platform for restaurant management (Chef, Finance, Research, Media).
- **Core Agents:**
  - `SousChef AI` (Cooking, Recipes)
  - `GastroCount AI` (Finance, Costs)
  - `GastroMind AI` (Research, Trends)
  - `FoodFrame AI` (Media, Visuals)
- **Orchestrator:** Central routing logic (`server/agents/orchestrator.ts`).

## 2. Project Structure

- **Backend:** `server/` (Express + TypeScript).
- **Frontend:** `frontend-enhanced/` (Next.js + Tailwind).
- **Prototype:** `GooAiSt/` (React + Vite) - *Source for UI Refresh*.
- **Documentation:** `docs/` (Unified Master Context, Routing Design).

## 3. UI Status & Integration Plan

- **Current UI:** Placeholder in `frontend-enhanced`.
- **Target UI:** `GooAiSt` prototype (3-column layout).
- **Integration Strategy:**
  - Port `GooAiSt/components/*` to `frontend-enhanced/src/components/`.
  - Adapt `GooAiSt/App.tsx` logic to Next.js App Router (`page.tsx`, `layout.tsx`).
  - Replace `mockApi.ts` with real calls to `/api/enhanced-agent/chat`.

## 4. Key Files for Integration

- **Source (GooAiSt):**
  - `components/AgentCard.tsx`
  - `components/ChatArea.tsx`
  - `components/RightSidebar.tsx`
  - `components/Logo.tsx`
  - `types.ts`
- **Destination (frontend-enhanced):**
  - `src/components/`
  - `src/app/page.tsx`
  - `src/types/`

## 5. Next Steps

- Execute integration commands to migrate UI components.
- Connect frontend to backend API.
- Verify agent routing and media generation flows.
