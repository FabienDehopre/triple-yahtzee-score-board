import type { DiceSet } from '../../models/dice-set.model';

import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { GAME_COLUMN, LOWER_CATEGORIES, UPPER_CATEGORIES } from '../../models/game-column.model';
import { SCORE_CATEGORY } from '../../models/score-category.model';
import { GameStateService } from '../../services/game-state.service';
import { GameOverComponent } from './game-over.component';

/** Fill all 39 cells for a single game index to trigger game-over for that game. */
function fillAllCellsForGame(service: GameStateService, gameIndex: number): void {
  const dice: DiceSet = [1, 1, 1, 1, 1, 0];
  for (const cat of UPPER_CATEGORIES) {
    for (let col = 0; col < 3; col++) {
      service.setCurrentDice(dice);
      service.placeScore(cat, gameIndex);
    }
  }
  for (const cat of LOWER_CATEGORIES) {
    for (let col = 0; col < 3; col++) {
      service.setCurrentDice(dice);
      service.placeScore(cat, gameIndex);
    }
  }
}

describe('gameOverComponent', () => {
  // ─── Rendering ─────────────────────────────────────────────────────────────

  test('should render the game-over heading', async () => {
    await render(GameOverComponent);

    expect(screen.getByTestId('game-over-heading')).toBeInTheDocument();
  });

  test('should display the grand total', async () => {
    await render(GameOverComponent);
    const gameState = TestBed.inject(GameStateService);
    const dice: DiceSet = [0, 0, 0, 0, 0, 5]; // five 6s → chance = 30
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // ONE: 30
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // TWO: 60
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // THREE: 90

    expect(await screen.findByTestId('game-over-grand-total')).toHaveTextContent('180');
  });

  test('should display the combined total (ONE column) for game 0', async () => {
    await render(GameOverComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // ONE: 30×1

    expect(await screen.findByTestId(`game-over-combined-0-${GAME_COLUMN.one}`)).toHaveTextContent('30');
  });

  test('should display the double combined (TWO column) for game 0', async () => {
    await render(GameOverComponent);
    const gameState = TestBed.inject(GameStateService);
    const dice: DiceSet = [0, 0, 0, 0, 0, 5];
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // ONE: 30×1
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // TWO: 30×2 = 60

    expect(await screen.findByTestId(`game-over-combined-0-${GAME_COLUMN.two}`)).toHaveTextContent('60');
  });

  test('should display the triple combined (THREE column) for game 0', async () => {
    await render(GameOverComponent);
    const gameState = TestBed.inject(GameStateService);
    const dice: DiceSet = [0, 0, 0, 0, 0, 5];
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // ONE: 30×1
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // TWO: 30×2
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // THREE: 30×3 = 90

    expect(await screen.findByTestId(`game-over-combined-0-${GAME_COLUMN.three}`)).toHaveTextContent('90');
  });

  test('should display the combined total for game 1', async () => {
    await render(GameOverComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.chance, 1); // game 1, ONE: 30×1

    expect(await screen.findByTestId(`game-over-combined-1-${GAME_COLUMN.one}`)).toHaveTextContent('30');
  });

  test('should display upper bonus when earned', async () => {
    await render(GameOverComponent);
    const gameState = TestBed.inject(GameStateService);

    // Earn bonus in ONE column (raw ≥ 63 → bonus = 35)
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0); // 5
    gameState.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.twos, 0); // 10
    gameState.setCurrentDice([0, 0, 5, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.threes, 0); // 15
    gameState.setCurrentDice([0, 0, 0, 5, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.fours, 0); // 20
    gameState.setCurrentDice([0, 0, 0, 0, 4, 1] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.fives, 0); // 20 → total=70 → bonus=35

    expect(await screen.findByTestId(`game-over-upper-bonus-0-${GAME_COLUMN.one}`)).toHaveTextContent('35');
  });

  // ─── New Game Button ────────────────────────────────────────────────────────

  test('should render the New Game button', async () => {
    await render(GameOverComponent);

    expect(screen.getByTestId('new-game-button')).toBeInTheDocument();
  });

  test('should reset the game state when New Game is clicked', async () => {
    const user = userEvent.setup();
    await render(GameOverComponent);
    const gameState = TestBed.inject(GameStateService);

    // Place some scores
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0);

    await user.click(screen.getByTestId('new-game-button'));

    // Game state should be reset
    expect(gameState.games()[0].columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]).toBeUndefined();
    expect(gameState.currentDice()).toBeUndefined();
    expect(gameState.grandTotal()).toBe(0);
  });

  test('should reset isGameOver when New Game is clicked after a completed game', async () => {
    const user = userEvent.setup();
    await render(GameOverComponent);
    const gameState = TestBed.inject(GameStateService);

    const gameCount = gameState.games().length;
    for (let gi = 0; gi < gameCount; gi++) {
      fillAllCellsForGame(gameState, gi);
    }
    expect(gameState.isGameOver()).toBeTruthy();

    await user.click(screen.getByTestId('new-game-button'));

    expect(gameState.isGameOver()).toBeFalsy();
  });
});
