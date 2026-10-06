import { test, expect } from './testSetup';
import { basicInit, login } from './mocks';

test('admin creates and closes franchises and stores', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();

  // Create a franchise
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder('franchise name').fill('NewPizza');
  await page.getByPlaceholder('franchisee admin email').fill('d@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();

  // Close a franchise
  await page.getByRole('row', { name: 'topSpot' }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('main')).toContainText('topSpot');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();

  // Close a store
  await page.getByRole('row', { name: 'Spanish Fork' }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('main')).toContainText('Spanish Fork');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();
});
