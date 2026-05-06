import type { DiceSet } from '../models/dice-set.model';

import { TestBed } from '@angular/core/testing';

import { SCORE_CATEGORY } from '../models/score-category.model';
import { GameStateService } from './game-state.service';
import { SuggestionEngineService } from './suggestion-engine.service';

describe('suggestionEngineService', () => {
  let service: SuggestionEngineService;
  let gameState: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuggestionEngineService);
    gameState = TestBed.inject(GameStateService);
  });

  // ─── Default (activeGameIndex = 0) ────────────────────────────────────────

  test('should compute suggestions from game 0 by default', () => {
    const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // five 5s → Yahtzee available
    gameState.setCurrentDice(dice);

    expect(service.suggestions().some((s) => s.category === SCORE_CATEGORY.yahtzee)).toBeTruthy();
  });

  test('should return an empty list when no dice are set', () => {
    expect(service.suggestions()).toHaveLength(0);
  });

  // ─── activeGameIndex scoping ───────────────────────────────────────────────

  test('should use game at activeGameIndex = 1 when set', () => {
    const yahtzeeDice: DiceSet = [0, 0, 0, 0, 5, 0];

    // Fill Yahtzee in all 3 columns of game 0 so it is no longer available for game 0
    gameState.setCurrentDice(yahtzeeDice);
    gameState.placeScore(SCORE_CATEGORY.yahtzee, 0);
    gameState.setCurrentDice(yahtzeeDice);
    gameState.placeScore(SCORE_CATEGORY.yahtzee, 0);
    gameState.setCurrentDice(yahtzeeDice);
    gameState.placeScore(SCORE_CATEGORY.yahtzee, 0);

    // Switch to game 1 (Yahtzee still available there)
    gameState.setActiveGameIndex(1);
    gameState.setCurrentDice(yahtzeeDice);

    expect(service.suggestions().some((s) => s.category === SCORE_CATEGORY.yahtzee)).toBeTruthy();
  });

  test('should recompute suggestions immediately when activeGameIndex changes', () => {
    const yahtzeeDice: DiceSet = [0, 0, 0, 0, 5, 0];

    // Fill Yahtzee in all 3 columns of game 0
    gameState.setCurrentDice(yahtzeeDice);
    gameState.placeScore(SCORE_CATEGORY.yahtzee, 0);
    gameState.setCurrentDice(yahtzeeDice);
    gameState.placeScore(SCORE_CATEGORY.yahtzee, 0);
    gameState.setCurrentDice(yahtzeeDice);
    gameState.placeScore(SCORE_CATEGORY.yahtzee, 0);

    gameState.setCurrentDice(yahtzeeDice);

    // activeGameIndex = 0: Yahtzee fully filled → not in suggestions
    expect(service.suggestions().some((s) => s.category === SCORE_CATEGORY.yahtzee)).toBeFalsy();

    // Switch to game 1: Yahtzee available → in suggestions
    gameState.setActiveGameIndex(1);
    expect(service.suggestions().some((s) => s.category === SCORE_CATEGORY.yahtzee)).toBeTruthy();
  });
});
