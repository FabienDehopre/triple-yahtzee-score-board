import { env } from 'node:process';

import { defineConfig, devices } from '@playwright/test';

const HOST = '127.0.0.1';
const PORT = 4200;
const BASE_URL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!env['CI'],
  retries: env['CI'] ? 2 : 0,
  workers: env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm start --host ${HOST} --port ${PORT}`,
    url: BASE_URL,
    env: {
      /* eslint-disable @typescript-eslint/naming-convention -- environment variable names */
      NG_APP_IS_TEST_ENV: 'true',
      NG_APP_REPORT_ISSUE_ENDPOINT: 'http://localhost:8787/report',
      NG_APP_BUILD_ID: 'e2e-tests',
      /* eslint-enable @typescript-eslint/naming-convention */
    },
    reuseExistingServer: false,
  },
});
