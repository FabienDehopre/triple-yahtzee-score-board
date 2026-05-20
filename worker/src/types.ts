export interface Env {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  RATE_LIMIT_KV: KVNamespace;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GITHUB_REPO: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TURNSTILE_SECRET_KEY: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GITHUB_APP_ID: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GITHUB_PRIVATE_KEY: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GITHUB_INSTALLATION_ID: string;
}
