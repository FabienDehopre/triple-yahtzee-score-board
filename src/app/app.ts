import type { DiceSet } from './models/dice-set.model';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ClearSessionButtonComponent } from './components/clear-session-button/clear-session-button.component';
import { DiceInputComponent } from './components/dice-input/dice-input.component';
import { FooterComponent } from './components/footer/footer.component';
import { GameCountPickerComponent } from './components/game-count-picker/game-count-picker.component';
import { GameOverComponent } from './components/game-over/game-over.component';
import { LanguagePickerComponent } from './components/language-picker/language-picker.component';
import { ScoreSheetComponent } from './components/score-sheet/score-sheet.component';
import { SuggestionBarComponent } from './components/suggestion-bar/suggestion-bar.component';
import { UndoBannerComponent } from './components/undo-banner/undo-banner.component';
import { GameStateService } from './services/game-state.service';
import { PersistenceManagerService } from './services/persistence-manager.service';
import { PlacementService } from './services/placement.service';

@Component({
  selector: 'app-root',
  imports: [
    ClearSessionButtonComponent,
    DiceInputComponent,
    FooterComponent,
    GameCountPickerComponent,
    GameOverComponent,
    LanguagePickerComponent,
    ScoreSheetComponent,
    SuggestionBarComponent,
    TranslocoPipe,
    UndoBannerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly #placement = inject(PlacementService);

  protected readonly isGameOver = inject(GameStateService).isGameOver;

  constructor() {
    inject(PersistenceManagerService);
  }

  protected onDiceConfirmed(roll: DiceSet): void {
    this.#placement.setCurrentDice(roll);
  }
}
