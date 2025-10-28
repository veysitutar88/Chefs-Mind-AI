# Chef’s Mind AI — MASTER CHECKPOINT (v2025-10-12)

> Единая точка правды для новых чатов/сессий. Используй этот файл как контекст и стартовый промпт.  
> Источник базиса: Replit (скрин/отчёты), актуализация: VS Code (Koda/Gemini) на 2025‑10‑12.

---

## 0) Идентификатор
- **Проект:** Chef’s Mind AI
- **Ветка:** enhanced/5-agents + QA middleware
- **Версия чекпоинта:** v2025-10-12
- **Статус готовности:** ~70–75% (бэкенд ядро ✅, фронтенд шаблон ✅/△, MCP интеграции △)

---

## 1) Миссия и архитектура
- **Миссия:** единая платформа для операций ресторана (меню/закупки/аналитика/контент).
- **Слои:** Orchestrator (универсальный чат) → Agents → QA‑Gate (middleware) → Providers (LLM/MCP).
- **Агенты (4+1):**
  - **Chef** — рецепты/технология/фото‑брендинг.
  - **Accountant** — себестоимость/закупки/Sheets/Docs/Calendar через Google MCP.
  - **Researcher** — поиск/аналитика.
  - **Media Studio** — генерация изображений/видео (DALL·E 3, GPT‑Image‑1, Imagen 3, Veo 3; Sora v2 — флагом).
  - **QA‑Gate** *(слой, не пользовательский агент)* — факт‑чек, кросс‑валидация, self‑correction.

**Оркестрация:**
- Универсальный маршрут `/api/enhanced-agent/chat`: авто‑маршрутизация к агентам, сбор метаданных, вызов QA‑Gate перед отдачей.

---

## 2) Базис → Что добавили
**Baseline (Replit):** универсальный чат, 4 агента, SQL Validator, STT (Web Speech), ранние роуты.  
**Добавили (VS Code этап):**
- Media/MCP: enhancer→provider chain, fallback, стандартизированные ответы (`{id,url,provider,fallbackUsed?,metadata}`).
- Новые эндпоинты медиа: `/api/media/image/generate`, `/api/media/video/generate`.
- Флаги: `ENABLE_SORA`, `ALLOW_MEDIA_FALLBACK`, `MEDIA_PROVIDER_DEFAULT`.
- QA‑Gate (middleware) как MCP‑инструмент `comprehensive_fact_check`.
- Frontend‑enhanced (Next.js 14 + Tailwind) — стартовый каркас с 5 агентами/переключателями.
- Stream‑utils: унификация стриминга; режим **de‑stream** для стабильности (фича‑флаг).

---

## 3) Текущее состояние (Health)
- **TypeScript:** компиляция без ошибок на ядре; локальные файлы могут требовать alias/guards.
- **Routes:** health/media — должны быть подключены в `server/app.ts` (см. «API карта»).
- **Frontend‑enhanced:** каркас есть; требуются страницы и связка с API.
- **MCP:** зарегистрированы Google/Media/QA; OAuth — предстоит конфигурация.
- **Ключи:** `.env` содержит OPENAI/GOOGLE VERTEX и флаги; подставить реальные значения.

---

## 4) Агентная модель (коротко)
| Агент | Вход | Действия | Выход |
|---|---|---|---|
| Chef | текст | план блюд/фото‑брендинг | рецепт/план/медиа‑запрос |
| Accountant | запрос/CSV | себестоимость/прайс/графики | отчёт/таблицы |
| Researcher | тема | поиск/сводка/ссылки | конспект/рекомендации |
| Media Studio | prompt | enhance→provider (DALL·E/GPT‑Image/Imagen/Veo/Sora*) | image/video + metadata |
| QA‑Gate | ответ/метаданные | факт‑чек/кросс‑валидация | pass/fail + reasons |

*Sora: включается флагом `ENABLE_SORA=true`; при `false` — 503 и fallback по цепочке (если разрешён).

---

## 5) API карта (минимум)
- `GET /health` → `{ ok: true }`
- `POST /api/enhanced-agent/chat` → универсальный чат (маршрутизация)
- `POST /api/media/image/generate` → `{ id,url,provider,fallbackUsed?,metadata }`
- `POST /api/media/video/generate` → `{ id,status,url?,provider,fallbackUsed?,metadata }`

**Подключение в `server/app.ts`:**
```ts
app.use("/api/media", mediaImageRouter);
app.use("/api/media", mediaVideoRouter);
app.get("/health", (_req,res)=>res.status(200).json({ok:true}));
```

---

## 6) ENV (шаблон)
```
OPENAI_API_KEY=
GOOGLE_VERTEX_API_KEY=
VERTEX_PROJECT_ID=
MEDIA_PROVIDER_DEFAULT=openai-image
ENABLE_SORA=false
ALLOW_MEDIA_FALLBACK=true
QA_ENABLED=true
QA_CONFIDENCE_THRESHOLD=0.75
```

---

## 7) Фронтенд (enhanced)
- **Стек:** Next.js 14, React 18, Tailwind.
- **UI план:** 3 колонки — слева агенты, центр чат/форма медиа, справа статус (QA, инструменты, latency).
- **Proxy:** к бэкенду на 5000/5002 (уточнить на локали).

---

## 8) Риски и техдолг
- Потоковая передача в `enhanced-agent-chat` (перевести на de‑stream до стабилизации).
- Алиасы `@/*` и типы (`{}` → `string|string[]`, `unknown` → guards/zod).
- UI смешанные источники (нормализация OSS, Styleguide).
- OAuth Google (сервер + фронт компонент) — не завершён.

---

## 9) План на 7 дней (минимум)
1. **R1:** Подключить health/media роуты в `app.ts`, smoke‑тесты `curl`.
2. **F1:** Завести страницы `layout.tsx/page.tsx`, связать формы с API.
3. **Q1:** Включить QA‑Gate в медиа‑роутах, логировать `qa.score`.
4. **G1:** Настроить Google OAuth (сервер/клиент), проверить Sheets/Docs/Calendar.
5. **B1:** Скрипты backup/restore + cron, артефакты в `/out`.

---

## 10) Как стартовать новый чат (Launch Prompt)
Скопируй блок ниже в первое сообщение нового чата:

```text
[PROJECT CONTEXT — Chef’s Mind AI]
Ты — системный оркестратор проекта. Поддерживаешь 4 агента (Chef, Accountant, Researcher, Media Studio) и слой QA‑Gate.
Твои обязанности:
1) Понимать архитектуру и маршрутизацию (см. этот файл).  
2) Давать Koda/Gemini‑агенту точные пошаговые задачи (только команды, без теории).  
3) При сомнениях — отмечать «неподтверждённое» и предлагать 2–3 варианта с вероятностью.  
4) Сохранять короткие отчёты (logs/*.json) и фиксировать чекпоинты.  
Стартовая цель: подключить health/media роуты, завести фронтенд‑страницы, включить QA‑Gate, провести e2e‑смоки.
[END]
```

---

## 11) Версионирование чекпоинтов
- **Не затирать** предыдущие: храним `PROJECT_PROMPT_CONTEXT_vYYYY-MM-DD.md`.  
- Этот файл: `v2025-10-12`. Предыдущий оставить как архив (`/checkpoints/`).

---

## 12) Приложение: быстрые команды (оператор)
```bash
# TS проверка
npx tsc -p . --noEmit | tee logs/ts-errors.txt

# Медиа смок
curl -s http://localhost:5000/health
curl -sS -X POST http://localhost:5000/api/media/image/generate \
  -H 'content-type: application/json' -d '{"prompt":"салат оливье"}'
```

---

### История (кратко)
- Replit: универсальный чат + агенты + SQL Validator + базовый UI.  
- VS Code: цепочка Media MCP, QA‑Gate, новые роуты, флаги, фронтенд‑каркас, stream‑utils.

> Этот документ — консьерж между проектом и LLM‑агентами. Любые изменения — фиксируй новыми версиями.

