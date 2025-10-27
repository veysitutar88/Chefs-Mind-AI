# Chef's Mind AI — Product Memory

## Миссия и ценность
Chef's Mind AI — многоагентная ИИ-платформа для управления рестораном. Ценность продукта:
- Снижение операционных рисков и рутинной нагрузки персонала
- Ускорение принятия решений (закупки, финансы, склад, маркетинг)
- Улучшение качества обслуживания за счет автоматизации коммуникаций и напоминаний

## Ключевые возможности (High-level)
- Многоагентная система:
  - Chef, Accountant, Research, Media, Universal (см. [server/graph/nodes](server/graph/nodes))
- Интеграции:
  - Google OAuth/Sheets/Calendar (см. [server/services/google-mcp.ts](server/services/google-mcp.ts))
  - Эндпоинты календаря: платежи, доставки, фоллоу‑апы (см. [server/routes/calendar.ts](server/routes/calendar.ts))
- Контент и медиа:
  - Генерация изображений через OpenAI/Vertex AI с фолбэком (см. [server/services/enhanced-media.ts](server/services/enhanced-media.ts))
- Наблюдаемость и SLO:
  - /health (ок и аптайм), Prometheus метрики и алерты
- Безопасность:
  - RBAC (admin), SafeMode для write-операций, rate limiting, Helmet, CORS
- Надежность данных:
  - Бэкап/рестор БД (см. [server/routes/dbadmin.ts](server/routes/dbadmin.ts))

## Целевые пользователи
- Владельцы/управляющие ресторанами и кафе
- Операционные менеджеры (доставки/закупки/склад)
- Финансовые менеджеры/бухгалтерия
- Контент‑менеджеры/маркетинг

## Пользовательские сценарии (Examples)
- Менеджер планирует поставку и автоматически создаёт событие в Google Calendar для команды/поставщика — [server/routes/calendar.ts](server/routes/calendar.ts)
- Бухгалтер получает напоминание о платеже и создаёт событие “Payment Due”
- Контент‑менеджер генерирует промо‑изображение нового блюда — [server/services/enhanced-media.ts](server/services/enhanced-media.ts)
- Руководитель проверяет состояние сервиса: GET [server/routes.ts](server/routes.ts) → /health возвращает ok и uptime

## API (основные контуры)
- Health:
  - GET /health → { ok: true, uptime: number } (см. [server/routes.ts](server/routes.ts))
- Calendar (защищено RBAC: admin + SafeMode):
  - POST /api/calendar/payment
  - POST /api/calendar/delivery
  - POST /api/calendar/followup
  - Тело (пример): { startTime: string, description?: string }
  - Middleware: [server/middleware/rbac.ts](server/middleware/rbac.ts), [server/middleware/safeMode.ts](server/middleware/safeMode.ts)
- Media:
  - POST /api/media/* (изображения), провайдеры и фолбэки — [server/services/enhanced-media.ts](server/services/enhanced-media.ts)

## Нефункциональные требования
- Принципы разработки — см. [00_core_principles.md](../00_core_principles.md)
  - ESM‑импорты с .js, Zod‑валидация внешних входов, dbRead/dbWrite разделение, покрытие тестами
- Производительность/надёжность:
  - Prometheus метрики + алерты (p95 latency, 5xx rate) — [prometheus/alerts.yml](../../../prometheus/alerts.yml)
  - Rate limiting — [server/config/rateLimit.ts](server/config/rateLimit.ts)

## Текущее состояние (стабильная база)
- P0‑спринт завершён:
  - PostgreSQL в Compose, миграции Drizzle сгенерированы и применены
  - /health OK, бэкенд/фронтенд поднимаются
  - Безопасность: CORS (allowlist), Helmet (CSP), cookies hardened — [server/index.ts](server/index.ts), [server/session.ts](server/session.ts)
  - Read/Write‑БД разделение — [server/db.ts](server/db.ts), Drizzle конфиг — [drizzle.config.ts](drizzle.config.ts)
- P1‑старт:
  - Инициализирован Vitest + пример unit и интеграционного теста — [vitest.config.ts](../../../vitest.config.ts), [tests](../../../tests)

## Основные артефакты продукта (ссылки)
- Входная точка сервера: [server/index.ts](server/index.ts)
- Регистрация маршрутов: [server/routes.ts](server/routes.ts)
- Календарь: [server/routes/calendar.ts](server/routes/calendar.ts)
- RBAC/SafeMode: [server/middleware/rbac.ts](server/middleware/rbac.ts), [server/middleware/safeMode.ts](server/middleware/safeMode.ts)
- Валидация окружения (Zod): [server/config/env.schema.ts](server/config/env.schema.ts)
- Тесты: [tests/config/env.schema.test.ts](../../../tests/config/env.schema.test.ts), [tests/routes/health.test.ts](../../../tests/routes/health.test.ts)
- Compose/БД: [docker-compose.prod.yml](../../../docker-compose.prod.yml), [drizzle/migrate.ts](../../../drizzle/migrate.ts)

## KPI и метрики продукта
- Bootability: успешный запуск стека и /health OK
- Надёжность: p95 latency ≤ целевого порога; 5xx <= 5% (алерты см. [prometheus/alerts.yml](../../../prometheus/alerts.yml))
- Качество: рост покрытия тестами (unit/integration)

## Дальнейшие направления
- Расширение интеграционных тестов (calendar/media)
- Улучшение документации и RUNBOOK
- Автоматизация CI/CD (lint, typecheck, tests, docker build)