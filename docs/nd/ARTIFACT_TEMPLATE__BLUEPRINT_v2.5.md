# ARTIFACT TEMPLATE: BLUEPRINT (v2.5)

This document defines the ONLY allowed format for Architect Blueprints in v2.5.
Blueprints must be deterministic and “Spec is Law” compatible.

## 0. Metadata (required)

- Blueprint ID:
- Date:
- Target Area (UI / Server / DB / Docs / Ops):
- Risk Level (R0/R1/R2/R3):
- Requires Operator Approvals (Yes/No):

## 1. Goal (required)

One paragraph. Exact outcome.

## 2. Inputs (required)

- Operator-provided requirements:
- Canon references (explicit file paths only):
- Constraints (from operator / canon):

## 3. Constraints (required)

Hard “must / must not” list.

- Must:
- Must NOT:

## 4. Allowed File Operations (required)

ONLY these files may be modified by Builder.
Format:

- READ:
  - `path`
- WRITE:
  - `path`

Rules:

- No other files are touched.
- No formatting-only changes unless explicitly required.

## 5. Step-by-Step Specification (required)

Numbered steps. Each step must be:

- atomic
- checkable
- scoped to allowed files
For each step:
- Step N:
  - Change:
  - Location (file + component/function name):
  - Exact behavior:
  - Acceptance check:

## 6. Dependencies (required)

- New dependencies: None (default) / list explicit additions
- Existing dependencies used:

## 7. Error Handling & Edge Cases (required)

If unspecified by operator, write exactly:
“Not specified. Builder must STOP and ASK.”

## 8. Verification Plan (required)

- Commands to run (if allowed):
- Manual checks:
- Expected outputs:

## 9. Builder Notes (required)

Rules for Builder execution:

- No improvisation
- Stop on ambiguity
- Produce diff artifact

## 10. Open Questions (required)

If none, write: None.
If present, list as BLOCKERS.

END OF FILE.
