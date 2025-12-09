# Agent Routing Design v2.4

**Scope:** `server/` (Node/Express)

## 1. Architecture Overview

The backend uses a **Multi-Agent Orchestrator** pattern.

- **Frontend**: Sends a generic message to `/api/enhanced-agent/chat`.
- **Orchestrator**: Analyzes intent and routes to a specific Agent.
- **Agent**: Processes request (Logic/LLM) and returns response.

## 2. The Agents

1. **Chef (SousChef)**: Recipes, cooking queries.
2. **Accountant (GastroCount)**: Pricing, inventory.
3. **Researcher (GastroMind)**: Trends, deep search.
4. **Media (FoodFrame)**: Image/Video generation.
5. **Quality (TasteGuard)**: QA, safety checks.

## 3. Routing Logic (Current State)
>
> [!CAUTION]
> **Mock Implementation**: The current `orchestrator.ts` uses keyword matching and returns hardcoded strings. This must be replaced with real LLM intent classification.

## 4. API Contracts

### Request

```json
{
  "message": "User query...",
  "agentId": "sous_chef",
  "sessionId": "abc-123",
  "modelId": "gemini-pro"
}
```

### Response

```json
{
  "reply": "Agent response...",
  "agentId": "sous_chef",
  "toolCalls": []
}
```

## 5. Media Pipeline (FoodFrame)

- **Endpoint**: `/api/media/generate/image`.
- **Providers**: OpenAI (DALL-E), Google (Imagen/Veo).
- **Flow**: UI -> Server -> Routing -> Provider API -> S3/Local Storage -> URL.
