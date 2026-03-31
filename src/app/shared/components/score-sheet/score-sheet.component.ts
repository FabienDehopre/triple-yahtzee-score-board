import type { GameColumn, ScoreCategory } from '../../models';

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import {
  COLUMN_MULTIPLIER,
  COLUMN_ORDER,
  GAME_COLUMN,
  LOWER_CATEGORIES,
  SCORE_CATEGORY, UPPER_CATEGORIES
} from '../../models';
import { GameStateService } from '../../services/game-state.service';
import { ScoringEngineService } from '../../services/scoring-engine.service';

/** Fast lookup set for upper-section categories. */
const UPPER_SET = new Set<ScoreCategory>(UPPER_CATEGORIES);

@Component({
  selector: 'app-score-sheet',
  templateUrl: './score-sheet.component.html',
  styleUrl: './score-sheet.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreSheetComponent {
  readonly #gameState = inject(GameStateService);
  readonly #scoringEngine = inject(ScoringEngineService);

  protected readonly game = computed(() => this.#gameState.games()[0]);
  protected readonly stats = computed(() => this.#gameState.columnStats()[0]);
  protected readonly currentDice = this.#gameState.currentDice;
  protected readonly grandTotal = this.#gameState.grandTotal;

  protected readonly upperCategories = UPPER_CATEGORIES;
  protected readonly lowerCategories = LOWER_CATEGORIES;
  protected readonly columnOrder = COLUMN_ORDER;
  protected readonly columnMultiplier = COLUMN_MULTIPLIER;

  protected readonly columnLabels: Record<GameColumn, string> = {
    [GAME_COLUMN.one]: 'ONE \u00D71',
    [GAME_COLUMN.two]: 'TWO \u00D72',
    [GAME_COLUMN.three]: 'THREE \u00D73',
  };

  protected readonly categoryLabels: Record<ScoreCategory, string> = {
    [SCORE_CATEGORY.aces]: 'Aces',
    [SCORE_CATEGORY.twos]: 'Twos',
    [SCORE_CATEGORY.threes]: 'Threes',
    [SCORE_CATEGORY.fours]: 'Fours',
    [SCORE_CATEGORY.fives]: 'Fives',
    [SCORE_CATEGORY.sixes]: 'Sixes',
    [SCORE_CATEGORY.threeOfAKind]: '3 of a Kind',
    [SCORE_CATEGORY.fourOfAKind]: '4 of a Kind',
    [SCORE_CATEGORY.fullHouse]: 'Full House',
    [SCORE_CATEGORY.smallStraight]: 'Sm. Straight',
    [SCORE_CATEGORY.largeStraight]: 'Lg. Straight',
    [SCORE_CATEGORY.yahtzee]: 'YAHTZEE',
    [SCORE_CATEGORY.chance]: 'Chance',
  };

  protected readonly categoryHints: Record<ScoreCategory, string> = {
    [SCORE_CATEGORY.aces]: '= 1',
    [SCORE_CATEGORY.twos]: '= 2',
    [SCORE_CATEGORY.threes]: '= 3',
    [SCORE_CATEGORY.fours]: '= 4',
    [SCORE_CATEGORY.fives]: '= 5',
    [SCORE_CATEGORY.sixes]: '= 6',
    [SCORE_CATEGORY.threeOfAKind]: 'Add all dice',
    [SCORE_CATEGORY.fourOfAKind]: 'Add all dice',
    [SCORE_CATEGORY.fullHouse]: 'Score 25',
    [SCORE_CATEGORY.smallStraight]: 'Score 30',
    [SCORE_CATEGORY.largeStraight]: 'Score 40',
    [SCORE_CATEGORY.yahtzee]: 'Score 50',
    [SCORE_CATEGORY.chance]: 'Add all dice',
  };

  /**
   * Returns the displayed score for a filled cell: raw value x column multiplier.
   * Returns undefined when the cell has not been scored yet.
   */
  protected getCellDisplayValue(column: GameColumn, category: ScoreCategory): number | undefined {
    const game = this.game();
    const isUpper = UPPER_SET.has(category);
    const section = isUpper ? game.columns[column].upper : game.columns[column].lower;
    const cell = section[category];
    if (cell === undefined) return undefined;
    return (cell.value ?? 0) * COLUMN_MULTIPLIER[column];
  }

  /**
   * Returns true when dice are set AND column is the next unfilled column
   * for this category (left-to-right order).
   */
  protected isAvailableCell(column: GameColumn, category: ScoreCategory): boolean {
    if (!this.currentDice()) return false;
    const game = this.game();
    const isUpper = UPPER_SET.has(category);
    for (const col of COLUMN_ORDER) {
      const section = isUpper ? game.columns[col].upper : game.columns[col].lower;
      if (!section[category]) return col === column;
    }
    return false;
  }

  /** Returns true when dice are set AND the category has at least one unfilled column. */
  protected isCategoryAvailable(category: ScoreCategory): boolean {
    if (!this.currentDice()) return false;
    const game = this.game();
    const isUpper = UPPER_SET.has(category);
    for (const col of COLUMN_ORDER) {
      const section = isUpper ? game.columns[col].upper : game.columns[col].lower;
      if (!section[category]) return true;
    }
    return false;
  }

  /**
   * Returns the potential score to display in an available cell:
   * raw computed score x column multiplier.
   */
  protected getPotentialDisplayScore(column: GameColumn, category: ScoreCategory): number {
    const dice = this.currentDice();
    if (!dice) return 0;
    return this.#scoringEngine.computeScore(dice, category) * COLUMN_MULTIPLIER[column];
  }

  /** Places the score for category in the next available column of game 0. */
  protected onCellClick(category: ScoreCategory): void {
    this.#gameState.placeScore(category, 0);
  }
}
