import type { DiceSet } from '../models/dice-set.model';
import type { Game } from '../models/game.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { SuggestionEngineService } from './suggestion-engine.service';

function makeEmptyGame(): Game {
  return {
    id: 'test-id',
    columns: {
      [GAME_COLUMN.one]: { upper: {}, lower: {} },
      [GAME_COLUMN.two]: { upper: {}, lower: {} },
      [GAME_COLUMN.three]: { upper: {}, lower: {} },
    },
    createdAt: new Date().toISOString(),
  };
}

describe('suggestionEngineService', () => {
  let service: SuggestionEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuggestionEngineService);
  });

  test('should return empty list when no available cells', () => {
    const dice: DiceSet = [0, 0, 0, 0, 5, 0];
    const fullGame: Game = {
      id: 'full',
      columns: {
        [GAME_COLUMN.one]: {
          upper: {
            [SCORE_CATEGORY.aces]: { value: 5, isScratched: false },
            [SCORE_CATEGORY.twos]: { value: 10, isScratched: false },
            [SCORE_CATEGORY.threes]: { value: 15, isScratched: false },
            [SCORE_CATEGORY.fours]: { value: 20, isScratched: false },
            [SCORE_CATEGORY.fives]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.sixes]: { value: 30, isScratched: false },
          },
          lower: {
            [SCORE_CATEGORY.threeOfAKind]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.fourOfAKind]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.fullHouse]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.smallStraight]: { value: 30, isScratched: false },
            [SCORE_CATEGORY.largeStraight]: { value: 40, isScratched: false },
            [SCORE_CATEGORY.yahtzee]: { value: 50, isScratched: false },
            [SCORE_CATEGORY.chance]: { value: 25, isScratched: false },
          },
        },
        [GAME_COLUMN.two]: {
          upper: {
            [SCORE_CATEGORY.aces]: { value: 5, isScratched: false },
            [SCORE_CATEGORY.twos]: { value: 10, isScratched: false },
            [SCORE_CATEGORY.threes]: { value: 15, isScratched: false },
            [SCORE_CATEGORY.fours]: { value: 20, isScratched: false },
            [SCORE_CATEGORY.fives]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.sixes]: { value: 30, isScratched: false },
          },
          lower: {
            [SCORE_CATEGORY.threeOfAKind]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.fourOfAKind]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.fullHouse]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.smallStraight]: { value: 30, isScratched: false },
            [SCORE_CATEGORY.largeStraight]: { value: 40, isScratched: false },
            [SCORE_CATEGORY.yahtzee]: { value: 50, isScratched: false },
            [SCORE_CATEGORY.chance]: { value: 25, isScratched: false },
          },
        },
        [GAME_COLUMN.three]: {
          upper: {
            [SCORE_CATEGORY.aces]: { value: 5, isScratched: false },
            [SCORE_CATEGORY.twos]: { value: 10, isScratched: false },
            [SCORE_CATEGORY.threes]: { value: 15, isScratched: false },
            [SCORE_CATEGORY.fours]: { value: 20, isScratched: false },
            [SCORE_CATEGORY.fives]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.sixes]: { value: 30, isScratched: false },
          },
          lower: {
            [SCORE_CATEGORY.threeOfAKind]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.fourOfAKind]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.fullHouse]: { value: 25, isScratched: false },
            [SCORE_CATEGORY.smallStraight]: { value: 30, isScratched: false },
            [SCORE_CATEGORY.largeStraight]: { value: 40, isScratched: false },
            [SCORE_CATEGORY.yahtzee]: { value: 50, isScratched: false },
            [SCORE_CATEGORY.chance]: { value: 25, isScratched: false },
          },
        },
      },
      createdAt: new Date().toISOString(),
    };

    expect(service.computeSuggestions(dice, fullGame)).toHaveLength(0);
  });

  test('should return yahtzee as top suggestion for five-5s roll', () => {
    const dice: DiceSet = [0, 0, 0, 0, 5, 0];
    const game = makeEmptyGame();

    const results = service.computeSuggestions(dice, game);
    expect(results[0].category).toBe(SCORE_CATEGORY.yahtzee);
    expect(results[0].score).toBe(50);
  });

  test('should sort by descending multiplied score', () => {
    const dice: DiceSet = [0, 0, 0, 0, 5, 0];
    const game = makeEmptyGame();

    const results = service.computeSuggestions(dice, game);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  test('should break ties by category name ascending', () => {
    const dice: DiceSet = [0, 0, 5, 0, 0, 0]; // five 3s: threeOfAKind=15, chance=15
    const game = makeEmptyGame();

    const results = service.computeSuggestions(dice, game);
    const chanceIndex = results.findIndex((r) => r.category === SCORE_CATEGORY.chance);
    const threeIndex = results.findIndex((r) => r.category === SCORE_CATEGORY.threeOfAKind);
    expect(chanceIndex).toBeLessThan(threeIndex);
  });

  test('should produce consistent ordering across multiple calls', () => {
    const dice: DiceSet = [0, 0, 5, 0, 0, 0];
    const game = makeEmptyGame();

    const first = service.computeSuggestions(dice, game).map((r) => r.category);
    const second = service.computeSuggestions(dice, game).map((r) => r.category);
    expect(first).toEqual(second);
  });

  test('should apply column multiplier: yahtzee in column TWO scores 100', () => {
    const dice: DiceSet = [0, 0, 0, 0, 5, 0];
    const gameWithOneFilledYahtzee: Game = {
      ...makeEmptyGame(),
      columns: {
        ...makeEmptyGame().columns,
        [GAME_COLUMN.one]: {
          ...makeEmptyGame().columns[GAME_COLUMN.one],
          lower: {
            [SCORE_CATEGORY.yahtzee]: { value: 50, isScratched: false },
          },
        },
      },
    };

    const results = service.computeSuggestions(dice, gameWithOneFilledYahtzee);
    const yahtzeeResult = results.find((r) => r.category === SCORE_CATEGORY.yahtzee);
    expect(yahtzeeResult?.score).toBe(100); // 50 × 2 (column TWO)
  });
});
