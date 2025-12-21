# План нормализации портов 3002 → 3000/3001

## Обзор задачи
Дата: 2025-11-10 01:59:28 UTC  
Автор: Kilo Code (architect → code mode)  
Статус: D1 (Deployment) - In Progress

## Проблема
В `server/index.ts` обнаружены устаревшие ссылки на порт 3002:
- Строка 56: CSP.connectSrc содержит `'http://localhost:3002'`
- Строка 82: Socket.IO CORS origin настроен на `'http://localhost:3002'`

## Стандартизированные порты (утверждено)
- **API Backend**: 5003 (основной), 5001 (legacy)
- **Frontend Primary**: 3000
- **Frontend Backup/Preview**: 3001
- **Старт**: БД → API → Frontend

## Цели изменения
1. ✅ Удалить все упоминания порта 3002
2. ✅ Заменить на стандартные порты 3000/3001
3. ✅ Использовать ENV-переменные для динамической настройки
4. ✅ Сохранить localhost-фоллбэки для разработки
5. ✅ Обеспечить обратную совместимость

## Целевые изменения в server/index.ts

### CSP.connectSrc (строка ~52)
**БЫЛО:**
```typescript
connectSrc: [
  "'self'",
  'http://localhost:5001',
  'http://localhost:5003',
  'http://localhost:3002', // ← УДАЛИТЬ
],
```

**СТАНЕТ:**
```typescript
connectSrc: [
  "'self'",
  'http://localhost:5001',
  'http://localhost:5003',
  'http://localhost:3000', // ← ДОБАВИТЬ
  'http://localhost:3001', // ← ДОБАВИТЬ
  process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || [], // ← ENV-DRIVEN
].filter(Boolean),
```

### Socket.IO CORS (строка ~80)
**БЫЛО:**
```typescript
cors: {
  origin: 'http://localhost:3002', // ← УДАЛИТЬ
  methods: ['GET', 'POST'],
},
```

**СТАНЕТ:**
```typescript
cors: {
  origin: (origin, callback) => {
    // Динамическое определение origin из ENV
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      ...(process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || [])
    ];
    
    // Разрешить запросы без origin (мобильные приложения, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
},
```

## Файлы для изменения
1. **server/index.ts** (строки 46-60, 80-85)
2. **reports/artifacts/ports/patch_3002_removal.diff** (патч-файл)
3. **reports/artifacts/ports/plan_3002_removal.md** (данный план)

## Переменные окружения
Используемые ENV-переменные (уже настроены в .env.example):
- `CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5003`
- `NEXT_PUBLIC_API_BASE=http://localhost:5003`

## Последующие шаги
- **R1**: Smoke test с портами 3000, 3001, 5003
- **L1**: Обновление ACTION_LOG.md

## Rollback план
При возникновении проблем:
1. Отменить изменения в `server/index.ts`
2. Восстановить исходный код с портом 3002
3. Перезапустить сервер

## Тестирование
После применения изменений необходимо:
1. Проверить запуск сервера без ошибок
2. Убедиться в отсутствии CORS-ошибок в браузере
3. Проверить подключение к Socket.IO
4. Валидировать CSP-заголовки

---
*План создан в рамках P1 (Deploy) → D1 (Do) фазы нормализации портов*