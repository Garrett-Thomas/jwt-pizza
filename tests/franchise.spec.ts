import { test, expect } from './testSetup';
import { basicInit, login } from './mocks';

test('franchise page for a non-franchisee', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' }).click();

  await expect(page.getByRole('heading', { name: 'So you want a piece of the pie?' })).toBeVisible();
});

test('franchisee creates and closes a store', async ({ page }) => {
  await basicInit(page);
  await login(page, 'f@jwt.com', 'franchisee');

  await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('heading', { name: 'LotaPizza' })).toBeVisible();
  await expect(page.locator('tbody')).toContainText('Lehi');

  // Create a store
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByPlaceholder('store name').fill('Orem');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('heading', { name: 'LotaPizza' })).toBeVisible();

  // Close a store
  await page.getByRole('row', { name: 'Lehi' }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('main')).toContainText('Lehi');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'LotaPizza' })).toBeVisible();
});
