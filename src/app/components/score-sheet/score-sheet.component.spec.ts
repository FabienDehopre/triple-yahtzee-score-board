import type { DiceSet } from '../../models/dice-set.model';

import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SCORE_CATEGORY } from '../../models/score-category.model';
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

    // Each label appears once in the mobile layout and once in the desktop layout
    expect(screen.getAllByText('Aces')).toHaveLength(2);
    expect(screen.getAllByText('Twos')).toHaveLength(2);
    expect(screen.getAllByText('Threes')).toHaveLength(2);
    expect(screen.getAllByText('Fours')).toHaveLength(2);
    expect(screen.getAllByText('Fives')).toHaveLength(2);
    expect(screen.getAllByText('Sixes')).toHaveLength(2);
  });

  test('should render lower section category labels', async () => {
    await render(ScoreSheetComponent);

    // Each label appears once in the mobile layout and once in the desktop layout
    expect(screen.getAllByText('3 of a Kind')).toHaveLength(2);
    expect(screen.getAllByText('4 of a Kind')).toHaveLength(2);
    expect(screen.getAllByText('Full House')).toHaveLength(2);
    expect(screen.getAllByText('Sm. Straight')).toHaveLength(2);
    expect(screen.getAllByText('Lg. Straight')).toHaveLength(2);
    expect(screen.getAllByText('YAHTZEE')).toHaveLength(2);
    expect(screen.getAllByText('Chance')).toHaveLength(2);
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

    // Desktop: 13 categories × 2 games = 26 buttons (one per category per game)
    // Mobile: 13 categories × 1 active game (game 0 by default) = 13 buttons
    // Total: 39 buttons
    expect(await screen.findAllByRole('button')).toHaveLength(39);
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
    const dice: DiceSet = [0, 0, 0, 0, 0, 5]; // five 6s → sixes = 30
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.sixes, 0); // fills ONE of game 0, clears dice
    gameState.setCurrentDice(dice); // re-set dice so TWO becomes visible
    // TWO is the next available for Sixes in game 0; 30 × 2 = 60
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
    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    gameState.setCurrentDice(dice);

    // Click the Aces available cell for game 1 (places score, clears dice)
    await user.click(await screen.findByTestId('available-cell-1-Aces-ONE'));

    expect(await screen.findByTestId('cell-1-Aces-ONE')).toHaveTextContent('5');
    // Re-set dice so game 0 cell becomes available again
    gameState.setCurrentDice(dice);
    expect(await screen.findByTestId('available-cell-0-Aces-ONE')).toBeInTheDocument();
  });

  test('should advance to next column after placement in game 0', async () => {
    const user = userEvent.setup();
    await render(ScoreSheetComponent);
    const gameState = TestBed.inject(GameStateService);
    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    gameState.setCurrentDice(dice);

    // Click the Aces available cell (ONE) for game 0 (places score, clears dice)
    await user.click(await screen.findByTestId('available-cell-0-Aces-ONE'));

    // Re-set dice so TWO becomes the next available cell for Aces in game 0
    gameState.setCurrentDice(dice);
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

  // ─── Mobile tab navigation ─────────────────────────────────────────────────

  test('should render a mobile game tab for each game', async () => {
    await render(ScoreSheetComponent);

    expect(screen.getByTestId('mobile-tab-0')).toHaveTextContent('Game 1');
    expect(screen.getByTestId('mobile-tab-1')).toHaveTextContent('Game 2');
  });

  test('should mark the first game tab as selected by default', async () => {
    await render(ScoreSheetComponent);

    expect(screen.getByTestId('mobile-tab-0')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('mobile-tab-1')).toHaveAttribute('aria-selected', 'false');
  });

  test('should switch the active game tab when another tab is clicked', async () => {
    const user = userEvent.setup();
    await render(ScoreSheetComponent);

    await user.click(screen.getByTestId('mobile-tab-1'));

    expect(screen.getByTestId('mobile-tab-0')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('mobile-tab-1')).toHaveAttribute('aria-selected', 'true');
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
    const dice: DiceSet = [0, 0, 0, 0, 0, 5]; // five 6s → chance = 30
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // game 0 ONE: 30×1 = 30
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // game 0 TWO: 30×2 = 60
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.chance, 0); // game 0 THREE: 30×3 = 90
    gameState.setCurrentDice(dice);
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
