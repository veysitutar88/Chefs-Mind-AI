# ARCH-01: Risk Register — Chef’s Mind AI

Статус: черновик v0.1  
Дата: 2025-10-15

Легенда приоритета
- P1: блокирующие/критические риски (остановка функций, безопасность, потери данных)
- P2: значимые риски (падение качества, нарушение SLO/SLA, операционные издержки)
- P3: умеренные риски (технический долг, ухудшение UX/наблюдаемости)

P1 — Критические

1) Повреждение узла качества и подмена заглушкой
- Описание: Файл качества содержит бинарный мусор, а в роутере финальный узел экспортирован под видом qualityControlNode.
- Доказательства:
  - [server/graph/nodes/quality_control.ts](../server/graph/nodes/quality_control.ts:1-4)
  - [server/graph/nodes/router.ts](../server/graph/nodes/router.ts:29-34)
  - Использование в раннере: [server/graph/enhanced-graph.ts](../server/graph/enhanced-graph.ts:20-36)
- Влияние: Возможен краш при маршрутизации в Quality, обход QA-проверок.
- Митигации:
  - Переписать узел качества с корректной проверкой ответа, интегрировать QA-Gate.
  - Исправить импорт в [runEnhancedGraphOnce()](../server/graph/enhanced-graph.ts:11) и убрать временный экспорт из роутера.
  - Покрыть smoke-тестами.
- Владелец: Coder; Ревью: Architect; Проверка: Debugger.

2) Не смонтированы критичные маршруты (импорт, админ-DDL, OAuth-тесты, enhanced-agent-chat)
- Описание: Базовый [server/routes.ts](../server/routes.ts:6-68) не монтирует /auth/google, /api/import, /api/dbadmin, /api/enhanced-agent-chat.
- Влияние: Недоступны OAuth-инструменты, импорт данных и DDL-применение; функциональность заблокирована.
- Митигации:
  - Смонтировать роутеры: [server/routes/auth.google.ts](../server/routes/auth.google.ts:1-49), [server/routes/importer.ts](../server/routes/importer.ts:1-253), [server/routes/dbadmin.ts](../server/routes/dbadmin.ts:1-110), [server/routes/enhanced-agent-chat.ts](../server/routes/enhanced-agent-chat.ts:2-255).
  - На все write-операции навесить RBAC+SAFE.
- Владелец: Coder; Ревью: Architect; Проверка: Debugger.

3) Два источника истины по БД и отсутствие миграционной консолидации
- Описание: Drizzle-схемы и параллельный SQL DDL расходятся.
- Доказательства:
  - Drizzle: [shared/schema.ts](../shared/schema.ts:1-250)
  - SQL DDL: [server/routes/dbadmin.ts](../server/routes/dbadmin.ts:8-90)
- Влияние: Дрейф схемы, нестабильные окружения, ошибки импортов.
- Митигации:
  - Перенести DDL в миграции Drizzle; унифицировать схему.
  - Настроить CI-проверку дрейфа.
- Владелец: Architect; Исполнитель: Coder; Проверка: Debugger.

4) Отсутствует создание событий календаря (оплата/доставка/фоллоу-ап) и REST-слой
- Описание: В [server/services/google-mcp.ts](../server/services/google-mcp.ts:1-31) нет createEvent; в тестовом роуте create_event Not implemented.
- Доказательства: [server/routes/enhanced-agent-chat.ts](../server/routes/enhanced-agent-chat.ts:243-255)
- Влияние: Невозможна автоматизация напоминаний и процессов.
- Митигации:
  - Реализовать createEvent (Primary календарь, напоминания -24ч/-1ч, без приглашений).
  - Добавить POST /api/calendar/payment|delivery|followup с RBAC+SAFE.
- Владелец: Coder; Ревью: Architect; Проверка: Debugger.

P2 — Значимые

5) Наблюдаемость p95 и алертинг Prometheus отсутствуют
- Описание: Есть /metrics, но цели p95 и алерты не определены.
- Доказательства: [server/metrics.ts](../server/metrics.ts:101-117)
- Влияние: Нет контроля SLO, запаздывающие реакции.
- Митигации:
  - Ввести Histogram/Summary для HTTP и ключевых ИИ-операций, цели p95.
  - Добавить пример алертов в [docs/prometheus_alerts_example.yaml](./prometheus_alerts_example.yaml).
- Владелец: Architect; Исполнитель: Coder; Проверка: Debugger.

6) Неполное покрытие RBAC+SAFE на write-эндпоинтах
- Описание: SAFE реализован, RBAC есть, но не везде применены.
- Доказательства:
  - SAFE: [server/middleware/safeMode.ts](../server/middleware/safeMode.ts:10-25)
  - RBAC: [server/middleware/rbac.ts](../server/middleware/rbac.ts:35-84)
  - JWT: [server/middleware/jwtAuth.ts](../server/middleware/jwtAuth.ts:19-64)
- Влияние: Риск несанкционированных изменений и инцидентов.
- Митигации:
  - Обязательное сочетание RBAC+SAFE+JWT на /api/import/*, /api/db/*, /api/media/*, /api/calendar/*.
- Владелец: Coder; Ревью: Architect.

7) Нет API для ручного backup/restore с валидацией артефакта по SHA256
- Описание: Планировщик есть, ручного управления нет.
- Доказательства: [server/services/backupScheduler.ts](../server/services/backupScheduler.ts:239-265)
- Влияние: Операционные риски при инцидентах.
- Митигации:
  - Добавить /api/db/backup и /api/db/restore (RBAC+SAFE), проверку sha256, список артефактов.
- Владелец: Coder; Ревью: Architect.

P3 — Умеренные

8) Эвристический роутинг агентов без контекстного планирования
- Описание: Простые ключевые слова для выбора агента.
- Доказательства: [server/graph/nodes/orchestrator.ts](../server/graph/nodes/orchestrator.ts:31-41)
- Влияние: Некачественная маршрутизация на сложных сценариях.
- Митигации:
  - Ввести планировщик на основе LLM и правил, A/B сопоставление.
- Владелец: Architect.

9) Валидации импорта ограничены, риск неверных типов/полей
- Описание: Импорт поддерживает CSV/HTML, но типизация слабая.
- Доказательства: [server/routes/importer.ts](../server/routes/importer.ts:20-216)
- Влияние: Некорректные данные, скрытые ошибки.
- Митигации:
  - Zod-схемы для таблиц импорта, жесткие whitelist полей, проверки ссылочной целостности.
- Владелец: Coder.

10) Риск двойного монтирования /metrics
- Описание: /metrics есть и в metrics.mountMetrics, и в routes.ts.
- Доказательства: [server/metrics.ts](../server/metrics.ts:115-117), [server/routes.ts](../server/routes.ts:17-19)
- Влияние: Конфликты и метрическая неоднозначность.
- Митигации:
  - Оставить единый путь монтирования, централизовать вызов.
- Владелец: Coder.

Журнал решений (Design log)
- Источник истины по БД: Drizzle + миграции; перенос DDL из runtime-эндпоинтов в миграции.
- Календарь: Primary, напоминания -24ч/-1ч, без приглашений, REST-эндпоинты с RBAC+SAFE.
- Наблюдаемость: цели p95 и алертинг Prometheus обязательны.
- Диаграмма архитектуры: [docs/arch_flow.drawio](./arch_flow.drawio) — многослойная (Agents, Services, DB, SAFE/RBAC, Observability).

Приложения и ссылки
- Архитектурный обзор: [docs/architecture_review.md](./architecture_review.md)
- Кодовые точки: [runEnhancedGraphOnce()](../server/graph/enhanced-graph.ts:11), [enhancedRouteToAgent()](../server/graph/nodes/router.ts:7), [qaGateMiddleware()](../server/middleware/qaGate.ts:16), [requireWriteConfirm()](../server/middleware/safeMode.ts:10), [getMetricsHandler()](../server/metrics.ts:102)