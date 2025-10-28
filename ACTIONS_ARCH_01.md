# ARCH-01 — Action Plan (Atomic Tasks)

Статус: черновик v0.1  
Дата: 2025-10-15

Цель
- Завершить архитектурные правки по слоям: агенты→сервисы→БД/файлы/календарь; устранить P1/P2; подготовить наблюдаемость и артефакты.

Ссылки на артефакты обзора
- Обзор: [docs/architecture_review.md](docs/architecture_review.md)
- Диаграмма: [docs/arch_flow.mmd](docs/arch_flow.mmd) → целевая [docs/arch_flow.drawio](docs/arch_flow.drawio)
- Реестр рисков: [docs/risk_register.md](docs/risk_register.md)

Кодовые точки (быстрые переходы)
- Граф раннер [runEnhancedGraphOnce()](server/graph/enhanced-graph.ts:11)
- Оркестр [enhancedOrchestratorNode()](server/graph/nodes/orchestrator.ts:31)
- Роутер [enhancedRouteToAgent()](server/graph/nodes/router.ts:7), финал [finalAnswerNode()](server/graph/nodes/router.ts:29)
- Узел качества [qualityControlNode()](server/graph/nodes/quality_control.ts:3)
- QA-Gate [qaGateMiddleware()](server/middleware/qaGate.ts:16), логгер [logQAResult()](server/middleware/qaGate.ts:44)
- Роуты [registerRoutes()](server/routes.ts:6), метрики [getMetricsHandler()](server/metrics.ts:102)
- Google OAuth роуты [auth.google](server/routes/auth.google.ts:11), сервис [google-mcp](server/services/google-mcp.ts:1)
- Импорт [importer](server/routes/importer.ts:20), DDL [dbadmin](server/routes/dbadmin.ts:8)
- SAFE [requireWriteConfirm()](server/middleware/safeMode.ts:10), RBAC [requireAuth()](server/middleware/rbac.ts:35), JWT [jwtAuthMiddleware()](server/middleware/jwtAuth.ts:19)

Роли
- Orchestrator: план, расстановка зависимостей, переключение режимов
- Coder: реализация кода и миграций
- Debugger: проверка, smoke, измерения
- Docs: документация, диаграммы, регламенты

Рабочие пакеты и атомарные задачи

A) Agent Graph & QA
- A1 [Coder] Починить узел качества
  - Исправить [qualityControlNode()](server/graph/nodes/quality_control.ts:3) (переписать файл в валидный TS, вернуть в state метки QA).
  - Прекратить временный экспорт из роутера: удалить переэкспорт [finalAnswerNode()](server/graph/nodes/router.ts:29) как qualityControlNode.
  - Обновить импорты в [runEnhancedGraphOnce()](server/graph/enhanced-graph.ts:20-36) на реальный узел.
  - Acceptance: маршрутизация в агент Quality работает; нет runtime-ошибок.
- A2 [Coder] Включить QA-Gate на ответных HTTP-эндпоинтах чатов
  - Обернуть роуты agent chat (в т.ч. [server/routes/enhanced-agent-chat.ts](server/routes/enhanced-agent-chat.ts:2)) в [qaGateMiddleware()](server/middleware/qaGate.ts:16) и логировать [logQAResult()](server/middleware/qaGate.ts:44).
  - Acceptance: запись в logs/task_Q1.json появляется; при низком QA-score выставляются причины.

B) Routing & Middleware
- B1 [Coder] Смонтировать отсутствующие роуты в [registerRoutes()](server/routes.ts:6)
  - Подключить /auth/google, /api/import, /api/dbadmin, /api/enhanced-agent-chat; проверить, что /metrics не монтируется дважды.
  - Acceptance: все пути доступны, /metrics единожды.
- B2 [Coder] Усилить защиту write-роутов
  - Применить [jwtAuthMiddleware()](server/middleware/jwtAuth.ts:19) + [requireAuth()](server/middleware/rbac.ts:35) + [requireRole()](server/middleware/rbac.ts:47) и [requireWriteConfirm()](server/middleware/safeMode.ts:10) на /api/import/*, /api/db/*, /api/media/*, /api/calendar/*.
  - Acceptance: без токена/роли/кода изменения заблокированы; лог RBAC пишется в logs/rbac_smoke.json.

C) Database Consolidation (Drizzle as SoT)
- C1 [Orchestrator] Принять решение SoT: Drizzle + миграции; runtime DDL депрекейт
  - Зафиксировать в docs/architecture_review.md; согласовать с командой.
- C2 [Coder] Перенести SQL DDL из [dbadmin](server/routes/dbadmin.ts:8-90) в миграции Drizzle
  - Синхронизировать сущности: units, suppliers, categories, ingredients, ingredient_prices, recipes, recipe_components, recipe_cost_snapshots.
  - Acceptance: миграции применяются чисто; таблицы совпадают с текущей БД.
- C3 [Coder] Спроектировать недостающие доменные сущности
  - orders, purchase_orders, attachments, notes, calendar_links — добавить в [shared/schema.ts](shared/schema.ts:1).
  - Определить индексы, уникальные ключи, FK, идемпотентность (upsert-стратегии).
  - Acceptance: типы Drizzle компилируются; миграции генерируются; простые select/insert работают.
- C4 [Coder] Ограничить/депрекейтнуть /api/db/apply-ddl
  - Оставить только под RBAC+SAFE; пометить как операционный, с предупреждением в ответе.
  - Acceptance: ручной DDL по API недоступен без RBAC+SAFE; в ответе заметный warning.

D) Import + SAFE/RBAC
- D1 [Coder] Расширить валидации импорта
  - Zod-схемы соответствия полей, строгий whitelist для batch-апдейтов в [importer](server/routes/importer.ts:20-216).
  - Acceptance: некорректные файлы получают 400; валидные загружаются с upsert и отчётом affected.
- D2 [Debugger] Smoke импорт
  - CSV и HTML-таблица на 2-3 таблицы; задержки и успешность логируются.

E) OAuth/Calendar
- E1 [Coder] Реализовать createEvent в [google-mcp](server/services/google-mcp.ts:1)
  - Primary календарь авторизованного аккаунта; напоминания -24h и -1h; без приглашений участников.
  - Acceptance: функция создаёт событие и возвращает id/ссылку.
- E2 [Coder] REST-эндпоинты событий
  - POST /api/calendar/payment|delivery|followup с RBAC+SAFE → вызывает createEvent; базовая схема тела (title, date/time, notes, tags).
  - Acceptance: запрос создаёт событие; запись в лог; ошибки OAuth обрабатываются 4xx/5xx.
- E3 [Coder] Smoke Google в [auth.google](server/routes/auth.google.ts:31)
  - Добавить тестирование create_event и расширить /google/status данными по токенам/скоупам.
  - Acceptance: ручная проверка через curl/UI.

F) Backup/DR
- F1 [Coder] Ручной backup/restore API поверх [backupScheduler](server/services/backupScheduler.ts:239)
  - POST /api/db/backup — запуск pg_dump+gzip, запись sha256; GET /api/db/backups — список; POST /api/db/restore — восстановление по имени+sha256 чек.
  - RBAC+SAFE обязательны.
  - Acceptance: резервные копии создаются; restore требует точного sha256; логи в logs/task_B1_cron.json/новый лог для ручных операций.
- F2 [Docs] Регламент ручного prune и валидации артефактов
  - Документ в docs/ с процедурами и рисками.

G) Observability p95
- G1 [Coder] Добавить p95 метрики
  - Histogram/Summary для HTTP и ключевых ИИ-операций в [server/metrics.ts](server/metrics.ts:15-99) + цель p95.
  - Исключить двойной /metrics (оставить [mountMetrics()](server/metrics.ts:115) или маршрутизацию в [routes.ts](server/routes.ts:17), но не оба).
  - Acceptance: /metrics содержит новые серии; нет дублей маршрута.
- G2 [Docs] Пример алертов Prometheus
  - docs/prometheus_alerts_example.yaml с правилами на p95 и ошибки; описание подключения.
  - Acceptance: файл валидируется promtool.

H) Frontend Enhanced
- H1 [Coder] Панель статусов и действий
  - OAuth статус (страница/виджет), кнопки smoke calendar events, импорт с X-Confirm-Code, индикаторы RBAC ошибок; дашборд health/metrics.
  - Acceptance: UI демонстрирует статусы и выполняет действия; ошибки читаемы.
- H2 [Debugger] UI smoke
  - Скрипт или чек-лист взаимодействий и скриншоты; замеры p95 UI-операций (базово).

I) Frontend Simple
- I1 [Coder] Минимальная интеграция
  - Отобразить статус OAuth; форма импорта с X-Confirm-Code; кнопка smoke calendar.
  - Acceptance: базовые сценарии работают.

J) Smoke Scripts
- J1 [Coder] Скрипты в scripts/
  - Добавить сценарии для /api/calendar/*, /api/db/backup|restore; расширить rbac-smoke; добавить metrics-бенчмарки.
  - Acceptance: скрипты выполняются без ручных правок, логируют результат.

Зависимости/порядок (критичный)
1) A1, B1 → E1/E2, D1, F1, G1 (маршруты и качество до фич)  
2) C1→C2→C3→D1 (сначала консолидация схем)  
3) B2 и SAFE обязательны для E2, F1, D1  
4) G1 до H1/H2 (чтобы UI видел новые метрики)  

Критерии приёмки ARCH-01 (DoD)
- P1 устранены:
  - Реальный [qualityControlNode()](server/graph/nodes/quality_control.ts:3), без заглушек в роутере.
  - Смонтированы критичные роуты; write-эндпоинты защищены RBAC+SAFE+JWT.
  - SoT БД — Drizzle с миграциями; runtime DDL ограничен/депрекейтнут.
  - Calendar: createEvent работает; REST payment/delivery/followup доступны и защищены.
- P2 закрыты:
  - p95 метрики реализованы; пример алертов подготовлен.
  - Backup/restore ручные маршруты работают с sha256.
- Документы актуализированы:
  - [docs/architecture_review.md](docs/architecture_review.md), [docs/risk_register.md](docs/risk_register.md), [docs/arch_flow.drawio](docs/arch_flow.drawio) готова; mmd приложена как вспомогательная.

Отметки по безопасности
- Любые изменения данных — только с X-Confirm-Code [requireWriteConfirm()](server/middleware/safeMode.ts:10) и нужной ролью [requireRole()](server/middleware/rbac.ts:47).
- OAuth-токены не логируем; статус/скоупы — в агрегированном виде.

Примечания по реализации
- Миграции Drizzle должны отражать все таблицы из [dbadmin](server/routes/dbadmin.ts:8-90) и новые доменные сущности (orders, purchase_orders, attachments, notes, calendar_links).
- Для импорта расширить валидации и отчётность (rows, affected, warnings).
- Для /metrics — не дублировать монтирование: выбрать одно место (рекомендуется [mountMetrics()](server/metrics.ts:115)).