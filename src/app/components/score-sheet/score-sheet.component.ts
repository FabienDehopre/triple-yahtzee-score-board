import type { GameColumn } from '../../models/game-column.model';
import type { ScoreCategory } from '../../models/score-category.model';

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { COLUMN_ORDER, LOWER_CATEGORIES, UPPER_CATEGORIES } from '../../models/game-column.model';
import { nextUnfilledColumn } from '../../models/game.model';
import { CATEGORY_HINT_KEYS, CATEGORY_LABEL_KEYS, SCORE_SHEET_COLUMN_KEYS } from '../../models/i18n-keys';
import { ScoringEngineService } from '../../services/scoring-engine.service';
import { SessionStore } from '../../services/session.store';

const UPPER_SET = new Set<ScoreCategory>(UPPER_CATEGORIES);

@Component({
  selector: 'app-score-sheet',
  imports: [TranslocoPipe],
  templateUrl: './score-sheet.component.html',
  styleUrl: './score-sheet.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreSheetComponent {
  readonly #sessionStore = inject(SessionStore);
  readonly #scoringEngine = inject(ScoringEngineService);

  protected readonly games = this.#sessionStore.games;
  protected readonly allStats = this.#sessionStore.columnStats;
  protected readonly currentDice = this.#sessionStore.currentDice;
  protected readonly grandTotal = this.#sessionStore.grandTotal;
  protected readonly activeGameIndex = this.#sessionStore.activeGameIndex;

  protected readonly totalColumns = computed(() => this.games().length * COLUMN_ORDER.length);

  protected readonly upperCategories = UPPER_CATEGORIES;
  protected readonly lowerCategories = LOWER_CATEGORIES;
  protected readonly columnOrder = COLUMN_ORDER;

  protected readonly columnLabelKeys = SCORE_SHEET_COLUMN_KEYS;
  protected readonly categoryLabelKeys = CATEGORY_LABEL_KEYS;
  protected readonly categoryHintKeys = CATEGORY_HINT_KEYS;

  protected getCellDisplayValue(gameIndex: number, column: GameColumn, category: ScoreCategory): number | undefined {
    const game = this.games()[gameIndex];
    const isUpper = UPPER_SET.has(category);
    const section = isUpper ? game.columns[column].upper : game.columns[column].lower;
    const cell = section[category];
    if (cell === undefined) return undefined;
    return this.#scoringEngine.applyMultiplier(cell.value, column);
  }

  protected isAvailableCell(gameIndex: number, column: GameColumn, category: ScoreCategory): boolean {
    if (!this.currentDice()) return false;
    return nextUnfilledColumn(this.games()[gameIndex], category) === column;
  }

  protected isCategoryAvailable(category: ScoreCategory): boolean {
    if (!this.currentDice()) return false;
    return this.games().some((game) => nextUnfilledColumn(game, category) !== undefined);
  }

  protected getPotentialDisplayScore(column: GameColumn, category: ScoreCategory): number {
    const dice = this.currentDice();
    if (!dice) return 0;
    return this.#scoringEngine.computeMultipliedScore(dice, category, column);
  }

  protected onCellClick(category: ScoreCategory, gameIndex: number): void {
    this.#sessionStore.placeScore(category, gameIndex);
  }

  protected setActiveGame(index: number): void {
    this.#sessionStore.setActiveGameIndex(index);
  }
}
