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
const ORCHESTRATOR_PROMPT = `Ты — Оркестратор в системе Chef's Mind AI. Твоя задача — проанализировать запрос пользователя и направить его к правильному специалисту.

Доступные специалисты:
1. "chef" — Шеф-повар: рецепты, кулинарные советы, ингредиенты, меню, приготовление блюд
2. "accountant" — Учётчик: финансовые отчёты, учёт, затраты, выручка, прибыль, налоги
3. "researcher" — Исследователь: рыночные тренды, анализ, конкурентная разведка, поиск данных, аналитика
4. "media_studio" — Медиа-студия: изображения, видео, промо-контент, баннеры, посты, маркетинговые тексты

Верни строго одно значение: chef | accountant | researcher | media_studio.
Если запрос неясен, выбери наиболее подходящего по смыслу.`;

// Heuristic keyword-based classifier (primary) with LLM fallback
type AgentKey = 'chef' | 'accountant' | 'researcher' | 'media_studio';

const AGENT_KEYWORDS: Record<AgentKey, string[]> = {
  chef: [
    'рецепт','ингредиент','меню','блюд','повар','кулин','приготов','гарнир','соус',
    'печь','жарь','маринад','калори','специ','вкус','шашлык','салат','суп','десерт',
    'dessert','recipe','ingredient','cook','cooking','menu','chef','kitchen'
  ],
  accountant: [
    'финанс','отчет','отчёт','учет','учёт','затрат','выруч','прибыл','себестоим',
    'маржа','налог','бюджет','движение денег','касс','платеж','платёж','инвойс',
    'invoice','ledger','balance','profit','loss','revenue','expense','sql','cost'
  ],
  researcher: [
    'исслед','анализ','тренд','рынок','конкурент','данн','статист','отрасл','обзор',
    'market','trend','research','analy','benchmark','data','insight','survey',
    'спрос','предложен','цен','поставщик','vendor'
  ],
  media_studio: [
    'изображ','картин','фото','видео','баннер','реклам','пост','соцсет','рендер',
    'логотип','обложк','визуал','генерац','prompt','image','photo','video','banner',
    'ad','social','media','thumbnail','poster','visual'
  ]
} as const;

function classifyByKeywords(text: string): {
  agent: AgentKey | null;
  matches: Record<AgentKey, number>;
  bestScore: number;
  secondBest: number;
} {
  const t = (text || '').toLowerCase();
  const scores: Record<AgentKey, number> = {
    chef: 0, accountant: 0, researcher: 0, media_studio: 0
  };
  (Object.keys(AGENT_KEYWORDS) as AgentKey[]).forEach((agent) => {
    for (const kw of AGENT_KEYWORDS[agent]) {
      if (t.includes(kw)) scores[agent]++;
    }
  });
  const sorted = (Object.entries(scores) as [AgentKey, number][])
    .sort((a, b) => b[1] - a[1]);
  const [bestAgent, bestScore] = sorted[0];
  const secondBest = sorted[1]?.[1] ?? 0;
  const agent = bestScore > 0 ? bestAgent : null;
  return { agent, matches: scores, bestScore, secondBest };
}

function normalizeAgentName(name: string): AgentKey | null {
  const n = (name || '').toLowerCase().trim();
  if (n.includes('media')) return 'media_studio';
  if (n.includes('account')) return 'accountant';
  if (n.includes('chef') || n.includes('повар') || n.includes('шеф')) return 'chef';
  if (n.includes('research') || n.includes('аналит') || n.includes('исслед')) return 'researcher';
  switch (n) {
    case 'media_studio':
    case 'media-studio':
    case 'медиа':
    case 'медиа студия':
    case 'медиа-студия':
      return 'media_studio';
    case 'accountant':
    case 'бухгалтер':
    case 'учетчик':
    case 'учётчик':
      return 'accountant';
    case 'chef':
    case 'повар':
    case 'шеф':
      return 'chef';
    case 'researcher':
    case 'аналитик':
    case 'исследователь':
      return 'researcher';
    default:
      return null;
  }
}

const CHEF_PROMPT = `Ты - Шеф-повар в ресторане в Берлине, Германия. Ты эксперт в кулинарии, рецептах, ингредиентах и управлении кухней.
Отвечай на русском языке. Будь дружелюбным, профессиональным и давай практические советы по приготовлению блюд.`;

const ACCOUNTANT_PROMPT = `Ты - Учётчик/финансовый специалист в ресторане. Ты эксперт в финансовом анализе, отчётности, учёте затрат и выручки.
Отвечай на русском языке. Будь точным, аналитичным и предоставляй ясные финансовые инсайты.`;

const RESEARCHER_PROMPT = `Ты - Исследователь рынка и данных для ресторанного бизнеса. Проводишь анализ трендов, конкурентов, цен, поставщиков, спроса и предпочтений гостей.
Отвечай на русском языке. Давай структурированные инсайты, рекомендуй шаги проверки гипотез и по возможности указывай источники.`;

const MEDIA_STUDIO_PROMPT = `Ты - Креативный специалист медиа-студии ресторана. Генерируй промо-идеи, тексты для постов и детальные промпты для генераторов изображений/видео.
Отвечай на русском языке. Не создавай изображения, возвращай только текстовые идеи/бриф/промпты.`;

// Узел Оркестратора
export async function orchestratorNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || lastMessage.role !== 'user') {
    return { agentOutcome: 'error', currentAgent: 'none' };
  }

  const text = lastMessage.content || '';

  // 1) Heuristic classification by keywords
  const heuristic = classifyByKeywords(text);
  const confident =
    heuristic.agent !== null &&
    (heuristic.bestScore >= 2 || (heuristic.bestScore >= 1 && heuristic.secondBest === 0));

  if (confident && heuristic.agent) {
    const selected = heuristic.agent;
    return {
      agentOutcome: selected,
      currentAgent: selected,
      usedModel: 'heuristic',
      metadata: {
        orchestratorMethod: 'heuristic',
        orchestratorDecision: selected,
        keywordMatches: heuristic.matches,
        originalQuery: text
      }
    };
  }

  // 2) Fallback to LLM intent classification
  try {
    const response = await openai.invoke([
      { role: 'system', content: ORCHESTRATOR_PROMPT },
      { role: 'user', content: text }
    ]);

    const raw = typeof response.content === 'string' ? response.content : String(response.content);
    const normalized =
      normalizeAgentName(raw) ??
      normalizeAgentName(raw.toLowerCase().trim()) ??
      null;

    const selected = normalized ?? (heuristic.agent ?? 'researcher');

    return {
      agentOutcome: selected,
      currentAgent: selected,
      usedModel: 'gpt-4-turbo-preview',
      metadata: {
        orchestratorMethod: 'llm_fallback',
        orchestratorDecision: selected,
        llmRawChoice: raw,
        keywordMatches: heuristic.matches,
        originalQuery: text
      }
    };
  } catch (error) {
    console.error('Orchestrator error:', error);
    // Final fallback: prefer heuristic if any, else researcher
    const selected = heuristic.agent ?? 'researcher';
    return {
      agentOutcome: selected,
      currentAgent: selected,
      usedModel: 'heuristic',
      metadata: {
        orchestratorMethod: 'error_fallback',
        keywordMatches: heuristic.matches,
        error: error instanceof Error ? error.message : 'Unknown error',
        originalQuery: text
      }
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
// Узел Исследователя
export async function researcherNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];

  if (!lastMessage || lastMessage.role !== 'user') {
    return { agentOutcome: 'error' };
  }

  try {
    const response = await openai.invoke([
      { role: 'system', content: RESEARCHER_PROMPT },
      { role: 'user', content: lastMessage.content }
    ]);

    const content = typeof response.content === 'string' ? response.content : String(response.content);

    const assistantMessage = {
      role: 'assistant' as const,
      content,
      agent: 'researcher',
      model: 'gpt-4-turbo-preview'
    };

    return {
      messages: [...state.messages, assistantMessage],
      agentOutcome: 'complete',
      usedModel: 'gpt-4-turbo-preview'
    };
  } catch (error) {
    console.error('Researcher node error:', error);
    return {
      agentOutcome: 'error',
      metadata: { error: error instanceof Error ? error.message : 'Researcher node error' }
    };
  }
}

// Узел Медиа-студии
export async function mediaStudioNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];

  if (!lastMessage || lastMessage.role !== 'user') {
    return { agentOutcome: 'error' };
  }

  try {
    const response = await openai.invoke([
      { role: 'system', content: MEDIA_STUDIO_PROMPT },
      { role: 'user', content: lastMessage.content }
    ]);

    const content = typeof response.content === 'string' ? response.content : String(response.content);

    const assistantMessage = {
      role: 'assistant' as const,
      content,
      agent: 'media_studio',
      model: 'gpt-4-turbo-preview'
    };

    return {
      messages: [...state.messages, assistantMessage],
      agentOutcome: 'complete',
      usedModel: 'gpt-4-turbo-preview'
    };
  } catch (error) {
    console.error('Media Studio node error:', error);
    return {
      agentOutcome: 'error',
      metadata: { error: error instanceof Error ? error.message : 'Media Studio node error' }
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
    case 'researcher':
      return 'researcher_node';
    case 'media_studio':
      return 'media_studio_node';
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

    let result: Partial<GraphStateType> = {};
    switch (orchestratorResult.currentAgent) {
      case 'chef':
        result = await chefNode(state);
        break;
      case 'accountant':
        result = await accountantNode(state);
        break;
      case 'researcher':
        result = await researcherNode(state);
        break;
      case 'media_studio':
        result = await mediaStudioNode(state);
        break;
      default:
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