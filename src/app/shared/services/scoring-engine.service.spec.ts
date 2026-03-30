import type { DiceSet } from '../models/dice-set.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { ScoringEngineService } from './scoring-engine.service';

describe('scoringEngineService', () => {
  let service: ScoringEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoringEngineService);
  });

  // ─── Upper Section ─────────────────────────────────────────────────────────

  describe('aces', () => {
    test('should return sum of 1s', () => {
      // [2, 1, 0, 1, 1, 0] => two 1s, one 2, one 4, one 5
      const dice: DiceSet = [2, 1, 0, 1, 1, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.aces)).toBe(2);
    });

    test('should return 5 when all dice show 1', () => {
      const dice: DiceSet = [5, 0, 0, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.aces)).toBe(5);
    });

    test('should return 0 when no dice show 1', () => {
      const dice: DiceSet = [0, 3, 0, 2, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.aces)).toBe(0);
    });
  });

  describe('twos', () => {
    test('should return sum of 2s', () => {
      const dice: DiceSet = [1, 3, 0, 0, 1, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.twos)).toBe(6);
    });

    test('should return 10 when all dice show 2', () => {
      const dice: DiceSet = [0, 5, 0, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.twos)).toBe(10);
    });

    test('should return 0 when no dice show 2', () => {
      const dice: DiceSet = [3, 0, 0, 0, 2, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.twos)).toBe(0);
    });
  });

  describe('threes', () => {
    test('should return sum of 3s', () => {
      const dice: DiceSet = [0, 0, 2, 2, 1, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.threes)).toBe(6);
    });

    test('should return 15 when all dice show 3', () => {
      const dice: DiceSet = [0, 0, 5, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.threes)).toBe(15);
    });

    test('should return 0 when no dice show 3', () => {
      const dice: DiceSet = [2, 2, 0, 1, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.threes)).toBe(0);
    });
  });

  describe('fours', () => {
    test('should return sum of 4s', () => {
      const dice: DiceSet = [0, 1, 0, 3, 1, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fours)).toBe(12);
    });

    test('should return 20 when all dice show 4', () => {
      const dice: DiceSet = [0, 0, 0, 5, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fours)).toBe(20);
    });

    test('should return 0 when no dice show 4', () => {
      const dice: DiceSet = [1, 1, 1, 0, 1, 1];
      expect(service.computeScore(dice, SCORE_CATEGORY.fours)).toBe(0);
    });
  });

  describe('fives', () => {
    test('should return sum of 5s', () => {
      const dice: DiceSet = [0, 0, 1, 0, 4, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fives)).toBe(20);
    });

    test('should return 25 when all dice show 5', () => {
      const dice: DiceSet = [0, 0, 0, 0, 5, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fives)).toBe(25);
    });

    test('should return 0 when no dice show 5', () => {
      const dice: DiceSet = [2, 0, 1, 2, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fives)).toBe(0);
    });
  });

  describe('sixes', () => {
    test('should return sum of 6s', () => {
      const dice: DiceSet = [1, 0, 0, 0, 2, 2];
      expect(service.computeScore(dice, SCORE_CATEGORY.sixes)).toBe(12);
    });

    test('should return 30 when all dice show 6', () => {
      const dice: DiceSet = [0, 0, 0, 0, 0, 5];
      expect(service.computeScore(dice, SCORE_CATEGORY.sixes)).toBe(30);
    });

    test('should return 0 when no dice show 6', () => {
      const dice: DiceSet = [1, 1, 1, 1, 1, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.sixes)).toBe(0);
    });
  });

  // ─── Lower Section ─────────────────────────────────────────────────────────

  describe('three of a Kind', () => {
    test('should return sum of all dice when three of a kind exists', () => {
      // three 3s, one 2, one 4 => sum = 3+3+3+2+4 = 15
      const dice: DiceSet = [0, 1, 3, 1, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.threeOfAKind)).toBe(15);
    });

    test('should return sum of all dice when four of a kind exists', () => {
      // four 5s, one 2 => sum = 5+5+5+5+2 = 22
      const dice: DiceSet = [0, 1, 0, 0, 4, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.threeOfAKind)).toBe(22);
    });

    test('should return sum of all dice when Yahtzee exists', () => {
      // five 6s => sum = 30
      const dice: DiceSet = [0, 0, 0, 0, 0, 5];
      expect(service.computeScore(dice, SCORE_CATEGORY.threeOfAKind)).toBe(30);
    });

    test('should return 0 when no three of a kind', () => {
      // two 1s, two 2s, one 3 => no three of a kind
      const dice: DiceSet = [2, 2, 1, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.threeOfAKind)).toBe(0);
    });
  });

  describe('four of a Kind', () => {
    test('should return sum of all dice when four of a kind exists', () => {
      // four 2s, one 6 => sum = 2+2+2+2+6 = 14
      const dice: DiceSet = [0, 4, 0, 0, 0, 1];
      expect(service.computeScore(dice, SCORE_CATEGORY.fourOfAKind)).toBe(14);
    });

    test('should return sum of all dice when Yahtzee exists', () => {
      // five 4s => sum = 20
      const dice: DiceSet = [0, 0, 0, 5, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fourOfAKind)).toBe(20);
    });

    test('should return 0 when only three of a kind', () => {
      const dice: DiceSet = [0, 1, 3, 1, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fourOfAKind)).toBe(0);
    });

    test('should return 0 when no four of a kind', () => {
      const dice: DiceSet = [2, 2, 1, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fourOfAKind)).toBe(0);
    });
  });

  describe('full House', () => {
    test('should return 25 for a valid full house (3+2)', () => {
      // three 1s and two 4s
      const dice: DiceSet = [3, 0, 0, 2, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fullHouse)).toBe(25);
    });

    test('should return 25 for a valid full house (2+3)', () => {
      // two 3s and three 6s
      const dice: DiceSet = [0, 0, 2, 0, 0, 3];
      expect(service.computeScore(dice, SCORE_CATEGORY.fullHouse)).toBe(25);
    });

    test('should return 0 for five of a kind (Yahtzee is NOT a Full House)', () => {
      const dice: DiceSet = [5, 0, 0, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fullHouse)).toBe(0);
    });

    test('should return 0 when no full house', () => {
      // two 1s, two 2s, one 3 => not a full house
      const dice: DiceSet = [2, 2, 1, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fullHouse)).toBe(0);
    });

    test('should return 0 for four of a kind with one extra', () => {
      const dice: DiceSet = [4, 1, 0, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.fullHouse)).toBe(0);
    });
  });

  describe('small Straight', () => {
    test('should return 30 for sequence 1-2-3-4', () => {
      // 1-2-3-4 with an extra die
      const dice: DiceSet = [1, 1, 1, 1, 1, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.smallStraight)).toBe(30);
    });

    test('should return 30 for sequence 2-3-4-5', () => {
      const dice: DiceSet = [0, 1, 1, 1, 1, 1];
      expect(service.computeScore(dice, SCORE_CATEGORY.smallStraight)).toBe(30);
    });

    test('should return 30 for sequence 3-4-5-6', () => {
      const dice: DiceSet = [1, 0, 1, 1, 1, 1];
      expect(service.computeScore(dice, SCORE_CATEGORY.smallStraight)).toBe(30);
    });

    test('should return 30 for 1-2-3-4 with duplicate die', () => {
      // 1-1-2-3-4
      const dice: DiceSet = [2, 1, 1, 1, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.smallStraight)).toBe(30);
    });

    test('should return 0 when no small straight', () => {
      const dice: DiceSet = [2, 2, 1, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.smallStraight)).toBe(0);
    });

    test('should return 0 for only 3 consecutive dice', () => {
      const dice: DiceSet = [0, 1, 1, 1, 0, 2];
      expect(service.computeScore(dice, SCORE_CATEGORY.smallStraight)).toBe(0);
    });
  });

  describe('large Straight', () => {
    test('should return 40 for sequence 1-2-3-4-5', () => {
      const dice: DiceSet = [1, 1, 1, 1, 1, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.largeStraight)).toBe(40);
    });

    test('should return 40 for sequence 2-3-4-5-6', () => {
      const dice: DiceSet = [0, 1, 1, 1, 1, 1];
      expect(service.computeScore(dice, SCORE_CATEGORY.largeStraight)).toBe(40);
    });

    test('should return 0 for only a small straight (4 consecutive)', () => {
      // 1-2-3-4 with a duplicate
      const dice: DiceSet = [2, 1, 1, 1, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.largeStraight)).toBe(0);
    });

    test('should return 0 when no large straight', () => {
      const dice: DiceSet = [1, 0, 1, 1, 1, 1];
      expect(service.computeScore(dice, SCORE_CATEGORY.largeStraight)).toBe(0);
    });
  });

  describe('yahtzee', () => {
    test('should return 50 when all five dice show the same face', () => {
      const dice: DiceSet = [0, 0, 0, 0, 5, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.yahtzee)).toBe(50);
    });

    test('should return 50 for five 1s', () => {
      const dice: DiceSet = [5, 0, 0, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.yahtzee)).toBe(50);
    });

    test('should return 50 for five 6s', () => {
      const dice: DiceSet = [0, 0, 0, 0, 0, 5];
      expect(service.computeScore(dice, SCORE_CATEGORY.yahtzee)).toBe(50);
    });

    test('should return 0 when not five of a kind', () => {
      const dice: DiceSet = [0, 1, 3, 1, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.yahtzee)).toBe(0);
    });

    test('should return 0 for four of a kind', () => {
      const dice: DiceSet = [0, 4, 0, 0, 1, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.yahtzee)).toBe(0);
    });
  });

  describe('chance', () => {
    test('should return the sum of all dice', () => {
      // 1+1+3+4+5 = 14
      const dice: DiceSet = [2, 0, 1, 1, 1, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.chance)).toBe(14);
    });

    test('should return 5 for five 1s', () => {
      const dice: DiceSet = [5, 0, 0, 0, 0, 0];
      expect(service.computeScore(dice, SCORE_CATEGORY.chance)).toBe(5);
    });

    test('should return 30 for five 6s', () => {
      const dice: DiceSet = [0, 0, 0, 0, 0, 5];
      expect(service.computeScore(dice, SCORE_CATEGORY.chance)).toBe(30);
    });
  });

  // ─── Upper Bonus ───────────────────────────────────────────────────────────

  describe('computeUpperBonus', () => {
    test('should return 35 when upper total equals exactly 63', () => {
      expect(service.computeUpperBonus(63)).toBe(35);
    });

    test('should return 35 when upper total is above 63', () => {
      expect(service.computeUpperBonus(70)).toBe(35);
    });

    test('should return 35 for maximum upper total', () => {
      // Max: 5+10+15+20+25+30 = 105
      expect(service.computeUpperBonus(105)).toBe(35);
    });

    test('should return 0 when upper total is below 63', () => {
      expect(service.computeUpperBonus(62)).toBe(0);
    });

    test('should return 0 when upper total is 0', () => {
      expect(service.computeUpperBonus(0)).toBe(0);
    });
  });

  // ─── Yahtzee Bonus ─────────────────────────────────────────────────────────

  describe('computeYahtzeeBonus', () => {
    test('should return 100 when rolling another Yahtzee after scoring Yahtzee non-zero', () => {
      const dice: DiceSet = [0, 0, 0, 0, 5, 0];
      expect(service.computeYahtzeeBonus(dice, 50)).toBe(100);
    });

    test('should return 0 when rolling a Yahtzee but Yahtzee row is null (not yet scored)', () => {
      const dice: DiceSet = [0, 0, 5, 0, 0, 0];
      expect(service.computeYahtzeeBonus(dice, null)).toBe(0);
    });

    test('should return 0 when rolling a Yahtzee but Yahtzee was scratched (score 0)', () => {
      const dice: DiceSet = [0, 0, 5, 0, 0, 0];
      expect(service.computeYahtzeeBonus(dice, 0)).toBe(0);
    });

    test('should return 0 when not a Yahtzee roll', () => {
      const dice: DiceSet = [0, 1, 3, 1, 0, 0];
      expect(service.computeYahtzeeBonus(dice, 50)).toBe(0);
    });

    test('should accumulate 100 per extra Yahtzee roll', () => {
      const dice: DiceSet = [5, 0, 0, 0, 0, 0];
      // Each call returns 100; caller is responsible for summing
      expect(service.computeYahtzeeBonus(dice, 50)).toBe(100);
    });
  });

  // ─── Column Multipliers ────────────────────────────────────────────────────

  describe('applyMultiplier', () => {
    test('should return the score unchanged for column ONE (×1)', () => {
      expect(service.applyMultiplier(25, GAME_COLUMN.one)).toBe(25);
    });

    test('should return double the score for column TWO (×2)', () => {
      expect(service.applyMultiplier(25, GAME_COLUMN.two)).toBe(50);
    });

    test('should return triple the score for column THREE (×3)', () => {
      expect(service.applyMultiplier(25, GAME_COLUMN.three)).toBe(75);
    });

    test('should return 0 when score is 0', () => {
      expect(service.applyMultiplier(0, GAME_COLUMN.three)).toBe(0);
    });

    test('should apply multiplier to upper bonus', () => {
      expect(service.applyMultiplier(35, GAME_COLUMN.two)).toBe(70);
    });
  });
});
