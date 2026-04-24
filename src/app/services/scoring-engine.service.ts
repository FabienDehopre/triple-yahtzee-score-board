import type { DiceSet } from '../models/dice-set.model';
import type { GameColumn } from '../models/game-column.model';
import type { ScoreCategory } from '../models/score-category.model';

import { Injectable } from '@angular/core';

import { COLUMN_MULTIPLIER } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';

/** Points awarded for reaching the upper-section bonus threshold. */
const UPPER_BONUS_VALUE = 35;

/** Minimum upper-section total required to earn the upper bonus. */
const UPPER_BONUS_THRESHOLD = 63;

/** Points awarded for each additional Yahtzee rolled after the first. */
const YAHTZEE_BONUS_VALUE = 100;

/**
 * Returns the weighted sum of all dice (face value × count for every face).
 * For a DiceSet of [c1, c2, c3, c4, c5, c6]:
 *   sum = 1·c1 + 2·c2 + 3·c3 + 4·c4 + 5·c5 + 6·c6
 */
function sumDice(dice: DiceSet): number {
  return dice.reduce((sum, count, index) => sum + count * (index + 1), 0);
}

/**
 * Pure-function service that computes Yahtzee scores.
 * Has no side effects and no dependencies on other services.
 */
@Injectable({ providedIn: 'root' })
export class ScoringEngineService {
  /**
   * Computes the raw score for the given dice and category.
   * Does NOT apply column multipliers.
   */
  computeScore(dice: DiceSet, category: ScoreCategory): number {
    switch (category) {
      // ── Upper section: sum of matching face values ─────────────────────────
      case SCORE_CATEGORY.aces:
        return dice[0] * 1;
      case SCORE_CATEGORY.chance:
        return sumDice(dice);
      case SCORE_CATEGORY.fives:
        return dice[4] * 5;
      case SCORE_CATEGORY.fourOfAKind:
        return dice.some((count) => count >= 4) ? sumDice(dice) : 0;
      case SCORE_CATEGORY.fours:
        return dice[3] * 4;
      case SCORE_CATEGORY.fullHouse: {
        const hasThree = dice.includes(3);
        const hasTwo = dice.includes(2);
        return hasThree && hasTwo ? 25 : 0;
      }

      case SCORE_CATEGORY.largeStraight: {
        const hasFace = (face: number) => dice[face - 1] > 0;
        const isLarge =
          (hasFace(1) && hasFace(2) && hasFace(3) && hasFace(4) && hasFace(5)) ||
          (hasFace(2) && hasFace(3) && hasFace(4) && hasFace(5) && hasFace(6));
        return isLarge ? 40 : 0;
      }

      case SCORE_CATEGORY.sixes:
        return dice[5] * 6;

      case SCORE_CATEGORY.smallStraight: {
        const hasFace = (face: number) => dice[face - 1] > 0;
        const isSmall =
          (hasFace(1) && hasFace(2) && hasFace(3) && hasFace(4)) ||
          (hasFace(2) && hasFace(3) && hasFace(4) && hasFace(5)) ||
          (hasFace(3) && hasFace(4) && hasFace(5) && hasFace(6));
        return isSmall ? 30 : 0;
      }

      // ── Lower section: combination-based ──────────────────────────────────
      case SCORE_CATEGORY.threeOfAKind:
        return dice.some((count) => count >= 3) ? sumDice(dice) : 0;

      case SCORE_CATEGORY.threes:
        return dice[2] * 3;

      case SCORE_CATEGORY.twos:
        return dice[1] * 2;

      case SCORE_CATEGORY.yahtzee:
        return dice.includes(5) ? 50 : 0;
    }
  }

  /**
   * Applies the column multiplier to a raw score.
   * Column ONE: ×1, TWO: ×2, THREE: ×3.
   */
  applyMultiplier(score: number, column: GameColumn): number {
    return score * COLUMN_MULTIPLIER[column];
  }

  /**
   * Returns the upper-section bonus (35) when the upper total meets or
   * exceeds the threshold (63), otherwise 0.
   */
  computeUpperBonus(upperTotal: number): number {
    return upperTotal >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_VALUE : 0;
  }

  /**
   * Returns the Yahtzee bonus (100) when the current dice form a Yahtzee
   * AND the Yahtzee category has already been scored with a non-zero value.
   * Returns 0 if the dice are not a Yahtzee, or if the Yahtzee row has not
   * yet been scored (null) or was scratched (0).
   */
  computeYahtzeeBonus(dice: DiceSet, existingYahtzeeScore: number | null): number {
    const isYahtzee = dice.includes(5);
    if (isYahtzee && existingYahtzeeScore !== null && existingYahtzeeScore > 0) {
      return YAHTZEE_BONUS_VALUE;
    }
    return 0;
  }
}
