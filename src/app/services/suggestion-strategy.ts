import type { AvailableCell } from '../models/available-cell.model';
import type { DiceSet } from '../models/dice-set.model';
import type { SuggestionResult } from '../models/suggestion-result.model';

export interface SuggestionStrategy {
  suggest: (dice: DiceSet, availableCells: AvailableCell[]) => SuggestionResult[];
}
