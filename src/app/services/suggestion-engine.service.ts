import type { DiceSet } from '../models/dice-set.model';
import type { GameColumn } from '../models/game-column.model';
import type { Game } from '../models/game.model';
import type { ScoreCategory } from '../models/score-category.model';
import type { SuggestionResult } from '../models/suggestion-result.model';

import { inject, Injectable } from '@angular/core';

import { LOWER_CATEGORIES, UPPER_CATEGORIES } from '../models/game-column.model';
import { nextUnfilledColumn } from '../models/game.model';
import { ScoringEngineService } from './scoring-engine.service';

interface AvailableCell {
  category: ScoreCategory;
  column: GameColumn;
}

/**
 * Computes ranked suggestions for a given dice roll and game state.
 * Greedy strategy: score desc, then category asc, then column asc.
 */
@Injectable({ providedIn: 'root' })
export class SuggestionEngineService {
  readonly #scoringEngine = inject(ScoringEngineService);

  /** Pure method: computes ranked suggestions without injected state. */
  computeSuggestions(dice: DiceSet, game: Game): SuggestionResult[] {
    const availableCells = this.#computeAvailableCells(game);
    if (availableCells.length === 0) return [];

    const results: SuggestionResult[] = availableCells.map((cell) => {
      const score = this.#scoringEngine.computeMultipliedScore(dice, cell.category, cell.column);
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

  #computeAvailableCells(game: Game): AvailableCell[] {
    const cells: AvailableCell[] = [];
    for (const category of [...UPPER_CATEGORIES, ...LOWER_CATEGORIES]) {
      const column = nextUnfilledColumn(game, category);
      if (column !== undefined) cells.push({ category, column });
    }
    return cells;
  }
}
