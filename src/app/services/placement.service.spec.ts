import type { DiceSet } from '../models/dice-set.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { GameStateService } from './game-state.service';
import { PlacementService } from './placement.service';
import { UndoService } from './undo.service';

describe('placementService', () => {
  let service: PlacementService;
  let gameState: GameStateService;
  let undoService: UndoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlacementService);
    gameState = TestBed.inject(GameStateService);
    undoService = TestBed.inject(UndoService);
  });

  // ─── setCurrentDice ────────────────────────────────────────────────────────

  describe('setCurrentDice', () => {
    test('should update currentDice signal', () => {
      const dice: DiceSet = [2, 1, 0, 1, 1, 0];
      service.setCurrentDice(dice);
      expect(gameState.currentDice()).toEqual(dice);
    });

    test('should clear the undo snapshot when new dice are entered', () => {
      // Place a score first to create a snapshot
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      expect(undoService.canUndo()).toBeTruthy();

      // Entering new dice should clear the snapshot
      service.setCurrentDice([1, 1, 1, 1, 1, 0] as DiceSet);
      expect(undoService.canUndo()).toBeFalsy();
    });
  });

  // ─── placeScore ────────────────────────────────────────────────────────────

  describe('placeScore', () => {
    test('should do nothing when no dice are set', () => {
      service.placeScore(SCORE_CATEGORY.aces, 0);
      expect(gameState.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeUndefined();
    });

    test('should place score in column ONE first', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      expect(gameState.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(3);
    });

    test('should fill columns left-to-right: ONE → TWO → THREE', () => {
      const dice: DiceSet = [3, 0, 0, 0, 2, 0];
      service.setCurrentDice(dice);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.setCurrentDice(dice);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.setCurrentDice(dice);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      const game = gameState.games()[0];
      expect(game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeDefined();
      expect(game.columns[GAME_COLUMN.two].upper[SCORE_CATEGORY.aces]).toBeDefined();
      expect(game.columns[GAME_COLUMN.three].upper[SCORE_CATEGORY.aces]).toBeDefined();
    });

    test('should do nothing when all 3 columns are filled for a category', () => {
      const dice: DiceSet = [3, 0, 0, 0, 2, 0];
      service.setCurrentDice(dice);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.setCurrentDice(dice);
      service.placeScore(SCORE_CATEGORY.aces, 0);
      service.setCurrentDice(dice);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      const gamesBefore = gameState.games();
      service.placeScore(SCORE_CATEGORY.aces, 0); // no dice set → no-op
      expect(gameState.games()).toEqual(gamesBefore);
    });

    test('should mark isScratched when score is 0', () => {
      service.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet); // no aces
      service.placeScore(SCORE_CATEGORY.aces, 0);

      const cell = gameState.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces];
      expect(cell?.value).toBe(0);
      expect(cell?.isScratched).toBeTruthy();
    });

    test('should not mark isScratched when score is positive', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      const cell = gameState.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces];
      expect(cell?.value).toBe(3);
      expect(cell?.isScratched).toBeFalsy();
    });

    test('should do nothing for an out-of-bounds gameIndex', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      const gamesBefore = gameState.games();
      service.placeScore(SCORE_CATEGORY.aces, 99);
      expect(gameState.games()).toEqual(gamesBefore);
    });

    test('should place lower-section scores in the lower section', () => {
      service.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet); // five 6s → chance = 30
      service.placeScore(SCORE_CATEGORY.chance, 0);

      expect(gameState.games()[0].columns[GAME_COLUMN.one].lower[SCORE_CATEGORY.chance]?.value).toBe(30);
    });

    test('should place score in a specific game by gameIndex', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 1); // game index 1 (second game)

      expect(gameState.games()[1].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(3);
      expect(gameState.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeUndefined();
    });

    test('should clear currentDice after placing a score', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      service.placeScore(SCORE_CATEGORY.aces, 0);

      expect(gameState.currentDice()).toBeUndefined();
    });

    test('should save a snapshot before placement (enabling undo)', () => {
      service.setCurrentDice([3, 0, 0, 0, 2, 0] as DiceSet);
      expect(undoService.canUndo()).toBeFalsy(); // no snapshot before placement

      service.placeScore(SCORE_CATEGORY.aces, 0);
      expect(undoService.canUndo()).toBeTruthy();
    });
  });

  // ─── Yahtzee Bonus (Left-to-Right Fill Rule interaction) ──────────────────

  describe('yahtzeeBonus', () => {
    const yahtzeeDice: DiceSet = [5, 0, 0, 0, 0, 0]; // five 1s (dice.includes(5))

    test('should be 0 when no additional Yahtzee has been placed', () => {
      expect(gameState.columnStats()[0][GAME_COLUMN.one].yahtzeeBonusRaw).toBe(0);
    });

    test('should be 100 after placing a score with Yahtzee dice when Yahtzee cell is non-zero', () => {
      service.setCurrentDice(yahtzeeDice);
      service.placeScore(SCORE_CATEGORY.yahtzee, 0); // Yahtzee = 5 in column ONE

      service.setCurrentDice(yahtzeeDice);
      service.placeScore(SCORE_CATEGORY.aces, 0); // bonus triggered

      expect(gameState.columnStats()[0][GAME_COLUMN.one].yahtzeeBonusRaw).toBe(100);
    });

    test('should be 0 when Yahtzee cell is scratched', () => {
      service.setCurrentDice([1, 0, 0, 0, 4, 0] as DiceSet); // not a Yahtzee → score 0
      service.placeScore(SCORE_CATEGORY.yahtzee, 0); // Yahtzee scratched

      service.setCurrentDice(yahtzeeDice);
      service.placeScore(SCORE_CATEGORY.aces, 0); // no bonus: existing Yahtzee is 0

      expect(gameState.columnStats()[0][GAME_COLUMN.one].yahtzeeBonusRaw).toBe(0);
    });

    test('should accumulate to 200 after two bonus-triggering placements in the same column', () => {
      service.setCurrentDice(yahtzeeDice);
      service.placeScore(SCORE_CATEGORY.yahtzee, 0);

      service.setCurrentDice(yahtzeeDice);
      service.placeScore(SCORE_CATEGORY.aces, 0); // +100

      service.setCurrentDice(yahtzeeDice);
      service.placeScore(SCORE_CATEGORY.twos, 0); // +100 again

      expect(gameState.columnStats()[0][GAME_COLUMN.one].yahtzeeBonusRaw).toBe(200);
    });

    test('should include yahtzeeBonus in combinedTotal', () => {
      service.setCurrentDice(yahtzeeDice);
      service.placeScore(SCORE_CATEGORY.yahtzee, 0);

      const beforeBonus = gameState.columnStats()[0][GAME_COLUMN.one].combinedTotal;

      service.setCurrentDice(yahtzeeDice);
      service.placeScore(SCORE_CATEGORY.aces, 0); // aces = 5, bonus = 100

      const afterBonus = gameState.columnStats()[0][GAME_COLUMN.one].combinedTotal;
      expect(afterBonus - beforeBonus).toBe(5 + 100); // aces score + yahtzee bonus
    });

    test('should be reversed when restoreGames is called with the pre-bonus snapshot', () => {
      service.setCurrentDice(yahtzeeDice);
      service.placeScore(SCORE_CATEGORY.yahtzee, 0);

      const snapshotBeforeBonus = gameState.games();

      service.setCurrentDice(yahtzeeDice);
      service.placeScore(SCORE_CATEGORY.aces, 0); // triggers bonus

      expect(gameState.columnStats()[0][GAME_COLUMN.one].yahtzeeBonusRaw).toBe(100);

      gameState.restoreGames(snapshotBeforeBonus);

      expect(gameState.columnStats()[0][GAME_COLUMN.one].yahtzeeBonusRaw).toBe(0);
    });
  });
});
