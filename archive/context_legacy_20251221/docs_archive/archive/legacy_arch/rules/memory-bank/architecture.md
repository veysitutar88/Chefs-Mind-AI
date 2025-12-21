# Chef's Mind AI — Architecture Memory

## Обзор
Платформа построена на модульном backend (Express) с чёткой декомпозицией по слоям:
- Вход: HTTP API на базе Express — [server/index.ts](server/index.ts), [server/routes.ts](server/routes.ts)
- Слой middleware: аутентификация/авторизация/безопасность/метрики — [server/middleware/*](server/middleware/)
- Домены/маршруты: health, media, calendar, importer, dbadmin, agent-chat, universal — [server/routes/*](server/routes/)
- Интеграции/сервисы: OpenAI, Google (Gemini/Vertex/Calendar), STT и др. — [server/services/*](server/services/)
- Агентная логика: граф узлов/оркестрация — [server/graph/*](server/graph/)
- Данные: PostgreSQL (Drizzle ORM, миграции), схемы — [shared/schema.ts](shared/schema.ts), миграции — [drizzle/migrations](drizzle/migrations)
- Наблюдаемость: Prometheus метрики/алерты — [server/metrics.ts](server/metrics.ts), [prometheus/alerts.yml](prometheus/alerts.yml)
- Тесты: Vitest (unit + integration) — [vitest.config.ts](vitest.config.ts), [tests/*](tests/)

Обязательные принципы разработки — [00_core_principles.md](../00_core_principles.md).

## Runtime топология
- Backend (Node/Express) — [server/index.ts](server/index.ts)
- PostgreSQL (compose-сервис db) — [docker-compose.prod.yml](docker-compose.prod.yml)
- (Опционально) Frontend (Next.js, отдельные пакеты) — [frontend](frontend/), [frontend-enhanced](frontend-enhanced/)

Порты (по умолчанию):
- Backend: 5001 (хост) → приложение слушает `PORT` из окружения
- PostgreSQL: 5432 (хост) → 5432 (контейнер)

## Слой middleware
- JWT/сессии/безопасность:
  - JWT — [server/middleware/jwtAuth.ts](server/middleware/jwtAuth.ts)
  - RBAC — [server/middleware/rbac.ts](server/middleware/rbac.ts)
  - Safe Mode (write-подтверждение) — [server/middleware/safeMode.ts](server/middleware/safeMode.ts)
  - CORS/Helmet/Session — [server/index.ts](server/index.ts), [server/session.ts](server/session.ts)
- Наблюдаемость/качество:
  - HTTP метрики — [server/middleware/metrics.ts](server/middleware/metrics.ts)
  - Error handler — [server/middleware/errorHandler.ts](server/middleware/errorHandler.ts)
  - QA gate — [server/middleware/qaGate.ts](server/middleware/qaGate.ts)

## Маршруты (API)
- Health — [server/routes/health.ts](server/routes/health.ts) (также регистрируется в [server/routes.ts](server/routes.ts))
- Media — [server/routes/media.ts](server/routes/media.ts)
- Calendar (payment/delivery/followup) — [server/routes/calendar.ts](server/routes/calendar.ts)
- Импорт/админ БД — [server/routes/importer.ts](server/routes/importer.ts), [server/routes/dbadmin.ts](server/routes/dbadmin.ts)
- Агентные чаты — [server/routes/agent-chat.ts](server/routes/agent-chat.ts), [server/routes/enhanced-agent-chat.ts](server/routes/enhanced-agent-chat.ts)
- Универсальный интерфейс — [server/routes/universal.ts](server/routes/universal.ts)
- Вспомогательные/безопасность — [server/routes/safe.ts](server/routes/safe.ts)

Все write‑операции должны проходить через RBAC (роль admin) и Safe Mode (заголовок X-Confirm-Code), согласно [server/middleware/rbac.ts](server/middleware/rbac.ts) и [server/middleware/safeMode.ts](server/middleware/safeMode.ts).

## Сервисы/интеграции
- OpenAI (текст/изображения) — [server/services/openai.ts](server/services/openai.ts)
- Google/Vertex/Gemini — [server/services/gemini.ts](server/services/gemini.ts), [server/services/google-mcp.ts](server/services/google-mcp.ts)
- Расширенная медиа-логика с fallback — [server/services/enhanced-media.ts](server/services/enhanced-media.ts)
- STT — [server/services/stt.ts](server/services/stt.ts)
- Прочее: анти‑галлюцинации, SQL‑валидатор, Perplexity — [server/services/*](server/services/)

## Агентный слой (Graph)
- Узлы доменных агентов: Chef/Accountant/Research/Media/Router/Orchestrator — [server/graph/nodes/*](server/graph/nodes/)
- Граф/оркестрация/стриминг — [server/graph/*](server/graph/)
- Качество ответов (quality_control) — [server/graph/nodes/quality_control.ts](server/graph/nodes/quality_control.ts)

## Данные и миграции
- Подключение БД и разделение read/write:
  - Реализация — [server/db.ts](server/db.ts)
  - Чтение — `dbRead`, запись — `dbWrite` (строгое следование принципам)
- Схемы домена — [shared/schema.ts](shared/schema.ts)
- Миграции Drizzle:
  - Конфигурация — [drizzle.config.ts](drizzle.config.ts)
  - Скрипт — [drizzle/migrate.ts](drizzle/migrate.ts)
  - Папка миграций — [drizzle/migrations](drizzle/migrations)
- Бэкапы — [server/routes/dbadmin.ts](server/routes/dbadmin.ts)

## Наблюдаемость и SLO
- Метрики HTTP — [server/middleware/metrics.ts](server/middleware/metrics.ts), агрегатор — [server/metrics.ts](server/metrics.ts)
- Алерты Prometheus (p95 latency, 5xx) — [prometheus/alerts.yml](prometheus/alerts.yml)
- Health‑endpoint: GET /health → `{ ok: true, uptime: number }` — [server/routes.ts](server/routes.ts)

## Безопасность
- Принципы — [00_core_principles.md](../00_core_principles.md)
- RBAC (роль `admin`) — [server/middleware/rbac.ts](server/middleware/rbac.ts)
- Safe Mode (write‑confirm) — [server/middleware/safeMode.ts](server/middleware/safeMode.ts)
- Сессии/куки/защита — [server/session.ts](server/session.ts)
- CORS/Helmet — [server/index.ts](server/index.ts)
- Rate Limiting — [server/config/rateLimit.ts](server/config/rateLimit.ts)

## Тестирование
- Конфиг Vitest — [vitest.config.ts](vitest.config.ts)
- Setup — [tests/setup.ts](tests/setup.ts)
- Unit: валидация окружения — [tests/config/env.schema.test.ts](tests/config/env.schema.test.ts)
- Integration: /health — [tests/routes/health.test.ts](tests/routes/health.test.ts)

## Деплой/запуск
- Docker Compose (backend + db) — [docker-compose.prod.yml](docker-compose.prod.yml)
- Билд/ран: TypeScript → dist, старт через Node — [Dockerfile](Dockerfile)
- Скрипты сборки/фикса ESM — [scripts/fix-esm-extensions.mjs](scripts/fix-esm-extensions.mjs)

## Правила и ограничения (обязательные)
- ESM: все относительные импорты в `.ts` оканчиваются на `.js` — [00_core_principles.md](../00_core_principles.md)
- Валидировать все внешние входы (ENV/requests) через Zod — [server/config/env.schema.ts](server/config/env.schema.ts)
- Разделять чтение/запись БД (`dbRead`/`dbWrite`) — [server/db.ts](server/db.ts)
- Код должен быть типизирован, линтен и покрыт тестами — [package.json](package.json)