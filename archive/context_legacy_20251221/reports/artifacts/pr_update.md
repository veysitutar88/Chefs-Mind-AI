# PR: Ports normalization — DEV 5003/3000/3001, remove 3002

## Summary
Нормализованы DEV‑порты: API 5003, Frontend 3000/3001. Удалён legacy порт 3002. CSP и Socket.IO CORS переведены на ENV‑управляемые origin‑ы, с localhost fallback.

## Changes
- Helmet CSP connectSrc обновлён (удалён 3002, добавлены 3000/3001, сохранён 5003) → [server/index.ts](server/index.ts:46)
- Socket.IO CORS origin обновлён (удалён 3002, добавлены 3000/3001) → [server/index.ts](server/index.ts:80)
- ENV настройки задокументированы в [.env.example](.env.example:1) — CORS_ORIGIN и NEXT_PUBLIC_API_BASE

## Artifacts
- План: [reports/artifacts/ports/plan_3002_removal.md](reports/artifacts/ports/plan_3002_removal.md:1)
- Патч: [reports/artifacts/ports/patch_3002_removal.diff](reports/artifacts/ports/patch_3002_removal.diff:1)
- Smoke: [reports/artifacts/ports/smoke_3000_3001_5003.json](reports/artifacts/ports/smoke_3000_3001_5003.json:1)
- Логи: [reports/ACTION_LOG.md](reports/ACTION_LOG.md:1), [reports/artifacts/log_summary_append.log](reports/artifacts/log_summary_append.log:1)

## Checklist
- [x] Plan prepared and reviewed
- [x] Code updated in [server/index.ts](server/index.ts:46) and [server/index.ts](server/index.ts:80)
- [x] ENV baseline verified (CORS_ORIGIN, NEXT_PUBLIC_API_BASE)
- [x] Smoke tests passed (5003 API, FE 3000/3001) → artifacts linked
- [x] Logs updated with summary lines
- [x] PR description prepared (this file)

## ENV Notes
- CORS_ORIGIN: http://localhost:3000,http://localhost:3001,http://localhost:5003
- NEXT_PUBLIC_API_BASE: http://localhost:5003
- PORT: 5003 (для backend)

## Risk & Rollback
- Низкий риск. При откате применить diff из [reports/artifacts/ports/patch_3002_removal.diff](reports/artifacts/ports/patch_3002_removal.diff:1).

## Test Instructions
1) Старт backend с PORT=5003.
2) Старт frontend на 3000 и/или 3001.
3) Проверить отсутствия CSP/CORS ошибок в браузере.
4) Проверить Socket.IO подключение к API с FE origin.