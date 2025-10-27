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
