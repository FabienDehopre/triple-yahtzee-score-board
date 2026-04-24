import type { AvailableCell } from '../models/available-cell.model';
import type { Game } from '../models/game.model';
import type { SuggestionResult } from '../models/suggestion-result.model';

import { computed, inject, Injectable } from '@angular/core';

import { COLUMN_ORDER, LOWER_CATEGORIES, UPPER_CATEGORIES } from '../models/game-column.model';
import { GameStateService } from './game-state.service';
import { GreedySuggestionStrategy } from './greedy-suggestion-strategy';

/** Fast lookup set for upper-section categories. */
const UPPER_SET = new Set(UPPER_CATEGORIES);

/**
 * Computes ranked suggestions for the current dice and game state.
 * Uses a pluggable SuggestionStrategy (defaults to greedy).
 */
@Injectable({ providedIn: 'root' })
export class SuggestionEngineService {
  readonly #gameState = inject(GameStateService);
  readonly #strategy = inject(GreedySuggestionStrategy);

  /**
   * Ranked suggestions for the current dice roll.
   * Empty when no dice are set or no cells are available.
   */
  readonly suggestions = computed((): SuggestionResult[] => {
    const dice = this.#gameState.currentDice();
    if (!dice) return [];
    const game = this.#gameState.games()[0];
    const availableCells = this.#computeAvailableCells(game);
    return this.#strategy.suggest(dice, availableCells);
  });

  /** Builds the list of currently fillable cells for game 0. */
  #computeAvailableCells(game: Game): AvailableCell[] {
    const cells: AvailableCell[] = [];
    for (const category of [...UPPER_CATEGORIES, ...LOWER_CATEGORIES]) {
      const isUpper = UPPER_SET.has(category);
      for (const col of COLUMN_ORDER) {
        const section = isUpper ? game.columns[col].upper : game.columns[col].lower;
        if (!section[category]) {
          cells.push({ category, column: col });
          break; // only the next unfilled column per category
        }
      }
    }
    return cells;
  }
}
