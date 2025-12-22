# OPERATOR CHECKLIST: Builder Output Review (v2.5)

Use this checklist BEFORE committing any Builder changes.

## A. Scope & File Safety

- [ ] Only files listed in Blueprint “WRITE” were modified
- [ ] No unexpected files changed
- [ ] No formatting-only churn unless required by Blueprint

## B. Spec Compliance

- [ ] Names match the Blueprint exactly (no renames)
- [ ] Behavior matches each Step acceptance check
- [ ] No extra features, no “improvements”

## C. Dependencies & Config

- [ ] No new dependencies added unless Blueprint explicitly allowed
- [ ] No env/config changes unless explicitly allowed

## D. Security & Footguns (quick scan)

- [ ] No eval/exec or unsafe shell calls unless explicitly required
- [ ] No leaking secrets to logs
- [ ] No broad filesystem/network access added “by convenience”

## E. Verification Evidence

- [ ] Builder provided a Verification section (tests run or “not run”)
- [ ] If tests weren’t run, you accept that risk explicitly

## F. Decision

- [ ] ACCEPT → commit yourself
- [ ] REJECT → return to Architect with exact failure notes

END OF FILE.
