import type { DiceSet } from '../../models';

import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SCORE_CATEGORY } from '../../models';
import { GameStateService } from '../../services/game-state.service';
import { ScoreSheetComponent } from './score-sheet.component';

describe('scoreSheetComponent', () => {
  // ─── Rendering ─────────────────────────────────────────────────────────────

  test('should render column headers for each game', async () => {
    await render(ScoreSheetComponent);

    // Default is 2 games; each game has ONE, TWO, THREE columns
    expect(screen.getByTestId('column-header-0-ONE')).toHaveTextContent('ONE ×1');
    expect(screen.getByTestId('column-header-0-TWO')).toHaveTextContent('TWO ×2');
    expect(screen.getByTestId('column-header-0-THREE')).toHaveTextContent('THREE ×3');
    expect(screen.getByTestId('column-header-1-ONE')).toHaveTextContent('ONE ×1');
    expect(screen.getByTestId('column-header-1-TWO')).toHaveTextContent('TWO ×2');
    expect(screen.getByTestId('column-header-1-THREE')).toHaveTextContent('THREE ×3');
  });

  test('should render game group headers', async () => {
    await render(ScoreSheetComponent);

    expect(screen.getByTestId('game-group-header-0')).toHaveTextContent('Game 1');
    expect(screen.getByTestId('game-group-header-1')).toHaveTextContent('Game 2');
  });

  test('should render upper section category labels', async () => {
    await render(ScoreSheetComponent);

    expect(screen.getByText('Aces')).toBeInTheDocument();
    expect(screen.getByText('Twos')).toBeInTheDocument();
    expect(screen.getByText('Threes')).toBeInTheDocument();
    expect(screen.getByText('Fours')).toBeInTheDocument();
    expect(screen.getByText('Fives')).toBeInTheDocument();
    expect(screen.getByText('Sixes')).toBeInTheDocument();
  });

  test('should render lower section category labels', async () => {
    await render(ScoreSheetComponent);

    expect(screen.getByText('3 of a Kind')).toBeInTheDocument();
    expect(screen.getByText('4 of a Kind')).toBeInTheDocument();
    expect(screen.getByText('Full House')).toBeInTheDocument();
    expect(screen.getByText('Sm. Straight')).toBeInTheDocument();
    expect(screen.getByText('Lg. Straight')).toBeInTheDocument();
    expect(screen.getByText('YAHTZEE')).toBeInTheDocument();
    expect(screen.getByText('Chance')).toBeInTheDocument();
  });

  test('should render the grand total row', async () => {
    await render(ScoreSheetComponent);

    expect(screen.getByTestId('grand-total')).toBeInTheDocument();
  });

  // ─── No-dice state ─────────────────────────────────────────────────────────

  test('should show no available-cell buttons when no dice are set', async () => {
    await render(ScoreSheetComponent);

    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  // ─── With dice ─────────────────────────────────────────────────────────────

  test('should show available-cell buttons for all categories in all games when dice are set', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);

    // 13 categories × 2 games = 26 buttons (one per category per game)
    expect(await screen.findAllByRole('button')).toHaveLength(26);
  });

  test('should show the potential score for Aces in game 0 ONE column', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // five 1s → aces = 5 (×1 = 5 in column ONE)
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);

    expect(await screen.findByTestId('available-cell-0-Aces-ONE')).toHaveTextContent('5');
  });

  test('should show the potential score for Aces in game 1 ONE column', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // five 1s → aces = 5 (×1 = 5 in column ONE)
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);

    expect(await screen.findByTestId('available-cell-1-Aces-ONE')).toHaveTextContent('5');
  });

  test('should apply column multiplier to potential score in TWO column', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // five 6s → sixes = 30; in TWO column × 2 = 60
    gameState.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet);

    // Must first fill ONE before TWO becomes available
    gameState.placeScore(SCORE_CATEGORY.sixes, 0); // fills ONE of game 0
    // Now TWO is the next available for Sixes in game 0
    expect(await screen.findByTestId('available-cell-0-Sixes-TWO')).toHaveTextContent('60');
  });

  // ─── Placing scores ─────────────────────────────────────────────────────────

  test('should place score and display it when an available cell is clicked for game 0', async () => {
    const user = userEvent.setup();
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet); // five 1s → aces = 5

    const btn = await screen.findByTestId('available-cell-0-Aces-ONE');
    await user.click(btn);

    // The available button is replaced by the filled cell showing 5 × 1 = 5
    expect(await screen.findByTestId('cell-0-Aces-ONE')).toHaveTextContent('5');
  });

  test('should place score in game 1 independently from game 0', async () => {
    const user = userEvent.setup();
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);

    // Click the Aces available cell for game 1
    await user.click(await screen.findByTestId('available-cell-1-Aces-ONE'));

    expect(await screen.findByTestId('cell-1-Aces-ONE')).toHaveTextContent('5');
    // Game 0 cell should still be available
    expect(screen.getByTestId('available-cell-0-Aces-ONE')).toBeInTheDocument();
  });

  test('should advance to next column after placement in game 0', async () => {
    const user = userEvent.setup();
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);

    // Click the Aces available cell (ONE) for game 0
    await user.click(await screen.findByTestId('available-cell-0-Aces-ONE'));

    // Now TWO should be the next available cell for Aces in game 0
    expect(await screen.findByTestId('available-cell-0-Aces-TWO')).toBeInTheDocument();
  });

  test('should show 0 for a scratch (potential score is 0)', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // no 1s → aces = 0
    gameState.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);

    expect(await screen.findByTestId('available-cell-0-Aces-ONE')).toHaveTextContent('0');
  });

  test('should display filled cell with 0 after a scratch is placed', async () => {
    const user = userEvent.setup();
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet); // no aces

    await user.click(await screen.findByTestId('available-cell-0-Aces-ONE'));

    expect(await screen.findByTestId('cell-0-Aces-ONE')).toHaveTextContent('0');
  });

  // ─── Totals ─────────────────────────────────────────────────────────────────

  test('should show upper section total after placing scores', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // five 1s → aces = 5
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0);

    expect(await screen.findByTestId('upper-total-0-ONE')).toHaveTextContent('5');
  });

  test('should show grand total updating after placements across multiple games', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // five 6s → chance = 30 (×1 in ONE, ×2 in TWO, ×3 in THREE)
    gameState.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // game 0 ONE: 30×1 = 30
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // game 0 TWO: 30×2 = 60
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // game 0 THREE: 30×3 = 90
    gameState.placeScore(SCORE_CATEGORY.chance, 1); // game 1 ONE: 30×1 = 30

    // grand = 30 + 60 + 90 + 30 = 210
    expect(await screen.findByTestId('grand-total')).toHaveTextContent('210');
  });

  test('should show upper bonus when raw total reaches 63', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);

    // Build up to 70 raw in ONE column of game 0
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0); // 5
    gameState.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.twos, 0); // 10
    gameState.setCurrentDice([0, 0, 5, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.threes, 0); // 15
    gameState.setCurrentDice([0, 0, 0, 5, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.fours, 0); // 20
    gameState.setCurrentDice([0, 0, 0, 0, 4, 1] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.fives, 0); // 20 → total = 70 ≥ 63

    // Bonus = 35 × 1 = 35 for ONE column of game 0
    expect(await screen.findByTestId('upper-bonus-0-ONE')).toHaveTextContent('35');
    // upperTotal = (70 + 35) × 1 = 105
    expect(await screen.findByTestId('upper-total-0-ONE')).toHaveTextContent('105');
  });
});
