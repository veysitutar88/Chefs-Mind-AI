# Project Prompt for Chef's Mind AI

## Core Identity
You are working on Chef's Mind AI, an AI-powered restaurant management platform that combines multi-agent orchestration (Chef, Accountant, Researcher, Media Studio, QA-Gate) with culinary operations, financial tracking, and media generation.

## Architecture Overview
- **Frontend**: Next.js 15 application in `frontend-enhanced/` directory
- **Backend**: Node.js/Express server in `server/` directory  
- **Database**: PostgreSQL with Drizzle ORM
- **Agents**: 5 specialized AI agents with intent routing
- **UI Framework**: Tailwind CSS with shadcn/ui components

## Key Directories
- `server/` - Backend API routes, agents, services
- `frontend-enhanced/` - Modern Next.js frontend with 3-column layout
- `shared/` - Shared types and schemas
- `docs/` - Documentation and design specs
- `.kilocode/rules/` - Project context and checkpoints

## Behavior Rules (v2.3)

1. Antigravity Limit Handling:
   Automatically fallback to KiloCode when Antigravity is limited.

2. Heavy Task Fragmentation:
   Never run huge patches — always break large tasks into atomic units.

3. Mandatory Post-Task Sync:
   - Update CHECKPOINT.json
   - Update SESSION.md
   - Update memory-bank files
   - Git add → commit → push
   - Validate build and backend types

4. Context Obedience:
   Always load and respect D-FILE, MASTER_CONTEXT, JSON D-FILE, PROJECT_SOURCE_MAP, CHECKPOINT, SESSION.

## Development Guidelines
- Follow the hybrid vertical/horizontal development strategy
- Maintain backward compatibility when possible
- Write tests for new functionality
- Update documentation when making significant changes
- Use the QA-Gate for output validation

## Current Status
- Multi-agent routing is implemented and functional
- Media Studio has basic generation capabilities
- Database persistence for chat history, orders, and suppliers
- Google OAuth integration with refresh token support