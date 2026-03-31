import type { DiceSet } from '../models/dice-set.model';
import type { GameColumn } from '../models/game-column.model';
import type { Game } from '../models/game.model';
import type { ScoreCategory } from '../models/score-category.model';

import { computed, inject, Injectable, signal } from '@angular/core';

import {
  COLUMN_MULTIPLIER,
  COLUMN_ORDER,
  GAME_COLUMN,
  LOWER_CATEGORIES,
  UPPER_CATEGORIES
} from '../models/game-column.model';
import { ScoringEngineService } from './scoring-engine.service';
import { UndoService } from './undo.service';

/** Fast lookup set for upper-section categories. */
const UPPER_SET = new Set<ScoreCategory>(UPPER_CATEGORIES);

/** Per-column computed statistics for one game. */
export interface ColumnStats {
  /** Raw sum of placed upper-section scores (used for the 63-point bonus threshold check). */
  upperRaw: number;
  /** Upper bonus: 35 if upperRaw >= 63, otherwise 0. */
  upperBonus: number;
  /** (upperRaw + upperBonus) x column multiplier. */
  upperTotal: number;
  /** Raw sum of placed lower-section scores (before multiplier). */
  lowerRaw: number;
  /** lowerRaw x column multiplier. */
  lowerTotal: number;
  /** upperTotal + lowerTotal. */
  combinedTotal: number;
}

/** Returns a fresh Game with all three columns empty. */
function createEmptyGame(): Game {
  return {
    id: crypto.randomUUID(),
    columns: {
      [GAME_COLUMN.one]: { upper: {}, lower: {} },
      [GAME_COLUMN.two]: { upper: {}, lower: {} },
      [GAME_COLUMN.three]: { upper: {}, lower: {} },
    },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Central reactive state for a Triple Yahtzee session.
 * Holds the list of games and the current dice roll.
 * All state is exposed via Angular Signals.
 */
@Injectable({ providedIn: 'root' })
export class GameStateService {
  readonly #scoringEngine = inject(ScoringEngineService);
  readonly #undo = inject(UndoService);

  readonly #games = signal([createEmptyGame()]);
  readonly #currentDice = signal<DiceSet | undefined>(undefined);

  /** All current games (read-only). */
  readonly games = this.#games.asReadonly();

  /** The most recently confirmed dice roll, or undefined when no dice have been set. */
  readonly currentDice = this.#currentDice.asReadonly();

  /**
   * Computed per-game, per-column statistics.
   * The array index aligns with the games() array.
   */
  readonly columnStats = computed(() =>
    this.#games().map(
      (game) =>
        Object.fromEntries(
          COLUMN_ORDER.map((col) => [col, this.#computeColumnStats(game, col)])
        ) as Record<GameColumn, ColumnStats>
    )
  );

  /**
   * Grand total: sum of all column combined totals across all games.
   * For each game, Combined (×1) + Double Combined (×2) + Triple Combined (×3).
   */
  readonly grandTotal = computed(() => {
    let total = 0;
    for (const gameStats of this.columnStats()) {
      for (const col of COLUMN_ORDER) {
        total += gameStats[col].combinedTotal;
      }
    }
    return total;
  });

  /**
   * True when every category in every column of every game has been scored.
   * Triggers the game-over flow.
   */
  readonly isGameOver = computed(() => {
    const games = this.#games();
    if (games.length === 0) return false;
    for (const game of games) {
      for (const col of COLUMN_ORDER) {
        for (const cat of UPPER_CATEGORIES) {
          if (game.columns[col].upper[cat] === undefined) return false;
        }
        for (const cat of LOWER_CATEGORIES) {
          if (game.columns[col].lower[cat] === undefined) return false;
        }
      }
    }
    return true;
  });

  /**
   * Updates the current dice roll used for potential-score preview
   * and subsequent placeScore calls.
   */
  setCurrentDice(dice: DiceSet): void {
    this.#undo.clearSnapshot();
    this.#currentDice.set(dice);
  }

  /**
   * Resets the game state to a fresh single empty game and clears the current dice.
   * Called from the game-over screen to start a new session.
   */
  newGame(): void {
    this.#games.set([createEmptyGame()]);
    this.#currentDice.set(undefined);
  }

  /**
   * Places the score for category in the next available column of game gameIndex.
   * Columns are filled left-to-right: ONE -> TWO -> THREE.
   *
   * No-ops when:
   * - no dice are currently set
   * - gameIndex is out of bounds
   * - all three columns are already filled for this category
   */
  placeScore(category: ScoreCategory, gameIndex: number): void {
    const dice = this.#currentDice();
    if (!dice) return;

    const games = this.#games();
    if (gameIndex < 0 || gameIndex >= games.length) return;

    const game = games[gameIndex];
    const isUpper = UPPER_SET.has(category);

    // Find the first unfilled column for this category (left-to-right).
    const column = COLUMN_ORDER.find((col) => {
      const section = isUpper ? game.columns[col].upper : game.columns[col].lower;
      return !section[category];
    });

    if (!column) return;

    this.#undo.saveSnapshot(this.#games(), category);

    const rawScore = this.#scoringEngine.computeScore(dice, category);
    const sectionKey = isUpper ? 'upper' : 'lower';

    this.#games.update((gs) =>
      gs.map((g, i) => {
        if (i !== gameIndex) return g;
        return {
          ...g,
          columns: {
            ...g.columns,
            [column]: {
              ...g.columns[column],
              [sectionKey]: {
                ...g.columns[column][sectionKey],
                [category]: { value: rawScore, isScratched: rawScore === 0 },
              },
            },
          },
        };
      })
    );
  }

  /**
   * Restores the games array to a previously saved snapshot.
   * Called by the undo flow after retrieving the snapshot from UndoService.
   */
  restoreGames(games: Game[]): void {
    this.#games.set(games);
  }

  #computeColumnStats(game: Game, column: GameColumn): ColumnStats {
    const multiplier = COLUMN_MULTIPLIER[column];
    const colScores = game.columns[column];

    let upperRaw = 0;
    for (const cat of UPPER_CATEGORIES) {
      const cell = colScores.upper[cat];
      upperRaw += cell?.value ?? 0;
    }

    const upperBonus = this.#scoringEngine.computeUpperBonus(upperRaw);
    const upperTotal = (upperRaw + upperBonus) * multiplier;

    let lowerRaw = 0;
    for (const cat of LOWER_CATEGORIES) {
      const cell = colScores.lower[cat];
      lowerRaw += cell?.value ?? 0;
    }

    const lowerTotal = lowerRaw * multiplier;
    const combinedTotal = upperTotal + lowerTotal;

    return { upperRaw, upperBonus, upperTotal, lowerRaw, lowerTotal, combinedTotal };
  }
}
