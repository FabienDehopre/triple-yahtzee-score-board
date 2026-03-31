import type { ScoreCategory } from '../../models';

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { SCORE_CATEGORY } from '../../models';
import { GameStateService } from '../../services/game-state.service';
import { UndoService } from '../../services/undo.service';

/** Human-readable labels for each score category. */
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
 * Floating toast-style banner that appears after a score placement.
 * Shows which category was scored and offers a one-step undo.
 * Auto-hides when new dice are entered or when undo is performed.
 */
@Component({
  selector: 'app-undo-banner',
  templateUrl: './undo-banner.component.html',
  styleUrl: './undo-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoBannerComponent {
  readonly #undoService = inject(UndoService);
  readonly #gameState = inject(GameStateService);

  protected readonly canUndo = this.#undoService.canUndo;

  protected readonly categoryLabel = computed(() => {
    const cat = this.#undoService.lastCategory();
    return cat === undefined ? '' : CATEGORY_LABELS[cat];
  });

  protected onUndo(): void {
    const previousGames = this.#undoService.undo();
    if (previousGames) {
      this.#gameState.restoreGames(previousGames);
    }
  }
}
