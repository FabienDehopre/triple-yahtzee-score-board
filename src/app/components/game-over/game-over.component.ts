import type { GameColumn } from '../../models/game-column.model';

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { COLUMN_ORDER, GAME_COLUMN } from '../../models/game-column.model';
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
  protected readonly games = this.#gameState.games;
  protected readonly columnOrder = COLUMN_ORDER;

  protected readonly columnLabels: Record<GameColumn, string> = {
    [GAME_COLUMN.one]: 'Combined Total',
    [GAME_COLUMN.two]: 'Double Combined',
    [GAME_COLUMN.three]: 'Triple Combined',
  };

  /** Upper bonus totals (already multiplied) for each game/column. */
  protected readonly upperBonusDisplay = computed(() =>
    this.columnStats().map((gameStats) =>
      Object.fromEntries(
        COLUMN_ORDER.map((col) => [col, gameStats[col].upperBonusTotal])
      ) as Record<GameColumn, number>
    )
  );

  /** True when any game/column has earned an upper bonus. */
  protected readonly hasAnyBonus = computed(() =>
    this.columnStats().some((gameStats) =>
      COLUMN_ORDER.some((col) => gameStats[col].upperBonusRaw > 0)
    )
  );

  protected onNewGame(): void {
    this.#gameState.newGame();
  }
}
