export interface Env {
  /* eslint-disable @typescript-eslint/naming-convention */
  RATE_LIMIT_KV: KVNamespace;
  GITHUB_REPO: string;
  TURNSTILE_SECRET_KEY: string;
  GITHUB_APP_ID: string;
  GITHUB_PRIVATE_KEY: string;
  GITHUB_INSTALLATION_ID: string;
  /* eslint-enable @typescript-eslint/naming-convention */
}
