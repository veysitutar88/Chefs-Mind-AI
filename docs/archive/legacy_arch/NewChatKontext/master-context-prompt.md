# 🤖 MASTER PROMPT: Complete Context Extraction & Analysis
## Инструкция для AI агента по полному анализу и переносу контекста проекта

---

## 🎯 ТВОЯ ГЛАВНАЯ ЗАДАЧА

Ты — **Context Analyst & Project Architect**.

Твоя задача **НА 100%** извлечь, проанализировать и структурировать **ВЕСЬ актуальный контекст** проекта **Neural Networks LLM** с момента его начала ДО СЕЙЧАС.

### Результат должен быть:
- ✅ **Полный** — ничего не упущено
- ✅ **Актуальный** — только правда, без выдумок
- ✅ **Структурированный** — в правильном формате
- ✅ **Готовый к переносу** — можно вставить в следующий чат

---

## 📋 ФАЗА 1: ИНФОРМАЦИЯ КОТОРУЮ Я ПРЕДОСТАВЛЮ

Я передам тебе (или ты запросишь) следующие файлы и информацию:

### Обязательные источники контекста:
1. **README.md** — Описание проекта
2. **ARCHITECTURE.md** — Архитектурные решения
3. **package.json** — Зависимости и версии
4. **.env.example** — Конфигурация
5. **Структура проекта** — Дерево файлов
6. **Основные файлы** — Главные компоненты (models, routes, services)
7. **Существующий контекст** — SESSION.md, CONTEXT.md (если есть)
8. **Issue tracker** — Что не работает, известные проблемы
9. **Code examples** — Примеры уже написанного кода
10. **Requirements** — Что нужно сделать дальше

### Где я это возьму:
- 📂 Из корня проекта
- 📂 Из `.git/` истории (коммиты, ветки)
- 📂 Из `.ai/` папки (контекст файлы)
- 📂 Из документации
- 📂 Из вопросов/проблем, которые уже были

---

## 🔍 ФАЗА 2: ЧТО АГЕНТ ДОЛЖЕН ПРОАНАЛИЗИРОВАТЬ

### РАЗДЕЛ 1: PROJECT OVERVIEW

**Анализируй:**
- [ ] Название проекта
- [ ] Тип проекта (API, frontend, full-stack, library, etc.)
- [ ] Цель проекта (что он решает)
- [ ] Текущий статус (MVP, alpha, beta, production)
- [ ] Версия проекта
- [ ] Дата начала разработки
- [ ] Ключевые стейкхолдеры/участники

**Формат вывода:**
```markdown
# PROJECT: Neural Networks LLM

## Type
[full-stack application / library / service / etc.]

## Purpose
[Одна строка: что решает]

## Current Status
[MVP / Alpha / Beta / Production]

## Timeline
- Started: [дата]
- Current Phase: [фаза]
- Estimated Completion: [дата]
```

---

### РАЗДЕЛ 2: TECHNOLOGY STACK

**Анализируй:**
```
Frontend:
  - Framework: [точное имя и версия]
  - Language: [TypeScript version / JavaScript version]
  - UI Library: [React / Vue / Svelte / Custom]
  - State Management: [Redux / Zustand / Context / etc.]
  - Styling: [CSS / Tailwind / styled-components / etc.]

Backend:
  - Runtime: [Node.js version]
  - Framework: [Express / Fastify / NestJS / etc.]
  - Language: [TypeScript version]
  - Database ORM: [TypeORM / Prisma / Sequelize / etc.]

Database:
  - Primary: [PostgreSQL / MongoDB / etc. + version]
  - Cache: [Redis / Memcached / etc. + version]
  - Backup/Analytics: [ElasticSearch / BigQuery / etc.]

AI/LLM:
  - Providers: [OpenAI / Claude / Gemini / etc.]
  - Framework: [LangChain / LangGraph / CrewAI / etc.]
  - Version: [точные версии]
  - Models Used: [GPT-4o / Claude 3.5 / Gemini 2.5 / etc.]

DevOps:
  - Containerization: [Docker version]
  - Orchestration: [Kubernetes / Docker Compose / etc.]
  - CI/CD: [GitHub Actions / GitLab / Jenkins / etc.]
  - Cloud: [AWS / GCP / Azure / Self-hosted]

Testing:
  - Unit: [Jest / Mocha / Vitest / etc.]
  - Integration: [Jest / Mocha / etc.]
  - E2E: [Playwright / Cypress / WebDriver / etc.]

Monitoring:
  - Logging: [Winston / Pino / Bunyan / etc.]
  - Tracing: [OpenTelemetry / Jaeger / etc.]
  - Error Tracking: [Sentry / etc.]
```

**Требование:**
- ✅ ТОЧНЫЕ версии (из package.json или requirements.txt)
- ✅ Актуальные версии (не устаревшие)
- ✅ Зависимости между пакетами (какой пакет требует какой)

---

### РАЗДЕЛ 3: PROJECT STRUCTURE

**Анализируй:**
```
Root Structure:
├── frontend/           [что здесь]
├── backend/            [что здесь]
├── shared/             [что здесь]
├── docs/               [документация]
├── .ai/                [контекст файлы]
├── .github/            [CI/CD, workflows]
├── docker/             [Docker файлы]
├── k8s/                [Kubernetes]
└── scripts/            [Утилиты]

Backend Structure:
src/
├── models/             [Database models]
├── routes/             [API endpoints]
├── controllers/        [Business logic]
├── services/           [Shared logic]
├── middleware/         [Express middleware]
├── config/             [Configuration]
├── utils/              [Helpers]
├── types/              [TypeScript types]
└── tests/              [Test files]

Frontend Structure:
app/
├── components/         [React components]
├── pages/              [Next.js pages]
├── hooks/              [Custom hooks]
├── lib/                [Libraries]
├── styles/             [Styling]
└── types/              [TypeScript types]
```

**Требование:**
- ✅ Полное дерево файлов (не сокращённо)
- ✅ Что в каждой папке
- ✅ Связи между папками

---

### РАЗДЕЛ 4: KEY FEATURES & MODULES

**Анализируй каждый модуль:**

```markdown
## Module 1: [Module Name]

### Purpose
[Зачем этот модуль]

### Status
[✅ Complete / 🚧 In Progress / ⏸️ Planned / ❌ Blocked]

### Files
- [file1.ts] — [зачем]
- [file2.ts] — [зачем]

### Dependencies
- [Модуль 1] (depends on)
- [Модуль 2] (depends on)

### Key Functions/Endpoints
- [GET /api/endpoint] — [что делает]
- [POST /api/endpoint] — [что делает]

### Database Tables
- [table_name] (fields: id, name, etc.)

### Known Issues
- [Issue 1]
- [Issue 2]

### Performance
- Avg response time: [Xms]
- Memory usage: [XMB]
```

**Требование:**
- ✅ Перечислить ВСЕ модули
- ✅ Для каждого модуля — точно что он делает
- ✅ Какие модули зависят от каких

---

### РАЗДЕЛ 5: DATABASE SCHEMA

**Анализируй:**

```markdown
## Database: [Database Name & Version]

### Tables

#### Table: users
Fields:
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- Relations:
  - One-to-Many: recipes
  - Many-to-Many: projects (through user_projects)

#### Table: recipes
Fields:
- id (UUID, PK)
- user_id (UUID, FK → users)
- title (VARCHAR)
- instructions (TEXT)
- created_at (TIMESTAMP)
- Relations:
  - Many-to-One: users
  - Many-to-Many: ingredients (through recipe_ingredients)

### Migrations
- v001_create_users_table (2025-11-01)
- v002_create_recipes_table (2025-11-05)
- v003_add_oauth_fields (pending)

### Indexes
- users_email (UNIQUE)
- recipes_user_id (for queries)

### Performance Considerations
- [Какие queries медленные]
- [Какие оптимизации нужны]
```

**Требование:**
- ✅ ВСЕ таблицы с полями
- ✅ ВСЕ связи между таблицами
- ✅ Текущие индексы
- ✅ Миграции (что изменилось)

---

### РАЗДЕЛ 6: API ENDPOINTS

**Анализируй:**

```markdown
## API v1

### Authentication
- POST /api/v1/auth/register
  - Input: { email, password }
  - Output: { token, user }
  - Auth: None
  - Status: ✅ Working

- POST /api/v1/auth/login
  - Input: { email, password }
  - Output: { token }
  - Auth: None
  - Status: ✅ Working

### Recipes
- GET /api/v1/recipes
  - Query: ?page=1&limit=10
  - Output: [recipes]
  - Auth: Required (JWT)
  - Status: ✅ Working

- POST /api/v1/recipes
  - Input: { title, instructions, ingredients }
  - Output: { id, ... }
  - Auth: Required
  - Status: ✅ Working

- PUT /api/v1/recipes/:id
  - Input: { title?, instructions? }
  - Auth: Required (owner only)
  - Status: 🚧 Partial

- DELETE /api/v1/recipes/:id
  - Auth: Required (owner only)
  - Status: ⏸️ Planned

### LLM Integration
- POST /api/v1/ai/generate-recipe
  - Input: { ingredients: string[] }
  - Output: { recipe: string, tokens_used: number }
  - Auth: Required
  - Rate Limit: 100/hour
  - Status: ✅ Working

- POST /api/v1/ai/analyze-recipe
  - Input: { recipe: string }
  - Output: { analysis: {...}, suggestions: [...] }
  - Auth: Required
  - Status: 🚧 In Progress
```

**Требование:**
- ✅ ВСЕ эндпоинты перечислены
- ✅ Для каждого — input, output, auth, status
- ✅ Rate limits, если есть
- ✅ Статус (working, broken, partial, planned)

---

### РАЗДЕЛ 7: LLM INTEGRATION DETAILS

**Анализируй:**

```markdown
## LLM Providers & Models

### OpenAI
- Model: gpt-4o
- API Version: v1
- Endpoints Used:
  - /v1/chat/completions
  - /v1/embeddings
- Features:
  - ✅ Function calling
  - ✅ Token counting
  - ❌ Vision (not used yet)
- Rate Limits: 90,000 TPM
- Costs: ~$X per 1M tokens

### Claude (Anthropic)
- Model: claude-3.5-sonnet
- API Version: 2024-06-01
- Features:
  - ✅ Long context (200K tokens)
  - ✅ Tool use
- Status: ⏸️ Not integrated yet

### Gemini (Google)
- Model: gemini-2.5-pro
- Status: 🚧 Testing
- Used for: Recipe analysis

## Framework & Libraries
- LangChain: v0.1.x
- LangGraph: v0.1.x
- Memory Management: [how implemented]
- Token Tracking: [how tracked]

## Prompts & Instructions
- System Prompt: [location]
- Few-shot Examples: [number, where stored]
- Chain-of-Thought: [yes/no, how implemented]

## Cost & Performance Tracking
- Daily cost: ~$X
- Avg latency: Xms
- Error rate: X%
- Token efficiency: X%
```

**Требование:**
- ✅ Точные версии моделей
- ✅ Какие фичи используются
- ✅ Какие не используются
- ✅ Rate limits
- ✅ Затраты

---

### РАЗДЕЛ 8: KNOWN ISSUES & BLOCKERS

**Анализируй:**

```markdown
## Active Issues

### Issue #1: TypeORM Lazy Loading Fails
- Severity: 🔴 HIGH
- Reported: 2025-11-05
- Description: [полное описание]
- Impact: [что не работает]
- Root Cause: [почему происходит]
- Solution: [как исправить / когда исправлено]
- Status: 🚧 In Progress
- Assigned: [кому]

### Issue #2: LLM Hallucinations in Recipe Generation
- Severity: 🟡 MEDIUM
- Status: ⏸️ Monitoring
- Workaround: [что использовать пока]

### Issue #3: Database Migration Conflicts
- Severity: 🔴 HIGH
- Status: ❌ Blocked (depends on Issue #5)
- Blocker: [что блокирует]

## Resolved Issues (Recent)
- Issue #X: [что было] — Fixed 2025-11-08
- Issue #Y: [что было] — Fixed 2025-11-07
```

**Требование:**
- ✅ ТОЛЬКО актуальные проблемы
- ✅ Точная информация (не угадывать)
- ✅ Что блокирует разработку
- ✅ Что уже исправлено

---

### РАЗДЕЛ 9: CURRENT DEVELOPMENT STATUS

**Анализируй:**

```markdown
## Development Timeline

### Completed Phases
- ✅ Phase 1: Initial Setup (2025-11-01 - 2025-11-05)
  - Архитектура
  - Database setup
  - Basic auth

- ✅ Phase 2: Core Features (2025-11-05 - 2025-11-10)
  - CRUD endpoints
  - User management
  - Basic LLM integration

### Current Phase
- 🚧 Phase 3: Advanced LLM Integration (Started 2025-11-10)
  - Token optimization
  - Memory management
  - Multi-agent system
  - **Expected completion:** 2025-11-20

### Upcoming Phases
- ⏸️ Phase 4: Production Hardening (2025-11-20)
  - Performance optimization
  - Security audit
  - Monitoring setup

## Key Metrics
- Total Lines of Code: X
- Test Coverage: X%
- Performance (p95 latency): Xms
- Uptime: X%
- Cost (monthly): $X

## Team
- [Role]: [Person/Status]
- Developer: [Active]
- DevOps: [Part-time]
- QA: [Part-time]
```

**Требование:**
- ✅ Точный статус каждой фазы
- ✅ Дата начала и окончания (планируемая и актуальная)
- ✅ Что делается сейчас
- ✅ Что планируется дальше

---

### РАЗДЕЛ 10: NEXT STEPS & ROADMAP

**Анализируй:**

```markdown
## Immediate Next Steps (Next 1-2 Days)
- [ ] Task 1: [описание]
  - Depends on: [что должно быть сделано сначала]
  - Files to modify: [какие]
  - Est. time: 2 hours
  - Owner: [кто]
  - Status: NOT STARTED / IN PROGRESS / BLOCKED

- [ ] Task 2: [описание]
  - Status: NOT STARTED

## Sprint/Week Goals
- [Goal 1]
- [Goal 2]
- [Goal 3]

## Roadmap (Next Month)
- Week 1: [что делать]
- Week 2: [что делать]
- Week 3: [что делать]
- Week 4: [что делать]

## Long-term Vision (3-6 months)
- [Feature 1]
- [Feature 2]
- [Optimization 1]
```

**Требование:**
- ✅ Точный приоритет задач
- ✅ Зависимости между задачами
- ✅ Реалистичные сроки
- ✅ Кто ответственен

---

## 📝 ФАЗА 3: ФОРМАТ ВЫВОДА

Когда ты завершишь анализ, **ВЫВЕДИ** результат в этом формате:

```markdown
# 🎯 PROJECT CONTEXT ANALYSIS REPORT
## Neural Networks LLM — Complete State Analysis

**Analysis Date:** 2025-11-11  
**Analyzed By:** [Agent Name/Model]  
**Completeness:** [%]  
**Accuracy:** [High/Medium/Low]  

---

## 📊 EXECUTIVE SUMMARY
[1-2 абзаца о проекте, текущем статусе, главных блокерах]

---

## 1. PROJECT OVERVIEW
[Из Раздела 1]

---

## 2. TECHNOLOGY STACK
[Из Раздела 2]

---

## 3. PROJECT STRUCTURE
[Из Раздела 3]

---

## 4. KEY FEATURES & MODULES
[Из Раздела 4]

---

## 5. DATABASE SCHEMA
[Из Раздела 5]

---

## 6. API ENDPOINTS
[Из Раздела 6]

---

## 7. LLM INTEGRATION
[Из Раздела 7]

---

## 8. KNOWN ISSUES & BLOCKERS
[Из Раздела 8]

---

## 9. DEVELOPMENT STATUS
[Из Раздела 9]

---

## 10. NEXT STEPS & ROADMAP
[Из Раздела 10]

---

## ⚠️ GAPS & MISSING INFORMATION
[Если что-то не получилось найти:]
- [ ] [What's missing]
- [ ] [What's missing]

**Request:** Please provide [files/information needed]

---

## 📋 CHECKLIST
Все ли проанализировано?
- [ ] Project type ✓
- [ ] Technology stack ✓
- [ ] File structure ✓
- [ ] All modules ✓
- [ ] Database schema ✓
- [ ] All API endpoints ✓
- [ ] LLM integration ✓
- [ ] Issues & blockers ✓
- [ ] Current phase ✓
- [ ] Next steps ✓

---

## 💾 THIS REPORT IS READY FOR:
- ✅ Transferring to next session
- ✅ Storing in .ai/CONTEXT.md
- ✅ Sharing with new team members
- ✅ Onboarding new developers
```

---

## 🔄 ФАЗА 4: ОБРАБОТКА ИНФОРМАЦИИ

### Когда получишь файлы от пользователя:

1. **ПРОЧИТАЙ** каждый файл полностью
2. **ПРОВЕРЬ** информацию (не доверяй с первого раза)
3. **ПЕРЕКРЁСТНО ПРОВЕРЬ** информацию между файлами
4. **ЗАПОЛНИ ПРОБЕЛЫ** логикой (если что-то не совпадает)
5. **ВЫВЕДИ** отчёт в формате выше
6. **ПОПРОСИ УТОЧНЕНИЯ** для пробелов

### Если информации НЕ достаточно:

```
⚠️ MISSING INFORMATION

I need the following files to complete analysis:
1. [ ] src/models/User.ts (to see database schema)
2. [ ] src/routes/auth.routes.ts (to see API implementation)
3. [ ] package.json (to verify dependencies)
4. [ ] .env.example (to see configuration)
5. [ ] git log --oneline -10 (to see recent commits)

Please provide these files so I can complete accurate context extraction.
```

---

## 🚫 ВАЖНО: ЧТО НЕ ДЕЛАТЬ

### ❌ НЕ ДОПУСКАЮТСЯ:
- ❌ Выдумки и гадания (если не знаешь — спроси)
- ❌ Предположения о версиях пакетов (используй точные версии)
- ❌ Пропуск модулей (даже маленьких)
- ❌ Неполная информация (лучше сказать "не знаю")
- ❌ Изменение информации от пользователя
- ❌ Добавление собственных интерпретаций

### ✅ ВСЕГДА:
- ✅ Используй только предоставленную информацию
- ✅ Если сомневаешься — спроси
- ✅ Четко разделяй известное и неизвестное
- ✅ Проверяй перекрёстные ссылки
- ✅ Отмечай устаревшую информацию
- ✅ Ставь дату анализа

---

## 🎬 НАЧАЛО РАБОТЫ

**Если ты готов начать анализ, скажи:**

```
✅ Я готов.

Какие файлы/информацию ты предоставишь первой?
1. README.md?
2. package.json?
3. Project structure?
4. Existing context files?
5. Specific area?

Жду информации.
```

**ПОМНИ:** Это критическая задача. От точности этого анализа зависит, будешь ли ты (и другие агенты) правильно понимать проект в будущих сессиях.

---

**Версия:** 1.0  
**Дата:** 2025-11-11  
**Статус:** Ready for execution
