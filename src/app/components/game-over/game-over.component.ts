import type { GameColumn } from '../../models/game-column.model';

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { COLUMN_ORDER } from '../../models/game-column.model';
import { GAME_OVER_COLUMN_KEYS } from '../../models/i18n-keys';
import { SessionStore } from '../../services/session.store';

@Component({
  selector: 'app-game-over',
  imports: [TranslocoPipe],
  templateUrl: './game-over.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameOverComponent {
  readonly #sessionStore = inject(SessionStore);

  protected readonly grandTotal = this.#sessionStore.grandTotal;
  protected readonly columnStats = this.#sessionStore.columnStats;
  protected readonly games = this.#sessionStore.games;
  protected readonly columnOrder = COLUMN_ORDER;

  protected readonly columnLabelKeys = GAME_OVER_COLUMN_KEYS;

  protected readonly upperBonusDisplay = computed(() =>
    this.columnStats().map(
      (gameStats) =>
        Object.fromEntries(COLUMN_ORDER.map((col) => [col, gameStats[col].upperBonusTotal])) as Record<
          GameColumn,
          number
        >
    )
  );

  protected readonly hasAnyBonus = computed(() =>
    this.columnStats().some((gameStats) => COLUMN_ORDER.some((col) => gameStats[col].upperBonusRaw > 0))
  );

  protected onNewGame(): void {
    this.#sessionStore.newGame();
  }
}
