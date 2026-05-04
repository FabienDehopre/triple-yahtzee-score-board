# Single-step undo by design

The undo system keeps exactly one snapshot — the state immediately before the last score placement. Only that one action can be undone. Entering new dice clears the snapshot, making undo unavailable until the next placement.

Scorekeeping is deliberate: players read the dice, decide where to place, then confirm. A single safety net covers the common case (misclick, change of mind). A full undo stack would add complexity with little practical benefit in this domain, and could encourage sloppy play by making reversals feel cheap.

## Considered options

- **Undo stack** — allow arbitrarily many undos. Rejected: overkill for a scorekeeping tool where each placement is a considered decision.
- **No undo** — rejected: misclicks happen, especially on mobile.
