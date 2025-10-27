import { describe, it, expect, vi, beforeAll } from 'vitest';
vi.mock('@langchain/langgraph', () => ({
  StateGraph: class {},
  END: 'END',
  START: 'START',
}));

// Моки внешних LLM SDK чтобы избежать реальных сетевых вызовов
vi.mock('@langchain/openai', () => {
  class ChatOpenAI {
    constructor(_opts?: any) {}
    async invoke(messages: Array<{ role: string; content: string }>) {
      const userMsg = messages.find(m => m.role === 'user');
      const text = (userMsg?.content || '').toLowerCase();
      let content = 'researcher';
      if ((text.includes('recipe') && text.includes('borscht')) || text.includes('рецепт')) {
        content = 'chef';
      } else if (text.includes('cost of goods') || text.includes('cost')) {
        content = 'accountant';
      } else if ((text.includes('culinary') && text.includes('trend')) || text.includes('тренд')) {
        content = 'researcher';
      } else if (text.includes('logo')) {
        content = 'media_studio';
      }
      return { content };
    }
  }
  return { ChatOpenAI };
});

vi.mock('@google/generative-ai', () => {
  class GoogleGenerativeAI {
    constructor(_key?: string) {}
    getGenerativeModel(_opts: unknown) {
      return {
        generateContent: async (_input: string) => ({
          response: { text: () => 'mocked accountant response' }
        })
      };
    }
  }
  return { GoogleGenerativeAI };
});

let orchestratorNode: (state: any) => Promise<any>;

beforeAll(async () => {
  const mod = await import('./graph.js');
  orchestratorNode = mod.orchestratorNode;
});

function makeState(content: string) {
  return { messages: [{ role: 'user' as const, content }] };
}

describe('orchestratorNode - AgentRouter', () => {
  it('routes "create a recipe for borscht" to chef via heuristic', async () => {
    const res = await orchestratorNode(makeState('create a recipe for borscht'));
    expect(res.agentOutcome).toBe('chef');
    expect(res.currentAgent).toBe('chef');
    expect(res.usedModel).toBe('heuristic');
    expect(res.metadata?.orchestratorMethod).toBe('heuristic');
  });

  it('routes "calculate the cost of goods for last month" to accountant via heuristic', async () => {
    const res = await orchestratorNode(makeState('calculate the cost of goods for last month'));
    expect(res.agentOutcome).toBe('accountant');
    expect(res.usedModel).toBe('heuristic');
  });

  it('routes "what are the latest culinary trends in Paris?" to researcher via heuristic', async () => {
    const res = await orchestratorNode(makeState('what are the latest culinary trends in Paris?'));
    expect(res.agentOutcome).toBe('researcher');
    expect(res.usedModel).toBe('heuristic');
  });

  it('routes "generate a logo for a new cafe" to media_studio via LLM fallback', async () => {
    const res = await orchestratorNode(makeState('generate a logo for a new cafe'));
    expect(res.agentOutcome).toBe('media_studio');
    expect(res.currentAgent).toBe('media_studio');
    expect(res.usedModel).toBe('gpt-4-turbo-preview');
    expect(res.metadata?.orchestratorMethod).toBe('llm_fallback');
    expect(typeof res.metadata?.llmRawChoice).toBe('string');
  });

  it('uses LLM fallback for ambiguous prompt', async () => {
    const res = await orchestratorNode(makeState('please help'));
    expect(['chef','accountant','researcher','media_studio']).toContain(res.agentOutcome);
    expect(res.usedModel).toBe('gpt-4-turbo-preview');
    expect(res.metadata?.orchestratorMethod).toBe('llm_fallback');
  });
});