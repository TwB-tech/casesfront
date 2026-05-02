import { chromium } from 'playwright';
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'e2e-results');
if (existsSync(OUT)) try { rmdirSync(OUT, { recursive: true, force: true }); } catch {}
mkdirSync(OUT, { recursive: true });

const BASE = 'https://www.kwakorti.live';
const PASSWORD = 'TestPass123!';

const roles = {
  individual: {
    button: 'Individual',
    step1: { 'full name': 'Indv User', email: `indv${Date.now()}@e.test`, 'phone number': `+254${700000000 + Math.floor(Math.random()*999999)}` },
    step2: { nationality: 'Kenyan', occupation: 'Engineer', bio: 'Individual test' },
  },
  advocate: {
    button: 'Advocate',
    step1: { 'full name': 'Adv User', email: `adv${Date.now()}@e.test`, 'phone number': `+254${700000000 + Math.floor(Math.random()*999999)}`, 'bar number': 'BAR12345' },
    step2: { 'practice areas': 'Corporate, Criminal', bio: 'Advocate test' },
  },
  firm: {
    button: 'Law Firm',
    step1: { 'Law Firm Name': 'Test Firm LLP', 'registration number': `REG${Date.now()}`, email: `firm${Date.now()}@e.test`, 'phone number': `+254${700000000 + Math.floor(Math.random()*999999)}` },
    step2: { address: '123 Legal Ave, Nairobi', 'practice areas': 'Corporate, Criminal', bio: 'Firm test' },
  }
};

console.log('=== REAL BROWSER SIGNUP: INDIVIDUAL, ADVOCATE, LAW FIRM ===');
console.log('Base URL:', BASE);
console.log('Roles:', Object.keys(roles).join(', '));
console.log('');

async function testRole(roleKey, cfg) {
  console.log(`\n--- ${roleKey.toUpperCase()} ---`);
  const email = cfg.step1.email;
  const outDir = join(OUT, `${roleKey}-${Date.now()}`);
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    const txt = msg.text();
    if (msg.type() === 'error' || /Invalid userId|Registration failed/.test(txt)) errors.push(`[${msg.type()}] ${txt}`);
  });

  try {
    await page.goto(`${BASE}/signup`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(outDir, '01.png'), fullPage: true });

    // Role selection
    await page.getByRole('button', { name: new RegExp(cfg.button, 'i') }).click();
    await page.waitForTimeout(1000);

    // Step 1
    for (const [field, val] of Object.entries(cfg.step1)) {
      const escaped = field.replace(/['"]/g, ''); // try raw name
      try {
        await page.fill(`input[name="${field}"]`, val);
      } catch {
        await page.fill(`input[name="${escaped}"]`, val);
      }
    }
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(2000);

    // Step 2
    for (const [field, val] of Object.entries(cfg.step2)) {
      if (field === 'bio' || field === 'practice areas') {
        try {
          await page.fill(`textarea[name="${field}"]`, val);
        } catch {
          await page.fill(`textarea[name="${field.toLowerCase()}"]`, val);
        }
      } else {
        try {
          await page.fill(`input[name="${field}"]`, val);
        } catch {
          await page.fill(`input[name="${field.toLowerCase()}"]`, val);
        }
      }
    }
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(2000);

    // Step 3: Password
    const pd = page.locator('input[type="password"]');
    await pd.nth(0).fill(PASSWORD);
    await pd.nth(1).fill(PASSWORD);
    await page.getByRole('button', { name: /review/i }).click();
    await page.waitForTimeout(2000);

    // Submit
    await page.screenshot({ path: join(outDir, '02-summary.png'), fullPage: true });
    await page.getByRole('button', { name: /submit/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: join(outDir, '03-result.png'), fullPage: true });

    // Check result
    const body = await page.textContent('body');
    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  Errors: ${errors.length}`);

    if (errors.length > 0) {
      writeFileSync(join(outDir, 'errors.log'), errors.join('\n'));
      console.log(`  Errors captured (${errors.length}):`);
      errors.forEach(e => console.log(`    ${e}`));
      await browser.close();
      return false;
    }

    const ok = body.toLowerCase().includes('success') || url.includes('register-success');
    console.log(`  => ${ok ? '✅ PASS' : '❌ FAIL'}`);
    await browser.close();
    return ok;
  } catch (e) {
    console.error(`  ❌ Exception: ${e.message}`);
    writeFileSync(join(outDir, 'exception.txt'), e.stack);
    await browser.close();
    return false;
  }
}

// Execute tests
const results = {};
for (const [role, cfg] of Object.entries(roles)) {
  results[role] = await testRole(role, cfg);
}

console.log('\n=== FINAL RESULTS ===');
Object.entries(results).forEach(([r, p]) => console.log(`${p ? '✅' : '❌'} ${r}: ${p ? 'PASS' : 'FAIL'}`));
const allOk = Object.values(results).every(Boolean);
if (!allOk) process.exit(1);
console.log('\n🎉 All role signup flows verified!');
