import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { SessionStore } from '../../services/session.store';

const GAME_COUNT_OPTIONS = [1, 2, 3, 4, 5];

@Component({
  selector: 'app-game-count-picker',
  imports: [TranslocoPipe],
  templateUrl: './game-count-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCountPickerComponent {
  readonly #sessionStore = inject(SessionStore);

  protected readonly gameCount = this.#sessionStore.gameCount;
  protected readonly gameCountOptions = GAME_COUNT_OPTIONS;

  protected readonly displayCount = linkedSignal(() => this.gameCount());

  protected readonly pendingCount = signal<number | undefined>(undefined);

  protected onCountChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.displayCount.set(value);
    if (value < this.gameCount() && this.#sessionStore.hasScoreInGamesFrom(value)) {
      this.pendingCount.set(value);
    } else {
      this.#sessionStore.setGameCount(value);
    }
  }

  protected onConfirm(): void {
    const count = this.pendingCount();
    if (count !== undefined) {
      this.#sessionStore.setGameCount(count);
    }
    this.pendingCount.set(undefined);
  }

  protected onCancel(): void {
    this.displayCount.set(this.gameCount());
    this.pendingCount.set(undefined);
  }
}
