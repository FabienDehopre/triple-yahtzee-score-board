import type { DiceSet } from '../models/dice-set.model';
import type { GameColumn } from '../models/game-column.model';
import type { Game } from '../models/game.model';
import type { ScoreCategory } from '../models/score-category.model';

import { computed, inject, Injectable, signal } from '@angular/core';

import { COLUMN_MULTIPLIER, GAME_COLUMN, LOWER_CATEGORIES, UPPER_CATEGORIES } from '../models/game-column.model';
import { ScoringEngineService } from './scoring-engine.service';

/** Statistics computed per column for a single game. */
export interface ColumnStats {
  /** Raw sum of upper-section scores (before multiplier). Used for bonus threshold. */
  upperRawTotal: number;
  /** Upper bonus (35) if upperRawTotal ≥ 63, otherwise 0. */
  upperBonus: number;
  /** (upperRawTotal + upperBonus) × column multiplier. */
  upperTotal: number;
  /** Sum of lower-section scores × column multiplier. */
  lowerTotal: number;
  /** (upperRawTotal + upperBonus + lower raw) × column multiplier. */
  combinedTotal: number;
}

const ORDERED_COLUMNS: GameColumn[] = [GAME_COLUMN.one, GAME_COLUMN.two, GAME_COLUMN.three];

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
 * Central reactive state service for a Triple Yahtzee game session.
 * Holds games and current dice as signals; exposes computed per-column statistics.
 */
@Injectable({ providedIn: 'root' })
export class GameStateService {
  readonly #scoringEngine = inject(ScoringEngineService);

  /** All game sessions. Starts with one empty game. */
  readonly games = signal([createEmptyGame()]);

  /** The dice set most recently confirmed by the player, or undefined before first roll. */
  readonly currentDice = signal<DiceSet | undefined>(undefined);

  /**
   * Computed per-game, per-column statistics.
   * Index in the outer array corresponds to the game index in `games`.
   */
  readonly columnStats = computed<Record<GameColumn, ColumnStats>[]>(() =>
    this.games().map((game) =>
      Object.fromEntries(
        ORDERED_COLUMNS.map((col) => {
          const upper = game.columns[col].upper;
          const lower = game.columns[col].lower;

          const upperRaw = UPPER_CATEGORIES.reduce((s, cat) => s + (upper[cat]?.value ?? 0), 0);
          const upperBonus = this.#scoringEngine.computeUpperBonus(upperRaw);
          const lowerRaw = LOWER_CATEGORIES.reduce((s, cat) => s + (lower[cat]?.value ?? 0), 0);
          const m = COLUMN_MULTIPLIER[col];

          return [
            col,
            {
              upperRawTotal: upperRaw,
              upperBonus,
              upperTotal: (upperRaw + upperBonus) * m,
              lowerTotal: lowerRaw * m,
              combinedTotal: (upperRaw + upperBonus + lowerRaw) * m,
            } satisfies ColumnStats,
          ];
        })
      ) as Record<GameColumn, ColumnStats>
    )
  );

  /** Updates the current dice. Called after the player confirms a roll. */
  setCurrentDice(dice: DiceSet): void {
    this.currentDice.set(dice);
  }

  /**
   * Places the score for `category` in the next unfilled column (ONE → TWO → THREE)
   * of the game at `gameIndex`, using the currently set dice.
   * Does nothing if all columns are already filled or if no dice have been set.
   */
  placeScore(category: ScoreCategory, gameIndex: number): void {
    const dice = this.currentDice();
    if (!dice) return;

    const game = this.games()[gameIndex];
    const isUpper = UPPER_CATEGORIES.includes(category);
    const section = isUpper ? 'upper' : 'lower';
    const nextColumn = ORDERED_COLUMNS.find((col) => game.columns[col][section][category] === undefined);
    if (nextColumn === undefined) return;

    const rawScore = this.#scoringEngine.computeScore(dice, category);

    this.games.update((games) => {
      const updated = [...games];
      const g = updated[gameIndex];
      updated[gameIndex] = {
        ...g,
        columns: {
          ...g.columns,
          [nextColumn]: {
            ...g.columns[nextColumn],
            [section]: {
              ...g.columns[nextColumn][section],
              [category]: { value: rawScore, isScratched: rawScore === 0 },
            },
          },
        },
      };
      return updated;
    });
  }
}
