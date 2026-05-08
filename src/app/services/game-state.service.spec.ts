import type { DiceSet } from '../models/dice-set.model';

import { TestBed } from '@angular/core/testing';

import {
  GAME_COLUMN,
  LOWER_CATEGORIES,
  UPPER_CATEGORIES
} from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { DEFAULT_GAME_COUNT, GameStateService } from './game-state.service';
import { PlacementService } from './placement.service';

/** Helper: fills all categories (3 columns each) for a single game index. */
function fillAllCellsForGame(placement: PlacementService, gameIndex: number): void {
  const dice: DiceSet = [1, 1, 1, 1, 1, 0];
  for (const cat of UPPER_CATEGORIES) {
    for (let col = 0; col < 3; col++) {
      placement.setCurrentDice(dice);
      placement.placeScore(cat, gameIndex);
    }
  }
  for (const cat of LOWER_CATEGORIES) {
    for (let col = 0; col < 3; col++) {
      placement.setCurrentDice(dice);
      placement.placeScore(cat, gameIndex);
    }
  }
}

describe('gameStateService', () => {
  let service: GameStateService;
  let placement: PlacementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateService);
    placement = TestBed.inject(PlacementService);
  });

  // ─── Initial State ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    test('should start with the default number of empty games', () => {
      expect(service.games()).toHaveLength(DEFAULT_GAME_COUNT);
    });

    test('should start with undefined currentDice', () => {
      expect(service.currentDice()).toBeUndefined();
    });

    test('should have all-zero combined totals initially', () => {
      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.one].combinedTotal).toBe(0);
      expect(stats[GAME_COLUMN.two].combinedTotal).toBe(0);
      expect(stats[GAME_COLUMN.three].combinedTotal).toBe(0);
    });

    test('should start with the default game count', () => {
      expect(service.gameCount()).toBe(DEFAULT_GAME_COUNT);
    });

    test('should not be in progress initially', () => {
      expect(service.isAnyGameInProgress()).toBeFalsy();
    });
  });

  // ─── setCurrentDice ────────────────────────────────────────────────────────

  describe('setCurrentDice', () => {
    test('should update currentDice signal', () => {
      const dice: DiceSet = [2, 1, 0, 1, 1, 0];
      service.setCurrentDice(dice);
      expect(service.currentDice()).toEqual(dice);
    });
  });

  // ─── isAnyGameInProgress ───────────────────────────────────────────────────

  describe('isAnyGameInProgress', () => {
    test('should be false initially', () => {
      expect(service.isAnyGameInProgress()).toBeFalsy();
    });

    test('should be true after placing a score in any game', () => {
      placement.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0);

      expect(service.isAnyGameInProgress()).toBeTruthy();
    });

    test('should be true after placing a score in a second game', () => {
      placement.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 1);

      expect(service.isAnyGameInProgress()).toBeTruthy();
    });

    test('should be false after setGameCount removes the only scored game from the tail', () => {
      service.setGameCount(3);
      placement.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 2); // score only in game 2
      service.setGameCount(2); // removes game 2

      expect(service.isAnyGameInProgress()).toBeFalsy();
    });
  });

  // ─── setGameCount ──────────────────────────────────────────────────────────

  describe('setGameCount', () => {
    test('should update the gameCount signal', () => {
      service.setGameCount(3);
      expect(service.gameCount()).toBe(3);
    });

    test('should preserve existing scores when increasing game count', () => {
      placement.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0); // score in game 0
      service.setGameCount(3);

      expect(service.games()).toHaveLength(3);
      expect(service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(3);
    });

    test('should append empty games when increasing game count', () => {
      placement.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0);
      service.setGameCount(3);

      expect(service.games()[2].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeUndefined();
    });

    test('should preserve scores in remaining games when decreasing game count', () => {
      service.setGameCount(3);
      placement.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0); // score in game 0
      service.setGameCount(1);

      expect(service.games()).toHaveLength(1);
      expect(service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(3);
    });

    test('should clamp activeGameIndex to last valid index when count decreases', () => {
      service.setActiveGameIndex(1); // active = game 1 (out of 2)
      service.setGameCount(1);

      expect(service.activeGameIndex()).toBe(0);
    });

    test('should not change activeGameIndex when it remains within bounds', () => {
      service.setActiveGameIndex(0);
      service.setGameCount(3);

      expect(service.activeGameIndex()).toBe(0);
    });

    test('should clear currentDice', () => {
      placement.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.setGameCount(1);

      expect(service.currentDice()).toBeUndefined();
    });

    test('should work for 1 game', () => {
      service.setGameCount(1);
      expect(service.games()).toHaveLength(1);
    });

    test('should work for 5 games', () => {
      service.setGameCount(5);
      expect(service.games()).toHaveLength(5);
    });
  });

  // ─── restoreGameCount ──────────────────────────────────────────────────────

  describe('restoreGameCount', () => {
    test('should update the gameCount without resetting games', () => {
      placement.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0);
      service.restoreGameCount(3);

      expect(service.gameCount()).toBe(3);
      // games should remain unchanged
      expect(service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeDefined();
    });
  });

  // ─── activeGameIndex ───────────────────────────────────────────────────────

  describe('activeGameIndex', () => {
    test('should start at 0', () => {
      expect(service.activeGameIndex()).toBe(0);
    });

    test('should update when setActiveGameIndex is called', () => {
      service.setActiveGameIndex(1);
      expect(service.activeGameIndex()).toBe(1);
    });

    test('should reset to 0 when newGame is called', () => {
      service.setActiveGameIndex(1);
      service.newGame();
      expect(service.activeGameIndex()).toBe(0);
    });
  });

  // ─── hasScoreInGamesFrom ───────────────────────────────────────────────────

  describe('hasScoreInGamesFrom', () => {
    test('should return false when all games from index are empty', () => {
      expect(service.hasScoreInGamesFrom(0)).toBeFalsy();
    });

    test('should return true when a game at the start index has a scored cell', () => {
      placement.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 1); // game 1
      expect(service.hasScoreInGamesFrom(1)).toBeTruthy();
    });

    test('should return false when all scored games are before the start index', () => {
      placement.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0); // game 0
      expect(service.hasScoreInGamesFrom(1)).toBeFalsy();
    });
  });

  // ─── columnStats ───────────────────────────────────────────────────────────

  describe('columnStats', () => {
    test('should apply ×1 multiplier to ONE column upperTotal', () => {
      placement.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet); // five 1s → aces = 5
      placement.placeScore(SCORE_CATEGORY.aces, 0); // fills ONE

      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.one].upperRaw).toBe(5);
      expect(stats[GAME_COLUMN.one].upperTotal).toBe(5); // 5 × 1 = 5
    });

    test('should apply ×2 multiplier to TWO column upperTotal', () => {
      const dice: DiceSet = [5, 0, 0, 0, 0, 0];
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.aces, 0); // fills ONE
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.aces, 0); // fills TWO

      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.two].upperRaw).toBe(5);
      expect(stats[GAME_COLUMN.two].upperTotal).toBe(10); // 5 × 2 = 10
    });

    test('should apply ×3 multiplier to THREE column lowerTotal', () => {
      const dice: DiceSet = [0, 0, 0, 0, 0, 5]; // five 6s → chance = 30
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // fills ONE
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // fills TWO
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // fills THREE

      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.three].lowerRaw).toBe(30);
      expect(stats[GAME_COLUMN.three].lowerTotal).toBe(90); // 30 × 3 = 90
    });

    test('should award upper bonus when raw total ≥ 63', () => {
      placement.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0);
      placement.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.twos, 0);
      placement.setCurrentDice([0, 0, 5, 0, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.threes, 0);
      placement.setCurrentDice([0, 0, 0, 5, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.fours, 0);
      placement.setCurrentDice([0, 0, 0, 0, 4, 1] as DiceSet); // four 5s + one 6 = fives: 20
      placement.placeScore(SCORE_CATEGORY.fives, 0);

      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.one].upperRaw).toBe(70);
      expect(stats[GAME_COLUMN.one].upperBonus).toBe(35);
      expect(stats[GAME_COLUMN.one].upperTotal).toBe(105); // (70 + 35) × 1
    });

    test('should not award upper bonus when raw total < 63', () => {
      placement.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0);

      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.one].upperRaw).toBe(5);
      expect(stats[GAME_COLUMN.one].upperBonus).toBe(0);
    });

    test('should compute combined total as upperTotal + lowerTotal', () => {
      const dice: DiceSet = [0, 0, 0, 0, 0, 5]; // five 6s → sixes=30, chance=30
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.sixes, 0); // upper ONE: raw=30
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // lower ONE: raw=30

      const stats = service.columnStats()[0];
      // upperTotal = 30 × 1 = 30, lowerTotal = 30 × 1 = 30, combined = 60
      expect(stats[GAME_COLUMN.one].combinedTotal).toBe(60);
    });
  });

  // ─── grandTotal ────────────────────────────────────────────────────────────

  describe('grandTotal', () => {
    test('should be 0 initially', () => {
      expect(service.grandTotal()).toBe(0);
    });

    test('should sum combined totals across all columns (×1 + ×2 + ×3)', () => {
      const dice: DiceSet = [0, 0, 0, 0, 0, 5]; // five 6s → chance = 30
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // ONE: 30×1 = 30
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // TWO: 30×2 = 60
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // THREE: 30×3 = 90

      expect(service.grandTotal()).toBe(180); // 30 + 60 + 90
    });

    test('should include upper bonus in grand total', () => {
      placement.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0); // 5
      placement.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.twos, 0); // 10
      placement.setCurrentDice([0, 0, 5, 0, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.threes, 0); // 15
      placement.setCurrentDice([0, 0, 0, 5, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.fours, 0); // 20
      placement.setCurrentDice([0, 0, 0, 0, 4, 1] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.fives, 0); // 20 → raw=70 ≥ 63 → bonus=35 → upperTotal=105

      expect(service.grandTotal()).toBe(105);
    });

    test('should sum totals across multiple games', () => {
      const dice: DiceSet = [0, 0, 0, 0, 0, 5];
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // game[0] ONE: 30×1 = 30
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 1); // game[1] ONE: 30×1 = 30

      expect(service.grandTotal()).toBe(60); // 30 + 30
    });
  });

  // ─── isGameOver ────────────────────────────────────────────────────────────

  describe('isGameOver', () => {
    test('should be false initially', () => {
      expect(service.isGameOver()).toBeFalsy();
    });

    test('should be false when only some cells are filled', () => {
      placement.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0);

      expect(service.isGameOver()).toBeFalsy();
    });

    test('should be true when all cells in all games are filled', () => {
      const gameCount = service.games().length;
      for (let gi = 0; gi < gameCount; gi++) {
        fillAllCellsForGame(placement, gi);
      }

      expect(service.isGameOver()).toBeTruthy();
    });

    test('should be false when only one game is fully filled (in a 2-game session)', () => {
      fillAllCellsForGame(placement, 0);

      expect(service.isGameOver()).toBeFalsy();
    });
  });

  // ─── newGame ───────────────────────────────────────────────────────────────

  describe('newGame', () => {
    test('should reset games to the configured number of empty games', () => {
      placement.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      placement.placeScore(SCORE_CATEGORY.aces, 0);

      service.newGame();

      expect(service.games()).toHaveLength(service.gameCount());
      expect(service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeUndefined();
    });

    test('should reset currentDice to undefined', () => {
      placement.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      service.newGame();

      expect(service.currentDice()).toBeUndefined();
    });

    test('should reset isGameOver to false', () => {
      const gameCount = service.games().length;
      for (let gi = 0; gi < gameCount; gi++) {
        fillAllCellsForGame(placement, gi);
      }
      expect(service.isGameOver()).toBeTruthy();

      service.newGame();

      expect(service.isGameOver()).toBeFalsy();
    });

    test('should reset grandTotal to 0', () => {
      const dice: DiceSet = [0, 0, 0, 0, 0, 5];
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // ONE: 30
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // TWO: 60
      placement.setCurrentDice(dice);
      placement.placeScore(SCORE_CATEGORY.chance, 0); // THREE: 90
      expect(service.grandTotal()).toBe(180);

      service.newGame();

      expect(service.grandTotal()).toBe(0);
    });

    test('should preserve the configured game count after reset', () => {
      service.setGameCount(3);
      service.newGame();

      expect(service.games()).toHaveLength(3);
      expect(service.gameCount()).toBe(3);
    });
  });
});
