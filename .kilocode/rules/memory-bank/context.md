# Chef's Mind AI — Context Memory

## Текущее состояние (P0 завершён, P1 начат)
- Стек стабильно поднимается, endpoint /health возвращает OK.
- Инициализирован фреймворк тестирования (Vitest): unit + integration тесты проходят.
- Базовые принципы проекта закреплены в [00_core_principles.md](../00_core_principles.md).

## Запуск и окружения
- Dev:
  - Команда сервера: смотрите скрипт "dev:server" в [package.json](../../../package.json)
  - По умолчанию слушает порт из ENV `PORT` (дефолт 5001), см. [server/index.ts](../../../server/index.ts)
  - Быстрая проверка: GET /health
- Prod-like (compose):
  - Оркестрация описана в [docker-compose.prod.yml](../../../docker-compose.prod.yml)
  - Backend собирается (tsc → dist) и запускается node dist/server/index.js (см. скрипты в [package.json](../../../package.json))
- ENV:
  - Пример значений — [.env.example](../../../.env.example)
  - Валидация на старте — [server/utils/env.ts](../../../server/utils/env.ts) + использование в [server/index.ts](../../../server/index.ts)
  - Схемная валидация Zod — [server/config/env.schema.ts](../../../server/config/env.schema.ts)

## API (краткая сводка)
- Health:
  - GET /health → { ok: true, uptime: number } (регистрируется в [server/routes.ts](../../../server/routes.ts), реализация [server/routes/health.ts](../../../server/routes/health.ts))
- Media:
  - POST /api/media/* — генерация изображений/медиа, fallback-поведение — [server/routes/media.ts](../../../server/routes/media.ts), [server/services/enhanced-media.ts](../../../server/services/enhanced-media.ts)
- Calendar:
  - POST /api/calendar/payment
  - POST /api/calendar/delivery
  - POST /api/calendar/followup
  - Требует RBAC: admin и Safe Mode подтверждение (см. ниже). Роутер — [server/routes/calendar.ts](../../../server/routes/calendar.ts)

## Безопасность и политики
- Базовые принципы — [00_core_principles.md](../00_core_principles.md)
  - ESM: все относительные импорты в .ts оканчиваются на .js
  - Read/Write разделение БД: `dbRead` (SELECT), `dbWrite` (INSERT/UPDATE/DELETE) — [server/db.ts](../../../server/db.ts)
  - Валидация внешних входов через Zod — [server/config/env.schema.ts](../../../server/config/env.schema.ts)
- RBAC:
  - Middleware — [server/middleware/rbac.ts](../../../server/middleware/rbac.ts)
  - Защищать write‑эндпоинты и админ-маршруты
- Safe Mode:
  - Middleware — [server/middleware/safeMode.ts](../../../server/middleware/safeMode.ts)
  - По умолчанию SAFE_MODE=on: write‑операции требуют заголовок X-Confirm-Code со значением из `CONFIRM_CODE`
  - Инфо‑роут статуса — [server/routes/safe.ts](../../../server/routes/safe.ts)
- Сессии/CORS/Helmet:
  - Инициализация — [server/index.ts](../../../server/index.ts), [server/session.ts](../../../server/session.ts)
- Rate limiting:
  - Конфиг — [server/config/rateLimit.ts](../../../server/config/rateLimit.ts)

## Данные и миграции
- PostgreSQL + Drizzle ORM
  - Конфигурация — [drizzle.config.ts](../../../drizzle.config.ts)
  - Запуск миграций — [drizzle/migrate.ts](../../../drizzle/migrate.ts)
  - Снимки миграций — [drizzle/migrations](../../../drizzle/migrations)
- Доменные схемы — [shared/schema.ts](../../../shared/schema.ts)
- Backup/Restore — [server/routes/dbadmin.ts](../../../server/routes/dbadmin.ts)

## Тестирование и качество
- Конфигурация Vitest — [vitest.config.ts](../../../vitest.config.ts)
- Setup — [tests/setup.ts](../../../tests/setup.ts)
- Unit:
  - ENV schema тест — [tests/config/env.schema.test.ts](../../../tests/config/env.schema.test.ts)
- Integration:
  - /health — [tests/routes/health.test.ts](../../../tests/routes/health.test.ts)
- Хелперы:
  - Фабрика приложения для тестов — [tests/helpers/app.ts](../../../tests/helpers/app.ts)
  - Агрегатор middleware — [server/middleware/index.ts](../../../server/middleware/index.ts)
- Покрытие — @vitest/coverage-v8

## Наблюдаемость
- HTTP метрики — [server/middleware/metrics.ts](../../../server/middleware/metrics.ts)
- Агрегатор/регистрация — [server/metrics.ts](../../../server/metrics.ts)
- Алерты Prometheus — [prometheus/alerts.yml](../../../prometheus/alerts.yml)

## Интеграции и внешние сервисы
- OpenAI — [server/services/openai.ts](../../../server/services/openai.ts)
- Google:
  - Gemini/Vertex AI — [server/services/gemini.ts](../../../server/services/gemini.ts)
  - MCP интеграция/Calendar — [server/services/google-mcp.ts](../../../server/services/google-mcp.ts)
- Enhanced Media (fallback) — [server/services/enhanced-media.ts](../../../server/services/enhanced-media.ts)

## MCP конфигурация
- Файл — [.kilocode/mcp.json](../../../.kilocode/mcp.json)
  - context7: npx @upstash/context7-mcp
  - neon: npx mcp-remote https://mcp.neon.tech/sse
- Примечание: переменные окружения для MCP могут потребоваться отдельно (проверьте поставщиков).

## Рабочие процессы (workflows)
- Prod redeploy workflow — [.kilocode/workflows/pr1f_redeploy.md](../../../.kilocode/workflows/pr1f_redeploy.md)
  - Использует docker compose down/up, smoke для фронтенда (:3000), чекпоинт

## Известные решения/ограничения
- SAFE_MODE по умолчанию ON — требует подтверждения для всех write‑операций.
- Строгая ESM дисциплина: относительные импорты в .ts оканчиваются на .js; postbuild фиксит расширения — [scripts/fix-esm-extensions.mjs](../../../scripts/fix-esm-extensions.mjs)
- Файлы [.kilocode/rules/memory-bank.md](../../../.kilocode/rules/memory-bank.md) и [.kilocode/rules/memory-bank1.md](../../../.kilocode/rules/memory-bank1.md) считаются легаси‑сводками; используйте новые документы в каталоге memory-bank/.

## Следующие шаги (P1)
- Расширить интеграционные тесты (media/calendar) с учётом RBAC и Safe Mode.
- Подготовить RUNBOOK и CI (lint, typecheck, test, docker build).
- Дополнить алерты Prometheus и базовые Grafana‑дашборды.