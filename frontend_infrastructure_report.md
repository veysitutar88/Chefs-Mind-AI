# 🎨 Chef’s Mind AI — Frontend Infrastructure Report

## 1️⃣ Общая концепция и роль фронтенда

Фронтенд — визуальный слой всей экосистемы **Chef’s Mind AI**, объединяющий ERP, медиа-панель и систему агентов в едином интерфейсе. Основная задача — обеспечить связь пользователя с API на `http://localhost:5001`.

**Структура проекта:**
```
/frontend
  ├── src/
  │   ├── app/          # App Router (Next 14)
  │   ├── components/   # UI-компоненты (shadcn/ui)
  │   ├── lib/          # API helpers
  │   └── styles/       # TailwindCSS
  ├── .env.local
  ├── next.config.js
  └── package.json
```

---

## 2️⃣ Текущая версия и стек

| Компонент | Версия | Статус |
|------------|---------|--------|
| **Next.js** | 14.2.5  | стабильный (App Router активен) |
| **React / React-DOM** | 18.3.1  | OK |
| **TypeScript** | 5.9.3  | OK |
| **TailwindCSS / clsx / CVA** | 3.4.1 | настроены |
| **UI kit (shadcn/ui)** | активно используется |
| **Lucide-react** | 0.454.0 | иконки, элементы навигации |
| **Assistant-UI / AI** | 0.0.61 | LLM-интерфейс |

---

## 3️⃣ Конфигурация окружения

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5001
VITE_API_BASE=http://localhost:5001
NEXT_PUBLIC_BUILD_TS=2025-10-18T00:22Z
```
Порт UI = **3000** (исправлено с 3010). Все переменные синхронизированы с бэкендом.

---

## 4️⃣ Выполненные задачи (на 2025-10-18)

✅ **FRONTEND-AUDIT-REPORT** — проверка среды и зависимостей.  
✅ **PR-1 (DEPS-FIX + NEXT14-CLEANUP + API-WIRE)** — устранение Radix, настройка API.  
✅ **PR-2 (VERSION-BADGE + VERIFY-UI-ORIGIN)** — добавлен компонент `BuildBadge.tsx`, проверена сборка.

**Результат:** UI на порту 3000 стабилен, API-запросы к `http://localhost:5001` — 200 OK.

---

## 5️⃣ Визуальная концепция и гайд

**Тема:** `dark-navi`  
**Акцент:** `Na’Vi blue` (#0A7FD9) — для контуров, иконок, текста.  
**Стиль:** минимализм, мягкие тени, clean fine-dining aesthetic.

**Карточки:** вертикальная прокрутка (мобильный формат).  
**Кнопки:** shadcn/ui, скругления 2xl, тень soft.  
**Иконки:** Lucide-react — `var(--navi-light)` → hover: #1FA2FF.  
**Шрифты:** Inter / system-ui.

---

## 6️⃣ API и Network

```ts
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const res = await fetch(`${API}/api/health`);
```

**Результаты:**
```
GET /api/health → 200 OK
CORS → passed
Failed to fetch → none
```

---

## 7️⃣ Дорожная карта (Frontend Roadmap)

| Этап | Цель | Статус |
|-------|------|--------|
| **UI-Refinement** | Расширить layout (Navbar / Sidebar / Dashboard grid) | 🟡 в работе |
| **Dark/Light theme switch** | Добавить переключатель темы | 🔲 |
| **Gemini Chat Pane** | Встроенный LLM-модуль в UI | 🟡 |
| **Media Studio UI** | Панель генерации изображений / видео | 🔲 |
| **Responsive Design QA** | Оптимизация для mobile/tablet | 🟢 80% готово |
| **Build Optimization** | Обновление до Next 15 | 🔲 отложено |

---

## 8️⃣ Чекпоинт состояния

```json
{
  "frontend": {
    "framework": "Next.js 14.2.5",
    "port": 3000,
    "api_base": "http://localhost:5001",
    "build": "stable",
    "theme": "dark-navi",
    "version_badge": true,
    "eslint": "ok",
    "ts": "ok"
  },
  "status": "frontend stable, ready for UI expansion",
  "recommendation": "Start UI-Refinement phase and connect Gemini Chat pane"
}
```

---

## ✅ Итог
Фронтенд Chef’s Mind AI стабилен и готов к финальному этапу доработки интерфейса.

**Требуется:**  
— Внедрить Gemini chat pane, расширить Dashboard layout.  
— Завершить адаптив и media-модуль.  
— После этого перейти к интеграции UI с MCP и release-ветке v2.1.2.

