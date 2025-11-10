# Chef's Mind AI — RUNBOOK

Полное руководство по локальной настройке, запуску и разработке Chef's Mind AI.

**Последнее обновление:** 2025-10-27  
**Версия:** 1.0

---

## Содержание

1. [Требования](#требования)
2. [Быстрый старт](#быстрый-старт)
3. [Локальная настройка](#локальная-настройка)
4. [Запуск приложения](#запуск-приложения)
5. [Разработка](#разработка)
6. [Тестирование](#тестирование)
7. [Сборка и деплой](#сборка-и-деплой)
8. [Troubleshooting](#troubleshooting)
9. [Полезные команды](#полезные-команды)

---

## Требования

### Системные требования

- **Node.js:** 20.x или выше
- **npm:** 10.x или выше
- **Docker:** 24.x или выше (для локального запуска с БД)
- **Docker Compose:** 2.x или выше
- **PostgreSQL:** 15.x (в контейнере или локально)
- **Git:** 2.x или выше

### Проверка версий

```bash
node --version      # v20.x.x
npm --version       # 10.x.x
docker --version    # Docker version 24.x.x
docker-compose --version  # Docker Compose version 2.x.x
```

---

## Быстрый старт

Для опытных разработчиков:

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-org/Chefs-Mind-AI.git
cd Chefs-Mind-AI

# 2. Установить зависимости
npm install

# 3. Настроить окружение
cp .env.example .env
# Отредактировать .env с необходимыми значениями

# 4. Запустить локальный стек (backend + PostgreSQL)
docker-compose -f docker-compose.prod.yml up -d

# 5. Запустить миграции БД
npm run migrate

# 6. Запустить сервер в режиме разработки
npm run dev:server

# 7. Проверить здоровье приложения
curl http://localhost:5001/health
```

---

## Локальная настройка

### Шаг 1: Клонирование репозитория

```bash
git clone https://github.com/your-org/Chefs-Mind-AI.git
cd Chefs-Mind-AI
```

### Шаг 2: Установка зависимостей

```bash
npm install
```

Это установит все зависимости, указанные в [`package.json`](package.json).

### Шаг 3: Настройка переменных окружения

Скопируйте пример конфигурации:

```bash
cp .env.example .env
```

Отредактируйте файл `.env` и установите необходимые значения:

```env
# Сервер
NODE_ENV=development
PORT=5001

# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/chefs_mind_ai
DATABASE_READONLY_URL=postgresql://user:password@localhost:5432/chefs_mind_ai

# Сессии
SESSION_SECRET=your-secret-key-here
COOKIE_DOMAIN=localhost

# Безопасность
SAFE_MODE=on
CONFIRM_CODE=your-confirm-code

# OpenAI
OPENAI_API_KEY=sk-...

# Google
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5001/auth/google/callback
GOOGLE_API_KEY=your-api-key

# Redis (опционально)
REDIS_URL=redis://localhost:6379

# Медиа
MEDIA_PROVIDER_DEFAULT=openai
ALLOW_MEDIA_FALLBACK=true
```

**Важно:** Никогда не коммитьте `.env` файл с реальными ключами. Используйте `.env.example` для примеров.

### Шаг 4: Запуск PostgreSQL

Используйте Docker Compose для запуска PostgreSQL:

```bash
docker-compose -f docker-compose.prod.yml up -d db
```

Проверьте, что контейнер запущен:

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Шаг 5: Запуск миграций БД

```bash
npm run migrate
```

Это применит все миграции Drizzle к вашей БД.

---

## Запуск приложения

### Режим разработки (с hot-reload)

```bash
npm run dev:server
```

Сервер будет слушать на `http://localhost:5001` и автоматически перезагружаться при изменении файлов.

### Режим production

```bash
# 1. Собрать проект
npm run build

# 2. Запустить собранный код
npm start
```

### Проверка здоровья приложения

```bash
curl http://localhost:5001/health
```

Ожидаемый ответ:

```json
{
  "ok": true,
  "uptime": 123.456
}
```

---

## Разработка

### Структура проекта

```
c:/Projects/Chefs-Mind-AI/
├── server/                 # Backend (Express)
│   ├── index.ts           # Входная точка
│   ├── routes.ts          # Регистрация маршрутов
│   ├── routes/            # Маршруты API
│   ├── middleware/        # Middleware (RBAC, SafeMode, etc.)
│   ├── services/          # Интеграции (OpenAI, Google, etc.)
│   ├── graph/             # Агентная логика
│   ├── config/            # Конфигурация
│   └── utils/             # Утилиты
├── shared/                # Общие типы и схемы
├── drizzle/               # Миграции БД
├── tests/                 # Тесты (Vitest)
├── .github/workflows/     # GitHub Actions
├── docker-compose.prod.yml # Compose конфигурация
├── Dockerfile             # Docker образ
├── package.json           # Зависимости
├── tsconfig.json          # TypeScript конфигурация
└── RUNBOOK.md            # Этот файл
```

### Основные принципы разработки

Смотрите [`00_core_principles.md`](.kilocode/rules/00_core_principles.md):

- **ESM Above All:** Все относительные импорты в `.ts` оканчиваются на `.js`
- **Read/Write Segregation:** Используйте `dbRead` для SELECT, `dbWrite` для INSERT/UPDATE/DELETE
- **Zod Validation:** Валидируйте все внешние входы через Zod
- **Production-Ready:** Код должен быть типизирован, линтен и покрыт тестами

### Добавление нового маршрута

1. Создайте файл в [`server/routes/`](server/routes/):

```typescript
// server/routes/my-feature.ts
import { Router } from 'express.js';

const router = Router();

router.get('/my-endpoint', (req, res) => {
  res.json({ message: 'Hello' });
});

export default router;
```

2. Зарегистрируйте в [`server/routes.ts`](server/routes.ts):

```typescript
import myFeatureRouter from './routes/my-feature.js';

app.use('/api/my-feature', myFeatureRouter);
```

### Добавление нового сервиса

1. Создайте файл в [`server/services/`](server/services/):

```typescript
// server/services/my-service.ts
export async function myServiceFunction() {
  // Ваша логика
}
```

2. Используйте в маршруте или другом сервисе:

```typescript
import { myServiceFunction } from '../services/my-service.js';
```

---

## Тестирование

### Запуск всех тестов

```bash
npm test
```

### Запуск тестов в режиме watch

```bash
npm run test:watch
```

### Запуск тестов с покрытием

```bash
npm run test:coverage
```

### Структура тестов

Тесты находятся в [`tests/`](tests/):

```
tests/
├── config/
│   └── env.schema.test.ts
├── routes/
│   └── health.test.ts
└── helpers/
    └── app.ts
```

### Написание теста

```typescript
// tests/routes/my-feature.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../helpers/app.js';

describe('GET /api/my-feature', () => {
  it('should return 200', async () => {
    const app = createApp();
    const res = await request(app).get('/api/my-feature');
    expect(res.status).toBe(200);
  });
});
```

---

## Сборка и деплой

### Локальная сборка

```bash
npm run build
```

Это скомпилирует TypeScript в `dist/` и исправит ESM расширения.

### Проверка сборки

```bash
npm run build
npm start
```

### Docker сборка

```bash
docker build -t chefs-mind-ai:latest .
```

### Docker Compose (полный стек)

```bash
# Запустить backend + PostgreSQL
docker-compose -f docker-compose.prod.yml up -d

# Остановить
docker-compose -f docker-compose.prod.yml down

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f backend
```

### GitHub Actions CI/CD

Workflow находится в [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

При каждом `push`:
1. Установка Node.js 20.x
2. Установка зависимостей
3. Сборка проекта (`npm run build`)
4. Запуск тестов (`npm test`)

---

## Troubleshooting

### Проблема: "Cannot find module"

**Решение:** Убедитесь, что все относительные импорты оканчиваются на `.js`:

```typescript
// ❌ Неправильно
import { myFunction } from './utils/my-util';

// ✅ Правильно
import { myFunction } from './utils/my-util.js';
```

### Проблема: "Port 5001 already in use"

**Решение:** Измените порт в `.env`:

```env
PORT=5002
```

Или убейте процесс, занимающий порт:

```bash
# macOS/Linux
lsof -i :5001
kill -9 <PID>

# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### Проблема: "Database connection failed"

**Решение:** Проверьте:

1. PostgreSQL запущен:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

2. `DATABASE_URL` в `.env` корректен

3. Миграции применены:
   ```bash
   npm run migrate
   ```

### Проблема: "ESLint errors in pre-commit"

**Решение:** Запустите ESLint fix:

```bash
npm run lint -- --fix
```

### Проблема: "TypeScript compilation errors"

**Решение:** Проверьте типы:

```bash
npx tsc --noEmit
```

---

## Полезные команды

### Разработка

| Команда | Описание |
|---------|---------|
| `npm run dev:server` | Запуск сервера в режиме разработки |
| `npm run build` | Сборка проекта |
| `npm start` | Запуск production сборки |
| `npm test` | Запуск тестов |
| `npm run test:watch` | Тесты в режиме watch |
| `npm run test:coverage` | Тесты с покрытием |

### Линтинг и форматирование

| Команда | Описание |
|---------|---------|
| `npm run lint` | Запуск ESLint |
| `npm run lint -- --fix` | Автоисправление ESLint ошибок |
| `npm run format` | Форматирование кода Prettier |

### База данных

| Команда | Описание |
|---------|---------|
| `npm run migrate` | Применить миграции |
| `npm run migrate:generate` | Сгенерировать новую миграцию |
| `npm run migrate:push` | Push миграций в БД |

### Docker

| Команда | Описание |
|---------|---------|
| `docker-compose -f docker-compose.prod.yml up -d` | Запустить стек |
| `docker-compose -f docker-compose.prod.yml down` | Остановить стек |
| `docker-compose -f docker-compose.prod.yml logs -f` | Просмотр логов |
| `docker-compose -f docker-compose.prod.yml ps` | Статус контейнеров |

### Утилиты

| Команда | Описание |
|---------|---------|
| `curl http://localhost:5001/health` | Проверка здоровья |
| `npm run audit` | Проверка уязвимостей |
| `npm update` | Обновление зависимостей |

---

## Дополнительные ресурсы

- **Архитектура:** [`docs/architecture_review.md`](docs/architecture_review.md)
- **Принципы разработки:** [`.kilocode/rules/00_core_principles.md`](.kilocode/rules/00_core_principles.md)
- **Memory Bank:** [`.kilocode/rules/memory-bank/`](.kilocode/rules/memory-bank/)
- **API документация:** Смотрите комментарии в [`server/routes/`](server/routes/)

---

## История обновлений

### v1.0 (2025-10-27)

- Начальная версия RUNBOOK
- Добавлены инструкции по локальной настройке
- Добавлены команды разработки и тестирования
- Добавлены решения для troubleshooting

---

## Контакты и поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте раздел [Troubleshooting](#troubleshooting)
2. Посмотрите существующие issues в GitHub
3. Создайте новый issue с описанием проблемы

---

**Последнее обновление:** 2025-10-27  
**Автор:** Chef's Mind AI Team

## Production Monitoring с Prometheus

Данный проект включает готовую конфигурацию Prometheus для прод‑наблюдаемости backend сервиса.

### Доступ к дашборду
- URL по умолчанию: http://localhost:9090
- Сервис Prometheus поднимается через Docker Compose из файла [`docker-compose.prod.yml`](docker-compose.prod.yml:1)
- Конфигурация Prometheus находится в [`prometheus/prometheus.yml`](prometheus/prometheus.yml:1)

### Как запустить
```bash
# Запуск backend, БД и Prometheus
docker-compose -f docker-compose.prod.yml up -d backend db prometheus

# Проверить статус контейнеров
docker-compose -f docker-compose.prod.yml ps
```

### Конфигурация scrape
Текущая конфигурация собирает метрики:
- job_name: backend → таргет backend:5000, путь /metrics
- job_name: prometheus → сам Prometheus на localhost:9090

Фрагмент [`prometheus/prometheus.yml`](prometheus/prometheus.yml:1):
```yaml
scrape_configs:
  - job_name: backend
    metrics_path: /metrics
    static_configs:
      - targets: ["backend:5000"]
        labels:
          service: backend
          env: prod
```

Backend экспортирует HTTP‑метрики через prom-client в эндпоинт /metrics (регистрируется в приложении, см. [`server/index.ts`](server/index.ts:55)). Убедитесь, что сервис backend работает и доступен внутри сети Compose под именем backend:5000.

### Быстрая проверка
1. Откройте Prometheus Targets:
   - http://localhost:9090/targets
   - Ожидайте статус UP для таргета backend.
2. Выполните запрос в PromQL на графе:
   - Запрос RPS: `sum(rate(http_requests_total[1m]))`
   - Ошибки 5xx: `sum by (status)(rate(http_requests_total{status=~"5.."}[5m]))`
   - Латентность p95: сначала соберите histogram_quantile с длительностью запросов, например:
     ```
     histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))
     ```
     Подставьте метки по вашей схеме метрик.

Примечание: точные имена метрик зависят от того, как они объявлены в middleware метрик. Ищите названия в файле метрик сервера и/или выполните raw просмотр:
- http://localhost:5001/metrics (из хоста)
- либо через Prometheus UI → /graph → введите `http_` и изучите автодополнение

### Интерпретация ключевых метрик
- Доступность таргета:
  - Если статус DOWN → проверьте, что backend запущен и доступен в сети Compose, а также что в Prometheus верно указан таргет backend:5000.
- Пропускная способность (RPS):
  - `sum(rate(http_requests_total[1m]))` — общий трафик за минуту.
  - Разбейте по маршрутам/статусам, если метрики снабжены соответствующими лейблами.
- Ошибки:
  - Доля 5xx: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))`
  - Рост доли 5xx → триггер для расследования и алертов.
- Латентность:
  - p95/p99 по маршрутам через histogram_quantile.
  - Увеличение p95 → индикатор деградации производительности.

### Траблшутинг
- Таргет не поднимается:
  - Проверьте логи Prometheus:
    ```bash
    docker-compose -f docker-compose.prod.yml logs -f prometheus
    ```
  - Убедитесь, что backend слушает на 5000 внутри контейнера и доступен по имени backend в сети Compose.
- В /metrics пусто или ошибки:
  - Проверьте серверные логи backend:
    ```bash
    docker-compose -f docker-compose.prod.yml logs -f backend
    ```
  - Убедитесь, что метрики включены в приложении и middleware метрик подключено.
- Конфиг не применяется:
  - Изменили [`prometheus/prometheus.yml`](prometheus/prometheus.yml:1)? Перезапустите сервис:
    ```bash
    docker-compose -f docker-compose.prod.yml restart prometheus
    ```

### Операционные рекомендации
- Ретеншн исторических данных по умолчанию в Compose настроен на 15d.
- Для прод окружений рекомендуются:
  - Внешний volume для Prometheus data
  - Алертинг (Alertmanager) и дашборды (Grafana)
  - Базовые алерты: p95 latency, 5xx rate, UP/DOWN таргетов

---

## Known Issues — File Writes (2025‑11‑09)

### File Write Operations in Development Environment

При разработке в среде Windows/WSL могут возникать проблемы с записью файлов в следующих сценариях:

1. **Locks и Permission Conflicts** - Временные файлы и логи могут блокироваться другими процессами, особенно при работе с Docker volumes.

2. **Path Resolution Issues** - Относительные пути в ESM импортах (.js расширения) могут работать некорректно в разных рабочих директориях.

3. **Database Migration Locks** - Параллельные процессы миграции БД могут создавать конфликтующие блокировки таблиц.

4. **Session Storage Conflicts** - Express-session может конфликтовать при записи сессий в файловую систему в development режиме.

5. **Cache File Writes** - Встроенные кэши (например, Drizzle table cache) могут не записываться корректно в mapped volumes.

6. **Log Rotation Problems** - Лог-файлы могут оставаться открытыми процессами, препятствуя ротации.

7. **Build Output Conflicts** - TypeScript build процессы могут конфликтовать при одновременной записи в dist/ папку.

8. **Frontend Build Artifacts** - Next.js frontend может иметь проблемы с записью .next/ кэша при development сборке.

**Workarounds:**
- Используйте `SAFE_MODE=on` для write-операций с подтверждением
- Запускайте процессы миграции последовательно через `npm run migrate`
- Очищайте кэш командой `npm run clean` перед перезапуском
- Используйте absolute paths в production окружении
- Перезапускайте Docker контейнеры при конфликтах файловых locks

### Severity: Medium
### Status: Investigation Required
### Components: File System, Database, Build Process
### Reported: 2025-11-09

## Dev Ports

Политика портов для разработки (утверждена 2025-11-10):

| Сервис | Порт | Назначение | Резерв |
|--------|------|------------|--------|
| API Backend | 5003 | Основной порт разработки | 5001 (legacy) |
| Frontend Primary | 3000 | Next.js разработка | - |
| Frontend Backup | 3001 | Альтернативный FE порт | - |
| PostgreSQL | 5432 | База данных | - |
| Prometheus | 9090 | Метрики | - |

**Источники конфигурации:**
- API порт: [server/index.ts](server/index.ts) - переменная `PORT`
- ENV шаблоны: [.env.example](.env.example)
- Frontend конфиг: [frontend-enhanced/.env.local](frontend-enhanced/.env.local)

**Диаграмма топологии:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   API Backend   │    │   Frontend      │
│     :5432       │────│     :5003       │────│   :3000/:3001   │
│   (Database)    │    │   (Express)     │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Startup Order

**Критический порядок запуска сервисов:**

1. **База данных** → PostgreSQL (5432)
2. **Backend API** → 5003 (зависит от БД)  
3. **Frontend** → 3000/3001 (зависит от API)

**Команды разработки:**
```bash
# 1. Запуск БД (обязательно первым)
docker-compose -f docker-compose.prod.yml up -d db

# 2. Ожидание готовности БД (рекомендуется)
sleep 5 && docker-compose -f docker-compose.prod.yml ps db

# 3. Запуск API
npm run dev:server  # PORT=5003 по умолчанию

# 4. Проверка API
curl http://localhost:5003/health

# 5. Запуск Frontend (в отдельном терминале)
cd frontend-enhanced && npm run dev
```

**Проверка доступности:**
- API: http://localhost:5003/health → `{ ok: true, uptime: ... }`
- Frontend: http://localhost:3000 (или :3001)
- Prometheus: http://localhost:9090 (опционально)

**Таймауты и зависимости:**
- БД: ~3-5 секунд до готовности
- API: ожидает БД, health check через /health
- Frontend: ожидает API (можно запускать параллельно)

**Troubleshooting:**
- Если API не стартует: проверьте БД и переменные DATABASE_URL
- Если Frontend не подключается: проверьте NEXT_PUBLIC_API_URL
## Дополнение (Addendum) — Политика разработки портов и логирования

**Добавлено:** 2025-11-10 01:19:52 UTC  
**Автор:** Kilo Code (architect)  
**Основание:** Подтверждение конфигурации портов и правил логирования

### Подтвержденная конфигурация портов разработки

**Актуальные порты:**
- **API Backend:** 5003 (основной порт разработки)
- **Frontend Primary:** 3000 (Next.js разработка)
- **Frontend Backup:** 3001 (альтернативный FE порт)
- **PostgreSQL:** 5432 (база данных)
- **Prometheus:** 9090 (метрики, опционально)

**Источники подтверждения:**
- API порт: `server/index.ts` - переменная `PORT`
- ENV шаблоны: `.env.example` 
- Frontend конфиг: `frontend-enhanced/.env.local`

### Порядок запуска сервисов (КРИТИЧЕСКИЙ)

**Обязательная последовательность:**

1. **База данных** → PostgreSQL (5432)
2. **Backend API** → 5003 (зависит от БД)
3. **Frontend** → 3000/3001 (зависит от API)

**Команды запуска:**
```bash
# 1. Запуск БД (обязательно первым)
docker-compose -f docker-compose.prod.yml up -d db

# 2. Ожидание готовности БД
sleep 5 && docker-compose -f docker-compose.prod.yml ps db

# 3. Запуск API
npm run dev:server  # PORT=5003 по умолчанию

# 4. Проверка API
curl http://localhost:5003/health

# 5. Запуск Frontend (в отдельном терминале)
cd frontend-enhanced && npm run dev
```

### Правила логирования (APPEND-ONLY)

**ACTION_LOG.md (append-only):**
- **Путь:** `reports/ACTION_LOG.md`
- **Политика:** Только добавление записей, запрет на редактирование существующих секций
- **Формат:** Временная метка → Автор → Описание изменения → Затронутые файлы

**Артефакты:**
- **Базовая папка:** `reports/artifacts/`
- **Структура:** `reports/artifacts/YYYY-MM-DD/HHMM/`
- **Содержимое:** Логи, копии измененных файлов, отчеты валидации

**Пример записи в ACTION_LOG.md:**
```markdown
# 2025-11-10 01:19:52 UTC - Kilo Code (architect)

## Изменения конфигурации портов
- Обновлены ENV файлы: добавлен PORT_API=5003
- Подтверждены Frontend порты: 3000 (primary), 3001 (backup)
- Зафиксирован порядок запуска: backend→frontend

## Затронутые файлы
- .env.example
- frontend/.env.local  
- frontend-enhanced/.env.local

## Артефакты
- reports/artifacts/2025-11-10/0119/
```

### Валидация конфигурации

**Проверочные команды:**
```bash
# Проверка API
curl http://localhost:5003/health

# Проверка Frontend
curl http://localhost:3000  # или 3001

# Проверка БД
docker-compose -f docker-compose.prod.yml ps db
```

**Ожидаемые результаты:**
- API: `{ "ok": true, "uptime": ... }`
- Frontend: 200 OK (HTML страница)
- БД: Status "Up"

### Политика изменений

**Принципы:**
- Существующие секции НЕ РЕДАКТИРУЮТСЯ
- Новые данные добавляются только в конец файлов
- Все изменения фиксируются в ACTION_LOG.md
- Артефакты сохраняются в reports/artifacts/

**В случае ошибок:**
- Формируется Rollback‑аддендум
- Откат через удаление добавленных секций
- Восстановление из артефактов

---

**Конец Addendum**  
*Этот раздел добавлен без изменения существующих секций документа*
- Конфликты портов: используйте альтернативные порты (3001, 5002)