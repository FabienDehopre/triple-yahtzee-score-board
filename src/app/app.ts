import type { DiceSet } from './models/dice-set.model';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ClearSessionButtonComponent } from './components/clear-session-button/clear-session-button.component';
import { DiceInputComponent } from './components/dice-input/dice-input.component';
import { FooterComponent } from './components/footer/footer.component';
import { GameCountPickerComponent } from './components/game-count-picker/game-count-picker.component';
import { GameOverComponent } from './components/game-over/game-over.component';
import { LanguagePickerComponent } from './components/language-picker/language-picker.component';
import { ReportIssueButtonComponent } from './components/report-issue-button/report-issue-button.component';
import { ScoreSheetComponent } from './components/score-sheet/score-sheet.component';
import { SuggestionBarComponent } from './components/suggestion-bar/suggestion-bar.component';
import { ToastComponent } from './components/toast/toast.component';
import { UndoBannerComponent } from './components/undo-banner/undo-banner.component';
import { SessionStore } from './services/session.store';

@Component({
  selector: 'app-root',
  imports: [
    ClearSessionButtonComponent,
    DiceInputComponent,
    FooterComponent,
    GameCountPickerComponent,
    GameOverComponent,
    LanguagePickerComponent,
    ReportIssueButtonComponent,
    ScoreSheetComponent,
    SuggestionBarComponent,
    ToastComponent,
    TranslocoPipe,
    UndoBannerComponent,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly #sessionStore = inject(SessionStore);

  protected readonly isGameOver = this.#sessionStore.isGameOver;

  protected onDiceConfirmed(roll: DiceSet): void {
    this.#sessionStore.setCurrentDice(roll);
  }
}
