import { StateGraph, END, START } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Простое определение состояния
export interface GraphStateType {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    agent?: string;
    model?: string;
  }>;
  agentOutcome?: string;
  currentAgent?: string;
  usedModel?: string;
  metadata?: Record<string, any>;
}

// Инициализация моделей
const openai = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4-turbo-preview',
  temperature: 0.7,
  streaming: true,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Системные промпты для агентов
const ORCHESTRATOR_PROMPT = `Ты - Оркестратор в системе Chef's Mind AI. Твоя задача - проанализировать запрос пользователя и направить его к правильному специалисту.

Доступные специалисты:
1. "chef" - Шеф-повар: отвечает за рецепты, кулинарные советы, ингредиенты, меню, приготовление блюд
2. "accountant" - Учётчик: отвечает за финансовые отчёты, учёт, затраты, выручку, статистику

Проанализируй запрос и верни только имя специалиста (chef или accountant). Если запрос неясен, выбери наиболее подходящего специалиста.`;

const CHEF_PROMPT = `Ты - Шеф-повар в ресторане в Берлине, Германия. Ты эксперт в кулинарии, рецептах, ингредиентах и управлении кухней. 
Отвечай на русском языке. Будь дружелюбным, профессиональным и давай практические советы по приготовлению блюд.`;

const ACCOUNTANT_PROMPT = `Ты - Учётчик/финансовый специалист в ресторане. Ты эксперт в финансовом анализе, отчётности, учёте затрат и выручки.
Отвечай на русском языке. Будь точным, аналитичным и предоставляй ясные финансовые инсайты.`;

// Узел Оркестратора
export async function orchestratorNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || lastMessage.role !== 'user') {
    return { agentOutcome: 'error', currentAgent: 'none' };
  }

  try {
    const response = await openai.invoke([
      { role: 'system', content: ORCHESTRATOR_PROMPT },
      { role: 'user', content: lastMessage.content }
    ]);

    const content = typeof response.content === 'string' ? response.content : String(response.content);
    const agentChoice = content.toLowerCase().trim();
    const selectedAgent = agentChoice.includes('chef') ? 'chef' : 'accountant';
    
    return {
      agentOutcome: selectedAgent,
      currentAgent: selectedAgent,
      usedModel: 'gpt-4-turbo-preview',
      metadata: {
        orchestratorDecision: selectedAgent,
        originalQuery: lastMessage.content
      }
    };
  } catch (error) {
    console.error('Orchestrator error:', error);
    return { 
      agentOutcome: 'error', 
      currentAgent: 'none',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

// Узел Шефа
export async function chefNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || lastMessage.role !== 'user') {
    return { agentOutcome: 'error' };
  }

  try {
    const response = await openai.invoke([
      { role: 'system', content: CHEF_PROMPT },
      { role: 'user', content: lastMessage.content }
    ]);

    const content = typeof response.content === 'string' ? response.content : String(response.content);

    const assistantMessage = {
      role: 'assistant' as const,
      content: content,
      agent: 'chef',
      model: 'gpt-4-turbo-preview'
    };

    return {
      messages: [...state.messages, assistantMessage],
      agentOutcome: 'complete',
      usedModel: 'gpt-4-turbo-preview'
    };
  } catch (error) {
    console.error('Chef node error:', error);
    return { 
      agentOutcome: 'error',
      metadata: { error: error instanceof Error ? error.message : 'Chef node error' }
    };
  }
}

// Узел Учётчика
export async function accountantNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || lastMessage.role !== 'user') {
    return { agentOutcome: 'error' };
  }

  try {
    const geminiModel = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: ACCOUNTANT_PROMPT
    });

    const result = await geminiModel.generateContent(lastMessage.content);
    const response = result.response;

    const assistantMessage = {
      role: 'assistant' as const,
      content: response.text(),
      agent: 'accountant',
      model: 'gemini-2.0-flash-exp'
    };

    return {
      messages: [...state.messages, assistantMessage],
      agentOutcome: 'complete',
      usedModel: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Accountant node error:', error);
    return { 
      agentOutcome: 'error',
      metadata: { error: error instanceof Error ? error.message : 'Accountant node error' }
    };
  }
}

// Функция маршрутизации
export function routeToAgent(state: GraphStateType): string {
  if (state.agentOutcome === 'error') {
    return END;
  }
  
  switch (state.agentOutcome) {
    case 'chef':
      return 'chef_node';
    case 'accountant':
      return 'accountant_node';
    default:
      return END;
  }
}

// Упрощенная версия - просто возвращаем результат без сложного графа
export async function processWithAgents(message: string): Promise<{
  content: string;
  agent: string;
  model: string;
  metadata?: any;
}> {
  try {
    // Сначала определяем агента
    const orchestratorResult = await orchestratorNode({
      messages: [{ role: 'user', content: message }]
    });

    if (orchestratorResult.agentOutcome === 'error' || !orchestratorResult.currentAgent) {
      throw new Error(orchestratorResult.metadata?.error || 'Failed to determine agent');
    }

    // Затем выполняем запрос через выбранного агента
    const state: GraphStateType = {
      messages: [{ role: 'user', content: message }],
      agentOutcome: orchestratorResult.agentOutcome,
      currentAgent: orchestratorResult.currentAgent,
      usedModel: orchestratorResult.usedModel,
      metadata: orchestratorResult.metadata
    };

    let result;
    if (orchestratorResult.currentAgent === 'chef') {
      result = await chefNode(state);
    } else if (orchestratorResult.currentAgent === 'accountant') {
      result = await accountantNode(state);
    } else {
      throw new Error('Unknown agent selected');
    }

    if (result.agentOutcome === 'error' || !result.messages) {
      throw new Error(result.metadata?.error || 'Agent processing failed');
    }

    const lastMessage = result.messages[result.messages.length - 1];
    return {
      content: lastMessage.content,
      agent: lastMessage.agent || 'unknown',
      model: lastMessage.model || 'unknown',
      metadata: result.metadata
    };

  } catch (error) {
    console.error('Agent processing error:', error);
    throw error;
  }
}