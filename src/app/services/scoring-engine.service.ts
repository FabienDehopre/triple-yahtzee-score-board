import type { ColumnStats } from '../models/column-stats.model';
import type { DiceSet } from '../models/dice-set.model';
import type { GameColumn } from '../models/game-column.model';
import type { Game } from '../models/game.model';
import type { ScoreCategory } from '../models/score-category.model';

import { Injectable } from '@angular/core';

import { columnCells } from '../models/game-cells';
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

/** Fixed score for a full house (three of one face and two of another). */
const FULL_HOUSE_VALUE = 25;

/** Fixed score for a small straight (four consecutive faces). */
const SMALL_STRAIGHT_VALUE = 30;

/** Fixed score for a large straight (five consecutive faces). */
const LARGE_STRAIGHT_VALUE = 40;

/** Fixed score for a Yahtzee (five dice showing the same face). */
const YAHTZEE_VALUE = 50;

/** Returns true when the dice contain a run of `length` consecutive faces. */
function hasStraight(dice: DiceSet, length: number): boolean {
  let run = 0;
  for (const count of dice) {
    run = count > 0 ? run + 1 : 0;
    if (run >= length) return true;
  }
  return false;
}

/** Builds a scorer that sums the dice showing the given face. */
function faceScorer(face: number): (dice: DiceSet) => number {
  return (dice) => dice[face - 1] * face;
}

/** Builds a scorer that sums all dice when at least `count` share a face. */
function ofAKindScorer(count: number): (dice: DiceSet) => number {
  return (dice) => (dice.some((faceCount) => faceCount >= count) ? sumDice(dice) : 0);
}

/** Raw (un-multiplied) scorer for each category. */
const SCORERS: Record<ScoreCategory, (dice: DiceSet) => number> = {
  // ── Upper section: sum of matching face values ─────────────────────────
  [SCORE_CATEGORY.aces]: faceScorer(1),
  [SCORE_CATEGORY.twos]: faceScorer(2),
  [SCORE_CATEGORY.threes]: faceScorer(3),
  [SCORE_CATEGORY.fours]: faceScorer(4),
  [SCORE_CATEGORY.fives]: faceScorer(5),
  [SCORE_CATEGORY.sixes]: faceScorer(6),
  // ── Lower section: combination-based ──────────────────────────────────
  [SCORE_CATEGORY.threeOfAKind]: ofAKindScorer(3),
  [SCORE_CATEGORY.fourOfAKind]: ofAKindScorer(4),
  [SCORE_CATEGORY.fullHouse]: (dice) => (dice.includes(3) && dice.includes(2) ? FULL_HOUSE_VALUE : 0),
  [SCORE_CATEGORY.smallStraight]: (dice) => (hasStraight(dice, 4) ? SMALL_STRAIGHT_VALUE : 0),
  [SCORE_CATEGORY.largeStraight]: (dice) => (hasStraight(dice, 5) ? LARGE_STRAIGHT_VALUE : 0),
  [SCORE_CATEGORY.yahtzee]: (dice) => (dice.includes(5) ? YAHTZEE_VALUE : 0),
  [SCORE_CATEGORY.chance]: sumDice,
};

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
    return SCORERS[category](dice);
  }

  /**
   * Applies the column multiplier to a raw score.
   * Column ONE: ×1, TWO: ×2, THREE: ×3.
   */
  applyMultiplier(score: number, column: GameColumn): number {
    return score * COLUMN_MULTIPLIER[column];
  }

  /** Computes the raw score for dice + category, then applies the column multiplier. */
  computeMultipliedScore(dice: DiceSet, category: ScoreCategory, column: GameColumn): number {
    return this.computeScore(dice, category) * COLUMN_MULTIPLIER[column];
  }

  /**
   * Returns the upper-section bonus (35) when the upper total meets or
   * exceeds the threshold (63), otherwise 0.
   */
  computeUpperBonus(upperTotal: number): number {
    return upperTotal >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_VALUE : 0;
  }

  /**
   * Computes all per-column statistics for the given game column,
   * including multiplied totals. Pure — no side effects or service deps.
   */
  computeColumnStats(game: Game, column: GameColumn): ColumnStats {
    const multiplier = COLUMN_MULTIPLIER[column];

    let upperRaw = 0;
    let lowerRaw = 0;
    for (const { section, cell } of columnCells(game, column)) {
      if (section === 'upper') upperRaw += cell?.value ?? 0;
      else lowerRaw += cell?.value ?? 0;
    }

    const upperBonusRaw = this.computeUpperBonus(upperRaw);
    const upperBonusTotal = upperBonusRaw * multiplier;
    const upperTotal = (upperRaw + upperBonusRaw) * multiplier;

    const yahtzeeBonusRaw = game.columns[column].yahtzeeBonus ?? 0;
    const yahtzeeBonusTotal = yahtzeeBonusRaw * multiplier;
    const lowerTotal = (lowerRaw + yahtzeeBonusRaw) * multiplier;
    const combinedTotal = upperTotal + lowerTotal;

    return {
      upperRaw,
      upperBonusRaw,
      upperBonusTotal,
      upperTotal,
      lowerRaw,
      yahtzeeBonusRaw,
      yahtzeeBonusTotal,
      lowerTotal,
      combinedTotal,
    };
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
