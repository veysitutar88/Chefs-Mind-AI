# Инструкция: Vibe Coding и Мультиагентное программирование с нейросетями 2.0 (РАСШИРЕННАЯ)
## Полное руководство для KiloCode, GPT, Gemini, Claude, LangGraph, CrewAI, n8n и облачных LLM

---

## Содержание

1. [Введение и философия](#введение-и-философия)
2. [Архитектура проекта и структура файлов](#архитектура-проекта-и-структура-файлов)
3. [Memory Bank: Система долгосрочной памяти](#memory-bank-система-долгосрочной-памяти)
4. [Сессии, чекпоинты и управление состоянием](#сессии-чекпоинты-и-управление-состоянием)
5. [Контекстное инжиниринг и оптимизация токенов](#контекстное-инжиниринг-и-оптимизация-токенов)
6. [Промпт-инжиниринг и постановка задач](#промпт-инжиниринг-и-постановка-задач)
7. [Тестирование, отладка и качество кода](#тестирование-отладка-и-качество-кода)
8. [Мультиагентные системы и оркестрация](#мультиагентные-системы-и-оркестрация)
9. [Обработка ошибок и рекавери-стратегии](#обработка-ошибок-и-рекавери-стратегии)
10. [Сравнение фреймворков: LangGraph vs CrewAI vs n8n](#сравнение-фреймворков)
11. [Практические примеры и шаблоны](#практические-примеры-и-шаблоны)
12. [Галлюцинации и защита от ошибок](#галлюцинации-и-защита-от-ошибок)

---

## Введение и философия

**Vibe Coding** — не просто генерация кода ИИ. Это парадигма, где ты остаешься архитектором, а нейросеть — мощным, но требующим управления инструментом. Ключ к успеху:

1. **Структурированная коммуникация** — чёткие задачи, промпты, контекст
2. **Долгосрочная память** — Memory Bank, документация, чекпоинты  
3. **Активная верификация** — тесты, review, отладка после генерации
4. **Модульность и разделение** — дроби задачи, изолируй контекст, параллелизм[65][71][150]

---

## Архитектура проекта и структура файлов

### 2.1 Базовая структура для KiloCode

```
my-project/
├── .kilocode/
│   ├── rules/
│   │   ├── memory-bank/
│   │   │   ├── brief.md                    # Краткое описание проекта
│   │   │   ├── product.md                  # Цели, задачи, описание продукта
│   │   │   ├── context.md                  # Текущий фокус, что делать дальше
│   │   │   ├── architecture.md             # Архитектура, паттерны, ключевые пути
│   │   │   ├── tag.md                      # Технологии, инструменты, конфигурация
│   │   │   ├── tasks.md                    # Документированные повторяющиеся задачи
│   │   │   └── changelog.md                # История значимых изменений
│   │   ├── memory-bank-instructions.md     # Инструкции для KiloCode по использованию памяти
│   │   └── PROJECT_SPEC.md                 # Обшие требования и стандарты
│   └── AI_SETUP.md                         # Инструкции для агентов о целях и ограничениях
│
├── .claude/
│   └── CLAUDE.md                           # Контекст и память для Claude сессий
│
├── .gemini/
│   └── GEMINI.md                           # Контекст и память для Gemini сессий
│
├── src/
│   ├── components/                         # React компоненты (если React)
│   ├── services/                           # Бизнес-логика и API вызовы
│   ├── utils/                              # Утилиты и хелперы
│   ├── types/                              # TypeScript типы и интерфейсы
│   ├── tests/                              # Юнит и интеграционные тесты
│   └── index.ts                            # Главный вход приложения
│
├── tests/
│   ├── e2e/                                # End-to-end тесты (Playwright, Cypress)
│   ├── integration/                        # Интеграционные тесты
│   └── unit/                               # Юнит-тесты
│
├── docs/
│   ├── API.md                              # API документация
│   ├── ARCHITECTURE.md                     # Полная архитектура проекта
│   └── SETUP.md                            # Инструкции по развёртыванию
│
├── config/
│   ├── .eslintrc.json                      # ESLint конфигурация
│   ├── tsconfig.json                       # TypeScript конфигурация
│   ├── jest.config.js                      # Jest конфигурация
│   └── playwright.config.ts                # Playwright конфигурация
│
├── .gitignore
├── .env.example
├── package.json
├── README.md
└── WORKFLOW.md                             # Инструкции по работе с этим проектом

```

### 2.2 Содержимое основных файлов памяти

#### brief.md
```markdown
# Chef's Mind AI - Brief

## Что это?
Full-stack приложение для управления рецептами и меню ресторана с AI-ассистентом.

## Ключевые цифры
- 3-слойная архитектура (Frontend, Backend, Database)
- ~2000 строк TypeScript кода
- Поддержка OAuth2 (Google, GitHub)
- PostgreSQL для хранения

## Главные задачи
1. Создать интерфейс для добавления рецептов
2. Реализовать AI-ассистент для подбора меню
3. Добавить экспорт в PDF
```

#### context.md
```markdown
# Текущий контекст (Chef's Mind AI)

## Что сейчас делается
- Рефакторинг backend API (Node.js/Express)
- Добавление кэширования Redis для часто запрашиваемых рецептов
- Миграция на TypeScript strict mode

## Что сделано на последней сессии
- Переписаны хэндлеры аутентификации
- Добавлены Unit-тесты для OAuth2 flow
- Обновлена документация API

## Следующие шаги
1. Интеграция Gemini API для рекомендаций рецептов
2. Добавление Swagger UI для документации
3. Настройка CI/CD через GitHub Actions

## Важные файлы для текущей работы
- `src/services/api.ts` — основной API
- `tests/auth.test.ts` — тесты аутентификации
- `docker-compose.yml` — локальное окружение
```

#### architecture.md
```markdown
# Архитектура Chef's Mind AI

## Общая структура
```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                 │
│  - React Components                                     │
│  - State Management (Redux)                             │
│  - OAuth2 Login Flow                                    │
└────────────┬────────────────────────────────────────────┘
             │ HTTPS REST API
┌────────────▼────────────────────────────────────────────┐
│                Backend (Node.js/Express)                │
│  - Auth Controllers (JWT + OAuth2)                      │
│  - Recipe Service (Business Logic)                      │
│  - AI Agent Orchestration (Gemini)                      │
│  - Database Layer (TypeORM + PostgreSQL)                │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│              Database (PostgreSQL)                       │
│  - users, recipes, menus tables                         │
│  - Redis Cache Layer                                    │
└─────────────────────────────────────────────────────────┘
```

## Ключевые паттерны
- **Слойная архитектура**: Controllers → Services → Repositories → Database
- **Асинхронная обработка**: Queue-based система для сложных операций
- **Кэширование**: Redis для рецептов и рекомендаций
- **Multi-agent система**: Отдельные агенты для анализа, рекомендаций, экспорта

## Критические пути (не менять без одобрения)
- OAuth2 flow в `src/controllers/auth.ts`
- Database migrations должны быть обратно совместимы
- API версионирование: /v1/ prefix обязателен
```

---

## Memory Bank: Система долгосрочной памяти

### 3.1 Инициализация Memory Bank (для KiloCode)

**Команда в KiloCode:**
```
initialize memory bank
```

KiloCode выполнит:
1. **Анализ проекта**: прочитает весь код, конфигурации, зависимости
2. **Создание файлов памяти**: автоматически сгенерирует brief.md, product.md, etc.
3. **Активация памяти**: показет `[Memory Bank: Active]` в начале каждого ответа[65]

### 3.2 Регулярное обновление памяти

После каждой значимой сессии выполняй:

```
update memory bank
```

Это скажет KiloCode:
- Перечитать изменённые файлы
- Обновить context.md (текущий прогресс)
- Обновить changelog.md (история)
- Синхронизировать состояние всех агентов

### 3.3 Работа с памятью для GPT, Gemini, Claude (без встроенного Memory Bank)

Если ты используешь сессии в ChatGPT, Gemini, Claude напрямую:

1. **Создай файл CONTEXT.md в проекте:**
```markdown
# Текущий контекст для LLM сессий

## Session ID: claude-2025-11-11-001
## Model: Claude 3.5 Sonnet
## Date: 2025-11-11 11:30 CET

### Project Status
- [Краткое описание что делалось]

### Important Code Files
- [Основные файлы для этой сессии]

### Next Steps
- [Что делать дальше]

### Errors/Issues Encountered
- [Если были ошибки]
```

2. **В начале каждой новой сессии передай этот файл в контекст:**
```
Прочитай этот файл как контекст для проекта:
[CONTEXT.md содержимое]

Я продолжаю работу над Chef's Mind AI...
```

3. **В конце сессии обновляй файл:**
```
Обнови мне файл CONTEXT.md на основе того, что мы сделали:
- Какие файлы изменили
- Какие ошибки встретили
- Что нужно делать дальше
```

---

## Сессии, чекпоинты и управление состоянием

### 4.1 Структура сессии (правильный способ)

**НЕПРАВИЛЬНО:**
```
Я: "Напиши мне весь бэкенд для управления рецептами"
AI: [2 часа генерирует] 
Я: "Стоп, это не то"
```

**ПРАВИЛЬНО:**
```
Я: "Цель: добавить CRUD для рецептов. 
   Ограничения: используй Express + TypeORM, не трогай auth.
   Сессия: session-001-recipes-crud
   Останови перед написанием кода и покажи план."

AI: "[Memory Bank: Active] Вижу, что нужно...
    План:
    1. Создам RecipeController
    2. Создам RecipeService
    3. Создам RecipeRepository
    4. Добавлю маршруты в Express
    OK для выполнения?"

Я: "OK, выполняй"

AI: [пишет код, коммитит]

Я: [тестирую, даю фидбек]

AI: [исправляет]
```

### 4.2 Checkpoint система (как Git, но для ИИ)

В современных IDE есть checkpoint системы, которые работают как Git, но оптимизированы для ИИ:

**Cursor Checkpoints:**
- Автоматически сохраняют после каждого действия AI
- НЕ смешиваются с обычными Git commits
- Можно откатиться к любому checkpoint за 1 клик

**Knox Checkpoint System (более продвинутое):**
- Работает в 10,000x быстрее чем Git для AI операций
- Хранит семантический контекст (не просто дифы)
- Отслеживает какой агент что сделал

**Использование:**
```bash
# Сохранить checkpoint перед рискованным изменением
checkpoint save "Adding Redis integration"

# Посмотреть историю
checkpoint history

# Откатиться
checkpoint restore "Adding Redis integration"
```

### 4.3 State Machine Orchestration (LangGraph паттерн)

Если ты используешь LangGraph, описывай состояния явно:

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

class AgentState(TypedDict):
    task: str                    # Что нужно сделать
    code_generated: str         # Сгенерированный код
    tests_passed: bool          # Прошли ли тесты
    errors: list                # Список ошибок
    status: str                 # "planning", "coding", "testing", "done"

graph = StateGraph(AgentState)

# Определи узлы (nodes) — каждый узел = одна атомарная работа
def planning_node(state):
    # AI планирует что делать
    state["status"] = "planning"
    return state

def coding_node(state):
    # AI пишет код
    state["status"] = "coding"
    return state

def testing_node(state):
    # AI тестирует
    state["status"] = "testing"
    return state

# Добавь узлы в граф
graph.add_node("planning", planning_node)
graph.add_node("coding", coding_node)
graph.add_node("testing", testing_node)

# Определи переходы (edges)
graph.add_edge(START, "planning")
graph.add_edge("planning", "coding")
graph.add_edge("coding", "testing")
graph.add_edge("testing", END)

# Используй
agent = graph.compile()
result = agent.invoke({"task": "Add authentication"})
```

---

## Контекстное инжиниринг и оптимизация токенов

### 5.1 Context Window и его ограничения

Каждая LLM имеет лимит на количество токенов, которые она может обработать:

| Модель | Context Window | Примерно строк кода |
|--------|----------------|---------------------|
| GPT-4o | 128k tokens | ~12,800 строк |
| Claude 3.5 Sonnet | 200k tokens | ~20,000 строк |
| Claude 4 | 200k tokens | ~20,000 строк |
| Gemini 2.5 Pro | 1M tokens | ~100,000 строк |
| Gemini 1.5 Pro | 1M-2M tokens | ~100,000-200,000 строк |
| Mistral Codestral | 256k tokens | ~25,600 строк |

**Проблема:** Model не помнит, что было раньше токена X, если превышен лимит.

**Решение:** Dynamic context management[139][143]

### 5.2 Стратегии оптимизации контекста

#### Техника 1: Asymmetric Context (асимметричное разделение)

```
Вместо передачи всего файла:
────────────────────────────────────────────────

[Полный контекст файла до изменения: 20 строк]
┌─────────────────────────┐
│ CHANGING: getUser()     │  ← ТУТ мы работаем (5 строк)
│ function getUser(id) {  │
│   return query(id)      │
│ }                       │
└─────────────────────────┘
[Полный контекст файла после изменения: 30 строк]

Передай AI:
- 20 строк до изменения (контекст)
- 5 строк что меняется (фокус)
- 30 строк после (результат)

= ~55 токенов вместо 2000
```

#### Техника 2: RAG (Retrieval-Augmented Generation)

1. Индексируй код в векторную БД (например, Pinecone, Weaviate)
2. Когда AI просит "как работает аутентификация?", вместо передачи всего проекта:
   - Найди релевантные файлы (поиск по вектору)
   - Передай только нужные куски

```python
# Псевдокод RAG в LangGraph
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone

embeddings = OpenAIEmbeddings()
vector_store = Pinecone(embeddings)

# Индексируй проект один раз
vector_store.add_documents(project_files)

# При запросе AI:
def retrieve_relevant_context(query):
    docs = vector_store.similarity_search(query, k=5)  # top 5
    return "\n".join([doc.page_content for doc in docs])

context = retrieve_relevant_context("как работает логирование?")
# Теперь передай только context, не весь проект
```

#### Техника 3: Token Caching (KV-Caching)

Google Cloud Gemini и Claude поддерживают prompt caching — кэширование частей контекста:

```python
# Google Gemini с кэшем
import anthropic

client = anthropic.Anthropic()

# System prompt кэшируется автоматически
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are an expert code reviewer"  # Кэшируется один раз
        }
    ],
    messages=[
        {
            "role": "user",
            "content": "Review my code: ..."
        }
    ]
)
```

**Преимущество:** Кэшированные токены стоят 10% от обычной цены.

### 5.3 Минимизация токенов в промптах

**ПЛОХО (много токенов):**
```
Привет, я бы хотел чтобы ты помог мне написать функцию, которая берет 
список чисел и возвращает сумму. Мне нужна функция на TypeScript, и она 
должна быть безопасной от ошибок, обработав случаи когда входные данные 
неправильные, и выводить красивое сообщение об ошибке...
```

**ХОРОШО (компактно):**
```
TypeScript функция sum(nums: number[]): number
- Handle: invalid input
- Return: number or error message
```

---

## Промпт-инжиниринг и постановка задач

### 6.1 Шаблон-структура промпта

```markdown
## [ПРОМПТ-ШАБЛОН]

### Роль
Ты — [Senior Backend Engineer / Tech Lead / DevOps specialist]

### Задача
[Чётко описать что нужно: "Добавить JWT аутентификацию к Express API"]

### Контекст
- Проект: [название]
- Tech stack: [Node.js + TypeScript + Express + PostgreSQL]
- Существующие решения: [Если есть примеры в проекте]
- Файлы для рассмотрения: [Дай пути]

### Ограничения
- НЕ менять: [auth.controller.ts — она будет переписана отдельно]
- Используй: [только встроенные модули, не npm пакеты]
- Следуй: [ESLint rules in .eslintrc.json]

### Выход
1. [План на 3-5 шагов]
2. [Код с комментариями]
3. [Примеры использования]
4. [Юнит-тесты (3+ случаев)]

### Остановись перед кодом и покажи план
```

### 6.2 Примеры эффективных промптов для разных задач

#### Для code generation:
```
Контекст: Я использую TypeScript + React + Redux
Задача: Создать компонент ListRecipes, который:
- Берёт данные из Redux state
- Показывает таблицу с pagination
- Имеет фильтр по названию
- На клике редактирует рецепт

Requirements:
- Используй React Hooks
- Добавь TypeScript типы
- Соответствуй стилю проекта (файл: src/components/Button.tsx)
- Напиши 2 юнит-теста

Покажи план перед кодом.
```

#### Для debugging:
```
Ошибка: 
```
TypeError: Cannot read property 'id' of undefined at getRecipe (api.ts:15)
```

Контекст:
- Код: [вставь файл с ошибкой]
- Стек: [полный стек трейс]
- Как воспроизвести: [пошаговые действия]
- Что ожидаешь: [что должно быть]

Проанализируй и предложи:
1. Корневую причину
2. Способ исправления
3. Как предотвратить в будущем
```

#### Для архитектурных решений:
```
Проблема: Нужно добавить real-time уведомления в приложение
Текущая архитектура: [описать слои]

Вариант 1: WebSocket + Redis Pub/Sub
Вариант 2: Server-Sent Events (SSE)
Вариант 3: Polling с оптимизацией

Сравни:
- Сложность интеграции
- Затраты на обслуживание
- Скалируемость
- Примеры кода для каждого

Рекомендуй лучший вариант для нашего use case [описать].
```

### 6.3 Техника Chain-of-Thought для сложных задач

```
Промпт:
"Мне нужно отрефакторить функцию filterRecipes. 
Она сейчас медленная на больших датасетах.

ШАГ 1: Проанализируй текущую реализацию и объясни почему она медленная
ШАГ 2: Предложи 3 варианта оптимизации (с pros/cons)
ШАГ 3: Напиши бенчмарк для каждого варианта
ШАГ 4: Реализуй лучший вариант с комментариями
ШАГ 5: Напиши миграцию для существующего кода

Текущий код:
[вставь код]"
```

**Почему это работает:** AI проговаривает ход мысли, а не просто выдаёт ответ. Результаты точнее на ~30-40%.

---

## Тестирование, отладка и качество кода

### 7.1 Стратегия тестирования для AI-generated кода

**НИКОГДА не доверяй AI коду без тестов!**

```typescript
// ❌ ПЛОХО
// AI сгенерировал функцию, ты закоммитил

// ✅ ХОРОШО
// AI генерирует:
// 1. Функцию
// 2. Unit-тесты (3+ cases)
// 3. Интеграционные тесты
// 4. Ты запускаешь и проверяешь

// Промпт к AI:
`Напиши функцию calculateDiscount и тесты:

function calculateDiscount(price: number, discountPercent: number): number {
  // реализуй
}

Тесты должны покрывать:
- Обычный случай (price=100, discount=10 → 90)
- Edge cases (price=0, discount=100, отрицательные значения)
- Error cases (invalid input types)
`
```

### 7.2 Рабочий процесс отладки (The Debugging Loop)

**Когда AI-код не работает:**

```
┌─ Шаг 1: Собери контекст
│  - Полный стек-трейс
│  - Шаги для воспроизведения
│  - Скриншоты (если UI)
│  - Логи (console.log, server logs)
│
├─ Шаг 2: Добавь дебаг-логирование
│  Попроси AI добавить console.log в подозрительные места:
│  "Добавь логирование перед строками 15-30 в api.ts"
│
├─ Шаг 3: Исправляй AI-код
│  "Ошибка [ERROR_TEXT]. Объясни причину и исправь."
│
├─ Шаг 4: Сохрани бэкап после исправления
│  - Если ошибка исправлена, сохрани checkpoint
│  - Если нет, попробуй другой подход
│
└─ Шаг 5: Повторяй шаги 2-4 пока не работает
```

**Советы для успешной отладки:**

1. **Use backup/checkpoint перед экспериментами**
2. **Не смешивай несколько ошибок в один промпт**
3. **Объясни что видишь, не что думаешь** ("error says X" не "function is broken")
4. **Дай AI инструменты для самодиагностики** (предложи логи, тесты)

### 7.3 Автоматизация тестирования (CI/CD)

Используй GitHub Actions для автоматических тестов:

```yaml
# .github/workflows/test.yml
name: Test & Build

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run Unit Tests
        run: npm run test:unit
      
      - name: Run Integration Tests
        run: npm run test:integration
      
      - name: Run E2E Tests
        run: npm run test:e2e
      
      - name: Build
        run: npm run build
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

**Всегда запускай перед merge:**
```bash
npm run lint        # ESLint
npm run test        # Все тесты
npm run build       # Компиляция TypeScript
npm run test:e2e    # End-to-end тесты
```

---

## Мультиагентные системы и оркестрация

### 8.1 Архитектура мультиагентных систем

**Три основных паттерна:**

#### Паттерн 1: Sequential (Последовательный)
```
User Request
    ↓
[Agent-1: Analyzer] - анализирует задачу
    ↓ (передаёт контекст)
[Agent-2: Planner] - создаёт план
    ↓ (передаёт контекст)
[Agent-3: Executor] - выполняет план
    ↓
Result
```

#### Паттерн 2: Hierarchical (Иерархический)
```
              [Orchestrator/Manager]
                    ↙    ↓    ↘
            [Agent-1]  [Agent-2]  [Agent-3]
            Backend    Frontend    Database
             Agent      Agent       Agent

Manager: координирует, делегирует, синхронизирует
Agents: работают параллельно, ставят репорты Manager'у
```

#### Паттерн 3: Event-Driven (События)
```
[Event Queue]
    ↓
Agent-1 слушает event "code-generated"
    ↓ (генерирует tests)
Agent-2 слушает event "tests-ready"
    ↓ (запускает тесты)
Agent-3 слушает event "tests-passed"
    ↓ (запускает deployment)
```

### 8.2 Передача контекста между агентами (Handoff Protocol)

```markdown
# Handoff Protocol v1.0

## Когда Agent-1 передаёт работу Agent-2:

### 1. Prepare State
```json
{
  "task_id": "recipe-crud-001",
  "status": "code-generated",
  "generated_files": [
    "src/controllers/RecipeController.ts",
    "src/services/RecipeService.ts"
  ],
  "next_agent": "Tester",
  "context": {
    "requirements": "CRUD for recipes",
    "framework": "Express + TypeORM",
    "errors_encountered": []
  }
}
```

### 2. Execute Handoff
```
Agent-1: "Код сгенерирован. Вот файлы, состояние и требования. 
          Передаю тебе, Agent-2 (Tester)."

Agent-2: "[Checkpoint restored] 
          Вижу состояние. Начинаю тестирование..."
```

### 3. Report Back
```
Agent-2: "Тесты написаны, 15 passed, 0 failed.
         Передаю обратно Agent-1 для review."
```

## Key Rules:
- Каждый handoff = отдельный checkpoint
- State всегда JSON
- Task ID связывает всё в цепь
- Error handling: если Agent не может, escalate к человеку
```

---

## Обработка ошибок и рекавери-стратегии

### 9.1 Fault Tolerance и Contextual Recovery

```typescript
// Пример структуры обработки ошибок в LangGraph

interface AgentError {
  type: "validation" | "runtime" | "api" | "unknown"
  message: string
  context: object
  timestamp: Date
  recoverable: boolean
}

// State machine с recovery
const errorRecoveryGraph = new StateGraph()

// Node: Error Detection
.addNode("detect_error", async (state) => {
  try {
    return state
  } catch (error) {
    return {
      ...state,
      error: {
        type: "runtime",
        message: error.message,
        context: state,
        recoverable: true
      }
    }
  }
})

// Node: Contextual Recovery
.addNode("recover", async (state) => {
  const { error, previousCheckpoint } = state
  
  if (!error.recoverable) {
    return { ...state, status: "failed_manual_intervention" }
  }
  
  // Strategy 1: Retry with backoff
  if (error.type === "api") {
    return retryWithExponentialBackoff(state)
  }
  
  // Strategy 2: Restore from checkpoint
  if (error.type === "runtime") {
    return restoreFromCheckpoint(previousCheckpoint)
  }
  
  // Strategy 3: Alternative path
  if (error.type === "validation") {
    return tryAlternativePath(state)
  }
})

// Circuit Breaker Pattern
.addNode("circuit_breaker", async (state) => {
  const failureRate = countRecentFailures(state) / 10
  
  if (failureRate > 0.5) {
    // > 50% failures = открыть circuit
    return { ...state, status: "circuit_open", escalate: true }
  }
  
  return state
})
```

### 9.2 Exponential Backoff для API retries

```typescript
async function retryWithExponentialBackoff(
  fn: () => Promise<any>,
  maxRetries: number = 5
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) throw error
      
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delayMs = Math.pow(2, attempt - 1) * 1000
      console.log(`Retry in ${delayMs}ms (attempt ${attempt}/${maxRetries})`)
      
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
}

// Использование:
const result = await retryWithExponentialBackoff(
  () => fetchFromAPI('/recipes'),
  3  // max 3 попытки
)
```

### 9.3 State Snapshots для восстановления

```markdown
# Checkpoint Format

## Snapshot состояния
```json
{
  "checkpoint_id": "ckpt-2025-11-11-001",
  "timestamp": "2025-11-11T11:30:00Z",
  "agent": "CodeGenerator",
  "task": "Add auth middleware",
  
  "state": {
    "files_generated": [...],
    "tests_written": true,
    "coverage": "85%"
  },
  
  "memory": {
    "decisions_made": ["Use JWT", "PostgreSQL"],
    "issues_found": [],
    "dependencies_added": ["jsonwebtoken", "@types/jsonwebtoken"]
  },
  
  "conversation": [
    { role: "user", message: "Add JWT auth" },
    { role: "assistant", message: "Plan: ..." }
  ]
}
```

## Восстановление
```bash
# Если что-то пошло не так:
restore_checkpoint("ckpt-2025-11-11-001")

# Или откатить и попробовать другой путь:
branch_from_checkpoint("ckpt-2025-11-11-001", variant="oidc-auth")
```
```

---

## Сравнение фреймворков

### 10.1 LangGraph vs CrewAI vs n8n

| Критерий | LangGraph | CrewAI | n8n |
|----------|-----------|---------|-----|
| **Тип** | Code-first framework | Agent framework | No-code/Low-code |
| **Кривая обучения** | Средняя/Высокая | Низкая | Низкая |
| **Гибкость** | 9/10 | 8/10 | 7/10 |
| **State management** | Встроенные checkpoints | Через состояние команды | Memory nodes |
| **LLM support** | Любая (OpenAI, Anthropic, Google, Local) | Любая | Любая |
| **Интеграции** | LangChain tools | Python tools | 200+ native |
| **Best for** | Complex workflows, custom logic | Multi-agent teams | Business automation |
| **Deployment** | Docker/Kubernetes | Docker/Cloud | Cloud/Self-hosted |
| **Cost** | Pay per API call | Pay per API call | Subscription-based |
| **Community** | Большое | Растущее | Огромное |

### 10.2 Когда использовать каждый

**Используй LangGraph если:**
- Нужна полная контроль над workflow'ом
- Комплексные state transitions
- Хочешь integrate с Python-кодом
- Нужна fine-grained error handling

```python
# LangGraph пример
from langgraph.graph import StateGraph

graph = StateGraph(AgentState)
graph.add_node("plan", plan_node)
graph.add_node("execute", execute_node)
graph.add_edge("plan", "execute")
```

**Используй CrewAI если:**
- Нужна мультиагентная система
- Агенты работают совместно (collaboration)
- Быстро нужно prototyp'ировать
- Хочешь role-based agents

```python
# CrewAI пример
from crewai import Agent, Task, Crew

planner = Agent(role="Planner", goal="Plan the task")
executor = Agent(role="Executor", goal="Execute the plan")

task1 = Task(description="Plan", agent=planner)
task2 = Task(description="Execute", agent=executor)

crew = Crew(agents=[planner, executor], tasks=[task1, task2])
result = crew.kickoff()
```

**Используй n8n если:**
- Нужна visual workflow builder
- Интегрируешь много сервисов
- Команда не техническая
- Хочешь быстро запустить в production

```json
{
  "nodes": [
    {
      "name": "Start",
      "type": "start"
    },
    {
      "name": "Call OpenAI",
      "type": "openai"
    },
    {
      "name": "Save to Database",
      "type": "postgres"
    }
  ],
  "connections": [
    { "from": "Start", "to": "Call OpenAI" },
    { "from": "Call OpenAI", "to": "Save to Database" }
  ]
}
```

---

## Практические примеры и шаблоны

### 11.1 Full Example: Recipe CRUD API с Memory Bank

**Шаг 1: Инициализация Memory Bank**

```bash
cd my-recipe-app
mkdir -p .kilocode/rules/memory-bank

# Скачай instructions
curl -o .kilocode/rules/memory-bank-instructions.md \
  https://kilocode.ai/docs/downloads/memory-bank.md

# Напиши brief
cat > .kilocode/rules/memory-bank/brief.md << 'EOF'
# Recipe API Brief

Full-stack REST API для управления рецептами.

## Tech Stack
- Backend: Node.js 18 + Express + TypeScript
- Database: PostgreSQL + TypeORM
- Auth: JWT
- Testing: Jest + Supertest

## MVP Features
1. CRUD для рецептов
2. JWT аутентификация
3. Swagger документация
4. Unit & integration тесты
EOF
```

**Шаг 2: Создай context.md**

```markdown
# Current Context - Recipe API

## Session: recipe-crud-001
## Date: 2025-11-11

### What We're Building
CRUD endpoints для рецептов с валидацией и auth.

### Files to Focus
- src/controllers/RecipeController.ts
- src/services/RecipeService.ts
- src/middleware/auth.ts
- src/database/entities/Recipe.ts

### Requirements
- Endpoints: POST /recipes, GET /recipes/:id, PUT, DELETE
- Auth: JWT from Authorization header
- Validation: Joi schema
- Tests: Unit + integration для всех endpoints

### Done Last Session
- Setup project structure
- Created database entities

### Next Steps
1. Generate RecipeController with proper error handling
2. Write unit tests
3. Setup Swagger documentation
```

**Шаг 3: Запроси AI создать код**

```markdown
## Промпт для KiloCode

initialize memory bank

После инициализации:

---

Ты — Senior Backend Engineer.

Задача: Создать RecipeController с методами CREATE, READ, UPDATE, DELETE.

Ограничения:
- Используй Express Route Handlers
- TypeORM для database queries
- Joi для validation
- Auth middleware обязателен

Выход:
1. RecipeController.ts (с comments)
2. RecipeService.ts (business logic)
3. recipe.routes.ts (Express routes)
4. recipe.test.ts (unit tests 5+ cases)

Покажи план перед кодом.
```

### 11.2 Шаблон для мультиагентной системы (LangGraph)

```python
# multi-agent-example.py
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from typing import TypedDict

class ProjectState(TypedDict):
    task: str
    analysis: str
    plan: str
    code: str
    tests: str
    status: str
    errors: list

# Инициализируй LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Agent 1: Analyzer
def analyze_task(state: ProjectState):
    """Анализирует задачу и требования"""
    response = llm.invoke([
        {
            "role": "user",
            "content": f"""Analyze this task and identify:
1. Requirements
2. Architecture needs
3. Dependencies

Task: {state['task']}
"""
        }
    ])
    state["analysis"] = response.content
    state["status"] = "analyzed"
    return state

# Agent 2: Planner
def plan_implementation(state: ProjectState):
    """Создаёт план реализации"""
    response = llm.invoke([
        {
            "role": "user",
            "content": f"""Based on this analysis, create a step-by-step plan:

Analysis: {state['analysis']}

Return plan as numbered steps.
"""
        }
    ])
    state["plan"] = response.content
    state["status"] = "planned"
    return state

# Agent 3: Coder
def generate_code(state: ProjectState):
    """Пишет код по плану"""
    response = llm.invoke([
        {
            "role": "user",
            "content": f"""Write TypeScript code based on this plan:

Plan: {state['plan']}

Requirements:
- Use Express + TypeORM
- Add JSDoc comments
- Export cleanly
"""
        }
    ])
    state["code"] = response.content
    state["status"] = "coded"
    return state

# Agent 4: Tester
def write_tests(state: ProjectState):
    """Пишет тесты"""
    response = llm.invoke([
        {
            "role": "user",
            "content": f"""Write unit tests for this code:

Code: {state['code']}

Use Jest. Cover:
- Happy path
- Edge cases
- Error handling
"""
        }
    ])
    state["tests"] = response.content
    state["status"] = "tested"
    return state

# Build the graph
graph = StateGraph(ProjectState)

# Add nodes
graph.add_node("analyze", analyze_task)
graph.add_node("plan", plan_implementation)
graph.add_node("code", generate_code)
graph.add_node("test", write_tests)

# Add edges
graph.add_edge(START, "analyze")
graph.add_edge("analyze", "plan")
graph.add_edge("plan", "code")
graph.add_edge("code", "test")
graph.add_edge("test", END)

# Compile and run
agent = graph.compile()

result = agent.invoke({
    "task": "Create JWT authentication middleware for Express",
    "analysis": "",
    "plan": "",
    "code": "",
    "tests": "",
    "status": "pending",
    "errors": []
})

print("Final Code:")
print(result["code"])
print("\nFinal Tests:")
print(result["tests"])
```

---

## Галлюцинации и защита от ошибок

### 12.1 Почему LLM галлюцинирует

AI часто генерирует код, который "выглядит правильно" но не работает или использует несуществующие API:

```typescript
// ❌ AI может сгенерировать это:
import { fakeLibrary } from 'fake-library'  // не существует!
import crypto from 'crypto/web'              // неправильный path

async function generateToken() {
  // AI может использовать несуществующий метод
  return await crypto.generateRandomToken(32)  // NOT A REAL METHOD
}
```

### 12.2 Техники снижения галлюцинаций

#### Техника 1: Explicit Requirements (явные требования)

```markdown
НЕПРАВИЛЬНО:
"Напиши функцию для работы с JWT"

ПРАВИЛЬНО:
"Напиши функцию для работы с JWT используя пакет 'jsonwebtoken' v9.0.0.

Должна:
- Использовать jwt.sign() для создания токена
- Использовать jwt.verify() для проверки
- Обработать ошибки типа TokenExpiredError

Не используй:
- Другие пакеты
- Кастомную имплементацию
- Синхронные методы
"
```

#### Техника 2: Source Grounding (привязка к источникам)

```markdown
Промпт:
"Используя ТОЛЬКО методы из пакета jsonwebtoken (вот их список):
- jwt.sign(payload, secret, options)
- jwt.verify(token, secret, options)
- jwt.decode(token)

Напиши функцию createToken(userId: string): string
"
```

#### Техника 3: Self-Correction (самокоррекция)

```typescript
// Попроси AI проверить свой код
const prompt = `
Вот код что я написал:

${generatedCode}

Проверь его:
1. Все ли используемые функции существуют в используемых пакетах?
2. Правильна ли синтаксис?
3. Обработаны ли ошибки?
4. Есть ли утечки памяти?

Если нашёл ошибки, исправь и дай полный исправленный код.
`
```

#### Техника 4: Verification Checklist (чек-лист проверки)

```markdown
Перед применением AI-кода проверь:

□ Все используемые пакеты установлены? (npm ls)
□ Все методы/функции существуют в документации?
□ TypeScript тип-чекинг пройден? (npx tsc --noEmit)
□ ESLint без ошибок? (npm run lint)
□ Основные тесты passed? (npm test)
□ Code review сделан? (peer review)

Если что-то не прошло → исправь через AI → повтори проверку
```

### 12.3 Контролируемая генерация (Structured Output)

```python
# Используй Pydantic для структурированного вывода
from pydantic import BaseModel
from langchain_core.output_parsers import JsonOutputParser

class CodeResponse(BaseModel):
    code: str
    imports: list[str]
    functions: list[str]
    tests: str
    potential_issues: list[str]

# Дай AI точный формат
prompt = """
Generate TypeScript code and respond ONLY in this JSON format:
{
  "code": "the actual code",
  "imports": ["list of packages used"],
  "functions": ["list of exported functions"],
  "tests": "unit tests",
  "potential_issues": ["any known issues"]
}
"""

parser = JsonOutputParser(pydantic_object=CodeResponse)
result = parser.parse(ai_response)

print(f"Code: {result.code}")
print(f"Imports: {result.imports}")
print(f"Potential Issues: {result.potential_issues}")
```

---

## Заключение и Checklist

### ✅ Перед запуском проекта с AI-агентом

- [ ] Инициализирована Memory Bank (для KiloCode) или CONTEXT.md (для других LLM)
- [ ] Написаны файлы brief.md, product.md, architecture.md
- [ ] Определен tech stack и документирован
- [ ] Созданы шаблоны промптов для основных типов задач
- [ ] Настроены Unit + Integration + E2E тесты
- [ ] Настроено CI/CD (GitHub Actions, GitLab CI или др.)
- [ ] Учеб созданы чекпоинты для критических решений
- [ ] Документирован API через Swagger/OpenAPI

### ✅ При работе с агентами

- [ ] Каждая сессия имеет чёткую цель и ограничения
- [ ] Контекст обновляется после каждой значимой работы
- [ ] Код тестируется перед применением
- [ ] Ошибки логируются и документируются
- [ ] Checkpoints созданы перед рискованными изменениями
- [ ] Human review проходит перед merge'ем

### ✅ Для масштабирования на мультиагентные системы

- [ ] Выбран фреймворк (LangGraph, CrewAI, n8n)
- [ ] Определены роли агентов и их ответственность
- [ ] Handoff protocol документирован
- [ ] State management и synchronization настроены
- [ ] Error handling и recovery strategies реализованы
- [ ] Monitoring и logging настроены
- [ ] Scalability тестирована

---

## Дополнительные ресурсы

### Документация
- [KiloCode Memory Bank Docs](https://kilocode.ai/docs)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph)
- [CrewAI Docs](https://docs.crewai.com)
- [n8n Docs](https://docs.n8n.io)

### Инструменты
- **IDE**: VS Code + Kilo Code extension, Cursor
- **LLMs**: GPT-4o, Claude 3.5 Sonnet, Gemini 2.5 Pro
- **Testing**: Jest, Playwright, Supertest
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **Monitoring**: LangSmith, DataDog, New Relic

### Best Practices Repos
- LangChain Examples: https://github.com/langchain-ai/langchain
- CrewAI Examples: https://github.com/joaomdmoura/crewAI-examples
- n8n Workflows: https://github.com/n8n-io/n8n/tree/master/packages/nodes-base

---

**Версия:** 2.0 (Advanced)  
**Дата:** 2025-11-11  
**Статус:** Ready for production use  

Эта инструкция может использоваться как шаблон для всех future проектов с мультиагентными системами, vibe coding и облачными LLM.

Обновляй и адаптируй под свои специфические нужды и feedback из опыта.

**Happy coding with AI! 🚀**
