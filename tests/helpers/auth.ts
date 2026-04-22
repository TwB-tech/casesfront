import { test } from '@playwright/test';

/**
 * Login helper using seeded standalone credentials
 */
export const login = async (page) => {
  // Check if already logged in by trying to access home
  try {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    // If we're on login page, we need to login
    if (page.url().includes('/login')) {
      await performLogin(page);
    }
  } catch (error) {
    // If navigation fails, try direct login
    await performLogin(page);
  }
};

const performLogin = async (page) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill credentials - using seeded standalone user
  await page.fill('input[type="email"]', 'advocate@wakiliworld.local');
  await page.fill('input[type="password"]', 'demo1234');

  // Click submit
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle' });
};

export const ensureAuthenticated = async (page) => {
  // Try to go to home; if redirected to login, perform login
  await page.goto('/home');
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch (error) {
    // If home doesn't load quickly, assume login required
    await login(page);
  }
  // Verify we're on home
  expect(page.url()).toContain('/home');
};
