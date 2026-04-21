import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  test('Reya API should respond', async ({ request }) => {
    // Test the Reya API endpoint
    const response = await request.post('/api/reya', {
      data: {
        message: 'Hello Reya',
        context: {},
        quick: false,
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('content');
    expect(data).toHaveProperty('actions');
  });

  test('Reya API should handle missing message', async ({ request }) => {
    const response = await request.post('/api/reya', {
      data: {},
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success', true);
  });
});
