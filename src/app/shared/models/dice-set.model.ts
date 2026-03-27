/**
 * Represents the counts of each die face in a Yahtzee roll.
 * The array has exactly 6 elements where index 0 = face 1, index 1 = face 2, ..., index 5 = face 6.
 * All counts must be non-negative integers and must sum to exactly 5 (five dice total).
 *
 * @example [2, 0, 1, 0, 2, 0] represents two 1s, one 3, and two 5s.
 */
export type DiceSet = [number, number, number, number, number, number];
