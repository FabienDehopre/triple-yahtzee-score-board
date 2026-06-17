import type { Game } from './game.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from './game-column.model';
import {
  gameCellEntries,
  gameColumnCellEntries,
  nextUnfilledColumn,
  readScoreCell,
  resolveScoreSection,
  writeColumnYahtzeeBonus,
  writeScoreCell
} from './game.model';
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
    const game = writeScoreCell(emptyGame(), GAME_COLUMN.one, SCORE_CATEGORY.aces, { value: 5, isScratched: false });
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.aces)).toBe(GAME_COLUMN.two);
  });

  test('should return THREE when ONE and TWO are already filled', () => {
    const game = writeScoreCell(
      writeScoreCell(emptyGame(), GAME_COLUMN.one, SCORE_CATEGORY.aces, { value: 5, isScratched: false }),
      GAME_COLUMN.two,
      SCORE_CATEGORY.aces,
      { value: 5, isScratched: false }
    );
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.aces)).toBe(GAME_COLUMN.three);
  });

  test('should return undefined when all three columns are filled', () => {
    const game = writeScoreCell(
      writeScoreCell(
        writeScoreCell(emptyGame(), GAME_COLUMN.one, SCORE_CATEGORY.aces, { value: 5, isScratched: false }),
        GAME_COLUMN.two,
        SCORE_CATEGORY.aces,
        { value: 5, isScratched: false }
      ),
      GAME_COLUMN.three,
      SCORE_CATEGORY.aces,
      { value: 5, isScratched: false }
    );
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.aces)).toBeUndefined();
  });

  test('should resolve lower categories independently of upper', () => {
    const game = writeScoreCell(emptyGame(), GAME_COLUMN.one, SCORE_CATEGORY.yahtzee, {
      value: 50,
      isScratched: false,
    });
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.yahtzee)).toBe(GAME_COLUMN.two);
  });

  test('should not confuse upper and lower sections for the same column', () => {
    const game = writeScoreCell(emptyGame(), GAME_COLUMN.one, SCORE_CATEGORY.aces, { value: 5, isScratched: false });
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.yahtzee)).toBe(GAME_COLUMN.one);
  });

  test('should treat a scratched cell (value 0) as filled', () => {
    const game = writeScoreCell(emptyGame(), GAME_COLUMN.one, SCORE_CATEGORY.aces, { value: 0, isScratched: true });
    expect(nextUnfilledColumn(game, SCORE_CATEGORY.aces)).toBe(GAME_COLUMN.two);
  });
});

describe('game cell access', () => {
  test('resolves category sections from one public function', () => {
    expect(resolveScoreSection(SCORE_CATEGORY.aces)).toBe('upper');
    expect(resolveScoreSection(SCORE_CATEGORY.yahtzee)).toBe('lower');
  });

  test('reads cells without exposing the section storage shape', () => {
    const cell = { value: 50, isScratched: false };
    const game = writeScoreCell(emptyGame(), GAME_COLUMN.one, SCORE_CATEGORY.yahtzee, cell);

    expect(readScoreCell(game, GAME_COLUMN.one, SCORE_CATEGORY.yahtzee)).toEqual(cell);
    expect(readScoreCell(game, GAME_COLUMN.two, SCORE_CATEGORY.yahtzee)).toBeUndefined();
  });

  test('writes one cell immutably and structurally shares unrelated columns', () => {
    const game = emptyGame();
    const nextGame = writeScoreCell(game, GAME_COLUMN.two, SCORE_CATEGORY.fives, {
      value: 15,
      isScratched: false,
    });

    expect(nextGame).not.toBe(game);
    expect(nextGame.columns[GAME_COLUMN.one]).toBe(game.columns[GAME_COLUMN.one]);
    expect(nextGame.columns[GAME_COLUMN.three]).toBe(game.columns[GAME_COLUMN.three]);
    expect(readScoreCell(nextGame, GAME_COLUMN.two, SCORE_CATEGORY.fives)).toEqual({
      value: 15,
      isScratched: false,
    });
    expect(readScoreCell(game, GAME_COLUMN.two, SCORE_CATEGORY.fives)).toBeUndefined();
  });

  test('iterates every game cell in column and category order', () => {
    const game = writeScoreCell(emptyGame(), GAME_COLUMN.one, SCORE_CATEGORY.aces, {
      value: 3,
      isScratched: false,
    });

    const entries = [...gameCellEntries(game)];

    expect(entries).toHaveLength(39);
    expect(entries[0]).toEqual({
      column: GAME_COLUMN.one,
      section: 'upper',
      category: SCORE_CATEGORY.aces,
      cell: { value: 3, isScratched: false },
    });
    expect(entries.at(-1)).toEqual({
      column: GAME_COLUMN.three,
      section: 'lower',
      category: SCORE_CATEGORY.chance,
      cell: undefined,
    });
  });

  test('iterates one column without exposing section storage', () => {
    const entries = [...gameColumnCellEntries(emptyGame(), GAME_COLUMN.two)];

    expect(entries).toHaveLength(13);
    expect(entries[0]?.column).toBe(GAME_COLUMN.two);
    expect(entries.at(-1)?.category).toBe(SCORE_CATEGORY.chance);
  });

  test('writes a column Yahtzee bonus without changing cells', () => {
    const game = writeScoreCell(emptyGame(), GAME_COLUMN.one, SCORE_CATEGORY.yahtzee, {
      value: 50,
      isScratched: false,
    });
    const nextGame = writeColumnYahtzeeBonus(game, GAME_COLUMN.one, 100);

    expect(nextGame.columns[GAME_COLUMN.one].yahtzeeBonus).toBe(100);
    expect(readScoreCell(nextGame, GAME_COLUMN.one, SCORE_CATEGORY.yahtzee)).toEqual({
      value: 50,
      isScratched: false,
    });
    expect(game.columns[GAME_COLUMN.one].yahtzeeBonus).toBe(0);
  });
});
