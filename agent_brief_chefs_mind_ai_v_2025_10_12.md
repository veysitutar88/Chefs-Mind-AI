## 🧠 AGENT_BRIEF_CHEFS_MIND_AI_v2025-10-12

### 🌟 Цель
Настроить, синхронизировать и развивать проект **Chef’s Mind AI**, не нарушая SAFE-MODE и архитектурную изоляцию агентов.  
Работа выполняется **агентом Koda/Gemini**, взаимодействие с пользователем идёт только через системный оркестратор.

---

### 🧮 Архитектура
- **4 активных агента:** Chef, Accountant, Researcher, Media Studio.  
- **1 служебный слой:** QA-Gate — факт-чек и кросс-валидация.  
- **Контейнер:** Node/Express + Next.js 14 (frontend-enhanced).  
- **Хранилище:** PostgreSQL (Neon serverless).  
- **LLM/Providers:** OpenAI (GPT-5, DALL·E 3), Google Vertex (Imagen 3, Veo 3), Perplexity (Sonar).  
- **OAuth:** Google (Drive, Sheets, Docs, Calendar).

---

### 🧱 Активные задачи (спринт 12–18 октября)

| Код | Задача | Компонент | Цель |
|-----|---------|------------|------|
| **R1** | Health + media routes | server/app.ts | Smoke e2e connectivity |
| **G1** | Google OAuth (Tasks C1–C3) | server/auth, frontend, MCP | Sheets/Docs интеграция |
| **B1** | Backup system | server/routes/db.ts | `/api/db/backup` + cron |
| **Q1** | QA-Gate integration | media middleware | логирование `qa.score` |

---

### ⚙️ Порядок выполнения агентом

#### 🔹 Шаг 1 — Проверка окружения
- `.env` должен содержать:
  ```dotenv
  GOOGLE_OAUTH_CLIENT_ID=
  GOOGLE_OAUTH_CLIENT_SECRET=
  GOOGLE_OAUTH_REDIRECT_URI=http://localhost:5000/auth/google/callback
  GOOGLE_OAUTH_SCOPES="openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/calendar"
  SESSION_SECRET=replace_me
  PORT=5000
  ```
- Проверить наличие `express-session` в зависимостях.

#### 🔹 Шаг 2 — TASK C1 (Server)
- Создать `server/auth/google.ts` по шаблону из гайда.
- Подключить к `app.ts`:  
  ```ts
  import googleAuth from "./auth/google";
  app.use("/auth/google", googleAuth);
  ```
- Проверка: `curl http://localhost:5000/auth/google/status` → `{authenticated:false}`.

#### 🔹 Шаг 3 — TASK C2 (Frontend)
- Добавить `frontend-enhanced/src/components/GoogleConnect.tsx` (из гайда).  
- Включить в главный layout или панель агента Accountant.  
- Проверка: кнопка ведёт на `/auth/google/login`.

#### 🔹 Шаг 4 — TASK C3 (MCP Smoke)
- Реализовать `sheetsClient(session)` → получить первые 5 spreadsheet файлов.  
- Логировать результат в `logs/google-smoke.json`.

#### 🔹 Шаг 5 — QA-Gate логика
- В медиа-роутах добавить middleware QA-Gate перед отдачей результата.  
- Проверить логирование `qa.score` ≥ 0.75.

#### 🔹 Шаг 6 — Backup system
- Реализовать `/api/db/backup` и `/api/db/restore`.  
- Планировщик cron (03:00 UTC).  
- Хранить артефакты в `/out/backups/`.

---

### 🧠 Правила общения
- Не обращаться напрямую к пользователю.  
- Все отчёты, diff и логи писать в `logs/` или `out/`.  
- Все новые файлы документировать в `chefs_mind_ai_master_checkpoint_next.md`.  
- Любые предположения помечать как `unverified:` с вероятностью.  
- SAFE_MODE не выключать без `X-Confirm-Code`.

---

### 🧾 Отчётность
После завершения каждого TASK:
- Создавать файл `logs/task_<CODE>.json` → `{status, timestamp, notes}`.
- Обновлять чекпоинт (`chefs_mind_ai_master_checkpoint_v_YYYY-MM-DD.md`).


---

### 🧑‍💻 Runtime агента
- **Среда:** Visual Studio Code (VS Code) + Koda/Gemini extension.
- **Терминал:** встроенный VS Code Terminal (bash/powershell) от корня репо.
- **Node/PNPM/NPM:** использовать системные, `PORT=5000`.
- **Режим:** silent → отчёт только в `logs/*.json` и `out/*`, без сообщений пользователю.
- **Политика секретов:** читать `.env` локально, не логировать значения; в логи писать только флаги `present:true/false`.

---

### 🚀 KICKOFF (инициализация)
**Команда для агента (выполнить последовательно, тихий режим):**
1) `TASK G1.START` — *Google OAuth setup (C1→C2→C3)*
   - Проверка окружения `.env` (только presence-флаги) → лог в `logs/env_oauth_check.json`.
   - C1: создать/подключить `server/auth/google.ts` → route `/auth/google/*` в `server/app.ts`.
   - C2: добавить `frontend-enhanced/src/components/GoogleConnect.tsx` и вставить в layout/панель Accountant.
   - C3: реализовать `sheetsClient(session)` и smoke `listSpreadsheets` → лог в `logs/google-smoke.json`.
   - Смоки:
     - `GET /health` → 200 OK → `logs/health_after_g1.json`
     - `GET /auth/google/status` → `{authenticated:false|true}` → `logs/google_status.json`
   - Итоговый отчёт: `logs/task_G1.json`.

2) `TASK R1.RUN` — */health и /api/media маршруты* (если не активны)
   - Проверить подключения в `server/app.ts`.
   - Смоки `curl` → `logs/media_smoke.json`.

3) `TASK Q1.WIRE` — *QA-Gate в медиа-роутах*
   - Добавить middleware; логировать `qa.score`.
   - Отчёт: `logs/task_Q1.json`.

4) `TASK B1.BUILD` — *Backup API*
   - Реализовать `/api/db/backup` и `/api/db/restore` (+ cron 03:00 UTC).
   - Артефакты: `/out/backups/*`.
   - Отчёт: `logs/task_B1.json`.

**Правило завершения:** после каждого TASK — записать отчёт и кратко обновить мастер‑чекпоинт.

---

### ✅ ENV‑CHECKLIST (для агента)
**Файл `.env` (presence‑флаги, без значений):**
- ADMIN_PASSWORD
- SESSION_SECRET
- OPENAI_API_KEY
- GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI / GOOGLE_OAUTH_SCOPES
- GOOGLE_APPLICATION_CREDENTIALS *(путь к service account, опционально)*
- VERTEX_PROJECT_ID *(если требуется)*
- PORT=5000

**Правила:**
- Не логировать значения ключей; только `{key: present|missing}` в `logs/env_check.json`.
- Папку `secrets/` не коммитить; держать в `.gitignore`.

---

### 🗂️ PROMPT GUIDE (готовые фразы для VS Code чата)
- `TASK G1.START — Use ./docs/google_oauth_setup_koda_tasks_chefs_mind_ai.md. Silent. LOG→logs/task_G1.json`
- `RUN C1 — Wire server auth. Edit ./server/auth/google.ts; mount /auth/google in ./server/app.ts. CHECK: curl /auth/google/status`
- `RUN C2 — Add GoogleConnect UI. Edit ./frontend-enhanced/src/components/GoogleConnect.tsx + layout. CHECK: open /auth/google/login`
- `RUN C3 — Implement sheetsClient(session) and listSpreadsheets smoke. LOG→logs/google-smoke.json`
- `RUN R1 — Ensure /health & /api/media/* mounted. LOG→logs/media_smoke.json`
- `RUN Q1 — Add QA-Gate to media routes; log qa.score≥0.75. LOG→logs/task_Q1.json`
- `RUN B1 — Implement /api/db/{backup,restore} + cron 03:00 UTC. Artifacts→/out/backups/*. LOG→logs/task_B1.json`
- `CHECK ENV — Presence-only audit for .env; LOG→logs/env_check.json`
- `COMMIT — Minimal diffs; summary→logs/commit_summary.txt`

