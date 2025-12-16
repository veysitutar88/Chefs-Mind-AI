# ADR-0004: Media Generation Pipeline

**Date:** 2025-11-27  
**Status:** Active  
**Deciders:** Core Team, Media Lead

---

## Context

Chef's Mind AI needs to generate rich visual media for:

- **Menu Items:** High-quality images of dishes for digital menus
- **Recipe Visualization:** Step-by-step cooking images
- **Marketing Materials:** Social media posts, promotional content
- **Presentation Aids:** Visual aids for chef training and demonstrations

### Requirements

1. **Multi-Model Support:** Use different AI models (Gemini, DALL-E, Stable Diffusion, etc.) based on use case
2. **Quality Control:** Ensure generated images meet quality standards
3. **Cost Management:** Balance quality vs cost (premium models are expensive)
4. **Customization:** Allow format selection (aspect ratio, resolution, style)
5. **Integration:** Seamlessly integrate with Chef Agent and menu creation flow
6. **Audit Trail:** Log all media generation requests for cost tracking and compliance

---

## Decision

**We will implement a dedicated Media Generation Pipeline with the following architecture:**

### Components

1. **Media Agent** (`server/graph/nodes/media.ts`)
   - LangGraph node for handling media generation requests
   - Integrates with Chef Agent for context-aware image prompts
   - Manages prompt engineering and model selection

2. **Media Service** (`server/services/mediaService.ts`)
   - Business logic layer for media operations
   - Handles provider selection, request queuing, result storage
   - Interfaces with multiple AI providers

3. **Media Providers** (`server/lib/mediaProviders.ts`)
   - Abstraction layer for different AI providers:
     - **Google Gemini:** Text-to-image via Imagen
     - **OpenAI DALL-E 3:** High-quality realistic images
     - **Anthropic Claude (future):** Image understanding + generation
     - **Stable Diffusion (self-hosted, future):** Cost-effective alternative
   - Unified interface for generate/upscale/edit operations

4. **Media Config** (`server/config/media-config.ts`)
   - Model selection rules (default model, fallback models)
   - Quality presets (draft, standard, premium)
   - Format options (aspect ratios, resolutions, styles)

5. **Media Routes** (`server/routes/media.ts`)
   - API endpoints: `/api/media/generate`, `/api/media/models`, `/api/media/upscale`
   - Request validation and rate limiting
   - Response streaming for long-running generations

6. **Media UI Controls** (`frontend-enhanced/src/components/ui/MediaModelSelector.tsx`)
   - Model switcher, format selector, quality selector
   - Upscale button, seed input for reproducibility
   - Progress indicators for async generation

### Workflow

```
1. User requests image (e.g., "Generate image for Pasta Carbonara")
   ↓
2. Router directs to Media Agent
   ↓
3. Media Agent enriches prompt using Chef context
   ↓
4. Media Service selects provider based on config
   ↓
5. Provider generates image (async task)
   ↓
6. Quality control validates output (safety, relevance)
   ↓
7. Image stored in storage layer (local/S3)
   ↓
8. URL returned to user, logged in audit trail
```

---

## Consequences

### Advantages

✅ **Flexibility:** Easy to add new providers or switch models  
✅ **Cost Optimization:** Select cheaper models for drafts, premium for final output  
✅ **Extensibility:** Can add video generation, image editing, upscaling  
✅ **Traceability:** All generations logged with prompts, models, costs  
✅ **User Control:** Users can choose models, formats, quality levels  
✅ **Integration:** Seamlessly works with Chef Agent for context-aware prompts  

### Disadvantages

⚠️ **Operational Cost:** AI image generation is expensive at scale  
⚠️ **Latency:** Generations can take 10-60 seconds depending on model  
⚠️ **Complexity:** Multi-provider abstraction adds code complexity  
⚠️ **Quality Variance:** Different models produce different styles/quality  
⚠️ **Rate Limits:** Providers have rate limits, need queuing/throttling  

### Risks

🔴 **Cost Overruns:** Uncontrolled usage can lead to high API bills  
🔴 **Provider Outages:** If a provider is down, fallback logic must work  
🔴 **NSFW Content:** Generated images may violate content policies (need filtering)  
🟡 **Prompt Injection:** Malicious prompts could generate inappropriate content  
🟡 **Storage Costs:** Generated images need storage (local disk, S3, CDN)  

---

## Alternatives Considered

### Alternative 1: Single Provider (OpenAI DALL-E Only)

- ✅ Simpler implementation
- ❌ Vendor lock-in, no fallback
- ❌ Higher cost per image

### Alternative 2: Self-Hosted Stable Diffusion

- ✅ Lower per-image cost
- ❌ Requires GPU infrastructure
- ❌ Maintenance overhead, quality variance

### Alternative 3: No Media Generation (Stock Photos Only)

- ✅ No operational cost
- ❌ Poor user experience, generic content
- ❌ Doesn't differentiate product

### Alternative 4: Third-Party Media API (Pexels, Unsplash)

- ✅ Free or low-cost stock images
- ❌ Not customizable, may not match dish descriptions
- ❌ Licensing restrictions

---

## Status

**Active** — Media generation pipeline is implemented and in production use.

### Implementation Notes

**Current Providers:**

- ✅ Google Gemini (Imagen 3)
- ✅ OpenAI DALL-E 3
- 🔄 Stable Diffusion (planned)

**Model Selection Rules:**

- **Default:** Gemini Imagen 3 (good balance of cost/quality)
- **High-Quality:** DALL-E 3 for premium menu images
- **Draft Mode:** Lower resolution Gemini for prototyping

**Cost Controls:**

- Rate limiting: 10 generations per user per minute
- Monthly budget alerts in metrics dashboard
- Admin approval required for bulk generation jobs

**Audit Logging:**

- All generations logged to `media_generations` table
- Fields: `user_id`, `prompt`, `model`, `cost_estimate`, `timestamp`, `image_url`
- Monthly cost reports generated via `/api/reports/media-costs`

### Documentation Needed

📌 **TODO:** Document media provider setup (API keys, configuration)  
📌 **TODO:** Create cost estimation guide (per model pricing)  
📌 **TODO:** Document safety filters and content moderation policies  
📌 **TODO:** Create media generation best practices (prompt engineering)  

### Next Review

- **When:** After reaching 10,000 generations or monthly cost exceeds budget
- **Trigger:** New provider becomes available or pricing changes significantly
- **Action:** Re-evaluate provider mix, optimize prompts, implement caching
