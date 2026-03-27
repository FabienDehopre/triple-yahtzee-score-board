/**
 * Represents a single scored cell on the score board.
 * Either a numeric score has been entered, or the cell has been scratched (forfeited).
 * A cell with `value === null` and `isScratched === false` is empty (not yet scored).
 */
export interface ScoreCell {
  /** The numeric score for this cell, or null if not yet scored. */
  value: number | null;
  /** True when the player has scratched (forfeited) this category in this column. */
  isScratched: boolean;
}
