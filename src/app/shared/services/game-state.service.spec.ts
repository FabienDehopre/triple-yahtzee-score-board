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

  // ─── Initial state ──────────────────────────────────────────────────────────

  test('should start with one empty game', () => {
    expect(service.games()).toHaveLength(1);
  });

  test('should start with null currentDice', () => {
    expect(service.currentDice()).toBeUndefined();
  });

  test('should start with zero totals for all columns', () => {
    const stats = service.columnStats()[0];
    for (const col of [GAME_COLUMN.one, GAME_COLUMN.two, GAME_COLUMN.three]) {
      expect(stats[col].upperRawTotal).toBe(0);
      expect(stats[col].upperBonus).toBe(0);
      expect(stats[col].upperTotal).toBe(0);
      expect(stats[col].lowerTotal).toBe(0);
      expect(stats[col].combinedTotal).toBe(0);
    }
  });

  // ─── setCurrentDice ─────────────────────────────────────────────────────────

  test('should update currentDice when setCurrentDice is called', () => {
    const dice: DiceSet = [1, 1, 1, 1, 1, 0];
    service.setCurrentDice(dice);
    expect(service.currentDice()).toEqual(dice);
  });

  // ─── placeScore – column fill order ─────────────────────────────────────────

  test('should place score in column ONE first', () => {
    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    service.setCurrentDice(dice);
    service.placeScore(SCORE_CATEGORY.aces, 0);

    const game = service.games()[0];
    expect(game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(5);
    expect(game.columns[GAME_COLUMN.two].upper[SCORE_CATEGORY.aces]).toBeUndefined();
    expect(game.columns[GAME_COLUMN.three].upper[SCORE_CATEGORY.aces]).toBeUndefined();
  });

  test('should place score in column TWO after ONE is filled', () => {
    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    service.setCurrentDice(dice);
    service.placeScore(SCORE_CATEGORY.aces, 0);
    service.placeScore(SCORE_CATEGORY.aces, 0);

    const game = service.games()[0];
    expect(game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(5);
    expect(game.columns[GAME_COLUMN.two].upper[SCORE_CATEGORY.aces]?.value).toBe(5);
    expect(game.columns[GAME_COLUMN.three].upper[SCORE_CATEGORY.aces]).toBeUndefined();
  });

  test('should place score in column THREE after ONE and TWO are filled', () => {
    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    service.setCurrentDice(dice);
    service.placeScore(SCORE_CATEGORY.aces, 0);
    service.placeScore(SCORE_CATEGORY.aces, 0);
    service.placeScore(SCORE_CATEGORY.aces, 0);

    const game = service.games()[0];
    expect(game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(5);
    expect(game.columns[GAME_COLUMN.two].upper[SCORE_CATEGORY.aces]?.value).toBe(5);
    expect(game.columns[GAME_COLUMN.three].upper[SCORE_CATEGORY.aces]?.value).toBe(5);
  });

  test('should not place score when all columns are filled', () => {
    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    service.setCurrentDice(dice);
    service.placeScore(SCORE_CATEGORY.aces, 0);
    service.placeScore(SCORE_CATEGORY.aces, 0);
    service.placeScore(SCORE_CATEGORY.aces, 0);
    // 4th attempt – all filled, should be a no-op
    service.placeScore(SCORE_CATEGORY.aces, 0);

    const game = service.games()[0];
    expect(game.columns[GAME_COLUMN.three].upper[SCORE_CATEGORY.aces]?.value).toBe(5);
  });

  test('should not place score when currentDice is null', () => {
    service.placeScore(SCORE_CATEGORY.aces, 0);

    const game = service.games()[0];
    expect(game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeUndefined();
  });

  // ─── placeScore – lower section ─────────────────────────────────────────────

  test('should place lower section score into lower section', () => {
    // 3-of-a-kind: three 4s + two 2s → sum = 16
    const dice: DiceSet = [0, 2, 0, 3, 0, 0];
    service.setCurrentDice(dice);
    service.placeScore(SCORE_CATEGORY.threeOfAKind, 0);

    const game = service.games()[0];
    expect(game.columns[GAME_COLUMN.one].lower[SCORE_CATEGORY.threeOfAKind]?.value).toBe(16);
  });

  // ─── placeScore – scratching ─────────────────────────────────────────────────

  test('should mark cell as scratched when score is 0', () => {
    // Full house requires 3+2; give dice that score 0 for yahtzee
    const dice: DiceSet = [1, 1, 1, 1, 1, 0];
    service.setCurrentDice(dice);
    service.placeScore(SCORE_CATEGORY.yahtzee, 0);

    const cell = service.games()[0].columns[GAME_COLUMN.one].lower[SCORE_CATEGORY.yahtzee];
    expect(cell?.value).toBe(0);
    expect(cell?.isScratched).toBeTruthy();
  });

  // ─── Computed totals ─────────────────────────────────────────────────────────

  test('should compute upper raw total correctly', () => {
    // Two 1s and three 2s → aces = 2, twos = 6, total = 8
    service.setCurrentDice([2, 3, 0, 0, 0, 0]);
    service.placeScore(SCORE_CATEGORY.aces, 0);
    service.placeScore(SCORE_CATEGORY.twos, 0);

    const stats = service.columnStats()[0];
    expect(stats[GAME_COLUMN.one].upperRawTotal).toBe(8);
  });

  test('should award upper bonus when raw total reaches 63', () => {
    // Sixes ×5 = 30, Fives ×5 = 25, Fours ×2 = 8 → 63 total → bonus!
    service.setCurrentDice([0, 0, 0, 2, 0, 0]);
    service.placeScore(SCORE_CATEGORY.fours, 0);

    service.setCurrentDice([0, 0, 0, 0, 5, 0]);
    service.placeScore(SCORE_CATEGORY.fives, 0);

    service.setCurrentDice([0, 0, 0, 0, 0, 5]);
    service.placeScore(SCORE_CATEGORY.sixes, 0);

    const stats = service.columnStats()[0];
    // 8 + 25 + 30 = 63 → bonus awarded
    expect(stats[GAME_COLUMN.one].upperRawTotal).toBe(63);
    expect(stats[GAME_COLUMN.one].upperBonus).toBe(35);
  });

  test('should NOT award upper bonus when raw total is below 63', () => {
    service.setCurrentDice([1, 0, 0, 0, 0, 0]);
    service.placeScore(SCORE_CATEGORY.aces, 0);

    const stats = service.columnStats()[0];
    expect(stats[GAME_COLUMN.one].upperBonus).toBe(0);
  });

  test('should apply column TWO multiplier (×2) to upperTotal', () => {
    // Place 5 aces (raw = 5) in column ONE first, then column TWO
    service.setCurrentDice([5, 0, 0, 0, 0, 0]);
    service.placeScore(SCORE_CATEGORY.aces, 0); // ONE
    service.placeScore(SCORE_CATEGORY.aces, 0); // TWO

    const stats = service.columnStats()[0];
    // Column ONE: 5 × 1 = 5 (no bonus)
    expect(stats[GAME_COLUMN.one].upperTotal).toBe(5);
    // Column TWO: 5 × 2 = 10 (no bonus)
    expect(stats[GAME_COLUMN.two].upperTotal).toBe(10);
  });

  test('should apply column THREE multiplier (×3) to combinedTotal', () => {
    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    service.setCurrentDice(dice);
    service.placeScore(SCORE_CATEGORY.aces, 0); // ONE
    service.placeScore(SCORE_CATEGORY.aces, 0); // TWO
    service.placeScore(SCORE_CATEGORY.aces, 0); // THREE

    const stats = service.columnStats()[0];
    // Column THREE: 5 × 3 = 15
    expect(stats[GAME_COLUMN.three].upperTotal).toBe(15);
  });

  test('should compute combinedTotal as upper + lower', () => {
    // Aces raw = 5, Three of a kind (five 1s) raw = 5
    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    service.setCurrentDice(dice);
    service.placeScore(SCORE_CATEGORY.aces, 0);
    service.placeScore(SCORE_CATEGORY.threeOfAKind, 0);

    const stats = service.columnStats()[0];
    // Column ONE: (5 upper + 0 bonus + 5 lower) × 1 = 10
    expect(stats[GAME_COLUMN.one].combinedTotal).toBe(10);
  });
});
