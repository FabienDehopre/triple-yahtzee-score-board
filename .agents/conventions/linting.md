# Linting

- Lint command: `pnpm lint` (runs `eslint . --fix`)
- Run after every change.
- NEVER run `prettier` — conflicts with `eslint --fix`.
- NEVER update the eslint config. Fix issues instead. If unfixable, add an inline ignore with a reason.
