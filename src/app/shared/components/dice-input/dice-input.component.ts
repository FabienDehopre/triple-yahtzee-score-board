import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

import { DiceSet } from '../../models';

@Component({
  selector: 'app-dice-input',
  templateUrl: './dice-input.component.html',
  styleUrl: './dice-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiceInputComponent {
  readonly confirmed = output<DiceSet>();

  protected readonly counts = signal<DiceSet>([0, 0, 0, 0, 0, 0]);
  protected readonly total = computed(() => this.counts().reduce((s, c) => s + c, 0));
  protected readonly remaining = computed(() => 5 - this.total());
  protected readonly isValid = computed(() => this.total() === 5);
  protected readonly faces = [1, 2, 3, 4, 5, 6] as const;

  increment(index: number): void {
    if (this.total() >= 5) return;
    const next = [...this.counts()] as DiceSet;
    next[index]++;
    this.counts.set(next);
  }

  decrement(index: number): void {
    const next = [...this.counts()] as DiceSet;
    if (next[index] <= 0) return;
    next[index]--;
    this.counts.set(next);
  }

  reset(): void {
    this.counts.set([0, 0, 0, 0, 0, 0]);
  }

  confirm(): void {
    if (!this.isValid()) return;
    this.confirmed.emit(this.counts());
  }
}
