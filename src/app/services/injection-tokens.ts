import { createInjectionToken } from 'ngxtension/create-injection-token';

export const [
  // eslint-disable-next-line @typescript-eslint/naming-convention -- injection function
  injectIsTestEnv,,
  IS_TEST_ENV,
] = createInjectionToken(() => false);
export const [
  // eslint-disable-next-line @typescript-eslint/naming-convention -- injection function
  injectTurnstileSiteKey,,
  TURNSTILE_SITE_KEY,
] = createInjectionToken(() => import.meta.env.NG_APP_TURNSTILE_SITE_KEY);
export const [
  // eslint-disable-next-line @typescript-eslint/naming-convention -- injection function
  injectReportIssueEndpoint,,
  REPORT_ISSUE_ENDPOINT,
] = createInjectionToken(() => import.meta.env.NG_APP_REPORT_ISSUE_ENDPOINT);
export const [
  // eslint-disable-next-line @typescript-eslint/naming-convention -- injection function
  injectAppVersion,,
  APP_VERSION,
] = createInjectionToken(() => import.meta.env.NG_APP_BUILD_ID);
