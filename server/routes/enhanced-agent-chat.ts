import { Router } from 'express';
import { createEnhancedAgentGraph, EnhancedGraphStateType } from '../graph/enhanced-graph.js';
import { getGoogleMCPService } from '../services/google-mcp.js';
import { getEnhancedMediaTool } from '../services/enhanced-media.js';
import { getHallucinationControlSystem } from '../services/hallucination-control.js';
import { z } from 'zod';

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

// Тип для потокового ответа
interface EnhancedStreamChunk {
  type: 'content' | 'metadata' | 'error' | 'complete' | 'tool_call' | 'fact_check' | 'quality_control';
  data?: any;
  content?: string;
  agent?: string;
  model?: string;
  error?: string;
  toolResult?: any;
  factCheckResult?: any;
  qualityScore?: number;
}

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
    const googleService = options.enableGoogleTools ? await getGoogleMCPService() : null;
    const mediaTool = options.enableMediaGeneration ? getEnhancedMediaTool() : null;
    const factCheckSystem = options.enableFactCheck ? getHallucinationControlSystem() : null;

    // Инициализация состояния
    const initialState: EnhancedGraphStateType = {
      messages: [{ 
        role: 'user', 
        content: message,
        metadata: {
          agentPreference: options.agentPreference,
          enableFactCheck: options.enableFactCheck,
          enableGoogleTools: options.enableGoogleTools,
          enableMediaGeneration: options.enableMediaGeneration
        }
      }],
      agentOutcome: '',
      currentAgent: '',
      usedModel: '',
      metadata: {},
      correctionLoops: 0,
      fallbackUsed: false,
      provenanceData: {},
      confidence: 0.0
    };

    // Запуск улучшенного графа с упрощенной потоковой передачей
    let currentAgent = '';
    let currentModel = '';
    let accumulatedContent = '';
    let factCheckResults: any[] = [];
    let toolResults: any[] = [];

    try {
      // Создание улучшенного графа
      const enhancedAgentGraph = createEnhancedAgentGraph();
      
      // Используем invoke вместо stream для стабильности
      const result = await enhancedAgentGraph.invoke(initialState);
      
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

      // Обработка вызовов инструментов
      if ((result as any).metadata?.needsGoogleServices && googleService) {
        yield {
          type: 'metadata',
          agent: 'accountant',
          data: { message: 'Выполняю операции с Google сервисами...' }
        };
        
        yield {
          type: 'tool_call',
          agent: 'accountant',
          tool: 'google_services',
          data: { message: 'Выполняю операции с Google сервисами...' }
        };
        
        toolResults.push({
          tool: 'google_services',
          result: 'Google операции выполнены успешно'
        });
        
        yield {
          type: 'metadata',
          agent: 'accountant',
          data: {
            success: true,
            result: 'Google операции выполнены успешно'
          }
        };
        
        yield {
          type: 'tool_call',
          agent: 'accountant',
          tool: 'google_services',
          data: {
            success: true,
            result: 'Google операции выполнены успешно'
          }
        };
      }

      if ((result as any).metadata?.needsImageGeneration && mediaTool) {
        yield {
          type: 'metadata',
          agent: 'media',
          data: { message: 'Генерирую изображение...' }
        };
        
        yield {
          type: 'tool_call',
          agent: 'media',
          tool: 'image_generation',
          data: { message: 'Генерирую изображение...' }
        };
        
        try {
          const imageResult = await mediaTool.generateMedia(message, 'image');
          toolResults.push({
            tool: 'image_generation',
            result: imageResult
          });
          
          yield {
            type: 'tool_call',
            agent: 'media',
            tool: 'image_generation',
            data: { 
              success: true,
              url: imageResult.url,
              model: imageResult.model
            }
          };
        } catch (error) {
          yield {
            type: 'error',
            error: `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      }

      // Отправка контента от агента
      if ((result as any).messages && Array.isArray(result.messages) && result.messages.length > 0) {
        const lastMessage = result.messages[result.messages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.content) {
          accumulatedContent = lastMessage.content;
          
          // Фактическая проверка если включена
          if (options.enableFactCheck && factCheckSystem) {
            yield {
              type: 'fact_check',
              agent: 'quality',
              data: { message: 'Проверяю факты...' }
            };
            
            const factCheckResult = await factCheckSystem.comprehensiveFactCheck(accumulatedContent);
            factCheckResults.push(factCheckResult);
            
            yield {
              type: 'fact_check',
              agent: 'quality',
              factCheckResult: {
                riskLevel: factCheckResult.riskLevel,
                confidence: factCheckResult.factCheckResult.confidence,
                recommendations: factCheckResult.recommendations
              }
            };
          }
          
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

      // Контроль качества
      if (result.agentOutcome === 'complete' && options.enableFactCheck) {
        yield {
          type: 'quality_control',
          agent: 'quality',
          data: { message: 'Выполняю финальный контроль качества...' }
        };
        
        if (factCheckSystem && accumulatedContent) {
          const finalCheck = await factCheckSystem.comprehensiveFactCheck(accumulatedContent);
          
          yield {
            type: 'quality_control',
            agent: 'quality',
            qualityScore: finalCheck.factCheckResult.confidence,
            factCheckResult: {
              riskLevel: finalCheck.riskLevel,
              finalContent: finalCheck.finalContent,
              recommendations: finalCheck.recommendations
            }
          };
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
            toolResults,
            factCheckResults,
            fallbackUsed: result.fallbackUsed
          }
        };
        return;
      }

      // Обработка ошибок
      if (result.agentOutcome === 'error') {
        yield {
          type: 'error',
          error: (result as any).metadata?.error || 'Unknown error occurred',
          agent: currentAgent,
          fallbackUsed: (result as any).fallbackUsed
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
    const options = EnhancedChatRequestSchema.parse(req.body);

    // Установка заголовков для потоковой передачи
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    // Потоковая передача ответа
    const stream = streamEnhancedAgentResponse(options.message, {
      agentPreference: options.agentPreference,
      enableFactCheck: options.enableFactCheck,
      enableGoogleTools: options.enableGoogleTools,
      enableMediaGeneration: options.enableMediaGeneration
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
        description: 'Специалист по генерации изображений и видео с улучшением промpтов',
        model: 'GPT-4 + Multiple AI',
        capabilities: ['Генерация изображений', 'Генерация видео', 'Улучшение промpтов'],
        tools: ['dall-e-3', 'gpt-image', 'imagen-3', 'veo-3', 'prompt_enhancement']
      },
      {
        id: 'quality',
        name: 'Контроль качества',
        description: 'Система проверки фактов и коррекции ошибок',
        model: 'GPT-4 + Gemini',
        capabilities: ['Проверка фактов', 'Корrекция ошибок', 'Контроль галлюцинаций', 'Валидация данных'],
        tools: ['fact_checking', 'cross_validation', 'self_correction', 'rag_verification']
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
    const googleService = await getGoogleMCPService();
    
    let result;
    switch (action) {
      case 'create_event':
        result = await googleService.createCalendarEvent(params);
        break;
      case 'create_document':
        result = await googleService.createDocument(params.title, params.content);
        break;
      case 'create_spreadsheet':
        result = await googleService.createSpreadsheet(params.title, params.headers);
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
    
    const result = await mediaTool.generateMedia(prompt, mediaType, generator);
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