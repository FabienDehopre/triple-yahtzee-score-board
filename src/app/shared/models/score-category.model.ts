/**
 * All 13 scoring categories in a Yahtzee game.
 * Upper section: Aces through Sixes (sum of the matching face values).
 * Lower section: combination-based categories.
 */
export enum ScoreCategory {
  Aces = 'Aces',
  Twos = 'Twos',
  Threes = 'Threes',
  Fours = 'Fours',
  Fives = 'Fives',
  Sixes = 'Sixes',
  ThreeOfAKind = 'ThreeOfAKind',
  FourOfAKind = 'FourOfAKind',
  FullHouse = 'FullHouse',
  SmallStraight = 'SmallStraight',
  LargeStraight = 'LargeStraight',
  Yahtzee = 'Yahtzee',
  Chance = 'Chance',
}
