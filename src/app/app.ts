import type { DiceSet } from './shared/models';

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { DiceInputComponent } from './shared/components';

@Component({
  selector: 'app-root',
  imports: [DiceInputComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('triple-yahtzee-score-board');
  protected readonly lastRoll = signal<DiceSet | undefined>(undefined);

  protected onDiceConfirmed(roll: DiceSet): void {
    this.lastRoll.set(roll);
  }
}
