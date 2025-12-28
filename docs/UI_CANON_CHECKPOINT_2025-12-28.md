# UI CANON CHECKPOINT - 2025-12-28
>
> [!IMPORTANT]
> This document serves as the SINGLE SOURCE OF TRUTH for the UI Visual Language as of 2025-12-28.

## 1. Unified Icon Geometry

* **Target**: All agent icons, preset icons, and action buttons.
* **Rule**: `rounded-full` (Circular) ONLY.
* **Restriction**: No square or rounded-rect icons in primary navigation or presets.

## 2. Sidebar Parity (Right ⇄ Left)

* **Interaction**: Right Sidebar must mirror Left Sidebar states.
* **Hover**: Specific token-based hover (e.g., `hover:bg-white/10`).
* **Active**: Glow effect (`shadow-[0_0_10px_...]`).
* **Structure**: Clean categorization (Library, Issues, Tools).

## 3. Popover Canon

* **Background**: Fully opaque `bg-slate-950` (or `bg-background`).
* **Opacity**: **100%** (No semi-transparent popovers).
* **Border**: `border border-white/10`.
* **Radius**: `rounded-xl`.

## 4. Input Canon

* **Source of Truth**: `src/components/ui/ChatArea.tsx` (Input section).
* **Structure**: `ChatInterface` MUST wrap `ChatArea`.
* **Visual**: Consistent padding, pill-shaped send buttons, unified typography.

## 5. Color Canon

* **Backgrounds**: Right Sidebar background matches Left Sidebar (Slate 950 / Black).
* **Tint**: **NO** extra purple tint in sidebars. Neutral dark preferred.

## 6. Status Labels

* **Placement**: "OFFLINE" / Status labels must be **ABOVE** the selector row or integrated safely.
* **Safety**: No visual overlap with dropdowns or popovers.
