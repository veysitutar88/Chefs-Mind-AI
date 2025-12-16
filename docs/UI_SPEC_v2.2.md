# UI Specification v2.2 — Chef’s Mind AI

**Status:** Baseline (Derived from Master Context v2.1.6)
**Date:** 2025-11-24

## 1. Design Philosophy

- **Theme:** "Chef's Mind" — Professional, focused, high-tech but warm.
- **Metaphor:** The "Brain" of the kitchen.
- **Visual Style:** Dark mode, deep indigo backgrounds, soft cyan accents (Na'Vi Blue), glow effects.

## 2. Color Palette

- **Primary Background:** `#0B0F2A` (Deep Indigo)
- **Secondary Background:** `#11183D` (Lighter Indigo for cards/sidebars)
- **Accent Color:** `#4BC9FF` (Soft Cyan / Ice Blue)
- **Text Color:** `#E5F4FF` (Off-white/Ice white)
- **Borders:** Glow borders using accent color with low opacity.

## 3. Typography

- **Font Family:** Inter, SF Pro, or Roboto.
- **Readability:** High contrast, clear hierarchy.

## 4. Layout Structure (3-Column)

### 4.1 Left Sidebar (Agent Bar)

- **Purpose:** Navigation between specialized agents.
- **Components:**
  - **Logo:** Top left.
  - **Agent Cards:** Vertical list.
    - **Style:** Rounded corners (20-24px).
    - **Interaction:** Hover effect with cyan glow.
    - **Agents:** Chef, Accountant, Researcher, Media Studio.
  - **Settings:** Bottom.

### 4.2 Central Area (Main Chat)

- **Purpose:** Primary interaction zone.
- **Components:**
  - **Header:** Current context/agent name.
  - **Chat History:** Scrollable message list.
    - **User Message:** Aligned right or distinct background.
    - **Agent Message:** Aligned left, markdown support.
  - **Input Area:** Fixed at bottom.
    - **Controls:** Microphone, Attach File, Model Selector (Gemini/GPT/Perplexity), Send Button.

### 4.3 Right Sidebar (Tools Bar)

- **Purpose:** Contextual tools and resources.
- **Components:**
  - **Search:** Chat history search.
  - **Library:** Pinned files, prompts.
  - **Assets:** Generated media (for Media Studio).
  - **Calendar:** Preview (optional).

## 5. Component Specifics

### 5.1 Agent Card

- **Shape:** Rectangular with large border radius.
- **Content:** Icon, Name, Subtitle/Description.
- **State:** Active state highlighted with stronger glow/border.

### 5.2 Buttons

- **Style:** Flat or subtle gradient.
- **Hover:** Glow effect.
- **Primary:** Accent color.
- **Secondary:** Transparent or dark with border.

## 6. Media Studio (FoodFrame AI)

- **Integration:** Not a separate page, but a specialized agent view.
- **Controls:**
  - Model Selector (Imagen, Veo, DALL-E).
  - Format Selector (Aspect Ratio).
  - Upscale Button.
- **Output:** Gallery view in Right Sidebar or inline.
