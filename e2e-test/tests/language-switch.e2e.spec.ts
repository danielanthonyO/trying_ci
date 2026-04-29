import { test, expect } from '@playwright/test';
import { CustomersPage } from '../pages/customers.page';

test.describe('Language switching', () => {
  test('switches FI → EN → SV', async ({ page }) => {
    const app = new CustomersPage(page);

    await app.goto();

    await app.switchToFinnish();
    await app.expectFinnishText();

    await app.switchToEnglish();
    await app.expectEnglishText();

    await app.switchToSwedish();
    await app.expectSwedishText();
  });

  test('persists Swedish after reload', async ({ page }) => {
    const app = new CustomersPage(page);

    await app.goto();
    await app.switchToSwedish();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('lang')))
      .toBe('sv');

    await page.reload();

    await app.expectSwedishText();
  });
});