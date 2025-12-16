# Chef’s Mind AI Feature Development Workflow

You are the orchestrator for developing a new feature in Chef’s Mind AI project. Follow these steps strictly to ensure minimalism, precision, and alignment with architecture (Docker/Next.js/FastAPI), UI/UX (Tailwind/Shadcn, Na’Vi Blue #3E6BA3 & Beige #B79F8C), Media Studio (Imagen/Leonardo AI), and Docs & Ops (Markdown reports, checkpoints).

Parameters (ask user if missing):
- Feature name (e.g., "mcp-agent-integration")
- Branch name (default: "feature/[feature-name]")
- Environment (dev/staging/prod)
- Reviewers (e.g., "igor, team-lead")
- Related files/folders (e.g., "@src/components", "@server/routes.ts")

Global Instructions: Answer in Russian except code/paths. Use Goal → Do → Deliver for sub-tasks. Never apply destructive changes without diff approval. Reference project context from @CHEKPOINT.md and @NEXT_TASKS_STATUS_2025-11-06.md. Ensure TypeScript strict, functional React, no default exports.

## Step 1: Planning (Switch to Architect Mode)
- Use search_files to scan for existing similar features: query ["[feature-name] integration", "MCP OAuth", "UI component Shadcn"] across codebase, focusing on @server, @src, @docs.
- Read key files: read_file("@CHEKPOINT.md"), read_file("@create-context-universal.md") for architecture overview, schemas, endpoints.
- Generate plan: Outline 3-5 slices (e.g., backend API, frontend UI, tests, docs). Include acceptance criteria: "Feature handles [X] without errors, UI matches palette, tests coverage >80%, docs updated in MD."
- Output: Markdown plan with Goal → Do → Deliver for each slice. Ask confirmation before proceeding.
- If MCP-related (e.g., Google OAuth), validate schema in @schema.ts and routes in @routes.ts.

## Step 2: Setup Environment (Execute Commands)
- Switch to Code Mode if plan approved.
- Create branch: execute_command("git checkout -b [branch-name]"), confirm no conflicts.
- Install/update deps if needed: execute_command("npm install" if frontend changes) or "pip install -r requirements.txt" for backend.
- For Docker: execute_command("docker compose up -d" in dev env), check logs for EADDRINUSE (reference @__Chef’s Mind AI — Финальная Перезагрузка_ Устране.md).
- Pull context: search_files(["TODO", "console.log", "debug"] in modified files) to flag issues.

## Step 3: Implementation (Code & UI/UX)
- For Architecture: If backend (FastAPI/Node), write_file to @server/routes.ts or new endpoint, integrate MCP (e.g., google-mcp.ts). Use search_codebase for similar patterns.
- For UI/UX: Generate Shadcn components in @src/components (e.g., StatusIndicator.tsx with loading/error states, Tailwind classes: bg-[#3E6BA3] text-[#B79F8C]). Ensure vertical scroll, minimal fine-dining design.
- For Media Studio: If assets needed, propose prompts for Imagen 4/Leonardo AI (e.g., "Na’Vi Blue logo pattern"), save as @public/media.
- Diff approval: For every write_file, show diff and wait for "approve" before apply.
- Add tests: write_file to @tests (unit with Jest, E2E with Playwright from @playwright.config.ts).

## Step 4: Testing & Quality (Switch to Debug Mode)
- Run lint: execute_command("npm run lint" or "eslint . --fix"), check @eslint_latest.log for issues.
- Run tests: execute_command("npm test"), then "npx playwright test" for E2E (headed mode if env=dev).
- Debug: If failures, read_file logs (@e2e.log, @e2e_headed.log), propose fixes with minimal changes. Validate OAuth/MCP: execute_command("curl localhost:3000/api/metrics") if applicable.
- Metrics check: Ensure no regressions in frontend (@FRONTEND_AUDIT_REPORT_2025-10-29.md), backend health (@G1_GOOGLE_OAUTH_INTEGRATION_FINAL_REPORT.md).

## Step 5: Documentation & Ops
- Update docs: write_file to @docs (e.g., add section in @koda-kilo-guide.md or new MD report like "FEATURE_INTEGRATION_2025-11-11.md").
- Generate checkpoint: Summarize changes, update @NEXT_TASKS_STATUS with new tasks/status.
- For release: If prod env, execute_command("docker compose -f docker-compose.prod.yml up -d"), notify via MCP (e.g., Slack integration).

## Step 6: PR & Review
- Commit: execute_command("git add . && git commit -m 'feat: [feature-name] - [description from plan]'").
- Push & PR: execute_command("git push origin [branch-name] && gh pr create --title '[feature-name]' --body '[plan summary]' --reviewer [reviewers]").
- Post-PR: Search for follow-ups (e.g., "deploy to staging"), suggest next workflow (/deploy-chefs-mind.md if exists).

## Error Handling
- On failure (e.g., tests fail): Log to new file "workflow-error-[feature-name].md", propose rollback: execute_command("git checkout main").
- Security: No auto-approve on write/exec/destructive ops. Always confirm with user.
- Completion: Output final summary: "Feature [name] ready. PR: [link]. Next: Review & Merge." Update Memory Bank with decisions.

---

✅ End workflow. Ask: "What’s next? (e.g., deploy, another feature)"

