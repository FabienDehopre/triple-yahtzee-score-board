export const ENVIRONMENT = {
  production: false,
  /** Cloudflare Worker endpoint for report-issue submissions. */
  reportIssueEndpoint: import.meta.env.NG_APP_REPORT_ISSUE_ENDPOINT ?? 'http://localhost:8787/report',
  /** Cloudflare Turnstile public site key (1x… = always-pass test key). */
  turnstileSiteKey: import.meta.env.NG_APP_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA',
};
