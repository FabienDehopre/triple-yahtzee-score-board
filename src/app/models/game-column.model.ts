import type { ScoreCategory } from './score-category.model';
import type { ScoreCell } from './score-cell.model';

import { SCORE_CATEGORY } from './score-category.model';

/**
 * The three columns played in Triple Yahtzee, each scored with a different multiplier.
 */
export const GAME_COLUMN = {
  /** First column — scores are multiplied by ×1. */
  one: 'ONE',
  /** Second column — scores are multiplied by ×2. */
  two: 'TWO',
  /** Third column — scores are multiplied by ×3. */
  three: 'THREE',
} as const;

export type GameColumn = typeof GAME_COLUMN[keyof typeof GAME_COLUMN];

/** Multiplier applied to each column's final score. */
export const COLUMN_MULTIPLIER: Record<GameColumn, number> = {
  [GAME_COLUMN.one]: 1,
  [GAME_COLUMN.two]: 2,
  [GAME_COLUMN.three]: 3,
};

/** The three game columns in their left-to-right play order. */
export const COLUMN_ORDER: GameColumn[] = [GAME_COLUMN.one, GAME_COLUMN.two, GAME_COLUMN.three];

/** Upper section categories (Aces – Sixes). */
export const UPPER_CATEGORIES: ScoreCategory[] = [
  SCORE_CATEGORY.aces,
  SCORE_CATEGORY.twos,
  SCORE_CATEGORY.threes,
  SCORE_CATEGORY.fours,
  SCORE_CATEGORY.fives,
  SCORE_CATEGORY.sixes,
];

/** Lower section categories (combination-based). */
export const LOWER_CATEGORIES: ScoreCategory[] = [
  SCORE_CATEGORY.threeOfAKind,
  SCORE_CATEGORY.fourOfAKind,
  SCORE_CATEGORY.fullHouse,
  SCORE_CATEGORY.smallStraight,
  SCORE_CATEGORY.largeStraight,
  SCORE_CATEGORY.yahtzee,
  SCORE_CATEGORY.chance,
];

/** Score cells for one complete section (upper or lower) of a single column, keyed by category. */
export type SectionScores = Record<ScoreCategory, ScoreCell>;

/**
 * All scores for one column, split into upper and lower sections.
 * Each section is stored as a partial record because cells start empty
 * and are filled in as the game progresses.
 */
export interface ColumnScores {
  upper: Partial<SectionScores>;
  lower: Partial<SectionScores>;
  /** Accumulated Yahtzee bonus points for this column (100 per extra Yahtzee while Yahtzee cell is non-zero). */
  yahtzeeBonus?: number;
}
