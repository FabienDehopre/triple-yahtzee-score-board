import { ScoreCategory } from './score-category.model';
import { ScoreCell } from './score-cell.model';

/**
 * The three columns played in Triple Yahtzee, each scored with a different multiplier.
 */
export enum GameColumn {
  /** First column — scores are multiplied by ×1. */
  ONE = 'ONE',
  /** Second column — scores are multiplied by ×2. */
  TWO = 'TWO',
  /** Third column — scores are multiplied by ×3. */
  THREE = 'THREE',
}

/** Multiplier applied to each column's final score. */
export const COLUMN_MULTIPLIER: Record<GameColumn, number> = {
  [GameColumn.ONE]: 1,
  [GameColumn.TWO]: 2,
  [GameColumn.THREE]: 3,
};

/** Upper section categories (Aces – Sixes). */
export const UPPER_CATEGORIES: ScoreCategory[] = [
  ScoreCategory.Aces,
  ScoreCategory.Twos,
  ScoreCategory.Threes,
  ScoreCategory.Fours,
  ScoreCategory.Fives,
  ScoreCategory.Sixes,
];

/** Lower section categories (combination-based). */
export const LOWER_CATEGORIES: ScoreCategory[] = [
  ScoreCategory.ThreeOfAKind,
  ScoreCategory.FourOfAKind,
  ScoreCategory.FullHouse,
  ScoreCategory.SmallStraight,
  ScoreCategory.LargeStraight,
  ScoreCategory.Yahtzee,
  ScoreCategory.Chance,
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
}
