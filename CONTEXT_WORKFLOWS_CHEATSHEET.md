# Cognition Layer Workflows — Cheat Sheet

## 1. /enriched-commit

Use when:

- you are ready to commit meaningful code changes.

What it does:

- shows git diff
- creates `.context/evolution/...` entry
- (optionally) creates decision log
- builds commit message
- runs tests on request
- commits and (optionally) pushes

Rule of thumb:
> Любой серьёзный коммит → запускаем `/enriched-commit`.

---

## 2. /scan-and-refresh-knowledge

Use when:

- big refactor,
- many new files / modules,
- agent "gets lost" or semantic search behaves strangely,
- you pulled a lot of changes from remote.

What it does:

- rescans project
- rebuilds `knowledge_map.json`
- updates `heatmap.json` with `last_scan_hash`
- (опционально) добавляет evolution-запись про refresh.

Rule of thumb:
> Большие изменения структуры → `/scan-and-refresh-knowledge`.
