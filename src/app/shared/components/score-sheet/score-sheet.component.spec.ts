import type { DiceSet } from '../../models';

import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SCORE_CATEGORY } from '../../models';
import { GameStateService } from '../../services/game-state.service';
import { ScoreSheetComponent } from './score-sheet.component';

describe('scoreSheetComponent', () => {
  // ─── Rendering ─────────────────────────────────────────────────────────────

  test('should render the three column headers', async () => {
    await render(ScoreSheetComponent);

    expect(screen.getByTestId('column-header-ONE')).toHaveTextContent('ONE ×1');
    expect(screen.getByTestId('column-header-TWO')).toHaveTextContent('TWO ×2');
    expect(screen.getByTestId('column-header-THREE')).toHaveTextContent('THREE ×3');
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

  test('should show available-cell buttons for all categories when dice are set', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);

    // Re-render / trigger CD by waiting for button to appear
    expect(await screen.findAllByRole('button')).toHaveLength(13); // one per category
  });

  test('should show the potential score for Aces in the ONE column', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // five 1s → aces = 5 (×1 = 5 in column ONE)
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);

    expect(await screen.findByTestId('available-cell-Aces-ONE')).toHaveTextContent('5');
  });

  test('should apply column multiplier to potential score in TWO column', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // five 6s → sixes = 30; in TWO column × 2 = 60
    gameState.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet);

    // Must first fill ONE before TWO becomes available
    gameState.placeScore(SCORE_CATEGORY.sixes, 0); // fills ONE
    // Now TWO is the next available for Sixes
    expect(await screen.findByTestId('available-cell-Sixes-TWO')).toHaveTextContent('60');
  });

  // ─── Placing scores ─────────────────────────────────────────────────────────

  test('should place score and display it when an available cell is clicked', async () => {
    const user = userEvent.setup();
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet); // five 1s → aces = 5

    const btn = await screen.findByTestId('available-cell-Aces-ONE');
    await user.click(btn);

    // The available button is replaced by the filled cell showing 5 × 1 = 5
    expect(await screen.findByTestId('cell-Aces-ONE')).toHaveTextContent('5');
  });

  test('should advance to next column after placement', async () => {
    const user = userEvent.setup();
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);

    // Click the Aces available cell (ONE)
    await user.click(await screen.findByTestId('available-cell-Aces-ONE'));

    // Now TWO should be the next available cell for Aces
    expect(await screen.findByTestId('available-cell-Aces-TWO')).toBeInTheDocument();
  });

  test('should show 0 for a scratch (potential score is 0)', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // no 1s → aces = 0
    gameState.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);

    expect(await screen.findByTestId('available-cell-Aces-ONE')).toHaveTextContent('0');
  });

  test('should display filled cell with 0 after a scratch is placed', async () => {
    const user = userEvent.setup();
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet); // no aces

    await user.click(await screen.findByTestId('available-cell-Aces-ONE'));

    expect(await screen.findByTestId('cell-Aces-ONE')).toHaveTextContent('0');
  });

  // ─── Totals ─────────────────────────────────────────────────────────────────

  test('should show upper section total after placing scores', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // five 1s → aces = 5
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0);

    expect(await screen.findByTestId('upper-total-ONE')).toHaveTextContent('5');
  });

  test('should show grand total updating after placements', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    // five 6s → chance = 30 (×1 in ONE, ×2 in TWO, ×3 in THREE)
    gameState.setCurrentDice([0, 0, 0, 0, 0, 5] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // ONE: 30×1 = 30
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // TWO: 30×2 = 60
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // THREE: 30×3 = 90

    // grand = 30 + 60 + 90 = 180
    expect(await screen.findByTestId('grand-total')).toHaveTextContent('180');
  });

  test('should show upper bonus when raw total reaches 63', async () => {
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);

    // Build up to 70 raw in ONE column
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

    // Bonus = 35 × 1 = 35 for ONE column
    expect(await screen.findByTestId('upper-bonus-ONE')).toHaveTextContent('35');
    // upperTotal = (70 + 35) × 1 = 105
    expect(await screen.findByTestId('upper-total-ONE')).toHaveTextContent('105');
  });
});
