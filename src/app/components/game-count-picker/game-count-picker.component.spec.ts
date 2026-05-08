import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { GameStateService } from '../../services/game-state.service';
import { PlacementService } from '../../services/placement.service';
import { getTranslocoTestingModule } from '../../testing/transloco-testing';
import { GameCountPickerComponent } from './game-count-picker.component';

const T = { imports: [getTranslocoTestingModule()] };

describe('gameCountPickerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────

  test('should render the game count selector', async () => {
    await render(GameCountPickerComponent, T);

    expect(screen.getByTestId('game-count-select')).toBeInTheDocument();
  });

  test('should show the current game count as the selected option', async () => {
    await render(GameCountPickerComponent, T);
    const gameState = TestBed.inject(GameStateService);

    const currentCount = gameState.gameCount();
    const options = screen.getAllByRole('option');
    const selected = options.find((o) => (o as HTMLOptionElement).selected);
    expect(selected).toHaveTextContent(String(currentCount));
  });

  test('should offer options from 1 to 5', async () => {
    await render(GameCountPickerComponent, T);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveTextContent('1');
    expect(options[4]).toHaveTextContent('5');
  });

  // ─── Changing game count (no game in progress) ─────────────────────────────

  test('should apply the new game count immediately when no game is in progress', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent, T);
    const gameState = TestBed.inject(GameStateService);

    await user.selectOptions(screen.getByTestId('game-count-select'), '3');

    expect(gameState.gameCount()).toBe(3);
    expect(gameState.games()).toHaveLength(3);
  });

  test('should not show confirmation panel when no game is in progress', async () => {
    await render(GameCountPickerComponent, T);

    expect(screen.queryByTestId('game-count-confirm')).not.toBeInTheDocument();
  });

  // ─── Increasing game count ─────────────────────────────────────────────────

  test('should never show confirmation when increasing game count', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent, T);
    const gameState = TestBed.inject(GameStateService);
    const placement = TestBed.inject(PlacementService);

    // Score in game 0 — a game is in progress
    placement.setCurrentDice([3, 0, 0, 0, 2, 0]);
    placement.placeScore('Aces', 0);

    await user.selectOptions(screen.getByTestId('game-count-select'), '3');

    expect(screen.queryByTestId('game-count-confirm')).not.toBeInTheDocument();
    expect(gameState.gameCount()).toBe(3);
  });

  test('should preserve existing scores when increasing game count', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent, T);
    const gameState = TestBed.inject(GameStateService);
    const placement = TestBed.inject(PlacementService);

    placement.setCurrentDice([3, 0, 0, 0, 2, 0]);
    placement.placeScore('Aces', 0);

    await user.selectOptions(screen.getByTestId('game-count-select'), '3');

    expect(gameState.games()).toHaveLength(3);
    expect(gameState.games()[0].columns.ONE.upper.Aces?.value).toBe(3);
  });

  // ─── Decreasing game count with empty trailing games ───────────────────────

  test('should not show confirmation when trailing games are empty', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent, T);
    const placement = TestBed.inject(PlacementService);

    // Score only in game 0; game 1 (the one being removed) is empty
    placement.setCurrentDice([3, 0, 0, 0, 2, 0]);
    placement.placeScore('Aces', 0);

    await user.selectOptions(screen.getByTestId('game-count-select'), '1');

    expect(screen.queryByTestId('game-count-confirm')).not.toBeInTheDocument();
    const gameState = TestBed.inject(GameStateService);
    expect(gameState.gameCount()).toBe(1);
  });

  test('should preserve remaining scores when decreasing past empty trailing games', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent, T);
    const gameState = TestBed.inject(GameStateService);
    const placement = TestBed.inject(PlacementService);

    placement.setCurrentDice([3, 0, 0, 0, 2, 0]);
    placement.placeScore('Aces', 0);

    await user.selectOptions(screen.getByTestId('game-count-select'), '1');

    expect(gameState.games()[0].columns.ONE.upper.Aces?.value).toBe(3);
  });

  // ─── Decreasing game count with scored trailing games ──────────────────────

  test('should show confirmation when a trailing game being removed has scored cells', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent, T);
    const placement = TestBed.inject(PlacementService);

    // Score in game 1 (index 1) — this game will be removed when decreasing to 1
    placement.setCurrentDice([3, 0, 0, 0, 2, 0]);
    placement.placeScore('Aces', 1);

    await user.selectOptions(screen.getByTestId('game-count-select'), '1');

    expect(screen.getByTestId('game-count-confirm')).toBeInTheDocument();
  });

  test('should apply new count when user confirms removal of scored trailing game', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent, T);
    const gameState = TestBed.inject(GameStateService);
    const placement = TestBed.inject(PlacementService);

    placement.setCurrentDice([3, 0, 0, 0, 2, 0]);
    placement.placeScore('Aces', 1); // score in game 1

    await user.selectOptions(screen.getByTestId('game-count-select'), '1');
    await user.click(screen.getByTestId('game-count-confirm'));

    expect(gameState.gameCount()).toBe(1);
    expect(gameState.games()).toHaveLength(1);
    expect(screen.queryByTestId('game-count-confirm')).not.toBeInTheDocument();
  });

  test('should revert selection when user cancels removal of scored trailing game', async () => {
    const user = userEvent.setup();
    await render(GameCountPickerComponent, T);
    const gameState = TestBed.inject(GameStateService);
    const placement = TestBed.inject(PlacementService);

    const originalCount = gameState.gameCount();

    placement.setCurrentDice([3, 0, 0, 0, 2, 0]);
    placement.placeScore('Aces', 1); // score in game 1

    await user.selectOptions(screen.getByTestId('game-count-select'), '1');
    await user.click(screen.getByTestId('game-count-cancel'));

    expect(gameState.gameCount()).toBe(originalCount);
    const options = screen.getAllByRole('option');
    const selected = options.find((o) => (o as HTMLOptionElement).selected);
    expect(selected).toHaveTextContent(String(originalCount));
    expect(screen.queryByTestId('game-count-confirm')).not.toBeInTheDocument();
  });
});
