import { StateGraph, END, START } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toAsyncIter, STREAM_ENABLED, getContentFromChunk, hasContent, normalizeStream } from './stream-utils.js';

// Расширенное состояние графа
export interface EnhancedGraphStateType {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    agent?: string;
    model?: string;
    metadata?: any;
  }>;
  agentOutcome?: string;
  currentAgent?: string;
  usedModel?: string;
  metadata?: Record<string, any>;
  // Новые поля для улучшенной логики
  correctionLoops?: number;
  fallbackUsed?: boolean;
  provenanceData?: any;
  confidence?: number;
}

// Инициализация моделей
const openai = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4-turbo-preview',
  temperature: 0.7,
  streaming: true,
});

const gpt5 = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4-turbo-preview', // Временно используем GPT-4
  temperature: 0.3,
  streaming: false,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Системные промпты для 5 агентов
const ORCHESTRATOR_PROMPT = `Ты - Оркестратор в системе Chef's Mind AI. Твоя задача - проанализировать запрос пользователя и направить его к правильному специалисту.

Доступные специалисты:
1. "chef" - Шеф-повар: рецепты, кулинария, меню, ингредиенты
2. "accountant" - Учётчик: финансы, отчёты, Google Calendar, Google Docs, Google Sheets
3. "researcher" - Исследователь: поиск информации, анализ трендов, исследования рынка
4. "media" - Медиа-продюсер: генерация изображений и видео
5. "quality" - Контроль качества: проверка фактов, корrекция ошибок

Проанализируй запрос и верни имя специалиста. Если запрос сложный, выбери основного агента.`;

const CHEF_PROMPT = `Ты - Шеф-повар в ресторане в Берлине. Эксперт в кулинарии, рецептах, управлении кухney. Отвечай на русском языке. Можешь запрашивать генерацию изображений блюд через медиа-агента.`;

const ACCOUNTANT_PROMPT = `Ты - Учётчик/финансовый специалист. Эксперт в финансах, отчётности, Google Calendar, Google Docs, Google Sheets. Отвечай на русском языке. Можешь работать с документами и таблицами.`;

const RESEARCHER_PROMPT = `Ты - Исследователь. Эксперт по поиску информации, анализу трендов, исследованиям рынка. Используй актуальные данные и источники. Отвечай на русском языке.`;

const MEDIA_PROMPT = `Ты - Медиа-продюсер. Эксперт по генерации изображений (DALL-E 3, GPT Image) и видео (Imagen 3, Veo 3). Отвечай на русском языке. Запрашивай улучшение промpтов при необходимости.`;

const QUALITY_PROMPT = `Ты - Контроль качества. Проверяешь факты, корrектируешь ошибки, обеспечиваешь точность информации. Отвечай на русском языке.`;

// Создание улучшенного графа с поддержкой стриминга
export function createEnhancedAgentGraph() {
  const workflow = new StateGraph({
    channels: {
      messages: { reducer: (x: any, y: any) => y ?? x, default: () => [] },
      agentOutcome: { default: () => '' },
      currentAgent: { default: () => '' },
      usedModel: { default: () => '' },
      metadata: { default: () => ({}) },
      correctionLoops: { default: () => 0 },
      fallbackUsed: { default: () => false },
      provenanceData: { default: () => ({}) },
      confidence: { default: () => 0.0 }
    }
  });

  // Добавление всех 5 узлов
  workflow.addNode('orchestrator', enhancedOrchestratorNode);
  workflow.addNode('chef_node', enhancedChefNode);
  workflow.addNode('accountant_node', enhancedAccountantNode);
  workflow.addNode('researcher_node', researcherNode);
  workflow.addNode('media_node', mediaNode);
  workflow.addNode('quality_control', qualityControlNode);

  // Настройка рёбер
  workflow.addEdge(START, 'orchestrator');
  workflow.addConditionalEdges(
    'orchestrator',
    enhancedRouteToAgent,
    {
      chef_node: 'chef_node',
      accountant_node: 'accountant_node',
      researcher_node: 'researcher_node',
      media_node: 'media_node',
      quality_control: 'quality_control',
      [END]: END
    }
  );
  
  workflow.addConditionalEdges(
    'chef_node',
    enhancedRouteToAgent,
    {
      media_node: 'media_node',
      quality_control: 'quality_control',
      [END]: END
    }
  );
  
  workflow.addConditionalEdges(
    'accountant_node',
    enhancedRouteToAgent,
    {
      quality_control: 'quality_control',
      [END]: END
    }
  );
  
  workflow.addEdge('researcher_node', 'quality_control');
  workflow.addEdge('media_node', 'quality_control');
  workflow.addEdge('quality_control', END);

  const graph = workflow.compile();

  // Возвращаем граф с методами для стриминга
  return {
    graph,
    invoke: graph.invoke.bind(graph),
    stream: async (input: any) => {
      if (STREAM_ENABLED) {
        // Используем stream с нормализацией
        const rawStream = graph.stream(input);
        return toAsyncIter(rawStream);
      } else {
        // Фолбэк: возвращаем результат как эмулированный стрим
        const result = await graph.invoke(input);
        return toAsyncIter([result]);
      }
    }
  };
}

// Экспорт скомпилированного графа
export const enhancedAgentGraph = createEnhancedAgentGraph();

// Улучшенная функция обработки с поддержкой стриминга
export async function processWithEnhancedAgents(
  message: string,
  options: {
    enableStreaming?: boolean;
    onChunk?: (chunk: any) => void;
  } = {}
): Promise<{
  content: string;
  agent: string;
  model: string;
  metadata?: any;
}> {
  try {
    // Инициализация состояния
    const initialState: EnhancedGraphStateType = {
      messages: [{ role: 'user', content: message }],
      agentOutcome: '',
      currentAgent: '',
      usedModel: '',
      metadata: {},
      correctionLoops: 0,
      fallbackUsed: false,
      provenanceData: {},
      confidence: 0.0
    };

    if (options.enableStreaming && STREAM_ENABLED && options.onChunk) {
      // Стриминг режим
      const streamLike = enhancedAgentGraph.graph(initialState);
      await handleStreamLike(streamLike, async (chunk) => {
        if (hasContent(chunk)) {
          const content = getContentFromChunk(chunk);
          options.onChunk!(content);
        }
      });
      
      // Возвращаем базовый результат для стриминга
      return {
        content: '',
        agent: 'streaming',
        model: 'multiple',
        metadata: { streaming: true }
      };
    } else {
      // Обычный invoke режим
      const result = await enhancedAgentGraph.invoke(initialState);
      
      if (result.agentOutcome === 'error' || !result.messages) {
        throw new Error(result.metadata?.error || 'Agent processing failed');
      }

      const lastMessage = result.messages[result.messages.length - 1];
      return {
        content: lastMessage?.content || '',
        agent: lastMessage?.agent || 'unknown',
        model: lastMessage?.model || 'unknown',
        metadata: result.metadata
      };
    }

  } catch (error) {
    console.error('Enhanced agent processing error:', error);
    throw error;
  }
}

// --- Stream bridge ---
export async function streamAdapter(result: any) {
  try {
    const chunks = [];
    for await (const ch of normalizeStream(result)) {
      chunks.push(ch);
    }
    return chunks[chunks.length - 1];
  } catch (e: any) {
    console.error("streamAdapter failed:", e);
    return { error: e?.message || "stream error" };
  }
}