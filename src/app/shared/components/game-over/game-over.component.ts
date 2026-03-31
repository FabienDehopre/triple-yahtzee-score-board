import type { GameColumn } from '../../models';

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { COLUMN_MULTIPLIER, COLUMN_ORDER, GAME_COLUMN } from '../../models/game-column.model';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameOverComponent {
  readonly #gameState = inject(GameStateService);

  protected readonly grandTotal = this.#gameState.grandTotal;
  protected readonly columnStats = this.#gameState.columnStats;
  protected readonly columnOrder = COLUMN_ORDER;
  protected readonly columnMultiplier = COLUMN_MULTIPLIER;

  protected readonly columnLabels: Record<GameColumn, string> = {
    [GAME_COLUMN.one]: 'Combined Total',
    [GAME_COLUMN.two]: 'Double Combined',
    [GAME_COLUMN.three]: 'Triple Combined',
  };

  /** Upper bonus for each column multiplied by the column's multiplier (for display). */
  protected readonly upperBonusDisplay = computed(
    () =>
      Object.fromEntries(
        COLUMN_ORDER.map((col) => [col, this.columnStats()[0][col].upperBonus * COLUMN_MULTIPLIER[col]])
      ) as Record<GameColumn, number>
  );

  protected onNewGame(): void {
    this.#gameState.newGame();
  }
}
