import type { DiceSet } from '../../models/dice-set.model';

import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

interface DotPosition {
  cx: number;
  cy: number;
}

@Component({
  selector: 'app-dice-input',
  templateUrl: './dice-input.component.html',
  styleUrl: './dice-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiceInputComponent {
  protected readonly counts = signal([0, 0, 0, 0, 0, 0] as DiceSet);
  protected readonly total = computed(() => this.counts().reduce((s, c) => s + c, 0));
  protected readonly remaining = computed(() => 5 - this.total());
  protected readonly isValid = computed(() => this.total() === 5);
  protected readonly faces = [1, 2, 3, 4, 5, 6] as const;

  protected readonly dotPositions: Record<number, DotPosition[]> = {
    1: [{ cx: 30, cy: 30 }],
    2: [
      { cx: 45, cy: 15 },
      { cx: 15, cy: 45 },
    ],
    3: [
      { cx: 45, cy: 15 },
      { cx: 30, cy: 30 },
      { cx: 15, cy: 45 },
    ],
    4: [
      { cx: 15, cy: 15 },
      { cx: 45, cy: 15 },
      { cx: 15, cy: 45 },
      { cx: 45, cy: 45 },
    ],
    5: [
      { cx: 15, cy: 15 },
      { cx: 45, cy: 15 },
      { cx: 30, cy: 30 },
      { cx: 15, cy: 45 },
      { cx: 45, cy: 45 },
    ],
    6: [
      { cx: 15, cy: 15 },
      { cx: 45, cy: 15 },
      { cx: 15, cy: 30 },
      { cx: 45, cy: 30 },
      { cx: 15, cy: 45 },
      { cx: 45, cy: 45 },
    ],
  };

  readonly confirmed = output<DiceSet>();

  increment(index: number): void {
    if (this.total() >= 5) return;
    const next = [...this.counts()] as DiceSet;
    next[index] += 1;
    this.counts.set(next);
  }

  decrement(index: number): void {
    const next = [...this.counts()] as DiceSet;
    if (next[index] <= 0) return;
    next[index] -= 1;
    this.counts.set(next);
  }

  reset(): void {
    this.counts.set([0, 0, 0, 0, 0, 0] as DiceSet);
  }

  confirm(): void {
    if (!this.isValid()) return;
    this.confirmed.emit(this.counts());
  }
}
