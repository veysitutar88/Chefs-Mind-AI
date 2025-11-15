# UNIFIED AI DEVELOPMENT FRAMEWORK (v1.1)

## PURPOSE
Создать универсальную модель взаимодействия человека и AI-агентов для постановки целей, разработки, анализа и контроля качества, 
с поддержкой переноса контекста между сессиями и агентами.

---

## STRUCTURE

1. **CONTEXT LAYER** — описывает текущее состояние проекта (Context, Session, Checkpoint).
2. **AGENT LAYER** — определяет роли и задачи каждого агента.
3. **INSTRUCTION LAYER** — фиксирует правила поведения (Agent Instructions).
4. **VIBE LAYER** — задаёт когнитивный режим и стиль выполнения (Vibe-Coding).
5. **EXECUTION LAYER** — выполняет задачу (Plan → Code → Test → Review → Analyze).
6. **QA / LOGGING LAYER** — оценивает результат, записывает логи, обновляет контекст.
7. **CONTEXT TRANSPORT LAYER** — обеспечивает перенос и восстановление контекста между агентами и сессиями.

---

## WORKFLOW

1. User → ставит цель.  
2. Orchestrator → выбирает агента.  
3. Agent → уточняет задачу (ASK / PLAN).  
4. Agent → выполняет (EXECUTE / CODE / ANALYZE).  
5. QA-Gate → валидирует результат.  
6. System → обновляет CONTEXT + SESSION + CHANGELOG.  
7. Context Keeper → синхронизирует и сохраняет снапшот текущего состояния.

---

## PRINCIPLES

- **Context First** — сначала прочти контекст.  
- **Plan Before Code** — спланируй, потом пиши.  
- **Minimal Assumptions** — не додумывай без фактов.  
- **QA Everywhere** — валидация на каждом шаге.  
- **Log Continuity** — всё фиксируется в SESSION / CHANGELOG.  
- **Persistent Context** — каждая сессия восстанавливается с последнего чекпоинта.

---

## GOAL
Единая среда, где любые модели (GPT, Gemini, Claude, Perplexity, Koda, Kilo Code и др.)  
работают по одной системе правил, без потери контекста и архитектуры.

---

## NEW MODULES (v1.1)

### 🧠 Context Transport Layer
**Назначение:** перенос и восстановление контекста между сессиями и агентами.

**Компоненты:**
- `context_snapshot (CONTEXT.md)` — текущее состояние проекта.  
- `session_log (SESSION.md)` — журнал активной сессии.  
- `checkpoint_manifest (CHECKPOINT.json)` — зафиксированные состояния.  
- `auto_resume (last_session.json)` — автоматическое восстановление после перезапуска.

**Функции:**
- `serialize_context()` — сохраняет все активные переменные и статус анализа.  
- `load_context()` — восстанавливает среду из последнего чекпоинта.  
- `merge_context()` — объединяет локальный и глобальный контекст.

---

### 🧩 Context Keeper Agent
**Роль:** следит за целостностью и последовательностью контекста.  
**Вход:** session_id, files_loaded, progress.  
**Действия:** record_progress, sync_with_checkpoint, recover_after_restart.  
**Выход:** context_snapshot.json, report_state.

---

### 🧱 Contextual Scopes
**Задача:** определить область текущего анализа или действия.  

**Основные области:**
- structure  
- tech_stack  
- architecture  
- ui_ux  
- code_quality  
- components  
- infrastructure  
- recommendations  

---

### 🗂 Report Registry
**Назначение:** хранение промежуточных отчётов и итоговых файлов.  

**Путь по умолчанию:** `/out/reports/`  

**Правила:**
- Каждый отчёт сохраняется с метаданными (дата, агент, версия).  
- Автоматически добавляется в CHANGELOG.md.  

---

### ⚙️ Расширенный Execution Layer
**Типы задач:**
- development  
- research  
- media_generation  
- analysis  

**Поток анализа (analysis_flow):**
1. load_project_files  
2. detect_structure  
3. analyze_patterns  
4. generate_report

---

## SUMMARY
Версия v1.1 добавляет полную поддержку межагентного и межсессионного переноса контекста, 
дополняет фреймворк механизмами хранения отчётов, контекстными областями анализа и новым агентом Context Keeper.
