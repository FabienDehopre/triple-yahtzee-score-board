/**
 * Represents a single scored cell on the score board.
 * A cell exists in the section map only when it has been scored.
 * Absence from the Partial<SectionScores> map means the cell is empty (not yet played).
 * A scratched cell has value 0 and isScratched true.
 */
export interface ScoreCell {
  /** The numeric score for this cell. */
  value: number;
  /** True when the player has scratched (forfeited) this category in this column. */
  isScratched: boolean;
}
