# Chef's Mind AI — Tech Memory

## Стек и ключевые зависимости
- Язык/рантайм:
  - TypeScript 5.x, Node.js (ESM, "type": "module") — [package.json](package.json:1), [tsconfig.json](tsconfig.json:1)
- Веб‑сервер:
  - Express 4 — [server/index.ts](server/index.ts:1), [server/routes.ts](server/routes.ts:1)
  - Логирование (morgan) — [server/index.ts](server/index.ts:1)
- Безопасность:
  - helmet, cors — [server/index.ts](server/index.ts:1)
  - express-session (+ Redis/pg store) — [server/session.ts](server/session.ts:1)
  - RBAC/JWT — [server/middleware/rbac.ts](server/middleware/rbac.ts:1), [server/middleware/jwtAuth.ts](server/middleware/jwtAuth.ts:1)
  - SafeMode (подтверждение write) — [server/middleware/safeMode.ts](server/middleware/safeMode.ts:1)
- Наблюдаемость:
  - prom-client, HTTP‑метрики — [server/middleware/metrics.ts](server/middleware/metrics.ts:1), [server/metrics.ts](server/metrics.ts:1)
- База данных:
  - PostgreSQL (pg) — [server/db.ts](server/db.ts:1)
  - Drizzle ORM + миграции — [drizzle.config.ts](drizzle.config.ts:1), [drizzle/migrate.ts](drizzle/migrate.ts:1), [drizzle/migrations](drizzle/migrations:1)
  - Доменные схемы — [shared/schema.ts](shared/schema.ts:1)
- Интеграции ИИ/внешние сервисы:
  - OpenAI — [server/services/openai.ts](server/services/openai.ts:1)
  - Google (Gemini/Vertex/Calendar/MCP) — [server/services/gemini.ts](server/services/gemini.ts:1), [server/services/google-mcp.ts](server/services/google-mcp.ts:1)
  - Медиа сервис с fallback — [server/services/enhanced-media.ts](server/services/enhanced-media.ts:1)
- Тестирование:
  - Vitest (unit + integration) — [vitest.config.ts](vitest.config.ts:1), [tests](tests:1)
  - supertest — [tests/routes/health.test.ts](tests/routes/health.test.ts:1)

## Сборка/запуск/скрипты
- Скрипты — [package.json](package.json:1)
  - dev: сервер в watch‑режиме через tsx, порт по умолчанию 5001
    - "dev": "npm run dev:server"
    - "dev:server": "cross-env NODE_ENV=development PORT=5001 tsx watch server/index.ts"
  - build: компиляция TypeScript → dist
    - "build": "npm run build:server"
    - "build:server": "cross-env NODE_OPTIONS=--max_old_space_size=4096 tsc -p tsconfig.json"
    - "postbuild": "node scripts/fix-esm-extensions.mjs dist"
  - start (production): "cross-env NODE_ENV=production node dist/server/index.js"
  - тесты:
    - "test": "vitest run"
    - "test:watch": "vitest"
    - "test:coverage": "vitest run --coverage"
  - drizzle (вариативно): generate/migrate/push — [drizzle.config.ts](drizzle.config.ts:1)

## ESM и соглашения импорта
- Проект в ESM‑режиме ("type": "module") — [package.json](package.json:1)
- Жёсткое правило: все относительные импорты в .ts оканчиваются на ".js"
  - Фиксация расширений в dist — [scripts/fix-esm-extensions.mjs](scripts/fix-esm-extensions.mjs:1)
- Правила зафиксированы в ядре — [00_core_principles.md](../00_core_principles.md:1)

## Переменные окружения и валидация
- Пример окружения — [.env.example](.env.example:1)
- Валидация ENV на старте:
  - Быстрая проверка критичных ключей — [server/utils/env.ts](server/utils/env.ts:1) + вызов в [server/index.ts](server/index.ts:1)
  - Схемная валидация через Zod — [server/config/env.schema.ts](server/config/env.schema.ts:1)
- Важные ключи:
  - PORT, NODE_ENV
  - DATABASE_URL, DATABASE_READONLY_URL
  - SESSION_SECRET, COOKIE_DOMAIN
  - SAFE_MODE, CONFIRM_CODE
  - OPENAI_API_KEY
  - GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI/SCOPES, GOOGLE_API_KEY
  - REDIS_URL
  - MEDIA_PROVIDER_DEFAULT, ALLOW_MEDIA_FALLBACK

## База данных и Read/Write разделение
- Подключения и функции доступа — [server/db.ts](server/db.ts:1)
  - dbRead → исключительно SELECT
  - dbWrite → INSERT/UPDATE/DELETE
- Схемы домена — [shared/schema.ts](shared/schema.ts:1)
- Миграции:
  - Хранение — [drizzle/migrations](drizzle/migrations:1)
  - Скрипт запуска — [drizzle/migrate.ts](drizzle/migrate.ts:1)
- Резервное копирование/восстановление — [server/routes/dbadmin.ts](server/routes/dbadmin.ts:1)

## Маршруты и middleware
- Регистрация — [server/routes.ts](server/routes.ts:1)
- Health — [server/routes/health.ts](server/routes/health.ts:1) (GET /health → { ok, uptime })
- Media — [server/routes/media.ts](server/routes/media.ts:1)
- Calendar — [server/routes/calendar.ts](server/routes/calendar.ts:1) (payment/delivery/followup)
- Безопасность:
  - RBAC — [server/middleware/rbac.ts](server/middleware/rbac.ts:1)
  - SafeMode — [server/middleware/safeMode.ts](server/middleware/safeMode.ts:1)
  - JWT — [server/middleware/jwtAuth.ts](server/middleware/jwtAuth.ts:1)
  - CORS/Helmet/Session — [server/index.ts](server/index.ts:1), [server/session.ts](server/session.ts:1)
- Метрики — [server/middleware/metrics.ts](server/middleware/metrics.ts:1), [server/metrics.ts](server/metrics.ts:1)

## Тестирование
- Конфигурация — [vitest.config.ts](vitest.config.ts:1)
- Setup — [tests/setup.ts](tests/setup.ts:1)
- Unit:
  - Валидация окружения — [tests/config/env.schema.test.ts](tests/config/env.schema.test.ts:1)
- Integration:
  - /health — [tests/routes/health.test.ts](tests/routes/health.test.ts:1)
- Хелперы:
  - Фабрика приложения — [tests/helpers/app.ts](tests/helpers/app.ts:1)
  - Агрегатор middleware для тестов — [server/middleware/index.ts](server/middleware/index.ts:1)

## Сборка/доставка (Docker/Compose)
- Compose (backend + db) — [docker-compose.prod.yml](docker-compose.prod.yml:1)
  - backend зависит от db (healthcheck)
  - postgres:15‑alpine, проброс 5432
- Dockerfile (Node, build → dist → run) — [Dockerfile](Dockerfile:1)

## Политики качества и принципы
- Базовые принципы — [00_core_principles.md](../00_core_principles.md:1)
  - ESM Above All
  - Read/Write Segregation (dbRead/dbWrite)
  - Zod‑валидация любых внешних входов
  - Production‑ready: типизация, линт, тесты
  - Следовать текущему плану (`CURRENT_TASK`)