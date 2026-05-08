import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { CATEGORY_LABEL_KEYS } from '../../models/i18n-keys';
import { GameStateService } from '../../services/game-state.service';
import { UndoService } from '../../services/undo.service';

/**
 * Floating toast-style banner that appears after a score placement.
 * Shows which category was scored and offers a one-step undo.
 * Auto-hides when new dice are entered or when undo is performed.
 */
@Component({
  selector: 'app-undo-banner',
  imports: [TranslocoPipe],
  templateUrl: './undo-banner.component.html',
  styleUrl: './undo-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoBannerComponent {
  readonly #undoService = inject(UndoService);
  readonly #gameState = inject(GameStateService);
  readonly #transloco = inject(TranslocoService);

  protected readonly canUndo = this.#undoService.canUndo;

  protected readonly undoMessage = computed(() => {
    void this.#transloco.activeLang();
    const cat = this.#undoService.lastCategory();
    if (cat === undefined) return '';
    const categoryName = this.#transloco.translate(CATEGORY_LABEL_KEYS[cat]);
    return this.#transloco.translate('undoBanner.message', { category: categoryName });
  });

  protected onUndo(): void {
    const previousGames = this.#undoService.undo();
    if (previousGames) {
      this.#gameState.restoreGames(previousGames);
    }
  }
}
