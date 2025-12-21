# G1 Google OAuth Audit Report
**Дата:** 2025-11-03  
**Цель:** Универсальная проверка готовности G1: Google OAuth по всем слоям (backend, env, frontend, MCP/docs)

## Summary Table

| Проверка | Статус | Описание |
|-----------|----------|-----------|
| Backend Endpoints | **PASS** | OAuth маршруты зарегистрированы и доступны |
| OAuth Provider Config | **PASS** | Используется google-auth-library, импорты корректны |
| Session/CSRF Order | **PASS** | Session middleware настроен до OAuth маршрутов |
| Env Keys Dev | **FAIL** | Отсутствуют GOOGLE_OAUTH_CLIENT_ID и GOOGLE_OAUTH_CLIENT_SECRET |
| Env Keys Prod | **UNKNOWN** | Переменные настроены в docker-compose.prod.yml |
| Redirect URIs | **PARTIAL** | Dev URI настроен, Prod URI требует проверки |
| Frontend GoogleConnect | **PASS** | Компонент существует в frontend-enhanced |
| Frontend API Base | **PASS** | URL формируется корректно через NEXT_PUBLIC_API_URL |
| UI RBAC | **GAP** | Отсутствуют проверки ролей в UI компонентах |
| MCP Sheets | **PASS** | Google Sheets интеграция реализована |
| Docs Alignment | **PASS** | Документация соответствует текущей реализации |

---

## Backend Analysis

### ✅ Ключевые файлы присутствуют:
- [`server/auth/google.ts`](server/auth/google.ts:1) - OAuth конфигурация и маршруты
- [`server/routes/auth.google.ts`](server/routes/auth.google.ts:1) - Роутер Google OAuth
- [`server/middleware/rbac.ts`](server/middleware/rbac.ts:1) - RBAC middleware
- Директория [`server/lib/google`](server/lib/google) - **N/A** (отсутствует, но не критично)

### ✅ Эндпоинты зарегистрированы:
В [`server/routes.ts`](server/routes.ts:8) найдена регистрация:
```typescript
import googleAuthRoutes from "./routes/auth.google.js";
app.use("/auth/google", googleAuthRoutes);
```

### ✅ Импорты провайдеров:
В [`server/auth/google.ts`](server/auth/google.ts:1) используется:
```typescript
import { google } from "googleapis";
```
Провайдер: **google-auth-library** (через googleapis)

### ✅ Порядок middleware:
В [`server/index.ts`](server/index.ts:1) session подключен до маршрутов:
```typescript
app.use(sessionConfig);
// ... другие middleware
app.use("/auth/google", googleAuthRoutes);
```
CSRF middleware: **N/A** (не используется, но не требуется для OAuth)

---

## Environment and Secrets

### ❌ Dev Environment - FAIL:
Проверенные файлы: [`.env`](.env:1), [`.env.local`](.env.local:1), [`.env.example`](.env.example:1)

**Отсутствующие ключи:**
- `GOOGLE_OAUTH_CLIENT_ID` - отсутствует во всех файлах
- `GOOGLE_OAUTH_CLIENT_SECRET` - отсутствует во всех файлах  
- `GOOGLE_OAUTH_REDIRECT_URI` - отсутствует в [.env](.env:1) и [.env.local](.env.local:1)

**Присутствующие ключи:**
- `GOOGLE_CLIENT_ID` - есть в [.env.example](.env.example:1)
- `GOOGLE_CLIENT_SECRET` - есть в [.env.example](.env.example:1)
- `GOOGLE_REDIRECT_URI` - есть в [.env.example](.env.example:1)

### ⚠️ Prod Environment - UNKNOWN:
В [`docker-compose.prod.yml`](docker-compose.prod.yml:1) переменные настроены:
```yaml
environment:
  - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
  - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
  - GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI}
```

### ⚠️ Redirect URI Validation:
- **Dev:** Ожидается `http://localhost:5001/auth/google/callback` (порт 5001 из [`server/index.ts`](server/index.ts:1))
- **Prod:** Настроен через окружение, но требует верификации

---

## Frontend Analysis

### ✅ GoogleConnect компонент:
Найден в [`frontend-enhanced/components/GoogleConnect.tsx`](frontend-enhanced/components/GoogleConnect.tsx:1):
```typescript
const handleGoogleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;
};
```

### ✅ API Base URL:
В [`frontend-enhanced/.env.local`](frontend-enhanced/.env.local:1):
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```
URL формируется корректно.

### ⚠️ UI RBAC - GAP:
Поиск по `role.*admin|hasRole|rbac|RBAC` в `.tsx` файлах не дал результатов.
Отсутствуют проверки ролей в UI компонентах.

---

## MCP/Sheets Analysis

### ✅ Google Sheets интеграция:
В [`server/services/google-mcp.ts`](server/services/google-mcp.ts:18-23) реализованы:
```typescript
export async function createSheet(title:string){
  const auth = authedOAuth2();
  const sheets = google.sheets({ version: "v4", auth });
  const r = await sheets.spreadsheets.create({ requestBody: { properties: { title } } });
  return { id: r.data.spreadsheetId, title: r.data.properties?.title };
}

export async function listSpreadsheets() {
  const auth = authedOAuth2();
  const drive = google.drive({ version: "v3", auth });
  // ... логика получения списка
}
```

**Dry-run команда:**  
```bash
curl -X GET http://localhost:5001/api/google/sheets/list
```

---

## Documentation Alignment

### ✅ Agent Brief Status:
В [`agent_brief_chefs_mind_ai_v_2025_10_12.md`](agent_brief_chefs_mind_ai_v_2025_10_12.md:24) указано:
> **G1** | Google OAuth (Tasks C1–C3) | server/auth, frontend, MCP | Sheets/Docs интеграция

**Соответствие реализации:**
- ✅ C1: Server auth - [`server/auth/google.ts`](server/auth/google.ts:1) реализован
- ✅ C2: Frontend component - [`frontend-enhanced/components/GoogleConnect.tsx`](frontend-enhanced/components/GoogleConnect.tsx:1) добавлен  
- ✅ C3: MCP smoke - [`server/services/google-mcp.ts`](server/services/google-mcp.ts:1) с Sheets API готов

---

## Gaps & Actions

### Критические FAIL:
1. **Environment Variables (Dev)**
   - Добавить в [`.env`](.env:1):
     ```dotenv
     GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
     GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret_here
     GOOGLE_OAUTH_REDIRECT_URI=http://localhost:5001/auth/google/callback
     ```

### GAP (не блокирующий):
2. **UI RBAC Guards**
   - Добавить проверки ролей в компонентах дашборда
   - Пример реализации:
     ```typescript
     const { user } = useAuth();
     if (user?.role !== 'admin') return <AccessDenied />;
     ```

### Рекомендации:
3. **Redirect URI Verification**
   - Проверить соответствие Prod URI с настройками Google Cloud Console
4. **Environment Naming Consistency**
   - Унифицировать имена переменных (GOOGLE_OAUTH_* vs GOOGLE_*)

---

## Git-Ready Patch Plan

### Файлы для создания/изменения:

1. **Создать** `.env` с OAuth переменными
2. **Обновить** [`frontend-enhanced/components/GoogleConnect.tsx`](frontend-enhanced/components/GoogleConnect.tsx:1) - добавить RBAC guard
3. **Проверить** [`docker-compose.prod.yml`](docker-compose.prod.yml:1) - верифицировать Prod redirect URI
4. **Обновить** [`.env.example`](.env.example:1) - добавить отсутствующие OAuth переменные

---

**Итог:** 7 PASS, 1 FAIL, 1 GAP, 1 UNKNOWN  
**Критический блокер:** Отсутствие OAuth переменных в dev окружении  
**Следующие шаги:** Настроить переменные окружения и добавить RBAC guards в UI