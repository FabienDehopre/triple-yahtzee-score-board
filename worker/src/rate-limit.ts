const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/** Returns true when the IP is under the rate limit and increments the counter. */
export async function checkRateLimit(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `rl:${ip}`;
  const raw = await kv.get(key);
  const count = raw === null ? 0 : Number.parseInt(raw, 10);

  if (count >= RATE_LIMIT) return false;

  const ttl = Math.ceil(WINDOW_MS / 1000);
  await kv.put(key, String(count + 1), { expirationTtl: ttl });
  return true;
}
