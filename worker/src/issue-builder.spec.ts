import type { ReportPayload } from '../src/schema';

import { describe, expect, test } from 'vitest';

import { buildIssueBody, buildIssueTitle } from '../src/issue-builder';

const BASE_PAYLOAD: ReportPayload = {
  type: 'bug',
  title: 'Something broke',
  description: 'When I click the button, the app crashes.',
  turnstileToken: 'fake-token',
  gameState: undefined,
};

describe('buildIssueTitle', () => {
  test('prefixes bug reports with [Bug]', () => {
    expect(buildIssueTitle(BASE_PAYLOAD)).toBe('[Bug] Something broke');
  });

  test('prefixes enhancements with [Enhancement]', () => {
    expect(buildIssueTitle({ ...BASE_PAYLOAD, type: 'enhancement' })).toBe(
      '[Enhancement] Something broke'
    );
  });
});

describe('buildIssueBody', () => {
  test('includes the description', () => {
    const body = buildIssueBody(BASE_PAYLOAD);
    expect(body).toContain('When I click the button, the app crashes.');
  });

  test('includes bug label for bug type', () => {
    expect(buildIssueBody(BASE_PAYLOAD)).toContain('🐛 Bug Report');
  });

  test('includes enhancement label for enhancement type', () => {
    expect(buildIssueBody({ ...BASE_PAYLOAD, type: 'enhancement' })).toContain(
      '✨ Enhancement Request'
    );
  });

  test('includes contact when provided', () => {
    const body = buildIssueBody({ ...BASE_PAYLOAD, contact: 'user@example.com' });
    expect(body).toContain('user@example.com');
  });

  test('omits contact section when not provided', () => {
    const body = buildIssueBody(BASE_PAYLOAD);
    expect(body).not.toContain('Contact:');
  });

  test('includes game state in a details block when provided', () => {
    const body = buildIssueBody({ ...BASE_PAYLOAD, gameState: { score: 42 } });
    expect(body).toContain('<details>');
    expect(body).toContain('"score": 42');
  });

  test('omits game state section when not provided', () => {
    const body = buildIssueBody(BASE_PAYLOAD);
    expect(body).not.toContain('<details>');
  });
});
