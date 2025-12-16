# UNIFIED AI DEVELOPMENT FRAMEWORK (v1.0)

## PURPOSE
Создать универсальную модель взаимодействия человека и AI-агентов для постановки целей, разработки и контроля качества.

---

## STRUCTURE

1. **CONTEXT LAYER** — описывает текущее состояние проекта (Context, Session, Checkpoint).
2. **AGENT LAYER** — определяет роли и задачи каждого агента.
3. **INSTRUCTION LAYER** — фиксирует правила поведения (Agent Instructions).
4. **VIBE LAYER** — задаёт когнитивный режим и стиль выполнения (Vibe-Coding).
5. **EXECUTION LAYER** — выполняет задачу (Plan → Code → Test → Review).
6. **QA / LOGGING LAYER** — оценивает результат, записывает логи, обновляет контекст.

---

## WORKFLOW

1. User → ставит цель.
2. Orchestrator → выбирает агента.
3. Agent → уточняет задачу (ASK / PLAN).
4. Agent → выполняет (EXECUTE / CODE).
5. QA-Gate → валидирует результат.
6. System → обновляет CONTEXT + SESSION + CHANGELOG.

---

## PRINCIPLES

- **Context First** — сначала прочти контекст.  
- **Plan Before Code** — спланируй, потом пиши.  
- **Minimal Assumptions** — не додумывай без фактов.  
- **QA Everywhere** — валидация на каждом шаге.  
- **Log Continuity** — всё фиксируется в SESSION / CHANGELOG.

---

## GOAL

Единая среда, где любые модели (GPT, Gemini, Claude, Perplexity, Koda, Kilo Code и др.)  
работают по одной системе правил, без потери контекста и архитектуры.
