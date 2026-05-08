import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { CATEGORY_LABEL_KEYS } from '../../models/i18n-keys';
import { GameStateService } from '../../services/game-state.service';
import { PlacementService } from '../../services/placement.service';
import { SuggestionEngineService } from '../../services/suggestion-engine.service';

/**
 * Displays the top suggestion from the SuggestionEngine after dice entry.
 * The bar can be accepted (places the score) or dismissed (lets the player
 * choose manually from the score sheet).
 * Resets to visible state whenever a new dice roll is confirmed.
 */
@Component({
  selector: 'app-suggestion-bar',
  imports: [TranslocoPipe],
  templateUrl: './suggestion-bar.component.html',
  styleUrl: './suggestion-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestionBarComponent {
  readonly #gameState = inject(GameStateService);
  readonly #placement = inject(PlacementService);
  readonly #suggestionEngine = inject(SuggestionEngineService);

  readonly #dismissed = signal(false);

  protected readonly topSuggestion = computed(() => {
    const suggestions = this.#suggestionEngine.suggestions();
    return suggestions.length > 0 ? suggestions[0] : undefined;
  });

  protected readonly isVisible = computed(() => this.topSuggestion() !== undefined && !this.#dismissed());

  protected readonly categoryLabelKeys = CATEGORY_LABEL_KEYS;

  constructor() {
    effect(() => {
      this.#gameState.currentDice();
      this.#dismissed.set(false);
    });
  }

  protected onAccept(): void {
    const suggestion = this.topSuggestion();
    if (!suggestion) return;
    this.#placement.placeScore(suggestion.category, this.#gameState.activeGameIndex());
    this.#dismissed.set(true);
  }

  protected onDismiss(): void {
    this.#dismissed.set(true);
  }
}
