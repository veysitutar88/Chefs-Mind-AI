import { Router } from 'express';
import { enhancedAgentGraph } from '../graph/enhanced-graph.js';
import { listCalendars, createDoc, createSheet } from '../services/google-mcp.js';
import { getEnhancedMediaTool } from '../services/enhanced-media.js';
import { getHallucinationControlSystem } from '../services/hallucination-control.js';
import { z } from 'zod';
import { EnhancedStreamChunk, EnhancedGraphState, MediaGenerationResult } from '../../shared/types.js';

const router = Router();

// Схема для валидации запроса
const EnhancedChatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  agentPreference: z.enum(['chef', 'accountant', 'researcher', 'media', 'quality', 'auto']).optional(),
  enableFactCheck: z.boolean().optional().default(true),
  enableGoogleTools: z.boolean().optional().default(false),
  enableMediaGeneration: z.boolean().optional().default(false),
});

// Функция для потоковой передачи ответа с улучшенной логикой
async function* streamEnhancedAgentResponse(
  message: string, 
  options: {
    agentPreference?: string;
    enableFactCheck?: boolean;
    enableGoogleTools?: boolean;
    enableMediaGeneration?: boolean;
  }
): AsyncGenerator<EnhancedStreamChunk> {
  try {
    // Инициализация сервисов
    // const googleService = options.enableGoogleTools ? await getGoogleMCPService() : null;
    const mediaTool = options.enableMediaGeneration ? getEnhancedMediaTool() : null;
    const factCheckSystem = options.enableFactCheck ? getHallucinationControlSystem() : null;

    let currentAgent = '';
    let currentModel = '';
    let accumulatedContent = '';

    try {
      // Используем invoke вместо stream для стабильности
      // TODO: Refactor this type assertion
      const result: EnhancedGraphState = await enhancedAgentGraph.invoke(message, []) as unknown as EnhancedGraphState;
      
      // Отправка метаданных о выбранном агенте
      if (result.currentAgent && result.currentAgent !== currentAgent) {
        currentAgent = result.currentAgent;
        currentModel = result.usedModel || '';
        
        yield {
          type: 'metadata',
          agent: currentAgent,
          model: currentModel,
          data: {
            ...result.metadata,
            confidence: result.confidence,
            correctionLoops: result.correctionLoops,
            fallbackUsed: result.fallbackUsed
          }
        };
      }

      // Отправка контента от агента
      if (result.messages && result.messages.length > 0) {
        const lastMessage = result.messages[result.messages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.content) {
          accumulatedContent = lastMessage.content;
          
          // Отправляем контент по частям для имитации streaming
          const chunkSize = 20;
          for (let i = 0; i < accumulatedContent.length; i += chunkSize) {
            const chunk = accumulatedContent.slice(i, i + chunkSize);
            yield {
              type: 'content',
              content: chunk,
              agent: lastMessage.agent,
              model: lastMessage.model,
              qualityScore: result.confidence
            };
            
            // Небольшая задержка для имитации real-time
            await new Promise(resolve => setTimeout(resolve, 30));
          }
        }
      }

      // Завершение
      if (result.agentOutcome === 'complete') {
        yield {
          type: 'complete',
          agent: currentAgent,
          model: currentModel,
          data: {
            confidence: result.confidence,
            correctionLoops: result.correctionLoops,
            fallbackUsed: result.fallbackUsed
          }
        };
        return;
      }

      // Обработка ошибок
      if (result.agentOutcome === 'error') {
        // TODO: Refactor this type assertion
        const errorMetadata = result.metadata as { error?: string } || {};
        yield {
          type: 'error',
          error: errorMetadata.error || 'Unknown error occurred',
          agent: currentAgent,
          fallbackUsed: result.fallbackUsed
        };
        return;
      }

    } catch (error) {
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
      
  } catch (error) {
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Основной эндпоинт для улучшенного чата с агентами
router.post('/chat', async (req, res) => {
  try {
    const message = typeof req.body.message === 'string' ? req.body.message : req.body.message?.message || '';
    
    // Simple response for now
    const response = {
      success: true,
      response: `Enhanced agent response to: ${message}`,
      agent: 'enhanced-agent',
      model: 'default'
    };

    // Установка заголовков для потоковой передачи
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    // Потоковая передача ответа
    const stream = streamEnhancedAgentResponse(message, {
      agentPreference: req.body.agentPreference,
      enableFactCheck: req.body.enableFactCheck,
      enableGoogleTools: req.body.enableGoogleTools,
      enableMediaGeneration: req.body.enableMediaGeneration
    });
    
    for await (const chunk of stream) {
      const data = JSON.stringify(chunk);
      res.write(`data: ${data}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Enhanced agent chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Эндpoинт для получения информации о всех 5 агентах
router.get('/agents', (req, res) => {
  res.json({
    agents: [
      {
        id: 'chef',
        name: 'Шеф-повар',
        description: 'Специалист по кулинарии, рецептам и управлению кухней',
        model: 'GPT-4 Turbo',
        capabilities: ['Рецепты', 'Советы по приготовлению', 'Меню', 'Ингредиенты', 'Запрос изображений блюд'],
        tools: ['media_generation', 'recipe_analysis']
      },
      {
        id: 'accountant',
        name: 'Учётчик',
        description: 'Финансовый специалист по отчётности и анализу с доступом к Google сервисам',
        model: 'Gemini 2.0 Flash',
        capabilities: ['Финансовые отчеты', 'Анализ затрат', 'Бюджетирование', 'Статистика', 'Google Calendar', 'Google Docs', 'Google Sheets'],
        tools: ['google_calendar', 'google_docs', 'google_sheets', 'financial_analysis']
      },
      {
        id: 'researcher',
        name: 'Исследователь',
        description: 'Эксперт по поиску информации и анализу трендов',
        model: 'GPT-4 Turbo',
        capabilities: ['Поиск информации', 'Анализ трендов', 'Исследования рынка', 'Сбор данных'],
        tools: ['web_search', 'data_collection', 'trend_analysis']
      },
      {
        id: 'media',
        name: 'Медиа-продюсер',
        description: 'Специалист по генерации изображений и видео с улучшением промптов',
        model: 'GPT-4 + Multiple AI',
        capabilities: ['Генерация изображений', 'Генерация видео', 'Улучшение промптов'],
        tools: ['dall-e-3', 'gpt-image', 'imagen-3', 'veo-3', 'prompt_enhancement']
      },
      {
        id: 'quality',
        name: 'Контроль качества',
        description: 'Система проверки фактов и коррекции ошибок',
        model: 'GPT-4 + Gemini',
        capabilities: ['Проверка фактов', 'Коррекция ошибок', 'Контроль галлюцинаций', 'Валидация данных'],
        tools: ['fact_checking', 'cross-validation', 'self_correction', 'rag_verification']
      }
    ],
    features: [
      '5 специализированных агентов',
      'Многоуровневая защита от галлюцинаций',
      'Интеграция с Google сервисами',
      'Множественные генераторы медиа',
      'Улучшение промpтов GPT-5',
      'Emergency fallback механизмы',
      'Proven RAG система',
      'Self-correction loops'
    ]
  });
});

// Эндпоинт для тестирования Google MCP
router.post('/test-google-mcp', async (req, res) => {
  try {
    const { action, params } = req.body;
    // const googleService = await getGoogleMCPService();
    
    let result;
    switch (action) {
      case 'create_event':
        // result = await googleService.createCalendarEvent(params);
        throw new Error('Not implemented');
      case 'create_document':
        // result = await googleService.createDocument(params.title, params.content);
        throw new Error('Not implemented');
      case 'create_spreadsheet':
        // result = await googleService.createSpreadsheet(params.title, params.headers);
        throw new Error('Not implemented');
      case 'list_calendars':
        result = await listCalendars();
        break;
      case 'create_doc':
        result = await createDoc(params.title);
        break;
      case 'create_sheet':
        result = await createSheet(params.title);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Эндпоинт для тестирования Media Tool
router.post('/test-media', async (req, res) => {
  try {
    const { prompt, mediaType, generator } = req.body;
    const mediaTool = getEnhancedMediaTool();
    
    // TODO: Refactor this type assertion
    const result = await mediaTool.generateMedia({ prompt, generator }, mediaType) as unknown as MediaGenerationResult;
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Эндпоинт для тестирования системы контроля галлюцинаций
router.post('/test-fact-check', async (req, res) => {
  try {
    const { content, context } = req.body;
    const factCheckSystem = getHallucinationControlSystem();
    
    const result = await factCheckSystem.comprehensiveFactCheck(content, context);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;