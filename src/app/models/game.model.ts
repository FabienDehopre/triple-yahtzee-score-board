import type { ColumnScores, GameColumn } from './game-column.model';
import type { ScoreCategory } from './score-category.model';

import { readCell } from './game-cells';
import { COLUMN_ORDER } from './game-column.model';

/**
 * Represents a complete Triple Yahtzee game session.
 * A game has three columns (ONE, TWO, THREE), each with upper and lower section scores.
 */
export interface Game {
  /** Unique identifier for the game session. */
  id: string;
  /** Score data for each of the three columns. */
  columns: Record<GameColumn, ColumnScores>;
  /** ISO timestamp when the game was created. */
  createdAt: string;
}

/**
 * Returns the leftmost unfilled column for the given category in the given game.
 * Columns are checked in left-to-right order: ONE → TWO → THREE.
 * Returns undefined when all three columns are already filled.
 */
export function nextUnfilledColumn(game: Game, category: ScoreCategory): GameColumn | undefined {
  for (const col of COLUMN_ORDER) {
    if (!readCell(game, col, category)) return col;
  }
  return undefined;
}
