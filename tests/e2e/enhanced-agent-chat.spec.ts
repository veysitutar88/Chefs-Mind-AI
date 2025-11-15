import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';

test.describe('Enhanced Agent Chat - Multi-Agent Routing', () => {
  test('должен маршрутизировать cooking запросы к агенту Chef', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
      data: {
        message: 'как приготовить пасту аль денте'
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('response');
    expect(data).toHaveProperty('qa');
    expect(data).toHaveProperty('agent');
    expect(data).toHaveProperty('intent');
    
    // Проверяем, что запрос был направлен к агенту Chef
    expect(data.agent).toBe('Chef');
    expect(data.intent).toBe('cooking');
  });

  test('должен маршрутизировать finance запросы к агенту Accountant', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
      data: {
        message: 'рассчитать себестоимость блюда'
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.agent).toBe('Accountant');
    expect(data.intent).toBe('finance');
  });

  test('должен маршрутизировать research запросы к агенту Researcher', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
      data: {
        message: 'проанализируй тренды кухонной техники'
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.agent).toBe('Researcher');
    expect(data.intent).toBe('research');
  });

  test('должен маршрутизировать media запросы к агенту Media', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
      data: {
        message: 'создай видео рецепта'
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.agent).toBe('Media');
    expect(data.intent).toBe('media');
  });

  test('должен маршрутизировать qa запросы к агенту Quality', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
      data: {
        message: 'что такое хороший рецепт'
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.agent).toBe('Quality');
    expect(data.intent).toBe('qa');
  });

  test('должен работать с алиасом маршрута /api/enhanced-agent-chat/chat', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/enhanced-agent-chat/chat`, {
      data: {
        message: 'как готовить суп'
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.agent).toBe('Chef');
    expect(data.intent).toBe('cooking');
  });

  test('должен возвращать QA-Gate метаданные', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
      data: {
        message: 'какие специи лучше для мяса'
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('qa');
    expect(data.qa).toHaveProperty('score');
    expect(data.qa).toHaveProperty('corrected');
    
    // Проверяем наличие заголовка QA-Correction если был корректировкой
    if (data.qa.corrected) {
      expect(response.headers()['x-qa-correction']).toBe('true');
    }
  });

  test('должен обрабатывать различные варианты cooking запросов', async ({ request }) => {
    const cookingVariants = [
      'приготовь борщ',
      'как сделать омлет',
      'рецепт салата оливье',
      'что можно приготовить из курицы'
    ];

    for (const message of cookingVariants) {
      const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
        data: { message }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.agent).toBe('Chef');
      expect(data.intent).toBe('cooking');
    }
  });

  test('должен обрабатывать различные варианты finance запросов', async ({ request }) => {
    const financeVariants = [
      'сколько стоит блюдо',
      'рассчитать затраты',
      'себестоимость ингредиентов',
      'цена за порцию'
    ];

    for (const message of financeVariants) {
      const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
        data: { message }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.agent).toBe('Accountant');
      expect(data.intent).toBe('finance');
    }
  });

  test('должен обрабатывать различные варианты research запросов', async ({ request }) => {
    const researchVariants = [
      'исследуй рынок',
      'анализ конкурентов',
      'тренды в ресторанном бизнесе',
      'статистика продаж'
    ];

    for (const message of researchVariants) {
      const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
        data: { message }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.agent).toBe('Researcher');
      expect(data.intent).toBe('research');
    }
  });

  test('должен обрабатывать различные варианты media запросов', async ({ request }) => {
    const mediaVariants = [
      'создай изображение блюда',
      'сделай фото рецепта',
      'сгенерируй видео',
      'оформи меню'
    ];

    for (const message of mediaVariants) {
      const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
        data: { message }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.agent).toBe('Media');
      expect(data.intent).toBe('media');
    }
  });

  test('должен возвращать ошибку для некорректных запросов', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
      data: {} // Пустой запрос
    });

    expect(response.status()).toBe(400);
  });

  test('должен возвращать ошибку для несуществующих маршрутов', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/enhanced-agent/nonexistent`, {
      data: {
        message: 'тестовый запрос'
      }
    });

    expect(response.status()).toBe(404);
  });

  test('должен обрабатывать запросы с заголовками авторизации', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/enhanced-agent/chat`, {
      data: {
        message: 'приготовь суп'
      },
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.agent).toBe('Chef');
    expect(data.intent).toBe('cooking');
  });
});