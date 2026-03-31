import type { Game } from '../models/game.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { GameStateService } from './game-state.service';
import { PERSISTENCE_KEY, PersistenceManagerService } from './persistence-manager.service';

describe('persistenceManagerService', () => {
  const mockGame: Game = {
    id: 'test-id',
    createdAt: '2024-01-01T00:00:00.000Z',
    columns: {
      [GAME_COLUMN.one]: { upper: {}, lower: {} },
      [GAME_COLUMN.two]: { upper: {}, lower: {} },
      [GAME_COLUMN.three]: { upper: {}, lower: {} },
    },
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ─── Restore ──────────────────────────────────────────────────────────────

  describe('restore on init', () => {
    test('should start a new game when localStorage is empty', () => {
      TestBed.inject(PersistenceManagerService);
      const gameState = TestBed.inject(GameStateService);

      expect(gameState.games()).toHaveLength(1);
    });

    test('should restore saved games from localStorage on init', () => {
      localStorage.setItem(
        PERSISTENCE_KEY,
        JSON.stringify({ games: [mockGame] })
      );

      TestBed.inject(PersistenceManagerService);
      const gameState = TestBed.inject(GameStateService);

      expect(gameState.games()).toHaveLength(1);
      expect(gameState.games()[0].id).toBe('test-id');
    });

    test('should discard corrupt localStorage data and start fresh', () => {
      localStorage.setItem(PERSISTENCE_KEY, 'not-valid-json{{{');

      TestBed.inject(PersistenceManagerService);
      const gameState = TestBed.inject(GameStateService);

      expect(gameState.games()).toHaveLength(1);
    });

    test('should discard invalid state shape and start fresh', () => {
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify({ invalid: true }));

      TestBed.inject(PersistenceManagerService);
      const gameState = TestBed.inject(GameStateService);

      expect(gameState.games()).toHaveLength(1);
    });

    test('should discard state where games is not an array', () => {
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify({ games: 'not-an-array' }));

      TestBed.inject(PersistenceManagerService);
      const gameState = TestBed.inject(GameStateService);

      expect(gameState.games()).toHaveLength(1);
    });

    test('should discard state with empty games array and start fresh', () => {
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify({ games: [] }));

      TestBed.inject(PersistenceManagerService);
      const gameState = TestBed.inject(GameStateService);

      expect(gameState.games()).toHaveLength(1);
    });

    test('should restore multiple saved games', () => {
      const secondGame: Game = { ...mockGame, id: 'second-id' };

      localStorage.setItem(
        PERSISTENCE_KEY,
        JSON.stringify({ games: [mockGame, secondGame] })
      );

      TestBed.inject(PersistenceManagerService);
      const gameState = TestBed.inject(GameStateService);

      expect(gameState.games()).toHaveLength(2);
      expect(gameState.games()[0].id).toBe('test-id');
      expect(gameState.games()[1].id).toBe('second-id');
    });
  });

  // ─── Auto-save ────────────────────────────────────────────────────────────

  describe('auto-save', () => {
    test('should write to localStorage after score is placed', () => {
      TestBed.inject(PersistenceManagerService);
      const gameState = TestBed.inject(GameStateService);

      gameState.setCurrentDice([3, 0, 0, 0, 2, 0]);
      TestBed.tick();
      gameState.placeScore(SCORE_CATEGORY.aces, 0);
      TestBed.tick();

      const raw = localStorage.getItem(PERSISTENCE_KEY);
      expect(raw).not.toBeNull();
      const saved = JSON.parse(raw ?? '') as { games: Game[] };
      expect(saved.games[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(3);
    });

    test('should save using the namespaced key', () => {
      TestBed.inject(PersistenceManagerService);
      TestBed.tick();

      expect(PERSISTENCE_KEY).toBe('triple-yahtzee-state');
      expect(localStorage.getItem(PERSISTENCE_KEY)).not.toBeNull();
    });

    test('should overwrite previous save on subsequent mutations', () => {
      TestBed.inject(PersistenceManagerService);
      const gameState = TestBed.inject(GameStateService);

      gameState.setCurrentDice([3, 0, 0, 0, 2, 0]);
      gameState.placeScore(SCORE_CATEGORY.aces, 0);
      TestBed.tick();

      gameState.setCurrentDice([0, 4, 0, 0, 1, 0]);
      gameState.placeScore(SCORE_CATEGORY.twos, 0);
      TestBed.tick();

      const raw = localStorage.getItem(PERSISTENCE_KEY);
      expect(raw).not.toBeNull();
      const saved = JSON.parse(raw ?? '') as { games: Game[] };
      expect(saved.games[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeDefined();
      expect(saved.games[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.twos]).toBeDefined();
    });
  });
});
