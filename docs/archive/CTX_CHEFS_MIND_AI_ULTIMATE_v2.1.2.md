# CTX_CHEFS_MIND_AI_ULTIMATE (v2.1.2)
**Updated:** 2025-11-11T17:59:22Z  
**Mode:** LOCAL (Surface deploy deferred)  
**Strategy:** Hybrid development with priority on Vertical Slices

---

## I. Purpose & Philosophy
Chef’s Mind AI — это эволюционная система, объединяющая экспертизу шеф‑повара и LLM‑оркестрацию.  
Мы строим интеллект слоями (контекст → агенты → инструкции → вайб → исполнение → QA/логирование → перенос контекста) и выпускаем продукт блоками (vertical slices), чтобы каждая фича была рабочей end‑to‑end.

**Ключевые принципы:** Context First • Plan Before Code • Minimal Assumptions • QA Everywhere • Log Continuity • Persistent Context.

---

## II. Unified Framework (Layers)
1) **Context Layer** — CONTEXT/SESSION/CHECKPOINT/last_session.  
2) **Agent Layer** — Chef, Accountant, Researcher, Media, QA‑Gate + Orchestrator.  
3) **Instruction Layer** — Agent Instructions + правилa RAG/QA.  
4) **Vibe Layer** — когнитивные режимы (строгость, лаконичность, fine‑dining эстетика).  
5) **Execution Layer** — Plan → Code → Test → Review → Analyze.  
6) **QA / Logging Layer** — score, auto‑correction, отчёты и CHANGELOG.  
7) **Context Transport Layer** — serialize/load/merge снапшоты.

---

## III. Integration Map
- **Auth/OAuth**: Google (status endpoint), sessions/JWT, RBAC + SAFE_MODE.  
- **Agents**: enhanced‑agent/chat (stream/meta), QA‑Gate.  
- **Data**: orders/purchase_orders/suppliers/attachments/notes/calendar_links.  
- **Calendar**: create/list; smoke PASS.  
- **Media**: Imagen/DALL·E/Veo с защитой от missing creds.  
- **Backup**: nightly + retention 7d + `/api/db/backup`.  
- **Metrics**: `/metrics` Prometheus на всех вариантах; `/health` алиасы.  
- **MCP**: google, media, hallucination_control — OK.

---

## IV. Current Status (from audits)
- **P1 (Critical): 100%** — базовые слои присутствуют.  
- **P2 (Important): ~83%** — детализация метрик, UI‑common pending.  
- **OAuth**: endpoints OK, refresh‑token отсутствует (ok:false).  
- **RBAC/SafeMode**: PASS.  
- **Prometheus/Health**: PASS (5000/5002).  
- **TypeScript**: ~44 ошибок в enhanced graph/media; `routes.ts L472` (esbuild).  
- **Vertex**: креденшалы отсутствуют (пока graceful degradation).

---

## V. Vertical Slices Roadmap
**Block 1 — MVP User Flow** (Login → Dashboard → Chef chat → Answer) — *in‑progress*  
**Block 2 — Multi‑Agent Routing** — pending  
**Block 3 — Data Persistence** — partial  
**Block 4 — Media Studio** — pending  
**Block 5 — Analytics & Polish** — pending

*ETA*: ~4 недели до v2.2.0 (prod‑ready без Surface deploy).  
*Overall e2e readiness*: ~91% (gap закрывается Block 1).

---

## VI. LLM Behavior Profiles
- **Chef** — профессиональная кулинарная логика, 70–80% pro‑уровня, строгий минимализм в подаче рекомендаций.  
- **Accountant** — себестоимость/поставщики, приоритет точности, числа прежде всего.  
- **Researcher** — поиск/цитаты/свежесть, веб‑верификация и источники высокого качества.  
- **Media** — промпты и ассеты, единый визуальный стиль June Six, формат 4:5, драматический свет.  
- **QA‑Gate** — валидация корректности, auto‑правки, скоринг и флаги рисков.

---

## VII. Acceptance & CI/CD
**Acceptance (per block)** — см. таблицу в ROADMAP_v2.1.2.  
**CI pipeline**: lint → tsc → build → e2e (E2E_MODE stubs при необходимости).  
**Артефакты**: `/out/reports/` (metrics snapshot, health, backup logs, QA samples).

---

## VIII. ENV & Security
Пример `.env.local` (dev):
```
PORT=5001
SESSION_SECRET=***
DATABASE_URL=postgres://...
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=***
GOOGLE_REDIRECT_URI=http://localhost:5003/auth/google/callback
```
- Обязателен refresh‑token → `/auth/google/status` должно стать `ok:true`.  
- Добавить `.env.sample` для prod и валидацию на старте.

---

## IX. Risks & Mitigations
- OAuth ok:false → получить refresh‑token (Playground).  
- TypeScript build → MVP‑путь минимальный + постепенное закрытие 44 ошибок.  
- routes.ts L472 → починить/временно исключить из MVP.  
- Vertex creds → добавить позднее (graceful degradation).

---

## X. Embedded CHECKPOINT (JSON)
Ниже — машинный снапшот состояния v2.1.2 для прямой загрузки агентами.
```json
{
  "version": "v2.1.2",
  "project": "Chef’s Mind AI",
  "updated": "2025-11-11T17:59:22Z",
  "mode": "local",
  "deploy": {
    "ready": true,
    "status": "deferred_by_user"
  },
  "readiness": {
    "p1_progress": 1.0,
    "p2_progress": 0.83,
    "overall_e2e": 0.91
  },
  "principles": [
    "Context First",
    "Plan Before Code",
    "Minimal Assumptions",
    "QA Everywhere",
    "Log Continuity",
    "Persistent Context"
  ],
  "layers": [
    "context",
    "agents",
    "instructions",
    "vibe",
    "execution",
    "qa_logging",
    "context_transport"
  ],
  "agents": {
    "list": [
      "chef",
      "accountant",
      "researcher",
      "media",
      "qa_gate"
    ],
    "orchestrator": {
      "routing": "intent_classifier + policy_map",
      "status": "planned"
    }
  },
  "security": {
    "auth": "jwt+oauth2",
    "rbac": true,
    "safe_mode": true,
    "sha256_triple": true
  },
  "api_routes": [
    "/api/enhanced-agent/chat",
    "/api/import",
    "/api/dbadmin",
    "/api/calendar",
    "/api/health",
    "/metrics",
    "/auth/google/status"
  ],
  "db": {
    "tables": [
      "orders",
      "purchase_orders",
      "suppliers",
      "attachments",
      "notes",
      "calendar_links"
    ],
    "uuid": true,
    "zod_schemas": true
  },
  "mcp": {
    "google": "ok",
    "calendar": "ok",
    "media": "ok",
    "hallucination_control": "ok"
  },
  "ai_models": {
    "providers": [
      "openai",
      "perplexity",
      "google_vertex"
    ],
    "status": {
      "openai": "ok",
      "perplexity": "ok",
      "google_vertex": "missing_credentials"
    },
    "count": 8
  },
  "metrics": {
    "prometheus": "active",
    "ports": [
      5000,
      5002
    ],
    "cpu_user_system_ms": 9600,
    "mem_rss_mb": 122,
    "event_loop_lag_ms": 15
  },
  "smoke_tests": {
    "oauth": "partial",
    "calendar": "pass",
    "rbac": "pass",
    "metrics": "pass",
    "media": "server_not_running",
    "health_5000": "ok",
    "health_5002": "ok_internal"
  },
  "issues": [
    "OAuth refresh token missing",
    "TypeScript ~44 errors in enhanced graph/media",
    "routes.ts L472 parse error",
    "Missing .env for prod; provide .env.sample",
    "Vertex credentials missing"
  ],
  "context_transport": {
    "enabled": true,
    "files": [
      "CONTEXT.md",
      "SESSION.md",
      "CHECKPOINT.json",
      "last_session.json"
    ],
    "functions": [
      "serialize_context",
      "load_context",
      "merge_context"
    ]
  },
  "backup": {
    "endpoint": "/api/db/backup",
    "retention_days": 7,
    "nightly_schedule": "02:00",
    "status": "implemented"
  },
  "llm_behavior_profiles": {
    "chef": {
      "goal": "culinary reasoning, menu & costing",
      "style": "professional, concise, 70-80% pro depth",
      "vibe": [
        "calm",
        "precise",
        "systemic"
      ],
      "qa_hooks": [
        "fact_check",
        "costing_validation"
      ]
    },
    "accountant": {
      "goal": "costing, suppliers, invoices",
      "style": "strict, numerical, risk-aware",
      "qa_hooks": [
        "totals_consistency",
        "rbac_guard"
      ]
    },
    "researcher": {
      "goal": "web/osint research with citations",
      "style": "balanced, sources-first",
      "qa_hooks": [
        "source_quality",
        "recency_check"
      ]
    },
    "media": {
      "goal": "image/video prompts & asset mgmt",
      "style": "minimalist, fine-dining aesthetics",
      "qa_hooks": [
        "format_4x5",
        "lighting_rules",
        "microgreens_policy"
      ]
    },
    "qa_gate": {
      "goal": "validate correctness & tone",
      "style": "neutral, deterministic",
      "qa_hooks": [
        "score",
        "auto-correction",
        "risk_flags"
      ]
    }
  },
  "frontend": {
    "vite": "ok",
    "ui_common_components": [
      "StatusIndicator(pending)",
      "HealthBadge(pending)",
      "Skeleton(pending)"
    ],
    "routing_issue": "routes.ts L472"
  },
  "acceptance": {
    "checks": [
      "health",
      "metrics",
      "qa_gate",
      "db_backups_list",
      "db_backup_manual",
      "calendar_create",
      "import_csv"
    ],
    "artifacts_dir": "/out/reports/"
  },
  "roadmap": {
    "blocks": [
      "MVP user flow",
      "Multi-agent routing",
      "Data persistence",
      "Media studio",
      "Analytics & polish"
    ],
    "eta_weeks": 4
  },
  "definition_of_done": [
    "Blocks 1–5 acceptance satisfied",
    "CI lint+tsc+build+e2e green",
    "Metrics/alerts stable",
    "Context auto-updated",
    "Release notes v2.2.0 with demo"
  ]
}
```

---

## XI. Definition of Done (Project)
- Blocks 1–5 приняты. CI зелёный. Метрики/алерты стабильны.  
- ULTIMATE‑контекст авто‑обновляется после значимых операций.  
- Выпущены RELEASE_NOTES v2.2.0 с демо и ссылками на отчёты.
