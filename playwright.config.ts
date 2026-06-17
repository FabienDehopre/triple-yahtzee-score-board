import { env } from 'node:process';

import { defineConfig, devices } from '@playwright/test';

const E2E_PORT = env['E2E_PORT'] ?? '4200';
const BASE_URL = `http://127.0.0.1:${E2E_PORT}`;

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
    command: `NG_APP_IS_TEST_ENV=true NG_APP_REPORT_ISSUE_ENDPOINT=http://localhost:8787/report pnpm ng serve --host 127.0.0.1 --port ${E2E_PORT}`,
    url: BASE_URL,
    reuseExistingServer: !env['CI'],
  },
});
