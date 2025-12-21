# Project Overview

> **Canonical Source:** `MASTER_CONTEXT_v2.1.6.mdown`
> **Version:** v2.1.6
> **Updated:** 2025-11-23

## Chef's Mind AI
**Chef’s Mind AI** is a comprehensive AI platform for restaurants, designed to integrate culinary management, financial analytics, research, and media generation into a single conversational interface.

### Mission
To provide the chef and team with a **unified interface** where everything—from recipes and cost calculations to promotional photos—is available through dialogue with AI.

### Core Components

#### 1. Multi-Agent System
- **Chef:** Recipes, menu planning, prep lists.
- **Accountant:** Orders, suppliers, cost analysis.
- **Researcher:** Trends, equipment, external data.
- **Media Studio:** Food photography, marketing videos.
- **QA-Gate:** Output validation and safety.

#### 2. Architecture
- **Backend:** Node.js + Express + TypeScript (`server/`).
- **Frontend:** Next.js + React + Tailwind + shadcn/ui (`frontend-enhanced/`).
- **Database:** PostgreSQL + Drizzle ORM.

#### 3. Key Features
- **Universal Chat:** Intelligent routing to specialized agents.
- **Media Studio:** Generative AI for marketing assets (Imagen, Veo, DALL·E).
- **Order Management:** Supplier tracking and ordering.
- **Calendar Integration:** Event planning.

### Development Status (v2.1.6)
- **Completed:** Blocks 0-3 (Infra, MVP Flow, Routing, Persistence).
- **In Progress:** Block 4 (Media Studio / UI Integration).
- **Planned:** Block 5 (Analytics & Polish).
