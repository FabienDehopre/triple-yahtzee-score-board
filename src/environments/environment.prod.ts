export const ENVIRONMENT = {
  production: true,
  /** Set via NG_APP_REPORT_ISSUE_ENDPOINT at Netlify build time. */
  reportIssueEndpoint: import.meta.env.NG_APP_REPORT_ISSUE_ENDPOINT ?? '',
  /** Set via NG_APP_TURNSTILE_SITE_KEY at Netlify build time. */
  turnstileSiteKey: import.meta.env.NG_APP_TURNSTILE_SITE_KEY ?? '',
};
