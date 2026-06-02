import type { DiceSet } from '../../models/dice-set.model';

import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SCORE_CATEGORY } from '../../models/score-category.model';
import { SessionStore } from '../../services/session.store';
import { getTranslocoTestingModule } from '../../testing/transloco-testing';
import { SuggestionBarComponent } from './suggestion-bar.component';

const T = { imports: [getTranslocoTestingModule()] };

describe('suggestionBarComponent', () => {
  beforeEach(() => localStorage.clear());

  // ─── Not visible without dice ─────────────────────────────────────────────

  test('should not render the bar when no dice are set', async () => {
    await render(SuggestionBarComponent, T);

    expect(screen.queryByTestId('suggestion-bar')).not.toBeInTheDocument();
  });

  // ─── Visible after dice entry ─────────────────────────────────────────────

  test('should render the bar after dice are confirmed', async () => {
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    // five 5s: Yahtzee is top suggestion
    const dice: DiceSet = [0, 0, 0, 0, 5, 0];
    sessionStore.setCurrentDice(dice);
    fixture.detectChanges();

    expect(screen.getByTestId('suggestion-bar')).toBeInTheDocument();
  });

  test('should show the suggested category name', async () => {
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // five 5s → YAHTZEE top suggestion
    sessionStore.setCurrentDice(dice);
    fixture.detectChanges();

    expect(screen.getByTestId('suggestion-category')).toHaveTextContent('YAHTZEE');
  });

  test('should show the suggested score', async () => {
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // five 5s → YAHTZEE = 50
    sessionStore.setCurrentDice(dice);
    fixture.detectChanges();

    expect(screen.getByTestId('suggestion-score')).toHaveTextContent('50');
  });

  // ─── Accept button ────────────────────────────────────────────────────────

  test('should render Accept and Dismiss buttons when visible', async () => {
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    sessionStore.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();

    expect(screen.getByRole('button', { name: 'Accept suggestion' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss suggestion' })).toBeInTheDocument();
  });

  test('should hide the bar after Accept is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    sessionStore.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Accept suggestion' }));
    fixture.detectChanges();

    expect(screen.queryByTestId('suggestion-bar')).not.toBeInTheDocument();
  });

  test('should place the suggested score when Accept is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // top suggestion: YAHTZEE in ONE → 50
    sessionStore.setCurrentDice(dice);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Accept suggestion' }));

    const game = sessionStore.games()[0];
    expect(game.columns.ONE.lower[SCORE_CATEGORY.yahtzee]).toEqual({
      value: 50,
      isScratched: false,
    });
  });

  test('should place the suggested score in the active game when activeGameIndex = 1', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    sessionStore.setActiveGameIndex(1); // active game is now game 1

    const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // five 5s → YAHTZEE top suggestion
    sessionStore.setCurrentDice(dice);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Accept suggestion' }));

    expect(sessionStore.games()[1].columns.ONE.lower[SCORE_CATEGORY.yahtzee]).toEqual({
      value: 50,
      isScratched: false,
    });
    expect(sessionStore.games()[0].columns.ONE.lower[SCORE_CATEGORY.yahtzee]).toBeUndefined();
  });

  // ─── Dismiss button ───────────────────────────────────────────────────────

  test('should hide the bar after Dismiss is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    sessionStore.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Dismiss suggestion' }));
    fixture.detectChanges();

    expect(screen.queryByTestId('suggestion-bar')).not.toBeInTheDocument();
  });

  test('should not place a score when Dismiss is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    const dice: DiceSet = [0, 0, 0, 0, 5, 0];
    sessionStore.setCurrentDice(dice);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Dismiss suggestion' }));

    const game = sessionStore.games()[0];
    // No score should have been placed in any category
    const allFilled = [...Object.values(game.columns.ONE.upper), ...Object.values(game.columns.ONE.lower)];
    expect(allFilled).toHaveLength(0);
  });

  // ─── Re-appear on new dice roll ───────────────────────────────────────────

  test('should re-appear after a new dice roll following a Dismiss', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    // First roll — dismiss
    sessionStore.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();
    await user.click(screen.getByRole('button', { name: 'Dismiss suggestion' }));
    fixture.detectChanges();
    expect(screen.queryByTestId('suggestion-bar')).not.toBeInTheDocument();

    // Second roll — bar should re-appear
    sessionStore.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();
    expect(screen.getByTestId('suggestion-bar')).toBeInTheDocument();
  });

  test('should re-appear after a new dice roll following an Accept', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent, T);
    const sessionStore = TestBed.inject(SessionStore);

    // First roll — accept
    sessionStore.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();
    await user.click(screen.getByRole('button', { name: 'Accept suggestion' }));
    fixture.detectChanges();
    expect(screen.queryByTestId('suggestion-bar')).not.toBeInTheDocument();

    // Second roll — bar should re-appear (with new top suggestion)
    sessionStore.setCurrentDice([1, 1, 1, 1, 1, 0]);
    fixture.detectChanges();
    expect(screen.getByTestId('suggestion-bar')).toBeInTheDocument();
  });
});
