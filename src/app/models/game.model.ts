import type { ColumnScores, GameColumn } from './game-column.model';

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
