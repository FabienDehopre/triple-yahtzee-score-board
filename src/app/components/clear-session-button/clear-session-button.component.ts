import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { SessionStore } from '../../services/session.store';

@Component({
  selector: 'app-clear-session-button',
  imports: [TranslocoPipe],
  templateUrl: './clear-session-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClearSessionButtonComponent {
  readonly #sessionStore = inject(SessionStore);

  protected readonly isPending = signal(false);

  protected onClearClick(): void {
    if (!this.#sessionStore.isAnyGameInProgress()) {
      this.#sessionStore.newGame();
      return;
    }
    this.isPending.set(true);
  }

  protected onConfirm(): void {
    this.#sessionStore.newGame();
    this.isPending.set(false);
  }

  protected onCancel(): void {
    this.isPending.set(false);
  }
}
