import type { DiceSet } from '../models/dice-set.model';

import { TestBed } from '@angular/core/testing';

import {
  GAME_COLUMN,
  LOWER_CATEGORIES,
  UPPER_CATEGORIES
} from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { DEFAULT_GAME_COUNT, GameStateService } from './game-state.service';

/** Helper: fills all categories (3 columns each) for a single game index. */
function fillAllCellsForGame(service: GameStateService, gameIndex: number): void {
  const dice: DiceSet = [1, 1, 1, 1, 1, 0];
  for (const cat of UPPER_CATEGORIES) {
    for (let col = 0; col < 3; col++) {
      service.setCurrentDice(dice);
      service.placeScore(cat, gameIndex);
    }
  }
  for (const cat of LOWER_CATEGORIES) {
    for (let col = 0; col < 3; col++) {
      service.setCurrentDice(dice);
      service.placeScore(cat, gameIndex);
    }
  }
}

describe('gameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateService);
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

  // ─── placeScore ────────────────────────────────────────────────────────────

  describe('placeScore', () => {
    test('should do nothing when no dice are set', () => {
      service.placeScore(SCORE_CATEGORY.aces, 0);
      expect(service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeUndefined();
    });

    test('should place score in column ONE first', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      expect(service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(3);
    });

    test('should fill columns left-to-right: ONE → TWO → THREE', () => {
      const dice: DiceSet = [3, 0, 0, 0, 2, 0];
      service.setCurrentDice(dice);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      const game = service.games()[0];
      expect(game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeDefined();
      expect(game.columns[GAME_COLUMN.two].upper[SCORE_CATEGORY.aces]).toBeDefined();
      expect(game.columns[GAME_COLUMN.three].upper[SCORE_CATEGORY.aces]).toBeDefined();
    });

    test('should do nothing when all 3 columns are filled for a category', () => {
      const dice: DiceSet = [3, 0, 0, 0, 2, 0];
      service.setCurrentDice(dice);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      const gamesBefore = service.games();
      service.placeScore(SCORE_CATEGORY.aces, 0);
      expect(service.games()).toEqual(gamesBefore);
    });

    test('should mark isScratched when score is 0', () => {
      service.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet); // no aces
      service.placeScore(SCORE_CATEGORY.aces, 0);

      const cell = service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces];
      expect(cell?.value).toBe(0);
      expect(cell?.isScratched).toBeTruthy();
    });

    test('should not mark isScratched when score is positive', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      const cell = service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces];
      expect(cell?.value).toBe(3);
      expect(cell?.isScratched).toBeFalsy();
    });

    test('should do nothing for an out-of-bounds gameIndex', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      const gamesBefore = service.games();
      service.placeScore(SCORE_CATEGORY.aces, 99);
      expect(service.games()).toEqual(gamesBefore);
    });

    test('should place lower-section scores in the lower section', () => {
      service.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet); // five 6s → chance = 30
      service.placeScore(SCORE_CATEGORY.chance, 0);

      expect(service.games()[0].columns[GAME_COLUMN.one].lower[SCORE_CATEGORY.chance]?.value).toBe(30);
    });

    test('should place score in a specific game by gameIndex', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 1); // game index 1 (second game)

      expect(service.games()[1].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(3);
      expect(service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeUndefined();
    });
  });

  // ─── isAnyGameInProgress ───────────────────────────────────────────────────

  describe('isAnyGameInProgress', () => {
    test('should be false initially', () => {
      expect(service.isAnyGameInProgress()).toBeFalsy();
    });

    test('should be true after placing a score in any game', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      expect(service.isAnyGameInProgress()).toBeTruthy();
    });

    test('should be true after placing a score in a second game', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 1);

      expect(service.isAnyGameInProgress()).toBeTruthy();
    });

    test('should be false after setGameCount resets the state', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.setGameCount(3);

      expect(service.isAnyGameInProgress()).toBeFalsy();
    });
  });

  // ─── setGameCount ──────────────────────────────────────────────────────────

  describe('setGameCount', () => {
    test('should update the gameCount signal', () => {
      service.setGameCount(3);
      expect(service.gameCount()).toBe(3);
    });

    test('should reset games to the new count of empty games', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0); // place a score first
      service.setGameCount(3);

      expect(service.games()).toHaveLength(3);
      expect(service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeUndefined();
    });

    test('should clear currentDice', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
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
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.restoreGameCount(3);

      expect(service.gameCount()).toBe(3);
      // games should remain unchanged
      expect(service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeDefined();
    });
  });

  // ─── columnStats ───────────────────────────────────────────────────────────

  describe('columnStats', () => {
    test('should apply ×1 multiplier to ONE column upperTotal', () => {
      service.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet); // five 1s → aces = 5
      service.placeScore(SCORE_CATEGORY.aces, 0); // fills ONE

      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.one].upperRaw).toBe(5);
      expect(stats[GAME_COLUMN.one].upperTotal).toBe(5); // 5 × 1 = 5
    });

    test('should apply ×2 multiplier to TWO column upperTotal', () => {
      service.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0); // fills ONE
      service.placeScore(SCORE_CATEGORY.aces, 0); // fills TWO

      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.two].upperRaw).toBe(5);
      expect(stats[GAME_COLUMN.two].upperTotal).toBe(10); // 5 × 2 = 10
    });

    test('should apply ×3 multiplier to THREE column lowerTotal', () => {
      service.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet); // five 6s → chance = 30
      service.placeScore(SCORE_CATEGORY.chance, 0); // fills ONE
      service.placeScore(SCORE_CATEGORY.chance, 0); // fills TWO
      service.placeScore(SCORE_CATEGORY.chance, 0); // fills THREE

      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.three].lowerRaw).toBe(30);
      expect(stats[GAME_COLUMN.three].lowerTotal).toBe(90); // 30 × 3 = 90
    });

    test('should award upper bonus when raw total ≥ 63', () => {
      // five 1s=5, five 2s=10, five 3s=15, five 4s=20, [0,0,0,0,4,1]=fives=20 → total 70
      service.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.twos, 0);
      service.setCurrentDice([0, 0, 5, 0, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.threes, 0);
      service.setCurrentDice([0, 0, 0, 5, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.fours, 0);
      service.setCurrentDice([0, 0, 0, 0, 4, 1] as DiceSet); // four 5s + one 6 = fives: 20
      service.placeScore(SCORE_CATEGORY.fives, 0);

      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.one].upperRaw).toBe(70);
      expect(stats[GAME_COLUMN.one].upperBonus).toBe(35);
      expect(stats[GAME_COLUMN.one].upperTotal).toBe(105); // (70 + 35) × 1
    });

    test('should not award upper bonus when raw total < 63', () => {
      service.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      const stats = service.columnStats()[0];
      expect(stats[GAME_COLUMN.one].upperRaw).toBe(5);
      expect(stats[GAME_COLUMN.one].upperBonus).toBe(0);
    });

    test('should compute combined total as upperTotal + lowerTotal', () => {
      service.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet); // five 6s → sixes=30, chance=30
      service.placeScore(SCORE_CATEGORY.sixes, 0); // upper ONE: raw=30
      service.placeScore(SCORE_CATEGORY.chance, 0); // lower ONE: raw=30

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
      // five 6s → chance = 30 (×1 in ONE, ×2 in TWO, ×3 in THREE)
      service.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet);
      service.placeScore(SCORE_CATEGORY.chance, 0); // ONE: 30×1 = 30
      service.placeScore(SCORE_CATEGORY.chance, 0); // TWO: 30×2 = 60
      service.placeScore(SCORE_CATEGORY.chance, 0); // THREE: 30×3 = 90

      expect(service.grandTotal()).toBe(180); // 30 + 60 + 90
    });

    test('should include upper bonus in grand total', () => {
      // Fill upper section in ONE column to get bonus
      service.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0); // 5
      service.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.twos, 0); // 10
      service.setCurrentDice([0, 0, 5, 0, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.threes, 0); // 15
      service.setCurrentDice([0, 0, 0, 5, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.fours, 0); // 20
      service.setCurrentDice([0, 0, 0, 0, 4, 1] as DiceSet);
      service.placeScore(SCORE_CATEGORY.fives, 0); // 20 → raw=70 ≥ 63 → bonus=35 → upperTotal=105

      expect(service.grandTotal()).toBe(105); // 105 + 0 (lower) = 105 for ONE column only
    });

    test('should sum totals across multiple games', () => {
      // game[0]: chance ONE = 30×1 = 30
      service.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet);
      service.placeScore(SCORE_CATEGORY.chance, 0);
      // game[1]: chance ONE = 30×1 = 30
      service.placeScore(SCORE_CATEGORY.chance, 1);

      expect(service.grandTotal()).toBe(60); // 30 + 30
    });
  });

  // ─── isGameOver ────────────────────────────────────────────────────────────

  describe('isGameOver', () => {
    test('should be false initially', () => {
      expect(service.isGameOver()).toBeFalsy();
    });

    test('should be false when only some cells are filled', () => {
      service.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      expect(service.isGameOver()).toBeFalsy();
    });

    test('should be true when all cells in all games are filled', () => {
      const gameCount = service.games().length;
      for (let gi = 0; gi < gameCount; gi++) {
        fillAllCellsForGame(service, gi);
      }

      expect(service.isGameOver()).toBeTruthy();
    });

    test('should be false when only one game is fully filled (in a 2-game session)', () => {
      fillAllCellsForGame(service, 0);

      expect(service.isGameOver()).toBeFalsy();
    });
  });

  // ─── newGame ───────────────────────────────────────────────────────────────

  describe('newGame', () => {
    test('should reset games to the configured number of empty games', () => {
      // Place a score first
      service.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      service.newGame();

      expect(service.games()).toHaveLength(service.gameCount());
      expect(service.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeUndefined();
    });

    test('should reset currentDice to undefined', () => {
      service.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
      service.newGame();

      expect(service.currentDice()).toBeUndefined();
    });

    test('should reset isGameOver to false', () => {
      // Fill all cells to trigger game over
      const gameCount = service.games().length;
      for (let gi = 0; gi < gameCount; gi++) {
        fillAllCellsForGame(service, gi);
      }
      expect(service.isGameOver()).toBeTruthy();

      service.newGame();

      expect(service.isGameOver()).toBeFalsy();
    });

    test('should reset grandTotal to 0', () => {
      service.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet);
      service.placeScore(SCORE_CATEGORY.chance, 0);
      service.placeScore(SCORE_CATEGORY.chance, 0);
      service.placeScore(SCORE_CATEGORY.chance, 0);
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
