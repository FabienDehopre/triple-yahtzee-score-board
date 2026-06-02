import type { DiceSet } from '../../models/dice-set.model';

import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SCORE_CATEGORY } from '../../models/score-category.model';
import { SessionStore } from '../../services/session.store';
import { getTranslocoTestingModule } from '../../testing/transloco-testing';
import { ClearSessionButtonComponent } from './clear-session-button.component';

const T = { imports: [getTranslocoTestingModule()] };

describe('clearSessionButtonComponent', () => {
  beforeEach(() => localStorage.clear());

  test('renders clear session button', async () => {
    await render(ClearSessionButtonComponent, T);

    expect(screen.getByTestId('clear-session-button')).toBeInTheDocument();
  });

  test('does not show confirmation initially', async () => {
    await render(ClearSessionButtonComponent, T);

    expect(screen.queryByTestId('clear-session-confirm')).not.toBeInTheDocument();
    expect(screen.queryByTestId('clear-session-cancel')).not.toBeInTheDocument();
  });

  test('clears immediately when no game in progress', async () => {
    const user = userEvent.setup();
    await render(ClearSessionButtonComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    // Place a score so we can verify it gets cleared
    sessionStore.setCurrentDice([1, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);
    expect(sessionStore.isAnyGameInProgress()).toBeTruthy();

    // newGame then clear immediately (no game in progress after reset)
    sessionStore.newGame();
    expect(sessionStore.isAnyGameInProgress()).toBeFalsy();

    // Now clicking clear should reset without confirmation
    await user.click(screen.getByTestId('clear-session-button'));

    expect(screen.queryByTestId('clear-session-confirm')).not.toBeInTheDocument();
    expect(sessionStore.isAnyGameInProgress()).toBeFalsy();
  });

  test('shows confirmation when game is in progress', async () => {
    const user = userEvent.setup();
    await render(ClearSessionButtonComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    sessionStore.setCurrentDice([1, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);

    await user.click(screen.getByTestId('clear-session-button'));

    expect(screen.getByTestId('clear-session-confirm')).toBeInTheDocument();
    expect(screen.getByTestId('clear-session-cancel')).toBeInTheDocument();
  });

  test('clears session on confirm', async () => {
    const user = userEvent.setup();
    await render(ClearSessionButtonComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    sessionStore.setCurrentDice([1, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);
    expect(sessionStore.isAnyGameInProgress()).toBeTruthy();

    await user.click(screen.getByTestId('clear-session-button'));
    await user.click(screen.getByTestId('clear-session-confirm'));

    expect(sessionStore.isAnyGameInProgress()).toBeFalsy();
    expect(screen.queryByTestId('clear-session-confirm')).not.toBeInTheDocument();
  });

  test('cancels without clearing on cancel', async () => {
    const user = userEvent.setup();
    await render(ClearSessionButtonComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    sessionStore.setCurrentDice([1, 0, 0, 0, 0, 0] as DiceSet);
    sessionStore.placeScore(SCORE_CATEGORY.aces, 0);
    expect(sessionStore.isAnyGameInProgress()).toBeTruthy();

    await user.click(screen.getByTestId('clear-session-button'));
    await user.click(screen.getByTestId('clear-session-cancel'));

    expect(sessionStore.isAnyGameInProgress()).toBeTruthy();
    expect(screen.queryByTestId('clear-session-confirm')).not.toBeInTheDocument();
  });
});
