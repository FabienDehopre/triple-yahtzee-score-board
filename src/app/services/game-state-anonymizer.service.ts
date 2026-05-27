import type { Game } from '../models/game.model';

import { Injectable } from '@angular/core';

export interface AnonymizedGameState {
  anonymizedGames: Game[];
  diagnostics: {
    appVersion: string;
    locale: string;
    userAgent: string;
  };
}

/**
 * Produces a privacy-safe snapshot of the current game state for bug reports.
 * Replaces all potentially identifying fields (game IDs, timestamps) with
 * positional placeholders while preserving all scoring data intact.
 */
@Injectable({ providedIn: 'root' })
export class GameStateAnonymizerService {
  anonymize(games: Game[], locale = 'en'): AnonymizedGameState {
    const anonymizedGames: Game[] = games.map((game, index) => ({
      ...game,
      id: `game-${index + 1}`,
      createdAt: 'anonymized',
      columns: structuredClone(game.columns),
    }));

    return {
      anonymizedGames,
      diagnostics: {
        appVersion: import.meta.env.NG_APP_BUILD_ID ?? 'unknown',
        locale,
        userAgent: typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent,
      },
    };
  }
}
