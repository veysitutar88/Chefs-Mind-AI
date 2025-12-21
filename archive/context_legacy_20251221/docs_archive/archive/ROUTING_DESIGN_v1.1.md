Status: supporting / historical document. Canonical routing is defined in AGENT_ROUTING_DESIGN.md and MASTER_CONTEXT_v2.1.6.

# Chef's Mind AI — Routing Design v1.1

**Version:** 1.1  
**Date:** November 19, 2025  
**Based on:** ROUTING_DESIGN_FULL.md  
**Changes:** Updated agent names to match UI Spec v1.1

---

## 1. Agent Names — Official Nomenclature

| Internal ID | Display Name | UI Label | Icon |
|-------------|--------------|----------|------|
| `chef` | AI Sous-Chef | AI Sous-Chef | 👨‍🍳 |
| `accountant` | AI Brain-Chef | AI Brain-Chef | 🧮 |
| `researcher` | AI Research | AI Research | 🔍 |
| `media` | AI Media-Studio | AI Media-Studio | 🎨 |
| `qa` | QA-Gate | (hidden) | — |

**Note:** QA-Gate is not displayed in UI — it's an internal validation layer.

---

## 2. Agent Descriptions

### 2.1. Universal Chat
**Purpose:** Main entry point for all user interactions.

**Characteristics:**
- Not a separate agent, but an interface to the orchestrator
- Automatically routes to appropriate agent based on intent
- Supports document uploads (receipts, invoices, images)
- Maintains conversation context for multi-turn dialogues

**Database Access:**
- Read: all tables (for context analysis)
- Write: `chat_sessions`, `chat_messages`

---

### 2.2. AI Sous-Chef
**Purpose:** Kitchen operations specialist.

**Responsibilities:**
- Recipe creation and adaptation
- Menu planning (daily, weekly, seasonal)
- Inventory management and usage
- Portion calculations and yields
- Technical specifications (tech cards)
- Service preparation (mise en place)
- Cooking technique guidance

**Typical Tasks:**
- "Create a weekly menu from available ingredients"
- "How to cook borscht for 50 portions?"
- "What can I make with leftover chicken and vegetables?"
- "Adapt this recipe for vegan version"
- "Calculate dish yield for 100-person banquet"

**Database Access:**
- Read: `recipes`, `ingredients`, `inventory`, `menu_items`, `suppliers`
- Write: `recipes`, `menu_items`, `production_plans`


---

### 2.3. AI Brain-Chef
**Purpose:** Financial analyst and accounting specialist.

**Responsibilities:**
- Food cost calculations
- Order and supplier management
- Pricing and margin analysis
- Cost control and budgeting
- Financial reports and analytics
- Purchase planning
- Inventory and write-offs

**Typical Tasks:**
- "Calculate food cost for this recipe"
- "What's the profit on this dish at 500 RUB price?"
- "Create supplier order for the week"
- "Show top 5 most expensive ingredients"
- "How much did we spend on meat this month?"

**Database Access:**
- Read: `recipes`, `ingredients`, `suppliers`, `orders`, `inventory`, `menu_items`, `financial_reports`
- Write: `orders`, `suppliers`, `financial_reports`, `cost_calculations`

---

### 2.4. AI Research
**Purpose:** Market researcher and external analyst.

**Responsibilities:**
- Restaurant industry trend research
- Competitor and market analysis
- New supplier and ingredient discovery
- Equipment and technique research
- Statistics and industry data
- Recipe and culinary technique search
- Marketing research

**Typical Tasks:**
- "What are current food industry trends?"
- "Find organic vegetable suppliers in Moscow"
- "Analyze competitor menus in our area"
- "What equipment is best for sous-vide?"
- "Statistics on vegan dish popularity in 2025"

**Database Access:**
- Read: `suppliers`, `market_data`, `competitors`, `trends`
- Write: `research_reports`, `market_data`
- External: Integration with search APIs (Perplexity-style)

---

### 2.5. AI Media-Studio
**Purpose:** Visual content generation specialist.

**Responsibilities:**
- Dish image generation (food photography)
- Recipe video and promo creation
- Prompt enhancement (Prompt Enhancer)
- Media asset library management
- Menu and marketing material design
- Content adaptation for different platforms

**Typical Tasks:**
- "Create Instagram photo of this dish"
- "Generate video of pasta carbonara preparation"
- "Make menu image — steak with vegetables"
- "Create promo banner for summer menu"
- "Design visuals for delivery"

**Database Access:**
- Read: `recipes`, `menu_items`, `media_assets`
- Write: `media_assets`, `media_jobs`
- External: Integration with Imagen, Veo, DALL·E, other generative models

---

### 2.6. QA-Gate
**Purpose:** Internal validation layer for quality control.

**Responsibilities:**
- Response adequacy and correctness checks
- AI model hallucination protection
- Data validation (prices, quantities, calculations)
- Standards and rules compliance
- Automatic correction of obvious errors
- Response quality scoring

**Characteristics:**
- Not displayed in UI as separate agent
- Works as middleware for all responses
- Can block or correct other agents' responses
- Logs all checks for audit

**Typical Checks:**
- Mathematical calculations (food cost, portions)
- Data realism (prices, cooking times)
- Recipe compliance with culinary standards
- Safety (allergens, temperature regimes)
- Database consistency

**Database Access:**
- Read: all tables (for validation)
- Write: `qa_logs`, `corrections_history`

---

## 3. Intent → Agent Routing Table

| Intent Class | Primary Agent | Secondary Agent(s) | Description |
|--------------|---------------|-------------------|-------------|
| **cooking** | AI Sous-Chef | AI Brain-Chef (for calculations) | Recipes, menu, cooking techniques, production planning |
| **menu** | AI Sous-Chef | AI Brain-Chef (for pricing) | Menu creation, seasonal/event adaptation |
| **inventory** | AI Sous-Chef | AI Brain-Chef (for orders) | Working with stock, what to cook from available |
| **finance** | AI Brain-Chef | AI Sous-Chef (for recipes) | Food cost, profit, financial calculations |
| **costing** | AI Brain-Chef | AI Sous-Chef (for ingredients) | Dish costing, food cost |
| **pricing** | AI Brain-Chef | AI Research (for market) | Pricing, margin analysis |
| **orders** | AI Brain-Chef | — | Supplier orders, purchase management |
| **reports** | AI Brain-Chef | — | Financial reports, cost analytics |
| **research** | AI Research | — | Information search, trends, market analysis |
| **suppliers** | AI Research | AI Brain-Chef (for orders) | Finding new suppliers |
| **market** | AI Research | — | Competitor analysis, marketing research |
| **media** | AI Media-Studio | AI Sous-Chef (for dish context) | Image and video generation |
| **image** | AI Media-Studio | — | Creating dish photos |
| **video** | AI Media-Studio | — | Creating video content |
| **qa** | QA-Gate | — | Quality questions, definitions, general queries |

### Mixed-Intent Handling

When a request contains multiple intents (e.g., "menu + profit"), the orchestrator:

1. **Identifies all intents** in the request with weights
2. **Selects Primary Agent** by highest weight
3. **Creates sub-tasks** for Secondary Agent(s)
4. **Coordinates execution:**
   - Primary Agent receives main request
   - Secondary Agent(s) perform supporting tasks
   - Primary Agent combines results into final response
5. **QA-Gate validates** final response for consistency

**Example:**
- Request: "Create weekly menu and calculate profit"
- Intent 1: `cooking/menu` (weight 2.0) → AI Sous-Chef
- Intent 2: `finance/costing` (weight 2.5) → AI Brain-Chef
- Decision: Primary = AI Brain-Chef (higher weight), Secondary = AI Sous-Chef
- Execution:
  1. AI Sous-Chef creates weekly menu
  2. AI Brain-Chef receives menu and calculates profit per dish
  3. AI Brain-Chef forms final response with menu + financials
  4. QA-Gate validates calculation correctness

---

## 4. Orchestrator Logic

### 4.1. Intent Detection

The orchestrator uses **keyword-based classification** with weight coefficients:

**Process:**
1. Input text normalization (lowercase, trim)
2. Check cache of last 3 requests (similarity > 0.8)
3. If not in cache — analyze by keyword patterns
4. Calculate score for each intent:
   - Base score = match count × pattern weight
   - Bonus for multiple matches = count × 0.2
   - Bonus for cooking/finance (domain-specific) = +0.1 to confidence
5. Select intent with maximum score
6. Calculate confidence (0.0 - 1.0)

**Pattern Weights (by priority):**
- Media: 3.0 (maximum — clear generation commands)
- Finance: 2.5 (high — specific financial terms)
- Cooking: 2.0 (medium — broad area)
- Research: 1.8 (medium — research tasks)
- QA: 0.5 (minimum — fallback for undefined requests)

**Example Keywords:**
- Cooking: "recipe", "cook", "ingredients", "menu", "dish"
- Finance: "food cost", "expenses", "profit", "price", "calculation"
- Research: "research", "analysis", "trends", "market", "competitors"
- Media: "create video", "generate image", "photo", "video"
- QA: "what is", "how to choose", "quality", "standard"

### 4.2. Primary Agent Selection

After intent determination, orchestrator:

1. **Maps intent → agent:**
   - `cooking` → AI Sous-Chef
   - `finance` → AI Brain-Chef
   - `research` → AI Research
   - `media` → AI Media-Studio
   - `qa` → QA-Gate

2. **Checks agent availability** (health check)

3. **Passes context:**
   - Dialogue history (last N messages)
   - User metadata (role, access rights)
   - Relevant database data

4. **Sets timeout** for agent response

### 4.3. Sub-task Creation for Secondary Agents

When multiple intents detected:

1. **Request decomposition:**
   - Split into independent subtasks
   - Determine task dependencies

2. **Parallel execution** (where possible):
   - Independent tasks run simultaneously
   - Dependent tasks run sequentially

3. **Result aggregation:**
   - Primary Agent receives Secondary results
   - Forms unified coherent response
   - Resolves data conflicts (if any)

**Decomposition Example:**
- Request: "Create menu with photos and calculate profit"
- Sub-task 1: AI Sous-Chef → create menu
- Sub-task 2: AI Media-Studio → generate photos (depends on Sub-task 1)
- Sub-task 3: AI Brain-Chef → calculate profit (depends on Sub-task 1)
- Order: 1 → (2 || 3) → aggregation

### 4.4. QA-Gate Integration

QA-Gate works as **middleware** and activates:

**Always:**
- After every agent response
- Before sending response to user

**Validation Process:**
1. **Structural validation:**
   - Required fields present
   - Data format correctness

2. **Semantic check:**
   - Response matches question
   - No contradictions
   - Data realism

3. **Domain validation:**
   - For finance: calculation checks, price realism
   - For recipes: correct proportions, cooking times
   - For media: prompt matches result

4. **Scoring (0.0 - 1.0):**
   - 0.9-1.0: excellent response, no corrections
   - 0.7-0.9: good response, possible minor edits
   - 0.5-0.7: acceptable response, corrections needed
   - < 0.5: poor response, blocked or redone

5. **Actions:**
   - Score ≥ 0.7: pass response
   - Score 0.5-0.7: apply auto-correction
   - Score < 0.5: request new response from agent or return fallback

6. **Logging:**
   - All checks recorded in `qa_logs`
   - Corrections saved in `corrections_history`

---

## 5. Routing Examples

### Example 1: "Create weekly menu from leftovers and calculate profit"

**Request Analysis:**
- Keywords: "menu", "weekly", "leftovers", "calculate", "profit"
- Intent 1: `cooking/menu` (weight 2.0, keywords: "menu", "leftovers")
- Intent 2: `finance/costing` (weight 2.5, keywords: "calculate", "profit")
- Confidence: 0.85 (high, clear keywords)

**Routing:**
1. **Primary Agent:** AI Brain-Chef (finance has higher weight 2.5)
2. **Secondary Agent:** AI Sous-Chef (for menu creation)

**Execution Order:**
1. **AI Sous-Chef** (sub-task):
   - DB query: `inventory` (current stock)
   - DB query: `recipes` (available recipes)
   - Creates 7-day menu using available products
   - Returns: dish list with ingredients

2. **AI Brain-Chef** (primary):
   - Receives menu from AI Sous-Chef
   - DB query: `suppliers`, `orders` (ingredient prices)
   - Calculates food cost for each dish
   - DB query: `menu_items` (selling prices)
   - Calculates profit per dish and total for week
   - Forms final response: menu + financial summary

3. **QA-Gate:**
   - Validates calculation math (food cost, profit)
   - Validates price realism
   - Checks all menu dishes can actually be made from leftovers
   - Checks consistency: ingredient quantities in menu ≤ inventory stock
   - Score: 0.92 (high)
   - Action: pass without corrections

**Final Response to User:**
```
[AI Brain-Chef]
Weekly menu from available stock:

Monday: Borscht (cost 120₽, price 350₽, profit 230₽)
Tuesday: Pasta carbonara (cost 80₽, price 280₽, profit 200₽)
...

Total weekly profit: 4,500₽
Food cost: 28%
```

---

### Example 2: "Calculate food cost for these dishes"

**Request Analysis:**
- Keywords: "calculate", "food cost", "dishes"
- Intent: `finance/costing` (weight 2.5)
- Confidence: 0.90 (very high, clear financial request)

**Routing:**
1. **Primary Agent:** AI Brain-Chef
2. **Secondary Agent:** not required (pure financial task)

**Execution Order:**
1. **AI Brain-Chef:**
   - Parses context: which dishes meant (from previous messages or attached file)
   - DB query: `recipes` (dish composition)
   - DB query: `ingredients`, `suppliers` (ingredient prices)
   - Calculates food cost per ingredient
   - Sums food cost for each dish
   - DB query: `menu_items` (selling prices)
   - Calculates food cost percentage of selling price

2. **QA-Gate:**
   - Validates mathematical calculations
   - Validates food cost realism (typically 25-35% for restaurants)
   - If food cost > 40% → warning
   - Checks all recipe ingredients accounted for
   - Score: 0.88
   - Action: pass with minor warning about high food cost

**Final Response to User:**
```
[AI Brain-Chef]
Food cost analysis:

1. Borscht:
   - Cost: 120₽
   - Selling price: 350₽
   - Food cost: 34%

2. Pasta carbonara:
   - Cost: 80₽
   - Selling price: 280₽
   - Food cost: 29%

⚠️ Recommendation: Borscht food cost slightly high (norm 25-30%).
Consider recipe optimization or price increase.
```

---

### Example 3: "Make image for this dish and suggest selling price"

**Request Analysis:**
- Keywords: "make", "image", "dish", "suggest", "price"
- Intent 1: `media/image` (weight 3.0, keywords: "make", "image")
- Intent 2: `finance/pricing` (weight 2.5, keywords: "price")
- Confidence: 0.88

**Routing:**
1. **Primary Agent:** AI Media-Studio (media has highest weight 3.0)
2. **Secondary Agent:** AI Brain-Chef (for price calculation)

**Execution Order:**
1. **AI Sous-Chef** (implicit sub-task):
   - If "this dish" not explicitly defined, requests context
   - DB query: `recipes` (get dish details)
   - Returns: name, ingredients, description

2. **AI Media-Studio** (primary):
   - Receives dish description
   - **Prompt Enhancer:** improves generation prompt
     - Basic: "image of dish X"
     - Enhanced: "Professional food photography of X, plated elegantly on white ceramic, natural lighting, shallow depth of field, garnished with fresh herbs, restaurant quality, 4K"
   - Selects provider (DALL·E, Imagen) based on dish type
   - Creates generation task: `media_jobs`
   - Generates image
   - Saves to DB: `media_assets`

3. **AI Brain-Chef** (secondary, parallel):
   - DB query: `recipes`, `ingredients`, `suppliers`
   - Calculates dish food cost
   - Analyzes market (average prices for similar dishes)
   - Applies standard markup (typically 3-4x from cost)
   - Suggests price range with justification

4. **Result Aggregation:**
   - AI Media-Studio combines image + pricing recommendations
   - Forms unified response

5. **QA-Gate:**
   - Checks image matches dish description
   - Validates suggested price realism
   - Checks markup within reasonable limits (2.5x - 4.5x)
   - Score: 0.85
   - Action: pass

**Final Response to User:**
```
[AI Media-Studio]
✅ Image created!

[Generated dish photo displayed]

Pricing recommendations from AI Brain-Chef:
- Food cost: 150₽
- Recommended price: 520₽ (markup 3.5x)
- Range: 480-580₽

Justification: Average price for similar dishes in your segment — 500-550₽.
At 520₽ your food cost will be 29%, which is optimal.
```

---

## 6. Agent Distinctions Summary

### AI Sous-Chef vs AI Brain-Chef

**AI Sous-Chef (kitchen):**
- Focus: **HOW** to cook, **WHAT** to cook
- Works with: recipes, techniques, menus, leftovers
- Thinks in: taste, texture, combinations, portions
- Typical question: "How to cook?" / "What to cook?"
- Output: recipes, menus, tech cards, production plans

**AI Brain-Chef (finance):**
- Focus: **HOW MUCH** it costs, **IS IT** profitable
- Works with: prices, costs, profit, orders
- Thinks in: money, margin, ROI, optimization
- Typical question: "How much?" / "What profit?"
- Output: calculations, reports, orders, financial analytics

**When they work together:**
- Sous-Chef creates recipe → Brain-Chef calculates its cost
- Brain-Chef sees high food cost → Sous-Chef optimizes recipe
- Sous-Chef plans menu → Brain-Chef checks profitability

---

### AI Research vs AI Brain-Chef

**AI Research (external search):**
- Focus: information **OUTSIDE** the system
- Sources: internet, databases, APIs, external sources
- Tasks: trends, competitors, new suppliers, techniques
- No access to internal financials
- Used for: strategic decisions, research, learning

**AI Brain-Chef (internal accounting):**
- Focus: data **INSIDE** the system
- Sources: your DB (orders, suppliers, financials)
- Tasks: current operations, calculations, reports
- Full access to financial data
- Used for: operational decisions, accounting, control

**When to use Research instead of Brain-Chef:**
- "What are food industry trends?" → Research
- "How much did we spend on meat?" → Brain-Chef
- "Find new vegetable suppliers" → Research
- "Create order with current supplier" → Brain-Chef
- "What are competitors doing?" → Research
- "What's our monthly profit?" → Brain-Chef

---

### AI Media-Studio in Overall Flow

**Media-Studio Role:**
- **Visualization** of other agents' work results
- **Marketing** — creating promotional content
- **Presentation** — menu design, materials

**Integration with Other Agents:**

1. **With AI Sous-Chef:**
   - Sous-Chef creates recipe → Media-Studio makes dish photo
   - Sous-Chef plans menu → Media-Studio designs menu visual
   - Sous-Chef describes technique → Media-Studio creates video instruction

2. **With AI Brain-Chef:**
   - Brain-Chef calculates profitable dishes → Media-Studio creates promo for them
   - Brain-Chef analyzes sales → Media-Studio creates data visualization
   - Brain-Chef suggests price → Media-Studio creates price tag/banner

3. **With AI Research:**
   - Research finds trends → Media-Studio creates trend-based content
   - Research analyzes competitors → Media-Studio creates differentiating visual

**Media-Studio Uniqueness:**
- Only agent creating **new content** (not analyzing existing)
- Works with **external APIs** of generative models
- Has **Prompt Enhancer** — unique prompt improvement function
- Manages **asset library** for reuse

**Typical Workflow:**
```
Request: "Create summer menu with photos"
↓
1. AI Sous-Chef: creates menu from seasonal products
2. AI Brain-Chef: checks dish profitability
3. AI Media-Studio: generates photos for each dish
4. AI Media-Studio: designs final menu with prices and photos
↓
QA-Gate: checks consistency (photos match dishes, prices correct)
↓
Result: ready summer menu with professional photos
```

---

## 7. Technical Details

### 7.1. Request Caching

Orchestrator uses **lightweight cache** for optimization:

**Parameters:**
- Size: last 3 requests
- Similarity algorithm: Levenshtein Distance
- Similarity threshold: > 0.8 (80% match)

**Logic:**
1. On new request, check cache
2. If similar request found (similarity > 0.8):
   - Use cached intent
   - Confidence = 0.8 (fixed for cache)
   - Skip classification
3. If not found:
   - Perform full classification
   - Add result to cache
   - Remove oldest element (FIFO)

**Benefits:**
- Faster repeated requests
- Reduced classifier load
- Consistency for similar phrasings

**Example:**
```
Request 1: "How to cook borscht?"
→ Classification → cooking → cache

Request 2: "How to cook borsch?" (typo)
→ Cache check → similarity 0.95 → cooking (from cache)
→ Classification skipped
```

### 7.2. Confidence and Fallback

**Confidence Levels:**
- **0.9-1.0:** Very high confidence — direct execution
- **0.7-0.9:** High confidence — execute with logging
- **0.5-0.7:** Medium confidence — execute + request user confirmation
- **< 0.5:** Low confidence — fallback to QA-Gate

**Fallback Strategy:**
1. If confidence < 0.5:
   - Request directed to QA-Gate
   - QA-Gate attempts to clarify intent with user
   - Or offers interpretation options

2. If agent unavailable (health check failed):
   - Attempt to use backup agent
   - Or return unavailability message

3. If agent response incorrect (QA score < 0.5):
   - Retry request to agent with clarification
   - Or fallback to different agent
   - Maximum 2 attempts, then — error message

### 7.3. Context and Memory

**Context Types:**

1. **Session Context (short-term memory):**
   - Last N messages in current session
   - Selected agent and intent of previous requests
   - Uploaded files and documents
   - Stored: in memory + `chat_sessions`

2. **User Context (long-term memory):**
   - User preferences
   - Role and access rights
   - Interaction history
   - Stored: `users`, `user_preferences`

3. **Domain Context (system knowledge):**
   - Current DB state (stock, orders, menu)
   - Business rules and constraints
   - Standards and regulations
   - Stored: all DB tables

**Context Passing to Agents:**
- Each agent receives relevant context
- Filtered by access rights (RBAC)
- Context size limited (token limit)

---

## 8. Security and Limitations

### 8.1. Access Control (RBAC)

**User Roles:**
- **Admin:** full access to all agents and data
- **Manager:** access to financials, reports, orders
- **Chef:** access to recipes, menu, production
- **Staff:** limited access (read only)

**Agent Restrictions:**
- AI Brain-Chef: Admin and Manager only (financial data)
- AI Sous-Chef: all roles (culinary information)
- AI Research: all roles (public information)
- AI Media-Studio: Chef, Manager, Admin (content creation)
- QA-Gate: system agent (no rights required)

**Data Restrictions:**
- Financial tables: Admin and Manager only
- Recipes and menu: all roles (read), Chef+ (write)
- Orders and suppliers: Manager+ (write)
- Media assets: all roles (read), Chef+ (write)

### 8.2. Rate Limiting

**Request Limits:**
- Regular users: 60 requests/minute
- Premium users: 120 requests/minute
- API keys: 300 requests/minute

**Agent Limits:**
- AI Media-Studio: 10 generations/hour (expensive operations)
- AI Research: 30 requests/hour (external APIs)
- Other agents: no special limits

### 8.3. SAFE_MODE

**Safety mode** for protection against malicious requests:

**Blocked Actions:**
- Deleting critical data without confirmation
- Mass changes to financial records
- Generating inappropriate content (NSFW)
- SQL injections and other attacks

**Filters:**
- Input sanitization (user input cleaning)
- Output validation (agent response checking)
- Content moderation (for Media-Studio)

---

## 9. Conclusion

Chef's Mind AI routing system v1.1 provides:

✅ **Intelligent distribution** of requests between specialized agents  
✅ **Flexibility** in handling simple and complex (mixed-intent) requests  
✅ **Quality** responses through mandatory QA-Gate validation  
✅ **Performance** via caching and optimization  
✅ **Security** through RBAC, rate limiting, and SAFE_MODE  
✅ **Transparency** — user always knows which agent is responding  

Architecture designed for **scaling** and **evolution**, allowing addition of new agents and improvement of existing ones without changing core orchestrator logic.

---

**Document Version:** 1.1  
**Last Updated:** November 19, 2025  
**Project Version:** v2.1.6  
**Status:** Active — Aligned with UI Spec v1.1
