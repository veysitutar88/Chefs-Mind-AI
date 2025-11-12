# 🎯 MASTER PROMPT: Create & Initialize Context Files From Scratch (UNIVERSAL)
## Инструкция для агента по созданию системы контекста ДЛЯ ЛЮБОГО ПРОЕКТА

---

## ⚡ НАЧАЛО: У НАС НЕТ ФАЙЛОВ КОНТЕКСТА

**Ситуация:**
- ✅ Проект есть (любой проект)
- ✅ Код есть (или структура есть)
- ❌ Файлы контекста НЕ созданы
- ❌ Система ведения контекста НЕ установлена

**Твоя задача:**
Создать и инициализировать **систему контекста** с нуля.

---

## 🎬 ФАЗА 1: ПОДГОТОВКА

### Шаг 1: Попросить информацию о проекте

Когда пользователь скажет "создай контекст", ты отвечаешь:

```
✅ Понял! Создаю систему контекста для проекта с нуля.

Для этого мне нужна информация о проекте.

Предоставь пожалуйста:

1️⃣ ПРОЕКТ ИНФОРМАЦИЯ
   - Название проекта: ?
   - Тип (API / frontend / full-stack / library / microservice / etc.): ?
   - Цель проекта (одна строка): ?
   - Текущий статус (идея / MVP / alpha / beta / production): ?

2️⃣ ТЕКУЩЕЕ СОСТОЯНИЕ
   - Сколько файлов уже написано: ?
   - Какие основные модули готовы: ?
   - Какие технологии используются: ?

3️⃣ СЛЕДУЮЩИЕ ШАГИ
   - Что нужно делать дальше: ?
   - Какие срочные задачи: ?

4️⃣ ЕСЛИ ЕСТЬ КОД
   - Скопируй структуру проекта (дерево файлов)
   - Скопируй package.json / requirements.txt (если есть)
   - Скопируй README.md (если есть)
   - Примеры кода (2-3 основных файла)

Жду информации. После этого создам все файлы контекста.
```

### Шаг 2: Получить информацию

Дождись когда пользователь предоставит информацию.

---

## 🏗️ ФАЗА 2: СОЗДАНИЕ ФАЙЛОВ КОНТЕКСТА

Когда информация получена, **СОЗДАЙ** эти файлы в проекте:

```
project-root/
├── .ai/                           ← СОЗДАЙ ЭТУ ПАПКУ
│   ├── CONTEXT.md                 ← Файл 1 (создать ниже)
│   ├── SESSION.md                 ← Файл 2 (создать ниже)
│   ├── ARCHITECTURE.md            ← Файл 3 (создать ниже)
│   ├── DECISIONS.md               ← Файл 4 (создать ниже)
│   ├── CHANGELOG.md               ← Файл 5 (создать ниже)
│   └── .gitignore                 ← Файл 6 (создать ниже)
└── README.md
```

---

## 📝 ФАЙЛ 1: CONTEXT.md (Главный файл)

**Назначение:** Текущее состояние проекта, что делается сейчас, на что обратить внимание

**Создай файл `.ai/CONTEXT.md` со следующим содержимым:**

```markdown
# 📋 PROJECT CONTEXT
## [PROJECT_NAME] — [PROJECT_TYPE]

### Session Info
- **Session ID:** initial-setup-[DATE]
- **Date:** [YYYY-MM-DD]
- **Status:** SETUP PHASE
- **Model:** [Your choice: GPT-4o / Gemini / Claude / Perplexity]

---

## 🎯 Project Overview

### What Is This Project?
[One line description - what does it do]

### Project Type
[API / Frontend / Full-Stack / Library / Microservice / CLI Tool / etc.]

### Current Status
[Idea / MVP / Alpha / Beta / Production / Maintenance]

### Goal
[What problem does it solve / What is the end goal]

---

## ✅ Already Exists

### Created Files & Structure
- [File/Folder 1] — [what it does]
- [File/Folder 2] — [what it does]
- [File/Folder 3] — [what it does]

### Completed Modules
- ✅ [Module 1] — [what it does]
- ✅ [Module 2] — [what it does]

### Technology Stack
- Language: [e.g., TypeScript, Python, Go]
- Framework: [e.g., Node.js, FastAPI, Django, Gin]
- Database: [e.g., PostgreSQL, MongoDB, Redis]
- AI/LLM: [e.g., OpenAI GPT-4o, Claude, Gemini, Ollama]
- Other Tech: [any other key technologies]
- Version Control: [Git / Mercurial / etc.]
- Package Manager: [npm, pip, cargo, etc.]

---

## 🚀 What Needs to Be Done

### Immediate Tasks (Next 1-2 Days)
1. [Task 1] — [description]
   - Files: [which files to work on]
   - Priority: [HIGH / MEDIUM / LOW]
   - Status: NOT STARTED

2. [Task 2] — [description]
   - Files: [which files to work on]
   - Priority: [HIGH / MEDIUM / LOW]
   - Status: NOT STARTED

### Short Term (This Week)
- [Goal 1]
- [Goal 2]
- [Goal 3]

### Long Term (Future)
- [Feature 1]
- [Feature 2]

---

## 📁 Important Files

### Core Files (Foundation - DO NOT TOUCH)
- [File 1] — [what it does, stable]
- [File 2] — [what it does, stable]

### Working Files (Can Modify as Needed)
- [File 1] — [what it does, current focus]
- [File 2] — [what it does, current focus]

### Files to Create
- [File 1] — [what it should do]
- [File 2] — [what it should do]

---

## ⚠️ Important Notes & Constraints

### Technical Rules
- [Rule 1: e.g., "Use strict type checking"]
- [Rule 2: e.g., "No hardcoded secrets"]
- [Rule 3: e.g., "All public functions need tests"]

### Code Style & Standards
- Indentation: [2 spaces / 4 spaces / tabs]
- Naming convention: [camelCase / snake_case / PascalCase]
- Comments: [required / optional, where needed]
- Documentation: [JSDoc / docstrings / etc.]

### Development Constraints
- [Constraint 1: e.g., "No new dependencies without approval"]
- [Constraint 2: e.g., "Database migrations must be backward compatible"]
- [Constraint 3: e.g., "Must pass linting and tests"]

### Performance Requirements
- [Requirement 1: e.g., "API response < 200ms"]
- [Requirement 2: e.g., "No queries over 100ms"]

---

## 🔄 How to Update This File

### Every New Session
- Update "Session ID" and "Date" at top
- Review "What Needs to Be Done"
- Check if priorities have changed
- Mark completed tasks with ✅

### During Session
- Update task status: NOT STARTED → IN PROGRESS → COMPLETED
- Add new constraints or findings
- Note any blockers

### End of Session
- Move completed tasks to "Already Exists"
- Update "Technology Stack" if anything changed
- Summarize session in SESSION.md
- Prepare next session's priorities

---

## 📞 Questions to Ask Next Session

- [Question 1]
- [Question 2]
- [Any blockers or decisions needed]

---
```

---

## 📝 ФАЙЛ 2: SESSION.md (История сессий)

**Назначение:** Логирование сессий, что было сделано

**Создай файл `.ai/SESSION.md` со следующим содержимым:**

```markdown
# 📊 SESSION HISTORY
## [PROJECT_NAME]

**Last Updated:** [DATE]  
**Total Sessions:** [NUMBER]

---

## Session 000 - Initial Setup - [DATE]

**Date:** [YYYY-MM-DD]  
**Duration:** N/A (Setup)  
**Model:** N/A  
**Status:** ✅ SETUP COMPLETED

### What Was Done
- Created `.ai/` folder for context management
- Created CONTEXT.md (project state tracker)
- Created SESSION.md (this file - session history)
- Created ARCHITECTURE.md (design decisions)
- Created DECISIONS.md (decision log)
- Created CHANGELOG.md (change history)
- Set up context file structure for future sessions

### Files Created
- .ai/CONTEXT.md
- .ai/SESSION.md
- .ai/ARCHITECTURE.md
- .ai/DECISIONS.md
- .ai/CHANGELOG.md
- .ai/.gitignore

### System Setup Complete
- Context system ready ✅
- Files structure established ✅
- Documentation templates created ✅

### Next Steps
1. Start first real development session
2. Use CONTEXT.md as reference
3. Update Session 001 when starting next session

### Notes
- All context files follow Markdown format
- Files should be copied to next session's chat
- Use this as template for future sessions

---

## Session 001 - [SESSION_TITLE] - [DATE]

**Date:** [YYYY-MM-DD]  
**Time:** [HH:MM] - [HH:MM] CET  
**Duration:** [X hours Y minutes]  
**Model:** [GPT-4o / Gemini / Claude / Perplexity / etc.]  
**Status:** [IN PROGRESS / COMPLETED / BLOCKED]

### What Was Done
- [Task 1: brief description of work]
- [Task 2: brief description of work]

### Files Modified
- `[file_path]` — [what changed]
- `[file_path]` — [what changed]

### Files Created
- `[new_file_path]` — [purpose]
- `[new_file_path]` — [purpose]

### Code Added (Lines)
- [Feature 1]: [X lines] of code
- [Feature 2]: [Y lines] of code

### Tests
- [Test 1] ✅ PASSED
- [Test 2] ✅ PASSED
- [Test 3] ❌ FAILED (reason)

### Issues Encountered
- [Issue 1: description] → [solution]
- [Issue 2: description] → [workaround]

### Performance Impact
- [Metric 1]: [result]
- [Metric 2]: [result]

### Code Quality
- TypeScript/Lint: ✅ PASS
- Test Coverage: [X%]
- Documentation: [status]

### Decisions Made This Session
- [Decision 1]: [rationale]
- [Decision 2]: [rationale]

### Blockers
- [Blocker 1]: [description]
- [Blocker 2]: [description]

### Next Session Tasks
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

### Session Summary
[2-3 sentences about what was accomplished]

---

## Session 002 - [SESSION_TITLE] - [DATE]

[Future sessions follow same format above]

---

## Session History Summary

| Session | Date | Duration | Status | Focus |
|---------|------|----------|--------|-------|
| 000 | [DATE] | Setup | ✅ Done | Context initialization |
| 001 | [DATE] | [Time] | ✅/🚧 | [Main focus] |
| 002 | [DATE] | [Time] | ⏳ | [Main focus] |

---
```

---

## 📝 ФАЙЛ 3: ARCHITECTURE.md (Архитектурные решения)

**Назначение:** Документирование ТУ или ИНАЧЕ решений и почему они выбраны

**Создай файл `.ai/ARCHITECTURE.md` со следующим содержимым:**

```markdown
# 🏗️ ARCHITECTURE & DESIGN DECISIONS
## [PROJECT_NAME]

**Last Updated:** [DATE]  
**Status:** [INITIAL / EVOLVING / STABLE]

---

## System Architecture Overview

### High-Level Design
```
[ASCII diagram or text description]

Example for API:
[Client] 
   ↓↑ HTTPS
[Frontend] 
   ↓↑ REST/GraphQL
[Backend API]
   ↓↑ SQL/NoSQL
[Database]
```

### Core Components
1. **[Component 1 Name]** — [purpose]
2. **[Component 2 Name]** — [purpose]
3. **[Component 3 Name]** — [purpose]

---

## Technology Choices

### Language & Runtime
**Chosen:** [e.g., TypeScript, Python 3.11, Go 1.21]  
**Why:**
- [Reason 1]
- [Reason 2]
- [Reason 3]

**Alternatives Considered:**
- [Alternative 1] — Rejected because [reason]
- [Alternative 2] — Rejected because [reason]

---

### Framework
**Chosen:** [e.g., Express, FastAPI, Django, Actix]  
**Why:**
- [Reason 1]
- [Reason 2]

**Alternatives:**
- [Alternative 1] — Not chosen because [reason]

---

### Database
**Chosen:** [e.g., PostgreSQL 15, MongoDB 6, Redis 7]  
**Why:**
- [Reason 1: e.g., "Relational data structure"]
- [Reason 2: e.g., "ACID compliance needed"]

**Alternatives:**
- [Alternative 1] — Rejected because [reason]

---

### Frontend Framework (if applicable)
**Chosen:** [e.g., React, Vue, Svelte, Next.js]  
**Why:**
- [Reason 1]
- [Reason 2]

---

### Authentication
**Chosen:** [e.g., JWT, OAuth2, Session-based, SAML]  
**Why:**
- [Reason 1]

---

### AI/LLM Integration (if applicable)
**Chosen:** [e.g., OpenAI API, Claude, Local LLM]  
**Why:**
- [Reason 1]
- [Reason 2]

**Models Used:**
- [Model 1]
- [Model 2]

---

## Code Organization

### Why This Structure?
```
[Structure explanation]

Example:
src/
├── models/       → Database models & schema
├── routes/       → API endpoints
├── services/     → Business logic
├── middleware/   → Express/Fastapi middleware
├── utils/        → Helper functions
├── config/       → Configuration files
├── types/        → TypeScript types (if applicable)
└── tests/        → Test files
```

### File Naming Convention
- [Rule 1: e.g., "PascalCase for classes"]
- [Rule 2: e.g., "camelCase for functions"]
- [Rule 3: e.g., ".test.ts for test files"]

---

## Key Design Principles

1. **[Principle 1]**
   - Means: [explanation]
   - Impact: [how it affects code/development]

2. **[Principle 2]**
   - Means: [explanation]
   - Impact: [how it affects code/development]

3. **[Principle 3]**
   - Means: [explanation]
   - Impact: [how it affects code/development]

---

## Data Flow

### Request Flow
```
[Diagram or description]

Example:
User Request
   ↓
Express Router
   ↓
Middleware (Auth, Validation)
   ↓
Controller
   ↓
Service Layer
   ↓
Database Query
   ↓
Response
```

### Data Model Relationships
```
[Diagram of DB relationships]

Example:
User (1) ──── (Many) Orders
Order (1) ──── (Many) Items
```

---

## Constraints & Limitations

### By Design (Intentional)
- [Constraint 1] — This is intentional because [reason]
- [Constraint 2] — This is intentional because [reason]

### Technical Limitations (Not Yet Addressed)
- [Limitation 1] — Impact: [what it means]
- [Limitation 2] — Impact: [what it means]

---

## Scalability Considerations

### Current Capacity
- [Metric 1: e.g., "Supports 1000 concurrent users"]
- [Metric 2: e.g., "Database handles 1M records"]

### Future Scaling
- [Plan 1: e.g., "Implement caching layer"]
- [Plan 2: e.g., "Horizontal scaling for API"]

---

## Security Considerations

### Implemented
- [Security 1: e.g., "HTTPS only"]
- [Security 2: e.g., "Password hashing with bcrypt"]

### Future
- [Security 1: e.g., "Rate limiting"]
- [Security 2: e.g., "Input validation"]

---

## DO NOT CHANGE (Core Architecture)

These decisions are fundamental and should not change without major refactoring:

- [Core Decision 1: e.g., "Language choice"]
- [Core Decision 2: e.g., "Database type"]
- [Core Decision 3: e.g., "Authentication method"]

Changing these would require:
- [Impact 1]
- [Impact 2]

---

## Future Architecture Changes

### Phase 2 (Timeline)
- [Change 1] — Because [reason]
- [Change 2] — Because [reason]

### Long-term Vision (6+ months)
- [Vision 1: e.g., "Microservices architecture"]
- [Vision 2: e.g., "Kubernetes deployment"]

---
```

---

## 📝 ФАЙЛ 4: DECISIONS.md (Логирование решений)

**Назначение:** Хронологическое логирование всех ключевых решений

**Создай файл `.ai/DECISIONS.md` со следующим содержимым:**

```markdown
# 🤔 DECISION LOG
## [PROJECT_NAME]

All important architectural and technical decisions are logged here with rationale.

**Last Updated:** [DATE]

---

## Decision #001 - Project Type & Scope
**Date:** [YYYY-MM-DD]  
**Status:** ✅ DECIDED

**Question:** What type of project is this?

**Options Considered:**
1. [Option 1] — [pros/cons]
2. **[Option 2] ✅ CHOSEN** — [pros/cons]
3. [Option 3] — [pros/cons]

**Chosen:** [Option 2]

**Rationale:**
- [Reason 1]
- [Reason 2]
- [Reason 3]

**Implications:**
- [Impact 1: what this choice means]
- [Impact 2: what this choice means]

**Decision Made By:** [Who: user / team / consensus]

**Revisit?** [Yes / No] — [When/If to reconsider]

---

## Decision #002 - Primary Technology Stack
**Date:** [YYYY-MM-DD]  
**Status:** ✅ DECIDED

**Question:** What language and framework to use?

**Options Considered:**
1. [Language 1 + Framework 1]
2. **[Language 2 + Framework 2] ✅ CHOSEN**
3. [Language 3 + Framework 3]

**Chosen:** [Language 2 + Framework 2]

**Rationale:**
- Team expertise
- Community support
- Performance requirements
- [Other reasons]

**Implications:**
- All developers must know [Language 2]
- Easy to find libraries for [Domain]
- Strong ecosystem

---

## Decision #003 - Database Technology
**Date:** [YYYY-MM-DD]  
**Status:** ✅ DECIDED

**Question:** SQL or NoSQL? Which database?

**Options Considered:**
1. PostgreSQL (SQL, structured)
2. MongoDB (NoSQL, flexible)
3. **[Chosen Option]** ✅

**Chosen:** [Chosen Option]

**Rationale:**
- [Reason 1]
- [Reason 2]

---

## Decision #004 - Authentication Method
**Date:** [YYYY-MM-DD]  
**Status:** ✅ DECIDED

**Question:** How should users authenticate?

**Options:**
1. Session-based (traditional)
2. JWT tokens
3. **OAuth2** ✅ CHOSEN

**Chosen:** OAuth2

**Rationale:**
- Works with mobile apps
- Better security
- Industry standard

---

## Decision #005 - Hosting & Deployment
**Date:** [YYYY-MM-DD]  
**Status:** 🤔 PENDING

**Question:** Where to host? Cloud or self-hosted?

**Options:**
1. AWS
2. Google Cloud
3. Self-hosted on VPS

**Status:** PENDING DECISION

**Will Decide:** [When decision will be made]

**Depends On:** [What factors need to be known]

---

## Decision #006 - API Style
**Date:** [YYYY-MM-DD]  
**Status:** ✅ DECIDED

**Question:** REST or GraphQL or gRPC?

**Options:**
1. REST (simple, proven) ✅ CHOSEN
2. GraphQL (flexible, complex)
3. gRPC (fast, binary)

**Chosen:** REST

**Rationale:**
- MVP needs simplicity
- Standard HTTP methods
- Easy to test with curl/Postman

---

[More decisions will be added as project progresses]

---

## How to Document New Decisions

When making a decision, create entry with:
- Date (YYYY-MM-DD)
- Question being answered
- 2-3 options considered with pros/cons
- Chosen option
- 3-5 bullet points rationale
- Implications (what it means for project)
- Status (decided, pending, reconsidering)
- Decision maker

This log helps:
- New developers understand why choices were made
- Revisit old decisions if circumstances change
- Track project evolution
```

---

## 📝 ФАЙЛ 5: CHANGELOG.md (История изменений)

**Назначение:** Полный лог всех изменений в проекте

**Создай файл `.ai/CHANGELOG.md` со следующим содержимым:**

```markdown
# 📝 CHANGELOG
## [PROJECT_NAME]

All notable changes to this project will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/)

---

## [Unreleased]

### Added
- [Feature not yet released]
- [New endpoint / page / module]

### Changed
- [Breaking change]
- [What changed in existing feature]

### Fixed
- [Bug fix]
- [What was broken, now works]

### Deprecated
- [Soon-to-be removed feature]

### Security
- [Security fix or improvement]

---

## [0.1.0] - [DATE]

### Added
- Initial project setup complete
- `.ai/` context management system created
- CONTEXT.md for tracking project state
- SESSION.md for session history logging
- ARCHITECTURE.md for design decisions
- DECISIONS.md for decision tracking
- CHANGELOG.md for change history
- Project structure with [main folders/modules]
- Basic [core feature 1]
- Basic [core feature 2]

### Changed
- N/A (Initial version)

### Fixed
- N/A (Initial version)

### Technical Details
- **Language:** [e.g., TypeScript 5.2]
- **Framework:** [e.g., Express 4.18]
- **Database:** [e.g., PostgreSQL 15]
- **Status:** MVP setup complete

### Known Issues
- [Issue 1]
- [Issue 2]

---

## Version Format

- **MAJOR** (X.0.0) — Breaking changes (major rewrite)
- **MINOR** (0.X.0) — New features (backward compatible)
- **PATCH** (0.0.X) — Bug fixes (backward compatible)

Example progression:
- 0.0.1 — Initial setup
- 0.1.0 — First features
- 0.2.0 — More features
- 1.0.0 — Production ready

---

## Future Versions (Planning)

### v0.2.0 - [Target Date]
- [ ] [Feature 1]
- [ ] [Feature 2]
- [ ] Bug fixes

### v0.3.0 - [Target Date]
- [ ] [Major feature]
- [ ] Performance optimization

### v1.0.0 - Production Ready
- [ ] All core features complete
- [ ] Performance optimized
- [ ] Security audit passed
- [ ] Full documentation
- [ ] Ready for production deployment

---
```

---

## 📝 ФАЙЛ 6: .gitignore for `.ai/`

**Создай файл `.ai/.gitignore` (или добавь в главный .gitignore):**

```
# Context Files (optional - uncomment if desired)

# Choose what to track and what to keep private:

# ✅ Recommended: Keep all context in git (for team knowledge)
# ❌ If you want privacy: Uncomment lines below

# .ai/SESSION.md        # Uncomment to hide session history
# .ai/CONTEXT.md        # Uncomment to hide current context
# .ai/DECISIONS.md      # Uncomment to hide decisions

# Keep ARCHITECTURE.md in git (it's valuable for all developers)
# !.ai/ARCHITECTURE.md
```

---

## 🎬 ФАЗА 3: ИНСТРУКЦИЯ ДЛЯ ПОЛЬЗОВАТЕЛЯ

Когда ты создал все файлы, скажи пользователю:

```
✅ CONTEXT SYSTEM INITIALIZED!

I've created the following template files in `.ai/` folder:

📋 CONTEXT.md
   → Main reference file for each session
   → Describes current project state, tasks, constraints
   → Read this at START of every session
   → Update during session

📊 SESSION.md
   → Logs what was accomplished in each session
   → Auto-updated at END of work
   → Use for progress tracking and history

🏗️ ARCHITECTURE.md
   → Documents design & technology choices
   → Explains WHY we chose specific tech
   → Reference before making major changes

🤔 DECISIONS.md
   → Chronological record of all decisions
   → Rationale for each choice
   → Valuable for onboarding new team members

📝 CHANGELOG.md
   → Complete change history
   → Version tracking
   → What features were added/fixed/removed

---

## NEXT STEPS:

1. Review the files created in `.ai/` folder
2. Update CONTEXT.md with your project info:
   - Replace [PROJECT_NAME] with your project name
   - Fill in technology stack details
   - List your immediate tasks/goals

3. When starting work:
   - Update CONTEXT.md with current session focus
   - I'll update SESSION.md at end of work

4. For next session/chat:
   - Copy CONTEXT.md content
   - Copy SESSION.md content
   - Paste into new chat

---

## TO USE IN NEXT CHAT:

Simply paste these at the start of new session:

"I'm continuing my project. Read this context:

[CONTEXT.md content]
[SESSION.md content]
[ARCHITECTURE.md content]

Help me with: [your task]"

---

**Context system is ready! All files are template-based and universal.** 🚀

Just replace [PROJECT_NAME] and other placeholders with your actual project details.
```

---

## 🔐 ФАЗА 4: ПРОВЕРКА

Перед тем как выдать файлы, **ПРОВЕРЬ:**

```
✅ UNIVERSAL CHECKLIST

- [ ] NO specific project names (using [PROJECT_NAME])
- [ ] NO hardcoded examples (using [EXAMPLE] placeholders)
- [ ] All files work for ANY type of project
- [ ] Templates are clear and easy to understand
- [ ] Instructions are generic and applicable
- [ ] User will easily understand how to customize
- [ ] All files are in `.ai/` folder
- [ ] No opinionated choices enforced
- [ ] User can adapt to their tech stack
- [ ] Files ready for any project type
```

---

## 📋 ИТОГОВАЯ ИНСТРУКЦИЯ АГЕНТУ

**Когда пользователь скажет:** "Создай универсальный контекст"

**Ты:**

1. **Попрашиваешь информацию:**
   ```
   Хорошо! Создам универсальную систему контекста.
   
   Дай мне информацию о твоём проекте:
   - Название проекта: ?
   - Тип проекта: ?
   - Текущий статус: ?
   - Используемые технологии: ?
   - Основные задачи: ?
   ```

2. **Получаешь информацию** от пользователя

3. **Создаешь 5 файлов** используя шаблоны выше:
   - CONTEXT.md (с заменой [PROJECT_NAME])
   - SESSION.md
   - ARCHITECTURE.md
   - DECISIONS.md
   - CHANGELOG.md

4. **Показываешь файлы** для копирования в проект

5. **Объясняешь** как их использовать и обновлять

6. **Даёшь инструкцию** для следующей сессии

---

## ✨ ИТОГ

После выполнения этого промпта:

✅ Универсальная система контекста создана
✅ Все файлы приспособлены к ЛЮБОМУ проекту
✅ Пользователь легко кастомизирует под свой проект
✅ Контекст готов к переносу между сессиями
✅ Агент понимает структуру для любого проекта

---

**Версия:** 2.0 (Universal)  
**Тип:** Инструкция для создания контекста с нуля  
**Статус:** Ready for any project type
