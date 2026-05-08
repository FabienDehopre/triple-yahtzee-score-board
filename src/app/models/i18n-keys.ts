import type { GameColumn } from './game-column.model';
import type { ScoreCategory } from './score-category.model';

import { GAME_COLUMN } from './game-column.model';
import { SCORE_CATEGORY } from './score-category.model';

export const CATEGORY_LABEL_KEYS: Record<ScoreCategory, string> = {
  [SCORE_CATEGORY.aces]: 'scoreSheet.categories.aces',
  [SCORE_CATEGORY.twos]: 'scoreSheet.categories.twos',
  [SCORE_CATEGORY.threes]: 'scoreSheet.categories.threes',
  [SCORE_CATEGORY.fours]: 'scoreSheet.categories.fours',
  [SCORE_CATEGORY.fives]: 'scoreSheet.categories.fives',
  [SCORE_CATEGORY.sixes]: 'scoreSheet.categories.sixes',
  [SCORE_CATEGORY.threeOfAKind]: 'scoreSheet.categories.threeOfAKind',
  [SCORE_CATEGORY.fourOfAKind]: 'scoreSheet.categories.fourOfAKind',
  [SCORE_CATEGORY.fullHouse]: 'scoreSheet.categories.fullHouse',
  [SCORE_CATEGORY.smallStraight]: 'scoreSheet.categories.smallStraight',
  [SCORE_CATEGORY.largeStraight]: 'scoreSheet.categories.largeStraight',
  [SCORE_CATEGORY.yahtzee]: 'scoreSheet.categories.yahtzee',
  [SCORE_CATEGORY.chance]: 'scoreSheet.categories.chance',
};

export const CATEGORY_HINT_KEYS: Record<ScoreCategory, string> = {
  [SCORE_CATEGORY.aces]: 'scoreSheet.hints.aces',
  [SCORE_CATEGORY.twos]: 'scoreSheet.hints.twos',
  [SCORE_CATEGORY.threes]: 'scoreSheet.hints.threes',
  [SCORE_CATEGORY.fours]: 'scoreSheet.hints.fours',
  [SCORE_CATEGORY.fives]: 'scoreSheet.hints.fives',
  [SCORE_CATEGORY.sixes]: 'scoreSheet.hints.sixes',
  [SCORE_CATEGORY.threeOfAKind]: 'scoreSheet.hints.threeOfAKind',
  [SCORE_CATEGORY.fourOfAKind]: 'scoreSheet.hints.fourOfAKind',
  [SCORE_CATEGORY.fullHouse]: 'scoreSheet.hints.fullHouse',
  [SCORE_CATEGORY.smallStraight]: 'scoreSheet.hints.smallStraight',
  [SCORE_CATEGORY.largeStraight]: 'scoreSheet.hints.largeStraight',
  [SCORE_CATEGORY.yahtzee]: 'scoreSheet.hints.yahtzee',
  [SCORE_CATEGORY.chance]: 'scoreSheet.hints.chance',
};

export const SCORE_SHEET_COLUMN_KEYS: Record<GameColumn, string> = {
  [GAME_COLUMN.one]: 'scoreSheet.columns.one',
  [GAME_COLUMN.two]: 'scoreSheet.columns.two',
  [GAME_COLUMN.three]: 'scoreSheet.columns.three',
};

export const GAME_OVER_COLUMN_KEYS: Record<GameColumn, string> = {
  [GAME_COLUMN.one]: 'gameOver.columns.one',
  [GAME_COLUMN.two]: 'gameOver.columns.two',
  [GAME_COLUMN.three]: 'gameOver.columns.three',
};
