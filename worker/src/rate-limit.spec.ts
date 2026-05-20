import { beforeEach, describe, expect, test, vi } from 'vitest';

import { checkRateLimit } from '../src/rate-limit';

function makeFakeKv(initial: Record<string, string> = {}): KVNamespace {
  const store: Record<string, string> = { ...initial };

  return {
    get: vi.fn((key: string) => Promise.resolve(store[key] ?? null)),
    put: vi.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace;
}

describe('checkRateLimit', () => {
  let kv: KVNamespace;

  beforeEach(() => {
    kv = makeFakeKv();
  });

  test('allows first request from a new IP', async () => {
    expect(await checkRateLimit(kv, '1.2.3.4')).toBeTruthy();
  });

  test('increments counter on each allowed request', async () => {
    await checkRateLimit(kv, '1.2.3.4');
    await checkRateLimit(kv, '1.2.3.4');
    expect(kv.put).toHaveBeenCalledTimes(2);
    const lastCall = vi.mocked(kv.put).mock.calls[1];
    expect(lastCall[1]).toBe('2');
  });

  test('blocks the request when count equals limit', async () => {
    kv = makeFakeKv({ 'rl:1.2.3.4': '10' });
    expect(await checkRateLimit(kv, '1.2.3.4')).toBeFalsy();
  });

  test('different IPs have independent counters', async () => {
    kv = makeFakeKv({ 'rl:1.2.3.4': '10' });
    expect(await checkRateLimit(kv, '5.6.7.8')).toBeTruthy();
  });
});
