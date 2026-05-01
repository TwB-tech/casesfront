import { test, expect } from '@playwright/test';

test('diagnostic: check landing page load', async ({ page }) => {
  // Capture console messages
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  // Capture page errors
  page.on('pageerror', (err) => {
    console.log('PAGE ERROR:', err.message);
  });

  // Navigate and wait
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'diagnostic-landing.png', fullPage: true });
    
    // Get page content for analysis
    const content = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    console.log('Body text length:', (await page.locator('body').textContent())?.length);
    
    // Check for specific elements
    const hasLogo = await page.locator('img[src*="Logo"]').count();
    console.log('Logo images found:', hasLogo);
    
    const hasNavbar = await page.locator('nav, header').count();
    console.log('Nav/header elements:', hasNavbar);
    
    const hasForms = await page.locator('form').count();
    console.log('Forms on page:', hasForms);
    
  } catch (err) {
    console.error('Navigation error:', err.message);
    throw err;
  }
});
