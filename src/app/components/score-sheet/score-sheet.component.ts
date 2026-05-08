import type { GameColumn } from '../../models/game-column.model';
import type { ScoreCategory } from '../../models/score-category.model';

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { COLUMN_ORDER, LOWER_CATEGORIES, UPPER_CATEGORIES } from '../../models/game-column.model';
import { nextUnfilledColumn } from '../../models/game.model';
import { CATEGORY_HINT_KEYS, CATEGORY_LABEL_KEYS, SCORE_SHEET_COLUMN_KEYS } from '../../models/i18n-keys';
import { GameStateService } from '../../services/game-state.service';
import { PlacementService } from '../../services/placement.service';
import { ScoringEngineService } from '../../services/scoring-engine.service';

/** Fast lookup set for upper-section categories. */
const UPPER_SET = new Set<ScoreCategory>(UPPER_CATEGORIES);

@Component({
  selector: 'app-score-sheet',
  imports: [TranslocoPipe],
  templateUrl: './score-sheet.component.html',
  styleUrl: './score-sheet.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreSheetComponent {
  readonly #gameState = inject(GameStateService);
  readonly #placement = inject(PlacementService);
  readonly #scoringEngine = inject(ScoringEngineService);

  protected readonly games = this.#gameState.games;
  protected readonly allStats = this.#gameState.columnStats;
  protected readonly currentDice = this.#gameState.currentDice;
  protected readonly grandTotal = this.#gameState.grandTotal;

  /** Total number of data columns: games × 3 columns per game. */
  protected readonly totalColumns = computed(() => this.games().length * COLUMN_ORDER.length);

  /** Index of the game currently shown in the mobile card layout, driven by game-state service. */
  protected readonly activeGameIndex = this.#gameState.activeGameIndex;

  protected readonly upperCategories = UPPER_CATEGORIES;
  protected readonly lowerCategories = LOWER_CATEGORIES;
  protected readonly columnOrder = COLUMN_ORDER;

  protected readonly columnLabelKeys = SCORE_SHEET_COLUMN_KEYS;
  protected readonly categoryLabelKeys = CATEGORY_LABEL_KEYS;
  protected readonly categoryHintKeys = CATEGORY_HINT_KEYS;

  /**
   * Returns the displayed score for a filled cell: raw value × column multiplier.
   * Returns undefined when the cell has not been scored yet.
   */
  protected getCellDisplayValue(gameIndex: number, column: GameColumn, category: ScoreCategory): number | undefined {
    const game = this.games()[gameIndex];
    const isUpper = UPPER_SET.has(category);
    const section = isUpper ? game.columns[column].upper : game.columns[column].lower;
    const cell = section[category];
    if (cell === undefined) return undefined;
    return this.#scoringEngine.applyMultiplier(cell.value, column);
  }

  /**
   * Returns true when dice are set AND column is the next unfilled column
   * for this category in the given game (left-to-right order).
   */
  protected isAvailableCell(gameIndex: number, column: GameColumn, category: ScoreCategory): boolean {
    if (!this.currentDice()) return false;
    return nextUnfilledColumn(this.games()[gameIndex], category) === column;
  }

  /** Returns true when dice are set AND the category has at least one unfilled column in any game. */
  protected isCategoryAvailable(category: ScoreCategory): boolean {
    if (!this.currentDice()) return false;
    return this.games().some((game) => nextUnfilledColumn(game, category) !== undefined);
  }

  /**
   * Returns the potential score to display in an available cell:
   * raw computed score × column multiplier.
   */
  protected getPotentialDisplayScore(column: GameColumn, category: ScoreCategory): number {
    const dice = this.currentDice();
    if (!dice) return 0;
    return this.#scoringEngine.computeMultipliedScore(dice, category, column);
  }

  /** Places the score for category in the next available column of the given game. */
  protected onCellClick(category: ScoreCategory, gameIndex: number): void {
    this.#placement.placeScore(category, gameIndex);
  }

  /** Switches the active game shown in the mobile card layout. */
  protected setActiveGame(index: number): void {
    this.#gameState.setActiveGameIndex(index);
  }
}
