# Agent Routing Design — Chef's Mind AI

## Overview

Этот документ описывает архитектуру и дизайн системы маршрутизации между мульти-агентами в проекте Chef's Mind AI.

## Architecture

### Multi-Agent Orchestration

Система использует архитектуру оркестратора для маршрутизации запросов между различными AI-агентами:

1. **Chef Agent** — Специалист по кухне и рецептам
2. **Accountant Agent** — Финансовый консультант
3. **Researcher Agent** — Исследователь рынка
4. **Media Agent** — Специалист по медиа-контенту
5. **Quality Agent** — Контроль качества

### Component Structure

```
server/
├── agents/
│   └── orchestrator.ts       # Оркестратор для маршрутизации
├── routes/
│   └── enhanced-agent-chat.ts # HTTP эндпоинт для чата
└── middleware/
    └── qaGate.ts             # QA-Gate middleware
```

## Agent Orchestrator

### Intent Classification

Оркестратор классифицирует запросы пользователей на основе ключевых слов и фраз:

#### Cooking Intent
- **Ключевые слова**: приготовить, рецепт, блюдо, кухня, вкус, специи
- **Связанный агент**: Chef Agent
- **Вес**: 1.0

#### Finance Intent  
- **Ключевые слова**: стоимость, цена, расходы, бюджет, экономия, затраты
- **Связанный агент**: Accountant Agent
- **Вес**: 1.0

#### Research Intent
- **Ключевые слова**: исследовать, анализ, статистика, данные, рынок, тренды
- **Связанный агент**: Researcher Agent
- **Вес**: 1.0

#### Media Intent
- **Ключевые слова**: фото, видео, изображение, создать, дизайн, оформить
- **Связанный агент**: Media Agent
- **Вес**: 1.0

#### Quality Intent
- **Ключевые слова**: качество, стандарт, проверка, оценка, критерии, хороший
- **Связанный агент**: Quality Agent
- **Вес**: 1.0

### Caching System

Для оптимизации производительности используется легковесный кэш:

- **Размер кэша**: Последние 3 запроса
- **Критерий схожести**: Алгоритм Левенштейна с порогом > 0.8
- **Структура данных**: MRU (Most Recently Used) список

### API Contract

#### Request Format
```json
{
  "message": "строка запроса пользователя",
  "context": "опциональный контекст",
  "userId": "опциональный ID пользователя"
}
```

#### Response Format
```json
{
  "response": "ответ от агента",
  "agent": "название агента",
  "intent": "классифицированное намерение",
  "confidence": 0.95,
  "qa": {
    "score": 0.9,
    "corrected": false,
    "corrections": []
  }
}
```

## HTTP Endpoints

### POST /api/enhanced-agent/chat

Основной эндпоинт для обработки запросов к мульти-агентной системе.

#### Flow

1. **Request Validation** — Проверка формата запроса
2. **Orchestration** — Маршрутизация через AgentOrchestrator
3. **Agent Response** — Получение ответа от соответствующего агента
4. **QA Gate** — Проверка качества ответа
5. **Response Formatting** — Форматирование финального ответа

#### Alias Route
- `/api/enhanced-agent-chat/chat` — Альтернативный маршрут

### Response Headers

- `X-QA-Correction: true` — Указывает, что ответ был скорректирован QA-Gate

## Quality Assurance (QA-Gate)

### Features

- **Auto-correction** — Автоматическая коррекция ответов
- **Scoring System** — Оценка качества ответов от 0 до 1
- **Correction Tracking** — Отслеживание примененных корректировок

### Metrics

- **QA Score** — Оценка качества ответа
- **Correction Count** — Количество примененных корректировок
- **Response Time** — Время обработки запроса

## Frontend Integration

### UI Components

1. **Agent Display** — Отображение активного агента с эмодзи и описанием
2. **Message Bubbles** — Сообщения с индикацией агента
3. **Status Indicators** — Индикаторы состояния системы

### State Management

```typescript
interface AgentInfo {
  name: string;
  displayName: string;
  emoji: string;
  color: string;
  description: string;
}

interface ChatMessage {
  id: string;
  text: string;
  type: 'system' | 'agent' | 'user';
  timestamp: number;
  agent?: string;
  intent?: string;
}
```

## Testing Strategy

### Unit Tests (Vitest)

1. **Intent Classification** — Тестирование классификации намерений
2. **Caching Logic** — Тестирование кэша и схожести
3. **Agent Selection** — Тестирование выбора агентов

### E2E Tests (Playwright)

1. **Route Testing** — Тестирование всех HTTP маршрутов
2. **Agent Routing** — Тестирование маршрутизации между агентами
3. **QA Integration** — Тестирование QA-Gate интеграции

## Performance Considerations

### Optimization Techniques

1. **Lightweight Caching** — Кэш только последних 3 запросов
2. **Efficient Similarity** — Быстрый алгоритм Левенштейна
3. **Minimal Dependencies** — Минимальное количество внешних зависимостей

### Monitoring

- **Response Times** — Время ответа для каждого агента
- **Cache Hit Rate** — Процент попаданий в кэш
- **Agent Utilization** — Статистика использования агентов

## Future Enhancements

### Planned Features

1. **Machine Learning Classification** — Более сложная классификация с ML
2. **Agent Performance Metrics** — Метрики производительности каждого агента
3. **Context Awareness** — Учет контекста предыдущих сообщений
4. **Multi-turn Conversations** — Поддержка многоходовых диалогов

### Scalability

- **Horizontal Scaling** — Возможность масштабирования по агентам
- **Load Balancing** — Распределение нагрузки между экземплярами агентов
- **Caching Strategies** — Более продвинутые стратегии кэширования

## Security Considerations

1. **Input Sanitization** — Очистка пользовательского ввода
2. **Rate Limiting** — Ограничение частоты запросов
3. **Authentication** — Аутентификация пользователей
4. **Data Privacy** — Защита конфиденциальных данных

## Conclusion

Система маршрутизации агентов обеспечивает эффективное распределение запросов между специализированными AI-агентами с поддержкой QA-контроля и оптимизацией производительности.