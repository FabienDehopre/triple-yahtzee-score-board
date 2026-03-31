import type { Game } from '../models/game.model';
import type { ScoreCategory } from '../models/score-category.model';

import { computed, Injectable, signal } from '@angular/core';

interface UndoSnapshot {
  games: Game[];
  category: ScoreCategory;
}

/**
 * Manages a single-step undo for score placements.
 * Snapshots the game state before each placement so it can be restored.
 * The snapshot is cleared when new dice are entered or when undo is performed.
 */
@Injectable({ providedIn: 'root' })
export class UndoService {
  readonly #snapshot = signal<UndoSnapshot | undefined>(undefined);

  /** True when a snapshot is available (i.e., a score was just placed). */
  readonly canUndo = computed(() => this.#snapshot() !== undefined);

  /** The category that was most recently scored, or undefined when no snapshot exists. */
  readonly lastCategory = computed(() => this.#snapshot()?.category);

  /**
   * Stores a deep copy of the current games array together with the category
   * that is about to be scored. Call this immediately before each placement.
   */
  saveSnapshot(games: Game[], category: ScoreCategory): void {
    this.#snapshot.set({ games: structuredClone(games), category });
  }

  /**
   * Discards the snapshot without restoring state.
   * Call this when new dice are entered so undo is no longer available.
   */
  clearSnapshot(): void {
    this.#snapshot.set(undefined);
  }

  /**
   * Returns the previously saved games array and clears the snapshot.
   * Returns undefined when there is nothing to undo.
   */
  undo(): Game[] | undefined {
    const snap = this.#snapshot();
    if (!snap) return undefined;
    this.#snapshot.set(undefined);
    return snap.games;
  }
}
