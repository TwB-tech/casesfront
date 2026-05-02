import { chromium } from 'playwright';
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'e2e-full-results');
if (existsSync(OUT)) try { rmdirSync(OUT, { recursive: true, force: true }); } catch {}
mkdirSync(OUT, { recursive: true });

const BASE = 'https://www.kwakorti.live';
const PASSWORD = 'TestPass123!';

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
    step1: { 'clinic name': 'Test Legal Aid', email: `clinic${Date.now()}@e.test', 'phone number': `+254700000005` },
    step2: { address: 'Mombasa', 'focus areas': 'Human Rights', bio: 'Clinic test' },
  },
  organization: {
    button: 'Organization',
    step1: { 'Organization Name': 'Test Org Inc', 'registration number': `REG${Date.now()}`, email: `org${Date.now()}@e.test`, 'phone number': `+254700000006` },
    step2: { address: 'Kisumu', industry: 'NGO', bio: 'Organization test' },
  },
};

console.log('=== REAL BROWSER SIGNUP + EMAIL VERIFICATION (TOKEN CAPTURE) ===');
console.log('Base URL:', BASE);
console.log('Roles:', Object.keys(roles).join(', '));
console.log('');

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
     console.log('  1/4: Starting signup...');
     await page.goto(`${BASE}/signup`, { waitUntil: 'domcontentloaded' });
     await page.waitForTimeout(1500);
     await page.screenshot({ path: join(outDir, '00-signup-page.png'), fullPage: true });

     // Capture the Appwrite request that creates the user document
     let appwriteReq = null;
     page.on('request', request => {
       const url = request.url();
       if (url.includes('/collections/users/documents') && request.method() === 'POST') {
         console.log('   [DEBUG] Appwrite create user document request detected');
         const postData = request.postData();
         try {
           const json = JSON.parse(postData);
           const hasToken = 'verification_token' in json;
           console.log('   [DEBUG] Request body keys:', Object.keys(json));
           console.log('   [DEBUG] verification_token present:', hasToken);
           if (hasToken) {
             console.log('   [DEBUG] verification_token value:', json.verification_token ? json.verification_token.substring(0,20)+'...' : 'null');
           }
         } catch (e) {
           console.log('   [DEBUG] Could not parse request body as JSON');
         }
       }
     });

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

    // Before submitting, set up request interception to capture verification token
    const emailReqPromise = page.waitForRequest(
      req => req.url().includes('/api/send-verification-email') && req.method() === 'POST'
    );

    await page.getByRole('button', { name: /submit/i }).click();

    // Wait for the verification email request
    let emailReq;
    try {
      emailReq = await Promise.race([
        emailReqPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for email request')), 10000))
      ]);
      const postData = JSON.parse(emailReq.postData());
      const token = postData.token;
      console.log(`  ✓ Captured verification token from email API request`);
      // Verify email using that token
      console.log('  2/4: Verifying email using token...');
      await page.goto(`${BASE}/verify-email?token=${token}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      await page.screenshot({ path: join(outDir, '02-verified.png'), fullPage: true });

      const verifyBody = await page.textContent('body');
      const verifyUrl = page.url();
      console.log(`  Verification page URL: ${verifyUrl}`);

      if (verifyBody.toLowerCase().includes('verified') || verifyBody.toLowerCase().includes('success') || verifyUrl.includes('/login')) {
        console.log('  ✓ Email verified successfully');
      } else {
        errors.push(`Verification did not succeed. Body: ${verifyBody.substring(0,200)}`);
      }
    } catch (e) {
      errors.push(`Failed to capture/use verification token: ${e.message}`);
    }

    // If token capture failed, we could attempt DB lookup as fallback, but skip for brevity.

    if (errors.length > 0) {
      writeFileSync(join(outDir, 'errors.log'), errors.join('\n'));
      console.log(`  ❌ FAIL (${errors.length} errors)`);
      errors.forEach(e => console.log(`    ${e}`));
      await browser.close();
      return false;
    }

    // 3. Test login
    console.log('  3/4: Testing login...');
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(outDir, '03-login.png'), fullPage: true });

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

// Execute all role tests sequentially
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
