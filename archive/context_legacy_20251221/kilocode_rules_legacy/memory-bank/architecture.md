# Architecture Context

## High-Level Design
Chef's Mind AI follows a modular, multi-agent architecture.

### Components
1.  **Orchestrator (`server/agents/orchestrator.ts`):**
    - Receives user input.
    - Classifies intent.
    - Routes to the appropriate Agent.
2.  **Agents:**
    - **Chef:** Culinary logic.
    - **Accountant:** Financial logic.
    - **Researcher:** External data search.
    - **Media Studio:** Content generation.
    - **QA-Gate:** Output validation.
3.  **Services:**
    - Shared services for DB access, Media APIs, Google Integration.
4.  **Data Layer:**
    - PostgreSQL managed via Drizzle ORM.

## Data Flow
User Input -> API -> Orchestrator -> Agent -> Service -> DB/External API -> QA-Gate -> Response

## Routing
Routing is based on intent classification. See `docs/AGENT_ROUTING_DESIGN.md` for details.
