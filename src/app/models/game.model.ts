import type { ColumnScores, GameColumn } from './game-column.model';
import type { ScoreCategory } from './score-category.model';
import type { ScoreCell } from './score-cell.model';

import { COLUMN_ORDER, LOWER_CATEGORIES, UPPER_CATEGORIES } from './game-column.model';

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

export type ScoreSection = 'lower' | 'upper';

export interface GameCellEntry {
  column: GameColumn;
  section: ScoreSection;
  category: ScoreCategory;
  cell: ScoreCell | undefined;
}

/** Lookup set for upper-section categories, centralized for all Game cell access. */
const UPPER_CATEGORY_SET = new Set<ScoreCategory>(UPPER_CATEGORIES);

export function resolveScoreSection(category: ScoreCategory): ScoreSection {
  return UPPER_CATEGORY_SET.has(category) ? 'upper' : 'lower';
}

export function readScoreCell(
  game: Game,
  column: GameColumn,
  category: ScoreCategory
): ScoreCell | undefined {
  return game.columns[column][resolveScoreSection(category)][category];
}

export function writeScoreCell(
  game: Game,
  column: GameColumn,
  category: ScoreCategory,
  cell: ScoreCell
): Game {
  const section = resolveScoreSection(category);
  return {
    ...game,
    columns: {
      ...game.columns,
      [column]: {
        ...game.columns[column],
        [section]: {
          ...game.columns[column][section],
          [category]: cell,
        },
      },
    },
  };
}

export function writeColumnYahtzeeBonus(
  game: Game,
  column: GameColumn,
  yahtzeeBonus: number
): Game {
  return {
    ...game,
    columns: {
      ...game.columns,
      [column]: {
        ...game.columns[column],
        yahtzeeBonus,
      },
    },
  };
}

export function* gameColumnCellEntries(game: Game, column: GameColumn): Iterable<GameCellEntry> {
  for (const category of UPPER_CATEGORIES) {
    yield {
      column,
      section: 'upper',
      category,
      cell: readScoreCell(game, column, category),
    };
  }

  for (const category of LOWER_CATEGORIES) {
    yield {
      column,
      section: 'lower',
      category,
      cell: readScoreCell(game, column, category),
    };
  }
}

export function* gameCellEntries(game: Game): Iterable<GameCellEntry> {
  for (const column of COLUMN_ORDER) {
    yield* gameColumnCellEntries(game, column);
  }
}

/**
 * Returns the leftmost unfilled column for the given category in the given game.
 * Columns are checked in left-to-right order: ONE → TWO → THREE.
 * Returns undefined when all three columns are already filled.
 */
export function nextUnfilledColumn(game: Game, category: ScoreCategory): GameColumn | undefined {
  for (const col of COLUMN_ORDER) {
    if (readScoreCell(game, col, category) === undefined) return col;
  }
  return undefined;
}
