/**
 * Minimal GitHub App JWT authentication for Cloudflare Workers.
 * Uses the Web Crypto API (no Node.js dependency).
 *
 * The GitHub REST API returns snake_case fields and HTTP headers are PascalCase —
 * both violate the naming-convention rule, so the entire file opts out of it.
 * JSON responses from fetch() are untyped (any), so unsafe-* rules are suppressed
 * for this file only.
 */

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCodePoint(...bytes));
  return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function encodeJson(obj: unknown): string {
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(obj)));
}

/** Creates a JWT signed with the GitHub App private key (RS256). */
async function createAppJwt(appId: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: 'RS256', typ: 'JWT' });
  const payload = encodeJson({ iat: now - 60, exp: now + 600, iss: appId });
  const sigInput = `${header}.${payload}`;

  const pemBody = privateKeyPem
    .replaceAll(/-----BEGIN [A-Z ]+ KEY-----/g, '')
    .replaceAll(/-----END [A-Z ]+ KEY-----/g, '')
    .replaceAll(/\s+/g, '');
  const derBytes = Uint8Array.from(atob(pemBody), (c) => c.codePointAt(0) ?? 0);

  const key = await crypto.subtle.importKey(
    'pkcs8',
    derBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBytes = new Uint8Array(
    await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(sigInput))
  );

  return `${sigInput}.${base64UrlEncode(sigBytes)}`;
}

/** Exchanges a GitHub App JWT for an installation access token. */
async function getInstallationToken(
  appId: string,
  privateKeyPem: string,
  installationId: string
): Promise<string> {
  const jwt = await createAppJwt(appId, privateKeyPem);

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      headers: new Headers({
        /* eslint-disable @typescript-eslint/naming-convention */
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${jwt}`,
        /* eslint-enable @typescript-eslint/naming-convention */
        'User-Agent': 'triple-yahtzee-report-worker',
        'X-GitHub-Api-Version': '2022-11-28',
      }),
      method: 'POST',
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub token exchange failed: ${res.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = await res.json();
  return String(data.token);
}

export interface CreateIssueResult {
  issueNumber: number;
  url: string;
}

/** Creates a GitHub issue and returns its URL and issue number. */
export async function createGitHubIssue(
  repo: string,
  appId: string,
  privateKeyPem: string,
  installationId: string,
  title: string,
  body: string,
  labels: string[]
): Promise<CreateIssueResult> {
  const token = await getInstallationToken(appId, privateKeyPem, installationId);

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    body: JSON.stringify({ title, body, labels }),
    headers: new Headers({
      /* eslint-disable @typescript-eslint/naming-convention */
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      /* eslint-enable @typescript-eslint/naming-convention */
      'Content-Type': 'application/json',
      'User-Agent': 'triple-yahtzee-report-worker',
      'X-GitHub-Api-Version': '2022-11-28',
    }),
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error(`GitHub issue creation failed: ${res.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const issue: Record<string, any> = await res.json();
  return { issueNumber: Number(issue.number), url: String(issue.html_url) };
}
