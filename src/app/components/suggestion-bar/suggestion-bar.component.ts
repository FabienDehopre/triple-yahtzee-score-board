import type { ScoreCategory } from '../../models/score-category.model';

import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

import { SCORE_CATEGORY } from '../../models/score-category.model';
import { GameStateService } from '../../services/game-state.service';
import { SuggestionEngineService } from '../../services/suggestion-engine.service';

/** Human-readable labels for every score category. */
const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  [SCORE_CATEGORY.aces]: 'Aces',
  [SCORE_CATEGORY.twos]: 'Twos',
  [SCORE_CATEGORY.threes]: 'Threes',
  [SCORE_CATEGORY.fours]: 'Fours',
  [SCORE_CATEGORY.fives]: 'Fives',
  [SCORE_CATEGORY.sixes]: 'Sixes',
  [SCORE_CATEGORY.threeOfAKind]: '3 of a Kind',
  [SCORE_CATEGORY.fourOfAKind]: '4 of a Kind',
  [SCORE_CATEGORY.fullHouse]: 'Full House',
  [SCORE_CATEGORY.smallStraight]: 'Sm. Straight',
  [SCORE_CATEGORY.largeStraight]: 'Lg. Straight',
  [SCORE_CATEGORY.yahtzee]: 'YAHTZEE',
  [SCORE_CATEGORY.chance]: 'Chance',
};

/**
 * Displays the top suggestion from the SuggestionEngine after dice entry.
 * The bar can be accepted (places the score) or dismissed (lets the player
 * choose manually from the score sheet).
 * Resets to visible state whenever a new dice roll is confirmed.
 */
@Component({
  selector: 'app-suggestion-bar',
  templateUrl: './suggestion-bar.component.html',
  styleUrl: './suggestion-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestionBarComponent {
  readonly #gameState = inject(GameStateService);
  readonly #suggestionEngine = inject(SuggestionEngineService);

  readonly #dismissed = signal(false);

  protected readonly topSuggestion = computed(() => {
    const suggestions = this.#suggestionEngine.suggestions();
    return suggestions.length > 0 ? suggestions[0] : undefined;
  });

  protected readonly isVisible = computed(
    () => this.topSuggestion() !== undefined && !this.#dismissed()
  );

  protected readonly categoryLabels = CATEGORY_LABELS;

  constructor() {
    // Reset dismissed state whenever the player enters a new dice roll.
    effect(() => {
      this.#gameState.currentDice();
      this.#dismissed.set(false);
    });
  }

  protected onAccept(): void {
    const suggestion = this.topSuggestion();
    if (!suggestion) return;
    this.#gameState.placeScore(suggestion.category, 0);
    this.#dismissed.set(true);
  }

  protected onDismiss(): void {
    this.#dismissed.set(true);
  }
}
