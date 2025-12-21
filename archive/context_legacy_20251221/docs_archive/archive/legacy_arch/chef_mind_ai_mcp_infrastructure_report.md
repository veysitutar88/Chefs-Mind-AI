# 🧩 Chef’s Mind AI — MCP Infrastructure Report

## 1. Архитектура и миссия
**Миссия:** создать единую ERP-платформу для ресторана, объединяющую кухню, финансы, аналитику и медиа.  
**Слои системы:**
```
Orchestrator → Agents → QA-Gate (middleware) → Providers (LLM / MCP)
```

### Агенты и их MCP-интеграции
| Агент | Назначение | MCP-интеграции |
|--------|-------------|----------------|
| **Chef** | рецепты, технология, визуальный брендинг | OpenAI / Gemini |
| **Accountant** | себестоимость, закупки, Sheets/Docs/Calendar | Google MCP |
| **Researcher** | поиск, аналитика, тренды | Perplexity Sonar |
| **Media Studio** | генерация изображений и видео | DALL·E 3, Imagen 3, Veo 3, Sora v2 |
| **QA-Gate** | middleware-слой для факт-чека и самокоррекции | встроен как MCP-инструмент |

Маршрут данных:  
`POST /api/enhanced-agent/chat` → авто-маршрутизация → QA-Gate → метаданные → ответ пользователю.

---

## 2. MCP-Серверы и Оркестрация
**MCP (Managed Control Providers):**
- **OpenAI MCP** — GPT-4o / GPT-5 для Chef и QA-Gate.
- **Google MCP** — Vertex AI и OAuth для Accountant и Media Studio.
- **Perplexity Sonar MCP** — для Researcher.
- **Internal QA MCP** — middleware-уровень валидации и контроля.

**Оркестратор (Orchestrator API):**
- Принимает запрос → классифицирует → перенаправляет через `AgentRouter` → QA-Gate.

---

## 3. Распределение задач и маршрутизация моделей
| Тип запроса | Провайдер / Модель | Применение |
|--------------|--------------------|-------------|
| Research | `sonar (Perplexity)` | поиск и анализ текущих данных |
| Complex | `gpt-4o` | многозвенные аналитические запросы |
| Moderate | `gemini-1.5-pro` | сбалансированные вычисления |
| Simple | `gpt-4o-mini` | быстрые задачи и диагностика |

**QA-Gate:** кросс-валидация + self-correction перед выводом.  
**SAFE Mode:** операции записи требуют `X-Confirm-Code`.

---

## 4. MCP в Docker и Deployment
```yaml
services:
  backend:
    build: .
    command: ["node", "dist/server/index.js"]
    ports: ["5001:5000"]
  frontend:
    build: ./frontend-enhanced
    command: ["npm", "run", "start"]
    ports: ["3000:3000"]
networks:
  default:
    name: chefs-mind-ai_default
```

**Health:** `/api/health` → 200 OK  
**Metrics:** `/metrics` (Prometheus)  
**RBAC и OAuth:** `/api/rbac/smoke`, `/api/accountant/calendar`.

---

## 5. Агентное распределение и сессии
- Каждый агент создаёт независимую **SessionID** (`api.createSession()`).
- Истории сообщений изолированы.
- Cron-задача очищает неактивные сессии.

---

## 6. Health / SAFE / Backups
```json
{
  "ok": true,
  "version": "1.0.0",
  "db": { "ok": true },
  "ext": { "openai": true, "vertex": true, "pplx": true }
}
```

- Health: ✅ OK  
- Metrics: Prometheus активен  
- Backup: `/api/db/backup`, ежедневные дампы `/out/backups/`  
- SAFE-Mode требует подтверждения.

---

## 7. Ключевые файлы и чекпоинты
| Файл | Назначение |
|------|-------------|
| `chefs_mind_ai_master_checkpoint_v_2025_10_12.md` | архитектура, агенты, MCP |
| `FINAL_REPORT (1).md` | маршрутизация и модельная логика |
| `surface_deploy.md` | деплой MCP агентов |
| `prod_effective_config_2025-10-21T19-54Z.yml` | финальная Docker-конфигурация |
| `master_checkpoint_2025_10_21_1954.json` | состояние портов и сервисов |

---

## 8. Текущее состояние (v2.1.1 Stable)
- **Оркестратор:** `/api/enhanced-agent/chat`  
- **Агенты:** Chef · Accountant · Researcher · Media Studio + QA-Gate  
- **MCP:** OpenAI · Gemini · Perplexity · Internal QA  
- **Мониторинг:** Prometheus / RBAC / OAuth Smoke  
- **Backups:** авто, восстановление `psql < backup.sql`  
- **Порты:** API — 5001, UI — 3000, DB — PostgreSQL (Neon)

---

✅ **Статус:** MCP-инфраструктура стабилизирована, архитектура многослойная, все агенты и оркестратор функционируют корректно.

