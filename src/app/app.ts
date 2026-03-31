import type { DiceSet } from './shared/models';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DiceInputComponent, GameOverComponent, ScoreSheetComponent } from './shared/components';
import { GameStateService } from './shared/services/game-state.service';

@Component({
  selector: 'app-root',
  imports: [DiceInputComponent, GameOverComponent, ScoreSheetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly #gameState = inject(GameStateService);

  protected readonly isGameOver = this.#gameState.isGameOver;

  protected onDiceConfirmed(roll: DiceSet): void {
    this.#gameState.setCurrentDice(roll);
  }
}
