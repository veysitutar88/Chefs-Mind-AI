## Visual Audit — 2026-02-26

### Summary
- Total pages audited: 9
- Working correctly: 5
- Need work: 2
- Critical errors: 2 (dashboard, media — blocked by RBAC)

---

### Pages

| Route | Status | Issues | Priority |
|-------|--------|--------|----------|
| `/` | ⚠️ | Home loads correctly but defaults to SousChef (not a universal greeting); sidebar agent navigation links use `router.push` rather than `<Link>` so active agent never highlighted on `/`; 10 console errors from `useSidebarData` (all 4 API endpoints return 500 — backend not running); `INITIAL_FILES` from `constants/ui.ts` not shown (right sidebar shows "No active files found" because RightSidebar reads live API, not the const). | high |
| `/login` | ⚠️ | Page renders correctly with correct light theme (`bg-gradient-to-br from-blue-50 to-indigo-100`). Auth-check call to `/auth/google/status` returns 500 and throws `SyntaxError: Unexpected token 'I'` (server returns plain text "Internal Server Error", not JSON). GoogleConnect component shows "Not connected". Dev-login button present and functional (writes `rbacRole=admin` to localStorage). Two duplicate Google-login buttons rendered (one from `<GoogleConnect />` component and one inline). | medium |
| `/agents/souschef` | ✅ | Renders full 3-column AppLayout. LeftSidebar agent list correct. ChatArea shows "Session started" system message. ModelSwitcher absent (ChatInterface does not pass `onModelChange`). RightSidebar data sections empty due to API 500s but degrade gracefully. | low |
| `/agents/gastrocount` | ✅ | Same structure as SousChef. Agent title and subtitle correct. No functional differences from SousChef at the UI level. | low |
| `/agents/gastromind` | ✅ | Same structure as SousChef/GastroCount. Renders without error. | low |
| `/agents/foodframe` | ⚠️ | Renders FoodFrameStudio with full media controls (model selector, format, quality, seed, steps, action buttons). RightSidebar shows Styling Presets panel correctly (10 presets visible). "OFFLINE MODE" badge is shown in chat header — triggered because model-fetch API returns 500, MediaModelSelector falls back to static list. Upscale button correctly disabled on load. FoodFrame-specific controls are feature-complete but non-functional without backend. | medium |
| `/dashboard` | ❌ | Entire page content replaced with `Access denied. Required: admin. Current: guest`. RBACGuard reads `localStorage.rbacRole` but localStorage is empty in a fresh browser session (not set until user clicks dev-login on `/login`). The dashboard light-theme page (blue/indigo gradient, white cards, Russian text) is completely inaccessible. No AppLayout wrapper — if access were granted the page would break the dark-theme visual language with its fully independent blue/white design. | high |
| `/media` | ❌ | Same RBAC block as `/dashboard`: `Access denied. Required: admin. Current: guest`. MediaStudioContent is also light-themed (`text-[#3E6BAA]`, `muted-foreground`, no AppLayout) — completely divergent from the dark slate design system. | high |
| `/settings` | ✅ | Renders inside AppLayout with dark theme. General (language, theme) and Account sections render correctly. Light Mode option is correctly shown as disabled/opacity-50. Badge component renders "Administrator Access" correctly. | low |

---

### Key Components Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| `AppLayout` | ✅ | 3-column layout (LeftSidebar + main + RightSidebar) works correctly. RightSidebar hidden below `xl` breakpoint (1280px). LeftSidebar hidden below `lg` breakpoint (1024px). Header (`AppHeader`) is rendered as `h-0 overflow-hidden` — effectively absent. |
| `AppHeader` | ❌ | Intentionally collapsed to `h-0` ("Header Cleared for Design A"). Renders nothing. `currentAgent` prop accepted but unused. |
| `LeftSidebar` | ⚠️ | Logo slot is a dashed placeholder box with "LOGO SLOT 4:5" text — not a real logo. Agent navigation works. Active highlight on agent cards uses `pathname.includes(agent.id)` which is correct. Universal Chat link is correctly highlighted on `/`. Footer shows hardcoded "Chef Admin / admin@chefsmind.ai" — not dynamic. |
| `RightSidebar` | ⚠️ | All 4 data sections (media, chats, calendar, tasks) return empty because backend APIs return 500. Errors are caught silently — no user-visible error state, just empty placeholders. Task `+` button has no `onClick` handler (input state captured but never submitted). FoodFrame mode shows presets correctly. Close button wires to `rightSidebarOpen` state in AppLayout correctly. |
| `ChatArea` | ✅ | Chat messages, loading spinner, input form, send button, and FoodFrame media controls all render correctly. Paperclip attachment button has no handler (UI only). Empty state (Bot icon + text) shown correctly. |
| `ChatInterface` | ⚠️ | Wraps ChatArea for agent pages. Does NOT pass `onModelChange` or `selectedModelId` — ModelSwitcher is never shown on agent sub-pages. Model selection only works on the `/` home page. |
| `FoodFrameStudio` | ⚠️ | Component not examined directly (uses ChatArea + media controls inline). "OFFLINE MODE" label shown because `/api/media/models` returns 500. Otherwise UI is visually complete. |
| `RBACGuard` | ❌ | In `dev` mode reads `localStorage.rbacRole`. Default value is `'guest'`. No mechanism to persist login across page navigation without first visiting `/login` and clicking dev-login. `/dashboard` and `/media` are blocked on every fresh load. The guard message is raw developer text: "Access denied. Required: admin. Current: guest" — exposed to end users. |
| `AgentCard` | ✅ | Icon resolves correctly from `iconName` map. Active/hover states with accent glow work. |
| `useSidebarData` | ❌ | Fires 4 API fetches on every mount (`/api/media/assets`, `/api/chat/history`, `/api/calendar/events`, `/api/followups/debug`). All return HTTP 500 (backend not running). Errors are suppressed to console only — no retry logic, no user notification, no skeleton loading state beyond `mediaLoading` flag. |
| `Logo` | ⚠️ | Not reviewed directly but LeftSidebar shows a dashed "LOGO SLOT" placeholder rather than the real Logo component. |

---

### Console Errors

**All pages using AppLayout (home, agents, settings):**
```
Failed to load resource: 500  →  /api/media/assets
Media fetch error: Error: Failed to fetch media: 500
Failed to load resource: 500  →  /api/chat/history
Chat fetch error: Error: Failed to fetch chats: 500
Failed to load resource: 500  →  /api/calendar/events
Calendar fetch error: Error: Failed to fetch calendar: 500
Failed to load resource: 500  →  /api/followups/debug
Tasks fetch error: Error: Failed to fetch tasks: 500
Failed to load resource: net::ERR_CONNECTION_REFUSED  →  (models API)
Failed to load models TypeError: Failed to fetch
```

**Login page:**
```
Failed to load resource: 500  →  /auth/google/status
Failed to load resource: 500  →  /auth/google/status
Failed to check auth status: SyntaxError: Unexpected token 'I' ... is not valid JSON
```

**FoodFrame only (additional):**
```
MediaModelSelector: Offline or API error, using fallback.
```

**Summary:** Every page generates 8–10 console errors. All originate from the backend not running. No frontend JS errors or React errors detected.

---

### Theme Inconsistencies

Expected design tokens (defined in `globals.css`):
- `--bg-root: #0f172a` (deep slate)
- `--bg-surface: #1e293b`
- `--text-primary: #f8fafc`
- `--text-secondary: #94a3b8`
- `--accent: #0EA5E9` (Na'Vi Blue)
- `--border-soft: #334155`

**Violations found:**

| Location | Issue |
|----------|-------|
| `/login` page | Uses `bg-gradient-to-br from-blue-50 to-indigo-100` (light blue) — completely outside dark theme. White card with `text-gray-800`. |
| `/dashboard` page | Uses `bg-gradient-to-br from-blue-50 to-indigo-100` — same light theme as login. White cards, `text-gray-800`, `bg-blue-500` for user messages — no dark tokens used. Russian language text mixed with English. |
| `/media` page | Uses `text-[#3E6BAA]` hardcoded colour (different blue, not `--accent`). Uses `muted-foreground` Tailwind class (not defined in design tokens — falls back to default). No AppLayout wrapper — naked white page. |
| `ChatArea` input | Uses `bg-slate-950/50` directly rather than CSS variable `var(--bg-root)`. Minor — functionally correct but bypasses token system. |
| `RBACGuard` error state | Uses `bg-gray-100 border-gray-300 text-gray-600` — light-mode colours appearing inside the dark shell. |
| `RBACGuard` prod error state | Uses `bg-red-50 border-red-300 text-red-600` — light-mode colours. |
| `LeftSidebar` logo slot | Dashed `border-white/10` placeholder — no real logo. |
| `AppHeader` | Collapsed to `h-0` — no visible header. Design A intentional, but results in no breadcrumb, no global nav bar, no app-level controls visible. |

---

### Mobile (iPhone 12 — 390×844)

| Route | Mobile Status | Notes |
|-------|---------------|-------|
| `/` | ❌ | LeftSidebar is `hidden lg:flex` — entire agent navigation disappears. Main chat area visible but no way to switch agents. No mobile hamburger menu exists. |
| `/login` | ✅ | Login card is responsive and fits the viewport correctly. Buttons full-width. |
| `/agents/souschef` | ❌ | Same as home — LeftSidebar hidden, no agent switching. RightSidebar hidden (`hidden xl:flex`). Chat area fills width correctly but app navigation is inaccessible. |
| `/agents/gastrocount` | ❌ | Same mobile issue. |
| `/agents/gastromind` | ❌ | Same mobile issue. |
| `/agents/foodframe` | ❌ | LeftSidebar hidden. Media controls row (model/format/quality/upscale + seed/steps) likely wraps badly — `flex-wrap` is applied to first row but not tested for overflow. FoodFrame preset panel (RightSidebar) completely hidden. |
| `/dashboard` | ❌ | RBAC block shows on mobile same as desktop. |
| `/media` | ❌ | RBAC block shows on mobile same as desktop. |
| `/settings` | ⚠️ | AppLayout renders. Theme selector cards (`flex gap-4`) may be tight but usable. Agent list in LeftSidebar hidden — no nav to other pages. |

**Root cause:** `AppLayout` uses `hidden lg:flex` for LeftSidebar and `hidden xl:flex` for RightSidebar with no mobile fallback (no hamburger menu, no drawer, no bottom nav). The app has no mobile navigation pattern at all.

---

### Top 5 Recommendations (by priority)

1. **[HIGH] Add mobile navigation** — The entire LeftSidebar is hidden below 1024px with no replacement. Add a hamburger/drawer or a bottom navigation bar for mobile. This affects 7 of 9 audited pages. A bottom tab bar with the 4 agents + home would be the minimal fix.

2. **[HIGH] Fix RBAC for `/dashboard` and `/media`** — Both pages block all users on fresh load because `localStorage.rbacRole` defaults to `'guest'`. Either (a) add a redirect to `/login` instead of showing the raw "Access denied" message, or (b) if these pages should be accessible in dev, auto-set the role or provide a visible dev-mode bypass link. The raw dev message ("Access denied. Required: admin. Current: guest") must never appear in production.

3. **[HIGH] Unify theme for `/dashboard` and `/media`** — Both pages use an entirely different light-blue/white design system (`from-blue-50 to-indigo-100`, white cards, `#3E6BAA`) that is visually incompatible with the dark slate design system used everywhere else. Both pages also lack `AppLayout` wrapper. They should be wrapped in `AppLayout` and their colour usage migrated to dark-theme tokens.

4. **[MEDIUM] Suppress / handle backend 500 errors gracefully** — Every page fires 8–10 console errors from `useSidebarData` (media, chat, calendar, tasks endpoints all return 500). Add error boundaries or graceful empty-states that do not spam the console. Consider skipping fetches when the backend is clearly unavailable (e.g., network error on first call triggers offline mode rather than 4 parallel failing requests).

5. **[MEDIUM] Replace LeftSidebar logo placeholder and fix ModelSwitcher on agent pages** — The "LOGO SLOT 4:5" dashed box is visible to all users and looks unfinished. This should be replaced with the actual `<Logo />` component. Additionally, `ChatInterface` (used by souschef, gastrocount, gastromind) does not wire `onModelChange` / `selectedModelId` to `ChatArea`, so the ModelSwitcher is never rendered on agent sub-pages — users have no model selection when navigating directly to an agent URL.

---

## Fixes Applied — 2026-02-26

| Fix | Files Changed | Status | Notes |
|-----|--------------|--------|-------|
| Fix 1: RBAC dev bypass | RBACGuard.tsx | ✅ | dev=admin (bypass entirely), prod shows styled login link |
| Fix 2: Mobile nav bar | AppLayout.tsx, MobileNavBar.tsx (new) | ✅ | 5-item bottom bar (Home + 4 agents), lg:hidden, active state uses --accent |
| Fix 3: Dashboard theme | dashboard/page.tsx | ✅ | wrapped with AppLayout, light gradient/white removed, dark CSS vars applied |
| Fix 4: Media theme | media/page.tsx | ✅ | wrapped with AppLayout, #3E6BAA replaced with var(--accent), dark vars applied |
| Fix 5: Logo placeholder | LeftSidebar.tsx | ✅ | replaced dashed "LOGO SLOT 4:5" with next/image using /brand/logo-v2-official.png |
