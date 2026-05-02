import { test, expect } from '@playwright/test';

/**
 * Login helper using seeded standalone credentials
 */
export const login = async (page) => {
  const credentialPool = [
    { email: 'advocate@wakiliworld.local', password: 'demo1234' },
    { email: 'admin@wakiliworld.local', password: 'demo1234' },
    { email: 'client@wakiliworld.local', password: 'demo1234' },
  ];

  for (const creds of credentialPool) {
    const success = await performLogin(page, creds.email, creds.password);
    if (success) {
      return;
    }
  }

  throw new Error('Unable to authenticate with seeded test credentials');
};

const performLogin = async (page, email, password) => {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  if (!page.url().includes('/login')) {
    // Already authenticated.
    return true;
  }

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  const authResponse = page.waitForResponse(
    (resp) =>
      (resp.url().includes('/auth/login') || resp.url().includes('/account/sessions')) &&
      [200, 201, 400, 401].includes(resp.status()),
    { timeout: 30000 }
  );

  await page.click('button[type="submit"]');

  try {
    await authResponse;
  } catch {
    // Ignore timeout here; fallback check below determines success/failure.
  }

  await Promise.race([
    page.waitForURL('**/home**', { timeout: 15000 }),
    page.waitForURL('**/client-home**', { timeout: 15000 }),
    page.waitForTimeout(15000),
  ]).catch(() => {});

  const currentUrl = page.url();
  return currentUrl.includes('/home') || currentUrl.includes('/client-home');
};

export const ensureAuthenticated = async (page) => {
  // Try to go to home; if redirected to login, perform login
  await page.goto('/home');
  await page.waitForLoadState('domcontentloaded');

  // If we're on login page, we need to authenticate
  if (page.url().includes('/login')) {
    await login(page);
    // After login, navigate again to home and wait
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');
  }

  // Verify we're on an authenticated route
  expect(page.url().includes('/home') || page.url().includes('/client-home')).toBe(true);
};
