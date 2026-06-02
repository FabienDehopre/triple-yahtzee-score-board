import type { Game } from '../models/game.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { UndoStore } from './undo.store';

function makeGame(partial?: Partial<Game>): Game {
  return {
    id: 'test-id',
    columns: {
      [GAME_COLUMN.one]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.two]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.three]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
    },
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe('undoStore', () => {
  let store: InstanceType<typeof UndoStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(UndoStore);
  });

  // ─── Initial State ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    test('canUndo should be false initially', () => {
      expect(store.canUndo()).toBeFalsy();
    });

    test('lastCategory should be undefined initially', () => {
      expect(store.lastCategory()).toBeUndefined();
    });
  });

  // ─── saveSnapshot ──────────────────────────────────────────────────────────

  describe('saveSnapshot', () => {
    test('should set canUndo to true after saving', () => {
      store.saveSnapshot([makeGame()], SCORE_CATEGORY.aces);
      expect(store.canUndo()).toBeTruthy();
    });

    test('should store the last category', () => {
      store.saveSnapshot([makeGame()], SCORE_CATEGORY.chance);
      expect(store.lastCategory()).toBe(SCORE_CATEGORY.chance);
    });

    test('should store a deep copy of the games', () => {
      const games = [makeGame()];
      store.saveSnapshot(games, SCORE_CATEGORY.aces);
      // Mutate original – snapshot should be unaffected
      games[0].id = 'mutated';
      const snap = store.getSnapshot();
      expect(snap?.games[0].id).toBe('test-id');
    });
  });

  // ─── clearSnapshot ─────────────────────────────────────────────────────────

  describe('clearSnapshot', () => {
    test('should set canUndo to false', () => {
      store.saveSnapshot([makeGame()], SCORE_CATEGORY.aces);
      store.clearSnapshot();
      expect(store.canUndo()).toBeFalsy();
    });

    test('should clear lastCategory', () => {
      store.saveSnapshot([makeGame()], SCORE_CATEGORY.aces);
      store.clearSnapshot();
      expect(store.lastCategory()).toBeUndefined();
    });
  });

  // ─── getSnapshot ───────────────────────────────────────────────────────────

  describe('getSnapshot', () => {
    test('should return undefined when no snapshot exists', () => {
      expect(store.getSnapshot()).toBeUndefined();
    });

    test('should return the saved games', () => {
      const games = [makeGame()];
      store.saveSnapshot(games, SCORE_CATEGORY.aces);
      const snap = store.getSnapshot();
      expect(snap).toBeDefined();
      expect(snap?.games[0].id).toBe('test-id');
      expect(snap?.category).toBe(SCORE_CATEGORY.aces);
    });

    test('should return undefined after clearSnapshot', () => {
      store.saveSnapshot([makeGame()], SCORE_CATEGORY.aces);
      store.clearSnapshot();
      expect(store.getSnapshot()).toBeUndefined();
    });
  });
});
