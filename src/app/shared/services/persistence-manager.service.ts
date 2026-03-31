import type { Game } from '../models/game.model';

import { effect, inject, Injectable } from '@angular/core';

import { GameStateService } from './game-state.service';

/** localStorage key used to persist game state. */
export const PERSISTENCE_KEY = 'triple-yahtzee-state';

/** Shape of the persisted JSON object. */
interface PersistedState {
  games: Game[];
}

/**
 * Manages automatic saving and restoring of the full GameState to/from localStorage.
 *
 * - **Restore**: reads from localStorage on construction and hydrates GameStateService.
 *   If the data is missing, empty, or corrupt, a fresh game is started instead.
 * - **Auto-save**: an Angular effect watches the games signal and writes to localStorage
 *   after every mutation (score placement, undo, etc.).
 */
@Injectable({ providedIn: 'root' })
export class PersistenceManagerService {
  readonly #gameState = inject(GameStateService);

  constructor() {
    this.#restore();

    effect(() => {
      const state: PersistedState = { games: this.#gameState.games() };

      try {
        localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
      } catch {
        // Storage quota exceeded or unavailable — ignore silently.
      }
    });
  }

  #restore(): void {
    try {
      const raw = localStorage.getItem(PERSISTENCE_KEY);
      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);

      if (!this.#isValidState(parsed)) return;

      this.#gameState.restoreGames(parsed.games);
    } catch {
      // Corrupt or unparseable data — start a new game gracefully.
    }
  }

  #isValidState(value: unknown): value is PersistedState {
    return (
      typeof value === 'object' &&
      value !== null &&
      'games' in value &&
      Array.isArray((value as PersistedState).games) &&
      (value as PersistedState).games.length > 0
    );
  }
}
