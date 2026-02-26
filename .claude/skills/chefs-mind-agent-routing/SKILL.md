---
name: chefs-mind-agent-routing
description: Chef's Mind AI agent system — canonical agents, LangGraph graph structure, node patterns, routing config, and how to add or modify agents. Use when working on agent orchestration, adding new agents, modifying routing logic, or debugging agent execution flow.
---

# Chef's Mind AI — Agent Routing & LangGraph Patterns

Domain-specific reference for the multi-agent orchestration layer of Chef's Mind AI.

## Canonical Agents (v2.5 LOCKED)

| ID | UI Label | Subtitle | Domain | Constraint |
|---|---|---|---|---|
| `souschef` | SousChef | Recipes • Prep • Plating | Text, Recipes, Ops | — |
| `gastrocount` | GastroCount | Costs • Inventory • Reports | Finance, Data | — |
| `gastromind` | GastroMind | Research • Trends • Insights | Search, Research | — |
| `foodframe` | FoodFrame | Photos • Video • Creative | **Visuals only** | No text generation |

> **Rule:** Never generate text responses from `foodframe`. It outputs media assets only.
> Legacy AI suffixes ("AI Sous-Chef", etc.) are deprecated and must not be used.

**Frontend config:** `frontend-enhanced/src/config/agents.ts`
**Backend routing config:** `server/config/agent-routing.ts`

---

## LangGraph Graph Structure

```
User Request  →  server/agents/orchestrator.ts
                        ↓
              server/graph/graph.ts (StateGraph)
                        ↓
              [router_node]  ←  server/graph/nodes/router.ts
                        ↓
         ┌──────────────┼──────────────┬──────────────┐
         ↓              ↓              ↓              ↓
   [chef_node]  [accountant_node] [researcher_node] [media_node]
  nodes/chef.ts  nodes/accountant.ts nodes/researcher.ts nodes/media.ts
         └──────────────┼──────────────┴──────────────┘
                        ↓
              [quality_control_node]  ←  nodes/quality_control.ts
                        ↓
              [answer_node]           ←  nodes/answer.ts
```

**Key files:**

| File | Purpose |
|---|---|
| `server/graph/graph.ts` | StateGraph definition, edges, conditional routing |
| `server/graph/types.ts` | Shared state type for the graph |
| `server/agents/orchestrator.ts` | Entry point: invokes the graph |
| `server/graph/stream-utils.ts` | Streaming helpers for SSE/WebSocket |
| `server/graph/nodes/router.ts` | Intent classification → picks agent |
| `server/graph/nodes/chef.ts` | SousChef agent node |
| `server/graph/nodes/accountant.ts` | GastroCount agent node |
| `server/graph/nodes/researcher.ts` | GastroMind agent node |
| `server/graph/nodes/media.ts` | FoodFrame agent node (images/video only) |
| `server/graph/nodes/quality_control.ts` | Validates agent output |
| `server/graph/nodes/answer.ts` | Formats final response |
| `server/config/llm-config.ts` | LLM model config per agent |
| `server/config/agent-routing.ts` | Routing rules / intent keywords |

---

## Graph State Type Pattern

```typescript
// server/graph/types.ts
export interface AgentState {
  messages: BaseMessage[];
  agentId: 'souschef' | 'gastrocount' | 'gastromind' | 'foodframe';
  userId?: string;
  sessionId?: string;
  context?: Record<string, unknown>;
  mediaAssets?: string[];   // FoodFrame output — URLs only
  error?: string;
}
```

---

## Adding a New Agent Node

### 1. Create the node file

```typescript
// server/graph/nodes/my_agent.ts
import { ChatOpenAI } from '@langchain/openai';
import type { AgentState } from '../types';

export async function myAgentNode(state: AgentState): Promise<Partial<AgentState>> {
  const llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.7 });

  const response = await llm.invoke(state.messages);

  return {
    messages: [...state.messages, response],
  };
}
```

### 2. Register in the graph

```typescript
// server/graph/graph.ts
import { myAgentNode } from './nodes/my_agent';

// Add node
graph.addNode('my_agent', myAgentNode);

// Wire conditional edge from router
graph.addConditionalEdges('router', routeToAgent, {
  souschef: 'chef',
  gastrocount: 'accountant',
  gastromind: 'researcher',
  foodframe: 'media',
  my_agent_id: 'my_agent',  // ← add this
});
```

### 3. Add routing rule

```typescript
// server/config/agent-routing.ts
export const ROUTING_RULES = {
  // ... existing rules
  my_agent_id: {
    keywords: ['my', 'domain', 'keywords'],
    description: 'Handles my domain requests',
  },
};
```

### 4. Register in frontend config

```typescript
// frontend-enhanced/src/config/agents.ts
export const AGENTS = [
  // ... existing agents
  {
    id: 'my_agent_id',
    label: 'MyAgent',
    subtitle: 'Domain • Keywords',
    scope: 'My domain',
  },
];
```

---

## LLM Config Pattern

```typescript
// server/config/llm-config.ts — per-agent model selection
export const LLM_CONFIG = {
  souschef: { model: 'gpt-4o', temperature: 0.7 },
  gastrocount: { model: 'gpt-4o', temperature: 0.2 },  // Low temp for accuracy
  gastromind: { model: 'gpt-4o', temperature: 0.5 },
  foodframe: { provider: 'vertex', model: 'imagen-3' }, // Media: Vertex AI
};
```

---

## Orchestrator Entry Pattern

```typescript
// server/agents/orchestrator.ts
export async function runAgent(input: {
  message: string;
  userId: string;
  sessionId: string;
}): Promise<AgentState> {
  const graph = buildGraph();  // from server/graph/graph.ts

  const initialState: AgentState = {
    messages: [new HumanMessage(input.message)],
    agentId: 'souschef', // router will override
    userId: input.userId,
    sessionId: input.sessionId,
  };

  return graph.invoke(initialState);
}
```

---

## Streaming Pattern (SSE)

```typescript
// server/graph/stream-utils.ts
export async function streamAgent(
  input: AgentInput,
  res: Response
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  const graph = buildGraph();

  for await (const chunk of graph.stream(initialState)) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  res.end();
}
```

---

## FoodFrame Constraints

FoodFrame is **media-only**. Enforce at multiple layers:

1. **Router node:** Route to media node only for visual/image/video requests
2. **Media node:** Return `mediaAssets: [url]`, never add text to `messages`
3. **Quality control node:** Reject media responses that contain text generation
4. **Frontend:** FoodFrame UI renders asset previews, not chat bubbles

---

## Key Rules

- **Never add text generation to FoodFrame** — it violates the agent canon
- **Routing is keyword-based** — update `server/config/agent-routing.ts` for new intent patterns
- **State is immutable** — always return `Partial<AgentState>`, never mutate
- **Quality control runs on every agent output** — validate before the answer node
- **Graph checkpointing is enabled** — long-running tasks persist across reconnects
