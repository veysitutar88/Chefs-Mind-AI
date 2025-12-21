# UX Flow Audit (V3)

**Date:** December 8, 2025
**Scope:** User Flows & Interactions
**Verdict:** **60% Compliance** (Major Flow Breaks Detected)

## 1. Executive Summary

The application provides a visually premium experience that mostly aligns with the "Claude-style" workspace. However, the ecosystem is fractured.

1. **The Sidebar Trap**: The user is presented with a "Dummy Sidebar" that hides the real intelligence features (Followups, Smart Calendar) implemented in Block 8.
2. **Media Fragmentation**: The user gets a *better* media generation experience inside the Chat (FoodFrame) than on the dedicated Media Studio page.

## 2. Flow Analysis

### A. Navigation & Context

- **Flow**: Agent Selection -> Context Switch
- **Status**: ✅ **Solid**.
- **Observation**: Switching agents cleanly updates the UI. The subtle animations and "Thinking..." states add appropriate polish. Mobile responsiveness is Logic-gated (Left/Right sidebars disappear) which matches standard patterns.

### B. The "Split Brain" Sidebar Issue (Critical)

The user flow for "Managing Tasks" is currently broken.

- **Expected Flow (Canon)**: Chat -> Agent suggests Task -> Followup Widget (Right Sidebar) -> User Approves.
- **Actual Flow**: Chat -> Agent suggests Task -> **Void**. (The active sidebar has a manual To-Do list unrelated to the AI).
- **Cause**: `page.tsx` imports `components/ui/RightSidebar` (Tabs) instead of `components/layout/RightSidebar` (Widgets).

### C. Media Studio Experience

- **Chat Flow (FoodFrame)**:
  - **UX**: Excellent. Inputs are context-aware. Selectors (`MediaModelSelector`) use rich UI with icons and descriptions.
- **Dedicated Page Flow (`/media`)**:
  - **UX**: Basic. Uses standard HTML/Shadcn dropdowns. No visual cues for model strengths.
  - **Friction**: High. The user loses the "premium" feel when moving to the dedicated studio.
- **Recommendation**: Refactor `Generator.tsx` to reuse the components from the Chat (`MediaModelSelector`, etc.).

## 3. Interaction Polish & Accessibility

- **Focus States**: Generally good, standard browser focus.
- **Loading States**: `isGenerating` and `isLoading` are handled well, preventing double-submissions.
- **Error Handling**: Basic toast/alert logic exists. Media Gallery handles fetch errors gracefully with a "Retry" button.

## 4. Recommendations

### Priority 1: Unify the Sidebar

**Action**: Replace the Tab-based Sidebar with the Widget-based Sidebar in `page.tsx`.

- **Benefit**: Restores Block 8 (Followups) and real Calendar integration.
- **Merge Strategy**: If the "Library" tab from the current UI is needed, it should be converted into a *Widget* for the Layout-Sidebar.

### Priority 2: Unify Media UX

**Action**: Port `MediaModelSelector` and friends into `src/app/media/page.tsx`.

- **Benefit**: Consistent, premium experience across both entry points.

### Priority 3: Accessibility Pass

- **Action**: Add `aria-label` to icon-only buttons (Trash, Download, etc.) in the Asset Gallery.
