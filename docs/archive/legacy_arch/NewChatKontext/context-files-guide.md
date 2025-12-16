# 📋 COMPLETE GUIDE: How to Create and Maintain Context Files (.md)
## Подробная инструкция по структурированию и ведению контекста для AI агентов

**Version:** 1.0  
**Date:** 2025-11-11  
**Purpose:** Правильное сохранение и передача контекста между сессиями AI агентов

---

## СОДЕРЖАНИЕ

1. [Введение: Зачем нужны файлы контекста](#введение)
2. [Структура файлов контекста](#структура-файлов)
3. [CONTEXT.md - Главный файл (подробно)](#contextmd---главный-файл)
4. [SESSION.md - История сессий](#sessionmd---история-сессий)
5. [ARCHITECTURE.md - Архитектурные решения](#architecturemd---архитектурные-решения)
6. [DECISIONS.md - Логирование решений](#decisionsmd---логирование-решений)
7. [CHANGELOG.md - История изменений](#changelogmd---история-изменений)
8. [BEST PRACTICES - Лучшие практики](#best-practices)
9. [Примеры (copy-paste ready)](#примеры-copy-paste-ready)
10. [Checklist для проверки](#checklist-для-проверки)

---

## Введение

### Почему файлы контекста важны?

**Проблема без контекста:**
```
Сессия 1: Ты пишешь агенту требование
Agent: Создаёт архитектуру, пишет 1000 строк кода

Сессия 2: Новый чат, новый агент
Agent: "Привет, что нужно?" → НЕ ПОМНИТ НИЧЕГО!
Агент начинает с нуля, выдумывает архитектуру, дублирует работу

Результат: теряешь дни работы
```

**С файлами контекста:**
```
Сессия 1: Агент пишет CONTEXT.md
↓
Сессия 2: Новый агент читает CONTEXT.md
↓ 
Agent: "Вижу что уже сделано, продолжу отсюда"
↓
Работа продолжается БЕЗ перерывов
```

### Что хранится в файлах?

| Файл | Размер | Обновление | Зачем |
|------|--------|-----------|-------|
| **CONTEXT.md** | 1-3 KB | КАЖДАЯ сессия | Текущая задача + статус |
| **SESSION.md** | 2-5 KB | КОНЕЦ сессии | Summary что было сделано |
| **ARCHITECTURE.md** | 3-10 KB | РЕДКО (когда меняется) | Архитектурные решения |
| **DECISIONS.md** | 2-5 KB | КОГДА нужно решение | Логирование ключевых решений |
| **CHANGELOG.md** | 5-20 KB | КАЖДУЮ сессию | История всех изменений |

---

## Структура файлов

### Где хранить?

```
my-project/
├── .ai/                          ← Папка для AI контекста
│   ├── CONTEXT.md                ← ГЛАВНЫЙ файл (читать первым!)
│   ├── SESSION.md                ← История последних 3 сессий
│   ├── ARCHITECTURE.md           ← Архитектура (не меняется часто)
│   ├── DECISIONS.md              ← Логирование ключевых решений
│   ├── CHANGELOG.md              ← История всех изменений
│   └── .gitignore                ← Если нужно скрыть от git
│
├── src/                          ← Исходный код
├── tests/                        ← Тесты
├── docs/                         ← Документация
└── README.md
```

### Почему `.ai/`?

- ✅ Отделено от кода
- ✅ Легко найти
- ✅ Можно добавить в `.gitignore` (не нужен в git)
- ✅ Организованно

---

## CONTEXT.md - Главный файл

### Что это?

**CONTEXT.md** - это файл, который агент читает ВСЕ время. Здесь написано:
- Что ты делаешь СЕЙЧАС
- Какие файлы трогаешь
- На что обращать внимание
- Какие ограничения

### Структура (обязательные секции)

```markdown
# 📋 PROJECT CONTEXT
## [Project Name]

### Session Info
- **Session ID:** session-2025-11-11-001
- **Date:** 2025-11-11 12:00 CET
- **Status:** IN PROGRESS / COMPLETED / ON HOLD
- **Model:** GPT-4o / Gemini / Claude

---

## 🎯 Current Task

### Task Name
[Понятное название задачи]

### Task Description
[Подробное описание что нужно сделать]

### Why This Task?
[Зачем это нужно для проекта]

### Success Criteria
- [ ] Критерий 1
- [ ] Критерий 2
- [ ] Критерий 3

---

## ✅ Already Completed

### Previous Sessions Summary
- **Session 001 (2025-11-10):** Создана архитектура проекта, инициализирована база данных
- **Session 002 (2025-11-10):** Реализована User authentication, добавлены тесты

### Modules Ready
- ✅ Database setup (PostgreSQL + TypeORM)
- ✅ Authentication (JWT implemented)
- ✅ Basic API structure (Express + routing)
- 🚧 Authorization (in progress)
- ⏸️ Email notifications (planned)

### Key Files Created
- src/models/User.ts (created, finalized)
- src/middleware/auth.ts (created, finalized)
- src/config/database.ts (created, finalized)

---

## 🚀 What Needs to Be Done

### Main Task Steps
1. **Step 1: Create Recipe model**
   - File: `src/models/Recipe.ts`
   - Relations: Many-to-One with User
   - Fields: title, description, ingredients, instructions, cookTime
   - Status: NOT STARTED

2. **Step 2: Implement Recipe routes**
   - File: `src/routes/recipe.routes.ts`
   - Endpoints: GET, POST, PUT, DELETE
   - Auth: Required (check JWT)
   - Status: NOT STARTED

3. **Step 3: Write Recipe tests**
   - File: `tests/recipe.test.ts`
   - Cases: Create, Read, Update, Delete, Authorization
   - Framework: Jest + Supertest
   - Status: NOT STARTED

---

## 📁 Files to Work With

### MUST READ (перед началом)
- `src/models/User.ts` — Пример Model структуры
- `src/routes/auth.routes.ts` — Пример Route структуры
- `src/middleware/auth.ts` — Как проверять JWT

### WILL MODIFY (будут изменяться)
- `src/models/Recipe.ts` — СОЗДАТЬ НОВЫЙ файл
- `src/routes/recipe.routes.ts` — СОЗДАТЬ НОВЫЙ файл
- `tests/recipe.test.ts` — СОЗДАТЬ НОВЫЙ файл

### DO NOT TOUCH (ни в коем случае не трогать)
- `src/config/database.ts` — Database configuration (stable)
- `src/middleware/auth.ts` — Auth middleware (stable)
- `package.json` — Dependencies (ask before changing)

---

## 🚫 Constraints & Important Notes

### Architecture Rules
- Follow TypeORM patterns (see User model)
- Use existing middleware structure
- Keep routes modular (separate by feature)
- All new code must pass TypeScript strict mode

### Code Style
- 2 spaces indentation (configured in .eslintrc)
- JSDoc comments for public methods
- Error handling in all routes
- Always return structured responses

### Testing
- Minimum 80% code coverage
- Test happy path + error cases
- Use existing test setup (see auth.test.ts)
- Run: `npm run test`

### Database
- NO raw SQL queries (use TypeORM)
- All relations defined in models
- Migrations run automatically on startup
- NO data deletion without approval

---

## ⚠️ Known Issues & Gotchas

### Issue 1: TypeORM Lazy Loading
- ❌ Problem: Relations sometimes fail to load
- ✅ Solution: Use `leftJoinAndSelect` in queries
- 📝 Example: See `src/routes/auth.routes.ts` line 25

### Issue 2: JWT Expiry
- ❌ Problem: Tokens expire without refresh mechanism
- ✅ Solution: Currently not implemented (planned for next phase)
- 📝 Note: Use shorter expiry for testing (1 hour)

### Issue 3: Test Database
- ❌ Problem: Tests might pollute dev database
- ✅ Solution: Tests use separate DB (configured in jest.config.js)
- 📝 Reset: `npm run test:reset`

---

## 💡 Context Transfer Info

### When Continuing in New Session
New AI agent should know:
1. We're building a Recipe Management API
2. User model is DONE (don't touch)
3. Recipe model needs to be CREATED
4. Follow EXACTLY the same patterns as User model

### Dependencies Between Tasks
```
Task 1: Create Recipe Model
  ↓ (depends on)
Task 2: Create Recipe Routes
  ↓ (depends on)
Task 3: Write Recipe Tests
```
**Do NOT start Task 2 until Task 1 is 100% complete!**

---

## 📊 Project Stats (for reference)

- **Total Lines of Code:** ~500 (excluding tests)
- **Tests Coverage:** 85%
- **Database Tables:** 1 (Users) + TBD (Recipes)
- **API Endpoints:** 2 (/login, /register) + TBD (Recipes)
- **Development Time:** ~4 hours so far
- **Estimated Time Remaining:** ~3 hours

---

## 🔄 How to Update This File

### At Start of Session
Ensure these are current:
- [ ] Session ID updated
- [ ] Current Task clearly described
- [ ] Files list accurate
- [ ] Known Issues section reflects reality

### During Session
Keep these sections updated:
- [ ] Progress in "What Needs to Be Done"
- [ ] Mark completed steps with ✅
- [ ] Add new issues if found

### At End of Session
- [ ] Add summary of what was done
- [ ] Update "Already Completed" section
- [ ] List new files created/modified
- [ ] Note any new constraints or gotchas

---

## 🎯 Quick Reference

### Copy This Template For Your Project

```markdown
# 📋 PROJECT CONTEXT
## [Your Project Name]

### Session Info
- **Session ID:** session-YYYY-MM-DD-XXX
- **Date:** [date and time]
- **Status:** IN PROGRESS
- **Model:** [GPT-4o / Gemini / Claude]

---

## 🎯 Current Task
[One sentence description]

---

## ✅ Already Completed
[List of done modules/tasks]

---

## 🚀 What Needs to Be Done
1. [Task 1]
2. [Task 2]
3. [Task 3]

---

## 📁 Files to Work With
### MUST READ
- [file 1]

### WILL MODIFY
- [file 2]

### DO NOT TOUCH
- [file 3]

---

## 🚫 Constraints
- [Constraint 1]
- [Constraint 2]

---

## ⚠️ Known Issues
- [Issue 1]
- [Issue 2]
```

---

## SESSION.md - История сессий

### Что это?

**SESSION.md** - это логирование того, что было сделано в конце каждой сессии. Нужен, чтобы видеть прогресс.

### Структура

```markdown
# 📊 SESSION HISTORY

---

## Session 001 - 2025-11-11 10:00-10:45 CET

**Model:** GPT-4o  
**Duration:** 45 minutes  
**Status:** ✅ COMPLETED

### What Was Done
- Created User.ts model with TypeORM decorators
- Implemented bcrypt password hashing
- Added email validation
- Created /login and /register routes

### Files Created
- src/models/User.ts (85 lines)
- src/routes/auth.routes.ts (120 lines)

### Files Modified
- src/config/database.ts (added User to entities)
- package.json (added bcrypt dependency)

### Tests Written
- tests/auth.test.ts (5 test cases, all passed)

### Issues Fixed
- Fixed TypeORM connection pool size

### Issues Found
- JWT expiry not implemented (noted for next session)

### Lessons Learned
- Always use lazy loading with relations
- bcrypt needs error handling for hash failures

### Performance Impact
- No major performance implications
- Auth routes respond in <50ms

### Code Quality
- TypeScript strict mode: ✅ PASS
- ESLint: ✅ PASS (0 warnings)
- Test coverage: 92%

### Next Steps
1. Create Recipe model
2. Implement Recipe CRUD routes
3. Add OAuth2 support

---

## Session 002 - 2025-11-11 11:00-12:00 CET

**Model:** Claude 3.5 Sonnet  
**Duration:** 60 minutes  
**Status:** 🚧 IN PROGRESS

### What Was Done
- Created Recipe.ts model
- Implemented GET /recipes endpoint
- Added unit tests for Recipe model

### Files Created
- src/models/Recipe.ts (120 lines)
- src/routes/recipe.routes.ts (150 lines - partial)

### Issues Encountered
- TypeORM lazy loading issue with User relation
  - Solution: Used leftJoinAndSelect

### Current Blocker
- POST /recipes endpoint needs user authentication check
- Will complete in next session

---
```

---

## ARCHITECTURE.md - Архитектурные решения

### Что это?

Документирование **ТУ или ИНАЧЕ** решений. Зачем было выбрано именно это, а не то.

### Структура

```markdown
# 🏗️ ARCHITECTURE DECISIONS

**Last Updated:** 2025-11-11  
**Status:** STABLE (not changing frequently)

---

## Database Architecture

### Decision: PostgreSQL + TypeORM

**Why PostgreSQL?**
- ✅ Relational data (Users, Recipes)
- ✅ ACID compliance (data integrity)
- ✅ Great TypeORM support
- ✅ Easy migrations

**Why NOT?**
- ❌ MongoDB - too flexible for this structure
- ❌ SQLite - not suitable for production

**Implications:**
- All models must use TypeORM decorators
- Migrations required for schema changes
- Connection pooling for performance

---

## Authentication Strategy

### Decision: JWT + httpOnly Cookies

**Why JWT?**
- ✅ Stateless (easy to scale)
- ✅ Works with SPAs
- ✅ Standard industry practice

**Why httpOnly Cookies?**
- ✅ Protection against XSS attacks
- ✅ Browser auto-manages tokens
- ✅ More secure than localStorage

**Flow:**
```
Client sends credentials
↓
Server generates JWT
↓
Server stores in httpOnly cookie
↓
Browser auto-sends cookie on requests
↓
Middleware verifies JWT
```

**Token Lifetime:**
- Access Token: 1 hour
- Refresh Token: 7 days (to be implemented)

---

## API Structure

### Decision: RESTful with Express

**Why REST?**
- ✅ Simple to understand
- ✅ Standard HTTP methods (GET, POST, PUT, DELETE)
- ✅ Good for CRUD operations
- ✅ Easy to test

**Why NOT?**
- ❌ GraphQL - overkill for MVP
- ❌ gRPC - complex for web clients

**Routes Organization:**
```
/api/v1/
  ├─ /auth (login, register, logout)
  ├─ /users (profile, settings)
  ├─ /recipes (CRUD)
  └─ /ingredients (inventory)
```

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

---

## Error Handling

### Decision: Centralized Error Middleware

**Why?**
- ✅ Consistent error responses
- ✅ Prevents data leaks (sanitized errors)
- ✅ Easy to debug with proper logging

**Error Codes:**
- 400 - Bad Request (validation failed)
- 401 - Unauthorized (no JWT)
- 403 - Forbidden (insufficient permissions)
- 500 - Server Error

---

## File Organization

### Decision: Feature-based Modules

**Structure:**
```
src/
├─ models/           (Database models)
├─ routes/           (API endpoints)
├─ controllers/      (Business logic)
├─ middleware/       (Express middleware)
├─ services/         (Shared services)
├─ utils/            (Helpers)
└─ config/           (Configuration)
```

**Why?**
- ✅ Easy to find files
- ✅ Modular (can add/remove features)
- ✅ Scales with project growth

---

## Testing Strategy

### Decision: Jest + Supertest

**Why Jest?**
- ✅ Fast test runner
- ✅ Built-in mocking
- ✅ Great TypeScript support
- ✅ Coverage reports

**Testing Pyramid:**
```
        UI Tests (10%)
    Integration Tests (30%)
    Unit Tests (60%)
```

**Coverage Target:** 80%+

---

## DO NOT CHANGE (without discussion)

These decisions are fundamental to the project:

1. **Database:** PostgreSQL + TypeORM (changing would require major refactor)
2. **Auth:** JWT + httpOnly Cookies (affects entire backend)
3. **API Style:** REST + Express (affects all endpoints)
4. **Project Structure:** Feature-based modules (affects file organization)

---
```

---

## DECISIONS.md - Логирование решений

### Что это?

Логирование решений которые принимались. **Когда и почему** была выбрана такая архитектура.

### Структура

```markdown
# 🤔 DECISION LOG

Логирование архитектурных и технических решений

---

## Decision #1 - 2025-11-11 09:00
**Topic:** Database Choice

**Question:** What database for this project?

**Options Considered:**
1. PostgreSQL (relational) ✅ CHOSEN
2. MongoDB (document)
3. SQLite (embedded)

**Chosen:** PostgreSQL

**Reason:**
- Strong typing (prevents bugs)
- ACID compliance (data integrity)
- Mature ecosystem
- Good TypeORM support

**Impact:**
- All models must follow SQL schema
- Migrations required for changes
- Better performance for joins

**Decision Maker:** User  
**Date:** 2025-11-11  
**Status:** FINAL (no changes)

---

## Decision #2 - 2025-11-11 10:15
**Topic:** Authentication Mechanism

**Question:** How should users authenticate?

**Options Considered:**
1. JWT + httpOnly Cookies ✅ CHOSEN
2. Session-based (Redis)
3. OAuth2 only

**Chosen:** JWT + httpOnly Cookies

**Reason:**
- Stateless (easier to scale)
- XSS-resistant (httpOnly)
- Works with mobile apps
- Industry standard

**Impact:**
- All protected routes need middleware
- Token expiry management needed
- Logout requires blacklist (future)

**Decision Maker:** User + AI Agent  
**Date:** 2025-11-11  
**Status:** DECIDED (but refresh tokens TBD)

---

## Decision #3 - 2025-11-11 11:30
**Topic:** API Style

**Question:** REST or GraphQL?

**Options Considered:**
1. REST ✅ CHOSEN
2. GraphQL
3. gRPC

**Chosen:** REST

**Reason:**
- Simplicity for MVP
- Standard HTTP methods
- Easy to test
- Good for CRUD operations

**Impact:**
- Consistent endpoint structure
- Standard HTTP status codes
- Easier frontend integration

**Decision Maker:** User  
**Date:** 2025-11-11  
**Status:** FINAL

---

## Decision #4 (Pending)
**Topic:** Caching Strategy

**Question:** How to cache recipe data?

**Options:**
1. Redis (distributed cache)
2. In-memory (Node.js cache)
3. No caching (database only)

**Status:** PENDING DECISION  
**Priority:** Medium  
**Will Decide:** Next session

---
```

---

## CHANGELOG.md - История всех изменений

### Что это?

Полный лог всех изменений в проекте. Для просмотра что было сделано в истории проекта.

### Структура

```markdown
# 📝 CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- Recipe model with TypeORM (WIP)
- Recipe CRUD routes skeleton (WIP)

### Changed
- Updated User model to include recipe_count

### Fixed
- Fixed TypeORM lazy loading issue

---

## [0.2.0] - 2025-11-11

### Added
- User authentication with JWT
- Password hashing with bcrypt
- `/login` endpoint
- `/register` endpoint
- Email validation
- Test suite for auth routes
- TypeScript strict mode configuration

### Changed
- Updated project structure to feature-based modules
- Improved error handling in middleware

### Fixed
- Fixed connection pool timeout issues

### Dependencies Added
- bcrypt v5.1.0
- jsonwebtoken v9.0.0
- @types/express v4.17.17

### Files Changed
- src/config/database.ts
- package.json
- .eslintrc.json

### Performance
- Auth routes: <50ms response time
- Database connections: Pooled (10 connections)

---

## [0.1.0] - 2025-11-10

### Added
- Initial project setup
- Express server configuration
- PostgreSQL database connection via TypeORM
- User model schema
- Basic routing structure
- .gitignore and environment setup

### Files Created
- src/
- tests/
- .env.example
- tsconfig.json

---

## Format Guide

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of security issues

---
```

---

## BEST PRACTICES

### ✅ ДО (правильно):

```markdown
# CONTEXT.md

## 🎯 Current Task
Add Recipe model with relationships to User

## ✅ Already Completed
- ✅ User model (DONE 2025-11-11)
- ✅ Authentication routes (DONE 2025-11-10)

## 🚀 What Needs to Be Done
1. Create Recipe model (NOT STARTED)
2. Create Recipe routes (NOT STARTED)
3. Write Recipe tests (NOT STARTED)

## 📁 Files to Work With
### WILL MODIFY
- src/models/Recipe.ts (CREATE NEW)
- src/routes/recipe.routes.ts (CREATE NEW)

### DO NOT TOUCH
- src/middleware/auth.ts (stable)
- src/config/database.ts (stable)

## 🚫 Constraints
- Use TypeORM like User model
- Must pass TypeScript strict mode
- No raw SQL queries
```

### ❌ НЕ ТАК (неправильно):

```markdown
# Context

Add recipe stuff and some routes

Already did user thing

Need to do recipe model

Maybe modify some files
```

---

### 📝 Что вытаскивать из проекта в CONTEXT.md?

**ОБЯЗАТЕЛЬНО:**

1. **Какие модели уже есть** (User, Product, etc.)
   ```markdown
   ✅ User.ts (password, email, roles)
   ```

2. **Какие роуты работают** (auth, users, etc.)
   ```markdown
   ✅ POST /auth/login
   ✅ POST /auth/register
   ```

3. **Какие файлы НЕ трогать** (stable, critical)
   ```markdown
   DO NOT TOUCH:
   - src/config/database.ts
   - src/middleware/auth.ts
   ```

4. **Какие зависимости** (версии пакетов)
   ```markdown
   - Express 4.18.2
   - TypeORM 0.3.16
   - bcrypt 5.1.0
   ```

5. **Какие ограничения** (code style, patterns)
   ```markdown
   - 2 spaces indentation
   - TypeScript strict mode
   - Jest for testing
   - 80% coverage minimum
   ```

6. **Какие ошибки встречались** (known issues)
   ```markdown
   ⚠️ TypeORM lazy loading sometimes fails
   ⚠️ JWT token expiry not implemented yet
   ```

7. **Какие следующие шаги** (what's next)
   ```markdown
   Next: Create Recipe model, then routes, then tests
   ```

---

### 🎯 На что сделать акценты?

#### 1️⃣ АКЦЕНТ НА PATTERN MATCHING
```markdown
## Follow Existing Patterns

### User Model (existing - reference this)
- src/models/User.ts
- Uses @Entity, @Column, @ManyToOne
- Has password hashing in beforeInsert hook

### NEW Recipe Model (create like User)
- src/models/Recipe.ts
- Should follow SAME pattern
- Will have @ManyToOne relation to User
```

#### 2️⃣ АКЦЕНТ НА ЗАВИСИМОСТИ
```markdown
## Dependencies to Use
- TypeORM (for models) - ALREADY INSTALLED
- Express (for routes) - ALREADY INSTALLED
- Jest (for tests) - ALREADY INSTALLED

## Dependencies NOT to Add
- Ask before adding new packages!
- Changes to package.json need approval
```

#### 3️⃣ АКЦЕНТ НА CRITICAL FILES
```markdown
## 🚫 DO NOT CHANGE (without approval)

- src/config/database.ts (database setup - stable)
- src/middleware/auth.ts (authentication - stable)
- docker-compose.yml (infrastructure - stable)
- package.json (dependencies - ask first)
```

#### 4️⃣ АКЦЕНТ НА CONSTRAINTS
```markdown
## Rules to Follow

MUST:
- [ ] Use TypeScript strict mode
- [ ] Write tests for every feature
- [ ] Follow 2-space indentation
- [ ] Add JSDoc comments
- [ ] Pass TypeScript compilation

SHOULD NOT:
- Raw SQL queries (use TypeORM)
- Skip error handling
- Modify existing stable code
```

---

## Примеры (copy-paste ready)

### Пример 1: Простой проект (начало)

```markdown
# 📋 PROJECT CONTEXT - Chef's Mind API

### Session Info
- **Session ID:** session-2025-11-11-001
- **Status:** IN PROGRESS

---

## 🎯 Current Task
Implement Recipe CRUD endpoints (CREATE, READ, UPDATE, DELETE)

---

## ✅ Already Completed
- ✅ User authentication (JWT + httpOnly cookies)
- ✅ User model with TypeORM
- ✅ Basic Express setup

---

## 🚀 What Needs to Be Done
1. Create src/models/Recipe.ts
2. Create src/routes/recipe.routes.ts
3. Add tests for Recipe CRUD

---

## 📁 Files
### MUST READ (reference these)
- src/models/User.ts (follow this pattern)
- src/routes/auth.routes.ts (follow this pattern)

### WILL CREATE
- src/models/Recipe.ts
- src/routes/recipe.routes.ts
- tests/recipe.test.ts

### DO NOT TOUCH
- src/config/database.ts
- src/middleware/auth.ts
- package.json

---

## 🚫 Constraints
- Use TypeORM relationships (Recipe → User)
- TypeScript strict mode required
- Must pass all tests
- ESLint zero warnings

---

## ⚠️ Known Issues
None yet
```

### Пример 2: Сложный проект (в процессе)

```markdown
# 📋 PROJECT CONTEXT - E-Commerce Platform

### Session Info
- **Session ID:** session-2025-11-11-003
- **Status:** IN PROGRESS
- **Model:** GPT-4o

---

## 🎯 Current Task
Add payment processing with Stripe + create Order model

---

## ✅ Already Completed

### Phase 1: Core Setup ✅
- ✅ User authentication system
- ✅ Product catalog CRUD
- ✅ Shopping cart functionality

### Phase 2: Database ✅
- ✅ User model (with roles: admin, customer)
- ✅ Product model (with inventory tracking)
- ✅ Cart model (many-to-many with Product)

### Phase 3: API (partial) 🚧
- ✅ Auth routes (/login, /register)
- ✅ Product routes (GET /products, POST /products/{id})
- 🚧 Cart routes (70% done - missing DELETE)
- ⏸️ Payment routes (planned for this session)
- ⏸️ Order routes (planned for next session)

---

## 🚀 What Needs to Be Done

### This Session (Payment Processing)
1. **Create Order model**
   - Fields: id, user_id, product_id, quantity, total_price, status
   - Relations: User (many-to-one), Product (many-to-one), Payment (one-to-one)
   - Status: NOT STARTED

2. **Create Payment model**
   - Fields: id, order_id, stripe_payment_id, amount, status
   - Integration: Stripe API
   - Status: NOT STARTED

3. **Implement POST /orders endpoint**
   - Create order in database
   - Call Stripe to process payment
   - Handle payment success/failure
   - Status: NOT STARTED

4. **Write Payment tests**
   - Mock Stripe responses
   - Test success and failure scenarios
   - Status: NOT STARTED

### Next Session
- [ ] Implement order tracking endpoints (GET /orders, GET /orders/{id})
- [ ] Add order history for users
- [ ] Implement refund handling

---

## 📁 Files

### MUST READ (reference these)
- src/models/User.ts (has relationships example)
- src/models/Product.ts (has validation example)
- src/routes/product.routes.ts (follows REST pattern)
- tests/product.test.ts (follows Jest pattern)

### WILL CREATE
- src/models/Order.ts
- src/models/Payment.ts
- src/routes/order.routes.ts
- src/services/stripe.service.ts
- tests/order.test.ts
- tests/payment.test.ts

### WILL MODIFY
- src/models/User.ts (add relation to Order)
- src/config/database.ts (add Order, Payment to entities)

### DO NOT TOUCH
- src/middleware/auth.ts
- src/middleware/validation.ts
- docker-compose.yml
- .env (don't commit this)

---

## 🚫 Constraints

### Technology Stack
- Database: PostgreSQL + TypeORM
- Payment: Stripe (API v3)
- Framework: Express + TypeScript
- Testing: Jest + Supertest

### Code Standards
- 2-space indentation
- JSDoc for public methods
- TypeScript strict mode ✅
- Test coverage ≥ 85%
- No hardcoded secrets (use .env)

### Database Rules
- NO raw SQL (use TypeORM always)
- Migrations auto-run on startup
- Relations use foreign keys
- Soft deletes for orders? (pending decision)

### Stripe Integration
- Use Stripe API key from .env
- Never commit stripe keys
- Test with test_mode credentials
- Handle 3D Secure (if needed)

---

## ⚠️ Known Issues

### Issue 1: Stripe Integration
- Stripe webhook not implemented yet
- Would need: POST /webhooks/stripe
- Planned for: Next phase

### Issue 2: Inventory Management
- No automatic inventory decrease on order
- Currently manual (needs fixing)
- Solution: Add pre-hook to Order creation

### Issue 3: Payment Retry
- If payment fails, no automatic retry
- User must recreate order
- Future: Implement queue system

---

## 💡 Architecture Notes

### Payment Flow
```
User creates order
  ↓
Order model created (status: pending)
  ↓
Call Stripe API
  ↓
If success: Update order (status: paid)
If fail: Update order (status: failed)
  ↓
Return result to user
```

### Database Relations
```
User (1) ──── (Many) Order
Order (1) ──── (1) Payment
Order (Many) ──── (Many) Product (through OrderItem)
```

---

## 📊 Progress Stats

- **Total Lines of Code:** ~2,500
- **Test Coverage:** 87%
- **Database Tables:** 5 (Users, Products, Carts, Orders, Payments)
- **API Endpoints:** 12
- **Time Spent:** 12 hours
- **Estimated Remaining:** 8 hours

---
```

---

## Checklist для проверки

### ✅ Перед тем как передать контекст агенту

- [ ] **CONTEXT.md существует и актуален**
  - [ ] Session ID указан
  - [ ] Current Task ясно описан
  - [ ] Files list точен
  - [ ] Constraints указаны

- [ ] **SESSION.md существует**
  - [ ] История последних 3 сессий
  - [ ] Что было сделано
  - [ ] Какие файлы создавались/изменялись

- [ ] **ARCHITECTURE.md существует**
  - [ ] Key decisions documented
  - [ ] Почему выбранное решение, а не другое
  - [ ] Implications понятны

- [ ] **Файлы хранятся в правильном месте**
  - [ ] `.ai/CONTEXT.md`
  - [ ] `.ai/SESSION.md`
  - [ ] `.ai/ARCHITECTURE.md`
  - [ ] `.ai/CHANGELOG.md`
  - [ ] `.ai/DECISIONS.md`

- [ ] **Содержимое правильное**
  - [ ] Нет чувствительной информации (API keys, passwords)
  - [ ] Нет опечаток в путях файлов
  - [ ] Ссылки на файлы точны
  - [ ] Номера версий актуальны

### ✅ Перед каждой новой сессией

- [ ] Обновлен CONTEXT.md
- [ ] SESSION.md актуален
- [ ] Ограничения понятны
- [ ] Known issues отмечены
- [ ] Файлы готовы для копирования

### ✅ После каждой сессии

- [ ] SESSION.md обновлен с результатами
- [ ] CHANGELOG.md обновлен
- [ ] CONTEXT.md обновлен для следующей сессии
- [ ] Любые новые решения в DECISIONS.md
- [ ] Файлы скомитены в git (или сохранены в `.ai/`)

---

## 🚀 ИТОГОВЫЙ WORKFLOW

### Как это работает на практике:

```
1️⃣ ТЫ СОЗДАЕШЬ ПРОЕКТ
   ├─ Создаешь папку `.ai/`
   ├─ Пишешь CONTEXT.md (текущая задача)
   └─ Пишешь ARCHITECTURE.md (почему так)

2️⃣ ПЕРВАЯ СЕССИЯ С АГЕНТОМ
   ├─ Копируешь CONTEXT.md в чат
   ├─ Копируешь AGENT_INSTRUCTIONS.md
   ├─ Агент читает контекст
   └─ Агент пишет код

3️⃣ КОНЕЦ ПЕРВОЙ СЕССИИ
   ├─ Агент пишет SESSION.md (что сделал)
   ├─ Ты сохраняешь SESSION.md в `.ai/`
   └─ Ты обновляешь CONTEXT.md для следующей

4️⃣ ВТОРАЯ СЕССИЯ (НОВЫЙ ЧАТ!)
   ├─ Копируешь CONTEXT.md (обновленный)
   ├─ Копируешь SESSION.md (что было сделано)
   ├─ Копируешь ARCHITECTURE.md
   ├─ Копируешь AGENT_INSTRUCTIONS.md
   ├─ Новый агент читает всё
   ├─ Агент продолжает работу
   └─ БЕЗ потери контекста!

5️⃣ ПОВТОРЯЙ ШАГИ 3-4 ДО КОНЦА ПРОЕКТА
```

---

## 📞 ЕСЛИ ЧТО-ТО НЕПОНЯТНО

Реши как **стандартизировать свой процесс**:

1. **Используй эти templates для всех проектов**
2. **Всегда храни файлы в `.ai/` папке**
3. **Обновляй CONTEXT.md каждую сессию**
4. **Сохраняй SESSION.md для истории**
5. **Документируй решения в DECISIONS.md**

Эта система **избавит от потери контекста** и позволит агентам работать **как единая команда**.

---

**ГОТОВО! Это всё что нужно для правильной организации контекста.**

