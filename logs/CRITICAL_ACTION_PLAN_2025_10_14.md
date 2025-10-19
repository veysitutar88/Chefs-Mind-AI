# 🚨 CRITICAL ACTION PLAN - Chef's Mind AI
**Дата:** 2025-10-14  
**Статус:** БЛОКИРОВАН - требуются критические исправления  
**Версия плана:** 2.0 REVISED

## ⛔ КРИТИЧЕСКИЕ БЛОКЕРЫ (P0)

### 1. 🔴 npm run dev не запускается
- **Влияние:** Блокирует всю разработку
- **Причина:** Vite/Express конфликты, смешение dev/prod
- **ДЕЙСТВИЕ СЕЙЧАС:**
  ```bash
  # Проверить что происходит
  npm run dev 2>&1 | tee logs/dev_startup_error.log
  ```

### 2. 🔴 44 TypeScript ошибки
- **Влияние:** Блокирует build и deployment
- **Причина:** Импорты .js vs .ts, отсутствующие типы
- **ДЕЙСТВИЕ СЕЙЧАС:**
  ```bash
  npx tsc --noEmit > logs/ts_errors_triage.txt 2>&1
  ```

### 3. 🔴 DB latency 624ms (должно быть <50ms)
- **Влияние:** Недопустимо для production
- **Причина:** Не используется Neon pooler
- **ДЕЙСТВИЕ СЕЙЧАС:**
  ```bash
  # Проверить DATABASE_URL
  grep DATABASE_URL .env | grep -c "pooler"
  ```

### 4. 🔴 Нет метрик и observability
- **Влияние:** Невозможно диагностировать проблемы
- **ДЕЙСТВИЕ СЕЙЧАС:** Проверить наличие /metrics endpoint

### 5. 🔴 Health endpoint разнобой
- **Влияние:** Мониторинг нестабилен
- **ДЕЙСТВИЕ СЕЙЧАС:** Унифицировать на /health

## 📋 НЕМЕДЛЕННЫЕ ДЕЙСТВИЯ (следующие 30 минут)

```bash
# 1. Диагностика TypeScript
npx tsc --noEmit > logs/ts_errors_triage.txt 2>&1
cat logs/ts_errors_triage.txt | grep "error TS" | wc -l

# 2. Проверка DATABASE_URL
echo "Checking for pooler endpoint..."
grep DATABASE_URL .env

# 3. Попытка запуска
npm run dev 2>&1 | tee logs/dev_startup_$(date +%H%M).log

# 4. Проверка портов
lsof -i :5000
lsof -i :5002
lsof -i :3000
```

## 🎯 ФОКУС НА СЕГОДНЯ

### Phase 1: BOOTABILITY FIRST (Цель: запустить проект)

| Время | Задача | Критерий успеха |
|-------|--------|-----------------|
| 30 мин | TypeScript триаж | Категоризированы все 44 ошибки |
| 1 час | Быстрые фиксы TS | -20 ошибок (imports, types) |
| 2 часа | Dev/Prod разделение | npm run dev запускается |
| 3 часа | Metrics endpoint | /metrics возвращает данные |
| 4 часа | DB latency fix | <100ms (target <50ms) |
| 5 часов | First smoke test | 1 тест проходит |

## 📊 Обновлённая оценка проекта

### Было (утром):
- **Оценка:** 7.8/10
- **Готовность:** 78%
- **Фокус:** Общие улучшения

### Стало (после feedback):
- **Оценка:** 5.5/10 ⬇️
- **Готовность:** 55% ⬇️
- **Фокус:** КРИТИЧЕСКИЕ БЛОКЕРЫ

### Причины снижения:
1. ❌ Проект не запускается стабильно
2. ❌ TypeScript блокирует компиляцию
3. ❌ DB latency критически высокая
4. ❌ Нет базовой observability
5. ❌ Тесты полностью отсутствуют

## 🔧 Конкретные фиксы

### 1. TypeScript (logs/ts_errors_triage.txt)
```typescript
// БЫСТРЫЕ ФИКСЫ (1 час):
// - import { x } from './file.js' → './file'
// - any → unknown или конкретный тип
// - missing return types

// ВРЕМЕННЫЕ МЕРЫ:
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true,  // временно
    "strict": false,        // временно
    "allowJs": true         // для миграции
  }
}
```

### 2. Database (немедленно)
```bash
# .env должен содержать:
DATABASE_URL=postgresql://user:pass@xxx-pooler.region.aws.neon.tech/db?keepalive=true&statement_timeout=5000

# НЕ просто:
DATABASE_URL=postgresql://user:pass@xxx.region.aws.neon.tech/db
```

### 3. Dev Setup (разделение)
```javascript
// vite.config.ts (DEV)
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
      '/metrics': 'http://localhost:5000'
    }
  }
})

// package.json scripts
{
  "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
  "dev:server": "tsx watch server/index.ts",
  "dev:client": "vite",
  "build": "vite build && tsc"
}
```

### 4. Metrics (добавить СЕЙЧАС)
```typescript
// server/index.ts или server/app.ts
import { register } from 'prom-client';

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

## 📈 Definition of Done для Phase 1

✅ **MUST HAVE (сегодня):**
- [ ] npm run dev запускается 10/10 раз
- [ ] tsc --noEmit = 0 ошибок (или <10 с @ts-ignore)
- [ ] /health возвращает 200 OK
- [ ] /metrics возвращает Prometheus данные
- [ ] DB latency < 100ms
- [ ] 1+ smoke test проходит

## 🚀 Следующие шаги

### Если Phase 1 успешна:
→ Phase 2: Tests & Stability (4 дня)
→ Phase 3: Performance (3 дня)
→ Phase 4: Frontend (4 дня)
→ Phase 5: Deployment (3 дня)

### Если Phase 1 провалена:
→ Эскалация: привлечь senior разработчика
→ Альтернатива: откат на стабильную версию
→ План Б: переписать критические части

## 📁 Созданные файлы
- [`logs/action_plan_2025_10_14_v2.json`](../logs/action_plan_2025_10_14_v2.json) - обновлённый план
- [`checkpoints/master_checkpoint_2025_10_14_v2.json`](../checkpoints/master_checkpoint_2025_10_14_v2.json) - критический чекпоинт
- [`logs/CRITICAL_ACTION_PLAN_2025_10_14.md`](../logs/CRITICAL_ACTION_PLAN_2025_10_14.md) - этот файл

---

**⚠️ ВАЖНО:** Проект заблокирован. Фокус 100% на Phase 1 (BOOTABILITY). Никакие другие задачи не начинать до устранения блокеров.

**Следующий чекпоинт:** Когда npm run dev работает стабильно (ожидается 2025-10-15)