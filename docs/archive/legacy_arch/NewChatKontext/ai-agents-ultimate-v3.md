# ПОЛНОЕ РУКОВОДСТВО: Vibe Coding & AI Agent Development 3.0 (ULTIMATE EDITION)
## Full-Stack Architecture + Практические примеры для Production-ready AI приложений

**Версия:** 3.0 (Ultimate)  
**Дата:** 2025-11-11 CET  
**Для:** KiloCode, LangGraph, CrewAI, Node.js, TypeScript, React, Docker, PostgreSQL  

---

## СОДЕРЖАНИЕ

1. [PART 0: Философия и архитектура](#part-0-философия-и-архитектура)
2. [PART 1: Full-Stack Setup и структура](#part-1-full-stack-setup-и-структура)
3. [PART 2: Backend Architecture (Node.js + LangGraph)](#part-2-backend-architecture)
4. [PART 3: Frontend + UI/UX для AI agents](#part-3-frontend--uiux)
5. [PART 4: Database & Storage (PostgreSQL + Redis)](#part-4-database--storage)
6. [PART 5: Integration & API Design](#part-5-integration--api-design)
7. [PART 6: Deployment & Infrastructure (Docker + Kubernetes)](#part-6-deployment--infrastructure)
8. [PART 7: Monitoring, Observability & Debugging](#part-7-monitoring-observability)
9. [PART 8: Production Ready Checklist](#part-8-production-ready-checklist)
10. [APPENDIX: Copy-Paste Ready Examples](#appendix-copy-paste-ready-examples)

---

## PART 0: Философия и архитектура

### 0.1 Парадигма: Vibe Coding vs Traditional Development

```
TRADITIONAL (Bad for AI):
├─ Монолит
├─ Tight coupling
├─ Hard to test AI output
└─ Context loss between sprints

VIBE CODING + AI AGENTS (Good):
├─ Microservices + AI Core
├─ Loose coupling + Clear contracts
├─ Every piece testable
├─ Persistent context (Memory Bank)
└─ Agent can iterate autonomously
```

**Ты — архитектор и PM:**
- Ты пишешь requirements и constraints
- Ты review'ишь код и тесты
- Ты manage контекст и memory

**AI Agent — разработчик:**
- Генерирует код по твоим требованиям
- Пишет тесты и документацию
- Может работать параллельно на разных модулях
- Помнит контекст через Memory Bank

### 0.2 The Three-Tier Architecture

```
┌──────────────────────────────────────────────────────┐
│              PRESENTATION LAYER                      │
│  Next.js Frontend + React Components + WebSockets    │
│  (Real-time UI, streaming responses, agent status)   │
└─────────────────────────┬──────────────────────────┘
                          │ HTTPS/WebSocket
┌─────────────────────────▼──────────────────────────┐
│            APPLICATION/ORCHESTRATION LAYER         │
│  Node.js + Express + LangGraph + MCP               │
│  (Agent Logic, Tool Calling, State Management)      │
│  - LangGraph for workflow orchestration            │
│  - MCP Server for external tool integration         │
│  - OAuth2 + JWT for authentication                  │
└─────────────────────────┬──────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────┐
│              DATA/PERSISTENCE LAYER                │
│  PostgreSQL + Redis + External APIs               │
│  - Postgres: chat history, user data, vectors     │
│  - Redis: caching, rate limiting, sessions        │
│  - LLM APIs: GPT-4o, Claude, Gemini              │
└──────────────────────────────────────────────────┘
```

---

## PART 1: Full-Stack Setup и структура

### 1.1 Project Structure (Production-Ready)

```
ai-agent-platform/
│
├── .github/
│   ├── workflows/
│   │   ├── test.yml              # Unit + E2E testing
│   │   ├── build.yml             # Docker build & push
│   │   └── deploy.yml            # Auto-deploy on main
│   ├── CODEOWNERS
│   └── pull_request_template.md
│
├── .kilocode/
│   ├── rules/
│   │   ├── memory-bank/
│   │   │   ├── brief.md
│   │   │   ├── product.md
│   │   │   ├── context.md
│   │   │   ├── architecture.md
│   │   │   └── tag.md
│   │   └── memory-bank-instructions.md
│   └── AI_SETUP.md
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── nginx.conf
│
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   ├── base-agent.ts          # Base class for all agents
│   │   │   ├── code-generator.agent.ts
│   │   │   ├── debugger.agent.ts
│   │   │   └── orchestrator.ts        # Manages agent interactions
│   │   │
│   │   ├── tools/
│   │   │   ├── file-system.tool.ts
│   │   │   ├── code-executor.tool.ts
│   │   │   ├── git.tool.ts
│   │   │   └── github-api.tool.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── agent.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   └── project.controller.ts
│   │   │
│   │   ├── services/
│   │   │   ├── llm.service.ts          # Unified LLM interface
│   │   │   ├── memory-bank.service.ts  # Context management
│   │   │   ├── rate-limiter.service.ts
│   │   │   ├── cache.service.ts
│   │   │   └── vector-store.service.ts # RAG
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Project.ts
│   │   │   ├── ChatMessage.ts
│   │   │   ├── AgentCheckpoint.ts
│   │   │   └── VectorEmbedding.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   └── request-logger.middleware.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── agents.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   └── projects.routes.ts
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   ├── llm-providers.ts
│   │   │   └── environment.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── error-handler.ts
│   │   │   ├── validators.ts
│   │   │   └── formatters.ts
│   │   │
│   │   ├── types/
│   │   │   ├── agent.types.ts
│   │   │   ├── chat.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   │
│   │   └── app.ts                     # Express app entry
│   │
│   ├── migrations/
│   │   ├── 001_create_users_table.ts
│   │   ├── 002_create_projects_table.ts
│   │   ├── 003_create_chat_messages_table.ts
│   │   └── 004_create_vector_embeddings.ts
│   │
│   ├── .env.example
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── projects/
│   │   │   ├── agents/
│   │   │   └── settings/
│   │   │
│   │   ├── chat/
│   │   │   ├── [projectId]/
│   │   │   │   └── page.tsx
│   │   │   └── components/
│   │   │       ├── ChatWindow.tsx
│   │   │       ├── AgentStatus.tsx
│   │   │       ├── CodePreview.tsx
│   │   │       └── MemoryBankViewer.tsx
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── StreamingResponse.tsx
│   │   │   └── ToolCallVisualizer.tsx
│   │   │
│   │   ├── agent/
│   │   │   ├── AgentSelector.tsx
│   │   │   └── AgentSettings.tsx
│   │   │
│   │   └── memory/
│   │       ├── MemoryBankPanel.tsx
│   │       └── ContextViewer.tsx
│   │
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useAgent.ts
│   │   ├── useWebSocket.ts
│   │   └── useMemoryBank.ts
│   │
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── stream-parser.ts
│   │   ├── local-storage.ts
│   │   └── state-management.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── .env.example
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── AGENTS.md
│   └── TROUBLESHOOTING.md
│
├── scripts/
│   ├── setup.sh
│   ├── migrate.sh
│   ├── seed.sh
│   └── deploy.sh
│
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
│
└── README.md
```

### 1.2 Environment Configuration

```bash
# backend/.env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/ai_agents
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here

# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSyD...

# GitHub Integration
GITHUB_TOKEN=ghp_...
GITHUB_API_BASE_URL=https://api.github.com

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_TOKENS_PER_MINUTE=90000

# Logging & Monitoring
LOG_LEVEL=debug
SENTRY_DSN=https://...@sentry.io/...
LANGSMITH_API_KEY=ls_...

# External Services
STRIPE_API_KEY=sk_...
CORS_ORIGIN=http://localhost:3001
```

---

## PART 2: Backend Architecture (Node.js + LangGraph)

### 2.1 Base Agent Structure (TypeScript)

```typescript
// src/agents/base-agent.ts

import { BaseMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { Tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import { Logger } from "@/utils/logger";

export interface AgentState {
  task: string;
  messages: BaseMessage[];
  status: "planning" | "executing" | "testing" | "done" | "error";
  context: Record<string, any>;
  errors: string[];
  checkpointId?: string;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
}

export interface AgentConfig {
  name: string;
  description: string;
  model: "gpt-4o" | "claude-3.5-sonnet" | "gemini-2.5-pro";
  temperature?: number;
  maxTokens?: number;
  maxIterations?: number;
  tools: Tool[];
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected logger: Logger;
  protected state: AgentState;

  constructor(config: AgentConfig) {
    this.config = config;
    this.logger = new Logger(config.name);
    this.state = {
      task: "",
      messages: [],
      status: "planning",
      context: {},
      errors: [],
      tokenUsage: { input: 0, output: 0, total: 0 },
    };
  }

  /**
   * Run the agent with a given task
   */
  async run(task: string): Promise<string> {
    try {
      this.state.task = task;
      this.state.status = "planning";

      // Initialize memory
      await this.initializeMemory();

      // Execute agentic loop
      let result = "";
      let iterations = 0;
      const maxIterations = this.config.maxIterations || 10;

      while (iterations < maxIterations) {
        // Get LLM response
        const response = await this.callLLM();

        // Check if done
        if (response.done) {
          result = response.content;
          this.state.status = "done";
          break;
        }

        // Execute tools if needed
        if (response.toolCalls && response.toolCalls.length > 0) {
          await this.executeTools(response.toolCalls);
        }

        iterations++;
      }

      if (iterations >= maxIterations) {
        this.state.status = "error";
        throw new Error(`Max iterations (${maxIterations}) reached`);
      }

      // Save checkpoint
      await this.saveCheckpoint();

      return result;
    } catch (error) {
      this.state.status = "error";
      this.state.errors.push((error as Error).message);
      this.logger.error("Agent execution failed", error);
      throw error;
    }
  }

  /**
   * Initialize memory with project context
   */
  protected async initializeMemory(): Promise<void> {
    // Load from Memory Bank
    const contextData = await this.getContextFromMemoryBank();
    this.state.context = contextData;

    // Add system message
    this.state.messages.push(
      new HumanMessage({
        content: `Task: ${this.state.task}\n\nContext: ${JSON.stringify(contextData)}`,
      })
    );
  }

  /**
   * Call the LLM
   */
  protected abstract callLLM(): Promise<{
    done: boolean;
    content: string;
    toolCalls?: Array<{ name: string; args: Record<string, any> }>;
  }>;

  /**
   * Execute tool calls
   */
  protected async executeTools(
    toolCalls: Array<{ name: string; args: Record<string, any> }>
  ): Promise<void> {
    for (const call of toolCalls) {
      const tool = this.config.tools.find((t) => t.name === call.name);
      if (!tool) {
        this.logger.warn(`Tool not found: ${call.name}`);
        continue;
      }

      try {
        const result = await tool.invoke(call.args);
        this.state.messages.push(
          new ToolMessage({
            content: JSON.stringify(result),
            tool_call_id: call.name,
            name: call.name,
          })
        );
      } catch (error) {
        this.logger.error(`Tool execution failed: ${call.name}`, error);
        this.state.messages.push(
          new ToolMessage({
            content: `Error: ${(error as Error).message}`,
            tool_call_id: call.name,
            name: call.name,
          })
        );
      }
    }
  }

  /**
   * Load context from Memory Bank
   */
  protected async getContextFromMemoryBank(): Promise<Record<string, any>> {
    // Implement based on your storage
    return {};
  }

  /**
   * Save checkpoint
   */
  protected async saveCheckpoint(): Promise<void> {
    // Implement checkpoint saving
  }

  /**
   * Get agent state
   */
  getState(): AgentState {
    return this.state;
  }
}
```

### 2.2 LangGraph Orchestration

```typescript
// src/agents/orchestrator.ts

import { StateGraph, START, END } from "@langchain/langgraph";
import { MessageState } from "@langchain/langgraph/types";
import { BaseAgent } from "./base-agent";

interface ProjectState extends MessageState {
  project_id: string;
  status: "analyzing" | "coding" | "testing" | "deploying" | "done";
  generated_files: string[];
  test_results: { passed: number; failed: number };
  errors: string[];
}

export class AgentOrchestrator {
  private graph: StateGraph<ProjectState>;

  constructor() {
    this.graph = new StateGraph<ProjectState>();
  }

  /**
   * Build the orchestration graph
   */
  buildGraph() {
    // Node: Analyze requirements
    this.graph.addNode("analyzer", async (state: ProjectState) => {
      console.log("📊 Analyzing project...");
      // Analysis logic
      return { status: "coding", ...state };
    });

    // Node: Generate code
    this.graph.addNode("coder", async (state: ProjectState) => {
      console.log("💻 Generating code...");
      // Coding logic
      return {
        status: "testing",
        generated_files: ["file1.ts", "file2.ts"],
        ...state,
      };
    });

    // Node: Run tests
    this.graph.addNode("tester", async (state: ProjectState) => {
      console.log("✅ Running tests...");
      // Testing logic
      return {
        status: "deploying",
        test_results: { passed: 10, failed: 0 },
        ...state,
      };
    });

    // Node: Deploy
    this.graph.addNode("deployer", async (state: ProjectState) => {
      console.log("🚀 Deploying...");
      // Deployment logic
      return { status: "done", ...state };
    });

    // Define edges
    this.graph.addEdge(START, "analyzer");
    this.graph.addEdge("analyzer", "coder");
    this.graph.addEdge("coder", "tester");
    this.graph.addEdge("tester", "deployer");
    this.graph.addEdge("deployer", END);
  }

  /**
   * Compile and run
   */
  async run(projectId: string, requirements: string) {
    this.buildGraph();
    const compiled = this.graph.compile();

    const initialState: ProjectState = {
      project_id: projectId,
      messages: [],
      status: "analyzing",
      generated_files: [],
      test_results: { passed: 0, failed: 0 },
      errors: [],
    };

    return await compiled.invoke(initialState);
  }
}
```

### 2.3 LLM Service (Unified Interface)

```typescript
// src/services/llm.service.ts

import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RateLimiter } from "./rate-limiter.service";

export type LLMProvider = "openai" | "anthropic" | "gemini";

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export class LLMService {
  private rateLimiter: RateLimiter;

  constructor(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter;
  }

  /**
   * Get LLM instance based on provider
   */
  async getLLM(config: LLMConfig) {
    // Check rate limit
    await this.rateLimiter.checkLimit(config.provider);

    switch (config.provider) {
      case "openai":
        return new ChatOpenAI({
          modelName: config.model,
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 2000,
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

      case "anthropic":
        return new ChatAnthropic({
          modelId: config.model,
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 2000,
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        });

      case "gemini":
        return new ChatGoogleGenerativeAI({
          modelName: config.model,
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxTokens || 2000,
          apiKey: process.env.GEMINI_API_KEY,
        });

      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  /**
   * Call LLM with streaming
   */
  async *callStream(config: LLMConfig, prompt: string) {
    const llm = await this.getLLM(config);

    const stream = await llm.stream(prompt);
    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * Call LLM with complete response
   */
  async call(config: LLMConfig, prompt: string): Promise<string> {
    const llm = await this.getLLM(config);
    const response = await llm.invoke(prompt);
    return response.content;
  }
}
```

---

## PART 3: Frontend + UI/UX

### 3.1 Chat Component with Streaming

```typescript
// frontend/components/chat/ChatWindow.tsx

"use client";

import React, { useRef, useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { MessageBubble } from "./MessageBubble";
import { StreamingResponse } from "./StreamingResponse";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: Array<{ name: string; args: Record<string, any> }>;
  timestamp: Date;
}

export const ChatWindow: React.FC<{ projectId: string }> = ({
  projectId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { send, subscribe, isConnected } = useWebSocket(
    `${process.env.NEXT_PUBLIC_API_URL}/chat/${projectId}`
  );

  useEffect(() => {
    // Subscribe to messages
    subscribe("message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    subscribe("tool_call", (data: any) => {
      // Show tool execution
      console.log("Tool call:", data);
    });

    subscribe("error", (error: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "system",
          content: `Error: ${error}`,
          timestamp: new Date(),
        },
      ]);
    });
  }, [subscribe]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send via WebSocket
      send("chat", {
        project_id: projectId,
        message: input,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={msg.id === messages[messages.length - 1]?.id &&
              isLoading}
          />
        ))}
        {isLoading && <StreamingResponse />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Enter your request..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
            disabled={!isConnected || isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 3.2 Memory Bank Viewer

```typescript
// frontend/components/memory/MemoryBankPanel.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

interface MemoryItem {
  key: string;
  value: string;
  lastUpdated: Date;
  importance: "low" | "medium" | "high";
}

export const MemoryBankPanel: React.FC<{ projectId: string }> = ({
  projectId,
}) => {
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/memory-bank`
        );
        if (response.ok) {
          const data = await response.json();
          setMemory(data);
        }
      } catch (error) {
        console.error("Failed to fetch memory bank:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemory();
  }, [projectId]);

  if (loading) return <div>Loading memory bank...</div>;

  return (
    <div className="space-y-2">
      {memory.map((item) => (
        <Card key={item.key} className="p-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-sm">{item.key}</h4>
              <p className="text-gray-600 text-sm">{item.value}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${
                item.importance === "high"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {item.importance}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Updated: {new Date(item.lastUpdated).toLocaleString()}
          </p>
        </Card>
      ))}
    </div>
  );
};
```

---

## PART 4: Database & Storage

### 4.1 Database Schema (TypeORM)

```typescript
// backend/src/models/ChatMessage.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Project } from "./Project";

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Project)
  @JoinColumn()
  project: Project;

  @ManyToOne(() => User)
  @JoinColumn()
  author: User;

  @Column("text")
  content: string;

  @Column("varchar", { length: 50 })
  role: "user" | "assistant" | "system" | "tool";

  @Column("jsonb", { nullable: true })
  metadata: {
    toolCalls?: Array<{ name: string; args: Record<string, any> }>;
    tokens?: { input: number; output: number };
    model?: string;
  };

  @Column("jsonb", { nullable: true })
  embedding?: number[]; // For semantic search

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column("varchar", { length: 50, default: "pending" })
  status: "pending" | "completed" | "error";

  @Column("text", { nullable: true })
  error: string;
}
```

### 4.2 Redis Caching Strategy

```typescript
// backend/src/services/cache.service.ts

import Redis from "ioredis";
import { Logger } from "@/utils/logger";

export class CacheService {
  private redis: Redis;
  private logger = new Logger("CacheService");

  constructor(url: string) {
    this.redis = new Redis(url);
  }

  /**
   * Cache LLM response
   */
  async cacheResponse(
    key: string,
    value: string,
    ttlSeconds: number = 3600
  ): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      this.logger.error("Failed to cache response", error);
    }
  }

  /**
   * Get cached response
   */
  async getResponse(key: string): Promise<string | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.error("Failed to retrieve from cache", error);
      return null;
    }
  }

  /**
   * Semantic caching (cache similar queries)
   */
  async cacheSemanticResponse(
    embedding: number[],
    response: string,
    ttlSeconds: number = 3600
  ): Promise<string> {
    const key = `semantic:${this.hashEmbedding(embedding)}`;
    await this.cacheResponse(key, response, ttlSeconds);
    return key;
  }

  private hashEmbedding(embedding: number[]): string {
    // Simple hash of embedding
    return embedding.slice(0, 5).join(",");
  }

  /**
   * Rate limit tracking
   */
  async trackRateLimit(
    userId: string,
    tokens: number,
    windowSeconds: number = 60
  ): Promise<{ remaining: number; resetAt: Date }> {
    const key = `ratelimit:${userId}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, windowSeconds);
    }

    const ttl = await this.redis.ttl(key);
    const resetAt = new Date(Date.now() + ttl * 1000);

    return {
      remaining: Math.max(0, 100000 - current * tokens), // TPM
      resetAt,
    };
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
```

---

## PART 5: Integration & API Design

### 5.1 REST API Endpoints

```typescript
// backend/src/routes/agents.routes.ts

import express, { Router } from "express";
import { auth } from "@/middleware/auth.middleware";
import { AgentController } from "@/controllers/agent.controller";

export const agentRouter: Router = express.Router();

const agentController = new AgentController();

/**
 * POST /api/agents/run
 * Run an agent with a task
 */
agentRouter.post(
  "/run",
  auth,
  async (req, res) => {
    try {
      const { agentType, task, projectId } = req.body;

      const result = await agentController.runAgent({
        agentType,
        task,
        projectId,
        userId: req.user.id,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * GET /api/agents/status/:executionId
 * Get agent execution status
 */
agentRouter.get(
  "/status/:executionId",
  auth,
  async (req, res) => {
    try {
      const status = await agentController.getExecutionStatus(
        req.params.executionId,
        req.user.id
      );

      res.json(status);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * WebSocket: /ws/chat/:projectId
 * Real-time chat with agent
 */
agentRouter.ws(
  "/chat/:projectId",
  auth,
  async (ws, req) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    ws.on("message", async (message: string) => {
      try {
        const data = JSON.parse(message);

        // Handle different message types
        if (data.type === "chat") {
          // Process chat message
          const response = await agentController.processChat({
            projectId,
            userId,
            message: data.message,
          });

          ws.send(JSON.stringify({ type: "response", data: response }));
        }
      } catch (error) {
        ws.send(
          JSON.stringify({ type: "error", error: (error as Error).message })
        );
      }
    });

    ws.on("close", () => {
      console.log("WebSocket closed");
    });
  }
);
```

### 5.2 Tool Integration with MCP

```typescript
// backend/src/tools/github-api.tool.ts

import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import { Octokit } from "@octokit/rest";

export class GitHubTool extends Tool {
  name = "github";
  description = "Interact with GitHub repositories";
  octokit: Octokit;

  schema = z.object({
    action: z.enum(["read_file", "create_pr", "list_issues", "get_repo_info"]),
    owner: z.string(),
    repo: z.string(),
    path: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
  });

  constructor(token: string) {
    super();
    this.octokit = new Octokit({ auth: token });
  }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    const { action, owner, repo, path, title, body } = input;

    try {
      switch (action) {
        case "read_file":
          return await this.readFile(owner, repo, path!);
        case "create_pr":
          return await this.createPullRequest(owner, repo, title!, body!);
        case "list_issues":
          return await this.listIssues(owner, repo);
        case "get_repo_info":
          return await this.getRepoInfo(owner, repo);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return `Error: ${(error as Error).message}`;
    }
  }

  private async readFile(
    owner: string,
    repo: string,
    path: string
  ): Promise<string> {
    const response = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(response.data)) {
      return JSON.stringify(response.data.map((f) => f.name));
    }

    const content = Buffer.from(
      response.data.content as string,
      "base64"
    ).toString();
    return content;
  }

  private async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string
  ): Promise<string> {
    const response = await this.octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head: "feature/ai-generated",
      base: "main",
    });

    return `PR created: ${response.data.html_url}`;
  }

  private async listIssues(owner: string, repo: string): Promise<string> {
    const response = await this.octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
    });

    return JSON.stringify(response.data.slice(0, 5));
  }

  private async getRepoInfo(owner: string, repo: string): Promise<string> {
    const response = await this.octokit.repos.get({
      owner,
      repo,
    });

    return JSON.stringify({
      name: response.data.name,
      description: response.data.description,
      stars: response.data.stargazers_count,
      language: response.data.language,
      updatedAt: response.data.updated_at,
    });
  }
}
```

---

## PART 6: Deployment & Infrastructure

### 6.1 Docker Setup

```dockerfile
# docker/Dockerfile.backend

FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build TypeScript
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["node", "dist/app.js"]
```

### 6.2 Docker Compose

```yaml
# docker/docker-compose.yml

version: "3.9"

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: ai_agents_db
    environment:
      POSTGRES_USER: ${DB_USER:-admin}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
      POSTGRES_DB: ${DB_NAME:-ai_agents}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: ai_agents_cache
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ../backend
      dockerfile: ../docker/Dockerfile.backend
    container_name: ai_agents_backend
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://admin:password@postgres:5432/ai_agents
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ../backend/src:/app/src
      - /app/node_modules
    command: npm run dev

  # Frontend
  frontend:
    build:
      context: ../frontend
      dockerfile: ../docker/Dockerfile.frontend
    container_name: ai_agents_frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000
    ports:
      - "3001:3000"
    depends_on:
      - backend
    volumes:
      - ../frontend:/app
      - /app/node_modules

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: ai_agents_proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
  redis_data:
```

### 6.3 Kubernetes Deployment

```yaml
# k8s/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-agents-backend
  namespace: default
  labels:
    app: ai-agents
    component: backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ai-agents
      component: backend
  template:
    metadata:
      labels:
        app: ai-agents
        component: backend
    spec:
      containers:
      - name: backend
        image: docker-registry.example.com/ai-agents-backend:latest
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ai-agents-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: ai-agents-config
              key: redis-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-agents-secrets
              key: openai-api-key
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: ai-agents-backend-service
  namespace: default
  labels:
    app: ai-agents
    component: backend
spec:
  type: ClusterIP
  selector:
    app: ai-agents
    component: backend
  ports:
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-agents-backend-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-agents-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## PART 7: Monitoring, Observability & Debugging

### 7.1 Observability with OpenTelemetry

```typescript
// backend/src/config/observability.ts

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

export function initializeObservability() {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "ai-agents-backend",
      [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    traceExporter: new ConsoleSpanExporter(),
  });

  sdk.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

  sdk.start();
  console.log("Observability initialized");

  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("Observability shutdown"))
      .catch((error) => console.log("Error shutting down", error));
  });
}
```

### 7.2 LangGraph Monitoring

```typescript
// backend/src/utils/langchain-monitor.ts

import { trace } from "@opentelemetry/api";
import { Tracer } from "@opentelemetry/api";

export class LangChainMonitor {
  private tracer: Tracer;

  constructor() {
    this.tracer = trace.getTracer("langchain-monitor");
  }

  /**
   * Track LLM call
   */
  async trackLLMCall(
    modelName: string,
    tokens: { input: number; output: number },
    latencyMs: number
  ) {
    const span = this.tracer.startSpan("llm.call", {
      attributes: {
        "llm.model": modelName,
        "llm.tokens.input": tokens.input,
        "llm.tokens.output": tokens.output,
        "llm.latency_ms": latencyMs,
        "llm.cost_usd": this.estimateCost(modelName, tokens),
      },
    });

    span.end();
  }

  /**
   * Track agent execution
   */
  async trackAgentExecution(
    agentName: string,
    status: "success" | "error",
    duration: number
  ) {
    const span = this.tracer.startSpan("agent.execution", {
      attributes: {
        "agent.name": agentName,
        "agent.status": status,
        "agent.duration_ms": duration,
      },
    });

    span.end();
  }

  private estimateCost(model: string, tokens: { input: number; output: number }): number {
    // Pricing as of 2025
    const pricing: Record<string, { input: number; output: number }> = {
      "gpt-4o": { input: 0.005, output: 0.015 }, // per 1K tokens
      "claude-3.5-sonnet": { input: 0.003, output: 0.015 },
      "gemini-2.5-pro": { input: 0.000075, output: 0.0003 },
    };

    const rates = pricing[model] || { input: 0, output: 0 };
    return (tokens.input * rates.input + tokens.output * rates.output) / 1000;
  }
}
```

---

## PART 8: Production Ready Checklist

### ✅ Pre-Launch

- [ ] **Code Quality**
  - [ ] All code reviewed and merged
  - [ ] ESLint passing (0 warnings)
  - [ ] TypeScript strict mode enabled
  - [ ] Unit test coverage > 80%
  - [ ] E2E tests for critical flows

- [ ] **Documentation**
  - [ ] API documentation complete (Swagger/OpenAPI)
  - [ ] Architecture diagram updated
  - [ ] Setup guide for new developers
  - [ ] Troubleshooting guide
  - [ ] Database schema documented

- [ ] **Security**
  - [ ] All secrets in environment variables (not in code)
  - [ ] HTTPS enabled
  - [ ] CORS configured properly
  - [ ] Rate limiting enabled
  - [ ] Input validation on all endpoints
  - [ ] SQL injection prevention (TypeORM)
  - [ ] XSS protection headers
  - [ ] CSRF tokens implemented
  - [ ] Secrets scanning in CI/CD

- [ ] **Performance**
  - [ ] Database queries optimized (indexes created)
  - [ ] Redis caching layer working
  - [ ] Frontend bundle size < 200KB (gzipped)
  - [ ] LCP < 2.5s, FID < 100ms, CLS < 0.1
  - [ ] API response time < 500ms (p95)

- [ ] **Infrastructure**
  - [ ] Docker images built and tested
  - [ ] Docker Compose working locally
  - [ ] Kubernetes manifests validated
  - [ ] Load balancer configured
  - [ ] SSL certificates ready
  - [ ] CDN configured (if applicable)

- [ ] **Monitoring**
  - [ ] Application logs configured
  - [ ] Error tracking (Sentry) integrated
  - [ ] Performance monitoring (New Relic/DataDog) ready
  - [ ] Alerting rules configured
  - [ ] Dashboard created

- [ ] **Backup & Recovery**
  - [ ] Database backups automated
  - [ ] Disaster recovery plan documented
  - [ ] Restore tested
  - [ ] DLT/RPO targets defined

---

## PART 9: Copy-Paste Ready Examples

### Example: Complete Agent Loop

```typescript
// backend/src/agents/complete-example.ts

import { BaseAgent, AgentState, AgentConfig } from "./base-agent";
import { ChatOpenAI } from "@langchain/openai";
import { Tool } from "@langchain/core/tools";
import { z } from "zod";

// Define tools
class CalculatorTool extends Tool {
  name = "calculator";
  description = "Perform mathematical calculations";
  schema = z.object({
    operation: z.enum(["add", "subtract", "multiply", "divide"]),
    a: z.number(),
    b: z.number(),
  });

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    const { operation, a, b } = input;
    let result = 0;

    switch (operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        result = a / b;
        break;
    }

    return `Result: ${result}`;
  }
}

// Define agent
export class MathAgent extends BaseAgent {
  private llm: ChatOpenAI;

  constructor() {
    const config: AgentConfig = {
      name: "MathAgent",
      description: "Solves math problems",
      model: "gpt-4o",
      tools: [new CalculatorTool()],
      maxIterations: 10,
    };

    super(config);

    this.llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  protected async callLLM(): Promise<{
    done: boolean;
    content: string;
    toolCalls?: Array<{ name: string; args: Record<string, any> }>;
  }> {
    // Implementation
    return { done: true, content: "Answer" };
  }

  protected async getContextFromMemoryBank(): Promise<Record<string, any>> {
    return {
      previousProblems: [],
      learnings: [],
    };
  }

  protected async saveCheckpoint(): Promise<void> {
    // Save to database
  }
}

// Usage
async function main() {
  const agent = new MathAgent();
  const result = await agent.run("Calculate 15 + 27");
  console.log("Result:", result);
}

main().catch(console.error);
```

### Example: Frontend WebSocket Integration

```typescript
// frontend/hooks/useChat.ts

"use client";

import { useCallback, useRef, useEffect, useState } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useChat(projectId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat/${projectId}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: data.content,
          },
        ]);
        setIsLoading(false);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsLoading(false);
    };

    return () => {
      wsRef.current?.close();
    };
  }, [projectId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!wsRef.current) return;

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content,
        },
      ]);

      setIsLoading(true);

      // Send to server
      wsRef.current.send(
        JSON.stringify({
          type: "message",
          content,
        })
      );
    },
    []
  );

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
```

---

## APPENDIX: Copy-Paste Ready Examples

### Rate Limiting Service

```typescript
import Redis from "ioredis";

export class RateLimiter {
  private redis: Redis;
  private windowSize = 60; // seconds

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async checkLimit(userId: string, tokens: number = 1): Promise<boolean> {
    const key = `ratelimit:${userId}`;
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, this.windowSize);
    }

    // Max 100 requests per minute
    return count <= 100;
  }

  async getRemaining(userId: string): Promise<number> {
    const key = `ratelimit:${userId}`;
    const count = await this.redis.get(key);
    return Math.max(0, 100 - (parseInt(count || "0") || 0));
  }
}
```

### Error Middleware

```typescript
import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", error);

  // Handle different error types
  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  if (error.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Default 500 error
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: error.message }),
  });
}
```

---

## Финальные Советы

1. **Всегда начинай с Architecture** — перед кодом
2. **Используй Memory Bank** — для долгосрочного контекста
3. **Тести всё** — Unit, Integration, E2E
4. **Мониторь Production** — логи, метрики, ошибки
5. **Optimize iteratively** — не всё сразу
6. **Документируй** — код, API, процессы
7. **Security first** — не добавляй потом
8. **Scale horizontally** — контейнеры, Kubernetes
9. **Automate everything** — CI/CD, тесты, деплойменты
10. **Stay updated** — AI развивается очень быстро

---

**Это полное, production-ready руководство. Адаптируй под свои нужды, используй как шаблон для всех future проектов.**

**Happy building! 🚀**
