/* eslint-disable testing-library/prefer-screen-queries -- Playwright page API shares method names with Testing Library but is unrelated; ESLint not yet configured for e2e */
import { expect, test } from '@playwright/test';

test('app renders correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Triple Yahtzee' })).toBeVisible();
  await expect(page.getByText('Score Board')).toBeVisible();
});
