/** Verifies a Cloudflare Turnstile token server-side. */
export async function verifyTurnstile(
  token: string,
  secretKey: string,
  remoteIp: string
): Promise<boolean> {
  const body = new URLSearchParams({
    remoteip: remoteIp,
    response: token,
    secret: secretKey,
  });

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    body,
    method: 'POST',
  });

  if (!res.ok) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = await res.json();
  return data.success === true;
}
