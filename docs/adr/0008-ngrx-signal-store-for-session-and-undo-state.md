# Use NgRx SignalStore for session and undo state

Session state and undo state live in two `signalStore`s from `@ngrx/signals`: `SessionStore` and `UndoStore`. `SessionStore` holds the games array, game count, active game index, and current dice, and exposes both read-models (`columnStats`, `grandTotal`, `isGameOver`, `suggestions`) and the placement and undo orchestration methods. `UndoStore` holds the single-step snapshot and exposes `canUndo`, `lastCategory`, `saveSnapshot`, `clearSnapshot`, and a snapshot getter; it has no knowledge of `SessionStore`.

Persistence is declarative via `withStorageSync` from NgRx Toolkit, keyed `triple-yahtzee-state`, selecting `{ games, gameCount }` to match the existing payload shape. `PersistenceManagerService` is deleted. If `withStorageSync` cannot project a partial state slice, `withHooks({ onInit })` performs the same read/write inline.

`PlacementService` is deleted; placement lives as `withMethods` on `SessionStore`. `SessionStore.placeScore` saves the snapshot, computes the raw score and Yahtzee Bonus via `ScoringEngineService`, applies the **Left-to-Right Fill Rule**, and writes the result. `SessionStore.setCurrentDice` clears the undo snapshot first (placement-coupled per ADR-0003). `SessionStore.undo` reads the snapshot from `UndoStore`, restores games, and clears the snapshot — the `UndoBannerComponent` no longer orchestrates two services.

The pure compute services (`ScoringEngineService`, `SuggestionEngineService`) remain `@Injectable({ providedIn: 'root' })`. `SuggestionEngineService` gains a pure `computeSuggestions(dice, game)` method; the reactive `suggestions` computed lives on `SessionStore.withComputed` and reads `dice`/`games`/`activeGameIndex`.

## Considered options

- **Single `SessionStore` merging undo** — folds snapshot into the same store. Rejected: snapshot has a different lifecycle (cleared on new dice, never persisted) and would force exclusion filters on `withStorageSync`. Two stores keep concerns crisp.
- **Three stores (`SessionStore`, `UndoStore`, `PersistenceStore`)** — extract persistence as its own store. Rejected: persistence is cross-cutting infra, not domain state; `withStorageSync` collapses it to one line of config.
- **Keep `PersistenceManagerService`** — leave persistence outside SignalStore. Rejected: NgRx Toolkit was already an accepted dependency in the issue scope, and `withStorageSync` deletes ~70 lines of hand-rolled validate/save/restore.
- **`UndoStore` injects `SessionStore` (undo direction)** — `UndoStore.undo()` pushes games back. Rejected: creates two-way knowledge between stores. Single direction (`SessionStore` → `UndoStore`) matches placement and stays acyclic.
- **Reactive snapshot-clear via `effect` watching `currentDice`** — `UndoStore` watches `SessionStore.currentDice` and clears on change. Rejected: reverses dependency direction (the rejected two-way coupling) and fires on `setCurrentDice(undefined)` after placement, clearing the snapshot we just saved.

## Supersedes

[ADR-0006](./0006-separate-placement-coordinator-from-state-container.md). The placement-coordinator split was the right shape for vanilla `@Injectable` services — it kept rule changes localized and prevented a god-module. Under SignalStore, `withMethods` is the idiomatic seam for the same concern: placement is a named method on a store, not buried in a 320-line class. The original justification (one module to change when a scoring rule changes) is preserved — `SessionStore.placeScore` is that module — without paying for a separate file.
