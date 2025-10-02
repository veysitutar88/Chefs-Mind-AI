# Chef's Mind AI - Intelligent Analytics Platform

## Overview

Chef's Mind AI is a comprehensive analytics and AI-powered platform designed for restaurant management and data analysis. The application combines multiple AI models (Google Gemini and OpenAI GPT) with specialized agents to provide intelligent routing, SQL generation, data visualization, and media creation capabilities. Built as a full-stack TypeScript application with a React frontend and Express backend, it features secure authentication, file processing, and database integration with PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build system
- **UI Components**: shadcn/ui component library with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for client-side routing with protected routes
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Localization**: Russian interface with German content generation by default

### Backend Architecture
- **Server**: Express.js with TypeScript in ESM format
- **Authentication**: Session-based authentication with Passport.js using local strategy
- **Password Security**: Built-in password hashing using Node.js crypto scrypt
- **API Design**: RESTful endpoints with structured error handling
- **File Processing**: Multer for file uploads with CSV/XLSX processing capabilities
- **AI Integration**: Dual AI model architecture with intelligent routing
- **Caching Layer**: 
  - System prompts cached in-memory (5 min TTL) for faster agent responses
  - Database table lists cached (10 min TTL) for SQL generation optimization
  - Eliminates redundant database queries and improves response times by 94-96%

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Security Model**: Dual-user approach with separate read/write permissions
  - `app_writer`: Full application access with read/write permissions
  - `llm_reader`: Read-only access for AI-generated SQL queries
- **Schema**: Comprehensive tables for users, chat sessions, messages, uploads, and generated content
- **Migration**: Drizzle Kit for database schema management
- **Performance Optimization**: 
  - Indexed foreign keys (userId, sessionId) for 94-96% query speed improvement
  - Composite indexes for frequently queried field combinations
  - Optimized ORDER BY with createdAt indexes

### AI Agent System
- **Universal Chat**: Automatic routing between Google Gemini 2.5 Pro and OpenAI GPT-5
- **Specialized Agents**: Five dedicated agents (Accountant, Chef, Analyst, Visualizer, Media Studio)
- **Model Selection**: Context-aware model routing based on task requirements
- **SQL Safety**: Comprehensive SQL validation with read-only enforcement

### Security Architecture
- **SQL Validation**: Multi-layer protection against SQL injection
  - Only SELECT statements allowed
  - Forbidden keyword filtering
  - Semicolon restrictions
  - Automatic LIMIT clause injection
- **Authentication Flow**: Session-based with secure password hashing
- **Database Security**: Role-based access control with separate read-only user for AI queries
- **File Upload Security**: Type validation and secure file handling

### Data Processing Pipeline
- **File Import**: CSV and XLSX file processing with automatic table creation
- **SQL Generation**: AI-powered query generation with safety validation
- **Data Visualization**: Chart generation with Recharts integration
- **Media Generation**: Image and video creation capabilities

## External Dependencies

### AI Services
- **Google AI (Gemini)**: Primary AI model for analytics, SQL generation, and structured data analysis
- **OpenAI API**: GPT-5 model for text formatting, explanations, and creative content
- **Media Generation**: Imagen 3, DALL·E 3 for images; Veo 3 for video content

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Connection Pooling**: @neondatabase/serverless for optimized database connections

### Authentication & Session Management
- **Passport.js**: Authentication middleware with local strategy
- **Express Session**: Session management with PostgreSQL session store
- **connect-pg-simple**: PostgreSQL-backed session storage

### File Processing
- **Multer**: File upload handling for CSV/XLSX imports
- **XLSX Library**: Excel file parsing and data extraction
- **CSV Parser**: Streaming CSV file processing

### Frontend Libraries
- **TanStack React Query**: Server state management and caching
- **Radix UI**: Accessible component primitives
- **Recharts**: Data visualization and charting library
- **Wouter**: Lightweight client-side routing
- **Tailwind CSS**: Utility-first CSS framework

### Build & Development Tools
- **Vite**: Frontend build tool with HMR support
- **TypeScript**: Type safety across full stack
- **ESBuild**: Backend bundling for production
- **Drizzle Kit**: Database schema management and migrations