import { Page } from '@playwright/test';
import { expect } from './testSetup';
import { Role, User } from '../src/service/pizzaService';

// Mocks the JWT Pizza Service endpoints and opens the home page.
export async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
    'a@jwt.com': { id: '1', name: 'Pizza Admin', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] },
    'f@jwt.com': { id: '4', name: 'Frank Lee', email: 'f@jwt.com', password: 'franchisee', roles: [{ role: Role.Diner }, { role: Role.Franchisee, objectId: '2' }] },
  };

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = route.request().postDataJSON();
    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = validUsers[loginReq.email];
    const loginRes = {
      user: loggedInUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // List franchises (GET) and create a franchise (POST)
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ json: { ...route.request().postDataJSON(), id: 99 } });
      return;
    }

    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // A franchisee's franchises (GET), close a franchise or a store (DELETE)
  await page.route(/\/api\/franchise\/\d+(\/store\/\d+)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: [{ id: 2, name: 'LotaPizza', stores: [{ id: 4, name: 'Lehi', totalRevenue: 0.05 }] }] });
      return;
    }
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ json: { message: 'deleted' } });
  });

  // Create a store
  await page.route(/\/api\/franchise\/\d+\/store$/, async (route) => {
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: { ...route.request().postDataJSON(), id: 99 } });
  });

  // Place an order (POST) and get order history (GET)
  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'GET') {
      const pastOrder = { id: 23, franchiseId: 2, storeId: 4, date: '2024-06-05T05:14:40.000Z', items: [{ menuId: 1, description: 'Veggie', price: 0.0038 }] };
      await route.fulfill({ json: { id: 1, dinerId: 3, orders: [pastOrder] } });
      return;
    }

    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });

  // Pizza Factory: verify an order JWT
  await page.route('*/**/api/order/verify', async (route) => {
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: { message: 'valid', payload: { vendor: { name: 'JWT Pizza' } } } });
  });

  await page.goto('/');
}

// Logs in through the header Login link.
export async function login(page: Page, email: string, password: string) {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
}
