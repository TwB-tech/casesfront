import { chromium } from 'playwright';
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'e2e-full-results');
if (existsSync(OUT)) {
  try {
    rmdirSync(OUT, { recursive: true, force: true });
  } catch {}
}
mkdirSync(OUT, { recursive: true });

const BASE = process.env.E2E_BASE_URL || 'https://www.kwakorti.live';
const PASSWORD = process.env.E2E_PASSWORD || 'TestPass123!';

const roles = {
  individual: {
    button: 'Individual',
    step1: {
      'full name': 'Indv User',
      email: `indv${Date.now()}@e.test`,
      'phone number': '+254700000001',
    },
    step2: { nationality: 'Kenyan', occupation: 'Engineer', bio: 'Individual test' },
  },
  advocate: {
    button: 'Advocate',
    step1: {
      'full name': 'Adv User',
      email: `adv${Date.now()}@e.test`,
      'phone number': '+254700000002',
      'bar number': 'BAR12345',
    },
    step2: { 'practice areas': 'Corporate, Criminal', bio: 'Advocate test' },
  },
  firm: {
    button: 'Law Firm',
    step1: {
      'Law Firm Name': 'Test Firm LLP',
      'registration number': `REG${Date.now()}`,
      email: `firm${Date.now()}@e.test`,
      'phone number': '+254700000003',
    },
    step2: { address: '123 Legal Ave, Nairobi', 'practice areas': 'Corporate, Criminal', bio: 'Firm test' },
  },
  'law school': {
    button: 'Law School',
    step1: {
      'institution name': 'KSL Test',
      email: `lawschool${Date.now()}@e.test`,
      'phone number': '+254700000004',
    },
    step2: { address: 'Nairobi', description: 'Law school test' },
  },
  'legal clinic': {
    button: 'Legal Clinic',
    step1: {
      'clinic name': 'Test Legal Aid',
      email: `clinic${Date.now()}@e.test`,
      'phone number': '+254700000005',
    },
    step2: { address: 'Mombasa', 'focus areas': 'Human Rights', bio: 'Clinic test' },
  },
  organization: {
    button: 'Organization',
    step1: {
      'Organization Name': 'Test Org Inc',
      'registration number': `REG${Date.now()}`,
      email: `org${Date.now()}@e.test`,
      'phone number': '+254700000006',
    },
    step2: { address: 'Kisumu', industry: 'NGO', bio: 'Organization test' },
  },
};

console.log('=== REAL BROWSER SIGNUP + EMAIL VERIFICATION (TOKEN CAPTURE) ===');
console.log('Base URL:', BASE);
console.log('Roles:', Object.keys(roles).join(', '));
console.log('');

async function fillByName(page, selectorBase, field, value) {
  try {
    await page.fill(`${selectorBase}[name="${field}"]`, value);
  } catch {
    await page.fill(`${selectorBase}[name="${field.toLowerCase()}"]`, value);
  }
}

async function testRole(roleKey, cfg) {
  console.log(`\n--- ${roleKey.toUpperCase()} ---`);
  const email = cfg.step1.email;
  const outDir = join(OUT, `${roleKey}-${Date.now()}`);
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', (msg) => {
    const txt = msg.text();
    if (
      /Invalid userId|Registration failed|No permissions provided|Failed to create user profile|Unable to create organization|Signup error|Organization creation error|Registration error|ERROR/.test(
        txt
      )
    ) {
      errors.push(`[${msg.type()}] ${txt}`);
    }
  });

  try {
    console.log('  1/4: Starting signup...');
    await page.goto(`${BASE}/signup`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(outDir, '00-signup-page.png'), fullPage: true });

    await page.getByRole('button', { name: new RegExp(cfg.button, 'i') }).click();
    await page.waitForTimeout(1000);

    for (const [field, val] of Object.entries(cfg.step1)) {
      await fillByName(page, 'input', field, val);
    }
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(2000);

    for (const [field, val] of Object.entries(cfg.step2)) {
      if (['bio', 'description', 'practice areas', 'focus areas'].includes(field.toLowerCase())) {
        await fillByName(page, 'textarea', field, val);
      } else {
        await fillByName(page, 'input', field, val);
      }
    }
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(2000);

    const pd = page.locator('input[type="password"]');
    await pd.nth(0).fill(PASSWORD);
    await pd.nth(1).fill(PASSWORD);
    await page.getByRole('button', { name: /review/i }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(outDir, '01-summary.png'), fullPage: true });

    const emailReqPromise = page.waitForRequest(
      (req) => req.url().includes('/api/send-verification-email') && req.method() === 'POST',
      { timeout: 15000 }
    );
    const emailResPromise = page
      .waitForResponse(
        (res) => res.url().includes('/api/send-verification-email') && res.request().method() === 'POST',
        { timeout: 20000 }
      )
      .catch(() => null);

    await page.getByRole('button', { name: /submit/i }).click();

    let token = null;
    try {
      const emailReq = await emailReqPromise;
      const postData = JSON.parse(emailReq.postData() || '{}');
      token = postData.token;
      if (!token) {
        errors.push('Verification token missing in /api/send-verification-email request');
      } else {
        console.log('  [OK] Captured verification token from email API request');
      }

      const emailRes = await emailResPromise;
      if (emailRes) {
        if (emailRes.status() >= 200 && emailRes.status() < 300) {
          console.log(`  [OK] Email API status: ${emailRes.status()}`);
        } else {
          errors.push(`Email API returned status ${emailRes.status()}`);
        }
      } else {
        console.log('  [INFO] Email API response not captured (possible navigation race)');
      }
    } catch (e) {
      errors.push(`Failed to capture verification email request: ${e.message}`);
    }

    if (token) {
      console.log('  2/4: Verifying email using token...');
      try {
        await page.goto(`${BASE}/verify-email?token=${token}`, { waitUntil: 'domcontentloaded' });
      } catch (e) {
        const msg = String(e?.message || e);
        if (!msg.includes('ERR_ABORTED')) {
          throw e;
        }
      }
      await page.waitForURL('**/login', { timeout: 15000 }).catch(() => {});
      await page.waitForFunction(
        () => {
          const text = (document.body?.innerText || '').toLowerCase();
          return text.includes('verified') || text.includes('success') || window.location.pathname.includes('/login');
        },
        { timeout: 15000 }
      ).catch(() => {});

      await page.screenshot({ path: join(outDir, '02-verified.png'), fullPage: true });
      const verifyBody = ((await page.textContent('body')) || '').toLowerCase();
      const verifyUrl = page.url();
      console.log(`  Verification page URL: ${verifyUrl}`);

      if (verifyBody.includes('verified') || verifyBody.includes('success') || verifyUrl.includes('/login')) {
        console.log('  [OK] Email verified successfully');
      } else {
        errors.push(`Verification did not succeed. Body: ${verifyBody.substring(0, 200)}`);
      }
    }

    console.log('  3/4: Testing login...');
    const loginContext = await browser.newContext();
    const loginPage = await loginContext.newPage();
    await loginPage.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await loginPage.waitForTimeout(1500);
    await loginPage.fill('input[name="email"]', email);
    await loginPage.fill('input[name="password"]', PASSWORD);
    const loginResponsePromise = loginPage
      .waitForResponse(
        (res) =>
          (res.url().includes('/auth/login') || res.url().includes('/account/sessions/email')) &&
          res.request().method() === 'POST',
        { timeout: 15000 }
      )
      .catch(() => null);
    await loginPage.getByRole('button', { name: /login|sign in/i }).click();
    await loginPage.waitForLoadState('domcontentloaded');
    const loginResponse = await loginResponsePromise;
    if (loginResponse) {
      console.log(`  Login API status: ${loginResponse.status()}`);
    } else {
      errors.push('Login API response was not captured');
    }
    await loginPage.waitForURL('**/home**', { timeout: 10000 }).catch(() => {});
    await loginPage.waitForTimeout(3000);
    await loginPage.screenshot({ path: join(outDir, '03-login.png'), fullPage: true });

    const loggedInBody = ((await loginPage.textContent('body')) || '').toLowerCase();
    const loggedInUrl = loginPage.url();
    console.log(`  Login URL: ${loggedInUrl}`);

    if (
      loggedInBody.includes('dashboard') ||
      loggedInUrl.includes('home') ||
      (loginResponse && [200, 201].includes(loginResponse.status()))
    ) {
      console.log('  [OK] Login successful');
    } else if (loggedInBody.includes('verify')) {
      errors.push('Login succeeded but account still requires verification');
    } else if (loggedInBody.includes('error') || loggedInBody.includes('invalid')) {
      errors.push(`Login failed: ${loggedInBody.substring(0, 200)}`);
    } else {
      console.log('  [INFO] Login result ambiguous; no explicit failure markers found');
    }

    await loginContext.close();
    await browser.close();

    if (errors.length > 0) {
      writeFileSync(join(outDir, 'errors.log'), errors.join('\n'));
      console.log(`  [FAIL] ${errors.length} issue(s)`);
      errors.forEach((e) => console.log(`    ${e}`));
      return false;
    }

    console.log('  [PASS]');
    return true;
  } catch (e) {
    console.error(`  [EXCEPTION] ${e.message}`);
    writeFileSync(join(outDir, 'exception.txt'), e.stack || String(e));
    await browser.close();
    return false;
  }
}

const results = {};
for (const [role, cfg] of Object.entries(roles)) {
  console.log(`\n========== Testing: ${role.toUpperCase()} ==========`);
  results[role] = await testRole(role, cfg);
}

console.log('\n=== FINAL RESULTS ===');
for (const [role, passed] of Object.entries(results)) {
  console.log(`${passed ? '[PASS]' : '[FAIL]'} ${role}: ${passed ? 'PASS' : 'FAIL'}`);
}

if (!Object.values(results).every(Boolean)) {
  process.exit(1);
}
console.log('\nAll user types and verification flow tested successfully.');
