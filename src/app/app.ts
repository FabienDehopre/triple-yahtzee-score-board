import type { DiceSet } from './shared/models';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DiceInputComponent, ScoreSheetComponent, SuggestionBarComponent, UndoBannerComponent } from './shared/components';
import { GameStateService } from './shared/services/game-state.service';
import { PersistenceManagerService } from './shared/services/persistence-manager.service';

@Component({
  selector: 'app-root',
  imports: [DiceInputComponent, ScoreSheetComponent, SuggestionBarComponent, UndoBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly #gameState = inject(GameStateService);

  constructor() {
    inject(PersistenceManagerService);
  }

  protected onDiceConfirmed(roll: DiceSet): void {
    this.#gameState.setCurrentDice(roll);
  }
}
