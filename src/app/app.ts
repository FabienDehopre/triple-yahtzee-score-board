import type { DiceSet } from './shared/models/dice-set.model';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DiceInputComponent } from './shared/components/dice-input/dice-input.component';
import { GameCountPickerComponent } from './shared/components/game-count-picker/game-count-picker.component';
import { GameOverComponent } from './shared/components/game-over/game-over.component';
import { ScoreSheetComponent } from './shared/components/score-sheet/score-sheet.component';
import { SuggestionBarComponent } from './shared/components/suggestion-bar/suggestion-bar.component';
import { UndoBannerComponent } from './shared/components/undo-banner/undo-banner.component';
import { GameStateService } from './shared/services/game-state.service';
import { PersistenceManagerService } from './shared/services/persistence-manager.service';

@Component({
  selector: 'app-root',
  imports: [DiceInputComponent, GameCountPickerComponent, GameOverComponent, ScoreSheetComponent, SuggestionBarComponent, UndoBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly #gameState = inject(GameStateService);

  protected readonly isGameOver = this.#gameState.isGameOver;

  constructor() {
    inject(PersistenceManagerService);
  }

  protected onDiceConfirmed(roll: DiceSet): void {
    this.#gameState.setCurrentDice(roll);
  }
}
