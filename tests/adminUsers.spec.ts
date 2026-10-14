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

test('admin filters users by name', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByPlaceholder('Filter users').fill('turing');
  await page.getByRole('row').filter({ has: page.getByPlaceholder('Filter users') }).getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByRole('row', { name: 'Alan Turing alan@jwt.com diner' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Kai Chen' })).toBeHidden();
});

test('admin pages through users', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();

  const usersFooter = page.getByRole('row').filter({ has: page.getByPlaceholder('Filter users') });
  await expect(page.getByRole('row', { name: 'Kai Chen' })).toBeVisible();
  await expect(usersFooter.getByRole('button', { name: '«' })).toBeDisabled();

  await usersFooter.getByRole('button', { name: '»' }).click();
  await expect(page.getByRole('row', { name: 'Linus Torvalds' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Kai Chen' })).toBeHidden();
  await expect(usersFooter.getByRole('button', { name: '»' })).toBeDisabled();

  await usersFooter.getByRole('button', { name: '«' }).click();
  await expect(page.getByRole('row', { name: 'Kai Chen' })).toBeVisible();
});

test('admin deletes a user', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('row', { name: 'Kai Chen' }).getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByRole('row', { name: 'Kai Chen' })).toBeHidden();
  await expect(page.getByRole('row', { name: 'Alan Turing' })).toBeVisible();
});
