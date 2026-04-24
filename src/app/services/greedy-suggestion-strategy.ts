import type { AvailableCell } from '../models/available-cell.model';
import type { DiceSet } from '../models/dice-set.model';
import type { SuggestionResult } from '../models/suggestion-result.model';
import type { SuggestionStrategy } from './suggestion-strategy';

import { inject, Injectable } from '@angular/core';

import { COLUMN_MULTIPLIER } from '../models/game-column.model';
import { ScoringEngineService } from './scoring-engine.service';

/**
 * Greedy suggestion strategy: for each available cell, compute the
 * multiplied score, then sort descending. Ties are broken deterministically
 * by category name (ascending), then column name (ascending).
 */
@Injectable({ providedIn: 'root' })
export class GreedySuggestionStrategy implements SuggestionStrategy {
  readonly #scoringEngine = inject(ScoringEngineService);

  suggest(dice: DiceSet, availableCells: AvailableCell[]): SuggestionResult[] {
    if (availableCells.length === 0) return [];

    const results: SuggestionResult[] = availableCells.map((cell) => {
      const rawScore = this.#scoringEngine.computeScore(dice, cell.category);
      const score = rawScore * COLUMN_MULTIPLIER[cell.column];
      return {
        category: cell.category,
        column: cell.column,
        score,
        reasoning: `Placing ${cell.category} in column ${cell.column} scores ${score} points.`,
      };
    });

    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.category !== b.category) return a.category < b.category ? -1 : 1;
      return a.column < b.column ? -1 : 1;
    });

    return results;
  }
}
