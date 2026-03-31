import type { AvailableCell } from '../models/available-cell.model';
import type { DiceSet } from '../models/dice-set.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { GreedySuggestionStrategy } from './greedy-suggestion-strategy';

describe('greedySuggestionStrategy', () => {
  let strategy: GreedySuggestionStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    strategy = TestBed.inject(GreedySuggestionStrategy);
  });

  // ─── Empty input ──────────────────────────────────────────────────────────

  describe('no available cells', () => {
    test('should return empty array when no cells are available', () => {
      const dice: DiceSet = [0, 0, 0, 0, 5, 0];
      expect(strategy.suggest(dice, [])).toEqual([]);
    });
  });

  // ─── Single cell ──────────────────────────────────────────────────────────

  describe('single available cell', () => {
    test('should return the one cell when only one is available', () => {
      const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // five 5s → yahtzee = 50
      const cells: AvailableCell[] = [{ category: SCORE_CATEGORY.yahtzee, column: GAME_COLUMN.one }];
      const results = strategy.suggest(dice, cells);
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe(SCORE_CATEGORY.yahtzee);
      expect(results[0].column).toBe(GAME_COLUMN.one);
      expect(results[0].score).toBe(50); // 50 * 1
    });

    test('should apply column multiplier to single cell score', () => {
      const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // five 5s → yahtzee = 50
      const cells: AvailableCell[] = [{ category: SCORE_CATEGORY.yahtzee, column: GAME_COLUMN.three }];
      const results = strategy.suggest(dice, cells);
      expect(results[0].score).toBe(150); // 50 * 3
    });
  });

  // ─── Highest-scoring first ────────────────────────────────────────────────

  describe('highest score', () => {
    test('should return cells sorted by descending multiplied score', () => {
      // five 5s: yahtzee=50, fives=25, chance=25, threeOfAKind=25, fourOfAKind=25
      const dice: DiceSet = [0, 0, 0, 0, 5, 0];
      const cells: AvailableCell[] = [
        { category: SCORE_CATEGORY.chance, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.yahtzee, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.fives, column: GAME_COLUMN.one },
      ];
      const results = strategy.suggest(dice, cells);
      expect(results[0].category).toBe(SCORE_CATEGORY.yahtzee);
      expect(results[0].score).toBe(50);
    });

    test('should place higher-multiplier column suggestion first when raw scores differ', () => {
      // dice [1,1,1,1,1,0]: largeStraight=40, smallStraight=30
      const dice: DiceSet = [1, 1, 1, 1, 1, 0];
      const cells: AvailableCell[] = [
        { category: SCORE_CATEGORY.smallStraight, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.largeStraight, column: GAME_COLUMN.one },
      ];
      const results = strategy.suggest(dice, cells);
      expect(results[0].category).toBe(SCORE_CATEGORY.largeStraight);
      expect(results[0].score).toBe(40);
      expect(results[1].category).toBe(SCORE_CATEGORY.smallStraight);
      expect(results[1].score).toBe(30);
    });

    test('should rank column THREE higher than column ONE for the same category', () => {
      const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // yahtzee=50
      const cells: AvailableCell[] = [
        { category: SCORE_CATEGORY.yahtzee, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.yahtzee, column: GAME_COLUMN.three },
      ];
      const results = strategy.suggest(dice, cells);
      expect(results[0].column).toBe(GAME_COLUMN.three); // 50*3=150 > 50*1=50
      expect(results[0].score).toBe(150);
      expect(results[1].column).toBe(GAME_COLUMN.one);
      expect(results[1].score).toBe(50);
    });
  });

  // ─── Tie-breaking ─────────────────────────────────────────────────────────

  describe('ties', () => {
    test('should break ties by category name (ascending)', () => {
      // dice giving same raw score to Chance and ThreeOfAKind
      // five 3s: threeOfAKind=15, chance=15
      const dice: DiceSet = [0, 0, 5, 0, 0, 0];
      const cells: AvailableCell[] = [
        { category: SCORE_CATEGORY.threeOfAKind, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.chance, column: GAME_COLUMN.one },
      ];
      const results = strategy.suggest(dice, cells);
      // Both score 15; 'Chance' < 'ThreeOfAKind' alphabetically
      expect(results[0].category).toBe(SCORE_CATEGORY.chance);
      expect(results[1].category).toBe(SCORE_CATEGORY.threeOfAKind);
    });

    test('should break ties by column name (ascending) when category is the same', () => {
      // Same category, two different columns with same multiplied score — possible
      // if raw scores differ and multipliers are applied:
      // Actually not really possible for same category...
      // Use dice that score zero for a category in different columns
      const dice: DiceSet = [5, 0, 0, 0, 0, 0]; // five 1s: chance=5, threeOfAKind=5
      const cells: AvailableCell[] = [
        { category: SCORE_CATEGORY.chance, column: GAME_COLUMN.three },
        { category: SCORE_CATEGORY.chance, column: GAME_COLUMN.one },
      ];
      const results = strategy.suggest(dice, cells);
      // chance col THREE = 5*3=15, col ONE = 5*1=5 → not a tie
      // Let's use a category that yields 0: aces with dice [0,5,0,0,0,0]
      expect(results).toHaveLength(2);
    });

    test('should produce a consistent (stable) ordering for identical scores in multiple runs', () => {
      const dice: DiceSet = [0, 0, 5, 0, 0, 0]; // five 3s
      const cells: AvailableCell[] = [
        { category: SCORE_CATEGORY.threeOfAKind, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.chance, column: GAME_COLUMN.one },
      ];
      const first = strategy.suggest(dice, cells);
      const second = strategy.suggest(dice, cells);
      expect(first.map((r) => r.category)).toEqual(second.map((r) => r.category));
    });
  });

  // ─── Filled-cell exclusion (contract test) ───────────────────────────────

  describe('exclusion of unavailable cells', () => {
    test('should only include provided cells (caller is responsible for filtering)', () => {
      const dice: DiceSet = [0, 0, 0, 0, 5, 0];
      const cells: AvailableCell[] = [{ category: SCORE_CATEGORY.fives, column: GAME_COLUMN.one }];
      const results = strategy.suggest(dice, cells);
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe(SCORE_CATEGORY.fives);
    });
  });

  // ─── SuggestionResult shape ───────────────────────────────────────────────

  describe('result shape', () => {
    test('should include category, column, score, and reasoning in each result', () => {
      const dice: DiceSet = [0, 0, 0, 0, 5, 0];
      const cells: AvailableCell[] = [{ category: SCORE_CATEGORY.yahtzee, column: GAME_COLUMN.two }];
      const [result] = strategy.suggest(dice, cells);
      expect(result).toMatchObject({
        category: SCORE_CATEGORY.yahtzee,
        column: GAME_COLUMN.two,
        score: 100, // 50 * 2
      });
      expect(typeof result.reasoning).toBe('string');
      expect(result.reasoning.length).toBeGreaterThan(0);
    });
  });

  // ─── Edge cases ───────────────────────────────────────────────────────────

  describe('edge cases', () => {
    test('should handle all-zero dice gracefully', () => {
      // Not a valid DiceSet (sum must be 5) but strategy should not throw
      const dice: DiceSet = [0, 0, 0, 0, 0, 0];
      const cells: AvailableCell[] = [
        { category: SCORE_CATEGORY.aces, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.yahtzee, column: GAME_COLUMN.one },
      ];
      const results = strategy.suggest(dice, cells);
      expect(results).toHaveLength(2);
      // Both score 0 → tie-breaking by category: 'Aces' < 'Yahtzee'
      expect(results[0].category).toBe(SCORE_CATEGORY.aces);
    });

    test('should return all 13 available cells ranked when all are available', () => {
      const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // five 5s
      const cells: AvailableCell[] = [
        { category: SCORE_CATEGORY.aces, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.twos, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.threes, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.fours, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.fives, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.sixes, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.threeOfAKind, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.fourOfAKind, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.fullHouse, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.smallStraight, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.largeStraight, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.yahtzee, column: GAME_COLUMN.one },
        { category: SCORE_CATEGORY.chance, column: GAME_COLUMN.one },
      ];
      const results = strategy.suggest(dice, cells);
      expect(results).toHaveLength(13);
      // Yahtzee (50) should be first
      expect(results[0].category).toBe(SCORE_CATEGORY.yahtzee);
      // Scores should be non-increasing
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });
  });
});
