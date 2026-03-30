import type { DiceSet } from '../models/dice-set.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { GameStateService } from './game-state.service';

describe('gameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateService);
  });

  // ─── Initial State ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    test('should start with one empty game', () => {
      expect(service.games()).toHaveLength(1);
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
});
