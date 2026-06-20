import type { DiceSet } from '../../models/dice-set.model';

import { TestBed } from '@angular/core/testing';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { readCell } from '../../models/game-cells';
import { GAME_COLUMN } from '../../models/game-column.model';
import { SCORE_CATEGORY } from '../../models/score-category.model';
import { SessionStore } from '../../services/session.store';
import { UndoStore } from '../../services/undo.store';
import { getTranslocoTestingModule } from '../../testing/transloco-testing';
import { UndoBannerComponent } from './undo-banner.component';

const T = { imports: [getTranslocoTestingModule()] };

describe('undoBannerComponent', () => {
  beforeEach(() => localStorage.clear());

  // ─── Hidden state ──────────────────────────────────────────────────────────

  test('should not render the banner when canUndo is false', async () => {
    await render(UndoBannerComponent, T);

    expect(screen.queryByTestId('undo-banner')).not.toBeInTheDocument();
  });

  // ─── Visible state ─────────────────────────────────────────────────────────

  test('should render the banner after a score is placed', async () => {
    await render(UndoBannerComponent, T);
    const sessionStore = TestBed.inject(SessionStore);
    sessionStore.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);

    expect(await screen.findByTestId('undo-banner')).toBeInTheDocument();
  });

  test('should show the category name in the banner', async () => {
    await render(UndoBannerComponent, T);
    const sessionStore = TestBed.inject(SessionStore);
    sessionStore.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);

    expect(await screen.findByTestId('undo-banner')).toHaveTextContent('Aces');
  });

  test('should render an undo button when the banner is visible', async () => {
    await render(UndoBannerComponent, T);
    const sessionStore = TestBed.inject(SessionStore);
    sessionStore.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);

    expect(await screen.findByRole('button', { name: /undo/i })).toBeInTheDocument();
  });

  // ─── Undo action ───────────────────────────────────────────────────────────

  test('should hide the banner after clicking Undo', async () => {
    const user = userEvent.setup();
    await render(UndoBannerComponent, T);
    const sessionStore = TestBed.inject(SessionStore);
    sessionStore.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);

    await user.click(await screen.findByRole('button', { name: /undo/i }));

    expect(screen.queryByTestId('undo-banner')).not.toBeInTheDocument();
  });

  test('should restore the previous game state after clicking Undo', async () => {
    const user = userEvent.setup();
    await render(UndoBannerComponent, T);
    const sessionStore = TestBed.inject(SessionStore);
    sessionStore.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);

    await user.click(await screen.findByRole('button', { name: /undo/i }));

    expect(readCell(sessionStore.games()[0], GAME_COLUMN.one, SCORE_CATEGORY.aces)).toBeUndefined();
  });

  // ─── Auto-hide on new dice ─────────────────────────────────────────────────

  test('should auto-hide the banner when new dice are entered', async () => {
    await render(UndoBannerComponent, T);
    const sessionStore = TestBed.inject(SessionStore);
    sessionStore.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);

    expect(await screen.findByTestId('undo-banner')).toBeInTheDocument();

    sessionStore.setCurrentDice([0, 5, 0, 0, 0, 0] as DiceSet);

    await waitFor(() => {
      expect(screen.queryByTestId('undo-banner')).not.toBeInTheDocument();
    });
  });

  // ─── canUndo signal via UndoStore ───────────────────────────────────────────

  test('canUndo should be false after undo is performed', async () => {
    const user = userEvent.setup();
    await render(UndoBannerComponent, T);
    const sessionStore = TestBed.inject(SessionStore);
    const undoStore = TestBed.inject(UndoStore);

    sessionStore.setCurrentDice([5, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);
    expect(undoStore.canUndo()).toBeTruthy();

    await user.click(await screen.findByRole('button', { name: /undo/i }));

    expect(undoStore.canUndo()).toBeFalsy();
  });
});
