import type { Game } from './game.model';

import { addYahtzeeBonus, eachCell, readCell, sectionOf, writeCell } from './game-cells';
import { GAME_COLUMN } from './game-column.model';
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

describe('sectionOf', () => {
  test('should resolve upper categories to the upper section', () => {
    expect(sectionOf(SCORE_CATEGORY.aces)).toBe('upper');
    expect(sectionOf(SCORE_CATEGORY.sixes)).toBe('upper');
  });

  test('should resolve lower categories to the lower section', () => {
    expect(sectionOf(SCORE_CATEGORY.yahtzee)).toBe('lower');
    expect(sectionOf(SCORE_CATEGORY.chance)).toBe('lower');
    expect(sectionOf(SCORE_CATEGORY.threeOfAKind)).toBe('lower');
  });
});

describe('readCell', () => {
  test('should return undefined for an empty cell', () => {
    expect(readCell(emptyGame(), GAME_COLUMN.one, SCORE_CATEGORY.aces)).toBeUndefined();
  });

  test('should read an upper-section cell without the caller naming the section', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces] = { value: 5, isScratched: false };
    expect(readCell(game, GAME_COLUMN.one, SCORE_CATEGORY.aces)).toEqual({ value: 5, isScratched: false });
  });

  test('should read a lower-section cell without the caller naming the section', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.two].lower[SCORE_CATEGORY.yahtzee] = { value: 50, isScratched: false };
    expect(readCell(game, GAME_COLUMN.two, SCORE_CATEGORY.yahtzee)).toEqual({ value: 50, isScratched: false });
  });
});

describe('writeCell', () => {
  test('should return a new Game with the one cell set', () => {
    const game = emptyGame();
    const next = writeCell(game, GAME_COLUMN.one, SCORE_CATEGORY.aces, { value: 3, isScratched: false });
    expect(readCell(next, GAME_COLUMN.one, SCORE_CATEGORY.aces)).toEqual({ value: 3, isScratched: false });
  });

  test('should not mutate the original Game', () => {
    const game = emptyGame();
    writeCell(game, GAME_COLUMN.one, SCORE_CATEGORY.aces, { value: 3, isScratched: false });
    expect(readCell(game, GAME_COLUMN.one, SCORE_CATEGORY.aces)).toBeUndefined();
  });

  test('should route a lower category into the lower section', () => {
    const game = emptyGame();
    const next = writeCell(game, GAME_COLUMN.one, SCORE_CATEGORY.yahtzee, { value: 50, isScratched: false });
    expect(next.columns[GAME_COLUMN.one].lower[SCORE_CATEGORY.yahtzee]).toEqual({ value: 50, isScratched: false });
    expect(next.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.yahtzee]).toBeUndefined();
  });

  test('should structurally share untouched columns', () => {
    const game = emptyGame();
    const next = writeCell(game, GAME_COLUMN.one, SCORE_CATEGORY.aces, { value: 3, isScratched: false });
    expect(next.columns[GAME_COLUMN.two]).toBe(game.columns[GAME_COLUMN.two]);
    expect(next.columns[GAME_COLUMN.three]).toBe(game.columns[GAME_COLUMN.three]);
  });

  test('should preserve the accumulated yahtzee bonus of the written column', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.one].yahtzeeBonus = 100;
    const next = writeCell(game, GAME_COLUMN.one, SCORE_CATEGORY.aces, { value: 3, isScratched: false });
    expect(next.columns[GAME_COLUMN.one].yahtzeeBonus).toBe(100);
  });
});

describe('addYahtzeeBonus', () => {
  test('should add the bonus to the column, returning a new Game', () => {
    const game = emptyGame();
    const next = addYahtzeeBonus(game, GAME_COLUMN.one, 100);
    expect(next.columns[GAME_COLUMN.one].yahtzeeBonus).toBe(100);
    expect(game.columns[GAME_COLUMN.one].yahtzeeBonus).toBe(0);
  });

  test('should accumulate on top of an existing bonus', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.one].yahtzeeBonus = 100;
    const next = addYahtzeeBonus(game, GAME_COLUMN.one, 100);
    expect(next.columns[GAME_COLUMN.one].yahtzeeBonus).toBe(200);
  });

  test('should treat a missing bonus as zero', () => {
    const game = emptyGame();
    delete game.columns[GAME_COLUMN.one].yahtzeeBonus;
    const next = addYahtzeeBonus(game, GAME_COLUMN.one, 100);
    expect(next.columns[GAME_COLUMN.one].yahtzeeBonus).toBe(100);
  });
});

describe('eachCell', () => {
  test('should visit all 13 cells of every column (39 cells total)', () => {
    const entries = [...eachCell(emptyGame())];
    expect(entries).toHaveLength(39);
  });

  test('should report the resolved section for each cell', () => {
    const entries = [...eachCell(emptyGame())];
    const aces = entries.find((e) => e.column === GAME_COLUMN.one && e.category === SCORE_CATEGORY.aces);
    const yahtzee = entries.find((e) => e.column === GAME_COLUMN.one && e.category === SCORE_CATEGORY.yahtzee);
    expect(aces?.section).toBe('upper');
    expect(yahtzee?.section).toBe('lower');
  });

  test('should surface the cell value when filled and undefined when empty', () => {
    const game = emptyGame();
    game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces] = { value: 5, isScratched: false };
    const entries = [...eachCell(game)];
    const filled = entries.find((e) => e.column === GAME_COLUMN.one && e.category === SCORE_CATEGORY.aces);
    const empty = entries.find((e) => e.column === GAME_COLUMN.one && e.category === SCORE_CATEGORY.twos);
    expect(filled?.cell).toEqual({ value: 5, isScratched: false });
    expect(empty?.cell).toBeUndefined();
  });
});
