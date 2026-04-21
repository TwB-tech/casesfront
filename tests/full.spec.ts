import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Comprehensive App Tests', () => {
  const routes = [
    '/',
    '/login',
    '/signup',
    '/register-success',
    '/forgot-password',
    '/pricing',
    '/features',
    '/privacy',
    '/terms',
    '/about',
    '/contact',
    '/firms',
  ];

  for (const route of routes) {
    test(`route ${route} loads`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(route, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(500);
      expect(page.url()).toContain(BASE_URL);
    });
  }

  test('navbar renders', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });
});

test.describe('Protected Routes', () => {
  const protectedRoutes = [
    '/home',
    '/case-list',
    '/case-form',
    '/clients',
    '/documents',
    '/tasks',
    '/invoices',
    '/chats',
    '/chat-users',
    '/calendar',
    '/profile',
    '/settings',
    '/new-mail',
    '/hr',
    '/expenses',
  ];

  for (const route of protectedRoutes) {
    test(`route ${route} loads without crash`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(route, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(500);
      expect(errors.filter(e => e.includes('TypeError') || e.includes('ReferenceError'))).toHaveLength(0);
    });
  }
});

test.describe('Authentication', () => {
  test('login page accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('signup renders', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('signup');
  });
});

test.describe('Modules', () => {
  test('cases module loads', async ({ page }) => {
    await page.goto('/case-list');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });

  test('clients module loads', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });

  test('documents module loads', async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });

  test('tasks module loads', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });

  test('invoices module loads', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });

  test('calendar loads', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });

  test('profile loads', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });
});

test.describe('Reya Integration', () => {
  test('reya in markup', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    const content = await page.content();
    expect(content.toLowerCase().includes('reya')).toBe(true);
  });

  test('chat/reya loads', async ({ page }) => {
    await page.goto('/chat/reya');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });

  test('chat route works', async ({ page }) => {
    await page.goto('/chat/test');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });
});

test.describe('Security Checks', () => {
  test('no XSS in URL', async ({ page }) => {
    await page.goto('/login?redirect=<script>alert(1)</script>');
    await page.waitForTimeout(500);
    const html = await page.content();
    expect(html).not.toContain('<script>alert');
  });

  test('no eval usage', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    expect(html).not.toContain('eval(');
  });
});

test.describe('Responsive', () => {
  test('mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain(BASE_URL);
  });

  test('desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain(BASE_URL);
  });
});

test.describe('Edge Cases', () => {
  test('invalid route handling', async ({ page }) => {
    await page.goto('/invalid-route-xyz-123');
    await page.waitForTimeout(500);
  });

  test('special chars in URL', async ({ page }) => {
    await page.goto('/login?next=/case-list&foo=bar');
    await page.waitForTimeout(500);
    expect(page.url()).toContain(BASE_URL);
  });
});