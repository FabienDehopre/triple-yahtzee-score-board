import type { Env } from './types';

import { createGitHubIssue } from './github';
import { buildIssueBody, buildIssueTitle } from './issue-builder';
import { checkRateLimit } from './rate-limit';
import { reportPayloadSchema } from './schema';
import { verifyTurnstile } from './turnstile';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(undefined, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    // Parse and validate body
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }

    const parsed = reportPayloadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    const payload = parsed.data;
    const ip = request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';

    // Verify Turnstile
    const turnstileOk = await verifyTurnstile(payload.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
    if (!turnstileOk) {
      return json({ error: 'Turnstile verification failed' }, 401);
    }

    // Rate limit
    const allowed = await checkRateLimit(env.RATE_LIMIT_KV, ip);
    if (!allowed) {
      return json({ error: 'Rate limit exceeded' }, 429);
    }

    // Create GitHub issue
    const title = buildIssueTitle(payload);
    const body = buildIssueBody(payload);
    const labels = payload.type === 'bug' ? ['bug', 'user-report'] : ['enhancement', 'user-report'];

    const privateKey = atob(env.GITHUB_PRIVATE_KEY);

    try {
      const result = await createGitHubIssue(
        env.GITHUB_REPO,
        env.GITHUB_APP_ID,
        privateKey,
        env.GITHUB_INSTALLATION_ID,
        title,
        body,
        labels
      );
      return json(result, 201);
    } catch {
      return json({ error: 'Failed to create issue' }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
