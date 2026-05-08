import type { DiceSet } from '../models/dice-set.model';

import { TestBed } from '@angular/core/testing';

import { SCORE_CATEGORY } from '../models/score-category.model';
import { GameStateService } from './game-state.service';
import { PlacementService } from './placement.service';
import { SuggestionEngineService } from './suggestion-engine.service';

describe('suggestionEngineService', () => {
  let service: SuggestionEngineService;
  let gameState: GameStateService;
  let placement: PlacementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuggestionEngineService);
    gameState = TestBed.inject(GameStateService);
    placement = TestBed.inject(PlacementService);
  });

  // ─── Default (activeGameIndex = 0) ────────────────────────────────────────

  test('should compute suggestions from game 0 by default', () => {
    const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // five 5s → Yahtzee available
    placement.setCurrentDice(dice);

    expect(service.suggestions().some((s) => s.category === SCORE_CATEGORY.yahtzee)).toBeTruthy();
  });

  test('should return an empty list when no dice are set', () => {
    expect(service.suggestions()).toHaveLength(0);
  });

  // ─── activeGameIndex scoping ───────────────────────────────────────────────

  test('should use game at activeGameIndex = 1 when set', () => {
    const yahtzeeDice: DiceSet = [0, 0, 0, 0, 5, 0];

    // Fill Yahtzee in all 3 columns of game 0 so it is no longer available for game 0
    placement.setCurrentDice(yahtzeeDice);
    placement.placeScore(SCORE_CATEGORY.yahtzee, 0);
    placement.setCurrentDice(yahtzeeDice);
    placement.placeScore(SCORE_CATEGORY.yahtzee, 0);
    placement.setCurrentDice(yahtzeeDice);
    placement.placeScore(SCORE_CATEGORY.yahtzee, 0);

    // Switch to game 1 (Yahtzee still available there)
    gameState.setActiveGameIndex(1);
    placement.setCurrentDice(yahtzeeDice);

    expect(service.suggestions().some((s) => s.category === SCORE_CATEGORY.yahtzee)).toBeTruthy();
  });

  test('should recompute suggestions immediately when activeGameIndex changes', () => {
    const yahtzeeDice: DiceSet = [0, 0, 0, 0, 5, 0];

    // Fill Yahtzee in all 3 columns of game 0
    placement.setCurrentDice(yahtzeeDice);
    placement.placeScore(SCORE_CATEGORY.yahtzee, 0);
    placement.setCurrentDice(yahtzeeDice);
    placement.placeScore(SCORE_CATEGORY.yahtzee, 0);
    placement.setCurrentDice(yahtzeeDice);
    placement.placeScore(SCORE_CATEGORY.yahtzee, 0);

    placement.setCurrentDice(yahtzeeDice);

    // activeGameIndex = 0: Yahtzee fully filled → not in suggestions
    expect(service.suggestions().some((s) => s.category === SCORE_CATEGORY.yahtzee)).toBeFalsy();

    // Switch to game 1: Yahtzee available → in suggestions
    gameState.setActiveGameIndex(1);
    expect(service.suggestions().some((s) => s.category === SCORE_CATEGORY.yahtzee)).toBeTruthy();
  });

  // ─── Ranking ──────────────────────────────────────────────────────────────

  test('should return suggestions sorted by descending multiplied score', () => {
    // five 5s: yahtzee=50, fives=25, chance=25 — yahtzee must be first
    const dice: DiceSet = [0, 0, 0, 0, 5, 0];
    placement.setCurrentDice(dice);

    const results = service.suggestions();
    expect(results[0].category).toBe(SCORE_CATEGORY.yahtzee);
    expect(results[0].score).toBe(50); // 50 × 1 (column ONE is first unfilled)
    // Scores must be non-increasing
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  test('should apply the column multiplier in the ranked score', () => {
    // Fill column ONE for yahtzee, so column TWO becomes the next unfilled
    const yahtzeeDice: DiceSet = [0, 0, 0, 0, 5, 0];
    placement.setCurrentDice(yahtzeeDice);
    placement.placeScore(SCORE_CATEGORY.yahtzee, 0);

    placement.setCurrentDice(yahtzeeDice);
    const yahtzeeResult = service.suggestions().find((s) => s.category === SCORE_CATEGORY.yahtzee);
    expect(yahtzeeResult?.score).toBe(100); // 50 × 2 (column TWO)
  });

  // ─── Tie-breaking ─────────────────────────────────────────────────────────

  test('should break ties by category name ascending', () => {
    // five 3s: threeOfAKind=15 and chance=15 both in column ONE
    // 'Chance' < 'ThreeOfAKind' → chance must appear first
    const dice: DiceSet = [0, 0, 5, 0, 0, 0];
    placement.setCurrentDice(dice);

    const results = service.suggestions();
    const chanceIndex = results.findIndex((r) => r.category === SCORE_CATEGORY.chance);
    const threeIndex = results.findIndex((r) => r.category === SCORE_CATEGORY.threeOfAKind);
    expect(chanceIndex).toBeLessThan(threeIndex);
  });

  test('should produce a consistent ordering across multiple calls', () => {
    const dice: DiceSet = [0, 0, 5, 0, 0, 0]; // five 3s — many ties
    placement.setCurrentDice(dice);

    const first = service.suggestions().map((r) => r.category);
    const second = service.suggestions().map((r) => r.category);
    expect(first).toEqual(second);
  });
});
