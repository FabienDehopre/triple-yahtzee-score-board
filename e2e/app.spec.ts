import { expect, test } from '@playwright/test';

test('app renders correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Triple Yahtzee' })).toBeVisible();
  await expect(page.getByText('Score Board')).toBeVisible();
});
