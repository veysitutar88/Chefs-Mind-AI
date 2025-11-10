Отлично, Игорь 👍
Ниже — **полная и финальная инструкция `docs/surface_deploy.md`**, в которой:

* Поднят **весь контекст проекта Chef’s Mind AI** с самого начала (назначение, структура, таблицы, агенты, API, UI).
* Подробно расписан **Surface Deploy (Windows 10/11)** — от подготовки до автозапуска.
* Добавлены схемы ролей, бэкапов, таблиц и CI-задач.
* Указаны все известные зависимости и точки интеграции (Gemini, Vertex, Perplexity и т.д.).

---

# 📘 **Chef’s Mind AI — Surface Deploy & Technical Overview**

**Версия:** v2.1.1 (smoke-pass)
**Дата:** 17 октября 2025
**Автор:** Chef’s Mind AI / Project Igor
**Платформа:** Windows 10/11 (Surface Pro 5+)
**Режим:** Local + Docker + Safe

---

## 🧭 1. Назначение проекта

**Chef’s Mind AI** — это **многоагентная система** для ресторанного бизнеса, объединяющая:

* учёт рецептур и себестоимости,
* бухгалтерию и закупки,
* медиа-контент (фото/видео блюд),
* внутренний AI-ассистент шефа.

Архитектура построена по принципу **Chef → Accountant → Researcher → Media Studio**, где каждый агент обслуживает свой домен, но работает через общий API и ролевую модель RBAC.

---

## ⚙️ 2. Общая архитектура (слои проекта)

| Слой                      | Назначение                                             | Основные файлы / Папки                          |
| ------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| **API (Backend)**         | Основная логика, REST-эндпоинты, RBAC, бэкапы, метрики | `server/`, `routes/`, `controllers/`, `models/` |
| **Database (PostgreSQL)** | Учёт рецептов, ингредиентов, закупок, заказов          | `drizzle/`, `server/db/`, `schema.ts`           |
| **Frontend (Next.js 14)** | Веб-интерфейс для шефа и бухгалтерии                   | `frontend/`                                     |
| **Auth & RBAC**           | Роли: admin, chef, accountant, media, researcher       | `server/middleware/rbac.ts`                     |
| **Backup/Restore**        | Автоматический ежедневный бэкап PostgreSQL (03:00 UTC) | `server/backup/`, `scripts/backup.ps1`          |
| **Observability**         | Метрики Prometheus и health-проверки                   | `/metrics`, `/api/health`                       |
| **Docker Infra**          | Развёртывание контейнеров (app, db, redis, ui)         | `docker-compose.yml`, `Dockerfile`              |
| **CI/CD (Smoke Suite)**   | Автоматический тест эндпоинтов и API                   | `scripts/smoke_suite.ps1`                       |

---

## 🧩 3. Активные агенты и их задачи

| Агент            | Описание                                         | Основные маршруты   |
| ---------------- | ------------------------------------------------ | ------------------- |
| **Chef**         | Главный исполнитель — рецепты, ингредиенты, меню | `/api/chef/*`       |
| **Accountant**   | Финансы, закупки, счета, контроль оплат          | `/api/accountant/*` |
| **Researcher**   | Аналитика, нейросети, новые блюда, рекомендации  | `/api/research/*`   |
| **Media Studio** | Фото/видео блюд, визуальные промты, файлы        | `/api/media/*`      |
| **Backup Bot**   | Бэкап и восстановление БД, логирование           | `/api/backup/*`     |
| **RBAC Service** | Проверка прав и ролей, тест `/api/rbac/smoke`    | `/api/rbac/*`       |

---

## 🗄️ 4. Таблицы базы данных (Drizzle / PostgreSQL)

| Таблица         | Назначение                               | Ключевые поля                                         |
| --------------- | ---------------------------------------- | ----------------------------------------------------- |
| **ingredients** | Базовые ингредиенты с ценой и категорией | `id`, `name`, `unit`, `category`, `price`             |
| **recipes**     | Рецепты с составом и технологией         | `id`, `title`, `description`, `ingredients[]`, `cost` |
| **orders**      | Заказы / закупки                         | `id`, `supplier`, `amount`, `due_date`, `status`      |
| **suppliers**   | Список поставщиков                       | `id`, `name`, `contact`, `rating`                     |
| **media_files** | Фото и видео блюд                        | `id`, `file_path`, `type`, `tags`                     |
| **users**       | Учётные записи / роли                    | `id`, `name`, `email`, `role`                         |

---

## 💾 5. Бэкапы и структура логов

Бэкап выполняется **ежедневно в 03:00 UTC** и сохраняется в `/out/backups/backup_YYYYMMDD.sql.gz`.

| Каталог                | Содержание                                             |
| ---------------------- | ------------------------------------------------------ |
| `/logs/`               | health, metrics, smoke, docker, rbac, import, calendar |
| `/out/backups/`        | ежедневные SQL-бэкапы                                  |
| `/checkpoints/`        | снапшоты конфигураций                                  |
| `/docs/`               | документация проекта                                   |
| `/frontend/.env.local` | URL API для UI                                         |
| `/scripts/`            | smoke-и бэкап-скрипты PowerShell                       |

---

## 🧠 6. Поддерживаемые интеграции AI

| Поставщик                     | Использование                    | Переменная           |
| ----------------------------- | -------------------------------- | -------------------- |
| **OpenAI GPT-5**              | Chef / Orchestrator / Researcher | `OPENAI_API_KEY`     |
| **Google Vertex AI (Gemini)** | Media Studio / Vision / Auth     | `VERTEX_PROJECT_ID`  |
| **Perplexity Sonar API**      | Researcher / Assistant Search    | `PERPLEXITY_API_KEY` |

Все ключи заданы в `.env` и **уже активны** (см. `env_baseline`).

---

## 🧰 7. Установка на Surface (Windows 10/11)

### 🔹 Шаг 1 — Установить зависимости

```powershell
winget install Docker.DockerDesktop
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

### 🔹 Шаг 2 — Клонировать проект

```powershell
cd C:\Projects
git clone https://github.com/<your_repo>/chefs-mind-ai.git
cd chefs-mind-ai
```

### 🔹 Шаг 3 — Проверить `.env`

Убедись, что `.env` и `.env.local` содержат:

```
PORT=5000
SAFE_MODE=1
DATABASE_URL=postgres://...
SESSION_SECRET=<ключ>
OPENAI_API_KEY=<ключ>
VERTEX_PROJECT_ID=<ключ>
PERPLEXITY_API_KEY=<ключ>
```

---

## 🐳 8. Запуск Docker-контейнеров

### 🔸 Первый запуск

```powershell
docker compose up -d --build
```

### 🔸 Проверка

```powershell
curl http://localhost:5001/api/health
```

✅ Ожидаемый ответ:

```json
{"ok":true,"ts":1760677492691}
```

---

## 🌐 9. Запуск фронтенда (Next.js 14)

```powershell
cd C:\Projects\Chefs-Mind-AI\frontend
npm install
npm run dev
```

Фронтенд доступен по адресу:
➡️ **[http://localhost:3000](http://localhost:3000)**
API подключен к **[http://localhost:5001](http://localhost:5001)**.

---

## 🧪 10. Smoke-тесты

Для автоматической проверки всех API:

```powershell
pwsh -File .\scripts\smoke_suite.ps1 -HostUrl http://localhost:5001
```

Проверяются:

* /api/health
* /metrics
* /auth/google/status
* /api/rbac/smoke
* /api/import/upload
* /api/accountant/calendar

Результаты: `logs/smoke_suite_summary.json`

---

## 🔄 11. Автозапуск на Surface (schtasks)

Создай задачу Windows Scheduler:

```powershell
schtasks /Create /TN "ChefMindAI_Autostart" /TR "pwsh -NoProfile -ExecutionPolicy Bypass -Command 'cd C:\Projects\Chefs-Mind-AI; docker compose up -d'" /SC ONLOGON /RL HIGHEST /F
```

📋 **Проверка:**

```powershell
schtasks /Run /TN "ChefMindAI_Autostart"
```

---

## 📈 12. Мониторинг и метрики

* Health: `http://localhost:5001/api/health`
* Metrics (Prometheus): `http://localhost:5001/metrics`
* Google Calendar Smoke: `/api/accountant/calendar`
* RBAC Test: `/api/rbac/smoke`

---

## 🧩 13. Чекпоинты и резервное восстановление

| Файл                                            | Назначение                           |
| ----------------------------------------------- | ------------------------------------ |
| `checkpoints/master_checkpoint_2025_10_17.json` | текущий снимок стабильного состояния |
| `docs/RELEASE_NOTES_v2.1.1-smoke-pass.md`       | описание релиза                      |
| `docs/surface_deploy.md`                        | текущая инструкция                   |
| `/out/backups/backup_*.sql.gz`                  | ежедневные дампы БД                  |

Для восстановления:

```powershell
docker exec -i chefs-mind-ai-app-1 psql -U postgres -d chefsmind < out/backups/backup_20251017.sql
```

---

## 🧾 14. История версий (ключевые этапы)

| Версия | Дата       | Основные изменения                      |
| ------ | ---------- | --------------------------------------- |
| 2.0.0  | 2025-10-10 | Docker, RBAC, Metrics, OAuth            |
| 2.1.0  | 2025-10-15 | Health OK, Backup API, Stable Build     |
| 2.1.1  | 2025-10-17 | Frontend Next 14, Ping API, Smoke 6/6 ✅ |

---

## 💬 15. Контекстная суть проекта

Chef’s Mind AI — ядро ресторанной ERP-системы, которая объединяет:

* поварской интеллект (**Chef Agent**),
* финансовую модель (**Accountant Agent**),
* исследовательскую подсистему (**Researcher Agent**),
* визуальный контент и фото-подачу (**Media Studio**).

Система основана на связке:
**Node.js (API)** + **PostgreSQL (data)** + **Next.js (UI)** + **Docker (deploy)**.
Плюс поддержка **AI-провайдеров**: OpenAI, Gemini, Perplexity.

---

## 🧭 16. Следующий этап

* [ ] CI-Smoke Gate в GitHub Actions.
* [ ] Добавить build-номер в UI футер.
* [ ] Интеграция Chef’s Mind ERP с внешним календарём Google.
* [ ] Подключить Gemini Vision для Media Studio.
* [ ] Подготовить production Docker-сборку и сертификат HTTPS.

---

### ✅ Финальный статус:

> Все проверки прошли успешно.
> Проект полностью собран, стабилен, протестирован (6/6 smoke), готов к Surface Deploy.
> API: **5001**, UI: **3000**, DB: **PostgreSQL (Neon)**,
> Agents: **Chef / Accountant / Researcher / Media Studio / RBAC / Backup.**

---

Хочешь, я сразу оформлю этот документ в **PDF-формате (с красивой вёрсткой и таблицами)** и добавлю в `docs/Surface_Deploy_Guide.pdf`?
