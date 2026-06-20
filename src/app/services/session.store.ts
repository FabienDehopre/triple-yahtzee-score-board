import type { ColumnStats } from '../models/column-stats.model';
import type { DiceSet } from '../models/dice-set.model';
import type { GameColumn } from '../models/game-column.model';
import type { Game } from '../models/game.model';
import type { ScoreCategory } from '../models/score-category.model';

import { withStorageSync } from '@angular-architects/ngrx-toolkit';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { addYahtzeeBonus, eachCell, readCell, writeCell } from '../models/game-cells';
import { COLUMN_ORDER, GAME_COLUMN } from '../models/game-column.model';
import { nextUnfilledColumn } from '../models/game.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { ScoringEngineService } from './scoring-engine.service';
import { SuggestionEngineService } from './suggestion-engine.service';
import { UndoStore } from './undo.store';

const PERSISTENCE_KEY = 'triple-yahtzee-state';
const DEFAULT_GAME_COUNT = 2;

function createEmptyGame(): Game {
  return {
    id: crypto.randomUUID(),
    columns: {
      [GAME_COLUMN.one]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.two]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.three]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
    },
    createdAt: new Date().toISOString(),
  };
}

interface SessionState {
  games: Game[];
  gameCount: number;
  currentDice: DiceSet | undefined;
  activeGameIndex: number;
}

interface PersistedState {
  games: Game[];
  gameCount?: number;
}

function isValidPersistedState(value: unknown): value is PersistedState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'games' in value &&
    Array.isArray((value as PersistedState).games) &&
    (value as PersistedState).games.length > 0
  );
}

function hasAnyScore(games: Game[], fromIndex = 0): boolean {
  for (let i = fromIndex; i < games.length; i++) {
    for (const { cell } of eachCell(games[i])) {
      if (cell !== undefined) return true;
    }
  }
  return false;
}

function allCellsFilled(games: Game[]): boolean {
  if (games.length === 0) return false;
  for (const game of games) {
    for (const { cell } of eachCell(game)) {
      if (cell === undefined) return false;
    }
  }
  return true;
}

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState<SessionState>({
    games: Array.from({ length: DEFAULT_GAME_COUNT }, () => createEmptyGame()),
    gameCount: DEFAULT_GAME_COUNT,
    currentDice: undefined,
    activeGameIndex: 0,
  }),
  withStorageSync({
    key: PERSISTENCE_KEY,
    select: (state: SessionState) => ({ games: state.games, gameCount: state.gameCount }),
    parse: (str: string): SessionState => {
      try {
        const raw = JSON.parse(str) as unknown;
        if (!isValidPersistedState(raw)) return {} as unknown as SessionState;
        const gameCount =
          typeof raw.gameCount === 'number' && raw.gameCount > 0
            ? raw.gameCount
            : raw.games.length;
        return { games: raw.games, gameCount } as unknown as SessionState;
      } catch {
        return {} as unknown as SessionState;
      }
    },
  }),
  withComputed((store) => {
    const scoringEngine = inject(ScoringEngineService);
    const suggestionEngine = inject(SuggestionEngineService);

    const columnStats = computed(() =>
      store.games().map(
        (game) =>
          Object.fromEntries(
            COLUMN_ORDER.map((col) => [col, scoringEngine.computeColumnStats(game, col)])
          ) as Record<GameColumn, ColumnStats>
      )
    );

    const grandTotal = computed(() => {
      let total = 0;
      for (const gameStats of columnStats()) {
        for (const col of COLUMN_ORDER) {
          total += gameStats[col].combinedTotal;
        }
      }
      return total;
    });

    const isAnyGameInProgress = computed(() => hasAnyScore(store.games()));

    const isGameOver = computed(() => allCellsFilled(store.games()));

    const suggestions = computed(() => {
      const dice = store.currentDice();
      if (!dice) return [];
      const game = store.games()[store.activeGameIndex()];
      return suggestionEngine.computeSuggestions(dice, game);
    });

    return { columnStats, grandTotal, isAnyGameInProgress, isGameOver, suggestions };
  }),
  withMethods((store) => {
    const undoStore = inject(UndoStore);
    const scoringEngine = inject(ScoringEngineService);

    return {
      setCurrentDice(dice: DiceSet | undefined): void {
        undoStore.clearSnapshot();
        patchState(store, { currentDice: dice });
      },

      placeScore(category: ScoreCategory, gameIndex: number): void {
        const dice = store.currentDice();
        if (!dice) return;

        const games = store.games();
        if (gameIndex < 0 || gameIndex >= games.length) return;

        const game = games[gameIndex];
        const column = nextUnfilledColumn(game, category);
        if (!column) return;

        undoStore.saveSnapshot(games, category);

        const rawScore = scoringEngine.computeScore(dice, category);

        const yahtzeeCell = readCell(game, column, SCORE_CATEGORY.yahtzee);
        const bonusEarned =
          yahtzeeCell === undefined
            ? 0
            : scoringEngine.computeYahtzeeBonus(dice, yahtzeeCell.value);

        let updated = writeCell(game, column, category, { value: rawScore, isScratched: rawScore === 0 });
        if (bonusEarned !== 0) {
          updated = addYahtzeeBonus(updated, column, bonusEarned);
        }

        patchState(store, {
          games: games.map((g, i) => (i === gameIndex ? updated : g)),
          currentDice: undefined,
        });
      },

      undo(): void {
        const snap = undoStore.getSnapshot();
        if (!snap) return;
        patchState(store, { games: snap.games });
        undoStore.clearSnapshot();
      },

      newGame(): void {
        patchState(store, {
          games: Array.from({ length: store.gameCount() }, () => createEmptyGame()),
          currentDice: undefined,
          activeGameIndex: 0,
        });
      },

      setGameCount(count: number): void {
        const current = store.games();
        let games: Game[];
        if (count > current.length) {
          games = [
            ...current,
            ...Array.from({ length: count - current.length }, () => createEmptyGame()),
          ];
        } else if (count < current.length) {
          games = current.slice(0, count);
        } else {
          games = current;
        }

        const activeGameIndex =
          store.activeGameIndex() >= count ? count - 1 : store.activeGameIndex();

        patchState(store, { gameCount: count, games, currentDice: undefined, activeGameIndex });
      },

      setActiveGameIndex(index: number): void {
        patchState(store, { activeGameIndex: index });
      },

      hasScoreInGamesFrom: (startIndex: number): boolean => hasAnyScore(store.games(), startIndex),
    };
  })
);

export type { ColumnStats } from '../models/column-stats.model';
