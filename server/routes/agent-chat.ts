import { Router } from 'express';
import { processWithAgents } from '../graph/demo-graph.js';
import { z } from 'zod';

const router = Router();

// Схема для валидации запроса
const ChatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
});

// Тип для потокового ответа
interface StreamChunk {
  type: 'content' | 'metadata' | 'error' | 'complete';
  data?: any;
  content?: string;
  agent?: string;
  model?: string;
  error?: string;
}

// Функция для потоковой передачи ответа
async function* streamAgentResponse(message: string): AsyncGenerator<StreamChunk> {
  try {
    // Сначала отправляем метаданные о выборе агента
    const agentChoice = await determineAgent(message);
    yield {
      type: 'metadata',
      agent: agentChoice.agent,
      model: agentChoice.model,
      data: agentChoice.metadata
    };

    // Затем обрабатываем сообщение через агента
    const result = await processWithAgents(message);
    
    // Отправляем контент по частям для имитации streaming
    const content = result.content;
    const chunkSize = 10; // Отправляем по 10 символов за раз
    
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      yield {
        type: 'content',
        content: chunk,
        agent: result.agent,
        model: result.model
      };
      
      // Небольшая задержка для имитации real-time генерации
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Отправляем сигнал завершения
    yield {
      type: 'complete',
      agent: result.agent,
      model: result.model
    };

  } catch (error) {
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Улучшенная функция для определения агента
async function determineAgent(message: string): Promise<{
  agent: string;
  model: string;
  metadata: any;
}> {
  const lowerMessage = message.toLowerCase();
  
  // Ключевые слова для шефа
  const chefKeywords = [
    'рецепт', 'кухня', 'блюдо', 'ингредиент', 'приготовить', 'готовка', 'меню', 'шеф', 
    'вкус', 'еда', 'борщ', 'суп', 'мясо', 'рыба', 'овощи', 'десерт', 'напиток', 'завтрак',
    'обед', 'ужин', 'закуска', 'салат', 'гарнир', 'соус', 'специи', 'пекарня', 'конdитer'
  ];
  
  // Ключевые слова для учётчика
  const accountantKeywords = [
    'финанс', 'деньги', 'отчет', 'учет', 'стоимость', 'выручка', 'затраты', 'бюджет', 
    'статистика', 'доход', 'прибыль', 'расход', 'цена', 'себестоимость', 'маржа', 'налог',
    'продажа', 'клиент', 'чек', 'касса', 'инвентаризация', 'склад', 'поставщик', 'закупка',
    'анализ', 'показатель', 'график', 'таблица', 'данные', 'месяц', 'квартал', 'год'
  ];
  
  let chefScore = 0;
  let accountantScore = 0;
  
  // Подсчёт очков
  chefKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) chefScore += 2;
  });
  
  accountantKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) accountantScore += 2;
  });
  
  // Дополнительные эвристики
  if (lowerMessage.includes('сколько стоит') || lowerMessage.includes('цена')) {
    accountantScore += 3;
  }
  
  if (lowerMessage.includes('как приготовить') || lowerMessage.includes('как сделать')) {
    chefScore += 3;
  }
  
  // Выбор агента
  let agent = 'chef'; // по умолчанию
  let model = 'gpt-4-turbo-preview';
  
  if (accountantScore > chefScore) {
    agent = 'accountant';
    model = 'gemini-2.0-flash-exp';
  }
  
  return {
    agent,
    model,
    metadata: {
      orchestratorDecision: agent,
      originalQuery: message,
      chefScore,
      accountantScore,
      heuristicRouting: true,
      improved: true
    }
  };
}

// Основной эндпоинт для чата с агентами
router.post('/chat', async (req, res) => {
  try {
    const { message } = ChatRequestSchema.parse(req.body);

    // Установка заголовков для потоковой передачи
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    // Потоковая передача ответа
    const stream = streamAgentResponse(message);
    
    for await (const chunk of stream) {
      const data = JSON.stringify(chunk);
      res.write(`data: ${data}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Agent chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Эндпоинт для получения информации о доступных агентах
router.get('/agents', (req, res) => {
  res.json({
    agents: [
      {
        id: 'chef',
        name: 'Шеф-повар',
        description: 'Специалист по кулинарии, рецептам и управлению кухней',
        model: 'GPT-4 Turbo',
        capabilities: ['Рецепты', 'Советы по приготовлению', 'Меню', 'Ингредиенты']
      },
      {
        id: 'accountant',
        name: 'Учётчик',
        description: 'Финансовый специалист по отчётности и анализу',
        model: 'Gemini 2.0 Flash',
        capabilities: ['Финансовые отчеты', 'Анализ затрат', 'Бюджетирование', 'Статистика']
      }
    ]
  });
});

export default router;