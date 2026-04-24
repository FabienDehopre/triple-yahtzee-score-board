import type { DiceSet } from './models/dice-set.model';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DiceInputComponent } from './components/dice-input/dice-input.component';
import { GameCountPickerComponent } from './components/game-count-picker/game-count-picker.component';
import { GameOverComponent } from './components/game-over/game-over.component';
import { ScoreSheetComponent } from './components/score-sheet/score-sheet.component';
import { SuggestionBarComponent } from './components/suggestion-bar/suggestion-bar.component';
import { UndoBannerComponent } from './components/undo-banner/undo-banner.component';
import { GameStateService } from './services/game-state.service';
import { PersistenceManagerService } from './services/persistence-manager.service';

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
