# Полная инструкция: Продвинутое мультиагентное программирование с нейросетями (vibe coding, KiloCode, GPT/Gemini/Claude, облачные платформы)

## Оглавление

1. [Архитектура системы](#1-архитектура-системы)
2. [Управление памятью и контекстом](#2-управление-памятью-и-контекстом)
3. [Структура проекта и организация файлов](#3-структура-проекта-и-организация-файлов)
4. [Сессии, чекпоинты и восстановление](#4-сессии-чекпоинты-и-восстановление)
5. [Оптимизация контекста и токенов](#5-оптимизация-контекста-и-токенов)
6. [Промпт-инжиниринг и система ролей](#6-промпт-инжиниринг-и-система-ролей)
7. [Мультиагентная оркестрация](#7-мультиагентная-оркестрация)
8. [Семантический поиск и векторные БД](#8-семантический-поиск-и-векторные-БД)
9. [Инструментарий и управление функциями](#9-инструментарий-и-управление-функциями)
10. [Тестирование, отладка и контроль качества](#10-тестирование-отладка-и-контроль-качества)
11. [Обработка ошибок и стратегии восстановления](#11-обработка-ошибок-и-стратегии-восстановления)
12. [Шаблоны рабочих процессов](#12-шаблоны-рабочих-процессов)
13. [Практические примеры и фрагменты кода](#13-практические-примеры-и-фрагменты-кода)
14. [Метрики, мониторинг и аналитика](#14-метрики-мониторинг-и-аналитика)

---

## 1. Архитектура системы

### 1.1 Многоуровневая архитектура памяти

AI-агенты нуждаются в трёхслойной архитектуре памяти, которая отражает человеческое познание:

**Слой 1: Кратковременная память (Short-term Memory)**
- Хранит текущий контекст сессии, активные переменные, недавние сообщения
- Обычно до 5,000-10,000 токенов за сессию
- Очищается или сжимается при переходе между сессиями
- Используется для немедленной обработки и принятия решений

**Слой 2: Эпизодическая память (Episodic Memory)**
- Сохраняет специфические события, выполненные задачи, успешные паттерны
- Хранится в базе данных или специализированных файлах (например, `episode-log.md`)
- Позволяет агенту вспомнить, что было сделано ранее, и избежать повторения
- Используется для обучения на истории взаимодействий

**Слой 3: Долгосрочная память (Long-term Memory)**
- Персистентное хранилище знаний о проекте, настройки, предпочтения
- Хранится в Memory Bank (KiloCode), vector database (Pinecone, Weaviate, Milvus, Chroma)
- Включает архитектурные решения, исправленные ошибки, документацию проекта
- Используется для контекстуализации новых задач

```
┌─────────────────────────────────────────────────────────┐
│       LLM Agent (GPT/Gemini/Claude)                     │
├─────────────────────────────────────────────────────────┤
│ Short-term Memory (5-10K tokens)  ← Active Session      │
│ Episodic Memory (Vector DB)       ← Recent Events       │
│ Long-term Memory (Memory Bank)    ← Project Knowledge   │
├─────────────────────────────────────────────────────────┤
│ Tool Router  ├─ API Calls                               │
│              ├─ Code Execution                          │
│              ├─ Vector DB Search                        │
│              └─ External Services                       │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Memory Communication Protocol (MCP)

MCP стандартизирует взаимодействие между компонентами памяти и агентами. Используется для синхронизации между несколькими агентами в мультиагентных системах.

```python
# Пример MCP протокола для памяти
from memory_protocol import MCPServer

class AgentMemoryProtocol:
    def __init__(self):
        self.short_term = {}  # Текущая сессия
        self.long_term_db = {}  # Долгосрочная память
    
    def sync_state(self, agent_id, state_delta):
        """Синхронизация состояния через MCP"""
        # Обновить долгосрочную память
        self.long_term_db[agent_id].update(state_delta)
        # Уведомить другие агенты
        self.broadcast_state_update(agent_id, state_delta)
    
    def retrieve_context(self, query, limit=5):
        """Получить релевантный контекст из памяти"""
        # Запрос к долгосрочной памяти
        results = self.semantic_search(query, limit)
        return results
```

---

## 2. Управление памятью и контекстом

### 2.1 Memory Bank в KiloCode

KiloCode предоставляет встроенный Memory Bank для долгосрочного хранения контекста проекта.

**Инициализация Memory Bank:**

```bash
# Создать папку для memory bank
mkdir -p .kilocode/rules/memory-bank

# Инициировать память
kilo memory init

# Обновить память с текущим состоянием
kilo memory update --files "src/**/*.ts" "README.md"

# Добавить текущий фокус
kilo memory add-context "Сейчас работаем над authentication module"
```

**Структура файлов Memory Bank:**

```
.kilocode/rules/memory-bank/
├── brief.md                # Краткое описание проекта
├── product.md              # Задачи, цели, описание функционала
├── context.md              # Текущий фокус и что делать дальше
├── architecture.md         # Архитектурные решения и паттерны
├── tag.md                  # Используемые технологии, конфигурация
├── decisions.md            # Важные архитектурные решения
├── known-issues.md         # Известные ошибки и их решения
└── performance-notes.md    # Заметки о производительности
```

### 2.2 Сжатие контекста и буферизация

Для длительных проектов используй техники сжатия и буферизации контекста.

**Стратегия Token Compression:**

Используй LLMLingua или подобные техники для сжатия контекста с коэффициентом 2x-20x без потери смысла.

```python
# Пример сжатия контекста
def compress_context(full_context, compression_ratio=0.3):
    """
    Сжать контекст используя коэффициент сжатия
    compression_ratio=0.3 означает оставить 30% от оригинального объёма
    """
    tokens = full_context.split()
    target_length = int(len(tokens) * compression_ratio)
    
    # Используй LLMLingua для умного сжатия
    compressed = llm_lingua.compress(
        context=full_context,
        target_tokens=target_length,
        budget_tokens=target_length,
        iterative=True  # Итеративное сжатие
    )
    return compressed

# Буферизация памяти между сессиями
class ContextBuffer:
    def __init__(self, max_size=50000):
        self.buffer = []
        self.max_size = max_size
    
    def add_to_buffer(self, content, metadata=None):
        self.buffer.append({
            "content": content,
            "metadata": metadata,
            "timestamp": time.time()
        })
        # Если переполнен, сжать старые записи
        if self._get_total_tokens() > self.max_size:
            self._compress_old_entries()
    
    def get_relevant_context(self, query, top_k=3):
        # Получить релевантный контекст из буфера
        results = self._semantic_search(query, top_k)
        return results
```

### 2.3 RAG (Retrieval-Augmented Generation)

RAG позволяет агентам обращаться к большим объёмам внешней информации без перегрузки контекста.

```python
# RAG Pipeline для AI-агентов
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.chains import RetrievalQA

class RAGPipeline:
    def __init__(self, index_name="project-knowledge"):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Pinecone(
            index_name=index_name,
            embedding_function=self.embeddings
        )
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(model="gpt-4"),
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(
                search_kwargs={"k": 5}  # Получить top-5 релевантных документов
            )
        )
    
    def add_documents(self, documents, metadata=None):
        """Добавить документы в RAG базу"""
        self.vectorstore.add_documents(documents)
    
    def query(self, question):
        """Запросить знания через RAG"""
        return self.qa_chain.run(question)

# Использование RAG в агенте
rag = RAGPipeline()

# Добавить документацию проекта
project_docs = load_docs_from_path("docs/", "README.md", "ARCHITECTURE.md")
for doc in project_docs:
    rag.add_documents([doc])

# Использовать в промпте агента
agent_prompt = f"""
Ты — expert программист. Вот релевантная информация из проекта:
{rag.query("Какова архитектура проекта?")}

Теперь ответь на вопрос: {user_question}
"""
```

---

## 3. Структура проекта и организация файлов

### 3.1 Полная структура проекта для мультиагентной разработки

```
my-project/
│
├── .kilocode/                          # KiloCode конфигурация
│   ├── rules/
│   │   └── memory-bank/
│   │       ├── brief.md                # Описание проекта
│   │       ├── product.md              # Цели и задачи
│   │       ├── context.md              # Текущий фокус
│   │       ├── architecture.md         # Архитектура
│   │       ├── tag.md                  # Технологии и версии
│   │       ├── decisions.md            # Архитектурные решения
│   │       ├── known-issues.md         # Известные ошибки
│   │       └── performance-notes.md    # Заметки о производительности
│   ├── PROJECT_SPEC.md                 # Полная спецификация
│   ├── INSTRUCTIONS.md                 # Инструкции для агентов
│   ├── AI_SETUP.md                     # Настройка ИИ
│   └── .kilocode-env.json              # Переменные окружения
│
├── .agentic/                           # Конфигурация мультиагентной системы
│   ├── agents/
│   │   ├── coordinator.json            # Главный оркестратор
│   │   ├── code-generator.json         # Агент генерации кода
│   │   ├── reviewer.json               # Агент ревью
│   │   ├── tester.json                 # Агент тестирования
│   │   └── debugger.json               # Агент отладки
│   ├── memory/
│   │   ├── episodes.json               # Эпизодическая память
│   │   ├── vector-index.faiss          # Векторный индекс
│   │   └── state-snapshots/            # Снимки состояния
│   └── workflows/
│       ├── code-generation.yaml        # Workflow генерации
│       ├── code-review.yaml            # Workflow ревью
│       └── testing.yaml                # Workflow тестирования
│
├── GEMINI.md                           # Заметки для Gemini сессий
├── CLAUDE.md                           # Заметки для Claude сессий
├── GPT.md                              # Заметки для GPT сессий
├── SESSION.md                          # Текущая сессия
├── AI_SETUP.md                         # Полная настройка ИИ для проекта
├── WIREFRAMES.md                       # Архитектурные диаграммы
├── API_DOCS.md                         # Документация API
├── README.md                           # Основная документация
│
├── src/                                # Исходный код
│   ├── agents/                         # Код для агентов
│   ├── tools/                          # Инструменты для агентов
│   ├── memory/                         # Память системы
│   ├── orchestration/                  # Оркестрация
│   └── utils/                          # Утилиты
│
├── tests/                              # Тесты
│   ├── unit/                           # Юнит-тесты
│   ├── integration/                    # Интеграционные тесты
│   ├── e2e/                            # E2E тесты
│   └── smoke-tests/                    # Smoke-тесты для агентов
│
├── docs/                               # Документация
│   ├── architecture/                   # Архитектурные документы
│   ├── guides/                         # Гайды
│   ├── api/                            # API документация
│   └── examples/                       # Примеры использования
│
├── checkpoints/                        # Сохранённые состояния
│   ├── session-001/
│   │   ├── state.json                  # Состояние агентов
│   │   ├── memory-snapshot.json        # Снимок памяти
│   │   └── context-buffer.json         # Буфер контекста
│   └── session-002/
│
└── logs/                               # Логи агентов
    ├── agent-activity.log              # Деятельность агентов
    ├── errors.log                      # Ошибки
    ├── token-usage.log                 # Использование токенов
    └── performance.log                 # Метрики производительности
```

### 3.2 Основные файлы памяти

**brief.md:**
```markdown
# Краткое описание проекта Chef's Mind AI

## Обзор
Chef's Mind AI — платформа для управления рецептами, инвентаризацией и планированием меню с использованием AI-агентов.

## Основные модули
- Authentication & OAuth
- Recipe Management
- Inventory Tracking
- Menu Planning
- AI Recipe Generator

## Технологии
- Frontend: Next.js, React, TypeScript
- Backend: Node.js, TypeScript, Express
- Database: PostgreSQL, Redis
- AI: Multi-agent system with KiloCode

## Текущий статус
В активной разработке. Завершены: Auth, Recipe API. В работе: Inventory management.
```

**architecture.md:**
```markdown
# Архитектура Chef's Mind AI

## Архитектурные принципы
1. Микросервисная архитектура с чёткой разграницией ответственности
2. Асинхронная обработка через message queues
3. Кэширование на нескольких уровнях
4. Event-driven координация между модулями

## Компоненты системы
- API Gateway (Express)
- Recipe Service
- Inventory Service
- Menu Service
- AI Agent Orchestrator

## Паттерны координации
- Coordinator pattern для мультиагентных задач
- Pipeline pattern для обработки рецептов
```

**tag.md:**
```markdown
# Технологии и версии

## Runtime
- Node.js: 18.x LTS
- TypeScript: 5.x
- npm: 9.x

## Core Libraries
- Express: 4.18
- React: 18.2
- Next.js: 14.x
- PostgreSQL: 15.x

## AI & Agents
- KiloCode: latest
- LangChain: 0.1.x
- OpenAI SDK: 4.x
- Anthropic SDK: latest

## Infrastructure
- Docker: 24.x
- Docker Compose: 2.x
- GitHub Actions (CI/CD)
```

---

## 4. Сессии, чекпоинты и восстановление

### 4.1 Структура сессий

Каждая рабочая сессия должна иметь чёткую структуру инициализации, выполнения и завершения.

```python
class AgentSession:
    def __init__(self, session_id, user_id, app_name):
        self.session_id = session_id
        self.user_id = user_id
        self.app_name = app_name
        
        # Инициировать состояние сессии
        self.state = {
            "user_id": user_id,
            "session_id": session_id,
            "created_at": time.time(),
            "last_checkpoint": None,
            "task_counter": 0,
            "errors": [],
            "completed_tasks": []
        }
        
        # Инициировать буферы памяти
        self.short_term_buffer = []
        self.context_cache = {}
        
    def add_checkpoint(self, description, state_delta=None):
        """Добавить чекпоинт для восстановления при ошибке"""
        checkpoint = {
            "id": f"ckpt_{int(time.time())}",
            "description": description,
            "timestamp": time.time(),
            "state": self.state.copy(),
            "memory_buffer": self.short_term_buffer.copy(),
            "state_delta": state_delta or {}
        }
        self.state["last_checkpoint"] = checkpoint["id"]
        self.save_checkpoint(checkpoint)
        return checkpoint["id"]
    
    def save_checkpoint(self, checkpoint):
        """Сохранить чекпоинт на диск"""
        checkpoint_dir = f"checkpoints/session-{self.session_id}"
        os.makedirs(checkpoint_dir, exist_ok=True)
        
        with open(f"{checkpoint_dir}/checkpoint-{checkpoint['id']}.json", "w") as f:
            json.dump(checkpoint, f)
    
    def load_checkpoint(self, checkpoint_id):
        """Загрузить чекпоинт для восстановления"""
        checkpoint_path = f"checkpoints/session-{self.session_id}/checkpoint-{checkpoint_id}.json"
        with open(checkpoint_path, "r") as f:
            checkpoint = json.load(f)
        
        # Восстановить состояние
        self.state = checkpoint["state"]
        self.short_term_buffer = checkpoint["memory_buffer"]
        return checkpoint

# Использование сессий в Google Vertex AI
from google.adk.session import SessionService

async def create_and_manage_session():
    session_service = SessionService()
    
    # Создать новую сессию
    session = await session_service.create_session(
        app_name="chef-mind-ai",
        user_id="user_123",
        state={
            "recipe_database": "loaded",
            "user_preferences": {"cuisine": "italian"}
        }
    )
    
    # Использовать сессию
    print(f"Session ID: {session.id}")
    print(f"Session State: {session.state}")
    
    # Обновить состояние сессии
    new_state_delta = {"current_task": "generating_menu"}
    
    from google.adk.events import Event, EventActions
    
    state_changes = {"current_task": "generating_menu"}
    actions = EventActions(state_delta=state_changes)
    event = Event(
        invocation_id="inv_001",
        author="agent",
        actions=actions,
        timestamp=time.time()
    )
    
    await session_service.append_event(session, event)
    
    # Получить обновлённую сессию
    updated_session = await session_service.get_session(
        app_name="chef-mind-ai",
        user_id="user_123",
        session_id=session.id
    )
```

### 4.2 Checkpointing для восстановления после ошибок

```python
class CheckpointRecovery:
    def __init__(self, agent):
        self.agent = agent
        self.checkpoint_interval = 5  # Чекпоинт каждые 5 операций
        self.operation_counter = 0
    
    def execute_with_recovery(self, task, max_retries=3):
        """Выполнить задачу с возможностью восстановления"""
        attempt = 0
        last_checkpoint = None
        
        while attempt < max_retries:
            try:
                # Загрузить последний чекпоинт, если это не первая попытка
                if last_checkpoint:
                    self.agent.load_checkpoint(last_checkpoint)
                    print(f"Recovered from checkpoint: {last_checkpoint}")
                
                # Выполнить задачу
                result = self.agent.execute_task(task)
                
                # Добавить чекпоинт после успешного выполнения
                last_checkpoint = self.agent.session.add_checkpoint(
                    f"Completed task: {task['name']}",
                    state_delta={"last_successful_task": task['name']}
                )
                
                return result
                
            except Exception as e:
                attempt += 1
                print(f"Error on attempt {attempt}: {str(e)}")
                
                if attempt < max_retries:
                    # Подождать перед повторной попыткой
                    wait_time = 2 ** attempt  # Exponential backoff
                    print(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    # Максимум попыток исчерпан
                    raise RuntimeError(f"Task failed after {max_retries} attempts: {str(e)}")
```

---

## 5. Оптимизация контекста и токенов

### 5.1 Техники оптимизации токенов

**Метод 1: Token Budgeting**

Явно указывать бюджет токенов в промптах позволяет ИИ генерировать более компактные ответы, сжимая CoT (Chain-of-Thought) процесс на 3-5x.

```python
def create_budget_aware_prompt(task, token_budget=100):
    """
    Создать промпт с указанным бюджетом токенов.
    Исследования показывают: при разумном бюджете (50-100 токенов),
    качество сохраняется, но стоимость снижается на 2-3x
    """
    prompt = f"""
Complete the following task with MAXIMUM {token_budget} tokens in your response.
Be concise and direct. Prioritize essential information.

Task: {task['description']}

Remember: Your response must NOT exceed {token_budget} tokens.
Focus on the core answer, then supporting details if space permits.
"""
    return prompt

# Пример использования с разными бюджетами
tasks = [
    {"name": "summarize", "budget": 50},
    {"name": "explain_architecture", "budget": 150},
    {"name": "code_review", "budget": 200}
]

for task in tasks:
    prompt = create_budget_aware_prompt(task['name'], task['budget'])
    response = llm.generate(prompt)
    print(f"Tokens used: {response.usage.completion_tokens} / {task['budget']}")
```

**Метод 2: Strategic Truncation**

```python
def strategic_truncation(full_context, priority_sections=None, max_tokens=4000):
    """
    Стратегическое усечение контекста:
    1. Приоритизировать важные секции
    2. Удалить повторяющуюся информацию
    3. Сжать детали менее важных частей
    """
    sections = full_context.split("\n\n")
    
    # Оценить важность каждой секции
    scored_sections = []
    for section in sections:
        importance = calculate_importance(section, priority_sections)
        token_count = len(section.split())
        scored_sections.append({
            "text": section,
            "importance": importance,
            "tokens": token_count
        })
    
    # Сортировать по важности
    scored_sections.sort(key=lambda x: x["importance"], reverse=True)
    
    # Выбрать секции до достижения лимита токенов
    truncated = []
    total_tokens = 0
    
    for section in scored_sections:
        if total_tokens + section["tokens"] <= max_tokens:
            truncated.append(section["text"])
            total_tokens += section["tokens"]
    
    return "\n\n".join(truncated)

def calculate_importance(section, priority_keywords):
    """Рассчитать важность секции на основе ключевых слов"""
    score = 0
    for keyword in priority_keywords:
        score += section.lower().count(keyword.lower())
    return score
```

**Метод 3: Format Optimization**

CSV формат использует на 30-40% меньше токенов чем JSON для табличных данных.

```python
# JSON версия (больше токенов)
json_data = """
[
    {"id": 1, "name": "Recipe1", "duration": 30},
    {"id": 2, "name": "Recipe2", "duration": 45},
    {"id": 3, "name": "Recipe3", "duration": 60}
]
"""

# CSV версия (меньше токенов)
csv_data = """id,name,duration
1,Recipe1,30
2,Recipe2,45
3,Recipe3,60"""

# CSV версия займет ~40% меньше токенов при той же информации
```

### 5.2 Context Caching (для Gemini и Claude)

```python
# Google Gemini Context Caching
from google.genai import types

def use_gemini_context_caching(system_prompt, documents):
    """
    Используй context caching для сохранения стоимости.
    Первый запрос: полная цена
    Последующие: ~90% экономия на кэшированном контексте
    """
    
    client = genai.Client()
    
    # Подготовить системный промпт для кэширования
    cache_control_config = types.CacheControlEphemeral()
    
    cached_system = types.SystemInstruction(
        parts=[
            types.Part(text=system_prompt)
        ],
        cache_control=cache_control_config
    )
    
    # Первый запрос (создаст кэш)
    response1 = client.models.generate_content(
        model="gemini-1.5-pro",
        contents=[
            types.Content(
                role="user",
                parts=[types.Part(text="Analyze these documents:")]
            ),
            types.Content(
                role="user",
                parts=[types.Part(text="\n".join(documents))]
            ),
            types.Content(
                role="user",
                parts=[types.Part(text="What are the key insights?")]
            )
        ],
        system_instruction=cached_system
    )
    
    # Последующие запросы используют кэш
    response2 = client.models.generate_content(
        model="gemini-1.5-pro",
        contents=[
            types.Content(
                role="user",
                parts=[types.Part(text="Based on these documents, what are the risks?")]
            )
        ],
        system_instruction=cached_system
    )
    
    return response1, response2
```

---

## 6. Промпт-инжиниринг и система ролей

### 6.1 Role-Based Prompting для специализированных агентов

```python
class AgentRolePrompts:
    """Система ролевых промптов для разных типов агентов"""
    
    CODE_GENERATOR_ROLE = """
You are an expert software architect and code generator.
Your role:
- Generate clean, production-ready code
- Follow TypeScript/JavaScript best practices
- Consider performance, security, and maintainability
- Ask clarifying questions if requirements are ambiguous
- Provide explanations for architectural decisions

Constraints:
- Must pass TypeScript strict mode
- Must include proper error handling
- Must include JSDoc comments for public APIs
- Code must be testable
"""
    
    CODE_REVIEWER_ROLE = """
You are a senior code reviewer with 10+ years experience.
Your role:
- Review code for quality, performance, and security
- Identify potential bugs and edge cases
- Suggest improvements and best practices
- Rate code quality on scale 1-10
- Provide actionable feedback

Focus areas:
- Security vulnerabilities
- Performance bottlenecks
- Code readability and maintainability
- Test coverage gaps
- Edge case handling
"""
    
    TESTER_ROLE = """
You are a QA engineer and test architect.
Your role:
- Design comprehensive test strategies
- Identify edge cases and failure modes
- Create effective test cases
- Suggest automation approaches
- Evaluate test coverage

Test types to consider:
- Unit tests
- Integration tests
- End-to-end tests
- Performance tests
- Security tests
"""
    
    DEBUGGER_ROLE = """
You are a master debugger with deep system knowledge.
Your role:
- Analyze error messages and stack traces
- Identify root causes
- Suggest fixes with explanations
- Help understand complex failure modes
- Provide debugging strategies

Approach:
- Ask clarifying questions about the environment
- Request relevant logs and context
- Suggest systematic debugging steps
- Provide multiple solution options
"""

def create_role_based_agent(role_type, model="gpt-4"):
    """Создать агента с определённой ролью"""
    
    roles = {
        "generator": AgentRolePrompts.CODE_GENERATOR_ROLE,
        "reviewer": AgentRolePrompts.CODE_REVIEWER_ROLE,
        "tester": AgentRolePrompts.TESTER_ROLE,
        "debugger": AgentRolePrompts.DEBUGGER_ROLE
    }
    
    if role_type not in roles:
        raise ValueError(f"Unknown role: {role_type}")
    
    return ChatOpenAI(
        model=model,
        system_prompt=roles[role_type],
        temperature=0.3  # Более детерминированные ответы для кода
    )

# Использование
code_gen = create_role_based_agent("generator")
reviewer = create_role_based_agent("reviewer")

# Сгенерировать код
generated_code = code_gen.generate("""
Create a TypeScript function that:
1. Fetches recipes from PostgreSQL
2. Filters by cuisine type
3. Caches results for 1 hour
4. Returns paginated results
""")

# Проверить сгенерированный код
review = reviewer.review(generated_code)
```

### 6.2 Chain-of-Thought Prompting

```python
def create_cot_prompt(task, reasoning_steps=None):
    """
    Chain-of-Thought (CoT) промпт для улучшения качества решений.
    Исследования показывают улучшение на 30-50% для сложных задач.
    """
    
    if reasoning_steps is None:
        reasoning_steps = [
            "Understand the problem thoroughly",
            "Break it into smaller parts",
            "Think about edge cases",
            "Design the solution step-by-step",
            "Consider alternatives and trade-offs"
        ]
    
    prompt = f"""
Solve this task by thinking step-by-step.

Task: {task}

Please work through this systematically:

"""
    for i, step in enumerate(reasoning_steps, 1):
        prompt += f"{i}. {step}\n"
    
    prompt += """
After working through each step, provide:
1. Your final solution
2. Why this approach is best
3. Any assumptions you made
4. Potential improvements
"""
    
    return prompt

# Пример
task = "Design an inventory tracking system for a restaurant"
cot_prompt = create_cot_prompt(task)
response = llm.generate(cot_prompt)
```

### 6.3 Self-Criticism и Self-Correction

```python
def generate_with_self_criticism(agent, task, max_iterations=3):
    """
    Генерировать код/решение с самокритикой.
    Агент генерирует решение, критикует его, и улучшает.
    """
    
    for iteration in range(max_iterations):
        # Генерировать решение
        solution = agent.generate(task)
        
        # Самокритика
        criticism_prompt = f"""
Review the following solution critically:

{solution}

Identify:
1. Potential bugs or issues
2. Missing edge cases
3. Performance problems
4. Improvements needed
5. Overall quality score (1-10)

Provide constructive feedback.
"""
        
        criticism = agent.generate(criticism_prompt)
        
        # Если качество достаточно хорошее (7+), остановиться
        quality_score = extract_quality_score(criticism)
        if quality_score >= 7:
            return solution
        
        # Улучшить решение на основе критики
        improvement_prompt = f"""
Based on this feedback:
{criticism}

Please improve the solution:
{solution}

Focus on addressing the identified issues while maintaining good design.
"""
        
        task = improvement_prompt  # Использовать улучшение как новую задачу
    
    return solution

def extract_quality_score(criticism_text):
    """Извлечь оценку качества из текста критики"""
    import re
    match = re.search(r'(\d+)/10', criticism_text)
    return int(match.group(1)) if match else 5
```

---

## 7. Мультиагентная оркестрация

### 7.1 Coordinator Pattern (Главный оркестратор)

```python
class AgentOrchestrator:
    """
    Главный оркестратор координирует работу специализированных агентов.
    Паттерн: Coordinator decomposing tasks hierarchically.
    """
    
    def __init__(self):
        self.agents = {
            "analyzer": CodeAnalyzerAgent(),
            "generator": CodeGeneratorAgent(),
            "reviewer": CodeReviewerAgent(),
            "tester": TestGeneratorAgent()
        }
        self.task_queue = []
        self.task_results = {}
    
    def coordinate(self, user_request):
        """Главная функция координации"""
        
        # Этап 1: Анализ требований
        analysis = self.agents["analyzer"].analyze(user_request)
        
        # Этап 2: Разложить на подзадачи
        subtasks = self._decompose_task(analysis)
        
        # Этап 3: Генерировать код
        generated_code = self.agents["generator"].generate(subtasks["code_spec"])
        
        # Этап 4: Проверить код
        review = self.agents["reviewer"].review(generated_code)
        
        if review["quality_score"] < 7:
            # Если качество низко, переделать
            generated_code = self.agents["generator"].regenerate(
                generated_code,
                feedback=review["issues"]
            )
        
        # Этап 5: Сгенерировать тесты
        tests = self.agents["tester"].generate_tests(generated_code)
        
        # Этап 6: Проверить тесты
        test_results = self._run_tests(tests, generated_code)
        
        return {
            "code": generated_code,
            "review": review,
            "tests": tests,
            "test_results": test_results
        }
    
    def _decompose_task(self, analysis):
        """Разложить задачу на подзадачи"""
        return {
            "code_spec": analysis["requirements"],
            "test_spec": analysis["test_requirements"],
            "performance_spec": analysis["performance_requirements"]
        }
    
    def _run_tests(self, tests, code):
        """Запустить тесты"""
        # Выполнить тесты и вернуть результаты
        return {"passed": 0, "failed": 0}
```

### 7.2 Multi-Agent with Dynamic Task Routing

```python
class DynamicTaskRouter:
    """
    Маршрутизировать задачи между агентами на основе:
    - Типа задачи
    - Доступности агента
    - Уверенности агента в выполнении
    - Очереди задач
    """
    
    def __init__(self, agents):
        self.agents = agents  # Dict с агентами
        self.task_history = []
        self.agent_performance = {}  # Отслеживать производительность
    
    def route_task(self, task):
        """Выбрать лучшего агента для задачи"""
        
        # Оценить каждого агента для этой задачи
        scores = {}
        for agent_name, agent in self.agents.items():
            score = self._score_agent(agent, task)
            scores[agent_name] = score
        
        # Выбрать агента с наивысшей оценкой
        best_agent_name = max(scores, key=scores.get)
        best_agent = self.agents[best_agent_name]
        
        print(f"Routing task '{task['name']}' to {best_agent_name} (score: {scores[best_agent_name]:.2f})")
        
        return best_agent, best_agent_name
    
    def _score_agent(self, agent, task):
        """Оценить агента для задачи"""
        score = 0
        
        # Фактор 1: Специализация (0-40 баллов)
        if task["type"] in agent.specialization:
            score += 40
        
        # Фактор 2: Доступность (0-20 баллов)
        availability = agent.get_availability()
        score += availability * 20
        
        # Фактор 3: Историческая производительность (0-30 баллов)
        perf = self.agent_performance.get(agent.name, {})
        success_rate = perf.get("success_rate", 0.5)
        score += success_rate * 30
        
        # Фактор 4: Уверенность агента (0-10 баллов)
        confidence = agent.estimate_confidence(task)
        score += confidence * 10
        
        return score
    
    def execute_with_routing(self, task, max_retries=2):
        """Выполнить задачу с динамической маршрутизацией"""
        
        for attempt in range(max_retries):
            # Выбрать и маршрутизировать агента
            agent, agent_name = self.route_task(task)
            
            try:
                # Выполнить задачу
                result = agent.execute(task)
                
                # Обновить производительность
                self._update_performance(agent_name, success=True)
                
                return result
                
            except Exception as e:
                print(f"Agent {agent_name} failed: {str(e)}")
                self._update_performance(agent_name, success=False)
                
                # Пересмотреть маршрутизацию для следующей попытки
                self._exclude_agent(agent_name)
    
    def _update_performance(self, agent_name, success):
        """Обновить метрики производительности агента"""
        if agent_name not in self.agent_performance:
            self.agent_performance[agent_name] = {"successes": 0, "failures": 0}
        
        if success:
            self.agent_performance[agent_name]["successes"] += 1
        else:
            self.agent_performance[agent_name]["failures"] += 1
        
        total = (self.agent_performance[agent_name]["successes"] + 
                self.agent_performance[agent_name]["failures"])
        
        success_rate = (self.agent_performance[agent_name]["successes"] / total 
                       if total > 0 else 0.5)
        
        self.agent_performance[agent_name]["success_rate"] = success_rate
```

---

## 8. Семантический поиск и векторные БД

### 8.1 Интеграция с Vector Database

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone, Chroma
import pinecone

class VectorKnowledgeBase:
    """
    Векторная база знаний для семантического поиска.
    Использует embeddings для понимания смысла, а не ключевых слов.
    """
    
    def __init__(self, embedding_model="text-embedding-3-small"):
        # Инициализировать embeddings
        self.embeddings = OpenAIEmbeddings(model=embedding_model)
        
        # Инициализировать Pinecone
        pinecone.init(api_key=os.getenv("PINECONE_API_KEY"))
        self.vectorstore = Pinecone(
            index_name="project-knowledge",
            embedding_function=self.embeddings.embed_query
        )
    
    def add_documents(self, documents, metadata=None):
        """Добавить документы в базу знаний"""
        doc_texts = [doc.page_content if hasattr(doc, 'page_content') else doc 
                     for doc in documents]
        
        self.vectorstore.add_texts(
            texts=doc_texts,
            metadatas=metadata or [{} for _ in doc_texts]
        )
    
    def semantic_search(self, query, top_k=5):
        """
        Семантический поиск: найти документы по смыслу, а не ключевым словам.
        
        Пример: запрос "как хранить овощи" найдёт документы о хранении,
        даже если они используют другие слова (preserve, store, keep, etc)
        """
        results = self.vectorstore.similarity_search(query, k=top_k)
        return results
    
    def hybrid_search(self, query, top_k=5):
        """
        Гибридный поиск: комбинировать семантический поиск с keyword-based.
        Обычно лучше чем только один из подходов.
        """
        # Семантический поиск
        semantic_results = self.semantic_search(query, top_k=top_k)
        
        # Keyword-based поиск
        keyword_results = self._keyword_search(query, top_k=top_k)
        
        # Объединить и дедублицировать результаты
        combined = {r.metadata['id']: r for r in semantic_results}
        combined.update({r.metadata['id']: r for r in keyword_results})
        
        return list(combined.values())[:top_k]
    
    def _keyword_search(self, query, top_k=5):
        """Keyword-based поиск (BM25 или аналог)"""
        # Использовать BM25 для keyword-based поиска
        from rank_bm25 import BM25Okapi
        
        # Здесь должна быть реализация keyword search
        pass

# Использование в агенте
class RAGAgent:
    def __init__(self):
        self.knowledge_base = VectorKnowledgeBase()
        self.llm = ChatOpenAI(model="gpt-4")
    
    def answer_question(self, question):
        """Ответить на вопрос используя RAG"""
        
        # Найти релевантные документы
        documents = self.knowledge_base.semantic_search(question, top_k=5)
        
        # Подготовить контекст
        context = "\n\n".join([doc.page_content for doc in documents])
        
        # Создать промпт с контекстом
        prompt = f"""
Based on the following context, answer the question:

Context:
{context}

Question: {question}

Answer:
"""
        
        # Получить ответ от LLM
        response = self.llm.generate(prompt)
        
        return {
            "answer": response,
            "sources": [doc.metadata.get("source", "Unknown") for doc in documents]
        }
```

### 8.2 Vector Database для AI Agent Memory

```python
class AgentMemoryWithVectors:
    """
    Использовать векторную БД для долгосрочной памяти агентов.
    Позволяет агентам быстро находить релевантные прошлые взаимодействия.
    """
    
    def __init__(self, agent_id):
        self.agent_id = agent_id
        self.vectorstore = Chroma(
            collection_name=f"agent-{agent_id}-memory",
            embedding_function=OpenAIEmbeddings()
        )
    
    def remember_interaction(self, interaction):
        """Запомнить взаимодействие"""
        # interaction = {
        #     "task": "...",
        #     "solution": "...",
        #     "outcome": "...",
        #     "timestamp": "..."
        # }
        
        summary = f"Task: {interaction['task']} | Solution: {interaction['solution']} | Outcome: {interaction['outcome']}"
        
        self.vectorstore.add_texts(
            texts=[summary],
            metadatas=[{
                "task": interaction["task"],
                "timestamp": interaction["timestamp"],
                "success": interaction.get("success", True)
            }]
        )
    
    def recall_similar_interactions(self, current_task, top_k=3):
        """Вспомнить похожие прошлые взаимодействия"""
        results = self.vectorstore.similarity_search(current_task, k=top_k)
        return results
    
    def learn_from_past(self, current_task):
        """Учиться на основе прошлого опыта"""
        similar = self.recall_similar_interactions(current_task)
        
        learning_insights = []
        for past_interaction in similar:
            if past_interaction.metadata["success"]:
                insight = f"Successfully solved similar task: {past_interaction.metadata['task']}"
                learning_insights.append(insight)
        
        return learning_insights
```

---

## 9. Инструментарий и управление функциями

### 9.1 Tool Registry и Dynamic Tool Selection

```python
class ToolRegistry:
    """
    Реестр всех доступных инструментов для агентов.
    Позволяет агентам выбирать лучший инструмент для каждой задачи.
    """
    
    def __init__(self):
        self.tools = {}
        self.tool_metadata = {}
    
    def register_tool(self, name, func, description, inputs_schema):
        """Зарегистрировать новый инструмент"""
        self.tools[name] = func
        self.tool_metadata[name] = {
            "description": description,
            "inputs_schema": inputs_schema,
            "success_rate": 0.0,
            "avg_execution_time": 0.0,
            "usage_count": 0
        }
    
    def get_tool(self, name):
        """Получить инструмент по имени"""
        if name not in self.tools:
            raise ValueError(f"Tool '{name}' not found in registry")
        return self.tools[name]
    
    def find_tools_for_task(self, task_description):
        """Найти подходящие инструменты для задачи"""
        # Использовать семантический поиск для найти релевантные инструменты
        tool_descriptions = {name: meta["description"] 
                            for name, meta in self.tool_metadata.items()}
        
        # Найти инструменты с наиболее релевантным описанием
        relevant_tools = []
        for tool_name, description in tool_descriptions.items():
            similarity = self._compute_similarity(task_description, description)
            if similarity > 0.7:  # Порог релевантности
                relevant_tools.append((tool_name, similarity))
        
        # Сортировать по релевантности
        relevant_tools.sort(key=lambda x: x[1], reverse=True)
        return [name for name, _ in relevant_tools]
    
    def execute_tool(self, tool_name, **kwargs):
        """Выполнить инструмент и отследить метрики"""
        tool = self.get_tool(tool_name)
        
        start_time = time.time()
        try:
            result = tool(**kwargs)
            execution_time = time.time() - start_time
            
            # Обновить метрики
            self.tool_metadata[tool_name]["usage_count"] += 1
            self.tool_metadata[tool_name]["success_rate"] = (
                self.tool_metadata[tool_name]["success_rate"] * 0.9 + 0.1
            )
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.tool_metadata[tool_name]["success_rate"] *= 0.9  # Понизить рейтинг
            raise

# Использование Tool Registry
registry = ToolRegistry()

# Зарегистрировать инструменты
registry.register_tool(
    name="fetch_recipes",
    func=lambda cuisine: db.fetch_recipes(cuisine),
    description="Fetch recipes from the database by cuisine type",
    inputs_schema={"cuisine": "string"}
)

registry.register_tool(
    name="calculate_nutrition",
    func=lambda ingredients: nutrition_api.calculate(ingredients),
    description="Calculate nutritional information for ingredients",
    inputs_schema={"ingredients": "list of strings"}
)

# Найти инструменты для задачи
task = "I need Italian recipes with nutritional information"
suitable_tools = registry.find_tools_for_task(task)
print(f"Suitable tools: {suitable_tools}")

# Выполнить инструменты
recipes = registry.execute_tool("fetch_recipes", cuisine="Italian")
nutrition = registry.execute_tool("calculate_nutrition", ingredients=recipes[0]["ingredients"])
```

### 9.2 Function Calling Patterns

```python
class FunctionCallingAgent:
    """
    Агент, использующий Function Calling для вызова внешних функций.
    Стандартизирован через Model Context Protocol (MCP).
    """
    
    def __init__(self, llm_model="gpt-4"):
        self.llm = ChatOpenAI(model=llm_model)
        self.tools = self._define_tools()
    
    def _define_tools(self):
        """Определить доступные инструменты с JSON Schema"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "fetch_recipe",
                    "description": "Fetch a recipe by ID",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "recipe_id": {
                                "type": "string",
                                "description": "The ID of the recipe to fetch"
                            }
                        },
                        "required": ["recipe_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_inventory",
                    "description": "Update inventory for an ingredient",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "ingredient": {"type": "string"},
                            "quantity": {"type": "number"}
                        },
                        "required": ["ingredient", "quantity"]
                    }
                }
            }
        ]
    
    def execute(self, user_message):
        """Выполнить агента с function calling"""
        
        messages = [{"role": "user", "content": user_message}]
        
        while True:
            # Получить ответ от LLM с инструментами
            response = self.llm.chat.completions.create(
                model="gpt-4",
                messages=messages,
                tools=self.tools,
                tool_choice="auto"
            )
            
            # Проверить, хочет ли LLM вызвать функцию
            if response.choices[0].message.tool_calls:
                # Есть function calls
                for tool_call in response.choices[0].message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)
                    
                    # Выполнить функцию
                    function_result = self._execute_function(function_name, function_args)
                    
                    # Добавить результат в сообщения
                    messages.append({
                        "role": "assistant",
                        "content": response.choices[0].message.content,
                        "tool_calls": response.choices[0].message.tool_calls
                    })
                    
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(function_result)
                    })
            else:
                # Нет function calls, вернуть финальный ответ
                return response.choices[0].message.content
    
    def _execute_function(self, function_name, args):
        """Выполнить функцию и вернуть результат"""
        if function_name == "fetch_recipe":
            return {"recipe": "..."}  # Вернуть результат из БД
        elif function_name == "update_inventory":
            return {"status": "updated"}
```

---

## 10. Тестирование, отладка и контроль качества

### 10.1 Самокоррекция кода и итеративное улучшение

```python
class IterativeCodeGeneration:
    """
    Итеративное улучшение сгенерированного кода через:
    1. Генерацию
    2. Тестирование
    3. Критику и анализ
    4. Улучшение
    """
    
    def __init__(self):
        self.generator = CodeGeneratorAgent()
        self.reviewer = CodeReviewerAgent()
        self.tester = TestGeneratorAgent()
        self.max_iterations = 5
    
    def generate_and_improve(self, specification):
        """Генерировать и улучшать код итеративно"""
        
        code = None
        test_results = None
        
        for iteration in range(self.max_iterations):
            print(f"\n=== Iteration {iteration + 1} ===")
            
            if iteration == 0:
                # Первая итерация: сгенерировать код
                code = self.generator.generate(specification)
            else:
                # Следующие итерации: улучшить на основе критики
                improvement_prompt = f"""
Based on these issues:
{test_results['failures']}

Please improve the code:
{code}

Focus on:
1. Fixing failing tests
2. Improving performance where identified
3. Handling edge cases
"""
                code = self.generator.improve(improvement_prompt)
            
            # Сгенерировать и запустить тесты
            tests = self.tester.generate_tests(code)
            test_results = self._run_tests(tests, code)
            
            print(f"Tests: {test_results['passed']}/{test_results['total']} passed")
            
            # Если все тесты прошли, провести ревью
            if test_results['passed'] == test_results['total']:
                review = self.reviewer.review(code)
                
                if review['quality_score'] >= 8:
                    print(f"✓ Code is production-ready (quality: {review['quality_score']}/10)")
                    return code
                else:
                    print(f"Code quality: {review['quality_score']}/10")
                    print(f"Issues: {review['issues']}")
                    # Продолжить улучшение
            else:
                print(f"Tests failed: {test_results['failures']}")
        
        return code
    
    def _run_tests(self, tests, code):
        """Запустить тесты и вернуть результаты"""
        # Реализация запуска тестов
        return {
            "passed": 0,
            "total": 0,
            "failures": []
        }
```

### 10.2 Smoke-тесты для агентов

```python
class AgentSmokeTests:
    """
    Smoke-тесты для проверки работоспособности агентов
    Запускаются быстро и проверяют базовую функциональность
    """
    
    def test_code_generator_agent(self):
        """Проверить базовую работу генератора кода"""
        agent = CodeGeneratorAgent()
        
        # Простой запрос
        result = agent.generate("Create a function that adds two numbers")
        
        # Проверки
        assert result is not None, "Agent returned None"
        assert "function" in result.lower(), "Result doesn't contain function"
        assert len(result) > 50, "Result is too short"
        
        print("✓ Code Generator Agent smoke test passed")
    
    def test_reviewer_agent(self):
        """Проверить работу ревьюера"""
        agent = CodeReviewerAgent()
        
        test_code = """
def add(a, b):
    return a + b
"""
        
        result = agent.review(test_code)
        
        assert "quality_score" in result, "No quality score in result"
        assert 1 <= result["quality_score"] <= 10, "Invalid quality score"
        
        print("✓ Code Reviewer Agent smoke test passed")
    
    def test_agent_memory(self):
        """Проверить работу памяти агентов"""
        agent = CodeGeneratorAgent()
        
        # Добавить что-то в память
        agent.memory.add("test_key", "test_value")
        
        # Получить из памяти
        value = agent.memory.get("test_key")
        
        assert value == "test_value", "Memory doesn't work correctly"
        
        print("✓ Agent Memory smoke test passed")
    
    def test_tool_calling(self):
        """Проверить tool calling функциональность"""
        agent = FunctionCallingAgent()
        
        # Выполнить задачу которая требует tool calling
        result = agent.execute("Fetch recipe with ID 123 and update inventory")
        
        assert result is not None, "Tool calling failed"
        
        print("✓ Tool Calling smoke test passed")
    
    def run_all_smoke_tests(self):
        """Запустить все smoke-тесты"""
        tests = [
            self.test_code_generator_agent,
            self.test_reviewer_agent,
            self.test_agent_memory,
            self.test_tool_calling
        ]
        
        passed = 0
        for test in tests:
            try:
                test()
                passed += 1
            except AssertionError as e:
                print(f"✗ {test.__name__} failed: {str(e)}")
        
        print(f"\n{passed}/{len(tests)} smoke tests passed")
        return passed == len(tests)

# Использование
smoke_tests = AgentSmokeTests()
if smoke_tests.run_all_smoke_tests():
    print("\n✓ All systems go!")
else:
    print("\n✗ Some tests failed")
```

---

## 11. Обработка ошибок и стратегии восстановления

### 11.1 Multi-Tier Error Recovery

```python
class ErrorRecoverySystem:
    """
    Многоуровневая система восстановления от ошибок.
    Уровни: retry → fallback → escalation → manual intervention
    """
    
    def __init__(self):
        self.error_history = []
        self.recovery_strategies = {}
    
    def execute_with_recovery(self, agent, task, max_attempts=3):
        """Выполнить задачу с многоуровневым восстановлением"""
        
        attempt = 0
        last_error = None
        
        while attempt < max_attempts:
            try:
                print(f"Attempt {attempt + 1}/{max_attempts}")
                result = agent.execute(task)
                return result
                
            except RateLimitError as e:
                # Уровень 1: Rate Limiting Error
                print("Rate limit hit, waiting...")
                wait_time = 2 ** attempt  # Exponential backoff
                time.sleep(wait_time)
                attempt += 1
                last_error = e
                
            except ValidationError as e:
                # Уровень 2: Validation Error
                print("Validation failed, trying recovery strategy...")
                task = self._apply_recovery_strategy(task, e)
                attempt += 1
                last_error = e
                
            except TimeoutError as e:
                # Уровень 3: Timeout
                print("Timeout, trying with different agent...")
                agent = self._select_fallback_agent(agent, task)
                attempt += 1
                last_error = e
                
            except Exception as e:
                # Уровень 4: Unknown Error
                print(f"Unknown error: {str(e)}")
                self.error_history.append({
                    "error": str(e),
                    "type": type(e).__name__,
                    "task": task,
                    "timestamp": time.time()
                })
                attempt += 1
                last_error = e
        
        # Если все попытки исчерпаны
        raise RuntimeError(f"Failed after {max_attempts} attempts. Last error: {str(last_error)}")
    
    def _apply_recovery_strategy(self, task, error):
        """Применить стратегию восстановления к задаче"""
        error_type = type(error).__name__
        
        if error_type in self.recovery_strategies:
            return self.recovery_strategies[error_type](task, error)
        
        # Стратегия по умолчанию: разбить задачу на подзадачи
        return self._decompose_task(task)
    
    def _select_fallback_agent(self, primary_agent, task):
        """Выбрать резервного агента"""
        # Использовать другой агент или модель
        return FallbackAgent()
    
    def _decompose_task(self, task):
        """Разбить задачу на более простые подзадачи"""
        return {
            "subtasks": [
                {"name": "part_1", "description": "..."},
                {"name": "part_2", "description": "..."}
            ]
        }
```

---

## 12. Шаблоны рабочих процессов

### 12.1 Workflow для Code Generation & Review

```yaml
# code-generation-workflow.yaml
name: "Code Generation & Review"
description: "Generate code and ensure quality through reviews and tests"

stages:
  - name: "Analysis"
    agent: "analyzer"
    task: "Analyze requirements and break into implementation plan"
    input:
      - user_requirements
    output:
      - implementation_plan
      - test_requirements
  
  - name: "Code Generation"
    agent: "generator"
    task: "Generate code based on plan"
    input:
      - implementation_plan
    output:
      - generated_code
    config:
      model: "gpt-4"
      temperature: 0.2
  
  - name: "Code Review"
    agent: "reviewer"
    task: "Review code for quality and issues"
    input:
      - generated_code
    output:
      - review_report
    config:
      quality_threshold: 7
      if_fails_retry: true
  
  - name: "Test Generation"
    agent: "tester"
    task: "Generate comprehensive tests"
    input:
      - generated_code
      - test_requirements
    output:
      - test_suite
  
  - name: "Test Execution"
    agent: "executor"
    task: "Run tests and report results"
    input:
      - test_suite
      - generated_code
    output:
      - test_results
    config:
      stop_on_failure: true
  
  - name: "Documentation"
    agent: "documenter"
    task: "Generate documentation"
    input:
      - generated_code
      - implementation_plan
    output:
      - documentation

dependencies:
  - "Code Generation" depends_on "Analysis"
  - "Code Review" depends_on "Code Generation"
  - "Test Generation" depends_on "Code Generation"
  - "Test Execution" depends_on "Test Generation"
  - "Documentation" depends_on "Code Generation"

error_handling:
  on_review_fail: "retry_generation"
  on_test_fail: "retry_generation"
  max_retries: 3
```

---

## 13. Практические примеры и фрагменты кода

### 13.1 Полный пример: Генерация рецепта с проверкой качества

```python
class RecipeGenerationPipeline:
    """Полный пайплайн генерации рецепта"""
    
    def __init__(self):
        self.generator = CodeGeneratorAgent()
        self.reviewer = CodeReviewerAgent()
        self.memory = AgentMemoryWithVectors("recipe-generator")
        self.rag = RAGPipeline()
    
    def generate_recipe(self, ingredients, cuisine_type, servings):
        """Сгенерировать рецепт с проверкой качества"""
        
        # Этап 1: Получить похожие рецепты из памяти
        similar_recipes = self.memory.recall_similar_interactions(
            f"{cuisine_type} recipe with {ingredients}"
        )
        
        # Этап 2: Подготовить контекст с похожими рецептами
        context = self._prepare_context(similar_recipes, ingredients, cuisine_type)
        
        # Этап 3: Генерировать новый рецепт
        prompt = f"""
Generate a {cuisine_type} recipe using these ingredients: {ingredients}
Servings: {servings}

Context of similar recipes:
{context}

Requirements:
- Include step-by-step instructions
- List nutritional information
- Suggest plating and presentation
- Include chef notes
"""
        
        recipe = self.generator.generate(prompt)
        
        # Этап 4: Проверить качество рецепта
        review = self.reviewer.review(recipe)
        
        if review['quality_score'] < 7:
            # Улучшить если качество низко
            recipe = self.generator.improve(
                f"Improve this recipe addressing these issues: {review['issues']}\n\n{recipe}"
            )
        
        # Этап 5: Запомнить в памяти
        self.memory.remember_interaction({
            "task": f"Generate {cuisine_type} recipe",
            "solution": recipe,
            "outcome": "success",
            "success": True,
            "timestamp": time.time()
        })
        
        return {
            "recipe": recipe,
            "quality_score": review['quality_score'],
            "similar_recipes_used": len(similar_recipes)
        }
    
    def _prepare_context(self, similar_recipes, ingredients, cuisine):
        """Подготовить контекст из похожих рецептов"""
        context = []
        for recipe in similar_recipes[:3]:
            context.append(f"- {recipe.page_content[:200]}...")
        return "\n".join(context)
```

---

## 14. Метрики, мониторинг и аналитика

### 14.1 Agent Performance Monitoring

```python
class AgentPerformanceMonitor:
    """
    Мониторить производительность агентов и сохранять метрики
    """
    
    def __init__(self):
        self.metrics = defaultdict(list)
        self.log_file = "logs/agent-performance.json"
    
    def track_execution(self, agent_name, task_type, duration, success, tokens_used):
        """Отследить выполнение задачи агентом"""
        
        metric = {
            "agent": agent_name,
            "task_type": task_type,
            "duration": duration,
            "success": success,
            "tokens_used": tokens_used,
            "timestamp": time.time(),
            "cost": tokens_used * 0.0001  # Приблизительно
        }
        
        self.metrics[agent_name].append(metric)
        self._save_metric(metric)
    
    def get_agent_statistics(self, agent_name, period_days=7):
        """Получить статистику агента за период"""
        
        cutoff_time = time.time() - (period_days * 86400)
        relevant_metrics = [
            m for m in self.metrics[agent_name]
            if m["timestamp"] > cutoff_time
        ]
        
        if not relevant_metrics:
            return None
        
        success_rate = sum(1 for m in relevant_metrics if m["success"]) / len(relevant_metrics)
        avg_duration = sum(m["duration"] for m in relevant_metrics) / len(relevant_metrics)
        total_tokens = sum(m["tokens_used"] for m in relevant_metrics)
        total_cost = sum(m["cost"] for m in relevant_metrics)
        
        return {
            "agent": agent_name,
            "period_days": period_days,
            "success_rate": success_rate,
            "avg_duration": avg_duration,
            "total_tokens": total_tokens,
            "total_cost": total_cost,
            "task_count": len(relevant_metrics)
        }
    
    def _save_metric(self, metric):
        """Сохранить метрику в лог"""
        with open(self.log_file, "a") as f:
            f.write(json.dumps(metric) + "\n")

# Использование
monitor = AgentPerformanceMonitor()

# В процессе выполнения
start_time = time.time()
result = agent.execute(task)
duration = time.time() - start_time

monitor.track_execution(
    agent_name="code_generator",
    task_type="generate_function",
    duration=duration,
    success=True,
    tokens_used=result.usage.total_tokens
)

# Получить статистику
stats = monitor.get_agent_statistics("code_generator")
print(f"Generator stats (last 7 days): {stats}")
```

---

## Заключение

Эта инструкция покрывает все аспекты продвинутого мультиагентного программирования с нейросетями:

✓ **Архитектура**: Многоуровневая память, MCP протоколы, оркестрация
✓ **Управление контекстом**: RAG, буферизация, сжатие, long context оптимизация
✓ **Структура проекта**: Полная организация файлов для мультиагентных систем
✓ **Сессии и восстановление**: Checkpointing, state management, recovery
✓ **Оптимизация токенов**: Token budgeting, strategic truncation, format optimization
✓ **Промпт-инжиниринг**: Role-based prompting, CoT, self-criticism
✓ **Оркестрация**: Coordinator pattern, dynamic routing, task decomposition
✓ **Поиск и память**: Vector DB, RAG, semantic search
✓ **Инструменты**: Tool registry, function calling, dynamic selection
✓ **Качество**: Тестирование, отладка, smoke-тесты, self-correction
✓ **Обработка ошибок**: Multi-tier recovery, graceful degradation
✓ **Мониторинг**: Performance tracking, metrics, analytics

Используй эту инструкцию как основу для создания любых новых мультиагентных проектов с KiloCode, GPT, Gemini, Claude или облачными платформами.

---

**Версия: 1.0 (November 2025)**
**Последнее обновление: 2025-11-11**

[139][140][141][142][143][144][145][146][147][148][149][150][151][152][153][154][155][156][157][158][159][160][161][162][163][164][165][166][167][168][169][170][171][172][173][174][175]
