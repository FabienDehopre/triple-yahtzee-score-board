import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { CATEGORY_LABEL_KEYS } from '../../models/i18n-keys';
import { SessionStore } from '../../services/session.store';

@Component({
  selector: 'app-suggestion-bar',
  imports: [TranslocoPipe],
  templateUrl: './suggestion-bar.component.html',
  styleUrl: './suggestion-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestionBarComponent {
  readonly #sessionStore = inject(SessionStore);

  readonly #dismissed = signal(false);

  protected readonly topSuggestion = computed(() => {
    const suggestions = this.#sessionStore.suggestions();
    return suggestions.length > 0 ? suggestions[0] : undefined;
  });

  protected readonly isVisible = computed(() => this.topSuggestion() !== undefined && !this.#dismissed());

  protected readonly categoryLabelKeys = CATEGORY_LABEL_KEYS;

  constructor() {
    effect(() => {
      this.#sessionStore.currentDice();
      this.#dismissed.set(false);
    });
  }

  protected onAccept(): void {
    const suggestion = this.topSuggestion();
    if (!suggestion) return;
    this.#sessionStore.placeScore(suggestion.category, this.#sessionStore.activeGameIndex());
    this.#dismissed.set(true);
  }

  protected onDismiss(): void {
    this.#dismissed.set(true);
  }
}
