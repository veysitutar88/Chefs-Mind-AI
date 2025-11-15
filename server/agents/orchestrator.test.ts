import { describe, it, expect, vi } from 'vitest';
import { agentOrchestrator } from './orchestrator.js';

// Мокаем console.log чтобы очистить вывод тестов
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AgentOrchestrator', () => {
  describe('classifyIntent', () => {
    it('должно классифицировать кулинарные запросы', () => {
      const result = agentOrchestrator.classifyIntent('Как приготовить борщ?');
      expect(result.intent).toBe('cooking');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('должно классифицировать финансовые запросы', () => {
      const result = agentOrchestrator.classifyIntent('Сколько стоит борщ?');
      expect(result.intent).toBe('finance');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('должно классифицировать исследовательские запросы', () => {
      const result = agentOrchestrator.classifyIntent('Какие тренды в ресторанном бизнесе?');
      expect(result.intent).toBe('research');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('должно классифицировать медиа-запросы', () => {
      const result = agentOrchestrator.classifyIntent('Создай изображение для меню');
      expect(result.intent).toBe('media');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('должно классифицировать QA-запросы', () => {
      const result = agentOrchestrator.classifyIntent('Проверь качество блюда');
      expect(result.intent).toBe('qa');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('должно давать результат с низкой уверенностью для неоднозначных запросов', () => {
      const result = agentOrchestrator.classifyIntent('Всем привет!');
      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeLessThan(0.8);
    });

    it('должно возвращать reasoning о выборе намерения', () => {
      const result = agentOrchestrator.classifyIntent('Как приготовить борщ?');
      expect(result.reasoning).toBeDefined();
      expect(result.reasoning).toContain('cooking');
    });
  });

  describe('getAgentForIntent', () => {
    it('должно сопоставлять намерения с агентами', () => {
      expect(agentOrchestrator.getAgentForIntent('cooking')).toBe('Chef');
      expect(agentOrchestrator.getAgentForIntent('finance')).toBe('Accountant');
      expect(agentOrchestrator.getAgentForIntent('research')).toBe('Researcher');
      expect(agentOrchestrator.getAgentForIntent('media')).toBe('Media');
      expect(agentOrchestrator.getAgentForIntent('qa')).toBe('Quality');
    });

    it('должно возвращать Chef по умолчанию для неизвестных намерений', () => {
      expect(agentOrchestrator.getAgentForIntent('unknown' as any)).toBe('Chef');
    });
  });

  describe('calculateSimilarity', () => {
    it('должно возвращать 1.0 для одинаковых строк', () => {
      expect(agentOrchestrator.calculateSimilarity('Test', 'Test')).toBe(1.0);
    });

    it('должно возвращать 0.0 для полностью разных строк', () => {
      expect(agentOrchestrator.calculateSimilarity('абвгд', 'xyz')).toBeLessThan(0.1);
    });

    it('должно возвращать высокое значение схожести для похожих строк', () => {
      expect(agentOrchestrator.calculateSimilarity('Создай меню', 'Создать меню')).toBeGreaterThan(0.7);
    });

    it('должно возвращать низкое значение схожести для мало похожих строк', () => {
      expect(agentOrchestrator.calculateSimilarity('Как приготовить', 'Сколько стоит')).toBeLessThan(0.3);
    });

    it('должно работать с разными регистрами', () => {
      expect(agentOrchestrator.calculateSimilarity('ТЕСТ', 'тест')).toBeGreaterThan(0.9);
    });
  });

  describe('кэширование', () => {
    it('checkCache должен находить похожий запрос', () => {
      // Первоначальный запрос
      agentOrchestrator.classifyIntent('Как приготовить борщ?');
      
      // Проверка кэша с похожим запросом
      const cachedResult = agentOrchestrator.checkCache('Как готовить борщ?');
      expect(cachedResult).toBeDefined();
      if (cachedResult) {
        expect(cachedResult.intent).toBe('cooking');
      }
    });

    it('checkCache должен возвращать null для нового, непохожего запроса', () => {
      agentOrchestrator.classifyIntent('Как приготовить борщ?');
      
      const cachedResult = agentOrchestrator.checkCache('Сколько стоит квартира?');
      expect(cachedResult).toBeNull();
    });

    it('updateCache должен добавлять новый элемент', () => {
      const initialSize = agentOrchestrator.getCacheStats().size;
      agentOrchestrator.updateCache('Тестовый запрос', 'cooking');
      expect(agentOrchestrator.getCacheStats().size).toBe(initialSize + 1);
    });

    it('кэш должен ограничиваться 3 элементами', () => {
      const testInputs = [
        'Как приготовить борщ?',
        'Сколько стоит борщ?',
        'Какие тренды в ресторанном бизнесе?',
        'Создай изображение для меню',
        'Проверь качество блюда'
      ];
      
      // Добавляем 5 элементов
      testInputs.forEach(input => {
        agentOrchestrator.updateCache(input, 'cooking');
      });
      
      // Кэш должен содержать только последние 3
      expect(agentOrchestrator.getCacheStats().size).toBe(3);
    });

    it('getCacheStats должен возвращать статистику кэша', () => {
      agentOrchestrator.updateCache('Тестовый запрос', 'cooking');
      const stats = agentOrchestrator.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');
    });
  });

  describe('routeRequest', () => {
    it('должно возвращать объект с информацией об агенте', () => {
      const result = agentOrchestrator.routeRequest('Как приготовить борщ?');
      expect(result).toHaveProperty('agent');
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('reasoning');
    });

    it('должно правильно маршрутизировать разные типы запросов', () => {
      const testCases = [
        { input: 'Как приготовить борщ?', expectedAgent: 'Chef' },
        { input: 'Сколько стоит борщ?', expectedAgent: 'Accountant' },
        { input: 'Какие тренды в ресторанном бизнесе?', expectedAgent: 'Researcher' },
        { input: 'Создай изображение для меню', expectedAgent: 'Media' },
        { input: 'Проверь качество блюда', expectedAgent: 'Quality' }
      ];
      
      testCases.forEach(({ input, expectedAgent }) => {
        const result = agentOrchestrator.routeRequest(input);
        expect(result.agent).toBe(expectedAgent);
      });
    });

    it('должно использовать кэширование при похожих запросах', () => {
      // Первый запрос
      agentOrchestrator.routeRequest('Как приготовить борщ?');
      
      // Спорим, что второй запрос, похожий на первый, будет кэширован
      const similarResult = agentOrchestrator.routeRequest('Как готовить борщ?');
      
      // Проверяем что результат согласован с первым запросом
      expect(similarResult.agent).toBe('Chef');
      expect(similarResult.intent).toBe('cooking');
    });
  });
});