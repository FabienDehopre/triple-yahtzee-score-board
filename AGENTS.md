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
