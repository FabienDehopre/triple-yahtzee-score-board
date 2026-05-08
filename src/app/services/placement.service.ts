import type { DiceSet } from '../models/dice-set.model';
import type { ScoreCategory } from '../models/score-category.model';

import { inject, Injectable } from '@angular/core';

import { UPPER_CATEGORIES } from '../models/game-column.model';
import { nextUnfilledColumn } from '../models/game.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { GameStateService } from './game-state.service';
import { ScoringEngineService } from './scoring-engine.service';
import { UndoService } from './undo.service';

const UPPER_SET = new Set(UPPER_CATEGORIES);

/**
 * Owns the placement operation: setting current dice, resolving the target
 * column (Left-to-Right Fill Rule), computing raw score + Yahtzee Bonus,
 * saving a snapshot for undo, and writing the result via GameStateService.
 */
@Injectable({ providedIn: 'root' })
export class PlacementService {
  readonly #gameState = inject(GameStateService);
  readonly #scoringEngine = inject(ScoringEngineService);
  readonly #undo = inject(UndoService);

  /**
   * Updates the current dice and clears any existing undo snapshot.
   * Clearing the snapshot is placement-coupled: entering new dice ends the
   * previous placement's undo window.
   */
  setCurrentDice(dice: DiceSet): void {
    this.#undo.clearSnapshot();
    this.#gameState.setCurrentDice(dice);
  }

  /**
   * Places the score for category in the next available column of game gameIndex.
   * Columns are filled left-to-right: ONE → TWO → THREE.
   *
   * No-ops when:
   * - no dice are currently set
   * - gameIndex is out of bounds
   * - all three columns are already filled for this category
   */
  placeScore(category: ScoreCategory, gameIndex: number): void {
    const dice = this.#gameState.currentDice();
    if (!dice) return;

    const games = this.#gameState.games();
    if (gameIndex < 0 || gameIndex >= games.length) return;

    const game = games[gameIndex];
    const column = nextUnfilledColumn(game, category);
    if (!column) return;

    this.#undo.saveSnapshot(games, category);

    const rawScore = this.#scoringEngine.computeScore(dice, category);
    const sectionKey = UPPER_SET.has(category) ? 'upper' : 'lower';

    const yahtzeeCell = game.columns[column].lower[SCORE_CATEGORY.yahtzee];
    const bonusEarned =
      yahtzeeCell === undefined
        ? 0
        : this.#scoringEngine.computeYahtzeeBonus(dice, yahtzeeCell.value);

    this.#gameState.updateGameAt(gameIndex, (g) => ({
      ...g,
      columns: {
        ...g.columns,
        [column]: {
          ...g.columns[column],
          yahtzeeBonus: (g.columns[column].yahtzeeBonus ?? 0) + bonusEarned,
          [sectionKey]: {
            ...g.columns[column][sectionKey],
            [category]: { value: rawScore, isScratched: rawScore === 0 },
          },
        },
      },
    }));

    this.#gameState.setCurrentDice(undefined);
  }
}
