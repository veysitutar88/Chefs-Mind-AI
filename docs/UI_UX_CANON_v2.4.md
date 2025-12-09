# Chef’s Mind AI — UI/UX Canon v2.4

**Scope:** `frontend-enhanced`

## 1. Core Aesthetics

- **Theme**: Premium Dark Mode ("Claude-style").
  - Background: `#0f172a` (Slate-950) / `bg-root`.
  - Surface: `#1e293b` (Slate-800) / `bg-surface`.
  - Border: `border-white/5`.
- **Accent**: Na'vi Blue.
  - Hex: `#0EA5E9`.
  - Usage: Primary Actions, Active States, Focus Rings.

## 2. Layout Architecture

- **Structure**: 3-Column Standard.
    1. **Left (Navigation)**: `AgentSidebar` (350px). Fixed.
    2. **Center (Workspace)**: `ChatArea` / `MediaPage`. Flexible.
    3. **Right (Context)**: `RightSidebar` (350px). Collapsible/Fixed.

> [!WARNING]
> **Sidebar Mismatch**: The standard sidebar must be the **Widget-Based** version (`components/layout/RightSidebar`), NOT the Tab-based one.

## 3. Component Library

- **Base**: Radix UI + Tailwind CSS.
- **Icons**: Lucide React.
- **Typography**: Inter (Google Fonts).

### Specialized Components (Block 9)

- **Media Selectors**:
  - `MediaModelSelector` (Rich dropdown with icons).
  - `MediaFormatSelector` (Aspect ratios).
  - `UpscaleButton` (Action trigger).
  - *Note: These currently exist in `ChatArea` but must be ported to `MediaPage`.*

## 4. Interaction Patterns

- **Transitions**: `animate-in fade-in slide-in-from-bottom-2`.
- **Loading**: Pulse skeletons for content, Spinning Loader for actions.
- **Focus**: `focus:ring-2 focus:ring-accent`.

## 5. Mobile Responsiveness

- **Layout**: Stack columns.
- **Navigation**: Drawer menu for Sidebar.
