import { test, expect } from './testSetup';
import { basicInit, login } from './mocks';

test('diner dashboard shows profile and order history', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');

  await page.getByRole('link', { name: 'KC' }).click();

  await expect(page.getByRole('heading', { name: 'Your pizza kitchen' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Kai Chen');
  await expect(page.getByRole('main')).toContainText('d@jwt.com');
  await expect(page.locator('tbody')).toContainText('2024-06-05T05:14:40.000Z');
});
