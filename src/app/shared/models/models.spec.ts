import {
  COLUMN_MULTIPLIER,
  DiceSet,
  Game,
  GameColumn,
  LOWER_CATEGORIES,
  ScoreCategory,
  ScoreCell,
  SuggestionResult,
  UPPER_CATEGORIES,
} from './index';

describe('Models', () => {
  describe('DiceSet', () => {
    it('should be a tuple of 6 numbers summing to 5', () => {
      const dice: DiceSet = [1, 1, 1, 1, 1, 0];
      const sum = dice.reduce((acc, val) => acc + val, 0);
      expect(sum).toBe(5);
      expect(dice.length).toBe(6);
    });
  });

  describe('ScoreCategory', () => {
    it('should have 13 categories', () => {
      const categories = Object.values(ScoreCategory);
      expect(categories.length).toBe(13);
    });

    it('should include all upper section categories', () => {
      expect(UPPER_CATEGORIES).toContain(ScoreCategory.Aces);
      expect(UPPER_CATEGORIES).toContain(ScoreCategory.Sixes);
      expect(UPPER_CATEGORIES.length).toBe(6);
    });

    it('should include all lower section categories', () => {
      expect(LOWER_CATEGORIES).toContain(ScoreCategory.Yahtzee);
      expect(LOWER_CATEGORIES).toContain(ScoreCategory.Chance);
      expect(LOWER_CATEGORIES.length).toBe(7);
    });
  });

  describe('ScoreCell', () => {
    it('should allow a scored cell', () => {
      const cell: ScoreCell = { value: 30, isScratched: false };
      expect(cell.value).toBe(30);
      expect(cell.isScratched).toBe(false);
    });

    it('should allow a scratched cell with null value', () => {
      const cell: ScoreCell = { value: null, isScratched: true };
      expect(cell.value).toBeNull();
      expect(cell.isScratched).toBe(true);
    });

    it('should allow an empty cell', () => {
      const cell: ScoreCell = { value: null, isScratched: false };
      expect(cell.value).toBeNull();
      expect(cell.isScratched).toBe(false);
    });
  });

  describe('GameColumn multipliers', () => {
    it('should assign multiplier ×1 to column ONE', () => {
      expect(COLUMN_MULTIPLIER[GameColumn.ONE]).toBe(1);
    });

    it('should assign multiplier ×2 to column TWO', () => {
      expect(COLUMN_MULTIPLIER[GameColumn.TWO]).toBe(2);
    });

    it('should assign multiplier ×3 to column THREE', () => {
      expect(COLUMN_MULTIPLIER[GameColumn.THREE]).toBe(3);
    });
  });

  describe('Game', () => {
    it('should allow creating a game with three columns', () => {
      const game: Game = {
        id: 'test-game-1',
        createdAt: new Date().toISOString(),
        columns: {
          [GameColumn.ONE]: { upper: {}, lower: {} },
          [GameColumn.TWO]: { upper: {}, lower: {} },
          [GameColumn.THREE]: { upper: {}, lower: {} },
        },
      };
      expect(game.id).toBe('test-game-1');
      expect(Object.keys(game.columns).length).toBe(3);
    });
  });

  describe('SuggestionResult', () => {
    it('should allow creating a suggestion result', () => {
      const suggestion: SuggestionResult = {
        category: ScoreCategory.Yahtzee,
        column: GameColumn.THREE,
        score: 50,
        reasoning: 'Yahtzee scored in the highest multiplier column for maximum points.',
      };
      expect(suggestion.category).toBe(ScoreCategory.Yahtzee);
      expect(suggestion.column).toBe(GameColumn.THREE);
      expect(suggestion.score).toBe(50);
    });
  });
});
