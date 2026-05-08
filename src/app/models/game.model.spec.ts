import type { Game } from './game.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from './game-column.model';
import { nextUnfilledColumn } from './game.model';
import { SCORE_CATEGORY } from './score-category.model';

function emptyGame(): Game {
  return {
    id: 'g1',
    createdAt: '',
    columns: {
      [GAME_COLUMN.one]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.two]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.three]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
    },
  };
}

describe('nextUnfilledColumn', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  test('should return ONE when no columns are filled (upper category)', () => {
    const game = emptyGame();
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.aces)).toBe(GAME_COLUMN.one);
  });

  test('should return ONE when no columns are filled (lower category)', () => {
    const game = emptyGame();
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.yahtzee)).toBe(GAME_COLUMN.one);
  });

  test('should return TWO when ONE is already filled', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces] = { value: 5, isScratched: false };
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.aces)).toBe(GAME_COLUMN.two);
  });

  test('should return THREE when ONE and TWO are already filled', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces] = { value: 5, isScratched: false };
    game.columns[GAME_COLUMN.two].upper[SCORE_CATEGORY.aces] = { value: 5, isScratched: false };
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.aces)).toBe(GAME_COLUMN.three);
  });

  test('should return undefined when all three columns are filled', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces] = { value: 5, isScratched: false };
    game.columns[GAME_COLUMN.two].upper[SCORE_CATEGORY.aces] = { value: 5, isScratched: false };
    game.columns[GAME_COLUMN.three].upper[SCORE_CATEGORY.aces] = { value: 5, isScratched: false };
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.aces)).toBeUndefined();
  });

  test('should resolve lower categories independently of upper', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.one].lower[SCORE_CATEGORY.yahtzee] = { value: 50, isScratched: false };
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.yahtzee)).toBe(GAME_COLUMN.two);
  });

  test('should not confuse upper and lower sections for the same column', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces] = { value: 5, isScratched: false };
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.yahtzee)).toBe(GAME_COLUMN.one);
  });

  test('should treat a scratched cell (value 0) as filled', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces] = { value: 0, isScratched: true };
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.aces)).toBe(GAME_COLUMN.two);
  });
});
