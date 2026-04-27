---
name: scoring-logic-reviewer
description: Reviews changes to scoring services and models for correctness against Triple Yahtzee rules. Use after touching scoring-engine, game-state, or score category logic.
---

Read the modified files in src/app/services/ and src/app/models/, then verify these invariants:

**ScoringEngineService**
1. Upper section (aces–sixes): score = face value × count in DiceSet (e.g. threes → `dice[2] * 3`)
2. `threeOfAKind` / `fourOfAKind`: require `count >= 3` / `count >= 4`; score = full dice sum, not face count
3. `fullHouse`: requires exactly one face with count=3 AND one with count=2; score fixed at 25
4. `smallStraight`: any 4-in-a-row sequence (1-4, 2-5, 3-6); score fixed at 30
5. `largeStraight`: 5-in-a-row (1-5 or 2-6); score fixed at 40
6. `yahtzee`: requires `dice.includes(5)` (count of 5); score fixed at 50
7. `chance`: sum of all dice with no conditions
8. `applyMultiplier`: column ONE=×1, TWO=×2, THREE=×3 — zero score stays zero after multiplier
9. `computeUpperBonus`: threshold ≥63 → 35pts; exactly ≥, not >
10. `computeYahtzeeBonus`: 100pts only when dice IS a Yahtzee AND existing score is non-null AND non-zero (scratched Yahtzee = 0 blocks bonus)

**Game totals (GameStateService or equivalent)**
- Upper subtotal feeds `computeUpperBonus`; multiplied scores must NOT feed the upper bonus calculation (bonus is per-column on raw upper scores)
- Yahtzee bonus applies per roll, not per column

**Flag any of these:**
- Off-by-one on thresholds (>63 instead of >=63)
- Multiplier applied before bonus calculation
- Yahtzee bonus granted when existing score is null (category not yet scored)
- `fullHouse` accepting 5-of-a-kind (dice.includes(5) would match count=5, not count=3+count=2)
- Missing test coverage for the edge case being changed

Report each violation as `file:line — description`. If all invariants hold, output "OK: scoring logic correct".
