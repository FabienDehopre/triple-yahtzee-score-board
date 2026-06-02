import type { Game } from '../models/game.model';
import type { ScoreCategory } from '../models/score-category.model';

import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

interface UndoSnapshot {
  games: Game[];
  category: ScoreCategory;
}

interface UndoState {
  snapshot: UndoSnapshot | undefined;
}

export const UndoStore = signalStore(
  { providedIn: 'root' },
  withState<UndoState>({ snapshot: undefined }),
  withComputed(({ snapshot }) => ({
    canUndo: computed(() => snapshot() !== undefined),
    lastCategory: computed(() => snapshot()?.category),
  })),
  withMethods((store) => ({
    saveSnapshot(games: Game[], category: ScoreCategory): void {
      patchState(store, { snapshot: { games: structuredClone(games), category } });
    },
    clearSnapshot(): void {
      patchState(store, { snapshot: undefined });
    },
    getSnapshot: (): UndoSnapshot | undefined => store.snapshot(),
  }))
);
