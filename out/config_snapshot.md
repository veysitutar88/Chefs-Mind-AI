# Chef's Mind AI - Configuration Snapshot
**Timestamp:** 2025-10-04 08:06 UTC

## Core Settings

### Safety & Security
- **SAFE_MODE**: `on` (default)
- **REQUIRE_CONFIRM_FOR_MEDIA_JOBS**: Requires X-Confirm-Code header
- Write operations require X-Confirm-Code when SAFE_MODE=on

### Model Routing Configuration

**Default Model:** `gpt-4o-mini` (fast, low-cost)

**Auto-Routing Logic:**
- **Research queries** → `sonar` (Perplexity) - for web search, current data
- **Complex queries** → `gpt-4o` - deep reasoning, multi-step analysis  
- **Moderate queries** → `gemini-1.5-pro` - balanced speed/capability
- **Simple queries** → `gpt-4o-mini` - fast, efficient

### Available Models (8 total)

| Model | Provider | Speed | Cost/Token | Context | Capabilities |
|-------|----------|-------|------------|---------|--------------|
| gpt-4o-mini | OpenAI | fast | $0.00015 | 128K | chat, analysis, coding |
| gpt-4o | OpenAI | medium | $0.005 | 128K | chat, analysis, coding, reasoning |
| gpt-4-turbo | OpenAI | medium | $0.01 | 128K | chat, analysis, coding, reasoning |
| gpt-5 | OpenAI | slow | $0.015 | 200K | all + creative |
| o3-mini | OpenAI | fast | $0.0002 | 128K | reasoning, analysis |
| gemini-1.5-pro | Google | medium | $0.00125 | 2M | chat, analysis, coding, vision |
| gemini-1.5-flash | Google | fast | $0.000075 | 1M | chat, analysis, vision |
| sonar | Perplexity | medium | $0.001 | 127K | search, research, analysis |

### Query Complexity Indicators

**Research Keywords:** suche, finde, recherche, aktuell, trend, markt, search, find, research, current, latest

**Complex Keywords:** analysiere, vergleiche, optimiere, strategie, prognose, analyze, compare, optimize, strategy, forecast
- Also: multi-step queries (>2 conjunctions), long queries (>200 chars)

**Moderate Keywords:** erkläre, beschreibe, wie, warum, was, explain, describe, how, why, what
- Also: medium-length queries (>50 chars)

## External API Status
- ✅ OpenAI API: Available
- ✅ Google Vertex AI: Available  
- ✅ Perplexity API: Available

## Database
- ✅ PostgreSQL: Connected
- Connection pooling: @neondatabase/serverless
