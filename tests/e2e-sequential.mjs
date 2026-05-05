// Sequential E2E: Individual → Firm → Advocate registration on production
// Uses unique emails per run to avoid conflicts
import { chromium } from 'playwright';
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OUT = join(__dirname, '..', 'e2e-sequential-results');
if (existsSync(OUT)) {
  try { rmdirSync(OUT, { recursive: true, force: true }); } catch {}
}
mkdirSync(OUT, { recursive: true });

const BASE = 'https://www.kwakorti.live';
const PASSWORD = 'TestPass123!';
const TIMESTAMP = Date.now();

// Unique emails to avoid collisions with existing test data
function makeEmail(prefix) {
  return `${prefix}-${TIMESTAMP}@e.test`;
}

// Order: Individual → Firm → Advocate
const roles = [
  {
    key: '01-individual',
    label: 'Individual',
    email: makeEmail('indv'),
    fields: {
      step1: { 'full name': 'Indv User', 'phone number': '+254700000001' },
      step2: { nationality: 'Kenyan', occupation: 'Engineer', bio: 'Individual test' },
    }
  },
  {
    key: '02-firm',
    label: 'Law Firm',
    email: makeEmail('firm'),
    fields: {
      step1: { 'Law Firm Name': 'Test Firm LLP', 'registration number': 'REG123456', 'phone number': '+254700000003' },
      step2: { address: '123 Legal Ave, Nairobi', 'practice areas': 'Corporate, Criminal', bio: 'Firm test' },
    }
  },
  {
    key: '03-advocate',
    label: 'Advocate',
    email: makeEmail('adv'),
    fields: {
      step1: { 'full name': 'Adv User', 'phone number': '+254700000002', 'bar number': 'BAR12345' },
      step2: { 'practice areas': 'Corporate, Criminal', bio: 'Advocate test' },
    }
  },
];

console.log('=== SEQUENTIAL E2E: INDIVIDUAL → FIRM → ADVOCATE ===');
console.log('Target:', BASE);
console.log('Order:', roles.map(r => r.key).join(' → '));
console.log('Emails:', roles.map(r => r.email).join(', '));
console.log('');

async function testRole(roleConfig) {
  const { key, label, email, fields } = roleConfig;
  console.log(`\n--- [${key}] ${label} Registration ---`);
  const outDir = join(OUT, key);
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    const txt = msg.text();
    const type = msg.type();
    // Only flag errors that indicate registration failure
    if (type === 'error' && (/Invalid userId|Registration failed|auth\.create failed|Signup error/i.test(txt))) {
      errors.push(`[${type}] ${txt}`);
    }
  });

  try {
    // Navigate to signup
    await page.goto(`${BASE}/signup`, { waitUntil: 'domcontentloaded' });
    // Wait for the page heading to ensure loaded
    await page.waitForSelector('h2:has-text("Join WakiliWorld")', { state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${outDir}/01-signup.png`, fullPage: true });

    // Select role button - wait for button to be visible then click
    console.log(`  Selecting role: ${label}...`);
    const roleButton = page.getByRole('button', { name: new RegExp(label, 'i') });
    await roleButton.waitFor({ state: 'visible', timeout: 30000 });
    await roleButton.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/02-role-selected.png`, fullPage: true });

    // Step 1: Basic info (includes email)
    console.log('  Filling step 1...');
    const step1Combined = { ...fields.step1, email };
    for (const [fieldName, value] of Object.entries(step1Combined)) {
      const normalized = fieldName.toLowerCase();
      try {
        await page.fill(`input[name="${fieldName}"]`, value);
      } catch {
        await page.fill(`input[name="${normalized}"]`, value);
      }
    }
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${outDir}/03-step1-filled.png`, fullPage: true });

    // Step 2: Additional details
    console.log('  Filling step 2...');
    for (const [fieldName, value] of Object.entries(fields.step2)) {
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
    await page.screenshot({ path: `${outDir}/04-step2-filled.png`, fullPage: true });

    // Step 3: Password
    console.log('  Setting password...');
    await page.waitForSelector('input[name="password"]', { state: 'visible', timeout: 15000 });
    const pwdInputs = page.locator('input[type="password"]');
    await pwdInputs.nth(0).fill(PASSWORD);
    await pwdInputs.nth(1).fill(PASSWORD);
    await page.getByRole('button', { name: /review/i }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${outDir}/05-review.png`, fullPage: true });

    // Submit
    console.log('  Submitting registration...');
    await page.getByRole('button', { name: /submit/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${outDir}/06-result.png`, fullPage: true });

     // After signup, expect redirect to login page
     const body = await page.textContent('body');
     const url = page.url();
     console.log(`  Final URL: ${url}`);
     if (errors.length > 0) {
       console.log(`  Console warnings/errors (may be unrelated): ${errors.length}`);
     }

     const success = url.includes('/login') || body.toLowerCase().includes('registration successful');
    if (success) {
      console.log(`  ✅ ${label} registration succeeded`);
      await browser.close();
      return true;
    } else {
      console.log(`  ❌ ${label} registration failed - expected verify-email or success`);
      if (errors.length > 0) {
        console.error('  Registration-related errors:', errors);
        writeFileSync(`${outDir}/errors.log`, errors.join('\n'));
      }
      writeFileSync(`${outDir}/body.txt`, body);
      await browser.close();
      return false;
    }
  } catch (err) {
    console.error(`  ❌ Exception for ${label}:`, err.message);
    await page.screenshot({ path: `${outDir}/error.png`, fullPage: true });
    await browser.close();
    return false;
  }
}

// Run sequentially in specified order
const results = {};
for (const role of roles) {
  results[role.key] = await testRole(role);
  console.log(`  → Result: ${results[role.key] ? '✅ PASS' : '❌ FAIL'}`);
  if (role !== roles[roles.length - 1]) {
    console.log('  Waiting 3s before next role...\n');
    await new Promise(r => setTimeout(r, 3000));
  }
}

console.log('\n=== FINAL SUMMARY ===');
let allPassed = true;
for (const [key, passed] of Object.entries(results)) {
  console.log(`${passed ? '✅' : '❌'} ${key}: ${passed ? 'PASS' : 'FAIL'}`);
  if (!passed) allPassed = false;
}
console.log(allPassed ? '\n🎉 All 3 registration flows succeeded!' : '\n⚠️  Some flows failed - check logs');

process.exit(allPassed ? 0 : 1);
