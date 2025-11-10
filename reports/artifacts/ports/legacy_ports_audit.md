# Legacy Ports Audit — 2025-11-10

Scope
- Репозитарный аудит на упоминания legacy-портов 5000 и 3002 в исходниках и конфигурации.

Method
- Поиск regex: (?<!\d)(?:5000|3002)(?!\d)
- Диапазон: корень проекта . включая подкаталоги.
- Инструмент: KiloCode search_files, 2025-11-10T08:13Z.

Results
- Найдено совпадений: 0
- Вывод: упоминания портов 5000/3002 отсутствуют в текущей ревизии.

Evidence (control points)
- Backend порт конфигурируется из ENV и установлен на 5003:
  - dev-скрипт: [package.json](package.json:10)
  - использование ENV: [server/index.ts](server/index.ts:20)
- CSP connectSrc содержит только 5003/3000/3001: [server/index.ts](server/index.ts:52)
- Socket.IO CORS допускает 3000/3001 (+ allowlist): [server/index.ts](server/index.ts:81)
- Frontend enhanced порты:
  - dev: 3001 → [frontend-enhanced/package.json](frontend-enhanced/package.json:7)
  - start: 3000 → [frontend-enhanced/package.json](frontend-enhanced/package.json:9)
- ENV addendum отражает CORS_ORIGIN и API base на 5003:
  - [.env.example](.env.example:60)

Historical context
- Порт 3002 ранее фигурировал в некоторых конфигурациях; удаление зафиксировано в патче:
  - [reports/artifacts/ports/patch_3002_removal.diff](reports/artifacts/ports/patch_3002_removal.diff)
- Старый smoke показал отклонения (5000/3002); требуется повторный smoke на 5003/3000/3001.

Risks and guards
- Риск дрейфа локальных скриптов или точечных override: ввести dev‑guard при NODE_ENV=development:
  - Проверять env.PORT === 5003 сразу после валидации ENV в [server/index.ts](server/index.ts:20)
- Риск несогласованного API base во фронтенде: синхронизировать NEXT_PUBLIC_API_BASE=http://localhost:5003 в .env.local

Next steps (execution list)
1) Smoke-тест на стандартных портах и сохранение артефакта:
   - [reports/artifacts/ports/smoke_3000_3001_5003.json](reports/artifacts/ports/smoke_3000_3001_5003.json)
2) Добавить dev-guard в [server/index.ts](server/index.ts:20) с предупреждением/ошибкой при PORT≠5003 в dev.
3) Синхронизировать фронтенд .env.local (enhanced и simple) для NEXT_PUBLIC_API_BASE=5003.
4) Обновить документацию портовой политики:
   - [RUNBOOK.md](RUNBOOK.md:1), [README.md](README.md:1)
5) CI‑gate: добавить проверку портов в [scripts/smoke-local.sh](scripts/smoke-local.sh:1).
6) Зафиксировать выполненные действия в логах (append‑only):
   - [reports/ACTION_LOG.md](reports/ACTION_LOG.md:1)
   - [reports/artifacts/log_summary_append.log](reports/artifacts/log_summary_append.log:1)

Sign-off
- Аудит завершён, следов 5000/3002 не обнаружено.
- Исполнитель: Kilo Code (architect mode)
- Время: 2025-11-10T08:13Z