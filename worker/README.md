# Report Issue Worker

A Cloudflare Worker that receives issue reports from the Triple Yahtzee front-end
and creates GitHub issues via the GitHub App API.

## Architecture

```
Browser → POST /report → Cloudflare Worker → GitHub Issues API
```

The worker:
1. Validates the request body with Zod
2. Verifies the Cloudflare Turnstile token
3. Enforces per-IP rate limiting via KV (10 reports / hour)
4. Authenticates as a GitHub App and creates the issue
5. Returns `{ url, issueNumber }` or an error code

## Prerequisites

- A Cloudflare account with Workers and KV enabled
- A GitHub App with `issues:write` permission installed on the repo

## Setup

```bash
# 1. Copy the example config
cp wrangler.toml.example wrangler.toml

# 2. Replace placeholder KV namespace IDs with real ones:
#    wrangler kv:namespace create RATE_LIMIT_KV

# 3. Add secrets
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put GITHUB_APP_ID
wrangler secret put GITHUB_PRIVATE_KEY        # base64-encoded PEM
wrangler secret put GITHUB_INSTALLATION_ID

# 4. Install dependencies
npm install

# 5. Local dev
npm run dev

# 6. Deploy
npm run deploy
```

## Environment bindings

| Name                   | Type   | Description                         |
|------------------------|--------|-------------------------------------|
| `RATE_LIMIT_KV`        | KV     | Stores per-IP request counts        |
| `GITHUB_REPO`          | var    | `owner/repo` of the target repo     |
| `TURNSTILE_SECRET_KEY` | secret | Cloudflare Turnstile secret key     |
| `GITHUB_APP_ID`        | secret | GitHub App numeric ID               |
| `GITHUB_PRIVATE_KEY`   | secret | Base64-encoded RSA private key PEM  |
| `GITHUB_INSTALLATION_ID` | secret | GitHub App installation ID        |
