import { GameColumn } from './game-column.model';
import { ScoreCategory } from './score-category.model';

/**
 * Represents the scoring suggestion produced by the suggestion engine
 * for a particular dice roll.
 */
export interface SuggestionResult {
  /** The scoring category being suggested. */
  category: ScoreCategory;
  /** The column where the score should be placed. */
  column: GameColumn;
  /** The computed score value for this suggestion. */
  score: number;
  /** Human-readable explanation of why this placement is recommended. */
  reasoning: string;
}
