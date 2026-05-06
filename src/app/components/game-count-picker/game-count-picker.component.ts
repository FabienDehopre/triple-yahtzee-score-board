import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';

import { GameStateService } from '../../services/game-state.service';

/** Available game count options. */
const GAME_COUNT_OPTIONS = [1, 2, 3, 4, 5];

@Component({
  selector: 'app-game-count-picker',
  templateUrl: './game-count-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCountPickerComponent {
  readonly #gameState = inject(GameStateService);

  protected readonly gameCount = this.#gameState.gameCount;
  protected readonly gameCountOptions = GAME_COUNT_OPTIONS;

  /**
   * The value displayed in the select, kept in sync with gameCount() via linkedSignal.
   * Overridden locally when user selects a different value; reverts on cancel.
   */
  protected readonly displayCount = linkedSignal(() => this.gameCount());

  /** The pending count waiting for user confirmation (undefined when no pending change). */
  protected readonly pendingCount = signal<number | undefined>(undefined);

  protected onCountChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.displayCount.set(value);
    if (value < this.gameCount() && this.#gameState.hasScoreInGamesFrom(value)) {
      this.pendingCount.set(value);
    } else {
      this.#gameState.setGameCount(value);
    }
  }

  protected onConfirm(): void {
    const count = this.pendingCount();
    if (count !== undefined) {
      this.#gameState.setGameCount(count);
    }
    this.pendingCount.set(undefined);
  }

  protected onCancel(): void {
    this.displayCount.set(this.gameCount());
    this.pendingCount.set(undefined);
  }
}
