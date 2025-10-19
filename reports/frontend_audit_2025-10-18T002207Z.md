# Frontend Audit Report
**Generated:** 2025-10-18T002207Z  
**Git Commit:** d7242c7

---

## 1) Node & NPM Versions

```
v22.17.0
10.9.2
```

---

## 2) Frontend Directory

```
c:\Projects\Chefs-Mind-AI\frontend
```

---

## 3) package.json (raw)

```json
{
  "name": "chefs-mind-ai-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3010",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "ai": "^3.4.32",
    "assistant-ui": "^0.0.61",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.5"
  }
}
```

---

## 4) npm ls --depth=0

```
chefs-mind-ai-frontend@0.1.0 c:\Projects\Chefs-Mind-AI\frontend
├── @radix-ui/react-avatar@1.1.10
├── @radix-ui/react-dialog@1.1.15
├── @radix-ui/react-dropdown-menu@2.1.16
├── @radix-ui/react-label@2.1.7
├── @radix-ui/react-scroll-area@1.2.10
├── @radix-ui/react-separator@1.1.7
├── @radix-ui/react-slot@1.2.3
├── @radix-ui/react-toast@1.2.15
├── @types/node@20.19.21
├── @types/react-dom@18.3.7
├── @types/react@18.3.26
├── ai@3.4.33
├── assistant-ui@0.0.61
├── class-variance-authority@0.7.1
├── clsx@2.1.1
├── eslint-config-next@14.2.5
├── eslint@8.57.1
├── lucide-react@0.454.0
├── next@14.2.5
├── postcss@8.5.6
├── react-dom@18.3.1
├── react@18.3.1
├── tailwind-merge@2.6.0
├── tailwindcss-animate@1.0.7
└── typescript@5.9.3
```

---

## 5) grep @radix-ui/react-button

```
[no matches]
```

---

## 6) grep from "@/components/ui/button"

```
[no matches]
```

---

## 7) next.config.js (raw)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
```

---

## 8) npx next info

```
Operating System:
  Platform: win32
  Arch: x64
  Version: Windows 11 Pro
  Available memory (MB): 32531
  Available CPU cores: 20
Binaries:
  Node: 22.17.0
  npm: N/A
  Yarn: N/A
  pnpm: N/A
Relevant Packages:
  next: 14.2.5 // An outdated version detected (latest is 15.5.6), upgrade is highly recommended!
  eslint-config-next: 14.2.5
  react: 18.3.1
  react-dom: 18.3.1
  typescript: 5.9.3
Next.js Config:
  output: N/A
 ⚠ An outdated version detected (latest is 15.5.6), upgrade is highly recommended!
   Please try the latest canary version (`npm install next@canary`) to confirm the issue still exists before creating a new issue.
   Read more - https://nextjs.org/docs/messages/opening-an-issue
```

---

## 9) package.json scripts

```json
{
  "dev": "next dev -p 3010",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

---

## 10) App Router structure (src\app, app)

```
Directory: c:\Projects\Chefs-Mind-AI\frontend\src\app

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         10/18/2025  12:22 AM                .next
-a----         10/18/2025  12:22 AM            0 globals.css
-a----         10/18/2025  12:22 AM            0 layout.tsx
-a----         10/18/2025  12:22 AM            0 page.tsx
```

---

## 11) .env.local (masked values)

```
NEXT_PUBLIC_API_URL=[MASKED]
VITE_API_BASE=[MASKED]
```

---

## 12) env usage in code

### NEXT_PUBLIC_API_URL

```
src\app\page.tsx:35:      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
src\lib\api.ts:3:const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
```

### VITE_API_BASE

```
[VITE_API_BASE not found]
```

---

## 13) Git rev and status

```
d7242c7
```

**Git Status (porcelain):**
```
 M .env
 M .env.example
 M .next/trace
 M frontend-enhanced/.next/app-build-manifest.json
 M frontend-enhanced/.next/build-manifest.json
 M frontend-enhanced/.next/server/app-paths-manifest.json
 M frontend-enhanced/.next/server/app/_not-found/page.js
 M frontend-enhanced/.next/server/app/_not-found/page_client-reference-manifest.js
 M frontend-enhanced/.next/server/interception-route-rewrite-manifest.js
 M frontend-enhanced/.next/server/middleware-build-manifest.json
 M frontend-enhanced/.next/server/middleware-react-loadable-manifest.js
 M frontend-enhanced/.next/server/next-font-manifest.js
 M frontend-enhanced/.next/server/pages-manifest.json
 M frontend-enhanced/.next/server/server-reference-manifest.js
 M frontend-enhanced/.next/server/webpack-runtime.js
 D frontend-enhanced/.next/server/vendor-chunks/@opentelemetry.js
 D frontend-enhanced/.next/server/vendor-chunks/@swc.js
 D frontend-enhanced/.next/server/vendor-chunks/next.js
 D frontend-enhanced/.next/static/chunks/app-pages-internals.js
 D frontend-enhanced/.next/static/chunks/app/_not-found/page.js
 D frontend-enhanced/.next/static/chunks/app/layout.js
 D frontend-enhanced/.next/static/chunks/main-app.js
 D frontend-enhanced/.next/static/chunks/polyfills.js
 D frontend-enhanced/.next/static/chunks/webpack.js
 D frontend-enhanced/.next/static/development/_buildManifest.js
 D frontend-enhanced/.next/static/development/_ssgManifest.js
 D frontend-enhanced/.next/static/webpack/633457081244afec._.hot-update.json
 D frontend-enhanced/.next/static/webpack/bfff3c2b6473c8ee.webpack.hot-update.json
 D frontend-enhanced/.next/static/webpack/ed9043cce5b6c1a4.webpack.hot-update.json
 D frontend-enhanced/.next/static/webpack/webpack.bfff3c2b6473c8ee.hot-update.js
 D frontend-enhanced/.next/static/webpack/webpack.ed9043cce5b6c1a4.hot-update.js
 M frontend-enhanced/.next/trace
 M frontend-enhanced/app/page.tsx
 M frontend-enhanced/package-lock.json
 M frontend-enhanced/package.json
 M frontend-enhanced/src/app/page.tsx
 M frontend/next.config.js
 M frontend/package.json
 M frontend/src/app/page.tsx
 M logs/PROJECT_AUDIT.json
 M package-lock.json
 M package.json
 M server/auth.ts
 M server/auth/google.ts
 M server/db.ts
 M server/enhanced-server.ts
 M server/graph/nodes/accountant.ts
 M server/graph/nodes/quality_control.ts
 M server/graph/nodes/researcher.ts
 M server/graph/nodes/router.ts
 M server/index.ts
 M server/lib/mediaPrompter.ts
 M server/middleware/jwtAuth.ts
 M server/routes.ts
 M server/routes/agent-chat.ts
 M server/routes/auth.google.ts
 M server/routes/dbadmin.ts
 M server/routes/enhanced-agent-chat.ts
 M server/routes/importer.ts
 M server/services/enhanced-media.ts
 M server/services/gemini.ts
 M server/services/google-mcp.ts
 M server/services/openai.ts
 M server/services/stt.ts
 M server/services/universal.ts
 M server/storage.ts
 M server/vite.ts
 M shared/schema.ts
 M vite.config.ts
?? .dockerignore
?? .eslintrc.cjs
?? .github/
?? .husky/
?? .kilocode/
?? .kilocodemodes
?? .prettierrc
?? .vscode/
?? ACTIONS_ARCH_01.md
?? CTX_CHEFS_MIND_MASTER_CONTEXT.mdown
?? Dockerfile
?? IMG_20251013_125614.jpg
?? agent_brief_chefs_mind_ai_v_2025_10_12.md
?? audit.bat
?? checkpoints/
?? chefs_mind_ai_master_checkpoint_v_2025_10_12.md
?? data/
?? docker-compose.override.yml
?? docker-compose.yml
?? docs/
?? frontend-enhanced/.next/BUILD_ID
?? frontend-enhanced/.next/app-path-routes-manifest.json
?? frontend-enhanced/.next/cache/.tsbuildinfo
?? frontend-enhanced/.next/cache/webpack/client-production/
?? frontend-enhanced/.next/cache/webpack/edge-server-production/
?? frontend-enhanced/.next/cache/webpack/server-production/
?? frontend-enhanced/.next/export-marker.json
?? frontend-enhanced/.next/images-manifest.json
?? frontend-enhanced/.next/next-minimal-server.js.nft.json
?? frontend-enhanced/.next/next-server.js.nft.json
?? frontend-enhanced/.next/prerender-manifest.js
?? frontend-enhanced/.next/prerender-manifest.json
?? frontend-enhanced/.next/required-server-files.json
?? frontend-enhanced/.next/routes-manifest.json
?? frontend-enhanced/.next/server/app/_not-found.meta
?? frontend-enhanced/.next/server/app/_not-found.rsc
?? frontend-enhanced/.next/server/app/_not-found/page.js.nft.json
?? frontend-enhanced/.next/server/app/index.meta
?? frontend-enhanced/.next/server/app/index.rsc
?? frontend-enhanced/.next/server/app/page.js
?? frontend-enhanced/.next/server/app/page.js.nft.json
?? frontend-enhanced/.next/server/app/page_client-reference-manifest.js
?? frontend-enhanced/.next/server/chunks/
?? frontend-enhanced/.next/server/font-manifest.json
?? frontend-enhanced/.next/server/functions-config-manifest.json
?? frontend-enhanced/.next/server/pages/
?? frontend-enhanced/.next/types/app/page.ts
?? frontend-enhanced/app/register-test/
?? frontend-enhanced/components/
?? frontend-enhanced/postcss.config.js
?? frontend-enhanced/styles/
?? frontend/.env.local
?? frontend/.next/
?? frontend/next-env.d.ts
?? frontend/package-lock.json
?? frontend/postcss.config.js
?? logs/CRITICAL_ACTION_PLAN_2025_10_14.md
?? logs/CTX_SUMMARY.txt
?? logs/Chefs-Mind-AI.code-workspace
?? logs/action_plan_2025_10_14.json
?? logs/action_plan_2025_10_14_v2.json
?? logs/backend_live.log
?? logs/backup_smoke.json
?? logs/boot_smoke_server.log
?? logs/calendar_smoke.json
?? logs/checkpoint_summary_2025_10_14.md
?? logs/checkpoints_scan.json
?? logs/db_check_ingredients.txt
?? logs/db_migrate_ingredients_exec.txt
?? logs/db_ping.json
?? logs/dev_server.log
?? logs/dev_server_b1_smoke.log
?? logs/dev_server_boot.log
?? logs/diagnostics_summary_2025_10_14.md
?? logs/docker_boot_tail.txt
?? logs/docker_boot_tail_5001.txt
?? logs/docker_build_smoke.json
?? logs/docker_deployment_progress.md
?? logs/docker_local_smoke.json
?? logs/docker_runtime_diagnosis.json
?? logs/docker_task_status.json
?? logs/docker_task_status.txt
?? logs/env-sync-analysis.json
?? logs/env_db_check.json
?? logs/env_oauth_check.json
?? logs/env_verify.json
?? logs/google-smoke.json
?? logs/google_status.json
?? logs/health_after_g1.json
?? logs/health_after_r1.json
?? logs/health_live.json
?? logs/health_smoke.json
?? logs/import_smoke.json
?? logs/keys_deep_diag.json
?? logs/media_smoke.json
?? logs/metrics_analysis.json
?? logs/metrics_server.log
?? logs/metrics_smoke.json
?? logs/metrics_surface.json
?? logs/models_inspect.json
?? logs/models_smoke.json
?? logs/models_update_diff.json
?? logs/oauth_smoke.json
?? logs/oauth_status_current.txt
?? logs/postdeploy_env_and_probes.json
?? logs/probe_5002.txt
?? logs/probe_health_5000.txt
?? logs/probe_health_inside.txt
?? logs/probe_health_verbose.txt
?? logs/probe_metrics_5000.txt
?? logs/probe_oauth_status.txt
?? logs/probe_rbac_smoke.txt
?? logs/rbac_smoke.json
?? logs/rbac_smoke_live.json
?? logs/session_latest.json
?? logs/smoke_suite_first_failure.txt
?? logs/smoke_suite_summary.json
?? logs/smoke_suite_table.txt
?? logs/status_now.json
?? logs/task_B1_api.json
?? logs/task_B1_cron.json
?? logs/task_B7_METRICS.json
?? logs/task_BOOT_SMOKE.json
?? logs/task_C1_RBAC.json
?? logs/task_G1.json
?? logs/task_Q1.json
?? logs/task_R1.json
?? logs/task_R1_EXPORT_FIX.json
?? logs/task_R1_FIX_BOOT.json
?? logs/task_R1_TSC_BOOT_SMOKE.json
?? logs/ts-after-fix.txt
?? logs/ts_errors_initial_2025_10_14.txt
?? logs/tsc_after_fix.txt
?? logs/tsc_fix_start.json
?? logs/vite_boot_smoke.json
?? logs/vite_fix_summary.json
?? logs/vite_split_refactor.json
?? models.config.json
?? out/reports/
?? reports/
?? scripts/backup-smoke-test.js
?? scripts/db-verify.js
?? scripts/models-smoke.js
?? scripts/perplexity-debug.cjs
?? scripts/provider-ping.cjs
?? scripts/rbac-smoke-live.cjs
?? scripts/smoke_suite.ps1
?? scripts/smoke_suite_config.json
?? scripts/sync-env-to-user.cjs
?? scripts/sync-env.bat
?? scripts/test-rbac.js
?? scripts/verify-env.cjs
?? server/metrics.ts
?? server/middleware/qaGate.ts
?? server/middleware/rbac.ts
?? server/routes.ts.backup
?? server/routes/smoke-helpers.ts
?? server/services/backupScheduler.ts
?? server/utils/log.ts
?? server/utils/static.ts
?? shared/types.ts
?? temp_script.js
?? tests/
?? vitest.config.ts
```

---

## APPENDIX: Attached raw files

### frontend\package.json

```json
{
  "name": "chefs-mind-ai-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3010",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "ai": "^3.4.32",
    "assistant-ui": "^0.0.61",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.5"
  }
}
```

### frontend\next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
```

### frontend\.env.local (masked)

```
NEXT_PUBLIC_API_URL=[MASKED]
VITE_API_BASE=[MASKED]
```

---

## Summary

| Item | Status |
|------|--------|
| **Node Version** | v22.17.0 |
| **NPM Version** | 10.9.2 |
| **@radix-ui/react-button in code** | ❌ Not found |
| **@radix-ui/react-button in package.json** | ❌ Not in dependencies |
| **Dev script** | `next dev -p 3010` (port 3010) |
| **next.config.js** | Empty config (no experimental.appDir) |
| **.env.local** | ✅ Present (2 vars: NEXT_PUBLIC_API_URL, VITE_API_BASE) |
| **App Router** | ✅ Present (src\app directory exists) |
| **Next.js version** | 14.2.5 (outdated, latest: 15.5.6) |
| **Git commit** | d7242c7 |

**All sections 1→13 and Appendix present: ✅ COMPLETE**
