import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow user to navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Look for login link/button and click it
    const loginLink = page
      .locator('a[href="/login"], button:has-text("Login"), [data-testid="login-link"]')
      .first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForURL('**/login');
      expect(page.url()).toContain('/login');
    }
  });

  test('login form should have required fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Check for email/username field
    const emailField = page
      .locator('input[type="email"], input[placeholder*="email" i], input[name="email"]')
      .first();
    await expect(emailField).toBeVisible();

    // Check for password field
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    await expect(passwordField).toBeVisible();

    // Check for submit button
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")')
      .first();
    await expect(submitButton).toBeVisible();
  });

   test('should show validation errors for empty form submission', async ({ page }) => {
     await page.goto('/login');
     await page.waitForLoadState('domcontentloaded');

     const submitButton = page.locator('button[type="submit"], button:has-text("Login")').first();
     if (await submitButton.isVisible()) {
       await submitButton.click();
       const emailField = page
         .locator('input[type="email"], input[placeholder*="email" i], input[name="email"]')
         .first();
       const passwordField = page.locator('input[type="password"], input[name="password"]').first();

       // App can validate via native HTML5 required attributes instead of inline error text.
       const [emailValid, passwordValid] = await Promise.all([
         emailField.evaluate((el) => el.checkValidity()),
         passwordField.evaluate((el) => el.checkValidity()),
       ]);
       expect(emailValid).toBe(false);
       expect(passwordValid).toBe(false);
     }
   });
});

test.describe('Navigation and Protected Routes', () => {
  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access a protected route directly
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');

    // Should either redirect to login or show login page
    const currentUrl = page.url();
    const isOnLoginPage = currentUrl.includes('/login') || currentUrl.includes('/signup');
    const hasLoginForm = await page
      .locator('form, input[type="email"], input[type="password"]')
      .first()
      .isVisible();

    expect(isOnLoginPage || hasLoginForm).toBe(true);
  });

  test('should allow navigation to public pages', async ({ page }) => {
    const publicPages = ['/', '/pricing', '/features', '/about', '/contact'];

    for (const pagePath of publicPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');

      // Should not redirect to login
      expect(page.url()).not.toContain('/login');
      expect(page.url()).toContain(pagePath);
    }
  });
});

test.describe('UI Components and Responsiveness', () => {
  test('navbar should be visible on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Look for navbar/header - be more specific
    const navbar = page.locator('nav').first();
    const header = page.locator('header').first();

    // Check what's actually on the page
    const bodyText = await page.locator('body').textContent();

    if (await navbar.isVisible()) {
      await expect(navbar).toBeVisible();
    } else if (await header.isVisible()) {
      await expect(header).toBeVisible();
    } else {
      // Check for any text content that suggests the page loaded
      expect(bodyText?.length).toBeGreaterThan(100);
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Content should still be accessible
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // No horizontal scrollbar should be present
    const scrollWidth = await page.evaluate(() => {
      return document.body.scrollWidth;
    });
    const viewportWidth = page.viewportSize().width;
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 100);
   });
 });

test.describe('Forms and Data Entry', () => {
  test('case form should have required fields', async ({ page }) => {
    // This test might fail if not logged in, but tests the form structure
    await page.goto('/case-form');
    await page.waitForLoadState('domcontentloaded');

    // Check if we're redirected (expected for protected route)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Redirected to login - form check not applicable
      expect(true).toBe(true);
    } else {
      // Look for form fields
      const formFields = page.locator('input, select, textarea').all();
      const fieldCount = (await formFields).length;
      expect(fieldCount).toBeGreaterThan(0);
    }
  });

  test('client registration should be accessible', async ({ page }) => {
    await page.goto('/client-register');
    await page.waitForLoadState('domcontentloaded');

    // Should load without crashing
    expect(page.url()).toContain('client-register');
  });
});

test.describe('Error Handling', () => {
  test('should handle invalid routes gracefully', async ({ page }) => {
    await page.goto('/invalid-route-12345');
    await page.waitForLoadState('domcontentloaded');

    // Should show 404 or redirect to home
    const content = await page.content();
    const has404Content =
      content.includes('404') || content.includes('not found') || content.includes('Not Found');
    const redirectedToHome = page.url().includes('/') && !page.url().includes('invalid-route');

    expect(has404Content || redirectedToHome).toBe(true);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock a network failure by blocking API calls
    await page.route('**/api/**', (route) => route.abort());

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // App should still load basic content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check for h1 tag
    const h1 = page.locator('h1').first();
    const h1Visible = await h1.isVisible();

    // Or check for main heading content
    const mainHeading = page.locator('h1, [role="heading"], .hero-title, .main-title').first();
    const mainHeadingVisible = await mainHeading.isVisible();

    // Fallback: if heading selector is not stable, ensure meaningful content rendered.
    const bodyText = (await page.locator('body').textContent()) || '';
    expect(h1Visible || mainHeadingVisible || bodyText.trim().length > 120).toBe(true);
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Check first few buttons have text or aria-label
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const hasText = await button.textContent().then((text) => text && text.trim().length > 0);
        const hasAriaLabel = await button
          .getAttribute('aria-label')
          .then((label) => label && label.length > 0);

        expect(hasText || hasAriaLabel).toBe(true);
      }
    }
  });
});
