import { test, expect } from './testSetup';
import { basicInit, login } from './mocks';

test('admin sees users with their emails and roles', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');

  await page.getByRole('link', { name: 'Admin' }).click();

  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Kai Chen d@jwt.com diner' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Pizza Admin a@jwt.com admin' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Frank Lee f@jwt.com diner, franchisee' })).toBeVisible();
});
