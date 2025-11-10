# NEXT_TASKS_STATUS — 2025-11-06

Scope: Авто‑проверка статуса задач и точечные правки только там, где не было DONE.

Summary
- RBAC UI hardening: DONE (покрытие RBACGuard уже есть) — no code changes
- Observability finalize: READY (добавлены локальные артефакты + API /reports/last)
- Media Video provider: DONE (Veo‑3 уже сконфигурирован) — no code changes
- Runbook/Docs sync: UPDATED (ссылки и ENV блоки)

Changes applied
1) ENV placeholders for Vertex AI
- Updated [.env.example](.env.example:29) — added VERTEX_PROJECT_ID, VERTEX_LOCATION, commented GOOGLE_APPLICATION_CREDENTIALS

2) Reports API exposure
- Added [router.get()](server/routes/smoke-helpers.ts:55) endpoint /reports/last that returns latest nightly info

3) Documentation sync
- Updated [docs/MASTER_CHECKPOINT_2025-11-06.md](docs/MASTER_CHECKPOINT_2025-11-06.md:94) — section Nightly артефакты
- Updated [agent_brief_chefs_mind_ai_v_2025_11_06.md](agent_brief_chefs_mind_ai_v_2025_11_06.md:43) — Environment Variables incl. OpenAI and Vertex; and [agent_brief_chefs_mind_ai_v_2025_11_06.md](agent_brief_chefs_mind_ai_v_2025_11_06.md:87) — Added links to nightly artifacts and status API

Artifacts (local)
- reports/nightly_oauth_chain_2025-11-06.log
- reports/nightly_oauth_status_2025-11-06.json

APIs
- GET /auth/google/status — [router.get()](server/routes/smoke-helpers.ts:10)
- GET /reports/last — [router.get()](server/routes/smoke-helpers.ts:55)

UI
- Status Dashboard — /status (frontend-enhanced)

Smoke commands
```bash
curl -sS http://localhost:5001/reports/last | jq .
curl -sS http://localhost:5001/auth/google/status | jq .
```

Notes
- Все изменения минимальны и не затрагивают существующую бизнес‑логику.
- Внешние импорты и ESM‑правила не нарушены.

Diff footprint
- [.env.example](.env.example:29)
- [server/routes/smoke-helpers.ts](server/routes/smoke-helpers.ts:55)
- [docs/MASTER_CHECKPOINT_2025-11-06.md](docs/MASTER_CHECKPOINT_2025-11-06.md:94)
- [agent_brief_chefs_mind_ai_v_2025_11_06.md](agent_brief_chefs_mind_ai_v_2025_11_06.md:43)

Status closing
- Queue executed; tasks requiring code changes were updated, others confirmed DONE.

## UI Foundation — frontend-enhanced (2025-11-06)

Новый UI-фундамент реализован в рамках создания архитектурной основы для frontend-enhanced с полным набором компонентов и страниц.

### Layout Components
- **[RootLayout](frontend-enhanced/src/app/layout.tsx:8)** — обновлён с глобальными стилями, грид-разметкой Header/Sidebar/Main и брендовой палитрой slate/indigo/amber
- **[Header](frontend-enhanced/src/components/layout/Header.tsx:1)** — основной компонент хедера с 4 контролами: Model Switcher, Command Bar, Quick Action, User Menu (RBAC + dev role switch)

### Navigation Components
- **[Sidebar](frontend-enhanced/src/components/layout/Sidebar.tsx:1)** — навигационная панель с ссылками на /dashboard, /agents, /media и активными состояниями

### UI Components
- **[ModelSwitcher](frontend-enhanced/src/components/ui/ModelSwitcher.tsx:1)** — селектор моделей с popover/fallback-select, интеграция с существующими AI моделями

### Pages Created
- **[Dashboard](frontend-enhanced/src/app/dashboard/page.tsx:1)** — страница с 3 виджетами (health, OAuth status, recent reports), использует API из [StatusPage](frontend-enhanced/src/app/status/page.tsx:12)
- **[StatusPage](frontend-enhanced/src/app/status/page.tsx:1)** — расширенная страница мониторинга системы с API интеграцией и метриками
- **[Agents](frontend-enhanced/src/app/agents/page.tsx:1)** — чат-скелетон на основе текущего [Page.sendMessage()](frontend-enhanced/src/app/page.tsx:63), HTTP режим (без WebSocket)
- **[Media](frontend-enhanced/src/app/media/page.tsx:1)** — форма (prompt, model) + превью, POST → /api/media/image/generate с обработкой RBAC ошибок

### Changes Applied
- **[page.tsx](frontend-enhanced/src/app/page.tsx:5), [page.tsx](frontend-enhanced/src/app/page.tsx:117)** — удалён GoogleConnect (auth implicit) с лендинга

### API Integration
- **[server/routes/universal.ts](server/routes/universal.ts:10)** — `/api/universal-ask-test` для Command Bar
- **[server/routes/media.ts](server/routes/media.ts:16)** — `/api/media/*` для Media страницы с метриками
- **[server/routes/auth.google.ts](server/routes/auth.google.ts:1)** — OAuth эндпоинты для Dashboard виджетов
- **[server/routes/smoke-helpers.ts](server/routes/smoke-helpers.ts:10)** — `/reports/last` для Dashboard

### Brand Palette
- Основные цвета: slate (серый), indigo (синий), amber (жёлтый)
- Grid Layout: Header/Sidebar/Main структура
- Role Management: localStorage dev role switching

### Files Created/Modified
- `frontend-enhanced/src/app/layout.tsx` — обновлён
- `frontend-enhanced/src/components/layout/Header.tsx` — создан
- `frontend-enhanced/src/components/layout/Sidebar.tsx` — создан
- `frontend-enhanced/src/components/ui/ModelSwitcher.tsx` — создан
- `frontend-enhanced/src/app/dashboard/page.tsx` — создан
- `frontend-enhanced/src/app/agents/page.tsx` — создан
- `frontend-enhanced/src/app/media/page.tsx` — создан
- `frontend-enhanced/src/app/page.tsx` — обновлён (GoogleConnect удалён)

### Testing Commands
```bash
# UI Navigation
curl -sS http://localhost:3000/dashboard
curl -sS http://localhost:3000/agents
curl -sS http://localhost:3000/media

# API Integration
curl -sS -X POST http://localhost:5001/api/universal-ask-test \
  -H "Content-Type: application/json" \
  -d '{"message": "test command"}'

curl -sS http://localhost:5001/health
curl -sS http://localhost:5001/reports/last
```

### Status
- **UI Foundation**: COMPLETE — создан полный набор компонентов и страниц
- **Backend Integration**: READY — все API эндпоинты доступны
- **RBAC Integration**: READY — User Menu поддерживает роли и dev switching
- **Next Steps**: Готов для расширения функциональности страниц и добавления бизнес-логики

## UI-Smoke Automation — 2025-11-06

Новый слой автоматизации для тестирования пользовательского интерфейса с CI/CD интеграцией.

### Automation Scripts
- **[capture-ui-screenshots.mjs](scripts/capture-ui-screenshots.mjs:1)** — основной скрипт захвата скриншотов с Playwright
- **[package.json](package.json:45)** — добавлен npm скрипт `npm run ui:screenshots` для локального запуска

### CI/CD Integration
- **[ui-smoke.yml](.github/workflows/ui-smoke.yml:1)** — отдельный workflow для UI smoke тестов
  - **Schedule**: Ежедневно в 02:10 UTC (offset от основного nightly)
  - **Trigger**: manual `workflow_dispatch` для on-demand тестирования
  - **Browser**: Playwright Chromium с полноэкранными скриншотами
  - **Pages**: Автоматический захват /dashboard, /agents, /media
  - **Artifacts**: Скриншоты сохраняются в `reports/ui_screenshots_YYYY-MM-DD/`

### Screenshot Coverage
- **Dashboard** — виджеты здоровья системы, OAuth статус, последние отчеты
- **Agents** — чат-интерфейс с выбором агентов и форматом сообщений
- **Media** — форма генерации изображений с полями prompt и model selection

### Local Testing
```bash
# Запуск скриншотов локально
npm run ui:screenshots

# Просмотр результатов
ls reports/ui_screenshots_*/
```

### CI Commands
- **Nightly Run**: Автоматически по расписанию
- **Manual Trigger**: GitHub Actions → "UI Smoke" → "Run workflow"
- **Status Check**: Workflow summary с ссылками на артефакты

### Artifacts Structure
```
reports/ui_screenshots_2025-11-06/
├── dashboard-screenshot.png
├── agents-screenshot.png
├── media-screenshot.png
└── metadata.json (timestamp, browser info, pages tested)
```

### Status
- **UI-Smoke Automation**: COMPLETE — полная автоматизация с CI/CD
- **Screenshot Coverage**: 3 страницы покрыты (dashboard, agents, media)
- **CI Integration**: Отдельный workflow с расписанием и manual trigger
- **Local Development**: npm скрипт для быстрого тестирования
- **Next**: Готов для интеграции в основной nightly workflow при необходимости