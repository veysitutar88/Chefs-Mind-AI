# COG__DECISIONS.md

## Decision Record 2025-12-26-001: Mobile/Tablet Focus Mode

* **Decision:** All sidebars (Left and Right) are hidden on mobile/tablet viewports.
* **Breakpoints:** LeftSidebar hidden < lg (1024px), RightSidebar hidden < xl (1280px).
* **Rationale:** Sidebars occupy too much horizontal space (~320px each), squeezing or overlapping central content (Forms/Settings) to unreadable widths. Focus mode protects content width.
* **Code Impact:** `frontend-enhanced/src/components/layout/AppLayout.tsx`.
* **Risk:** R2 (UI Layout).
