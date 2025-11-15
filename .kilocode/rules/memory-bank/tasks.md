# Tasks (Templates)
## Task: Infra‑fix — unify port 5001 & demote video endpoint
**Goal:** all green smokes on 5001; remove 501 from video when disabled.

**Steps:**
1. Set `.env.sample`: `PORT=5001`, `BASE_URL=http://localhost:5001`, `ENABLE_VIDEO=false`, `NEXT_PUBLIC_API_URL=http://localhost:5001`.
2. `docker-compose.yml`: `ports: "5001:5001"`, `environment: PORT=5001`.
3. Frontend: `playwright.config.(ts|js)` baseURL from `process.env.BASE_URL || "http://localhost:5001"`;
   `package.json` scripts read env (no hardcoded 5003).
4. Backend: export `PORT`, `ENABLE_VIDEO`; `/health` includes `{ port, video.enabled }`.
5. `/api/media/video/generate`: when `!ENABLE_VIDEO` → `200 { ok:false, reason:"video_disabled" }`.
6. Update smoke/E2E expectations.
7. Run: npm i; npm run dev (or docker compose up -d --build); curl /health, /metrics; curl POST /media/video/generate; npm run test:e2e.
8. PR: title+body per template; on merge → update checkpoint/context.

**Acceptance:**
- Health shows port 5001, video disabled.
- Metrics header OK.
- Video endpoint returns 200 with reason.
- E2E smokes green.
