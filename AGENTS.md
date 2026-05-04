Angular/TailwindCSS scoreboard for Triple Yahtzee — calculates best dice roll assignment.

## Commands
- Dev: `pnpm start` (http://localhost:4200)
- Unit tests: `pnpm test` (Vitest, watch mode)
- E2e tests: `pnpm e2e` (Playwright, auto-starts dev server)
- Build: `pnpm build`

## Rules
- Run `eslint . --fix` after every change. See [linting](.agents/conventions/linting.md).
- Use TDD: write failing test first (Vitest + Testing Library). Use `tdd` skill.
- Commit with Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
- E2e: use `playwright-cli`. See [e2e testing](.agents/conventions/e2e-testing.md).

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`FabienDehopre/triple-yahtzee-score-board`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical label strings (no overrides). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.
