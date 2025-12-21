# 🎯 MASTER PROMPT: Create & Initialize Context Files From Scratch
## Инструкция для агента по созданию системы контекста проекта с нуля

---

## ⚡ НАЧАЛО: У НАС НЕТ ФАЙЛОВ КОНТЕКСТА

**Ситуация:**
- ✅ Проект есть (Neural Networks LLM)
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
   - Тип (API / frontend / full-stack / library): ?
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
   - Скопируй package.json (если Node.js)
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
## [Project Name] — [Project Type]

### Session Info
- **Session ID:** initial-setup-2025-11-11
- **Date:** 2025-11-11
- **Status:** SETUP PHASE
- **Model:** [Your choice: GPT-4o / Gemini / Claude]

---

## 🎯 Project Overview

### What Is This Project?
[Одна строка описание]

### Project Type
[API / Frontend / Full-Stack / Library / etc.]

### Current Status
[Idea / MVP / Alpha / Beta / Production]

### Goal
[Что проект должен решать]

---

## ✅ Already Exists

### Created Files & Structure
- [File/Folder 1] — [что это]
- [File/Folder 2] — [что это]
- [File/Folder 3] — [что это]

### Completed Modules
- ✅ [Module 1]
- ✅ [Module 2]

### Technology Stack
- Language: [e.g., TypeScript, Python]
- Framework: [e.g., Node.js, FastAPI]
- Database: [e.g., PostgreSQL, MongoDB]
- AI/LLM: [e.g., OpenAI GPT-4o, Claude]
- Others: [any other key tech]

---

## 🚀 What Needs to Be Done

### Immediate Tasks (Next 1-2 Days)
1. [Task 1] — [description]
   - Files: [which files]
   - Priority: [HIGH/MEDIUM/LOW]
   - Status: NOT STARTED

2. [Task 2] — [description]
   - Files: [which files]
   - Priority: [HIGH/MEDIUM/LOW]
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

### Core Files (Foundation)
- [File 1] — [what it does, DON'T TOUCH unless necessary]
- [File 2] — [what it does, stable]

### Working Files (Can Modify)
- [File 1] — [what it does, modify as needed]
- [File 2] — [what it does, modify as needed]

### To Create
- [File 1] — [what it should do]
- [File 2] — [what it should do]

---

## ⚠️ Important Notes & Constraints

### Technical Rules
- [Rule 1: e.g., "Use TypeScript strict mode"]
- [Rule 2: e.g., "No raw SQL queries"]
- [Rule 3: e.g., "All features need tests"]

### Code Style
- [Indentation: 2 spaces / 4 spaces / tabs]
- [Naming convention: camelCase / snake_case]
- [Comments: required for all public methods]

### Development Constraints
- [Constraint 1: e.g., "No new dependencies without approval"]
- [Constraint 2: e.g., "Database migrations must be backward compatible"]

---

## 🔄 How to Update This File

### Every New Session
- Update "Session ID" and "Date"
- Review "What Needs to Be Done"
- Mark completed tasks with ✅

### End of Session
- Update "Status" of tasks
- Add completed items to "Already Exists"
- Add new constraints/notes if found

---

## 📞 Questions to Ask Next Session

- [Question 1]
- [Question 2]
- [Any blockers]

---
```

---

## 📝 ФАЙЛ 2: SESSION.md (История сессий)

**Назначение:** Логирование сессий, что было сделано

**Создай файл `.ai/SESSION.md` со следующим содержимым:**

```markdown
# 📊 SESSION HISTORY
## [Project Name]

**Last Updated:** 2025-11-11

---

## Session 000 - Initial Setup - 2025-11-11

**Date:** 2025-11-11  
**Duration:** N/A (Setup)  
**Model:** N/A  
**Status:** ✅ SETUP COMPLETED

### What Was Done
- Created `.ai/` folder for context files
- Created CONTEXT.md (project overview)
- Created SESSION.md (this file)
- Created ARCHITECTURE.md (tech decisions)
- Created DECISIONS.md (decision log)
- Created CHANGELOG.md (change log)
- Set up file structure for context management

### Files Created
- .ai/CONTEXT.md
- .ai/SESSION.md
- .ai/ARCHITECTURE.md
- .ai/DECISIONS.md
- .ai/CHANGELOG.md
- .ai/.gitignore

### Decisions Made
1. Using Markdown (.md) format for context files
2. Context files stored in `.ai/` folder
3. Files version controlled (if using git)

### Next Steps
1. Start first real development session
2. Update CONTEXT.md with task information
3. Begin work on [first task]

### Notes
- Context system is now ready
- All files are ready to be updated
- Use CONTEXT.md as reference for all future sessions

---

## Session 001 - [Title] - [Date]

**Date:** [YYYY-MM-DD]  
**Duration:** [X minutes]  
**Model:** [GPT-4o / Gemini / Claude / etc.]  
**Status:** [IN PROGRESS / COMPLETED / BLOCKED]

### What Was Done
- [Task 1: description]
- [Task 2: description]

### Files Modified
- [File 1] (added [what])
- [File 2] (modified [what])

### Files Created
- [New file 1]
- [New file 2]

### Issues Found
- [Issue 1]
- [Issue 2]

### Solutions Applied
- [Solution for issue 1]
- [Solution for issue 2]

### Tests Passed
- [Test 1] ✅
- [Test 2] ✅

### Next Session Tasks
- [Task 1]
- [Task 2]

---

[Future sessions will be added below]
```

---

## 📝 ФАЙЛ 3: ARCHITECTURE.md (Архитектурные решения)

**Назначение:** Документирование ТУ или ИНАЧЕ решений и почему они выбраны

**Создай файл `.ai/ARCHITECTURE.md` со следующим содержимым:**

```markdown
# 🏗️ ARCHITECTURE DECISIONS
## [Project Name]

**Last Updated:** 2025-11-11  
**Status:** INITIAL SETUP

---

## Project Architecture Overview

### High-Level Structure
```
[Diagram or description of main components]

[Frontend] ←→ [Backend] ←→ [Database]
    ↓           ↓            ↓
[React]    [Node.js]   [PostgreSQL]
```

---

## Technology Choices

### Frontend
**Chosen:** [Technology]  
**Why:**
- [Reason 1]
- [Reason 2]

**Alternatives Considered:**
- [Alternative 1] — Not chosen because [reason]
- [Alternative 2] — Not chosen because [reason]

---

### Backend
**Chosen:** [Technology]  
**Why:**
- [Reason 1]
- [Reason 2]

**Alternatives Considered:**
- [Alternative 1] — Not chosen because [reason]

---

### Database
**Chosen:** [PostgreSQL / MongoDB / etc.]  
**Why:**
- [Reason 1]
- [Reason 2]

---

### LLM/AI Integration
**Chosen:** [Provider & Model]  
**Why:**
- [Reason 1]
- [Reason 2]

---

## Code Organization

### Why This Structure?
```
src/
├── models/      → [Why organized this way]
├── routes/      → [Why organized this way]
├── services/    → [Why organized this way]
└── utils/       → [Why organized this way]
```

---

## Key Design Principles

1. **[Principle 1]**
   - Means: [explanation]
   - Impact: [how it affects development]

2. **[Principle 2]**
   - Means: [explanation]
   - Impact: [how it affects development]

3. **[Principle 3]**
   - Means: [explanation]
   - Impact: [how it affects development]

---

## Constraints & Limitations

### By Design
- [Constraint 1] — This is intentional because [reason]
- [Constraint 2] — This is intentional because [reason]

### Technical Limitations
- [Limitation 1]
- [Limitation 2]

---

## Future Architecture Changes

### Planned for Phase 2
- [Change 1] — Because [reason]
- [Change 2] — Because [reason]

### Long-term Vision
- [Vision 1]
- [Vision 2]

---

## DO NOT CHANGE (without discussion)

These are fundamental architecture decisions:
- [Core Decision 1]
- [Core Decision 2]
- [Core Decision 3]

Changing these would require major refactoring.

---
```

---

## 📝 ФАЙЛ 4: DECISIONS.md (Логирование решений)

**Назначение:** Хронологическое логирование всех ключевых решений

**Создай файл `.ai/DECISIONS.md` со следующим содержимым:**

```markdown
# 🤔 DECISION LOG
## [Project Name]

All important decisions are logged here with date, options considered, and rationale.

---

## Decision #001 - Project Type & Structure
**Date:** 2025-11-11  
**Status:** DECIDED

**Question:** What type of project is this?

**Options Considered:**
1. Simple script → Rejected (need scalability)
2. Monolithic backend + frontend → Rejected (hard to scale)
3. Microservices → Too complex for MVP
4. **Full-stack with clear separation** ✅ CHOSEN

**Chosen:** Full-stack with clear separation

**Rationale:**
- [Reason 1]
- [Reason 2]
- [Reason 3]

**Implications:**
- [Impact 1]
- [Impact 2]

**Decision Maker:** [Who decided]

**Related Files:** CONTEXT.md, ARCHITECTURE.md

---

## Decision #002 - Primary Technology Stack
**Date:** 2025-11-11  
**Status:** DECIDED

**Question:** What languages and frameworks to use?

**Options Considered:**
1. Python + FastAPI
2. **TypeScript + Node.js + Express** ✅ CHOSEN
3. Go + Echo
4. Java + Spring Boot

**Chosen:** TypeScript + Node.js + Express

**Rationale:**
- [Reason 1]
- [Reason 2]

**Implications:**
- All developers must know TypeScript
- Easier to share types between frontend and backend

---

## Decision #003 - LLM Provider
**Date:** 2025-11-11  
**Status:** DECIDED

**Question:** Which LLM provider to use primarily?

**Options Considered:**
1. OpenAI (GPT-4o) → Expensive
2. **Claude (Anthropic)** ✅ CHOSEN
3. Gemini (Google) → Testing phase
4. Open source → Quality concerns

**Chosen:** Claude 3.5 Sonnet

**Rationale:**
- [Reason 1]
- [Reason 2]
- Lower token costs than GPT-4o

---

## Decision #004 - Database Choice
**Date:** 2025-11-11  
**Status:** PENDING

**Question:** SQL or NoSQL?

**Options:**
1. PostgreSQL (SQL) → Structured data
2. MongoDB (NoSQL) → Flexible schema

**Status:** PENDING DECISION

**Will Decide:** When first data model is clear

---

[More decisions will be added as project progresses]

---

## How to Add New Decisions

When making a new decision, create entry with:
- Date
- Question being answered
- Options considered
- Chosen option
- Rationale (3-5 bullet points)
- Implications
- Related files/decisions
```

---

## 📝 ФАЙЛ 5: CHANGELOG.md (История изменений)

**Назначение:** Полный лог всех изменений в проекте

**Создай файл `.ai/CHANGELOG.md` со следующим содержимым:**

```markdown
# 📝 CHANGELOG
## [Project Name]

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- [Feature not yet released]

### Changed
- [What changed]

### Fixed
- [Bug fix]

---

## [0.1.0] - 2025-11-11

### Added
- Initial project setup
- `.ai/` context management system
- CONTEXT.md for tracking project state
- SESSION.md for session history
- ARCHITECTURE.md for design decisions
- DECISIONS.md for decision logging
- CHANGELOG.md for change tracking
- Project structure with [main folders]

### Changed
- N/A (Initial version)

### Fixed
- N/A (Initial version)

### Technical Details
- Language: [e.g., TypeScript]
- Framework: [e.g., Node.js + Express]
- Database: [e.g., PostgreSQL]
- Status: ✅ Setup complete, ready for development

---

## Future Versions

### [0.2.0] - Planned for [Date]
- Core feature 1
- Core feature 2
- [Other features]

### [0.3.0] - Planned for [Date]
- Advanced feature 1
- Performance optimization

### [1.0.0] - Production Ready
- All features complete
- Production deployment
- Documentation finalized

---

## Version Format

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features
- **Patch** (0.0.X): Bug fixes

---
```

---

## 📝 ФАЙЛ 6: .gitignore for `.ai/`

**Назначение:** Конфигурация для git (если нужно скрыть контекст файлы)

**Создай файл `.ai/.gitignore` (или добавь в главный .gitignore):**

```
# Context files (optional - uncomment if you want to keep context private)
# *.md
# Keep only ARCHITECTURE.md and DECISIONS.md in git
# Hide SESSION.md and CHANGELOG.md for privacy

# Actually, we recommend KEEPING all context files in git for team access
# So this .gitignore is empty
```

**Или главный `.gitignore` (добавь эту строку):**

```
# Context files (optional)
# .ai/SESSION.md     # Uncomment to hide session history
# .ai/CONTEXT.md     # Uncomment to hide current context
```

---

## 🎬 ФАЗА 3: ИНСТРУКЦИЯ ДЛЯ ПОЛЬЗОВАТЕЛЯ

Когда ты создал все файлы, скажи пользователю:

```
✅ CONTEXT SYSTEM INITIALIZED!

I've created the following files in your `.ai/` folder:

📋 CONTEXT.md
   → Your main reference file
   → Update with current task info
   → Read at start of every session

📊 SESSION.md
   → Logs what was done in each session
   → Auto-updates after work
   → Use for progress tracking

🏗️ ARCHITECTURE.md
   → Documents design decisions
   → Why we chose specific tech
   → When to change something, refer here first

🤔 DECISIONS.md
   → Chronological log of all decisions
   → Rationale for each choice
   → Good for onboarding new team members

📝 CHANGELOG.md
   → Full history of changes
   → Version tracking
   → What features were added/fixed/removed

---

## NEXT STEPS:

1. Review the created files in `.ai/` folder
2. Update CONTEXT.md with your project info
3. When you start work, run: "Update CONTEXT.md with current task"
4. At end of session, I'll update SESSION.md
5. Next session starts by reading updated CONTEXT.md

---

## TO USE IN NEXT CHAT:

Copy these files and paste at start of new session:

[CONTEXT.md]
[SESSION.md]
[ARCHITECTURE.md]

Then say: "I'm continuing my project. Read this context and help me with [task]"

---

The context system is ready! Let's build something awesome! 🚀
```

---

## 🔐 ФАЗА 4: ПРОВЕРКА

Перед тем как отправить файлы, **ПРОВЕРЬ:**

```
✅ QUALITY CHECKLIST

- [ ] CONTEXT.md создан и заполнен
- [ ] SESSION.md создан и готов к обновлениям
- [ ] ARCHITECTURE.md документирует решения
- [ ] DECISIONS.md готов к логированию
- [ ] CHANGELOG.md содержит версию 0.1.0
- [ ] .gitignore настроен (если нужно)
- [ ] Все файлы в папке .ai/
- [ ] Нет опечаток или ошибок
- [ ] Пользователь понимает как использовать
- [ ] Файлы готовы к копированию в следующий чат
```

---

## 📋 ИТОГОВАЯ ИНСТРУКЦИЯ АГЕНТУ

Когда пользователь скажет: **"Создай контекст для проекта"**

Ты:

1. **Попрашиваешь информацию:**
   ```
   Дай мне информацию о проекте:
   - Название
   - Тип (API/Frontend/Full-stack)
   - Текущий статус
   - Технологии
   - Следующие задачи
   ```

2. **Получаешь информацию** от пользователя

3. **Создаешь 5 файлов** используя шаблоны выше:
   - CONTEXT.md
   - SESSION.md
   - ARCHITECTURE.md
   - DECISIONS.md
   - CHANGELOG.md

4. **Показываешь файлы** пользователю для копирования

5. **Объясняешь** как их использовать

6. **Даёшь инструкцию** для следующей сессии

---

## ✨ ИТОГ

После выполнения этого промпта в проекте будет:

✅ Система контекста установлена
✅ Все файлы созданы
✅ Проект готов к разработке
✅ Контекст готов к переносу между сессиями
✅ Агент понимает структуру и может помогать правильно

**Это решает проблему потери контекста на 100%!**

---

**Версия:** 1.0  
**Тип:** Инструкция для создания контекста с нуля  
**Статус:** Ready for use
