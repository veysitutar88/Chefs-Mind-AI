# Chef's Mind AI

Многоагентная ИИ‑платформа для управления рестораном: Orchestrator API, агенты (Chef, Accountant, Researcher, Media), UI и интеграции. Бэкенд (Express/TypeScript), фронтенд (Next.js), PostgreSQL (Drizzle ORM), метрики Prometheus, RBAC/SafeMode.

## Чекпоинты

- Мастер-чекпоинт (2025-10-29): docs/MASTER_CHECKPOINT_2025-10-29.md

## Dev Ports

Политика портов для разработки:

- **API**: 5003 (базовый порт разработки)
- **Frontend (primary)**: 3000 
- **Frontend (backup)**: 3001
- **PostgreSQL**: 5432
- **Prometheus**: 9090

Ссылки:
- API конфигурация: [server/index.ts](server/index.ts)
- Переменные окружения: [.env.example](.env.example)
- Подробные инструкции: [RUNBOOK.md](RUNBOOK.md#dev-ports)

## Startup Order

Корректный порядок запуска сервисов:

1. **База данных**: PostgreSQL (5432)
2. **Backend API**: 5003 (ожидает БД)
3. **Frontend**: 3000/3001 (ожидает API)

Диаграмма последовательности:
```
[PostgreSQL:5432] → [API:5003] → [Frontend:3000/3001]
      ↓                ↓              ↓
   Ready            Health OK     Connected
```

Команды для разработки:
```bash
# 1. Запуск БД
docker-compose -f docker-compose.prod.yml up -d db

# 2. Запуск API
npm run dev:server

# 3. Запуск Frontend
cd frontend-enhanced && npm run dev
```

## Дополнение (Addendum) — Правила логирования и политика изменений

**Добавлено:** 2025-11-10 01:20:26 UTC  
**Автор:** Kilo Code (architect)  
**Основание:** Стандартизация правил логирования и фиксации изменений

### Правила логирования (APPEND-ONLY)

**ACTION_LOG.md (append-only политика):**
- **Путь:** `reports/ACTION_LOG.md`
- **Политика:** Только добавление записей, запрет на редактирование существующих секций
- **Формат:** Временная метка → Автор → Описание изменения → Затронутые файлы

**Артефакты:**
- **Базовая папка:** `reports/artifacts/`
- **Структура:** `reports/artifacts/YYYY-MM-DD/HHMM/`
- **Содержимое:** Логи, копии измененных файлов, отчеты валидации

**Пример записи в ACTION_LOG.md:**
```markdown
# 2025-11-10 01:20:26 UTC - Kilo Code (architect)

## Документация портов и логирования
- Подтверждены Dev Ports: API 5003, Frontend 3000/3001
- Зафиксирован порядок запуска: backend→frontend
- Добавлены правила логирования (append-only)

## Затронутые файлы
- README.md (Addendum)
- RUNBOOK.md (Addendum)
- .env.example (Addendum)

## Артефакты
- reports/artifacts/2025-11-10/0120/
```

### Политика изменений документов

**Принципы:**
- Существующие секции НЕ РЕДАКТИРУЮТСЯ
- Новые данные добавляются только в конец файлов (append-only)
- Все изменения фиксируются в ACTION_LOG.md
- Артефакты сохраняются в reports/artifacts/ с датой и временем

**Структура артефактов:**
```
reports/artifacts/YYYY-MM-DD/HHMM/
├── env_addendums/          # Копии ENV файлов с аддендумами
├── doc_addendums/          # Копии документов с аддендумами
├── validation_results.md   # Результаты валидации
├── smoke_test_logs.txt     # Логи smoke тестов
└── rollback_plan.md        # План отката (при необходимости)
```

**Валидация изменений:**
- Проверка конфигурации портов через smoke тесты
- Проверка CORS allowlist в server/index.ts
- Проверка /health эндпоинта

**В случае ошибок:**
- Формируется Rollback‑аддендум
- Откат через удаление добавленных секций
- Восстановление из сохраненных артефактов

---

**Конец Addendum**  
*Этот раздел добавлен без изменения существующих секций документа*
Подробности в: [RUNBOOK.md](RUNBOOK.md#запуск-приложения)
---

## Addendum 2025-11-10 — План P/D/R/L Валидации Конфигурации

**Добавлено:** 2025-11-10 02:05:30 UTC  
**Автор:** Kilo Code (code)  
**Основание:** Валидация конфигурации портов Chef's Mind AI

### 5-шаговый P/D/R/L План (Выполнен)

#### P — Политика (Policy Confirmation)
- ✅ **Подтверждены dev порты:**
  - API Backend: 5003 (основной), 5001 (legacy)
  - Frontend Primary: 3000, Frontend Backup: 3001
  - PostgreSQL: 5432
- ✅ **Зафиксирован порядок запуска:** БД → Backend → Frontend
- ✅ **Стандартизирована переменная фронтенда:** `NEXT_PUBLIC_API_BASE=http://localhost:5003`
- 📋 **Источники:** README.md lines 9-49, RUNBOOK.md, package.json dev scripts

#### D1 — ENV Addendum (Подготовка)
- ✅ **Добавлены addendum блоки к ENV файлам:**
  - `.env.example` — PORT=5003, NEXT_PUBLIC_API_BASE, CORS_ORIGIN update
  - `.env.production.test` — обновленный с 2025-11-10 01:58:59
  - `.env.production.sample` — создан новый файл с addendum
- ✅ **Принцип append-only:** существующие секции НЕ изменялись
- ✅ **Метки дат:** каждый addendum с временной меткой UTC

#### D2 — Docs Addendum (Документация)
- ✅ **README.md дополнен:** Dev Ports & Startup Order section (существующая)
- ✅ **Addendum разделы:** 
  - Правила логирования (строки 51-118)
  - P/D/R/L план (данный раздел)
- ✅ **RUNBOOK.md:** ссылка на подробные инструкции

#### R — Review/Smoke (Проверка)
- 🔄 **Запланировано:** grep по 5001/5003/3000/3001 конфигурациям
- 🔄 **Запланировано:** curl http://localhost:5003/health
- 🔄 **Запланировано:** проверка доступности фронтенда на 3000/3001
- 🔄 **Запланировано:** валидация CORS allowlist

#### L — Logging (Логирование)
- 🔄 **Запланировано:** append запись в `reports/ACTION_LOG.md`
- 🔄 **Запланировано:** создание `reports/artifacts/2025-11-10/0205/`
- 🔄 **Запланировано:** копии addendum и PDRL план в артефакты

### Ключевые Результаты

**Конфигурация портов стандартизирована:**
```bash
# Backend
PORT=5003                    # API основной порт
NEXT_PUBLIC_API_BASE=http://localhost:5003  # Frontend → API

# Frontend
Primary: 3000                # Основной порт
Backup: 3001                 # Резервный порт

# Database
PostgreSQL: 5432            # БД порт
```

**Файлы с обновлениями:**
- `.env.example` — Addendum 2025-11-10 01:59:28
- `.env.production.test` — Addendum 2025-11-10 01:58:59  
- `.env.production.sample` — создан с Addendum 2025-11-10 02:02:30
- `README.md` — Addendum разделы (логирование + P/D/R/L)

### Следующие Шаги (R+L фазы)
1. **Review Phase:** Выполнить smoke тесты без изменения кода
2. **Logging Phase:** Зафиксировать результаты в ACTION_LOG.md
3. **Artifacts:** Сохранить все изменения в reports/artifacts/

---

**Конец P/D/R/L Addendum**  
*Этот раздел добавлен как финальная фаза P/D/R/L плана*

## Addendum — Context Handoff (P/D/R/L) + Links + Ports matrix

Добавлено: 2025-11-10T02:28:50.148Z UTC  
Автор: Kilo Code (architect)  
Основание: Документирование контекстной передачи (handoff) и портов без редактирования существующих разделов

P — Policy
- Подтверждены dev порты:
  - API Backend: 5003 (legacy 5001)
  - Frontend: 3000 (primary), 3001 (backup)
  - PostgreSQL: 5432
  - Prometheus: 9090
- Порядок запуска: БД → Backend → Frontend
- Логирование: append-only в reports/ACTION_LOG.md; артефакты в reports/artifacts/

D — Do/Docs
- Данное дополнение добавлено append-only в конец README без правок существующих секций
- См. CORS/whitelist и CSP в [server/index.ts](server/index.ts:24)
- См. dev‑скрипт API на 5003 в [package.json](package.json:9)
- Доп. указания: [RUNBOOK.md](RUNBOOK.md)

R — Review
- Smoke: GET http://localhost:5003/health → 200 OK
- FE: http://localhost:3000 и/или http://localhost:3001 должны успешно обращаться к API 5003
- Проверить CORS_ORIGIN содержит http://localhost:3000,http://localhost:3001

L — Logging
- Зафиксировать факт добавления в reports/artifacts/readme_append.log (append-only)
- При необходимости продублировать запись в reports/ACTION_LOG.md (в отдельной задаче)

Ports Matrix
| Component        | Dev Port | Legacy | Notes                         |
|------------------|---------:|:------:|--------------------------------|
| API Backend      | 5003     | 5001   | См. [package.json](package.json:9) |
| Frontend Primary | 3000     |  —     | Next.js dev                    |
| Frontend Backup  | 3001     |  —     | Альтернативный порт            |
| PostgreSQL       | 5432     |  —     | docker‑compose                 |
| Prometheus       | 9090     |  —     | optional                       |

Context Links
- CORS allowlist: [server/index.ts](server/index.ts:24)
- ENV примеры: [.env.example](.env.example)
- RUNBOOK (Dev ports): [RUNBOOK.md](RUNBOOK.md:664)

Конец Addendum