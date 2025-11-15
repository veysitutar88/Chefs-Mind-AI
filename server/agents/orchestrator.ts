import type { Agent } from '../graph/types.js';

export type IntentClass = 'cooking' | 'finance' | 'research' | 'media' | 'qa';

export interface IntentPattern {
  keywords: string[];
  intent: IntentClass;
  weight: number;
}

export interface RoutingDecision {
  agent: Agent;
  intent: IntentClass;
  confidence: number;
  reasoning: string;
}

export interface IntentCache {
  patterns: IntentPattern[];
  recent: Array<{ input: string; intent: IntentClass }>;
}

// Enhanced patterns with more sophisticated keyword matching
const INTENT_PATTERNS: IntentPattern[] = [
// Cooking patterns - специфичные кулинарные термины
{
  keywords: [
    'как приготовить', 'рецепт', 'ингредиенты', 'готовить', 'приготовить',
    'варка', 'жарка', 'запекание', 'кухня', 'кулинария', 'специи',
    'салат', 'суп', 'борщ', 'паста', 'пицца', 'омлет', 'оливье',
    'что приготовить', 'рецепт с', 'как сделать', 'что можно приготовить'
  ],
  intent: 'cooking',
  weight: 2.0
},
// Finance patterns - специфичные финансовые термины с ВЫСОКИМ приоритетом
{
  keywords: [
    'себестоимость', 'затраты', 'стоимость', 'цена', 'расходы', 'доходы',
    'прибыль', 'бюджет', 'финансы', 'калькуляция', 'смета', 'расчет',
    'калькуляция блюда', 'себестоимость рецепта', 'стоимость блюда',
    'экономия', 'окупаемость', 'инвестиция', 'доходность',
    'сколько стоит', 'рассчитать затраты', 'себестоимость ингредиентов', 'цена за',
    'как рассчитать затраты на рецепт', 'подсчитай стоимость', 'финансовый расчет',
    'затраты на рецепт', 'финансовый', 'расчет затрат'
  ],
  intent: 'finance',
  weight: 2.5
},
// Research patterns - специфичные исследовательские термины
{
  keywords: [
    'исследовать', 'анализ', 'анализировать', 'тренды', 'статистика',
    'данные', 'исследование', 'рынок', 'конкуренты', 'отчет',
    'исследуй рынок', 'анализ конкурентов', 'тренды в ресторанном бизнесе',
    'статистика продаж', 'обзор', 'аналитика'
  ],
  intent: 'research',
  weight: 1.8
},
// Media patterns - специфичные медиа термины с МАКСИМАЛЬНЫМ приоритетом
{
  keywords: [
    'создай видео', 'сгенерируй изображение', 'видео рецепта',
    'video', 'видео', 'dalle', 'imagen', 'фото', 'картинка',
    'медиа', 'контент', 'дизайн', 'оформить меню', 'сделать фото',
    'визуал', 'композиция', 'стиль', 'сделай фото рецепта',
    'создай изображение', 'сделать фото рецепта', 'сгенерируй видео', 'оформить меню', 'оформи меню',
    'сгенерируй изображение блюда', 'создай изображение блюда', 'создай медиа', 'создай картинку',
    'сгенерируй', 'генерация', 'generate', 'создай контент', 'создай визуал'
  ],
  intent: 'media',
  weight: 3.0
},
// QA patterns - только вопросы о качестве и определения с НИЗКИМ приоритетом
{
  keywords: [
    'что такое', 'что такое хороший', 'как выбрать', 'что лучше',
    'качество', 'оценка', 'проверка', 'стандарт', 'критерии',
    'хороший рецепт', 'лучший', 'как определить'
  ],
  intent: 'qa',
  weight: 0.5
}
];

export class AgentOrchestrator {
  private cache: IntentCache = {
    patterns: INTENT_PATTERNS,
    recent: []
  };

  /**
   * Анализирует запрос пользователя и определяет соответствующего агента
   */
  public async routeRequest(input: string): Promise<RoutingDecision> {
    const normalizedInput = input.toLowerCase().trim();
    
    // Check cache first for recent patterns
    const cachedIntent = this.checkCache(normalizedInput);
    if (cachedIntent) {
      const agent = this.getAgentForIntent(cachedIntent);
      return {
        agent,
        intent: cachedIntent,
        confidence: 0.8,
        reasoning: 'Отвечено на основе кэшированного паттерна (из 3 последних запросов)'
      };
    }

    // Perform detailed intent classification
    const intentScore = this.classifyIntent(normalizedInput);
    
    // Update cache with new pattern
    this.updateCache(normalizedInput, intentScore.intent);
    
    const agent = this.getAgentForIntent(intentScore.intent);
    
    return {
      agent,
      intent: intentScore.intent,
      confidence: intentScore.confidence,
      reasoning: intentScore.reasoning
    };
  }

  /**
   * Классифицирует намерение пользователя на основе ключевых слов
   */
  private classifyIntent(input: string): { intent: IntentClass; confidence: number; reasoning: string } {
    let bestMatch: IntentPattern | null = null;
    let bestScore = 0;
    const matchedKeywords: string[] = [];

    // Calculate score for each pattern
    for (const pattern of this.cache.patterns) {
      let score = 0;
      const foundKeywords: string[] = [];

      for (const keyword of pattern.keywords) {
        if (input.includes(keyword)) {
          foundKeywords.push(keyword);
          score += pattern.weight;
        }
      }

      // Add bonus for multiple keyword matches
      if (foundKeywords.length > 1) {
        score += foundKeywords.length * 0.2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
        matchedKeywords.splice(0, matchedKeywords.length, ...foundKeywords);
      }
    }

    if (!bestMatch) {
      return {
        intent: 'qa',
        confidence: 0.3,
        reasoning: 'Не удалось классифицировать запрос, использован QA агент как резервный'
      };
    }

    // Adjust confidence based on score strength
    let confidence = Math.min(0.95, bestScore / 3.0);
    
    // Boost confidence for cooking/finance keywords (restaurant domain specific)
    if (bestMatch.intent === 'cooking' || bestMatch.intent === 'finance') {
      confidence += 0.1;
    }

    const reasoning = `Обнаружены ключевые слова: [${matchedKeywords.join(', ')}]; Классифицировано как: ${bestMatch.intent}`;

    return {
      intent: bestMatch.intent,
      confidence: Math.min(0.95, confidence),
      reasoning
    };
  }

  /**
   * Возвращает агента для соответствующего намерения
   */
  private getAgentForIntent(intent: IntentClass): Agent {
    const agentMapping: Record<IntentClass, Agent> = {
      'cooking': 'Chef',
      'finance': 'Accountant', 
      'research': 'Researcher',
      'media': 'Media',
      'qa': 'Quality'
    };

    return agentMapping[intent];
  }

  /**
   * Проверяет кэш на наличие недавних паттернов
   */
  private checkCache(input: string): IntentClass | null {
    // Проверяем наличие входного сообщения в кэше (с проверкой схожести)
    for (const item of this.cache.recent) {
      if (this.calculateSimilarity(input, item.input) > 0.8) {
        return item.intent;
      }
    }
    return null;
  }

  /**
   * Обновляет кэш с новым паттерном, храня только последние 3 элемента
   */
  private updateCache(input: string, intent: IntentClass): void {
    // Удаляем любые существующие записи для этого же ввода
    this.cache.recent = this.cache.recent.filter(item =>
      this.calculateSimilarity(input, item.input) < 0.8
    );
    
    // Добавляем новую запись в начало массива
    this.cache.recent.unshift({ input, intent });
    
    // Сохраняем только последние 3 записи
    if (this.cache.recent.length > 3) {
      this.cache.recent.pop();
    }
  }

  /**
   * Вычисляет схожесть двух строк (0 - разные, 1 - одинаковые)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Исправлено: теперь возвращаем корректное значение схожести
    // (1 - (расстояние / длина_более_длинной_строки))
    return 1 - (this.levenshteinDistance(longer, shorter) / longer.length);
  }

  /**
   * Рассчитывает расстояние Левенштейна между двумя строками
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,      // insertion
          matrix[j - 1][i] + 1,      // deletion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Возвращает статистику кэша для мониторинга
   */
  public getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.recent.length,
      hitRate: 0 // Will be implemented when we add hit tracking
    };
  }

  /**
   * Проверяет доступность агентов
   */
  public async checkAgentHealth(): Promise<Record<Agent, boolean>> {
    // Mock implementation - in real scenario would ping each agent
    return {
      'Chef': true,
      'Accountant': true,
      'Researcher': true,
      'Media': true,
      'Quality': true
    };
  }
}

/**
 * Главная функция для маршрутизации сообщений
 */
export async function routeMessage(input: string, userId?: string): Promise<{
  response: string;
  agent: Agent;
  intent: IntentClass;
  reasoning: string;
  latency: number;
}> {
  const startTime = Date.now();
  
  try {
    const routingDecision = await agentOrchestrator.routeRequest(input);
    
    // Временная заглушка - используем существующие агенты
    let response = '';
    
    switch (routingDecision.agent) {
      case 'Chef':
        response = `Ответ от Chef: "${input}". Классифицировано как: ${routingDecision.intent}.`;
        break;
      case 'Accountant':
        response = `Ответ от Accountant: "${input}". Классифицировано как: ${routingDecision.intent}.`;
        break;
      case 'Researcher':
        response = `Ответ от Researcher: "${input}". Классифицировано как: ${routingDecision.intent}.`;
        break;
      case 'Media':
        response = `Ответ от Media: "${input}". Классифицировано как: ${routingDecision.intent}.`;
        break;
      case 'Quality':
        response = `Ответ от Quality: "${input}". Классифицировано как: ${routingDecision.intent}.`;
        break;
      default:
        response = `Общий ответ на: "${input}". Классифицировано как: ${routingDecision.intent}.`;
    }
    
    const latency = Date.now() - startTime;
    
    return {
      response,
      agent: routingDecision.agent,
      intent: routingDecision.intent,
      reasoning: routingDecision.reasoning,
      latency
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    
    return {
      response: `Извините, произошла ошибка при обработке запроса: "${input}"`,
      agent: 'Quality',
      intent: 'qa',
      reasoning: 'Fallback due to error',
      latency
    };
  }
}

// Export singleton instance
export const agentOrchestrator = new AgentOrchestrator();