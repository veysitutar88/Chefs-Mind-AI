# PR: Block 0 — Infra-fix

Summary:
- Unify dev port to 5001 across env, compose, frontend, tests.
- Demote video endpoint when disabled: return 200 { ok:false, reason:"video_disabled" }.
- Health payload includes port and video flag.
- Deployment strategy is deferred; added docs/DEPLOYMENT_STRATEGY.md stub.

Changes:
- .env, .env.sample: PORT=5001, ENABLE_VIDEO=false, BASE_URL=http://localhost:5001, NEXT_PUBLIC_API_URL=http://localhost:5001
- docker-compose.yml, docker-compose.prod.yml: ports "5001:5001", env PORT=5001
- playwright.config.ts: baseURL=http://localhost:5001 (via env fallback)
- server /health: { ok:true, port:5001, video_enabled:false }
- POST /api/media/video/generate: 200 { ok:false, reason:"video_disabled" } when disabled
- docs/DEPLOYMENT_STRATEGY.md: status deferred_by_user

Acceptance Checklist:
- [x] GET /health → 200 { ok:true, port:5001, video_enabled:false }
- [x] POST /api/media/video/generate → 200 { ok:false, reason:"video_disabled" }
- [x] GET /metrics exposes Prometheus text format with proper Content-Type
- [x] Frontend env uses NEXT_PUBLIC_API_URL=http://localhost:5001
- [x] Playwright baseURL=http://localhost:5001
- [x] All smokes/e2e green headed

Test Artifacts:
- /out/reports/block0-infra-fix/e2e-headed-run.log
- /out/reports/block0-infra-fix/endpoints-check.log

How to verify locally:
1) set PORT=5001 && npm run dev (or docker compose up -d)
2) curl http://localhost:5001/health
3) curl -X POST http://localhost:5001/api/media/video/generate
4) curl -I http://localhost:5001/metrics

Notes:
- Deployment strategy intentionally deferred per user instruction.