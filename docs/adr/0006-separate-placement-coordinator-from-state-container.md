# Separate placement coordinator from game state container

`GameStateService` is a state container: it holds the games array, dice, game count, and active game index as signals, plus computed read-models (`columnStats`, `grandTotal`, `isGameOver`). It exposes low-level mutators (`updateGameAt`, `restoreGames`, etc.) but does not encode placement rules.

`PlacementService` is the operation coordinator: it owns the **Placement** action — applying a confirmed **DiceSet** to the next available **ScoreCell**. It computes the raw score via `ScoringEngineService`, applies **Yahtzee Bonus** rules, saves a **Snapshot** to `UndoService`, and writes the new game tree through `GameStateService`'s mutator. It also owns `setCurrentDice` because entering new dice clears the snapshot — a placement-coupled concern.

This split exists because placement is the test surface for scoring rules. When the rule for **Yahtzee Bonus** or **Left-to-Right Fill Rule** changes, the failing test points at one module. Mixing placement into the state container forced rule changes to thread through a service that also owned session lifecycle and read-model computation — three responsibilities, one file.

## Considered options

- **Single `GameStateService`** — keep state, lifecycle, read models, and placement together. Rejected: 320-line god-module; placement bugs require tracing three concerns; test seam buried.
- **Move state into `PlacementService`** — placement owns the games signal; GameState becomes a read facade. Rejected: state container framing is the easier mental model; reads outnumber writes; facade adds indirection without buying clarity.
- **Third state container (`SessionStore`) shared by both** — both services depend on a third party that holds signals. Rejected: speculative; current split is reversible if a third consumer emerges.
