import { chromium } from 'playwright';
import { existsSync, mkdirSync, rmdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'e2e-full-results');
if (existsSync(OUT)) try { rmdirSync(OUT, { recursive: true, force: true }); } catch {}
mkdirSync(OUT, { recursive: true });

const BASE = 'https://www.kwakorti.live';
const PASSWORD = 'TestPass123!';

// Load Appwrite admin credentials from .env for backend queries
function loadEnv() {
  const env = {};
  try {
    const content = readFileSync(join(process.cwd(), '.env'), 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      let value = trimmed.substring(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch (err) {
    console.warn('Could not read .env:', err.message);
  }
  return env;
}
const env = loadEnv();
const APPWRITE_ENDPOINT = (env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1').replace(/\/v1$/, '');
const APPWRITE_PROJECT_ID = env.APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = env.APPWRITE_DATABASE_ID || 'default';
const APPWRITE_API_KEY = env.APPWRITE_API_KEY; // server key

const roles = {
  individual: {
    button: 'Individual',
    step1: { 'full name': 'Indv User', email: `indv${Date.now()}@e.test`, 'phone number': `+254700000001` },
    step2: { nationality: 'Kenyan', occupation: 'Engineer', bio: 'Individual test' },
  },
  advocate: {
    button: 'Advocate',
    step1: { 'full name': 'Adv User', email: `adv${Date.now()}@e.test`, 'phone number': `+254700000002`, 'bar number': 'BAR12345' },
    step2: { 'practice areas': 'Corporate, Criminal', bio: 'Advocate test' },
  },
  firm: {
    button: 'Law Firm',
    step1: { 'Law Firm Name': 'Test Firm LLP', 'registration number': `REG${Date.now()}`, email: `firm${Date.now()}@e.test`, 'phone number': `+254700000003` },
    step2: { address: '123 Legal Ave, Nairobi', 'practice areas': 'Corporate, Criminal', bio: 'Firm test' },
  },
  'law school': {
    button: 'Law School',
    step1: { 'institution name': 'KSL Test', email: `lawschool${Date.now()}@e.test`, 'phone number': `+254700000004` },
    step2: { address: 'Nairobi', description: 'Law school test' },
  },
  'legal clinic': {
    button: 'Legal Clinic',
    step1: { 'clinic name': 'Test Legal Aid', email: `clinic${Date.now()}@e.test`, 'phone number': `+254700000005` },
    step2: { address: 'Mombasa', 'focus areas': 'Human Rights', bio: 'Clinic test' },
  },
  organization: {
    button: 'Organization',
    step1: { 'Organization Name': 'Test Org Inc', 'registration number': `REG${Date.now()}`, email: `org${Date.now()}@e.test`, 'phone number': `+254700000006` },
    step2: { address: 'Kisumu', industry: 'NGO', bio: 'Organization test' },
  },
};

console.log('=== COMPREHENSIVE SIGNUP + EMAIL VERIFICATION TEST ===');
console.log('Base URL:', BASE);
console.log('Roles:', Object.keys(roles).join(', '));
console.log('');

async function getVerificationToken(email) {
  if (!APPWRITE_API_KEY) throw new Error('APPWRITE_API_KEY not set in .env');
  const base = APPWRITE_ENDPOINT;
  const endpoint = `${base}/v1/databases/${APPWRITE_DATABASE_ID}/collections/users/documents`;
  const params = new URLSearchParams();
  params.append('queries[0][$eq]', 'email');
  params.append('queries[0][value]', email);
  const url = `${endpoint}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': APPWRITE_API_KEY,
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch user: ${res.status} - ${txt}`);
  }
  const data = await res.json();
  if (!data.documents || data.documents.length === 0) {
    throw new Error('User not found');
  }
  return data.documents[0].verification_token;
}

async function testRole(roleKey, cfg) {
  console.log(`\n--- ${roleKey.toUpperCase()} ---`);
  const email = cfg.step1.email;
  const outDir = join(OUT, `${roleKey}-${Date.now()}`);
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    const txt = msg.text();
    if (msg.type() === 'error' || /Invalid userId|Registration failed|ERROR|TypeError/.test(txt)) {
      errors.push(`[${msg.type()}] ${txt}`);
    }
  });

  try {
    // 1. Sign up
    console.log('  1/4: Starting signup...');
    await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(outDir, '00-signup-page.png'), fullPage: true });

    await page.getByRole('button', { name: new RegExp(cfg.button, 'i') }).click();
    await page.waitForTimeout(1000);

    // Step 1
    for (const [field, val] of Object.entries(cfg.step1)) {
      try {
        await page.fill(`input[name="${field}"]`, val);
      } catch {
        await page.fill(`input[name="${field.toLowerCase()}"]`, val);
      }
    }
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(2000);

    // Step 2
    for (const [field, val] of Object.entries(cfg.step2)) {
      if (['bio', 'description', 'practice areas', 'focus areas'].includes(field.toLowerCase())) {
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

    await page.screenshot({ path: join(outDir, '01-summary.png'), fullPage: true });
    await page.getByRole('button', { name: /submit/i }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: join(outDir, '02-post-submit.png'), fullPage: true });

    const body = await page.textContent('body');
    const url = page.url();
    console.log(`  Post-submit URL: ${url}`);

    const success1 = body.toLowerCase().includes('success') || url.includes('register-success');
    if (!success1) {
      errors.push(`Signup did not reach success page. URL: ${url}`);
      const notif = await page.textContent('.ant-notification-notice-message, .ant-notification-notice-description').catch(() => '');
      if (notif) errors.push(`Notification: ${notif}`);
      const snippet = body.substring(0, 500);
      errors.push(`Page snippet: ${snippet}`);
      writeFileSync(join(outDir, 'errors.log'), errors.join('\n'));
      console.log(`  ❌ FAIL (${errors.length} errors)`);
      errors.forEach(e => console.log(`    ${e}`));
      await browser.close();
      return false;
    }
    console.log('  ✓ Signup succeeded');

    // 2. Retrieve verification token from Appwrite directly
    console.log('  2/4: Retrieving verification token from Appwrite...');
    let verificationToken;
    try {
      verificationToken = await getVerificationToken(email);
      if (!verificationToken) {
        throw new Error('Token is empty');
      }
      console.log(`  ✓ Token retrieved (${verificationToken.substring(0, 10)}...)`);
    } catch (e) {
      errors.push(`Failed to get verification token: ${e.message}`);
      writeFileSync(join(outDir, 'errors.log'), errors.join('\n'));
      console.log(`  ❌ FAIL`);
      await browser.close();
      return false;
    }

    // 3. Visit verification page
    console.log('  3/4: Verifying email via React page...');
    await page.goto(`${BASE}/verify-email?token=${verificationToken}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: join(outDir, '03-verified.png'), fullPage: true });

    const verifyBody = await page.textContent('body');
    const verifyUrl = page.url();
    console.log(`  Verification page URL: ${verifyUrl}`);

    // The page should show success and redirect to /login or display message
    if (verifyBody.toLowerCase().includes('verified') || verifyBody.toLowerCase().includes('success') || verifyUrl.includes('/login')) {
      console.log('  ✓ Email verified successfully');
    } else {
      errors.push(`Verification did not succeed. Body: ${verifyBody.substring(0,200)}`);
    }

    // 4. Test login
    console.log('  4/4: Testing login...');
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(outDir, '04-login.png'), fullPage: true });

    const loggedInBody = await page.textContent('body');
    const loggedInUrl = page.url();
    console.log(`  Login URL: ${loggedInUrl}`);

    if (loggedInBody.toLowerCase().includes('dashboard') || loggedInUrl.includes('home')) {
      console.log('  ✓ Login successful');
    } else if (loggedInBody.toLowerCase().includes('verify')) {
      errors.push(`Login succeeded but account still requires verification`);
    } else if (loggedInBody.toLowerCase().includes('error') || loggedInBody.toLowerCase().includes('invalid')) {
      errors.push(`Login failed: ${loggedInBody.substring(0,200)}`);
    } else {
      console.log(`  Login result unclear - may need further check`);
    }

    await browser.close();

    if (errors.length > 0) {
      writeFileSync(join(outDir, 'errors.log'), errors.join('\n'));
      console.log(`  ❌ FAIL (${errors.length} errors)`);
      errors.forEach(e => console.log(`    ${e}`));
      return false;
    }

    console.log(`  ✅ PASS`);
    return true;

  } catch (e) {
    console.error(`  ❌ Exception: ${e.message}`);
    writeFileSync(join(outDir, 'exception.txt'), e.stack);
    await browser.close();
    return false;
  }
}

// Execute tests sequentially
const results = {};
for (const [role, cfg] of Object.entries(roles)) {
  console.log(`\n========== Testing: ${role.toUpperCase()} ==========`);
  results[role] = await testRole(role, cfg);
}

console.log('\n=== FINAL RESULTS ===');
Object.entries(results).forEach(([r, p]) => console.log(`${p ? '✅' : '❌'} ${r}: ${p ? 'PASS' : 'FAIL'}`));
const allOk = Object.values(results).every(Boolean);
if (!allOk) {
  process.exit(1);
}
console.log('\n🎉 All user types and verification flow tested successfully!');
