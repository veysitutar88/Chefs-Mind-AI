# PROJECT STATUS — Chef's Mind AI
> Технический срез проекта. Дата генерации: 2026-02-25.
> Последний checkpoint: 2025-12-28 · Ветка: claude/hopeful-burnell

---

## 1. СТРУКТУРА ПРОЕКТА

### 1.1 Дерево верхнего уровня

```
chefs-mind-ai/
├── client/                  # Legacy Vite/React SPA (ЗАБРОШЕН)
├── frontend/                # Старый Next.js frontend (ЗАБРОШЕН)
├── frontend-enhanced/       # АКТИВНЫЙ Next.js 14 фронтенд (порт 3001)
├── server/                  # Express.js backend (порт 5001/5002)
├── shared/                  # Общие типы и Drizzle-схема БД
├── drizzle/                 # SQL-миграции
├── scripts/                 # CI/smoke/deploy скрипты
├── tests/                   # Vitest unit/integration + Playwright e2e
├── docs/                    # Документация, Canon-файлы, UI-spec
├── .context/                # Состояние агента, decision log, evolution log
├── .agent/                  # Workflow-инструкции для AI-агентов
├── archive/                 # Архив устаревших контекстов (до 2025-12-21)
├── checkpoints/             # JSON-снимки состояния проекта
├── data/import/             # CSV-данные для сидирования
├── prometheus/              # prometheus.yml
├── docker-compose.yml
├── docker-compose.prod.yml
├── Dockerfile
├── package.json             # Корневой монорепо-ish package
├── tsconfig.json
├── drizzle.config.ts
├── vite.config.ts           # Для legacy client/
├── vitest.config.js
├── tailwind.config.ts
└── CHECKPOINT.md            # Главный чекпоинт
```

### 1.2 Стек (корневой проект)

| Слой | Технология | Версия |
|---|---|---|
| Runtime | Node.js | 20.x |
| Language | TypeScript | ^5.9.3 |
| Backend Framework | Express.js | ^4.21.2 |
| Frontend Framework | Next.js | ^14.2.5 |
| UI Library | React | ^18.3.1 |
| ORM | Drizzle ORM | ^0.39.1 |
| Database | PostgreSQL (Neon serverless) | pg ^8.16.3 |
| Agent Framework | LangGraph (@langchain/langgraph) | ^0.4.9 |
| AI — OpenAI | openai SDK | ^5.23.1 |
| AI — Gemini | @google/generative-ai | ^0.24.1 |
| AI — Vertex AI | @google-cloud/vertexai | ^1.10.0 |
| AI — Perplexity | native fetch | — |
| State Management | Zustand | ^4.5.2 |
| Data Fetching | TanStack Query | ^5.60.5 |
| UI Components | Radix UI (весь набор) | ^1.x–^2.x |
| Styling | Tailwind CSS | ^3.4.17 |
| Auth | JWT + Passport + Google OAuth | jwt ^9.0.2 |
| WebSockets | Socket.io | ^4.8.1 |
| Metrics | prom-client (Prometheus) | ^15.1.3 |
| Testing (unit) | Vitest | ^3.2.4 |
| Testing (e2e) | Playwright | ^1.56.1 |
| Linting | ESLint ^9 + typescript-eslint | — |
| Task runner | npm scripts + concurrently | — |
| Migrations | drizzle-kit | ^0.31.5 |
| Session Store | connect-pg-simple / memorystore | — |

---

## 2. СТАТУС КАЖДОГО МОДУЛЯ

### 2.1 Backend (`server/`)

| Файл / Папка | Статус | Что реализовано |
|---|---|---|
| `server/index.ts` | ✅ ГОТОВО | Express app entry, middleware chain |
| `server/enhanced-server.ts` | ✅ ГОТОВО | Альтернативный entry (port 5002) с Socket.io |
| `server/routes.ts` | ✅ ГОТОВО | Регистрация всех роутеров |
| `server/db.ts` | ✅ ГОТОВО | dbWrite + dbRead (read replica) + pool |
| `server/auth.ts` | ✅ ГОТОВО | Passport local strategy, сессии |
| `server/session.ts` | ✅ ГОТОВО | express-session конфигурация |
| `server/health.ts` | ✅ ГОТОВО | Healthcheck endpoint |
| `server/metrics.ts` | ✅ ГОТОВО | Prometheus metrics |
| `server/storage.ts` | ✅ ГОТОВО | Файловое хранилище загрузок |
| `server/agents/orchestrator.ts` | ⚠️ ЧАСТИЧНО | Keyword-роутинг работает, **но ответы — заглушки** (не вызывает LLM) |
| `server/graph/graph.ts` | ✅ ГОТОВО | LangGraph pipeline: orchestratorNode + 4 agent nodes с реальными LLM |
| `server/graph/nodes/` | ❓ НЕ ИССЛЕДОВАНО | Отдельные узлы графа |
| `server/graph/stream-utils.ts` | ✅ ГОТОВО | SSE streaming утилиты |
| `server/config/llm-config.ts` | ✅ ГОТОВО | Конфиг всех LLM провайдеров + model options per agent |
| `server/config/media-config.ts` | ✅ ГОТОВО | MEDIA_MODELS, валидация параметров |
| `server/config/agent-routing.ts` | ✅ ГОТОВО | Флаги (video, upscale, switcher), defaults |
| `server/config/env.schema.ts` | ✅ ГОТОВО | Zod-валидация всех env-переменных |
| `server/config/models.ts` | ✅ ГОТОВО | Конфиг доступных моделей |
| `server/config/rateLimit.ts` | ✅ ГОТОВО | express-rate-limit конфиг |
| `server/middleware/jwtAuth.ts` | ✅ ГОТОВО | JWT auth middleware |
| `server/middleware/rbac.ts` | ✅ ГОТОВО | Role-based access (admin/chef/accountant) |
| `server/middleware/errorHandler.ts` | ✅ ГОТОВО | Глобальный error handler |
| `server/middleware/metrics.ts` | ✅ ГОТОВО | Request metrics middleware |
| `server/middleware/qaGate.ts` | ⚠️ ЗАГЛУШКА | QA-Gate заглушен (commented out) |
| `server/middleware/safeMode.ts` | ✅ ГОТОВО | Safe mode для продакшна |
| `server/services/gemini.ts` | ✅ ГОТОВО | analyzeWithGemini (chat) + generateWithGemini (Imagen 3 / Veo 3 placeholder) |
| `server/services/openai.ts` | ✅ ГОТОВО | DALL-E 3 генерация изображений |
| `server/services/perplexity.ts` | ✅ ГОТОВО | Perplexity Sonar API с retry/backoff |
| `server/services/enhanced-media.ts` | ✅ ГОТОВО | EnhancedMediaTool — провайдер-агрегатор |
| `server/services/universal.ts` | ✅ ГОТОВО | universalAsk — мультипровайдерный LLM вызов |
| `server/services/stt.ts` | ⚠️ ЧАСТИЧНО | Speech-to-text, статус неясен |
| `server/services/hallucination-control.ts` | ⚠️ ЧАСТИЧНО | Валидация ответов, базовая реализация |
| `server/services/backupScheduler.ts` | ✅ ГОТОВО | node-cron backup расписание |
| `server/services/fileProcessor.ts` | ✅ ГОТОВО | CSV/Excel импорт |
| `server/services/google-mcp.ts` | ⚠️ ЧАСТИЧНО | Google MCP интеграция |
| `server/services/media/` | ✅ ГОТОВО | Медиа-сервисы |
| `server/services/reminder-helpers.ts` | ✅ ГОТОВО | Хелперы для follow-up задач |
| `server/services/sqlValidator.ts` | ✅ ГОТОВО | Валидатор SQL-запросов |
| `server/auth/google.ts` | ✅ ГОТОВО | Google OAuth flow |
| `server/sidebar/sidebar-store.ts` | ⚠️ ЧАСТИЧНО | Хранилище данных сайдбара, не полностью подключён |
| `server/utils/agentPrompts.ts` | ✅ ГОТОВО | Системные промпты агентов |
| `server/utils/jwt.ts` | ✅ ГОТОВО | JWT sign/verify |
| `server/utils/log.ts` | ✅ ГОТОВО | Logger |
| `server/utils/tableCache.ts` | ✅ ГОТОВО | Кэш таблиц БД |
| `server/utils/timeout.ts` | ✅ ГОТОВО | Timeout wrapper |

---

### 2.2 Frontend (`frontend-enhanced/`)

| Страница / Компонент | Статус | Что реализовано |
|---|---|---|
| `src/app/layout.tsx` | ✅ ГОТОВО | Root layout, AppLayout wrapper |
| `src/app/page.tsx` | ✅ ГОТОВО | Root / redirect |
| `src/app/login/page.tsx` | ✅ ГОТОВО | Страница входа |
| `src/app/dashboard/page.tsx` | ✅ ГОТОВО | Dashboard главный |
| `src/app/dashboard/calendar/` | ✅ ГОТОВО | Календарь с Google Calendar интеграцией |
| `src/app/dashboard/admin/` | ✅ ГОТОВО | Административная панель |
| `src/app/agents/page.tsx` | ✅ ГОТОВО | Обзор агентов |
| `src/app/agents/souschef/` | ✅ ГОТОВО | Чат-интерфейс SousChef |
| `src/app/agents/gastrocount/` | ✅ ГОТОВО | Чат-интерфейс GastroCount |
| `src/app/agents/gastromind/` | ✅ ГОТОВО | Чат-интерфейс GastroMind |
| `src/app/agents/foodframe/` | ✅ ГОТОВО | FoodFrame Media Studio |
| `src/app/chat-history/page.tsx` | ✅ ГОТОВО | История чатов |
| `src/app/media/page.tsx` | ✅ ГОТОВО | Медиа-страница |
| `src/app/orders/page.tsx` | ✅ ГОТОВО | Список заказов |
| `src/app/orders/[id]/` | ✅ ГОТОВО | Детали заказа |
| `src/app/suppliers/page.tsx` | ✅ ГОТОВО | Список поставщиков |
| `src/app/suppliers/[id]/` | ✅ ГОТОВО | Детали поставщика |
| `src/app/settings/page.tsx` | ✅ UI ГОТОВО | Панели General / AI / Account — UI есть, **логика НЕ проброшена** |
| `src/app/status/page.tsx` | ✅ ГОТОВО | Системный статус |
| `src/components/layout/AppLayout.tsx` | ✅ ГОТОВО | Оберта с LeftSidebar + RightSidebar |
| `src/components/layout/LeftSidebar.tsx` | ✅ ГОТОВО | Навигация по агентам (canonical AGENT_CANON) |
| `src/components/layout/RightSidebar.tsx` | ⚠️ ЧАСТИЧНО | Widget-панель инструментов — UI есть, данные не подключены |
| `src/components/chat/ChatInterface.tsx` | ✅ ГОТОВО | Основной чат-интерфейс |
| `src/components/chat/ChatInput.tsx` | ✅ ГОТОВО | Поле ввода |
| `src/components/chat/ChatMessage.tsx` | ✅ ГОТОВО | Рендер сообщений |
| `src/components/chat/FoodFrameStudio.tsx` | ✅ ГОТОВО | Медиа-студия FoodFrame |
| `src/components/ui/ChatArea.tsx` | ✅ ГОТОВО | Source of truth для input-области |
| `src/components/ui/ChatShell.tsx` | ✅ ГОТОВО | Shell-обёртка чата |
| `src/components/ui/ModelSwitcher.tsx` | ⚠️ НЕ ПОДКЛЮЧЁН | UI есть, `/api/models` fetch падает (backend не отвечает) |
| `src/components/ui/MediaModelSelector.tsx` | ⚠️ ЧАСТИЧНО | UI модели выбора медиа |
| `src/components/ui/MediaPresetSelector.tsx` | ✅ ГОТОВО | Выбор пресетов генерации |
| `src/components/ui/MediaFormatSelector.tsx` | ✅ ГОТОВО | Выбор формата |
| `src/components/ui/QualitySelector.tsx` | ✅ ГОТОВО | Выбор качества |
| `src/components/ui/SeedInput.tsx` | ✅ ГОТОВО | Ввод seed |
| `src/components/ui/StepsInput.tsx` | ✅ ГОТОВО | Ввод steps |
| `src/components/ui/UpscaleButton.tsx` | ⚠️ ЗАГЛУШКА | Кнопка upscale — NanoBanana API гипотетический |
| `src/components/ui/FollowupWidget.tsx` | ✅ ГОТОВО | Виджет задач follow-up |
| `src/components/media/Generator.tsx` | ✅ ГОТОВО | Генератор медиа (image/video) |
| `src/components/media/AssetGallery.tsx` | ✅ ГОТОВО | Галерея ассетов |
| `src/components/media/JobList.tsx` | ✅ ГОТОВО | Список задач генерации |
| `src/components/calendar/CalendarView.tsx` | ✅ ГОТОВО | Вид календаря |
| `src/components/calendar/EventForm.tsx` | ✅ ГОТОВО | Форма события |
| `src/components/orders/OrdersList.tsx` | ✅ ГОТОВО | Список заказов |
| `src/components/orders/OrderForm.tsx` | ✅ ГОТОВО | Форма заказа |
| `src/components/suppliers/SuppliersList.tsx` | ✅ ГОТОВО | Список поставщиков |
| `src/components/suppliers/SupplierForm.tsx` | ✅ ГОТОВО | Форма поставщика |
| `src/components/admin/BackupManager.tsx` | ✅ ГОТОВО | Управление бэкапами |
| `src/components/RBACGuard.tsx` | ✅ ГОТОВО | RBAC guard для роутов |
| `src/config/agents.ts` | ✅ ГОТОВО | **Single source of truth** AGENT_CANON: souschef/gastrocount/gastromind/foodframe |
| `src/hooks/useSidebarData.ts` | ⚠️ BROKEN | 5 fetch-вызовов падают ("Failed to fetch") |
| `src/hooks/useMediaGenerator.ts` | ✅ ГОТОВО | Hook для медиа-генерации |
| `src/hooks/useFollowupData.ts` | ✅ ГОТОВО | Hook для follow-up задач |

---

### 2.3 Общие модули (`shared/`)

| Файл | Статус | Содержимое |
|---|---|---|
| `shared/schema.ts` | ✅ ГОТОВО | Drizzle-схема: 16 таблиц, типы, insert/update схемы |
| `shared/types.ts` | ✅ ГОТОВО | MediaGenerationResult и прочие shared типы |
| `shared/session.d.ts` | ✅ ГОТОВО | Типы сессий |

---

## 3. BACKEND — API ENDPOINTS

### 3.1 Полный список endpoints

| Метод | Путь | Статус | Описание |
|---|---|---|---|
| GET | `/health` | ✅ | Healthcheck (uptime, ts) |
| GET | `/api/health` | ✅ | То же, альтернативный путь |
| GET | `/metrics` | ✅ | Prometheus metrics |
| GET | `/api/test` | ✅ | Тестовый endpoint |
| GET | `/api/test/db` | ✅ | Тест подключения к БД |
| POST | `/auth/google/callback` | ✅ | Google OAuth callback |
| POST | `/api/import/*` | ✅ | CSV/Excel импорт ингредиентов и поставщиков |
| GET/POST | `/api/dbadmin/*` | ✅ | Административные операции с БД |
| POST | `/api/chat/*` | ✅ | Базовый чат (legacy route) |
| GET | `/api/chat/sessions` | ✅ | История чат-сессий |
| GET | `/api/chat/sessions/:id` | ✅ | Детали сессии |
| POST | `/api/enhanced-agent/chat` | ⚠️ | Keyword-роутинг → **stub-ответы** (LLM не вызывается) |
| GET | `/api/enhanced-agent/health` | ✅ | Состояние агентов (mock) |
| GET | `/api/enhanced-agent/cache-stats` | ✅ | Статистика кэша оркестратора |
| POST | `/api/universal-ask` | ✅ | Universal LLM вызов (RBAC: chef+) |
| POST | `/api/universal-ask-test` | ✅ | То же, без RBAC (debug) |
| GET | `/api/media/models` | ✅ | Список медиа-моделей + feature-флаги |
| POST | `/api/media/generate/image` | ✅ | Запуск генерации изображения (async job) |
| POST | `/api/media/generate/video` | ⚠️ | Генерация видео (отключена feature-флагом `ENABLE_VIDEO`) |
| POST | `/api/media/upscale` | ⚠️ | Апскейл (NanoBanana — гипотетический API) |
| GET | `/api/media/jobs/:jobId` | ✅ | Статус задачи генерации |
| GET | `/api/media/assets` | ✅ | Галерея ассетов пользователя |
| GET/POST/DELETE | `/api/calendar/*` | ✅ | CRUD событий (Google Calendar интеграция) |
| GET/POST/PATCH | `/api/followup/*` | ✅ | Follow-up задачи |
| GET | `/api/models` | ✅ | Список доступных LLM моделей |
| GET | `/api/reports/*` | ✅ | Финансовые отчёты |
| GET/POST/PUT/DELETE | `/api/orders/*` | ✅ | CRUD заказов |
| GET/POST/PUT/DELETE | `/api/suppliers/*` | ✅ | CRUD поставщиков |
| GET/POST | `/api/search` | ✅ | Поиск |
| GET | `/api/tools` | ✅ | Инструменты |
| GET | `/api/sidebar/*` | ⚠️ | Данные сайдбара (не полностью подключены) |
| GET | `/api/followups/debug` | ✅ | Debug follow-up задач |
| GET | `/api/smoke-helpers/*` | ✅ | CI/smoke хелперы |

### 3.2 База данных

**Подключение**: PostgreSQL через Neon Serverless (`DATABASE_URL` env)
- `dbWrite` — запись (postgres-js)
- `dbRead` — чтение, read replica если настроена (`DATABASE_READONLY_URL`)
- `pool` — pg Pool для raw queries

**Миграции**: Drizzle Kit, 6 SQL-файлов (0000–0005)

**16 таблиц в схеме**:

| Таблица | Статус | Описание |
|---|---|---|
| `users` | ✅ | Пользователи (username/password) |
| `google_oauth_tokens` | ✅ | Google OAuth токены |
| `chat_sessions` | ✅ | Чат-сессии по агентам |
| `messages` | ✅ | Сообщения чата |
| `uploads` | ✅ | Загруженные файлы |
| `generated_content` | ✅ | Сгенерированный медиа-контент (legacy) |
| `media_jobs` | ✅ | Задачи генерации медиа (новая система) |
| `media_assets` | ✅ | Ассеты с job_id и статусом |
| `ingredients` | ✅ | Ингредиенты (stock, price, supplier) |
| `recipes` | ✅ | Рецепты с cost/price |
| `invoices` | ✅ | Счета-фактуры |
| `agent_settings` | ✅ | Настройки промптов агентов per user |
| `suppliers` | ✅ | Поставщики |
| `orders` | ✅ | Заказы |
| `purchase_orders` | ✅ | Закупочные заказы |
| `attachments` | ✅ | Вложения к entities |
| `notes` | ✅ | Заметки к entities |
| `calendar_links` | ✅ | Связь order → Google Calendar event |
| `followup_tasks` | ✅ | Follow-up задачи с Google Calendar sync |

### 3.3 Хардкод в логике

- **System prompts**: hardcoded в `server/services/gemini.ts` (немецкий язык для агентов — "Restaurant in Berlin, Deutschland"), `server/graph/graph.ts` (русскоязычные промпты)
- **Keyword patterns**: hardcoded в `server/agents/orchestrator.ts` и `server/graph/graph.ts`
- **Model names**: `gpt-4-turbo-preview`, `gemini-2.0-flash-exp`, `gemini-2.5-pro` — прописаны хардкодом в коде, но частично читаются из env через `llm-config.ts`
- **Job store**: in-memory `Map<string, JobData>` в `server/routes/media.ts` — не персистентен между перезапусками
- **QA-Gate score**: `Math.floor(Math.random() * 20) + 80` — фейковый рандом в `/api/enhanced-agent/chat`
- **Agent health**: `checkAgentHealth()` всегда возвращает `{ Chef: true, Accountant: true, ... }` — mock

---

## 4. FRONTEND — ЭКРАНЫ

### 4.1 Статус страниц

| Страница | URL | Функциональность |
|---|---|---|
| Dashboard | `/dashboard` | Работает, виджеты данных |
| Login | `/login` | JWT + Google OAuth UI |
| Агенты (обзор) | `/agents` | Карточки агентов (статичные) |
| SousChef Chat | `/agents/souschef` | Чат работает (через /api/chat или /api/universal-ask) |
| GastroCount Chat | `/agents/gastrocount` | Чат работает |
| GastroMind Chat | `/agents/gastromind` | Чат работает (Perplexity для research) |
| FoodFrame Studio | `/agents/foodframe` | UI генерации изображений, job polling |
| История чатов | `/chat-history` | Список/детали сессий |
| Медиа | `/media` | Генератор + галерея ассетов |
| Заказы | `/orders` | CRUD, работает |
| Поставщики | `/suppliers` | CRUD, работает |
| Календарь | `/dashboard/calendar` | Google Calendar events (OAuth требуется) |
| Настройки | `/settings` | UI есть (General/AI/Account), **i18n и theme не проброшены** |
| Системный статус | `/status` | StatusDashboard |
| Админ | `/dashboard/admin` | BackupManager |

### 4.2 Известные UI-проблемы (из CHECKPOINT)

1. **Hydration Error** — root/layout: mismatched server/client state
2. **ModelSwitcher.tsx:31** — Failed to fetch (backend недоступен / endpoint не работает)
3. **useSidebarData.ts:112, 140, 172, 203** — 4 упавших fetch (sidebar data endpoints)
4. **i18n (EN/RU)** — Language switcher кликается, переключения нет (не подключён)
5. **Theme toggle** — кликается, эффекта нет (не подключён)
6. **Model Wiring** — выбор модели в UI не передаётся в backend orchestrator

### 4.3 Реализованные UI-канон правила (2025-12-28)

- Иконки агентов: `rounded-full` (circular only)
- Left/Right sidebar: визуальный паритет (Slate 950, hover:bg-white/10, glow на active)
- Popover: непрозрачный bg-slate-950, border border-white/10, rounded-xl
- Input: `ChatArea.tsx` — source of truth
- Цветовая схема: нейтральный тёмный, без лишнего purple tint

---

## 5. АГЕНТЫ / ЛОГИКА

### 5.1 Канон агентов (locked в v2.5)

| ID | Label | Специализация | Ограничения |
|---|---|---|---|
| `souschef` | SousChef | Рецепты, Prep, Plating | Text, Recipes, Ops |
| `gastrocount` | GastroCount | Затраты, Инвентарь, Отчёты | Finance, Data |
| `gastromind` | GastroMind | Research, Trends, Insights | Search, Research |
| `foodframe` | FoodFrame | Photos, Video, Creative | **Только визуал, без text gen** |

### 5.2 Два параллельных агент-рантайма

#### Рантайм A — Orchestrator (keyword-only, stub)
**Файл**: `server/agents/orchestrator.ts`
**Используется**: `/api/enhanced-agent/chat`
- Классификация по ключевым словам (RU keywords) с весами
- Паттерны: cooking (w:2.0), finance (w:2.5), research (w:1.8), media (w:3.0), qa (w:0.5)
- Levenshtein similarity cache (последние 3 запроса)
- **Проблема**: `routeMessage()` возвращает шаблонную строку `"Ответ от Chef: ..."` — **LLM не вызывается**

#### Рантайм B — LangGraph Graph (реальные LLM)
**Файл**: `server/graph/graph.ts`
**Маршрутизация**: keyword-heuristic → GPT-4-turbo LLM fallback
- `orchestratorNode` — heuristic + OpenAI GPT-4-turbo-preview fallback
- `chefNode` — **GPT-4-turbo-preview** (OpenAI)
- `accountantNode` — **Gemini 2.0-flash-exp** (Google AI)
- `researcherNode` — **GPT-4-turbo-preview** (OpenAI)
- `mediaStudioNode` — **GPT-4-turbo-preview** (text prompts only, не генерирует изображения)
- `processWithAgents()` — синхронная обёртка (без StateGraph, упрощённый flow)

### 5.3 Подключения к внешним API

| Провайдер | Модель | Статус | Файл |
|---|---|---|---|
| **OpenAI** | gpt-4-turbo-preview | ✅ Подключён | `server/graph/graph.ts`, `server/services/openai.ts` |
| **OpenAI** | dall-e-3 | ✅ Подключён (fallback) | `server/services/openai.ts` |
| **Google Gemini** | gemini-2.5-pro / 2.5-flash | ✅ Подключён | `server/services/gemini.ts` |
| **Google Gemini** | gemini-2.0-flash-exp | ✅ Подключён | `server/graph/graph.ts` |
| **Vertex AI Imagen** | imagen-3 | ⚠️ Требует GCP credentials | `server/services/gemini.ts` |
| **Vertex AI Veo** | veo-3 | ❌ ЗАГЛУШКА | `server/services/gemini.ts` (placeholder base64) |
| **Perplexity** | sonar | ✅ Подключён (retry/backoff) | `server/services/perplexity.ts` |
| **Google Calendar** | googleapis | ✅ Подключён | `server/routes/calendar.ts`, `server/auth/google.ts` |
| **NanoBanana** | upscale-pro | ❌ ГИПОТЕТИЧЕСКИЙ API | `server/routes/media.ts` (url не существует) |

### 5.4 Места с хардкодными заглушками

1. `server/routes/enhanced-agent-chat.ts:49` — `await new Promise(resolve => setTimeout(resolve, 100))` вместо реального агента
2. `server/routes/enhanced-agent-chat.ts:67-74` — рандомный QA-score
3. `server/agents/orchestrator.ts:311-327` — template-строки вместо LLM
4. `server/agents/orchestrator.ts:280-288` — `checkAgentHealth()` всегда true
5. `server/services/gemini.ts:307-328` — Veo 3 возвращает base64 текстового плейсхолдера
6. `server/routes/media.ts:91` — `jobStore` in-memory Map (теряется при рестарте)
7. `server/routes/media.ts:722` — NanoBanana API → fallback без реального URL

### 5.5 QA-Gate (middleware/qaGate.ts)

- Инфраструктура присутствует
- **Отключён** (закомментирован) во всех роутах где должен работать
- В `/api/enhanced-agent/chat` симулируется рандомным score

---

## 6. ЧЕКПОИНТЫ

### 6.1 Последний зафиксированный прогресс

```
Checkpoint: v2.5 (2025-12-28)
Commit: 025d57a — "UI Canon checkpoint: unified geometry, sidebars parity, FoodFrame console stabilized"
```

**Версии**:
- UI Version: 2.5 (Enhanced Console)
- Ops Version: 2.5 (PCL/ND Pack active)
- Agent Version: 2.5 (Unified Canon)

**Runtime**: Next.js 14 (Turbopack) на порту 3010

### 6.2 Что было сделано в последних сессиях

#### Сессия 2025-12-28 (последняя)
- Зафиксирован UI Canon: единая геометрия иконок (`rounded-full`)
- Обеспечен паритет Left/Right sidebar (визуальный и интерактивный)
- Стабилизирован FoodFrame консольный вывод
- Обновлён CHECKPOINT.md, создан `docs/UI_CANON_CHECKPOINT_2025-12-28.md`

#### Сессия 2025-12-27
- Удалены браузерные скроллбары и верхняя "strip" полоска
- Принудительный 100vh app shell
- Оптимизирован LeftSidebar (5 элементов без скролла)
- Унифицированы имена роутов и UI labels по canonical config
- Скриншоты прогресса: `docs/proof/ui_*.png`

#### Ранее (декабрь 2025)
- Block 9: Media Studio presets, error handling, модельный switcher
- Calendar UI polishing
- Lint fixes и ESM extension audit
- Settings sidebar overlap fix

### 6.3 Приоритетный backlog (из CHECKPOINT)

1. **Model Wiring** — propagate UI model selection → backend orchestrator
2. **i18n Implementation** — EN/RU translation layer
3. **Fix useSidebarData fetches** — 4 упавших API-вызова
4. **Fix Hydration Error** — root/layout server/client mismatch
5. **Theme system** — wire toggle → next-themes
6. **Veo 3** — реальная интеграция (когда будет доступен в регионе)
7. **NanoBanana upscale** — заменить гипотетический API на реальный провайдер
8. **QA-Gate** — раскомментировать и подключить

---

## 7. ИНФРАСТРУКТУРА

### 7.1 Docker

- `Dockerfile` — production build
- `docker-compose.yml` — dev: backend + frontend-enhanced + postgres
- `docker-compose.prod.yml` — production

### 7.2 CI/CD

| Workflow | Файл | Назначение |
|---|---|---|
| Main CI | `.github/workflows/ci.yml` | Lint + TSC + tests |
| Nightly | `.github/workflows/nightly.yml` | Ночные e2e тесты |
| Smoke | `.github/workflows/smoke.yml` | Smoke tests |
| UI Smoke | `.github/workflows/ui-smoke.yml` | UI smoke |
| Staging Deploy | `.github/workflows/staging-deploy.yml` | Deploy на staging |
| Gemini Triage | `.github/workflows/gemini-triage.yml` | Gemini-powered issue triage |
| Gemini Review | `.github/workflows/gemini-review.yml` | Gemini code review |

### 7.3 Мониторинг

- Prometheus: `/metrics` endpoint (prom-client)
- `prometheus/prometheus.yml` настроен
- RBAC-логи: `logs/rbac_smoke.json`
- Media-логи: `logs/media-run/media-run-YYYY-MM-DD.json`

### 7.4 Переменные окружения (ключевые)

| Переменная | Назначение | Статус |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Обязательна |
| `DATABASE_READONLY_URL` | Read replica | Опциональна |
| `OPENAI_API_KEY` | OpenAI API | Обязательна для чата |
| `GOOGLE_API_KEY` / `GEMINI_API_KEY` | Gemini chat | Обязательна |
| `GOOGLE_CLOUD_PROJECT_ID` | Vertex AI (Imagen) | Нужна для image gen |
| `GOOGLE_APPLICATION_CREDENTIALS` | Vertex AI credentials JSON | Нужна для image gen |
| `PERPLEXITY_API_KEY` | Perplexity Sonar | Нужна для research |
| `NANOBANANA_API_KEY` | Upscale (гипотетический) | ❌ API не существует |
| `ENABLE_VIDEO` | Feature flag для Veo 3 | По умолчанию false |
| `JWT_SECRET` | JWT подпись | Обязательна |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth | Нужна для Google auth |

---

## 8. ТЕСТИРОВАНИЕ

### 8.1 Unit тесты (Vitest)

| Файл | Покрытие |
|---|---|
| `server/agents/orchestrator.test.ts` | Оркестратор |
| `server/graph/graph.test.ts` | LangGraph nodes |
| `server/tests/chat-history.test.ts` | Chat history |
| `server/tests/schemas.test.ts` | Zod схемы |
| `tests/config/env.schema.test.ts` | Env validation |
| `tests/routes/health.test.ts` | Health endpoints |
| `tests/routes/enhanced-agent-chat.test.ts` | Enhanced agent |
| `tests/integration/backup.test.ts` | Backup |
| `tests/integration/health.test.ts` | Health integration |
| `tests/integration/metrics.test.ts` | Metrics |

### 8.2 E2E тесты (Playwright)

| Файл | Сценарий |
|---|---|
| `tests/e2e/auth-smoke.spec.ts` | Auth flow |
| `tests/e2e/main-flow.spec.ts` | Основной поток |
| `tests/e2e/enhanced-agent-chat.spec.ts` | Agent chat |
| `tests/e2e/media-studio.spec.ts` | Media Studio |
| `tests/e2e/orders.spec.ts` | Orders CRUD |
| `tests/e2e/suppliers.spec.ts` | Suppliers CRUD |
| `tests/e2e/chat-history.spec.ts` | Chat history |
| `tests/e2e/features.spec.ts` | Feature flags |

---

## 9. ОБЩАЯ ОЦЕНКА ГОТОВНОСТИ

| Область | Готовность | Комментарий |
|---|---|---|
| Инфраструктура сервера | 90% | Стабильна, RBAC/JWT/metrics работают |
| База данных / схема | 95% | Все таблицы созданы, миграции есть |
| AI-интеграция (чат) | 70% | Gemini/GPT реально работают через graph.ts; enhanced-agent — заглушка |
| AI-интеграция (медиа) | 50% | DALL-E работает, Imagen требует GCP, Veo — placeholder |
| Frontend UI (Canon) | 80% | Визуально стабильно; model/theme/i18n не подключены |
| Agent routing | 60% | Двойная система; production route (enhanced-agent) использует stub |
| Google Calendar | 75% | Реализован, требует OAuth |
| Orders/Suppliers CRUD | 90% | Работает |
| Тесты | 60% | Покрытие есть, часть e2e может быть нестабильна |
| CI/CD | 75% | Workflows настроены |
| **Итого** | **~73%** | MVP уровень, production не готов |

---

*Сгенерировано автоматически на основе анализа исходного кода и документации проекта.*
*Для актуализации статуса — перезапустить генерацию PROJECT_STATUS.md.*
