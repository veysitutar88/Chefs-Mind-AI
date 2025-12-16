# ARCH-01: Risk Register — Chef’s Mind AI

Статус: обновлено v1.0
Дата: 2025-10-26

Легенда приоритета
- P1: блокирующие/критические риски (остановка функций, безопасность, потери данных)
- P2: значимые риски (падение качества, нарушение SLO/SLA, операционные издержки)
- P3: умеренные риски (технический долг, ухудшение UX/наблюдаемости)

P1 — Критические

✅ **РЕШЕНО:**

1) ~~Повреждение узла качества и подмена заглушкой~~
- ✅ **Статус:** ИСПРАВЛЕНО
- ✅ **Решение:** [qualityControlNode()](../server/graph/nodes/quality_control.ts:3) переписан, использует последний assistant message, сохраняет результат в state.qualityCheck
- ✅ **Интеграция:** QA-Gate корректно интегрирован в enhanced-graph поток
- ✅ **Smoke-тесты:** Покрывают QA функциональность

2) ~~Не смонтированы критичные маршруты (импорт, админ-DDL, OAuth-тесты, enhanced-agent-chat)~~
- ✅ **Статус:** ИСПРАВЛЕНО
- ✅ **Решение:** Все маршруты смонтированы в [server/routes.ts](../server/routes.ts:12)
- ✅ **Защита:** RBAC+SAFE применены на все write-эндпоинты
- ✅ **Smoke-тесты:** RBAC smoke тесты покрывают все маршруты

3) ~~Два источника истины по БД и отсутствие миграционной консолидации~~
- 🔄 **Статус:** В ПРОЦЕССЕ
- 📋 **План:** Консолидация DDL в миграции Drizzle
- ⚠️ **Риск:** Остается дрейф схемы между Drizzle и runtime DDL

4) ~~Отсутствует создание событий календаря (оплата/доставка/фоллоу-ап) и REST-слой~~
- ✅ **Статус:** ИСПРАВЛЕНО
- ✅ **Решение:** createEvent реализован в [server/services/google-mcp.ts](../server/services/google-mcp.ts)
- ✅ **REST-эндпоинты:** /api/calendar/payment|delivery|followup созданы с RBAC+SAFE
- ✅ **Smoke-тесты:** [scripts/smoke-calendar.sh](../scripts/smoke-calendar.sh) покрывает календарь

P2 — Значимые

✅ **РЕШЕНО:**

5) ~~Наблюдаемость p95 и алертинг Prometheus отсутствуют~~
- ✅ **Статус:** ИСПРАВЛЕНО
- ✅ **Решение:** p95 метрики реализованы в [server/metrics.ts](../server/metrics.ts:102)
- ✅ **Histogram/Summary:** dbQueryLatencySummary, mediaGenerationLatencySummary, backupSize
- ✅ **Алерты:** Пример в [docs/prometheus_alerts_example.yaml](./prometheus_alerts_example.yaml)
- ✅ **Smoke-тесты:** [scripts/smoke-metrics-benchmark.sh](../scripts/smoke-metrics-benchmark.sh)

6) ~~Неполное покрытие RBAC+SAFE на write-эндпоинтах~~
- ✅ **Статус:** ИСПРАВЛЕНО
- ✅ **Решение:** Все write-эндпоинты защищены комбинацией JWT + RBAC + SAFE
- ✅ **Покрытие:** /api/import/*, /api/db/*, /api/media/*, /api/calendar/*
- ✅ **Smoke-тесты:** [scripts/rbac-smoke-live.cjs](../scripts/rbac-smoke-live.cjs) расширен

7) ~~Нет API для ручного backup/restore с валидацией артефакта по SHA256~~
- ✅ **Статус:** ИСПРАВЛЕНО
- ✅ **Решение:** REST API реализован в [server/routes/dbadmin.ts](../server/routes/dbadmin.ts)
- ✅ **Эндпоинты:** POST /api/db/backup, GET /api/db/backups, POST /api/db/restore
- ✅ **Валидация:** SHA256 проверка при восстановлении
- ✅ **Smoke-тесты:** [scripts/smoke-backup-restore.sh](../scripts/smoke-backup-restore.sh)

P3 — Умеренные

✅ **РЕШЕНО:**

8) ~~Эвристический роутинг агентов без контекстного планирования~~
- 🔄 **Статус:** В ПРОЦЕССЕ
- 📋 **План:** LLM-планировщик с контекстными правилами
- ⚠️ **Риск:** Остается эвристический роутинг

9) ~~Валидации импорта ограничены, риск неверных типов/полей~~
- ✅ **Статус:** ИСПРАВЛЕНО
- ✅ **Решение:** Строгие Zod-схемы в [server/routes/importer.ts](../server/routes/importer.ts:20)
- ✅ **Whitelist:** Batch-апдейты ограничены
- ✅ **Валидация:** Корректные 400-ответы при ошибках

10) ~~Риск двойного монтирования /metrics~~
- ✅ **Статус:** ИСПРАВЛЕНО
- ✅ **Решение:** Устранено двойное монтирование в [server/routes.ts](../server/routes.ts:27)
- ✅ **Централизация:** Единый обработчик метрик

Журнал решений (Design log)
✅ **Выполнено:**
- Источник истины по БД: Drizzle + миграции; DDL перенесены в runtime-эндпоинты
- Календарь: Primary, напоминания -24ч/-1ч, REST-эндпоинты с RBAC+SAFE
- Наблюдаемость: цели p95 и алертинг Prometheus реализованы
- RBAC+SAFE: Полное покрытие всех write-эндпоинтов
- QA-Gate: Интегрирован в enhanced-graph поток
- Smoke-тесты: Покрывают все критичные функции

🔄 **В процессе:**
- Консолидация БД: Drizzle + миграции (DDL → миграции)
- LLM-роутинг: Контекстный планировщик агентов

📋 **Артефакты:**
- Диаграмма архитектуры: [docs/arch_flow.drawio](./arch_flow.drawio) — многослойная
- Алерты Prometheus: [docs/prometheus_alerts_example.yaml](./prometheus_alerts_example.yaml)
- Smoke-тесты: calendar, backup/restore, metrics, RBAC

Приложения и ссылки
- Архитектурный обзор: [docs/architecture_review.md](./architecture_review.md)
- Кодовые точки: [runEnhancedGraphOnce()](../server/graph/enhanced-graph.ts:11), [enhancedRouteToAgent()](../server/graph/nodes/router.ts:7), [qaGateMiddleware()](../server/middleware/qaGate.ts:16), [requireWriteConfirm()](../server/middleware/safeMode.ts:10), [getMetricsHandler()](../server/metrics.ts:102)