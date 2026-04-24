/**
 * All 13 scoring categories in a Yahtzee game.
 * Upper section: Aces through Sixes (sum of the matching face values).
 * Lower section: combination-based categories.
 */
export const SCORE_CATEGORY = {
  aces: 'Aces',
  twos: 'Twos',
  threes: 'Threes',
  fours: 'Fours',
  fives: 'Fives',
  sixes: 'Sixes',
  threeOfAKind: 'ThreeOfAKind',
  fourOfAKind: 'FourOfAKind',
  fullHouse: 'FullHouse',
  smallStraight: 'SmallStraight',
  largeStraight: 'LargeStraight',
  yahtzee: 'Yahtzee',
  chance: 'Chance',
} as const;

export type ScoreCategory = typeof SCORE_CATEGORY[keyof typeof SCORE_CATEGORY];
