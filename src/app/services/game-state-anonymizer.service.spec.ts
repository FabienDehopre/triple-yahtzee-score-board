import type { Game } from '../models/game.model';

import { TestBed } from '@angular/core/testing';

import { GAME_COLUMN } from '../models/game-column.model';
import { SCORE_CATEGORY } from '../models/score-category.model';
import { GameStateAnonymizerService } from './game-state-anonymizer.service';

function makeGame(id: string, createdAt = '2025-01-01T00:00:00.000Z'): Game {
  return {
    id,
    createdAt,
    columns: {
      [GAME_COLUMN.one]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.two]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.three]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
    },
  };
}

function makeGameWithScores(id: string): Game {
  return {
    id,
    createdAt: '2025-06-15T10:30:00.000Z',
    columns: {
      [GAME_COLUMN.one]: {
        upper: { [SCORE_CATEGORY.aces]: { value: 3, isScratched: false } },
        lower: { [SCORE_CATEGORY.yahtzee]: { value: 50, isScratched: false } },
        yahtzeeBonus: 100,
      },
      [GAME_COLUMN.two]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
      [GAME_COLUMN.three]: { upper: {}, lower: {}, yahtzeeBonus: 0 },
    },
  };
}

describe('gameStateAnonymizerService', () => {
  let service: GameStateAnonymizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateAnonymizerService);
  });

  describe('anonymize', () => {
    test('replaces each game id with a positional placeholder', () => {
      const games = [makeGame('real-uuid-1'), makeGame('real-uuid-2')];
      const { anonymizedGames } = service.anonymize(games);
      expect(anonymizedGames[0].id).toBe('game-1');
      expect(anonymizedGames[1].id).toBe('game-2');
    });

    test('no original game id remains in the output', () => {
      const games = [makeGame('sensitive-uuid-abc'), makeGame('sensitive-uuid-def')];
      const { anonymizedGames } = service.anonymize(games);
      const json = JSON.stringify(anonymizedGames);
      expect(json).not.toContain('sensitive-uuid-abc');
      expect(json).not.toContain('sensitive-uuid-def');
    });

    test('replaces createdAt with a fixed placeholder', () => {
      const games = [makeGame('id1', '2025-06-15T10:30:00.000Z')];
      const { anonymizedGames } = service.anonymize(games);
      expect(anonymizedGames[0].createdAt).toBe('anonymized');
    });

    test('preserves all scores, yahtzeeBonus, and isScratched flags', () => {
      const games = [makeGameWithScores('real-uuid')];
      const { anonymizedGames } = service.anonymize(games);
      const col = anonymizedGames[0].columns[GAME_COLUMN.one];
      expect(col.upper[SCORE_CATEGORY.aces]).toEqual({ value: 3, isScratched: false });
      expect(col.lower[SCORE_CATEGORY.yahtzee]).toEqual({ value: 50, isScratched: false });
      expect(col.yahtzeeBonus).toBe(100);
    });

    test('does not mutate the original games array', () => {
      const games = [makeGame('original-id')];
      service.anonymize(games);
      expect(games[0].id).toBe('original-id');
    });

    test('handles empty games array', () => {
      const { anonymizedGames } = service.anonymize([]);
      expect(anonymizedGames).toEqual([]);
    });
  });

  describe('buildDiagnostics', () => {
    test('includes app version string', () => {
      const { diagnostics } = service.anonymize([makeGame('id1')]);
      expect(diagnostics.appVersion).toMatch(/^\d+\.\d+\.\d+/);
    });

    test('includes locale', () => {
      const { diagnostics } = service.anonymize([makeGame('id1')], 'fr');
      expect(diagnostics.locale).toBe('fr');
    });

    test('defaults locale to "en" when not provided', () => {
      const { diagnostics } = service.anonymize([makeGame('id1')]);
      expect(diagnostics.locale).toBe('en');
    });
  });
});
