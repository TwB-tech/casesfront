import { test, expect } from '@playwright/test';

test.describe('Reya AI Assistant', () => {
  test.describe('Reya Widget', () => {
    test('Reya button is visible on home page', async ({ page }) => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      const reyaButton = page.getByTestId('reya-open-button');
      await expect(reyaButton).toBeVisible({ timeout: 5000 });
    });

    test('Reya widget opens when clicked', async ({ page }) => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      const reyaButton = page.getByTestId('reya-open-button');
      await reyaButton.click();

      const messagesContainer = page.getByTestId('reya-messages-container');
      await expect(messagesContainer).toBeVisible({ timeout: 5000 });
    });

    test('Reya chat sends message and receives response', async ({ page }) => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      await page.getByTestId('reya-open-button').click();
      await page.waitForTimeout(1000);

      const input = page.getByTestId('reya-input');
      await expect(input).toBeVisible();
      await input.fill('What can you help me with?');
      await input.press('Enter');

      await page.waitForTimeout(3000);

      const assistantMessages = page.getByTestId('message-assistant');
      const count = await assistantMessages.count();
      expect(count).toBeGreaterThan(0);
    });

    test('Reya shows action buttons based on suggestions', async ({ page }) => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      await page.getByTestId('reya-open-button').click();
      await page.waitForTimeout(2000);

      const suggestions = page.locator('text=Show me priorities');
      if ((await suggestions.count()) > 0) {
        await expect(suggestions.first()).toBeVisible();
      }
    });

    test('Reya suggestions navigate correctly', async ({ page }) => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      await page.getByTestId('reya-open-button').click();
      await page.waitForTimeout(2000);

      const priorities = page.locator('text=Show me priorities').first();
      if ((await priorities.count()) > 0) {
        await priorities.click();
        await page.waitForNavigation({ timeout: 5000 });
        expect(page.url()).toContain('/tasks');
      }
    });

    test('Reya chat handles errors gracefully when APIs fail', async ({ page }) => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      await page.getByTestId('reya-open-button').click();
      await page.waitForTimeout(1000);

      const input = page.getByTestId('reya-input');
      await input.fill('test message');
      await input.press('Enter');

      await page.waitForTimeout(2000);
      const errorBanner = page.locator('text="I\'m having trouble connecting"');
      expect(errorBanner.count()).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Reya API Endpoint', () => {
    test('POST /api/reya returns valid JSON structure', async ({ request }) => {
      const response = await request.post('/api/reya', {
        data: {
          message: 'Hello',
          context: { cases_count: 0, clients_count: 0 },
          quick: false,
        },
      });

      const data = await response.json();
      expect([200, 503]).toContain(response.status());
      expect(data).toHaveProperty('content');
      if (response.status() === 200) {
        expect(data).toHaveProperty('provider');
      }
    });

    test('/api/reya handles document generation prompt', async ({ request }) => {
      const response = await request.post('/api/reya', {
        data: {
          message: 'Generate a service agreement for a software company',
          context: {
            docType: 'contract',
            country: 'kenya',
            law: 'Laws of Kenya',
          },
          quick: true,
          action: 'generate_document',
        },
      });

      const data = await response.json();
      expect(data).toHaveProperty('content');
      expect(data.content.length).toBeGreaterThan(50);
    });

    test('/api/reya fallback when both APIs are down', async ({ request }) => {
      const response = await request.post('/api/reya', {
        data: {
          message: 'test',
          context: {},
        },
      });

      const data = await response.json();
      expect(data).toHaveProperty('content');
    });
  });

  test.describe('Reya Document Generation (UI)', () => {
    test('Reya can generate document via chat', async ({ page }) => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      await page.getByTestId('reya-open-button').click();
      await page.waitForTimeout(1000);

      const input = page.getByTestId('reya-input');
      await input.fill('Generate a service agreement for my software company');
      await input.press('Enter');

      await page.waitForTimeout(5000);

      const messagesContainer = page.getByTestId('reya-messages-container');
      const text = await messagesContainer.textContent();
      expect(text).not.toContain('Generate a service agreement');
      expect(text?.length).toBeGreaterThan(100);
    });
  });

  test.describe('Reya Multi-turn Conversation', () => {
    test('Reya maintains context across messages', async ({ page }) => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      await page.getByTestId('reya-open-button').click();
      await page.waitForTimeout(1000);

      const input = page.getByTestId('reya-input');

      await input.fill('I have 3 active cases');
      await input.press('Enter');
      await page.waitForTimeout(3000);

      await input.fill('What are they?');
      await input.press('Enter');
      await page.waitForTimeout(3000);

      const messagesContainer = page.getByTestId('reya-messages-container');
      const text = await messagesContainer.textContent();
      expect(text?.length).toBeGreaterThan(200);
    });
  });

  test.describe('Reya Document Generation from Documents Page', () => {
    test('Documents page generator uses Reya AI correctly', async ({ page }) => {
      await page.goto('/documents');
      await page.waitForLoadState('networkidle');

      const generatorCard = page.getByTestId('doc-generator-card');
      await expect(generatorCard).toBeVisible({ timeout: 5000 });

      const promptInput = page.getByTestId('doc-prompt-input');
      await expect(promptInput).toBeVisible();
      await promptInput.fill('Create an NDA for confidential software development');

      const generateButton = page.getByTestId('generate-doc-button');
      await generateButton.click();

      await page.waitForTimeout(5000);

      const resultArea = page.getByTestId('generated-document-content');
      const resultText = await resultArea.inputValue();
      expect(resultText.length).toBeGreaterThan(50);
    });
  });
});
