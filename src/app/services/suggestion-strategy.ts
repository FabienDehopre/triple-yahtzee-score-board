import type { AvailableCell } from '../models/available-cell.model';
import type { DiceSet } from '../models/dice-set.model';
import type { SuggestionResult } from '../models/suggestion-result.model';

import { InjectionToken } from '@angular/core';

/**
 * Contract for all suggestion strategies.
 * Accepts the current dice and the list of unfilled cells, and returns
 * a ranked list of scoring suggestions (highest-scoring first).
 */
export interface SuggestionStrategy {
  suggest: (dice: DiceSet, availableCells: AvailableCell[]) => SuggestionResult[];
}

/**
 * DI token used to inject the active SuggestionStrategy.
 * Defaults to GreedySuggestionStrategy when not overridden.
 */
export const SUGGESTION_STRATEGY = new InjectionToken<SuggestionStrategy>('SuggestionStrategy');
