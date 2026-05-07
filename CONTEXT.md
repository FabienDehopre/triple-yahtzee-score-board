# Triple Yahtzee Score Board

A digital score-keeping assistant for Triple Yahtzee. Players enter dice rolls manually; the app computes scores, tracks totals with column multipliers, and suggests optimal category placements.

## Language

### Core artifacts

**Game**:
One full Triple Yahtzee scorecard — three columns × thirteen categories × two sections (upper/lower) = 78 cells total.
_Avoid_: Sheet, scorecard, card

**DiceSet**:
A frequency map of five dice — six counts (index 0 = face-1 count … index 5 = face-6 count), always summing to 5.
_Avoid_: Roll (ambiguous), dice array, dice list

**Roll**:
The player's act of throwing five dice and entering the result. Produces a **DiceSet** once confirmed.
_Avoid_: Throw, turn input

### Score structure

**ScoreCategory**:
One of thirteen named slots where a **DiceSet** can be placed (e.g. Aces, Yahtzee, Chance).
_Avoid_: Slot, box, field

**ScoreCell**:
A single intersection of a **ScoreCategory** and a **GameColumn**. Empty until filled by placement or scratch.
_Avoid_: Box, field, entry

**Scratch**:
Intentional placement of zero in a **ScoreCell** to forfeit that category. Distinct from a naturally-scored zero.
_Avoid_: Zero-out, forfeit

**Raw Score**:
The score computed from a **DiceSet** for a **ScoreCategory** before the column multiplier is applied.
_Avoid_: Base score, unmodified score

### Triple Yahtzee mechanic

**GameColumn**:
One of three scoring columns (ONE, TWO, THREE) with multipliers ×1, ×2, ×3 respectively.
_Avoid_: Round, pass, sheet column

**Column Multiplier**:
The factor applied to all raw scores in a **GameColumn** when computing totals (ONE=×1, TWO=×2, THREE=×3).
_Avoid_: Multiplier (standalone — always qualify with "column")

**Left-to-Right Fill Rule**:
When placing a score in a **ScoreCategory**, the app always targets the leftmost unfilled **GameColumn** for that category. Players cannot skip columns.
_Avoid_: Column order, fill order

**Upper Bonus**:
35 points awarded per **GameColumn** when the sum of raw upper-section scores reaches 63 or more. Applied before the column multiplier.
_Avoid_: Bonus, section bonus

### Session

**Session**:
One play session: one to five **Games** played simultaneously, sharing a single dice input and suggestion bar.
_Avoid_: Multi-game, game set

**Game Count**:
The number of parallel **Games** in a **Session**. Player-selectable (1–5). Default: 2. Increasing the count appends empty **Games** to the tail; decreasing removes **Games** from the tail. Existing **Game** scores are never touched. A confirmation dialog appears only when decreasing the count would remove **Games** that contain scored cells.
_Avoid_: Number of games, game number

### Suggestions

**Suggestion**:
A recommended (ScoreCategory, GameColumn) placement for the current **DiceSet**, ranked by expected score impact.
_Avoid_: Hint, tip, recommendation

**Greedy Strategy**:
The only suggestion algorithm — ranks all available cells by raw score × column multiplier, descending. Ties broken by **ScoreCategory** then **GameColumn** (ascending). Implemented inline in `SuggestionEngineService`; no strategy abstraction.
_Avoid_: Algorithm, strategy (standalone)

**Suggestion Scope**:
Suggestions are computed for the currently active **Game** (tracked by `activeGameIndex` on `GameStateService`). Accepting a **Suggestion** places the score in that same active **Game**. Switching the active **Game** causes **Suggestions** to recompute immediately.
_Avoid_: Global suggestion, session suggestion

**Yahtzee Bonus**:
100 points awarded per additional Yahtzee placed after the Yahtzee **ScoreCell** in that **GameColumn** is already scored non-zero. Bonuses accumulate per column (100, 200, 300 …) and are included in the column's lower-section total (multiplied by the column multiplier). A **Scratch** on the Yahtzee **ScoreCell** disqualifies all **Yahtzee Bonuses** for that column. The bonus is visible in the column score breakdown and is correctly reversed by Undo.
_Avoid_: Bonus Yahtzee, extra Yahtzee

### Placement

**Placement**:
The act of applying a confirmed **DiceSet** to the next available **ScoreCell** for a **ScoreCategory** in the active **Game**. Triggers **Snapshot** save, **Yahtzee Bonus** check, and **Left-to-Right Fill Rule** resolution. Owned by `PlacementService`; `GameStateService` holds state but does not coordinate placement.
_Avoid_: Score entry, fill, write

### Undo

**Snapshot**:
A deep clone of all **Games** taken immediately before a placement. Enables single-step undo.
_Avoid_: State backup, history

## Relationships

- A **Session** contains one to five **Games**
- A **Game** has three **GameColumns** (ONE, TWO, THREE)
- A **GameColumn** contains thirteen **ScoreCells** per section (upper + lower)
- A **ScoreCell** belongs to exactly one **ScoreCategory** and one **GameColumn**
- A **Roll** produces a **DiceSet**; a **DiceSet** can be placed into an available **ScoreCell**
- One **Snapshot** is held at a time; placing a score replaces it, entering new dice clears it

## Example dialogue

> **Dev:** "When the player places a **DiceSet** in Yahtzee for the second time, do we score it?"
> **Domain expert:** "The second placement goes into **GameColumn** TWO — same **ScoreCategory**, next unfilled column per the **Left-to-Right Fill Rule**. It's only a Yahtzee Bonus if the Yahtzee **ScoreCell** in that column was already scored non-zero."

## Scoring rules

- **Full House** requires exactly one face with count 2 and one with count 3. Five-of-a-kind (Yahtzee) does **not** qualify — scores 0.
- **Upper Bonus** threshold is 63 raw points; bonus is 35 points, applied before the column multiplier.
- **Left-to-Right Fill Rule** is absolute — players cannot place in column TWO or THREE while column ONE is still open for that category.

## Flagged ambiguities

- "Roll" was used for both the player action and the result — resolved: **Roll** = the act, **DiceSet** = the result.
- "Game" could mean a single column pass or the full sheet — resolved: **Game** = full three-column sheet.
