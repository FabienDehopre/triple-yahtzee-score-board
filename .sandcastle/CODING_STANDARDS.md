# Coding Standards

## Style

- Angular 21.2+ standalone components — no NgModule, every component declares its `imports` array
- `ChangeDetectionStrategy.OnPush` on every component — no exceptions
- Dependency injection via `inject()` — never constructor parameter injection
- Private dependencies: `readonly #fieldName = inject(Service)` (JS private field `#` syntax)
- Template-accessible properties marked `protected`, not `public`
- `import type { ... }` for type-only imports; plain `import` for values/functions
- Named exports only — no default exports
- Enum-like constants: `export const FOO = { ... } as const` + `export type Foo = typeof FOO[keyof typeof FOO]` — never TypeScript `enum`
- Formatting: Prettier with `printWidth: 100`, `singleQuote: true`, angular HTML parser — run via ESLint (`eslint . --fix`), never `prettier` directly
- ESLint auto-fixes on pre-commit (nano-staged) and after every change

## Angular Signals

- Mutable state: `signal()` — never `BehaviorSubject`, `Subject`, or zone-based observables for local state
- Derived state: `computed()` — never manually synced properties
- Side effects: `effect()` initialized in the constructor
- Component outputs: `output()` function — never `@Output` + `EventEmitter`
- Service state: write signal is private (`readonly #state = signal(...)`), exposed as readonly (`readonly state = this.#state.asReadonly()`)
- State mutations use immutable spread: `this.#state.update(s => ({ ...s, field: newValue }))`

## Architecture

- All services `@Injectable({ providedIn: 'root' })` — no module-scoped or component-scoped providers
- `DiceSet` is a 6-tuple frequency map — index 0 = ones count, index 5 = sixes count (ADR-0001)
- `ScoreCell.value` stores the raw score without multiplier; apply `COLUMN_MULTIPLIER[col]` at read time (ADR-0002)
- Undo: single snapshot only — one level, no stack (ADR-0003)
- Persistence: localStorage only — no backend, no accounts (ADR-0005)
- Architecture decisions live in `docs/adr/` — consult before changing core data models

## Testing

- Framework: Vitest + `@testing-library/angular` + `@testing-library/user-event`
- TDD: write a failing test first, then implement
- Component tests: `render(Component)` then `screen.getByTestId()` / `screen.findByTestId()` for queries
- Service tests: `TestBed.inject(Service)` then call methods and read signal values directly
- Structure: `describe()` / `test()` blocks — never `it()`
- User interactions: `const user = userEvent.setup()` then `await user.click(...)` etc.
- Query strategy: prefer `data-testid` attributes for element selection
- Helper functions are allowed for repetitive test setup (e.g. filling all score cells)

## E2E

- Playwright via the `playwright-cli` skill — never raw Playwright MCP calls
- Test files live in `e2e/`
