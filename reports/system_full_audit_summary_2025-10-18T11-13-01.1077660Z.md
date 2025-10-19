# SYSTEM-FULL-AUDIT/B — Итоговая сводка по логу
Источник лога: [reports/system_full_audit_raw_2025-10-18T11-13-01.1077660Z.md](reports/system_full_audit_raw_2025-10-18T11-13-01.1077660Z.md:1)
ISO-метка: 2025-10-18T11-13-01.1077660Z
Git commit: d7242c7 (см. секцию "## 0) Date and Git" в логе)

— Port Map (стандартизованная)
- UI (Next dev): 3000
- API (public): 5001 → (container): 5000
  - Основания: [docker-compose.yml](docker-compose.yml:1) ports "5001:5000"; [Dockerfile](Dockerfile:1) EXPOSE 5000; см. секцию "## 5) Docker files" в логе

— Занятость ключевых портов (по снимкам ОС)
- 3000: занят (LISTEN) PID 25116 — см. "## 4) OS ports snapshot" и "netstat -ano"
- 5000: свободен — нет LISTEN записей в netstat
- 5001: свободен — нет LISTEN записей в netstat
- 3010: свободен — нет LISTEN записей в netstat
- 3011: свободен — нет LISTEN записей в netstat
  - Подтверждение: см. "## 4) OS ports snapshot" и блоки "netstat -ano" / "PowerShell" в логе

Frontend status
- Node/npm/os: Node v22.17.0; npm 10.9.2; win32 x64 — см. "## 1) Node/NPM and system platform"
- Framework: Next 14.2.5 — см. [frontend/package.json](frontend/package.json:1) и "## 2) FRONTEND (Next.js)"
- Dev-скрипт и порт: "next dev -p 3000" → 3000 — см. [frontend/package.json](frontend/package.json:1)
- Router: App Router (наличие app/page.tsx и артефактов app/* в .next) — см. "## 2) FRONTEND (Next.js)"
- .env.local: есть; значения (safe extract): 
  - NEXT_PUBLIC_API_URL=http://localhost:5001
  - VITE_API_BASE=http://localhost:5001
  - см. "## 2) FRONTEND (Next.js)" и "Extract ports from .env files"
- API base env:
  - Предпочтительное: NEXT_PUBLIC_API_URL (найдено)
  - VITE_API_BASE: присутствует в .env.local; использование в коде — данных в этом логе нет (раздел поиска использования отсутствует)

Backend status
- Framework: Express (по контексту раздела и вызовам app.listen/server.listen) — см. "## 3) BACKEND (Node/Express)" и ссылки на файлы
  - Порты в коде:
    - [server/index.ts](server/index.ts:39): PORT || '5000'
    - [server/demo-server.ts](server/demo-server.ts:6): PORT || 5001
    - [server/enhanced-server.ts](server/enhanced-server.ts:16): PORT || 5002
  - CORS origin включает http://localhost:3000 и http://localhost:5001 — см. [server/index.ts](server/index.ts:22)
- Health/Metrics доступность: HTTP-проверки в логе отсутствуют; статус недоступен — см. отсутствие секции с curl/HTTP в логе

Docker/Compose
- docker-compose: есть — см. [docker-compose.yml](docker-compose.yml:1)
- Port mapping: 5001:5000 — см. [docker-compose.yml](docker-compose.yml:1)
- EXPOSE: 5000 — см. [Dockerfile](Dockerfile:1)
- Healthcheck: настроен (wget http://localhost:5000/api/health) — см. [docker-compose.yml](docker-compose.yml:1)
- Переменные окружения: используется корневой .env (present) — см. "## 3) BACKEND (Node/Express)" и "## 5) Docker files"

Risks & Fix List
- P1: Порт 3000 занят (PID 25116) — риск коллизии для Next dev (см. "## 4) OS ports snapshot")
- P1: Несогласованность портов backend (5000 vs 5001 vs 5002) при маппинге 5001:5000 в Compose — требуется унификация (см. "## 3) BACKEND (Node/Express)" и "## 5) Docker files")
- P2: Дублирующие переменные API base (NEXT_PUBLIC_API_URL и VITE_API_BASE), использование VITE не подтверждено — риск рассинхронизации (см. "## 2) FRONTEND (Next.js)")
- P2: Отсутствуют фактические HTTP статусы health/metrics — невозможна автоматическая валидация (см. отсутствие "Health/metrics pings")
- P3: [NO server/package.json] — может усложнять запуск/скрипты сервера (см. "## 3) BACKEND (Node/Express)")

Источники фактов (секции лога)
- Node/npm/os: см. "## 1) Node/NPM and system platform"
- Frontend package/env: см. "## 2) FRONTEND (Next.js)" и "Extract ports from .env files"
- Backend порты/код: см. "## 3) BACKEND (Node/Express)"
- Порты ОС: см. "## 4) OS ports snapshot" (netstat/PowerShell)
- Docker/Compose/EXPOSE/healthcheck: см. "## 5) Docker files"
