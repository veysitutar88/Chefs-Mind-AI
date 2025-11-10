Step 3 — Env and RBAC guards plan (P2/D2/D3/D4/R2/L1)

P2 — Plan env update and RBAC guards:
- Не внося изменений в существующие файлы на этом шаге, зафиксировать намерения:
  - Env обновления для разработки и e2e (см. D2/D3)
  - RBAC-guards для защищённых маршрутов и e2e smoke login/logout (см. D4)
  - Логи и артефакты для каждого шага (см. L1/R2)
- Влияние и критерии приёмки:
  - UI должен брать API из http://localhost:5003
  - e2e (если присутствуют) должны работать с BASE_URL=http://localhost:3001
  - Guards и smoke auth должны проходить; логи сохраняются

D2 — Env: .env.local (frontend):
- Требуемые значения (append-only добавление в конец файлов; фактические изменения будут выполнены отдельной задачей):
  - PORT=3000
  - NEXT_PUBLIC_API_BASE=http://localhost:5003
- Целевые пути для проверки/применения: 
  - frontend-enhanced/.env.local
  - frontend/.env.local (если проект используется)
- Артефакты после применения шагом D2: reports/artifacts/env_dump.txt (содержимое .env.local в маскированном виде)

D3 — Env: e2e (при наличии):
- Если есть e2e, задать:
  - BASE_URL=http://localhost:3001
- Целевые пути:
  - e2e/config (если есть)
  - или .env.e2e в корне e2e-пакета/проекта
- Артефакты после применения шагом D3: reports/artifacts/env_dump.txt (дополнить/перезаписать с отметкой секции D3)

D4 — RBAC guards + e2e smoke login/logout:
- Усилить RBAC-guards в UI и/или backend (в рамках планирования указать целевые области, фактические изменения будут отдельной задачей):
  - UI: frontend-enhanced/src/app/** (где отображаются защищённые разделы)
  - Тесты: tests/e2e/** или e2e/** (в зависимости от наличия)
- e2e smoke сценарии:
  - login → доступ к защищённой странице → logout
- Артефакты: reports/artifacts/e2e_auth_smoke.log

R2 — CI-процедуры (после внедрения D2–D4):
- Запустить lint/type/tests/e2e и сохранить логи
- Артефакты: reports/artifacts/ci_logs/*
- Критерии: lint/typecheck без ошибок; unit/integration/e2e — зелёные либо с понятной диагностикой

L1 — Logging (для каждого шага):
- В конце выполнения каждого шага (P2, D2, D3, D4, R2) дописать одну строку в [reports/ACTION_LOG.md](reports/ACTION_LOG.md) (append-only) и в [reports/artifacts/log_summary_append.log](reports/artifacts/log_summary_append.log)
- Формат записи — как в предыдущих шагах (включая ISO-временную метку и ссылку на артефакты)

Deliver — Итог поставки по Step 3:
- Применённые env изменения для dev (.env.local)
- Применённые env для e2e (.env.e2e или e2e/config), если e2e присутствуют
- Включённые/усиленные RBAC guards и e2e smoke login/logout
- Логи lint/type/tests/e2e под reports/artifacts/ci_logs/*
- Актуальные записи в ACTION_LOG и логи append

Acceptance Checklist:
- [ ] docs/TASKS.md содержит этот раздел планирования (append-only)
- [ ] Сформирован ack-файл планов
- [ ] Ссылки на пути и артефакты валидны (существующие/запланированные)