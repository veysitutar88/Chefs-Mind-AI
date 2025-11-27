# Project Cognition Layer Guide

This document defines the specification of the Git-native Cognition Layer used in this project.

The Cognition Layer provides:

- long-term deterministic memory
- commit-bound reasoning
- architectural traceability
- module relationship mapping
- agent scanning requirements

It consists of:

- .context/evolution/  — per-commit context logs
- .context/decisions/  — long-term architectural decisions
- .context/templates/  — templates for structured context files
- .context/knowledge_map.json
- .context/heatmap.json
- .context/agent_state.json
- .context/README_CONTEXT.md

All AI agents must follow this specification.
No code change should bypass `.context/`.
