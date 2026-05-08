/** Per-column computed statistics for one game. */
export interface ColumnStats {
  /** Raw sum of placed upper-section scores (used for the 63-point bonus threshold check). */
  upperRaw: number;
  /** Upper bonus raw value: 35 if upperRaw >= 63, otherwise 0. */
  upperBonusRaw: number;
  /** upperBonusRaw × column multiplier. */
  upperBonusTotal: number;
  /** (upperRaw + upperBonusRaw) × column multiplier. */
  upperTotal: number;
  /** Raw sum of placed lower-section scores (before multiplier). */
  lowerRaw: number;
  /** Accumulated Yahtzee bonus raw: 100 per extra Yahtzee rolled while Yahtzee cell is non-zero. */
  yahtzeeBonusRaw: number;
  /** yahtzeeBonusRaw × column multiplier. */
  yahtzeeBonusTotal: number;
  /** (lowerRaw + yahtzeeBonusRaw) × column multiplier. */
  lowerTotal: number;
  /** upperTotal + lowerTotal. */
  combinedTotal: number;
}
