# DiceSet as a frequency map

`DiceSet` is represented as a 6-tuple of face counts (index 0 = count of face-1 dice … index 5 = count of face-6 dice), not as a list of individual die values. Five dice showing `[3,3,5,5,5]` are stored as `[0,0,2,0,3,0]`.

We chose this because every scoring category reduces to a lookup into this array (e.g. `dice[face-1]` for upper section, `dice.includes(3)` for Full House), making all scoring logic O(1) with no iteration over individual dice. The natural alternative — a 5-element list of face values — would require sorting or scanning on every score computation.

## Consequences

All code that produces or consumes dice values must work in frequency-map form. Converting from raw die values (e.g. from a future dice-roller feature) requires a mapping step before any scoring call.
