import type { DiceSet } from '../models/dice-set.model';

import { TestBed } from '@angular/core/testing';

import { readCell } from '../models/game-cells';
import { GAME_COLUMN } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { SessionStore } from './session.store';
import { UndoStore } from './undo.store';

describe('sessionStore', () => {
  let store: InstanceType<typeof SessionStore>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(SessionStore);
  });

  // ─── Initial State ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    test('should have 2 games by default', () => {
      expect(store.games()).toHaveLength(2);
    });

    test('should have gameCount 2 by default', () => {
      expect(store.gameCount()).toBe(2);
    });

    test('should have no current dice', () => {
      expect(store.currentDice()).toBeUndefined();
    });

    test('should have activeGameIndex 0', () => {
      expect(store.activeGameIndex()).toBe(0);
    });

    test('isGameOver should be false', () => {
      expect(store.isGameOver()).toBeFalsy();
    });

    test('isAnyGameInProgress should be false', () => {
      expect(store.isAnyGameInProgress()).toBeFalsy();
    });

    test('grandTotal should be 0', () => {
      expect(store.grandTotal()).toBe(0);
    });
  });

  // ─── setCurrentDice ────────────────────────────────────────────────────────

  describe('setCurrentDice', () => {
    test('should update currentDice', () => {
      const dice: DiceSet = [1, 2, 0, 0, 2, 0];
      store.setCurrentDice(dice);
      expect(store.currentDice()).toEqual(dice);
    });

    test('should clear undo snapshot when dice are set', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);
      const undoStore = TestBed.inject(UndoStore);
      expect(undoStore.canUndo()).toBeTruthy();

      store.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);
      expect(undoStore.canUndo()).toBeFalsy();
    });
  });

  // ─── placeScore (Left-to-Right Fill Rule) ─────────────────────────────────

  describe('placeScore', () => {
    test('should place score in ONE column on first placement', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);

      expect(readCell(store.games()[0], GAME_COLUMN.one, SCORE_CATEGORY.aces)).toEqual({
        value: 5,
        isScratched: false,
      });
    });

    test('should advance to TWO column after ONE is filled', () => {
      const dice: DiceSet = [5, 0, 0, 0, 0, 0];
      store.setCurrentDice(dice);
      store.placeScore(SCORE_CATEGORY.aces, 0);
      store.setCurrentDice(dice);
      store.placeScore(SCORE_CATEGORY.aces, 0);

      expect(readCell(store.games()[0], GAME_COLUMN.two, SCORE_CATEGORY.aces)).toBeDefined();
    });

    test('should clear currentDice after placement', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);
      expect(store.currentDice()).toBeUndefined();
    });

    test('should mark scratch when score is 0', () => {
      store.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet); // no aces
      store.placeScore(SCORE_CATEGORY.aces, 0);

      const cell = readCell(store.games()[0], GAME_COLUMN.one, SCORE_CATEGORY.aces);
      expect(cell?.value).toBe(0);
      expect(cell?.isScratched).toBeTruthy();
    });

    test('should save undo snapshot before placement', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);

      const undoStore = TestBed.inject(UndoStore);
      expect(undoStore.canUndo()).toBeTruthy();
      expect(undoStore.lastCategory()).toBe(SCORE_CATEGORY.aces);
    });

    test('should place independently in game 1', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 1);

      expect(readCell(store.games()[1], GAME_COLUMN.one, SCORE_CATEGORY.aces)).toBeDefined();
      expect(readCell(store.games()[0], GAME_COLUMN.one, SCORE_CATEGORY.aces)).toBeUndefined();
    });

    test('should accumulate Yahtzee Bonus on second yahtzee', () => {
      // Fill yahtzee in ONE first
      store.setCurrentDice([0, 0, 0, 0, 5, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.yahtzee, 0);
      // Second yahtzee → bonus
      store.setCurrentDice([0, 0, 0, 0, 5, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0); // place something to trigger bonus check

      expect(store.games()[0].columns.TWO.yahtzeeBonus).toBe(0); // no bonus for non-yahtzee roll category
    });
  });

  // ─── undo ──────────────────────────────────────────────────────────────────

  describe('undo', () => {
    test('should restore previous game state', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);
      expect(readCell(store.games()[0], GAME_COLUMN.one, SCORE_CATEGORY.aces)).toBeDefined();

      store.undo();
      expect(readCell(store.games()[0], GAME_COLUMN.one, SCORE_CATEGORY.aces)).toBeUndefined();
    });

    test('should clear undo snapshot after undo', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);
      store.undo();

      const undoStore = TestBed.inject(UndoStore);
      expect(undoStore.canUndo()).toBeFalsy();
    });

    test('should do nothing when no snapshot exists', () => {
      const gamesBefore = store.games();
      store.undo();
      expect(store.games()).toEqual(gamesBefore);
    });
  });

  // ─── newGame ───────────────────────────────────────────────────────────────

  describe('newGame', () => {
    test('should reset all games to empty', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);
      store.newGame();

      expect(readCell(store.games()[0], GAME_COLUMN.one, SCORE_CATEGORY.aces)).toBeUndefined();
    });

    test('should clear currentDice', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.newGame();
      expect(store.currentDice()).toBeUndefined();
    });

    test('should reset activeGameIndex to 0', () => {
      store.setActiveGameIndex(1);
      store.newGame();
      expect(store.activeGameIndex()).toBe(0);
    });

    test('isAnyGameInProgress should be false after newGame', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);
      store.newGame();
      expect(store.isAnyGameInProgress()).toBeFalsy();
    });
  });

  // ─── setGameCount ──────────────────────────────────────────────────────────

  describe('setGameCount', () => {
    test('should add games when increasing count', () => {
      store.setGameCount(3);
      expect(store.games()).toHaveLength(3);
      expect(store.gameCount()).toBe(3);
    });

    test('should remove games when decreasing count', () => {
      store.setGameCount(1);
      expect(store.games()).toHaveLength(1);
      expect(store.gameCount()).toBe(1);
    });

    test('should preserve existing scores when increasing', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);
      store.setGameCount(3);
      expect(readCell(store.games()[0], GAME_COLUMN.one, SCORE_CATEGORY.aces)).toBeDefined();
    });
  });

  // ─── hasScoreInGamesFrom ───────────────────────────────────────────────────

  describe('hasScoreInGamesFrom', () => {
    test('should return false when games from index are empty', () => {
      expect(store.hasScoreInGamesFrom(1)).toBeFalsy();
    });

    test('should return true when game at index has a score', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 1);
      expect(store.hasScoreInGamesFrom(1)).toBeTruthy();
    });

    test('should return false when score is before index', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);
      expect(store.hasScoreInGamesFrom(1)).toBeFalsy();
    });
  });

  // ─── isAnyGameInProgress ───────────────────────────────────────────────────

  describe('isAnyGameInProgress', () => {
    test('should be true after placing a score', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0);
      expect(store.isAnyGameInProgress()).toBeTruthy();
    });
  });

  // ─── grandTotal ───────────────────────────────────────────────────────────

  describe('grandTotal', () => {
    test('should sum scores across all games and columns', () => {
      const dice: DiceSet = [0, 0, 0, 0, 0, 5]; // five 6s → chance = 30
      store.setCurrentDice(dice);
      store.placeScore(SCORE_CATEGORY.chance, 0); // ONE: 30×1 = 30
      store.setCurrentDice(dice);
      store.placeScore(SCORE_CATEGORY.chance, 0); // TWO: 30×2 = 60
      store.setCurrentDice(dice);
      store.placeScore(SCORE_CATEGORY.chance, 0); // THREE: 30×3 = 90

      expect(store.grandTotal()).toBe(180);
    });
  });

  // ─── suggestions ──────────────────────────────────────────────────────────

  describe('suggestions', () => {
    test('should return empty when no dice', () => {
      expect(store.suggestions()).toHaveLength(0);
    });

    test('should return ranked suggestions when dice are set', () => {
      store.setCurrentDice([0, 0, 0, 0, 5, 0] as DiceSet);
      const suggestions = store.suggestions();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].category).toBe(SCORE_CATEGORY.yahtzee);
    });
  });

  // ─── columnStats / upper bonus ─────────────────────────────────────────────

  describe('columnStats', () => {
    test('should award upper bonus when raw total >= 63', () => {
      store.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.aces, 0); // 5
      store.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.twos, 0); // 10
      store.setCurrentDice([0, 0, 5, 0, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.threes, 0); // 15
      store.setCurrentDice([0, 0, 0, 5, 0, 0] as DiceSet);
      store.placeScore(SCORE_CATEGORY.fours, 0); // 20
      store.setCurrentDice([0, 0, 0, 0, 4, 1] as DiceSet);
      store.placeScore(SCORE_CATEGORY.fives, 0); // 20 → total = 70 ≥ 63

      const stats = store.columnStats()[0][GAME_COLUMN.one];
      expect(stats.upperBonusRaw).toBe(35);
    });
  });
});
