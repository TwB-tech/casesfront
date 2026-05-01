# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-test.spec.ts >> API Tests >> Reya API should respond
- Location: tests\api-test.spec.ts:4:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('API Tests', () => {
  4  |   test('Reya API should respond', async ({ request }) => {
  5  |     // Test the Reya API endpoint
  6  |     const response = await request.post('/api/reya', {
  7  |       data: {
  8  |         message: 'Hello Reya',
  9  |         context: {},
  10 |         quick: false,
  11 |       },
  12 |     });
  13 | 
> 14 |     expect(response.status()).toBe(200);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  15 | 
  16 |     const data = await response.json();
  17 |     expect(data).toHaveProperty('success', true);
  18 |     expect(data).toHaveProperty('content');
  19 |     expect(data).toHaveProperty('actions');
  20 |   });
  21 | 
  22 |   test('Reya API should handle missing message', async ({ request }) => {
  23 |     const response = await request.post('/api/reya', {
  24 |       data: {},
  25 |     });
  26 | 
  27 |     expect(response.status()).toBe(200);
  28 | 
  29 |     const data = await response.json();
  30 |     expect(data).toHaveProperty('success', true);
  31 |   });
  32 | });
  33 | 
```