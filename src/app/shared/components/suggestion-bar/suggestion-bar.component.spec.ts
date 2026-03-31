import type { DiceSet } from '../../models';

import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SCORE_CATEGORY } from '../../models';
import { GameStateService } from '../../services/game-state.service';
import { SuggestionBarComponent } from './suggestion-bar.component';

describe('suggestionBarComponent', () => {
  // ─── Not visible without dice ─────────────────────────────────────────────

  test('should not render the bar when no dice are set', async () => {
    await render(SuggestionBarComponent);

    expect(screen.queryByTestId('suggestion-bar')).not.toBeInTheDocument();
  });

  // ─── Visible after dice entry ─────────────────────────────────────────────

  test('should render the bar after dice are confirmed', async () => {
    const { fixture } = await render(SuggestionBarComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    // five 5s: Yahtzee is top suggestion
    const dice: DiceSet = [0, 0, 0, 0, 5, 0];
    gameState.setCurrentDice(dice);
    fixture.detectChanges();

    expect(screen.getByTestId('suggestion-bar')).toBeInTheDocument();
  });

  test('should show the suggested category name', async () => {
    const { fixture } = await render(SuggestionBarComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // five 5s → YAHTZEE top suggestion
    gameState.setCurrentDice(dice);
    fixture.detectChanges();

    expect(screen.getByTestId('suggestion-category')).toHaveTextContent('YAHTZEE');
  });

  test('should show the suggested score', async () => {
    const { fixture } = await render(SuggestionBarComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // five 5s → YAHTZEE = 50
    gameState.setCurrentDice(dice);
    fixture.detectChanges();

    expect(screen.getByTestId('suggestion-score')).toHaveTextContent('50');
  });

  // ─── Accept button ────────────────────────────────────────────────────────

  test('should render Accept and Dismiss buttons when visible', async () => {
    const { fixture } = await render(SuggestionBarComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    gameState.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();

    expect(screen.getByRole('button', { name: 'Accept suggestion' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss suggestion' })).toBeInTheDocument();
  });

  test('should hide the bar after Accept is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    gameState.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Accept suggestion' }));
    fixture.detectChanges();

    expect(screen.queryByTestId('suggestion-bar')).not.toBeInTheDocument();
  });

  test('should place the suggested score when Accept is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    const dice: DiceSet = [0, 0, 0, 0, 5, 0]; // top suggestion: YAHTZEE in ONE → 50
    gameState.setCurrentDice(dice);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Accept suggestion' }));

    const game = gameState.games()[0];
    expect(game.columns.ONE.lower[SCORE_CATEGORY.yahtzee]).toEqual({
      value: 50,
      isScratched: false,
    });
  });

  // ─── Dismiss button ───────────────────────────────────────────────────────

  test('should hide the bar after Dismiss is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    gameState.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Dismiss suggestion' }));
    fixture.detectChanges();

    expect(screen.queryByTestId('suggestion-bar')).not.toBeInTheDocument();
  });

  test('should not place a score when Dismiss is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    const dice: DiceSet = [0, 0, 0, 0, 5, 0];
    gameState.setCurrentDice(dice);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Dismiss suggestion' }));

    const game = gameState.games()[0];
    // No score should have been placed in any category
    const allFilled = [...Object.values(game.columns.ONE.upper), ...Object.values(game.columns.ONE.lower)];
    expect(allFilled).toHaveLength(0);
  });

  // ─── Re-appear on new dice roll ───────────────────────────────────────────

  test('should re-appear after a new dice roll following a Dismiss', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    // First roll — dismiss
    gameState.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();
    await user.click(screen.getByRole('button', { name: 'Dismiss suggestion' }));
    fixture.detectChanges();
    expect(screen.queryByTestId('suggestion-bar')).not.toBeInTheDocument();

    // Second roll — bar should re-appear
    gameState.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();
    expect(screen.getByTestId('suggestion-bar')).toBeInTheDocument();
  });

  test('should re-appear after a new dice roll following an Accept', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SuggestionBarComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    // First roll — accept
    gameState.setCurrentDice([0, 0, 0, 0, 5, 0]);
    fixture.detectChanges();
    await user.click(screen.getByRole('button', { name: 'Accept suggestion' }));
    fixture.detectChanges();
    expect(screen.queryByTestId('suggestion-bar')).not.toBeInTheDocument();

    // Second roll — bar should re-appear (with new top suggestion)
    gameState.setCurrentDice([1, 1, 1, 1, 1, 0]);
    fixture.detectChanges();
    expect(screen.getByTestId('suggestion-bar')).toBeInTheDocument();
  });
});
