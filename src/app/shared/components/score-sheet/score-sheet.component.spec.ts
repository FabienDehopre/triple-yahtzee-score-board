import type { DiceSet } from '../../models';

import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { GAME_COLUMN } from '../../models/game-column.model';
import { SCORE_CATEGORY } from '../../models/score-category.model';
import { GameStateService } from '../../services/game-state.service';
import { ScoreSheetComponent } from './score-sheet.component';

describe('scoreSheetComponent', () => {
  // ─── Render ──────────────────────────────────────────────────────────────────

  test('should render upper section header', async () => {
    await render(ScoreSheetComponent);
    expect(screen.getByText('UPPER SECTION')).toBeInTheDocument();
  });

  test('should render lower section header', async () => {
    await render(ScoreSheetComponent);
    expect(screen.getByText('LOWER SECTION')).toBeInTheDocument();
  });

  test('should render all three column headers', async () => {
    await render(ScoreSheetComponent);
    expect(screen.getByText('ONE')).toBeInTheDocument();
    expect(screen.getByText('TWO')).toBeInTheDocument();
    expect(screen.getByText('THREE')).toBeInTheDocument();
  });

  test('should render all upper section category rows', async () => {
    await render(ScoreSheetComponent);
    for (const label of ['Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  test('should render all lower section category rows', async () => {
    await render(ScoreSheetComponent);
    for (const label of ['3 of a kind', '4 of a kind', 'Full House', 'Sm. Straight', 'Lg. Straight', 'YAHTZEE', 'Chance']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  test('should render total rows', async () => {
    await render(ScoreSheetComponent);
    expect(screen.getByText('TOTAL SCORE')).toBeInTheDocument();
    expect(screen.getByText('BONUS')).toBeInTheDocument();
    expect(screen.getAllByText('Lower Section Total')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Combined Total')[0]).toBeInTheDocument();
  });

  // ─── Potential scores ─────────────────────────────────────────────────────────

  test('should show potential scores for available rows when dice are set', async () => {
    const { fixture } = await render(ScoreSheetComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    // Five 1s: aces raw = 5
    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    gameState.setCurrentDice(dice);
    fixture.detectChanges();

    // Column ONE (×1): potential for Aces = 5 × 1 = 5
    const acesCells = screen.getAllByText('5');
    expect(acesCells.length).toBeGreaterThan(0);
  });

  // ─── Score placement ──────────────────────────────────────────────────────────

  test('should place score when an available row is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ScoreSheetComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    gameState.setCurrentDice(dice);
    fixture.detectChanges();

    await user.click(screen.getByText('Aces'));
    fixture.detectChanges();

    const game = gameState.games()[0];
    expect(game.columns[GAME_COLUMN.one].upper[SCORE_CATEGORY.aces]?.value).toBe(5);
  });

  // ─── Column multipliers ───────────────────────────────────────────────────────

  test('should display score × column multiplier for column TWO', async () => {
    const { fixture } = await render(ScoreSheetComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    // Fill column ONE for Aces, then column TWO
    const dice: DiceSet = [5, 0, 0, 0, 0, 0];
    gameState.setCurrentDice(dice);
    gameState.placeScore(SCORE_CATEGORY.aces, 0); // ONE: value 5, display 5
    gameState.placeScore(SCORE_CATEGORY.aces, 0); // TWO: value 5, display 10
    fixture.detectChanges();

    // Column TWO displays 10 (raw 5 × multiplier 2)
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
  });

  // ─── Upper bonus ──────────────────────────────────────────────────────────────

  test('should show upper bonus when upper raw total reaches 63', async () => {
    const { fixture } = await render(ScoreSheetComponent);
    const gameState = fixture.debugElement.injector.get(GameStateService);

    // 8 (fours) + 25 (fives) + 30 (sixes) = 63 → bonus
    gameState.setCurrentDice([0, 0, 0, 2, 0, 0]);
    gameState.placeScore(SCORE_CATEGORY.fours, 0);

    gameState.setCurrentDice([0, 0, 0, 0, 5, 0]);
    gameState.placeScore(SCORE_CATEGORY.fives, 0);

    gameState.setCurrentDice([0, 0, 0, 0, 0, 5]);
    gameState.placeScore(SCORE_CATEGORY.sixes, 0);

    fixture.detectChanges();

    // Bonus = 35 × 1 = 35 displayed in column ONE
    expect(screen.getByText('35')).toBeInTheDocument();
  });
});
