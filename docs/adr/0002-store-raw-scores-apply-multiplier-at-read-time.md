# Store raw scores, apply column multiplier at read time

`ScoreCell.value` stores the raw score computed from the dice roll, before any column multiplier is applied. The column multiplier (×1, ×2, ×3) is applied in display logic and total computations at read time, never at write time.

We chose this because the data model stays multiplier-agnostic: if column multipliers change, or if we need to display raw and multiplied values side by side, no stored data needs migration. Storing the multiplied value would couple persisted data to the column configuration and make it impossible to recompute raw scores from storage alone.

## Consequences

Every place that renders a cell value or computes a total must apply the multiplier explicitly. The stored value is never what's shown to the player — callers must not read `ScoreCell.value` directly for display without going through the scoring engine or display helpers.
