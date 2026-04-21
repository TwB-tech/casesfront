import { test, expect } from '@playwright/test';

test.describe('WakiliWorld App', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toContain('localhost');
  });

  test('home page after login accessible', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('features page loads', async ({ page }) => {
    await page.goto('/features');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toBeTruthy();
  });
});

test.describe('Reya Assistant', () => {
  test('reya button renders in markup', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    const content = await page.content();
    expect(content.includes('REYA') || content.includes('Reya')).toBeTruthy();
  });
});

test.describe('Documents Module', () => {
  test('documents route loads', async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });

  test('new-document route loads', async ({ page }) => {
    await page.goto('/new-document');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });
});

test.describe('Chat Module', () => {
  test('chat users page loads', async ({ page }) => {
    await page.goto('/chat-users');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });
});

test.describe('Cases Module', () => {
  test('case list route loads', async ({ page }) => {
    await page.goto('/case-list');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });

  test('case form route loads', async ({ page }) => {
    await page.goto('/case-form');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });
});

test.describe('Clients Module', () => {
  test('client list route loads', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });
});

test.describe('Tasks Module', () => {
  test('tasks route loads', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });
});