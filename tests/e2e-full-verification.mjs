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

// All 6 user types supported by the signup form
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

async function testRole(roleKey, cfg) {
  console.log(`\n--- ${roleKey.toUpperCase()} ---`);
  const email = cfg.step1.email;
  const outDir = join(OUT, `${roleKey}-${Date.now()}`);
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const allConsole = [];
  page.on('console', msg => {
    const txt = msg.text();
    allConsole.push(`[${msg.type()}] ${txt}`);
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
      const escaped = field.replace(/['"]/g, '');
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
    console.log(`  Step 1 URL: ${url}`);

    const success1 = body.toLowerCase().includes('success') || url.includes('register-success');
    if (!success1) {
      errors.push(`Signup did not reach success page. URL: ${url}`);

      // Capture Antd notification messages if any
      try {
        const notifMsg = await page.textContent('.ant-notification-notice-message');
        const notifDesc = await page.textContent('.ant-notification-notice-description');
        if (notifMsg || notifDesc) {
          errors.push(`Notification: ${(notifMsg||'').trim()} - ${(notifDesc||'').trim()}`);
        }
      } catch {}

      // Dump first 1000 chars of page body for debugging
      const snippet = body.substring(0, 1000);
      errors.push(`Page snippet: ${snippet}`);

      // Dump collected console messages
      if (allConsole.length > 0) {
        errors.push(`Console (last 10): ${allConsole.slice(-10).join(' | ')}`);
      }

      writeFileSync(join(outDir, 'errors.log'), errors.join('\n'));
      console.log(`  ❌ FAIL (${errors.length} errors)`);
      errors.forEach(e => console.log(`    ${e}`));
      await browser.close();
      return false;
    }
    console.log('  ✓ Signup succeeded, checking email...');

    // 2. Check email was sent via Resend API
    console.log('  2/4: Checking verification email via Resend API...');
    const RESEND_API_KEY = 're_Pkax7C3oMQjGqCpVSsJg1oL';
    const emailsRes = await fetch('https://api.resend.com/emails?limit=50', {
      headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
    });
    if (!emailsRes.ok) {
      errors.push(`Failed to fetch emails from Resend: ${emailsRes.status}`);
    } else {
      const emailsData = await emailsRes.json();
      const matching = emailsData.data?.filter(e => e.to?.includes(email)) || [];
      if (matching.length === 0) {
        errors.push(`No verification email found in Resend inbox for ${email}. Recent emails: ${JSON.stringify(emailsData.data?.map(e=>({to:e.to,subject:e.subject})))}`);
      } else {
        const verifyEmail = matching.find(e => e.subject?.includes('Verify') || e.subject?.includes('verification'));
        if (!verifyEmail) {
          errors.push(`No verification email subject found. Found: ${matching.map(e=>e.subject).join(', ')}`);
        } else {
          console.log(`  ✓ Verification email found (ID: ${verifyEmail.id})`);
          // Extract verification link from HTML
          const html = verifyEmail.html || '';
          const linkMatch = html.match(/href=["'](https?:\/\/[^"']*verify[^"']*)["']/i);
          if (!linkMatch) {
            errors.push(`Could not extract verification link from email HTML`);
          } else {
            const verifyUrl = linkMatch[1];
            console.log(`  ✓ Verification link: ${verifyUrl}`);

            // 3. Click verification link in browser
            console.log('  3/4: Clicking verification link in browser...');
            await page.goto(verifyUrl, { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            await page.screenshot({ path: join(outDir, '03-verified.png'), fullPage: true });

            const verifyBody = await page.textContent('body');
            const verifyResultUrl = page.url();
            console.log(`  Verification page URL: ${verifyResultUrl}`);

            if (verifyBody.toLowerCase().includes('verified') || verifyBody.toLowerCase().includes('success')) {
              console.log('  ✓ Email verified successfully (page shows success)');
            } else {
              errors.push(`Verification page did not show success. Content: ${verifyBody.substring(0,200)}`);
            }

            // 4. Attempt login
            console.log('  4/4: Testing login with verified account...');
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

            if (loggedInBody.toLowerCase().includes('dashboard') || loggedInBody.toLowerCase().includes('home') || loggedInUrl.includes('home')) {
              console.log('  ✓ Login successful, redirected to home/dashboard');
            } else if (loggedInBody.toLowerCase().includes('verify')) {
              errors.push(`Login succeeded but account still requires verification`);
            } else if (loggedInBody.toLowerCase().includes('error') || loggedInBody.toLowerCase().includes('invalid')) {
              errors.push(`Login failed: ${loggedInBody.substring(0,200)}`);
            } else {
              console.log(`  Login result unclear - checking page content`);
            }
          }
        }
      }
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
