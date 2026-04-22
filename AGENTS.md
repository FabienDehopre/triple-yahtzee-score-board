It is an Angular/TailwindCSS application that displays a scoreboard for the Triple Yahtzee game and calculates the best assignment of a dice roll to get the best score. 

## Commands
- Dev: `pnpm start` (serves on http://localhost:4200)
- Unit tests: `pnpm test` (Vitest via Angular builder, watch mode)
- E2e tests: `pnpm e2e` (Playwright, auto-starts dev server)
- Lint: `pnpm lint` (runs `eslint . --fix`)
- Build: `pnpm build`

## Rules and Guidelines
- ALWAYS run `eslint . --fix` after making changes to ensure code style consistency.
- NEVER run `prettier` because it might conflict with `eslint --fix` command.
- NEVER update the eslint config file. Fix the issues instead or ignore them if you cannot fix them (give a good reason for ignoring).
- ALWAYS use TDD (Test Driven Development) practices to ensure code quality and maintainability. Write failing test first (Vitest + Testing Library). No implementation without a red test. use "tdd" skill.
- commit often with clear and descriptive" messages to maintain a clean commit history. use Conventional Commits format (feat:, fix:, chore:, etc.)
- ALWAYS prefer using `playwright-cli` (if available) over using Playwright MCP server.
- When using the "playwright-cli" skill (or when using the `playwright-cli` directly), look at @.agents/security/playwright-cli.md file for additional instruction about the skill.
