import type { ColumnScores, GameColumn } from './game-column.model';
import type { Game } from './game.model';
import type { ScoreCategory } from './score-category.model';
import type { ScoreCell } from './score-cell.model';

import { COLUMN_ORDER, LOWER_CATEGORIES, UPPER_CATEGORIES } from './game-column.model';

/**
 * The single deep module that owns Game-cell access: section resolution,
 * cell read, immutable cell write, and grid iteration. No other module
 * indexes `columns.upper` / `columns.lower` or rebuilds an upper-category set.
 */

/** The two sections of a game column. */
export type Section = keyof Pick<ColumnScores, 'lower' | 'upper'>;

/** The single source of upper/lower membership. */
const UPPER_SET = new Set<ScoreCategory>(UPPER_CATEGORIES);

/** One cell visited during grid iteration, with its resolved section. */
export interface CellEntry {
  column: GameColumn;
  category: ScoreCategory;
  section: Section;
  /** The cell value, or undefined when the cell is empty. */
  cell: ScoreCell | undefined;
}

/** Resolves which section a category belongs to — replaces every ad-hoc `new Set(UPPER_CATEGORIES)`. */
export function sectionOf(category: ScoreCategory): Section {
  return UPPER_SET.has(category) ? 'upper' : 'lower';
}

/** Reads one cell, or undefined when empty. The caller never names the section. */
export function readCell(game: Game, column: GameColumn, category: ScoreCategory): ScoreCell | undefined {
  return game.columns[column][sectionOf(category)][category];
}

/**
 * Returns a new Game with the one cell set, structurally sharing the rest.
 * Writes a single cell only — Yahtzee-bonus accumulation stays the caller's
 * concern (see {@link addYahtzeeBonus}).
 */
export function writeCell(game: Game, column: GameColumn, category: ScoreCategory, cell: ScoreCell): Game {
  const section = sectionOf(category);
  const col = game.columns[column];
  return {
    ...game,
    columns: {
      ...game.columns,
      [column]: {
        ...col,
        [section]: { ...col[section], [category]: cell },
      },
    },
  };
}

/** Returns a new Game with `amount` added to the column's accumulated Yahtzee bonus. */
export function addYahtzeeBonus(game: Game, column: GameColumn, amount: number): Game {
  const col = game.columns[column];
  return {
    ...game,
    columns: {
      ...game.columns,
      [column]: { ...col, yahtzeeBonus: (col.yahtzeeBonus ?? 0) + amount },
    },
  };
}

/** Visits the cells of one column in upper-then-lower category order. */
export function* columnCells(game: Game, column: GameColumn): Generator<CellEntry> {
  for (const category of UPPER_CATEGORIES) {
    yield { column, category, section: 'upper', cell: game.columns[column].upper[category] };
  }
  for (const category of LOWER_CATEGORIES) {
    yield { column, category, section: 'lower', cell: game.columns[column].lower[category] };
  }
}

/** Visits every cell of the game, column by column, upper-then-lower within each. */
export function* eachCell(game: Game): Generator<CellEntry> {
  for (const column of COLUMN_ORDER) {
    yield* columnCells(game, column);
  }
}
