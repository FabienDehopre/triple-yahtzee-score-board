import type { Game } from '../models/game.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { UndoService } from './undo.service';

function makeGame(partial?: Partial<Game>): Game {
  return {
    id: 'test-id',
    columns: {
      [GAME_COLUMN.one]: { upper: {}, lower: {} },
      [GAME_COLUMN.two]: { upper: {}, lower: {} },
      [GAME_COLUMN.three]: { upper: {}, lower: {} },
    },
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe('undoService', () => {
  let service: UndoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UndoService);
  });

  // ─── Initial State ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    test('canUndo should be false initially', () => {
      expect(service.canUndo()).toBeFalsy();
    });

    test('lastCategory should be undefined initially', () => {
      expect(service.lastCategory()).toBeUndefined();
    });
  });

  // ─── saveSnapshot ──────────────────────────────────────────────────────────

  describe('saveSnapshot', () => {
    test('should set canUndo to true after saving', () => {
      service.saveSnapshot([makeGame()], SCORE_CATEGORY.aces);
      expect(service.canUndo()).toBeTruthy();
    });

    test('should store the last category', () => {
      service.saveSnapshot([makeGame()], SCORE_CATEGORY.chance);
      expect(service.lastCategory()).toBe(SCORE_CATEGORY.chance);
    });

    test('should store a deep copy of the games', () => {
      const games = [makeGame()];
      service.saveSnapshot(games, SCORE_CATEGORY.aces);
      // Mutate original – snapshot should be unaffected
      games[0].id = 'mutated';
      const restored = service.undo();
      expect(restored?.[0].id).toBe('test-id');
    });
  });

  // ─── clearSnapshot ─────────────────────────────────────────────────────────

  describe('clearSnapshot', () => {
    test('should set canUndo to false', () => {
      service.saveSnapshot([makeGame()], SCORE_CATEGORY.aces);
      service.clearSnapshot();
      expect(service.canUndo()).toBeFalsy();
    });

    test('should clear lastCategory', () => {
      service.saveSnapshot([makeGame()], SCORE_CATEGORY.aces);
      service.clearSnapshot();
      expect(service.lastCategory()).toBeUndefined();
    });
  });

  // ─── undo ──────────────────────────────────────────────────────────────────

  describe('undo', () => {
    test('should return undefined when no snapshot exists', () => {
      expect(service.undo()).toBeUndefined();
    });

    test('should return the saved games and clear the snapshot', () => {
      const games = [makeGame()];
      service.saveSnapshot(games, SCORE_CATEGORY.aces);
      const result = service.undo();
      expect(result).toBeDefined();
      expect(result?.[0].id).toBe('test-id');
      expect(service.canUndo()).toBeFalsy();
    });

    test('canUndo should be false after undo', () => {
      service.saveSnapshot([makeGame()], SCORE_CATEGORY.aces);
      service.undo();
      expect(service.canUndo()).toBeFalsy();
    });

    test('lastCategory should be undefined after undo', () => {
      service.saveSnapshot([makeGame()], SCORE_CATEGORY.aces);
      service.undo();
      expect(service.lastCategory()).toBeUndefined();
    });
  });
});
