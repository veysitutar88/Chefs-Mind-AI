# Block 9: Media Studio Advanced Features — Implementation Plan

## Goal

Upgrade the Media Studio module to a premium, production-ready state, enabling high-quality food photography and video generation with advanced control over models and styles.

## Context

- **Current State:** Media Studio v2.2 (Basic MVP with Generator, JobList, AssetGallery).
- **Target State:** Media Studio v2.5 (Advanced models, presets, sidebar integration, robust error handling).
- **Reference:** `UI_SPEC_v2.2` (Premium Dark aesthetic).

## Implementation Steps

### Step 1: Advanced Model & Preset Selection

**Objective:** Enable users to choose cutting-edge models and apply food-specific presets.

- **Modify `MediaModelSelector.tsx`:**
  - Add support for:
    - `gemini-3-image-pro` (Google)
    - `imagen-4` (Google)
    - `gpt-image-1` (OpenAI)
    - `veo-3` / `veo-3.1` (Video)
  - Group models by provider/type.
- **Create `MediaPresetSelector.tsx`:**
  - Define presets:
    - "Michelin Star" (Dramatic lighting, macro, shallow depth of field)
    - "Rustic Home" (Natural light, wooden textures, warm tones)
    - "Social Media Pop" (High saturation, bright, top-down)
    - "Dark & Moody" (Low key, shadows, elegant)
  - Integrate into `Generator` component.

### Step 2: Job History Integration

**Objective:** Allow users to track generation jobs from anywhere in the app via the RightSidebar.

- **Update `useSidebarData.ts`:**
  - Add `jobs` state (fetching from `/api/media/jobs` or similar).
- **Update `RightSidebar.tsx`:**
  - Add a "Recent Jobs" section (or merge with "Follow-up Tasks" / "Media").
  - Show progress bars for active jobs.
- **Enhance `JobList.tsx`:**
  - Improve visual design to match P2 standards.
  - Add "Retry" and "View Result" actions.

### Step 3: Error Handling & UX Polish

**Objective:** Ensure a robust and premium user experience.

- **Provider Status:**
  - Visual indication if a provider is unavailable (mocked or real check).
  - Graceful fallback suggestions.
- **Error States:**
  - Clear, actionable error messages for failed generations.
- **Polish:**
  - Micro-animations for generation start/finish.
  - Premium tooltips for model capabilities.

### Step 4: Verification & Tests

**Objective:** Validate the upgrade.

- **Build Check:** `npm run build`.
- **Manual Verification:**
  - Select new models.
  - Apply presets.
  - Start a job and see it in the sidebar.
  - Verify error handling.

## Files in Scope

- `frontend-enhanced/src/app/media/page.tsx`
- `frontend-enhanced/src/components/media/Generator.tsx`
- `frontend-enhanced/src/components/ui/MediaModelSelector.tsx`
- `frontend-enhanced/src/components/ui/MediaPresetSelector.tsx` (New)
- `frontend-enhanced/src/components/layout/RightSidebar.tsx`
- `frontend-enhanced/src/lib/useSidebarData.ts`

## Dependencies

- Backend support for new models (assumed ready or will be stubbed).
- `UI_SPEC_v2.2` for design tokens.
