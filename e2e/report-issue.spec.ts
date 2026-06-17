import { expect, test } from '@playwright/test';

const WORKER_URL = 'http://localhost:8787/report';

test.describe('report Issue FAB', () => {
  test('fAB is visible and labelled', async ({ page }) => {
    await page.goto('/');
    const fab = page.getByTestId('report-issue-fab');
    await expect(fab).toBeVisible();
    await expect(fab).toHaveAttribute('aria-label', /.+/);
  });

  test('clicking FAB opens the report dialog', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('report-issue-fab').click();
    await expect(page.getByRole('dialog', { name: /report/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  });

  test('cancel button closes the dialog', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('report-issue-fab').click();
    await expect(page.getByRole('dialog', { name: /report/i })).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog', { name: /report/i })).toBeHidden();
  });

  test('shows success toast after valid submission', async ({ page }) => {
    await page.route(WORKER_URL, (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://github.com/FabienDehopre/triple-yahtzee-score-board/issues/99', issueNumber: 99 }),
      })
    );

    await page.goto('/');
    await page.getByTestId('report-issue-fab').click();

    // Fill required fields
    await page.getByLabel(/title/i).fill('Dice roll shows wrong score');
    await page.getByLabel(/description/i).fill('When I roll five 6s, the score should be 150 but shows 0 instead.');

    // Simulate Turnstile token via hidden input
    const tokenInput = page.getByTestId('turnstile-token-input');
    await tokenInput.fill('e2e-test-token');
    await tokenInput.dispatchEvent('input');

    // Submit
    await page.getByRole('button', { name: /submit/i }).click();

    // Dialog should close and toast should be visible
    await expect(page.getByRole('dialog', { name: /report/i })).toBeHidden();
    await expect(page.getByTestId('toast')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('toast')).toHaveClass(/bg-green/);
  });

  test('shows error toast when worker returns 429', async ({ page }) => {
    await page.route(WORKER_URL, (route) =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Rate limit exceeded' }),
      })
    );

    await page.goto('/');
    await page.getByTestId('report-issue-fab').click();

    await page.getByLabel(/title/i).fill('Rate limit test');
    await page.getByLabel(/description/i).fill('Testing the rate limit error path in e2e.');

    const tokenInput = page.getByTestId('turnstile-token-input');
    await tokenInput.fill('e2e-test-token');
    await tokenInput.dispatchEvent('input');

    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByTestId('toast')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('toast')).toHaveClass(/bg-red/);
  });
});
