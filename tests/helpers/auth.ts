import { test, expect } from '@playwright/test';

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
  console.log('Starting performLogin');
  // Capture page errors
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  const logs: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    logs.push(`console ${msg.type()}: ${text}`);
    console.log('PAGE CONSOLE:', text);
  });
  page.on('request', (request) => {
    console.log('REQUEST:', request.url(), request.method());
  });
  page.on('response', async (response) => {
    try {
      const text = await response.text();
      console.log('RESPONSE:', response.url(), response.status(), text.substring(0,100));
    } catch (e) {
      console.log('RESPONSE:', response.url(), response.status(), '(body unavailable or error)');
    }
  });
  page.on('requestfailed', (request) => {
    logs.push(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
  });

  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill credentials
  await page.fill('input[type="email"]', 'advocate@wakiliworld.local');
  await page.fill('input[type="password"]', 'demo1234');

  // Wait for the login response (Appwrite returns 201 on success)
  const responsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/account/sessions') && (resp.status() === 200 || resp.status() === 201 || resp.status() === 400 || resp.status() === 401)
  );

  // Click submit
  await page.click('button[type="submit"]');

  try {
    const response = await Promise.race([
      responsePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Response timeout')), 30000))
    ]);
    const body = await response.text();
    console.log('Login response status:', response.status(), 'body:', body.substring(0, 200));
  } catch (err) {
    console.log('Login response error:', err.message);
  }

  // Wait for navigation to settle
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});

  console.log('Login completed. Current URL:', page.url());
  if (logs.length > 0) {
    console.log('Collected logs:', logs.join(' | '));
  }
};

export const ensureAuthenticated = async (page) => {
  // Try to go to home; if redirected to login, perform login
  await page.goto('/home');
  await page.waitForLoadState('networkidle');

  // If we're on login page, we need to authenticate
  if (page.url().includes('/login')) {
    await login(page);
    // After login, navigate again to home and wait
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
  }

  // Verify we're on home
  expect(page.url()).toContain('/home');
};
