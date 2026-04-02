import type { DiceSet } from '../../models/dice-set.model';

import { TestBed } from '@angular/core/testing';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SCORE_CATEGORY } from '../../models/score-category.model';
import { GameStateService } from '../../services/game-state.service';
import { UndoService } from '../../services/undo.service';
import { UndoBannerComponent } from './undo-banner.component';

describe('undoBannerComponent', () => {
  // ─── Hidden state ──────────────────────────────────────────────────────────

  test('should not render the banner when canUndo is false', async () => {
    await render(UndoBannerComponent);

    expect(screen.queryByTestId('undo-banner')).not.toBeInTheDocument();
  });

  // ─── Visible state ─────────────────────────────────────────────────────────

  test('should render the banner after a score is placed', async () => {
    await render(UndoBannerComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0);

    expect(await screen.findByTestId('undo-banner')).toBeInTheDocument();
  });

  test('should show the category name in the banner', async () => {
    await render(UndoBannerComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0);

    expect(await screen.findByTestId('undo-banner')).toHaveTextContent('Aces');
  });

  test('should render an undo button when the banner is visible', async () => {
    await render(UndoBannerComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0);

    expect(await screen.findByRole('button', { name: /undo/i })).toBeInTheDocument();
  });

  // ─── Undo action ───────────────────────────────────────────────────────────

  test('should hide the banner after clicking Undo', async () => {
    const user = userEvent.setup();
    await render(UndoBannerComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0);

    await user.click(await screen.findByRole('button', { name: /undo/i }));

    expect(screen.queryByTestId('undo-banner')).not.toBeInTheDocument();
  });

  test('should restore the previous game state after clicking Undo', async () => {
    const user = userEvent.setup();
    await render(UndoBannerComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0);

    const gamesBefore = gameState.games();
    // Undo should restore state to before placement (empty board)
    await user.click(await screen.findByRole('button', { name: /undo/i }));

    // After undo the aces cell in ONE column should be empty again
    expect(gameState.games()[0].columns.ONE.upper[SCORE_CATEGORY.aces]).toBeUndefined();
    // And the state should differ from what it was after placement
    expect(gameState.games()).not.toEqual(gamesBefore);
  });

  // ─── Auto-hide on new dice ─────────────────────────────────────────────────

  test('should auto-hide the banner when new dice are entered', async () => {
    await render(UndoBannerComponent);
    const gameState = TestBed.inject(GameStateService);
    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0);

    // Verify it's visible
    expect(await screen.findByTestId('undo-banner')).toBeInTheDocument();

    // Enter new dice
    gameState.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);

    // Banner should be gone
    await waitFor(() => {
      expect(screen.queryByTestId('undo-banner')).not.toBeInTheDocument();
    });
  });

  // ─── canUndo signal via UndoService ────────────────────────────────────────

  test('canUndo should be false after undo is performed', async () => {
    const user = userEvent.setup();
    await render(UndoBannerComponent);
    const gameState = TestBed.inject(GameStateService);
    const undoService = TestBed.inject(UndoService);

    gameState.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    gameState.placeScore(SCORE_CATEGORY.aces, 0);
    expect(undoService.canUndo()).toBeTruthy();

    await user.click(await screen.findByRole('button', { name: /undo/i }));

    expect(undoService.canUndo()).toBeFalsy();
  });
});
