import { StateGraph, END, START } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
5. "quality" - Контроль качества: проверка фактов, коррекция ошибок

Проанализируй запрос и верни имя специалиста. Если запрос сложный, выбери основного агента.`;

const CHEF_PROMPT = `Ты - Шеф-повар в ресторане в Берлине. Эксперт в кулинарии, рецептах, управлении кухней. Отвечай на русском языке. Можешь запрашивать генерацию изображений блюд через медиа-агента.`;

const ACCOUNTANT_PROMPT = `Ты - Учётчик/финансовый специалист. Эксперт в финансах, отчётности, Google Calendar, Google Docs, Google Sheets. Отвечай на русском языке. Можешь работать с документами и таблицами.`;

const RESEARCHER_PROMPT = `Ты - Исследователь. Эксперт по поиску информации, анализу трендов, исследованиям рынка. Используй актуальные данные и источники. Отвечай на русском языке.`;

const MEDIA_PROMPT = `Ты - Медиа-продюсер. Эксперт по генерации изображений (DALL-E 3, GPT Image) и видео (Imagen 3, Veo 3). Отвечай на русском языке. Запрашивай улучшение промптов при необходимости.`;

const QUALITY_PROMPT = `Ты - Контроль качества. Проверяешь факты, корrектируешь ошибки, обеспечиваешь точность информации. Отвечай на русском языке.`;

// Создание улучшенного графа - временно отключаем из-за проблем с LangGraph API
export function createEnhancedAgentGraph() {
  // Временно возвращаем заглушку, так как LangGraph API несовместим
  return {
    stream: async (state: any) => {
      // Временная реализация без LangGraph
      throw new Error('LangGraph temporarily disabled - using direct implementation');
    },
    invoke: async (state: any) => {
      // Временная прямая реализация
      return { ...state, agentOutcome: 'complete' };
    }
  };
}