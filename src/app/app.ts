import type { DiceSet } from './shared/models';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DiceInputComponent, ScoreSheetComponent } from './shared/components';
import { GameStateService } from './shared/services/game-state.service';

@Component({
  selector: 'app-root',
  imports: [DiceInputComponent, ScoreSheetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly gameState = inject(GameStateService);

  protected onDiceConfirmed(roll: DiceSet): void {
    this.gameState.setCurrentDice(roll);
  }
}
