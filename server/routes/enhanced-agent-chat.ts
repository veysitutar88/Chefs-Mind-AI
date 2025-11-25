import express from 'express';
import { z } from 'zod';
import { agentOrchestrator } from '../agents/orchestrator.js';

const router = express.Router();

// Схема валидации для запроса
const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Сообщение не может быть пустым'),
  userId: z.string().optional(),
  modelId: z.string().optional(), // Added for Block 2 (Model Switcher)
});

// Схема валидации для ответа
const ChatResponseSchema = z.object({
  response: z.string(),
  agent: z.enum(['Chef', 'Accountant', 'Researcher', 'Media', 'Quality']),
  intent: z.enum(['cooking', 'finance', 'research', 'media', 'qa']),
  reasoning: z.string(),
  latency: z.number(),
});

// POST /api/enhanced-agent/chat
router.post('/chat', async (req, res) => {
  try {
    // Валидация входных данных
    const { message, userId, modelId } = ChatRequestSchema.parse(req.body);

    // TODO: Pass modelId to agentOrchestrator.routeRequest when it supports it.
    // Currently, the orchestrator decides the model based on intent/agent config,
    // but we should allow overriding it with modelId if provided.
    // console.log(`[EnhancedAgent] Requesting model override: ${modelId}`);

    // Проксирование запроса через оркестратор
    const result = await agentOrchestrator.routeRequest(message);

    // Подготовка ответа с метаданными о маршрутизации
    const response = {
      response: `${result.agent}: "${message}". Классифицировано как: ${result.intent}.`,
      agent: result.agent,
      intent: result.intent,
      reasoning: result.reasoning,
      latency: Date.now() - Date.now(), // Будет исправлено ниже
    };

    const startTime = Date.now();

    // Временная заглушка - задержка для имитации обработки
    // В реальном сценарии здесь был бы вызов соответствующего агента
    await new Promise(resolve => setTimeout(resolve, 100));

    // Вычисление фактической латентности
    const latency = Date.now() - startTime;
    response.latency = latency;

    // Валидация ответа перед отправкой
    const validatedResponse = ChatResponseSchema.parse(response);

    // Возвращаем ответ с дополнительными заголовками для мониторинга
    res.set({
      'X-Agent-Used': validatedResponse.agent,
      'X-Intent-Detected': validatedResponse.intent,
      'X-Processing-Latency': `${validatedResponse.latency}ms`,
    });

    // Имитируем QA-Gate проверку (в реальном сценарии здесь был бы вызов QA-Gate middleware)
    const qaResult = {
      score: Math.floor(Math.random() * 20) + 80, // Случайная оценка от 80 до 100
      corrected: false
    };

    // Если оценка ниже 85, считаем ответ требующим коррекции
    if (qaResult.score < 85) {
      qaResult.corrected = true;
      res.set('X-QA-Correction', 'true');
    }

    // Возвращаем ответ в структуре, ожидаемой тестами
    res.json({
      ok: true,
      response: validatedResponse.response,
      agent: validatedResponse.agent,
      intent: validatedResponse.intent,
      reasoning: validatedResponse.reasoning,
      latency: validatedResponse.latency,
      qa: qaResult,
    });
  } catch (error) {
    // Обработка ошибок валидации или обработки
    console.error('Ошибка при обработке запроса:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Ошибка валидации данных',
        details: error.errors,
      });
    }

    // Общая ошибка сервера
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось обработать запрос. Пожалуйста, попробуйте позже.',
    });
  }
});

// GET /api/enhanced-agent/cache-stats
router.get('/cache-stats', (req, res) => {
  try {
    const stats = agentOrchestrator.getCacheStats();

    res.json({
      ok: true,
      data: {
        cacheSize: stats.size,
        cacheHitRate: stats.hitRate,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Ошибка при получении статистики кэша:', error);

    res.status(500).json({
      ok: false,
      error: 'Не удалось получить статистику кэша',
    });
  }
});

// GET /api/enhanced-agent/health
router.get('/health', async (req, res) => {
  try {
    const agentsHealth = await agentOrchestrator.checkAgentHealth();

    res.json({
      ok: true,
      data: {
        orchestrator: 'healthy',
        agents: agentsHealth,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Ошибка при проверке состояния агентов:', error);

    res.status(500).json({
      ok: false,
      error: 'Не удалось проверить состояние агентов',
    });
  }
});

export default router;