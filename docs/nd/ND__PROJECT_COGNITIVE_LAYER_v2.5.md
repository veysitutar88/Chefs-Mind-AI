# ND__PROJECT_COGNITIVE_LAYER_v2.5

Project: Chef’s Mind AI  
Status: CANONICAL (Normative Document)  
Version: v2.5  
Scope: Project Cognition Layer (external, durable, operator-controlled)

---

## 1) Purpose

This document defines the Project Cognitive Layer (PCL) as a durable, external knowledge system that preserves:

- decisions and rationale (“why we chose this”),
- links between decisions and code/docs,
- evolution of the project over time,
- operational rules for updating and using cognition safely.

The PCL is NOT the same as:

- Antigravity internal session memory,
- simple vector embeddings only,
- CHECKPOINT.md (source-of-truth status).

The PCL exists to prevent context loss after tool resets, agent restarts, and multi-chat drift.

---

## 2) Three-Layer Model (must not be mixed)

### Layer A — Antigravity Runtime (internal, ephemeral)

Contains:

- agent conversations,
- execution state,
- artifacts produced during a session.

Properties:

- may reset or be lost,
- not authoritative.

### Layer B — Project Canon (external, static authority)

Contains:

- CHECKPOINT.md (Single Source of Truth),
- docs/nd/* (Normative Documents),
- tags + git history.

Properties:

- authoritative,
- changes only via explicit review and freeze.

### Layer C — Project Cognitive Layer (external, living knowledge)

Contains:

- decision rationale,
- causal chains,
- “why” behind architecture and workflow choices,
- reusable reasoning patterns.

Properties:

- living but governed,
- updated by explicit protocol,
- may include a vector index later, but is not limited to embeddings.

Rule:

- Agents may READ external files when the operator instructs (read-only reference).
- Agents must NEVER treat the canon or cognition as “their internal memory”.
- Authority remains external to Antigravity.

---

## 3) Canonical Location (where PCL lives)

Primary canonical location:

- docs/cognition/

Minimum required files (v2.5 baseline):

1) docs/cognition/COG__INDEX.md  
2) docs/cognition/COG__DECISIONS.md  
3) docs/cognition/COG__RATIONALE_MAP.md  
4) docs/cognition/COG__GLOSSARY.md  
5) docs/cognition/COG__UPDATE_PROTOCOL.md  

Optional later (v2.6+):

- docs/cognition/vector/ (embeddings index metadata, if introduced)
- docs/cognition/graphs/ (decision graph exports)

Note:

- This ND defines the system. The actual cognition files are created/maintained by controlled tasks.

---

## 4) What goes into the PCL (content rules)

### Allowed content

- Decision records (what/why/alternatives/risks)
- Reasoning summaries tied to commits/tags
- Operational playbooks and “lessons learned”
- Clarifications that prevent repeated mistakes

### Not allowed content

- long raw chat transcripts,
- duplicated canonical specs from ND files,
- secrets, API keys, personal data.

---

## 5) Update protocol (how cognition is updated)

All updates follow:

1) Draft artifact (COG draft or decision entry)
2) Human review
3) Apply update
4) Freeze note in EVOLUTION_LOG.md

No silent updates.

---

## 6) How we use PCL in practice (operator workflow)

When starting a new task:

1) Operator identifies relevant canon:
   - CHECKPOINT.md
   - relevant docs/nd/*
2) Operator identifies relevant cognition references:
   - docs/cognition/COG__INDEX.md
   - linked decision entries
3) Operator issues a task to an agent with:
   - explicit file references (read-only),
   - explicit deliverable (artifact),
   - explicit risk level.

Agents do not “remember” the PCL; they reference it only when instructed.

---

## 7) Relationship to vector memory (explicit stance)

Vector memory may be introduced later as an accelerator, but:

- PCL is not “only vector”.
- The authoritative cognition remains in human-readable files under docs/cognition/.
- Any vector index must be reproducible from those files.

---

## 8) Governance and risk gates

Cognition updates are classified as:

- R1: adding clarifications, glossary entries, links
- R2: adding or changing decision rationale that affects execution
- R3: changing core governance rules (rare, requires strict approval)

Agents must STOP and ASK if a cognition update would affect canon interpretation.

---

## 9) Freeze points (mandatory)

Freeze occurs after:

- any material change to cognition structure,
- any new decision record affecting workflow,
- any introduction of new tooling assumptions.

Freeze action:

- append a short entry to docs/EVOLUTION_LOG.md describing the cognition update.

---

## 10) Definition of success

The PCL is considered healthy when:

- key decisions are retrievable without relying on human memory,
- new tasks can start from files, not from chat recall,
- agents can be restarted without losing project continuity.

END OF DOCUMENT
