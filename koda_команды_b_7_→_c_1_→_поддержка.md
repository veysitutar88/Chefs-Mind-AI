Ниже — готовые команды для Koda. Копируй в чат **по одной**. Все в «агентном» стиле (Goal/Context/Process/Done) и с маячком проблем.

---

## 0) Протокол ошибок (использовать в каждой задаче)
**When stuck:** немедленно выведи строку **`⚠️ НОВАЯ ПРОБЛЕМА:`** и кратко опиши причину + что нужно для продолжения.

---

## 1) Восстановить контекст (если чат пуст)
**КОМАНДА — restore context**
> **Goal:** загрузить проектный контекст и активировать LATEST.
> **Context:** `./.koda.prompt.md`, `./checkpoints/LATEST.json`.
> **Constraints:** игнорируй все `*.zip` и файл `checkpoints/LATEST` без расширения.
> **Done:** `✅ context active` + абсолютный путь активного чекпоинта.

---

## 2) Метрики и задержки (B7)
**КОМАНДА — B7.METRICS**
> **Goal:** добавить Prometheus-метрики и логирование задержек.
> **Context:** Node/Express, порт 5000; логи → `logs/metrics_smoke.json`.
> **Process:**
> 1) Установи `prom-client` (если нет).
> 2) Создай `server/metrics.ts`: `collectDefaultMetrics()`, экспорт `/metrics`.
> 3) Смонтируй `/metrics` в `server/routes.ts`.
> 4) Добавь middleware измерения `http_request_duration` и логирование в `logs/metrics_smoke.json`.
> 5) `PORT=5000 npm run dev`; проверь `GET /metrics`.
> **Done:** `✅ DONE: B7.METRICS` + JSON с ключевыми метриками и путём лог‑файла.

---

## 3) Ролевая модель и защита эндпоинтов (C1)
**КОМАНДА — C1.RBAC**
> **Goal:** внедрить RBAC: роли `admin|chef|accountant`; защитить `/api/db/{backup,restore}` и медиа‑роуты.
> **Context:** middleware авторизации; конфиг ролей; UI пока не трогать.
> **Process:**
> 1) Добавь middleware `requireAuth` + `requireRole([..])`.
> 2) Применяй к: `/api/db/backup`, `/api/db/restore`, `/api/media/*`.
> 3) Верни 403 при нехватке прав; логи попыток в `logs/rbac_smoke.json`.
> **Done:** `✅ DONE: C1.RBAC` + `logs/rbac_smoke.json` (успех/отказ для каждой роли).

---

## 4) Снимок статуса
**КОМАНДА — STATUS.SNAPSHOT**
> **Goal:** зафиксировать текущий статус.
> **Context:** активный чекпоинт.
> **Done:** `logs/status_now.json` с полями: `active_checkpoint`, `server`, `db`, `metrics`, `next_task`.

---

## 5) Сохранить чекпоинт
**КОМАНДА — CHECKPOINT.SAVE**
> **Goal:** обновить `master_checkpoint_2025_10_13.json` и `LATEST.json`.
> **Context:** логи последних задач (B7, C1, status_now).
> **Done:** `✅ CHECKPOINT SAVED → master_checkpoint_2025_10_13.json` + вывод активного абсолютного пути.

---

## 6) Перезапуск и смоки (если потребуется)
**КОМАНДА — BOOT+SMOKE**
> **Goal:** запустить сервер (:5000) и пройти health + backup smokes.
> **Context:** `.env` с `DATABASE_URL`; health autodetect (`/health` → `/api/health`).
> **Process:** собрать клиент (Vite) → старт → `GET /health` → `POST /api/db/backup` с `X-Confirm-Code: yes`.
> **Done:** `✅ DONE: BOOT+SMOKE` + пути к логам и последнему бэкапу.

---

## 7) Если снова схватит старый чекпоинт
**КОМАНДА — CHECKPOINT.RELOCK**
> **Goal:** принудительно закрепить актуальный чекпоинт и игнорировать старые.
> **Context:** абсолютный путь к `...\checkpoints\master_checkpoint_2025_10_13.json`.
> **Constraints:** игнорировать `checkpoints/LATEST` без расширения и все архивы `*.zip`.
> **Done:** распечатай активный **абсолютный путь** чекпоинта.

---

## 8) Быстрый health‑пинг (диагностика)
**КОМАНДА — HEALTH.PING**
> **Goal:** проверить живость сервера без рестартов.
> **Context:** порт 5000.
> **Done:** `logs/health_ping.json` с `statusCode`, `route`, `ts`.

