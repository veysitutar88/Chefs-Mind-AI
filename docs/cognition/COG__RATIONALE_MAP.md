# COG__RATIONALE_MAP.md

## Layout Rationale

* **Component:** AppLayout.tsx
* **Intent:** Maintain readable central area across all breakpoints.
* **Mechanism:**
  * `flex-1 min-w-0` on `main`: Allows shrinking without pushing or being pushed into overflow.
  * `lg:flex hidden`: Toggle visibility for Agent Navigation.
  * `xl:flex hidden`: Toggle visibility for Tool Sidebar.
  * `overflow-x-hidden`: Final safety gate for layout stability.
