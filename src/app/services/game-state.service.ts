import type { DiceSet } from '../models/dice-set.model';
import type { GameColumn } from '../models/game-column.model';
import type { Game } from '../models/game.model';

import { computed, inject, Injectable, signal } from '@angular/core';

import {
  COLUMN_MULTIPLIER,
  COLUMN_ORDER,
  GAME_COLUMN,
  LOWER_CATEGORIES,
  UPPER_CATEGORIES
} from '../models/game-column.model';
import { ScoringEngineService } from './scoring-engine.service';

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
  /** Accumulated Yahtzee bonus: 100 per extra Yahtzee rolled while Yahtzee cell is non-zero. */
  yahtzeeBonus: number;
  /** (lowerRaw + yahtzeeBonus) x column multiplier. */
  lowerTotal: number;
  /** upperTotal + lowerTotal. */
  combinedTotal: number;
}

/** Returns a fresh Game with all three columns empty. */
function createEmptyGame(): Game {
  return {
    id: crypto.randomUUID(),
    columns: {
      [GAME_COLUMN.one]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.two]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.three]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
    },
    createdAt: new Date().toISOString(),
  };
}

/** Default number of games played per Triple Yahtzee session. */
export const DEFAULT_GAME_COUNT = 2;

/**
 * Central reactive state for a Triple Yahtzee session.
 * Holds the list of games and the current dice roll.
 * All state is exposed via Angular Signals.
 * Placement logic lives in PlacementService.
 */
@Injectable({ providedIn: 'root' })
export class GameStateService {
  readonly #scoringEngine = inject(ScoringEngineService);

  readonly #gameCount = signal(DEFAULT_GAME_COUNT);
  readonly #games = signal(Array.from({ length: DEFAULT_GAME_COUNT }, () => createEmptyGame()));
  readonly #currentDice = signal<DiceSet | undefined>(undefined);
  readonly #activeGameIndex = signal(0);

  /** How many games are configured for this session (read-only). */
  readonly gameCount = this.#gameCount.asReadonly();

  /** All current games (read-only). */
  readonly games = this.#games.asReadonly();

  /** The most recently confirmed dice roll, or undefined when no dice have been set. */
  readonly currentDice = this.#currentDice.asReadonly();

  /** Index of the currently active game (0-based). */
  readonly activeGameIndex = this.#activeGameIndex.asReadonly();

  /**
   * True when at least one score has been placed in any game.
   * Used to ask for confirmation before changing the game count.
   */
  readonly isAnyGameInProgress = computed(() => {
    for (const game of this.#games()) {
      for (const col of COLUMN_ORDER) {
        for (const cat of UPPER_CATEGORIES) {
          if (game.columns[col].upper[cat] !== undefined) return true;
        }
        for (const cat of LOWER_CATEGORIES) {
          if (game.columns[col].lower[cat] !== undefined) return true;
        }
      }
    }
    return false;
  });

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
   * Updates the current dice signal. Called by PlacementService — use
   * PlacementService.setCurrentDice from application code so the undo
   * snapshot is cleared at the correct time.
   */
  setCurrentDice(dice: DiceSet | undefined): void {
    this.#currentDice.set(dice);
  }

  /**
   * Applies an updater function to the game at the given index.
   * Used by PlacementService to write placement results.
   */
  updateGameAt(index: number, updater: (g: Game) => Game): void {
    this.#games.update((gs) => gs.map((g, i) => (i === index ? updater(g) : g)));
  }

  /**
   * Resets the game state to fresh empty games (one per configured game count) and clears the current dice.
   * Called from the game-over screen to start a new session.
   */
  newGame(): void {
    this.#games.set(Array.from({ length: this.#gameCount() }, () => createEmptyGame()));
    this.#currentDice.set(undefined);
    this.#activeGameIndex.set(0);
  }

  /**
   * Changes the number of games additively/subtractively.
   * Increasing count appends empty games; decreasing removes from the tail.
   * Clears current dice. The caller is responsible for confirming when scored trailing
   * games will be removed (see hasScoreInGamesFrom).
   */
  setGameCount(count: number): void {
    this.#gameCount.set(count);
    const current = this.#games();
    if (count > current.length) {
      this.#games.set([
        ...current,
        ...Array.from({ length: count - current.length }, () => createEmptyGame()),
      ]);
    } else if (count < current.length) {
      this.#games.set(current.slice(0, count));
      if (this.#activeGameIndex() >= count) {
        this.#activeGameIndex.set(count - 1);
      }
    }
    this.#currentDice.set(undefined);
  }

  /**
   * Sets the active game index. Used by the score sheet and suggestion engine
   * to track which game is currently focused.
   */
  setActiveGameIndex(index: number): void {
    this.#activeGameIndex.set(index);
  }

  /**
   * Returns true when any game at or after startIndex has at least one scored cell.
   * Used by the game count picker to decide whether a confirmation dialog is needed
   * before removing trailing games.
   */
  hasScoreInGamesFrom(startIndex: number): boolean {
    const games = this.#games();
    for (let i = startIndex; i < games.length; i++) {
      const game = games[i];
      for (const col of COLUMN_ORDER) {
        for (const cat of UPPER_CATEGORIES) {
          if (game.columns[col].upper[cat] !== undefined) return true;
        }
        for (const cat of LOWER_CATEGORIES) {
          if (game.columns[col].lower[cat] !== undefined) return true;
        }
      }
    }
    return false;
  }

  /**
   * Restores the game count from a previously saved snapshot.
   * Does NOT reset the games array — call restoreGames separately.
   */
  restoreGameCount(count: number): void {
    this.#gameCount.set(count);
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

    const yahtzeeBonus = colScores.yahtzeeBonus ?? 0;
    const lowerTotal = (lowerRaw + yahtzeeBonus) * multiplier;
    const combinedTotal = upperTotal + lowerTotal;

    return { upperRaw, upperBonus, upperTotal, lowerRaw, yahtzeeBonus, lowerTotal, combinedTotal };
  }
}
