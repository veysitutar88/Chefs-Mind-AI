
# ND__ANTIGRAVITY_RUNTIME_MODEL_v2.5

Project: Chef’s Mind AI  
Status: CANONICAL (Normative Document)  
Version: v2.5  

## Purpose

This document defines the authoritative runtime and operational model for using Google Antigravity within the Chef’s Mind AI project.  
It exists to prevent context drift, split-brain behavior, and uncontrolled agent autonomy.

This document is a reference for the HUMAN OPERATOR.  
It is not internal memory for Antigravity.

## Separation of Contexts

There are two strictly separated context layers:

1. External Project Canon (Human-controlled)
   - CHECKPOINT.md
   - docs/nd/*
   - Repository state
   - Human decisions

2. Internal Antigravity Context (Tool-controlled)
   - Conversations
   - Artifacts
   - Agent execution state

These two layers must never be merged.

Antigravity does NOT own canon.  
Antigravity only produces artifacts.

## What Antigravity Is

- Agent-first IDE
- Multi-agent execution environment
- Artifact-producing system
- Tool, not authority

## What Antigravity Is NOT

- Source of truth
- Canon holder
- Persistent project memory
- Autonomous decision-maker

## Agent Manager

Agent Manager is an orchestrator only.
It creates, runs, and monitors agents.
It does not decide correctness or canon.

## Agents

Agents are task-scoped executors.
Each agent:

- Receives explicit instructions
- Operates within defined limits
- Produces artifacts only

Agents must never assume project canon.
Agents must never modify canon implicitly.

## Models

Recommended usage:

- Gemini 3 Pro: planning, architecture, reasoning
- Gemini 3 Pro Low: UI, workflow analysis
- Gemini 3 Flash: mechanical tasks, hygiene, scanning
- Opus (if enabled): contracts, domain analysis

Model choice must match task type.

## Artifacts

Artifacts are outputs, not truth.
Examples:

- Reports
- Drafts
- Plans
- Logs

Artifacts require human review before any action.

## Safety Rules

- No agent executes destructive actions without explicit instruction
- No agent performs cleanup without archive strategy
- STOP → ASK → EXECUTE rule applies

## Operational Rule

Antigravity is treated as a controlled execution engine.
All authority remains outside the system.

END OF DOCUMENT
