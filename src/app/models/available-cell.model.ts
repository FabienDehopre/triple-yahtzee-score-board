import type { GameColumn } from './game-column.model';
import type { ScoreCategory } from './score-category.model';

/**
 * Represents a score-sheet cell that has not yet been filled
 * and is therefore eligible for score placement.
 */
export interface AvailableCell {
  /** The scoring category for this cell. */
  category: ScoreCategory;
  /** The column where this cell lives. */
  column: GameColumn;
}
