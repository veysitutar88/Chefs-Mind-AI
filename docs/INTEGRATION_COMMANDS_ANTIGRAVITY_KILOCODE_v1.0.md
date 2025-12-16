# INTEGRATION_COMMANDS_ANTIGRAVITY_KILOCODE_v1.0.md

## Purpose
Unified command set for integrating Google Antigravity (Gemini 3 Pro) with KiloCode Project Mode inside Chef’s Mind AI.

## 1. Antigravity Commands
- `ag:spawn <agent> --workspace=<path>` — start Antigravity agent in module.
- `ag:review-artifact <id> --approve` — approve artifact.
- `ag:link-workspace <repo> --tools=browser,editor,terminal` — attach repo.

## 2. KiloCode Commands
- `kc:apply-rule <rule>` — enforce project rule.
- `kc:init-integration <service>` — init integration.
- `kc:auth-oauth <service>` — configure OAuth.

## 3. Sync Commands
- `sync:agents antigravity->kilocode` — sync context/rules.
- `sync:checkpoint` — update project checkpoint.

## 4. QA / Safety
- All Antigravity actions MUST be validated by Orchestrator.
- No direct file writes outside manifest.
