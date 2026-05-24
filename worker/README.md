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

---

## Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) logged in to your Cloudflare account (`wrangler login`)
- A GitHub account with access to the target repository

---

### 2. Cloudflare Worker

The worker is deployed to Cloudflare Workers via Wrangler. No special Worker plan is
required — the free tier is sufficient.

```bash
# Install dependencies
pnpm install   # or npm install

# Copy the example config
cp wrangler.toml.example wrangler.toml
```

The `name` field in `wrangler.toml` becomes the worker's subdomain:
`https://triple-yahtzee-report-worker.<your-subdomain>.workers.dev`

---

### 3. Cloudflare KV (rate limiting)

The worker stores per-IP request counters in a KV namespace (10 requests / hour per IP).

Create two namespaces — one for production, one for local preview:

```bash
wrangler kv namespace create RATE_LIMIT_KV
wrangler kv namespace create RATE_LIMIT_KV --preview
```

Each command prints an `id`. Copy both into `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "<production-id>"
preview_id = "<preview-id>"
```

---

### 4. Cloudflare Turnstile (bot protection)

Turnstile validates that requests come from a real browser before the worker creates an
issue.

1. Go to **Cloudflare Dashboard → Turnstile → Add widget**
2. Choose type **Managed** (recommended)
3. Add your front-end domain to the allowed hostnames
4. Copy the **Secret Key** (the Site Key goes in the front-end Angular app)

Store the secret as a Wrangler secret (never put it in `wrangler.toml`):

```bash
wrangler secret put TURNSTILE_SECRET_KEY
# paste the secret key when prompted
```

---

### 5. GitHub App

The worker authenticates as a GitHub App to create issues. This avoids storing a
personal access token and gives fine-grained, revocable permissions.

#### 5a. Create the app

1. Go to **GitHub → Settings → Developer settings → GitHub Apps → New GitHub App**
2. Fill in the form:

   | Field | Value |
   |---|---|
   | **App name** | `triple-yahtzee-report-worker` (or any name) |
   | **Homepage URL** | Your deployed front-end URL |
   | **Webhook → Active** | ✅ **Uncheck** (webhooks are not used) |

3. Under **Repository permissions**, set **Issues → Read and write**. Leave everything else as **No access**.
4. Under **Where can this GitHub App be installed?**, choose **Only on this account**.
5. Click **Create GitHub App**.

#### 5b. Get the App ID

On the app's settings page, copy the **App ID** (a number like `12345678`).

```bash
wrangler secret put GITHUB_APP_ID
# paste the App ID when prompted
```

#### 5c. Generate and encode the private key

1. Scroll to **Private keys** on the app settings page
2. Click **Generate a private key** — a `.pem` file is downloaded
3. Base64-encode it (the worker decodes it at runtime):

   ```bash
   # macOS / Linux
   base64 -i triple-yahtzee-report-worker.YYYY-MM-DD.private-key.pem | tr -d '\n'
   ```

4. Store the encoded string as a secret:

   ```bash
   wrangler secret put GITHUB_PRIVATE_KEY
   # paste the base64 string when prompted
   ```

> **Keep the `.pem` file safe.** Delete it once you've stored the secret, or keep it in a password manager.

#### 5d. Install the app and get the Installation ID

1. On the app's settings page, click **Install App**
2. Choose your account and select **Only select repositories → `triple-yahtzee-score-board`**
3. Click **Install**
4. After installation, the URL changes to something like:
   `https://github.com/settings/installations/12345678`
   That number at the end is the **Installation ID**.

```bash
wrangler secret put GITHUB_INSTALLATION_ID
# paste the installation ID when prompted
```

---

### 6. Deploy

```bash
wrangler deploy
```

The worker URL is printed on success. Update the front-end environment with this URL.

For local development:

```bash
wrangler dev
# worker available at http://localhost:8787
```

---

## Environment bindings reference

| Name                     | Type   | Set via            | Description                              |
|--------------------------|--------|--------------------|------------------------------------------|
| `RATE_LIMIT_KV`          | KV     | `wrangler.toml`    | Stores per-IP request counts             |
| `GITHUB_REPO`            | var    | `wrangler.toml`    | `owner/repo` of the target repository    |
| `TURNSTILE_SECRET_KEY`   | secret | `wrangler secret`  | Cloudflare Turnstile secret key          |
| `GITHUB_APP_ID`          | secret | `wrangler secret`  | GitHub App numeric ID                    |
| `GITHUB_PRIVATE_KEY`     | secret | `wrangler secret`  | Base64-encoded RSA private key PEM       |
| `GITHUB_INSTALLATION_ID` | secret | `wrangler secret`  | GitHub App installation ID               |
