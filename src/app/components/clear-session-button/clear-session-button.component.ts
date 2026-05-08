import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-clear-session-button',
  templateUrl: './clear-session-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClearSessionButtonComponent {
  readonly #gameState = inject(GameStateService);

  protected readonly isPending = signal(false);

  protected onClearClick(): void {
    if (!this.#gameState.isAnyGameInProgress()) {
      this.#gameState.newGame();
      return;
    }
    this.isPending.set(true);
  }

  protected onConfirm(): void {
    this.#gameState.newGame();
    this.isPending.set(false);
  }

  protected onCancel(): void {
    this.isPending.set(false);
  }
}
