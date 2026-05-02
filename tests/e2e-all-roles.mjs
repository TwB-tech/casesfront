// Real browser E2E signup tests for all roles
import { chromium } from 'playwright';
import { existsSync, mkdirSync, rmdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OUT = join(__dirname, '..', 'e2e-results');
if (existsSync(OUT)) {
  try { rmdirSync(OUT, { recursive: true, force: true }); } catch {}
}
mkdirSync(OUT, { recursive: true });

const BASE = 'https://www.kwakorti.live';
const PASSWORD = 'TestPass123!';

const roles = {
  individual: {
    button: 'Individual',
    fields: {
      step1: { 'full name': 'Indv User', 'email': 'indv@e.test', 'phone number': '+254700000001' },
      step2: { nationality: 'Kenyan', occupation: 'Engineer', bio: 'Individual test' },
    }
  },
  advocate: {
    button: 'Advocate',
    fields: {
      step1: { 'full name': 'Adv User', 'email': 'adv@e.test', 'phone number': '+254700000002', 'bar number': 'BAR12345' },
      step2: { 'practice areas': 'Corporate, Criminal', bio: 'Advocate test' },
    }
  },
  firm: {
    button: 'Law Firm',
    fields: {
      step1: { 'Law Firm Name': 'Test Firm LLP', 'registration number': 'REG123456', 'email': 'firm@e.test', 'phone number': '+254700000003' },
      step2: { address: '123 Legal Ave, Nairobi', 'practice areas': 'Corporate, Criminal', bio: 'Firm test' },
    }
  }
};

console.log('=== REAL BROWSER SIGNUP TESTS FOR ALL ROLES ===');
console.log('Target:', BASE);
console.log('Roles to test:', Object.keys(roles).join(', '));
console.log('');

async function testRole(roleKey, config) {
  console.log(`\n--- Testing ${roleKey.toUpperCase()} ---`);
  const email = config.fields.step1.email;
  const password = PASSWORD;
  const ts = Date.now();
  const outDir = `${OUT}/${roleKey}-${ts}`;
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    const t = msg.type();
    const txt = msg.text();
    if (t === 'error' || /Invalid userId|Registration failed/i.test(txt)) errors.push(`[${t}] ${txt}`);
  });

  try {
    // Go to signup
    await page.goto(`${BASE}/signup`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/01-page.png`, fullPage: true });

    // Select role
    console.log(`  Selecting ${config.button}...`);
    await page.getByRole('button', { name: new RegExp(config.button, 'i') }).click();
    await page.waitForTimeout(1000);

    // Step 1
    console.log('  Step 1: Basic info');
    const step1Data = config.fields.step1;
    for (const [fieldName, value] of Object.entries(step1Data)) {
      const normalized = fieldName.toLowerCase();
      await page.waitForSelector(`input[name="${fieldName}"]`, { state: 'visible', timeout: 15000 }).catch(async () => {
        // Try lowercase variant
        await page.waitForSelector(`input[name="${normalized}"]`, { state: 'visible', timeout: 15000 });
      });
      // Try the exact field name first
      try {
        await page.fill(`input[name="${fieldName}"]`, value);
      } catch {
        await page.fill(`input[name="${normalized}"]`, value);
      }
    }
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(2000);

    // Step 2
    console.log('  Step 2: Additional details');
    const step2Data = config.fields.step2;
    for (const [fieldName, value] of Object.entries(step2Data)) {
      const normalized = fieldName.toLowerCase();
      if (fieldName === 'bio' || fieldName === 'practice areas') {
        try {
          await page.fill(`textarea[name="${fieldName}"]`, value);
        } catch {
          await page.fill(`textarea[name="${normalized}"]`, value);
        }
      } else {
        try {
          await page.fill(`input[name="${fieldName}"]`, value);
        } catch {
          await page.fill(`input[name="${normalized}"]`, value);
        }
      }
    }
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(2000);

    // Step 3: Password
    console.log('  Step 3: Password');
    await page.waitForSelector('input[name="password"]', { state: 'visible', timeout: 15000 });
    const pwdInputs = page.locator('input[type="password"]');
    await pwdInputs.nth(0).fill(password);
    await pwdInputs.nth(1).fill(password);
    await page.getByRole('button', { name: /review/i }).click();
    await page.waitForTimeout(2000);

    // Step 4: Submit
    console.log('  Submitting...');
    await page.screenshot({ path: `${outDir}/02-summary.png`, fullPage: true });
    await page.getByRole('button', { name: /submit/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${outDir}/03-result.png`, fullPage: true });

    // Evaluate
    const body = await page.textContent('body');
    const url = page.url();
    console.log(`  Final URL: ${url}`);
    console.log(`  Console errors: ${errors.length}`);

    if (errors.length > 0) {
      console.error('  Errors:', errors);
      fs.writeFileSync(`${outDir}/errors.log`, errors.join('\n'));
      await browser.close();
      return false;
    }

    const success = body.toLowerCase().includes('success') || url.includes('register-success');
    if (success) {
      console.log(`  ✅ ${roleKey} signup succeeded`);
      return true;
    } else {
      console.log(`  ❌ ${roleKey} signup failed - no success indicator`);
      fs.writeFileSync(`${outDir}/body.txt`, body);
      await browser.close();
      return false;
    }

    await browser.close();
  } catch (err) {
    console.error(`  ❌ Exception for ${roleKey}:`, err.message);
    await page.screenshot({ path: `${outDir}/error.png`, fullPage: true });
    await browser.close();
    return false;
  }
}

// Run all tests sequentially
const results = {};
for (const [role, cfg] of Object.entries(roles)) {
  results[role] = await testRole(role, cfg);
}

console.log('\n=== SUMMARY ===');
for (const [role, passed] of Object.entries(results)) {
  console.log(`${passed ? '✅' : '❌'} ${role}: ${passed ? 'PASS' : 'FAIL'}`);
}
const allPassed = Object.values(results).every(Boolean);
if (!allPassed) process.exit(1);
console.log('\n🎉 All signup flows verified successfully in real browser!');
