import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { GameStateService } from '../../services/game-state.service';
import { GameCountPickerComponent } from './game-count-picker.component';

describe('gameCountPickerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────

  test('should render the game count selector', async () => {
    await render(GameCountPickerComponent);

    expect(screen.getByTestId('game-count-select')).toBeInTheDocument();
  });

  test('should show the current game count as the selected option', async () => {
    await render(GameCountPickerComponent);
    const gameState = TestBed.inject(GameStateService);

    const currentCount = gameState.gameCount();
    const options = screen.getAllByRole('option');
    const selected = options.find((o) => (o as HTMLOptionElement).selected);
    expect(selected).toHaveTextContent(String(currentCount));
  });

  test('should offer options from 1 to 5', async () => {
    await render(GameCountPickerComponent);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveTextContent('1');
    expect(options[4]).toHaveTextContent('5');
  });

  // ─── Changing game count (no game in progress) ─────────────────────────────

  test('should apply the new game count immediately when no game is in progress', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent);
    const gameState = TestBed.inject(GameStateService);

    await user.selectOptions(screen.getByTestId('game-count-select'), '3');

    expect(gameState.gameCount()).toBe(3);
    expect(gameState.games()).toHaveLength(3);
  });

  test('should not show confirmation panel when no game is in progress', async () => {
    await render(GameCountPickerComponent);

    expect(screen.queryByTestId('game-count-confirm')).not.toBeInTheDocument();
  });

  // ─── Changing game count (game in progress) ────────────────────────────────

  test('should show confirmation when a game is in progress and count changes', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent);
    const gameState = TestBed.inject(GameStateService);

    // Put game in progress
    gameState.setCurrentDice([3, 0, 0, 0, 2, 0]);
    gameState.placeScore('Aces', 0);

    await user.selectOptions(screen.getByTestId('game-count-select'), '1');

    expect(screen.getByTestId('game-count-confirm')).toBeInTheDocument();
  });

  test('should apply new count when user confirms', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent);
    const gameState = TestBed.inject(GameStateService);

    // Put game in progress
    gameState.setCurrentDice([3, 0, 0, 0, 2, 0]);
    gameState.placeScore('Aces', 0);

    await user.selectOptions(screen.getByTestId('game-count-select'), '1');
    await user.click(screen.getByTestId('game-count-confirm'));

    expect(gameState.gameCount()).toBe(1);
    expect(gameState.games()).toHaveLength(1);
    expect(screen.queryByTestId('game-count-confirm')).not.toBeInTheDocument();
  });

  test('should revert selection when user cancels', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent);
    const gameState = TestBed.inject(GameStateService);

    const originalCount = gameState.gameCount();

    // Put game in progress
    gameState.setCurrentDice([3, 0, 0, 0, 2, 0]);
    gameState.placeScore('Aces', 0);

    await user.selectOptions(screen.getByTestId('game-count-select'), '1');
    await user.click(screen.getByTestId('game-count-cancel'));

    expect(gameState.gameCount()).toBe(originalCount);
    // The selected option should revert to the original count
    const options = screen.getAllByRole('option');
    const selected = options.find((o) => (o as HTMLOptionElement).selected);
    expect(selected).toHaveTextContent(String(originalCount));
    expect(screen.queryByTestId('game-count-confirm')).not.toBeInTheDocument();
  });
});
