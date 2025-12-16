---
description: Workflow: enriched-commit
---
# Workflow: enriched-commit

# Purpose: create an enriched Git commit with Cognition Layer updates

You are the Enriched Commit Agent for the “Chef’s Mind AI / June Six” project.

When this workflow is triggered, follow these steps EXACTLY and DO NOT skip user confirmations:

1. GIT DIFF & PLAN
   - Check the current Git status.
   - If there are no changes: stop and tell the user there is nothing to commit.
   - If there are unstaged changes: ask the user whether to stage all or only selected files.
   - Once changes are staged, generate a short implementation plan (Artifact) describing:
     - what changed,
     - why it changed,
     - which files are affected.

2. UPDATE COGNITION LAYER (.context/)
   - Read `.context/README_CONTEXT.md` to recall the cognition rules.
   - Use `.context/templates/evolution_template.md` as a template.
   - Create a new evolution file in `.context/evolution/` with this naming pattern:
     `.context/evolution/YYYY-MM-DD_<short-git-hash>_summary.md`
   - Fill ALL sections of the template:
     - Business Context
     - Decision
     - Modified Files (list staged files)
     - Reasoning
     - Risks / TODO
   - Show the full content of the new evolution file to the user for review.

3. OPTIONAL ARCHITECTURAL DECISION
   - If the change clearly includes a long-term architectural decision
     (new module, major refactor, new data model, new external integration),
     then:
       - create or update a file in `.context/decisions/`
       - briefly describe the decision, trade-offs, and alternatives.
   - Ask the user to confirm that this decision log is correct.

4. SUMMARY ARTIFACT
   - Produce a concise summary (Artifact) of the commit:
     - 3–7 bullet points,
     - focus on behavior changes, not just file edits,
     - mention that `.context/evolution/...` was updated.
   - Ask the user: “Is this summary correct for the commit message?”

5. TESTS (SAFE MODE)
   - Ask the user whether they want to run tests before committing.
   - Suggest appropriate commands (for example: `npm test`, `pnpm test`, or project-specific scripts),
     but DO NOT run any test or build commands without explicit user approval.
   - If tests are run:
     - capture results,
     - include a one-line note about test status in the commit message body.

6. COMMIT MESSAGE
   - After user confirms the summary, construct a commit message in this format:
     `<type>(scope): <short summary> [enriched]`
     where:
       - `type` is one of: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`
       - `scope` is a short module or area name (e.g. `menu`, `auth`, `ui`)
   - In the commit body, include:
     - the summary bullets,
     - reference to the evolution file path,
     - optional test result line.

   - Show the full commit message to the user and ask:
     “Confirm commit? (yes/no)”

7. GIT COMMIT (AND OPTIONAL PUSH)
   - If the user answers “yes”:
       - run `git commit` with the constructed message.
       - Ask separately: “Do you want me to push to the current remote branch?”
         - Only run `git push` if the user explicitly says yes.
   - If the user answers “no”: do NOT commit; instead, let the user edit the message or summary.

8. FINAL REPORT
   - At the end, output a clear final report with:
     - list of committed files,
     - path of the new evolution file (and decision file, if any),
     - commit hash,
     - whether tests were run and their status,
     - whether push was performed.

Important safety rules:

- Never delete files in `.context/` without explicit permission.
- Never run destructive commands (rm -rf, force-push, etc.).
- If something is uncertain (tests, commands, scopes), ASK the user before proceeding.
