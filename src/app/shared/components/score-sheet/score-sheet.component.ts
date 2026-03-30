import type { GameColumn } from '../../models/game-column.model';
import type { ScoreCategory } from '../../models/score-category.model';

import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { COLUMN_MULTIPLIER, GAME_COLUMN, UPPER_CATEGORIES } from '../../models/game-column.model';
import { SCORE_CATEGORY } from '../../models/score-category.model';
import { GameStateService } from '../../services/game-state.service';
import { ScoringEngineService } from '../../services/scoring-engine.service';

interface CategoryMeta {
  category: ScoreCategory;
  label: string;
  hint: string;
}

const UPPER_META: CategoryMeta[] = [
  { category: SCORE_CATEGORY.aces, label: 'Aces', hint: 'Count and Add Only Aces' },
  { category: SCORE_CATEGORY.twos, label: 'Twos', hint: 'Count and Add Only Twos' },
  { category: SCORE_CATEGORY.threes, label: 'Threes', hint: 'Count and Add Only Threes' },
  { category: SCORE_CATEGORY.fours, label: 'Fours', hint: 'Count and Add Only Fours' },
  { category: SCORE_CATEGORY.fives, label: 'Fives', hint: 'Count and Add Only Fives' },
  { category: SCORE_CATEGORY.sixes, label: 'Sixes', hint: 'Count and Add Only Sixes' },
];

const LOWER_META: CategoryMeta[] = [
  { category: SCORE_CATEGORY.threeOfAKind, label: '3 of a kind', hint: 'Add Total Of All Dice' },
  { category: SCORE_CATEGORY.fourOfAKind, label: '4 of a kind', hint: 'Add Total Of All Dice' },
  { category: SCORE_CATEGORY.fullHouse, label: 'Full House', hint: 'SCORE 25' },
  { category: SCORE_CATEGORY.smallStraight, label: 'Sm. Straight', hint: 'SCORE 30' },
  { category: SCORE_CATEGORY.largeStraight, label: 'Lg. Straight', hint: 'SCORE 40' },
  { category: SCORE_CATEGORY.yahtzee, label: 'YAHTZEE', hint: 'SCORE 50' },
  { category: SCORE_CATEGORY.chance, label: 'Chance', hint: 'Score Total Of All 5 Dice' },
];

const ORDERED_COLUMNS: GameColumn[] = [GAME_COLUMN.one, GAME_COLUMN.two, GAME_COLUMN.three];

const COLUMN_LABELS: Record<GameColumn, string> = {
  [GAME_COLUMN.one]: 'ONE',
  [GAME_COLUMN.two]: 'TWO',
  [GAME_COLUMN.three]: 'THREE',
};

@Component({
  selector: 'app-score-sheet',
  templateUrl: './score-sheet.component.html',
  styleUrl: './score-sheet.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreSheetComponent {
  readonly #gameState = inject(GameStateService);
  readonly #scoringEngine = inject(ScoringEngineService);

  protected readonly upperMeta = UPPER_META;
  protected readonly lowerMeta = LOWER_META;
  protected readonly columns = ORDERED_COLUMNS;
  protected readonly columnLabels = COLUMN_LABELS;
  protected readonly columnMultiplier = COLUMN_MULTIPLIER;

  protected readonly game = computed(() => this.#gameState.games()[this.gameIndex()]);
  protected readonly stats = computed(() => this.#gameState.columnStats()[this.gameIndex()]);
  protected readonly dice = this.#gameState.currentDice;

  readonly gameIndex = input(0);

  /** Returns true when the row for `category` has at least one unfilled column. */
  protected isAvailable(category: ScoreCategory): boolean {
    return this.nextColumn(category) !== undefined;
  }

  /** Returns the next unfilled column for `category` (left-to-right), or undefined. */
  protected nextColumn(category: ScoreCategory): GameColumn | undefined {
    const game = this.game();
    const section = UPPER_CATEGORIES.includes(category) ? 'upper' : 'lower';
    return ORDERED_COLUMNS.find((col) => game.columns[col][section][category] === undefined);
  }

  /** Returns the raw stored score for a cell, or undefined if not yet placed. */
  protected getRawScore(col: GameColumn, category: ScoreCategory): number | undefined {
    const game = this.game();
    const section = UPPER_CATEGORIES.includes(category) ? 'upper' : 'lower';
    return game.columns[col][section][category]?.value ?? undefined;
  }

  /** Returns the displayed score (raw × multiplier), or undefined if unfilled. */
  protected getDisplayScore(col: GameColumn, category: ScoreCategory): number | undefined {
    const raw = this.getRawScore(col, category);
    if (raw === undefined) return undefined;
    return raw * COLUMN_MULTIPLIER[col];
  }

  /**
   * Returns the potential score for an unfilled cell (current dice × multiplier),
   * or undefined when no dice are set or the cell is already filled.
   */
  protected getPotentialScore(col: GameColumn, category: ScoreCategory): number | undefined {
    const dice = this.dice();
    if (!dice) return undefined;
    if (this.getRawScore(col, category) !== undefined) return undefined;
    const raw = this.#scoringEngine.computeScore(dice, category);
    return raw * COLUMN_MULTIPLIER[col];
  }

  /** Handles a row click: places score in the next available column. */
  protected onRowClick(category: ScoreCategory): void {
    if (!this.isAvailable(category) || !this.dice()) return;
    this.#gameState.placeScore(category, this.gameIndex());
  }
}
