# Project Patterns

> **Canonical Source:** `MASTER_CONTEXT_v2.1.6.mdown`

## Architectural Patterns
- **Orchestrator Pattern:** Central entry point (`server/agents/orchestrator.ts`) classifies intent and routes to specific agents.
- **Service Layer:** Business logic resides in `server/services/` (e.g., `enhanced-media.ts`, `db.ts`), separated from routes.
- **Agent Pattern:** Each agent has a specific persona and toolset.
- **Repository Pattern:** Drizzle ORM used for data access abstraction.

## Development Patterns
- **Blocks:** Development is organized into sequential Blocks (0-5).
- **Checkpoints:** State is tracked in `CHECKPOINT.json` and `MASTER_CONTEXT`.
- **Manifest:** `MASTER_MANIFEST.json` acts as the file system source of truth.

## UI Patterns
- **Three-Column Layout:** Navigation (Agents) - Interaction (Chat) - Tools (Context).
- **Agent Workspaces:** Switching agents switches the chat history context (similar to "Projects").
- **Universal Chat:** Default entry point that routes to agents dynamically.

## Error Handling
- **QA-Gate:** Validates outputs.
- **Safe Mode:** User confirmation for critical actions.
- **Graceful Degradation:** System handles missing credentials (e.g., Vertex AI) without crashing.
