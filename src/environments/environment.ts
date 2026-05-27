export const ENVIRONMENT = {
  production: false,
  /** Cloudflare Worker endpoint for report-issue submissions. */
  reportIssueEndpoint: 'http://localhost:8787/report',
  /** Cloudflare Turnstile public site key (1x… = always-pass test key). */
  turnstileSiteKey: '1x00000000000000000000AA',
};
