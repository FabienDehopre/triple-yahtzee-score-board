import { describe, expect, test } from 'vitest';

import { reportPayloadSchema } from '../src/schema';

describe('reportPayloadSchema', () => {
  const validPayload = {
    type: 'bug',
    title: 'A title',
    description: 'A sufficiently long description here.',
    turnstileToken: 'token123',
    gameState: null,
  };

  test('accepts a valid bug payload', () => {
    expect(reportPayloadSchema.safeParse(validPayload).success).toBeTruthy();
  });

  test('accepts a valid enhancement payload', () => {
    const result = reportPayloadSchema.safeParse({ ...validPayload, type: 'enhancement' });
    expect(result.success).toBeTruthy();
  });

  test('rejects invalid type', () => {
    const result = reportPayloadSchema.safeParse({ ...validPayload, type: 'feature' });
    expect(result.success).toBeFalsy();
  });

  test('rejects empty title', () => {
    const result = reportPayloadSchema.safeParse({ ...validPayload, title: '' });
    expect(result.success).toBeFalsy();
  });

  test('rejects too-short description', () => {
    const result = reportPayloadSchema.safeParse({ ...validPayload, description: 'short' });
    expect(result.success).toBeFalsy();
  });

  test('rejects missing turnstileToken', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { turnstileToken: _turnstileToken, ...rest } = validPayload;
    const result = reportPayloadSchema.safeParse(rest);
    expect(result.success).toBeFalsy();
  });

  test('accepts payload without contact (optional)', () => {
    const result = reportPayloadSchema.safeParse(validPayload);
    expect(result.success).toBeTruthy();
  });

  test('accepts payload with contact', () => {
    const result = reportPayloadSchema.safeParse({ ...validPayload, contact: 'user@x.com' });
    expect(result.success).toBeTruthy();
  });
});
