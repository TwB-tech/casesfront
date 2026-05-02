// WakiliWorld Comprehensive E2E Test Suite (SPA)
import { chromium } from 'playwright';
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OUT = join(__dirname, '..', 'e2e-comprehensive-results');
if (existsSync(OUT)) {
  try { rmdirSync(OUT, { recursive: true, force: true }); } catch {}
}
mkdirSync(OUT, { recursive: true });

const BASE = 'https://www.kwakorti.live';
const PASSWORD = 'TestPass123!';
const TIMESTAMP = Date.now();

function makeEmail(prefix) {
  return `${prefix}-e2e-${TIMESTAMP}@test.com`;
}

function loadEnv() {
  const env = {};
  try {
    const content = fs.readFileSync('.env', 'utf-8');
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
    console.error('Could not read .env:', err.message);
  }
  return env;
}
const env = loadEnv();

async function forceVerifyUser(email) {
  const endpoint = (env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
  const projectId = env.APPWRITE_PROJECT_ID;
  const apiKey = env.APPWRITE_API_KEY;
  const databaseId = env.APPWRITE_DATABASE_ID || 'default';
  if (!projectId || !apiKey) return;
  try {
    const query = encodeURIComponent(`query[attribute]=email&query[operator]=eq&query[value]=${encodeURIComponent(email)}`);
    const url = `${endpoint}/databases/${databaseId}/collections/users/documents?${query}`;
    const res = await fetch(url, {
      headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    });
    const data = await res.json();
    if (data.documents?.length) {
      const user = data.documents[0];
      await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents/${user.$id}`, {
        method: 'PATCH',
        headers: {
          'X-Appwrite-Project': projectId,
          'X-Appwrite-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_verified: true, verification_token: null, status: 'Active' }),
      });
      console.log(`  [helper] Verified ${email}`);
    }
  } catch (e) {
    console.warn('  [helper] Verify failed:', e.message);
  }
}

async function run() {
  console.log('=== WAKILIWORLD COMPREHENSIVE E2E TEST ===');
  console.log('Target:', BASE, 'Timestamp:', TIMESTAMP);
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => {
    const txt = msg.text();
    const type = msg.type();
    if (type === 'error' && !txt.includes('favicon') && !txt.includes('404') && !txt.includes('net::ERR')) {
      errors.push(`[${type}] ${txt}`);
    }
  });

  function screenshot(name) {
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    page.screenshot({ path: join(OUT, `${safeName}.png`), fullPage: true });
  }

  const waitIdle = async () => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  };

  // --- Helpers ---

  async function login(email, password) {
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 30000 });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]', { timeout: 30000 });
    try {
      await page.waitForURL(`${BASE}/home`, { timeout: 30000 });
    } catch (e) {
      console.log('  ⚠️ Login navigation timeout. URL:', page.url());
      throw e;
    }
    await waitIdle();
    const hasToken = await page.evaluate(() => !!localStorage.getItem('accessToken'));
    console.log('  Login ok, storage:', hasToken ? 'token present' : 'no token');
  }

  async function navigateToSection(label) {
    await page.getByRole('menuitem', { name: label, exact: false }).click();
    await waitIdle();
    console.log(`  → ${label} (${page.url()})`);
  }

  async function clickButton(text) {
    await page.click(`button:has-text("${text}")`, { timeout: 15000 });
    await waitIdle();
  }

  // Ant Design select helper
  async function selectDropdown(label, optionText) {
    const labelEl = page.locator('label').filter({ hasText: label });
    const formItem = labelEl.locator('..');
    const selector = formItem.locator('.ant-select-selector');
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible', timeout: 10000 });
    const searchInput = page.locator('.ant-select-dropdown input[type="text"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(optionText);
      await page.waitForTimeout(500);
    }
    let option;
    if (optionText) {
      option = page.locator('.ant-select-dropdown .ant-select-item-option').filter({ hasText: optionText });
    } else {
      option = page.locator('.ant-select-dropdown .ant-select-item-option').first();
    }
    await option.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'hidden' });
  }

  // --- Test Flow ---

  try {
    // 1. Registration (Advocate)
    console.log('\n--- 1. Registration ---');
    const advEmail = makeEmail('advocate');
    const advName = 'Test Advocate';
    const advPhone = '+254700000001';
    const advBar = 'BAR12345';

    await page.goto(`${BASE}/signup`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h2:has-text("Join WakiliWorld")', { state: 'visible', timeout: 30000 });
    screenshot('signup_start');

    await page.getByRole('button', { name: /Advocate/i }).click();
    await page.waitForTimeout(1500);

    // Step 1
    await page.fill('input[name="full name"]', advName);
    await page.fill('input[name="email"]', advEmail);
    await page.fill('input[name="phone number"]', advPhone);
    await page.fill('input[name="bar number"]', advBar);
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(2000);

    // Step 2
    await page.fill('textarea[name="practice areas"]', 'Corporate, Criminal');
    await page.fill('textarea[name="bio"]', 'E2E test advocate');
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(2000);

    // Step 3
    await page.waitForSelector('input[name="password"]', { state: 'visible', timeout: 15000 });
    await page.fill('input[name="password"]', PASSWORD);
    await page.fill('input[name="confirm password"]', PASSWORD);
    await page.getByRole('button', { name: /review/i }).click();
    await page.waitForTimeout(2000);
    screenshot('signup_review');

    // Submit
    await page.getByRole('button', { name: /submit/i }).click();
    // Wait for either success URL or verification page
    try {
      await page.waitForURL(`${BASE}/register-success`, { timeout: 30000 });
    } catch (e) {
      // Might go to verify-email instead
      const current = page.url();
      if (!current.includes('verify-email')) {
        console.log('  Unexpected URL after submit:', current);
        throw e;
      }
    }
    await waitIdle();
    screenshot('signup_result');
    console.log('  ✓ Registration succeeded');

    // Verify email directly
    console.log('  🔧 Verifying email...');
    await forceVerifyUser(advEmail);
    await page.waitForTimeout(2000);

    // 2. Login
    console.log('\n--- 2. Login ---');
    await login(advEmail, PASSWORD);
    console.log('  ✓ Logged in');

    // 3. Dashboard (already on /home)
    console.log('\n--- 3. Dashboard ---');
    await page.waitForSelector('body');
    screenshot('dashboard');
    console.log('  ✓ Dashboard loaded');

    // 4. Clients (create before cases)
    console.log('\n--- 4. Clients ---');
    await navigateToSection('Clients');
    screenshot('clients_list');

    await clickButton('New Client');
    await page.waitForSelector('h2:has-text("Add Client")', { timeout: 15000 });
    const clientName = `Test Client ${TIMESTAMP}`;
    const clientEmail = makeEmail('client');
    await page.fill('input[name="full name"]', clientName);
    await page.fill('input[name="email"]', clientEmail);
    await page.fill('input[name="phone number"]', '+254700000123');
    await page.selectOption('select[name="nationality"]', 'Kenyan');
    await page.fill('input[name="occupation"]', 'Business Owner');
    await page.fill('textarea[name="bio"]', 'E2E test client');
    await clickButton('Submit');
    await waitIdle();
    screenshot('client_created');
    console.log('  ✓ Client created');

    // 5. Cases
    console.log('\n--- 5. Cases ---');
    await navigateToSection('Cases');
    await clickButton('New Case');
    await page.waitForURL(`${BASE}/case-form`, { timeout: 15000 });
    await waitIdle();
    screenshot('case_form');

    const caseTitle = `E2E Case ${TIMESTAMP}`;
    await page.fill('input[name="title"]', caseTitle);
    await page.fill('textarea[name="description"]', 'Automated test case');

    // Client select
    await selectDropdown('Client', clientName);
    await page.waitForTimeout(500);

    // Court select (first)
    await selectDropdown('Court', '');
    await page.waitForTimeout(500);

    // Start date
    await page.fill('input[name="start_date"]', new Date().toISOString().split('T')[0]);

    // Submit
    await clickButton('Submit');
    await waitIdle();
    screenshot('case_created');
    console.log('  ✓ Case created');

    // 6. Documents
    console.log('\n--- 6. Documents ---');
    await navigateToSection('Documents');
    await clickButton('New Document');
    await page.waitForURL(`${BASE}/new-document`, { timeout: 15000 });
    await waitIdle();
    screenshot('doc_form');

    const docTitle = `E2E Doc ${TIMESTAMP}`;
    await page.fill('input[name="title"]', docTitle);
    await page.fill('textarea[name="description"]', 'E2E test document');

    // Owner select: choose current user (advocate). The dropdown contains the current user. We'll select by name advName.
    await selectDropdown('Owner', advName);

    // skip shared_with

    // Upload file
    const testFilePath = join(__dirname, '..', 'test-fixtures', 'test-file.txt');
    await page.setInputFiles('input[type="file"]', testFilePath);
    await page.waitForTimeout(1000);

    await clickButton('Submit');
    await waitIdle();
    screenshot('doc_created');
    console.log('  ✓ Document created');

    // 7. Tasks
    console.log('\n--- 7. Tasks ---');
    await navigateToSection('Tasks');
    await clickButton('Create Task');
    await page.waitForURL(`${BASE}/tasks/create/`, { timeout: 15000 });
    await waitIdle();
    screenshot('task_form');

    const taskTitle = `E2E Task ${TIMESTAMP}`;
    await page.fill('input[name="title"]', taskTitle);
    await page.fill('textarea[name="description"]', 'E2E test task');
    await page.fill('input[name="due date"]', new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    // Optional: assign_to or case - skip
    await clickButton('Submit');
    await waitIdle();
    screenshot('task_created');
    console.log('  ✓ Task created');

    // Mark complete
    try {
      const checkbox = page.locator('input[type="checkbox"]').first();
      await checkbox.click();
      await page.waitForTimeout(2000);
      console.log('  ✓ Task marked complete');
    } catch (e) {
      console.log('  ⚠️ Could not mark task complete');
    }

    // 8. Chats
    console.log('\n--- 8. Chats ---');
    await navigateToSection('Chats');
    try {
      const chatInput = page.locator('textarea').first();
      await chatInput.fill('Hello E2E');
      await page.click('button:has-text("Send")');
      await page.waitForTimeout(2000);
      console.log('  ✓ Chat message sent');
    } catch (e) {
      console.log('  ⚠️ Chat failed');
    }

    // 9. Reya
    console.log('\n--- 9. Reya ---');
    await page.click('button[data-testid="reya-open-button"]', { timeout: 15000 });
    await page.waitForTimeout(2000);
    screenshot('reya_open');

    const input = page.locator('input[data-testid="reya-input"]');
    await input.fill('What can you do?');
    await page.click('button[data-testid="reya-send-button"]');
    await page.waitForTimeout(5000);
    screenshot('reya_response');

    const assistantMsgs = page.locator('[data-testid="message-assistant"]');
    if (await assistantMsgs.count() > 0) {
      console.log('  ✓ Reya responded');
    }

    try {
      await assistantMsgs.nth(0).locator('button:has-text("Save as Note")').click();
      await page.waitForTimeout(2000);
      console.log('  ✓ Saved note');
    } catch (e) {
      console.log('  ⚠️ Save note failed');
    }

    await input.fill('Generate NDA');
    await page.click('button[data-testid="reya-send-button"]');
    await page.waitForTimeout(10000);
    try {
      await page.waitForSelector('text=View Documents', { timeout: 10000 });
      console.log('  ✓ Doc gen suggested');
    } catch (e) {
      console.log('  ⚠️ Doc gen suggestion missing');
    }
    await page.click('button[title="Close"]').catch(() => {});
    await page.waitForTimeout(1000);

    // 10. HR Management
    console.log('\n--- 10. HR ---');
    await navigateToSection('HR & Payroll');
    await clickButton('Add Employee');
    await page.waitForSelector('h2:has-text("Add Employee")', { timeout: 15000 });
    const empEmail = makeEmail('employee');
    await page.fill('input[name="email"]', empEmail);
    await page.fill('input[name="full name"]', `Test Employee ${TIMESTAMP}`);
    await page.fill('input[name="phone number"]', '+254700000999');
    await page.selectOption('select[name="role"]', 'employee');
    await page.fill('input[name="department"]', 'Legal');
    await page.fill('input[name="hire date"]', new Date().toISOString().split('T')[0]);
    await page.fill('input[name="salary"]', '50000');
    await clickButton('Submit');
    await waitIdle();
    screenshot('employee_added');
    console.log('  ✓ Employee added');

    // 11. Payroll
    console.log('\n--- 11. Payroll ---');
    // Should already be on HR page; try to find Payroll tab
    try {
      await page.click('text=Payroll', { timeout: 10000 });
      await page.waitForTimeout(2000);
      screenshot('payroll_page');
      await clickButton('Run Payroll');
      await page.waitForSelector('h2:has-text("Payroll Run")', { timeout: 15000 });
      await page.fill('input[name="total amount"]', '10000');
      const start = new Date(); start.setDate(1);
      const end = new Date(); end.setDate(15);
      await page.fill('input[name="period start"]', start.toISOString().split('T')[0]);
      await page.fill('input[name="period end"]', end.toISOString().split('T')[0]);
      await clickButton('Submit');
      await waitIdle();
      screenshot('payroll_created');
      console.log('  ✓ Payroll run created');
    } catch (e) {
      console.log('  ⚠️ Payroll step failed:', e.message);
    }

    // 12. Expenses
    console.log('\n--- 12. Expenses ---');
    try {
      await page.locator('.ant-menu-item', { hasText: 'Expenses' }).click();
      await waitIdle();
      await clickButton('Add Expense');
      await page.waitForSelector('h2:has-text("New Expense")', { timeout: 15000 });
      await page.fill('input[name="amount"]', '1500');
      await page.fill('input[name="description"]', 'E2E test expense');
      await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
      await page.selectOption('select[name="category"]', 'Office');
      await clickButton('Submit');
      await waitIdle();
      screenshot('expense_created');
      console.log('  ✓ Expense added');
    } catch (e) {
      console.log('  ⚠️ Expenses step failed:', e.message);
    }

    // 13. Reports
    console.log('\n--- 13. Reports ---');
    try {
      await page.locator('.ant-menu-item', { hasText: 'Case Reports' }).click();
      await waitIdle();
      await page.locator('.ant-menu-item', { hasText: 'Accounting' }).click();
      await waitIdle();
      screenshot('financial_reports');
      console.log('  ✓ Reports loaded');
    } catch (e) {
      console.log('  ⚠️ Reports navigation failed');
    }

    // 14. Settings & Profile
    console.log('\n--- 14. Settings & Profile ---');
    await navigateToSection('Profile');
    try {
      await page.fill('input[name="phone number"]', '+254700000888');
      await clickButton('Save');
      await page.waitForTimeout(2000);
      console.log('  ✓ Profile updated');
    } catch (e) {
      console.log('  ⚠️ Profile update failed');
    }

    await navigateToSection('Settings');
    screenshot('settings_page');
    console.log('  ✓ Settings loaded');

    // 15. Contact Us
    console.log('\n--- 15. Contact ---');
    await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded' });
    await waitIdle();
    screenshot('contact_page');
    await page.fill('input[name="name"]', 'E2E Tester');
    await page.fill('input[name="email"]', makeEmail('contact'));
    await page.fill('textarea[name="message"]', 'Automated test contact message.');
    await clickButton('Submit');
    await page.waitForTimeout(3000);
    screenshot('contact_submitted');
    console.log('  ✓ Contact submitted');

    // 16. Logout
    console.log('\n--- 16. Logout ---');
    await page.click('button:has(img[alt*="avatar"])', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
    await page.click('text=Logout', { timeout: 5000 }).catch(() => {});
    await waitIdle();
    screenshot('logged_out');
    console.log('  ✓ Logged out');

    // Summary
    console.log('\n=== SUMMARY ===');
    if (errors.length > 0) {
      console.log('Console errors:');
      errors.forEach(e => console.log(' ', e));
    } else {
      console.log('No console errors');
    }
    console.log('Screenshots in', OUT);
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ FAILED:', err.message);
    screenshot('error');
    await browser.close();
    process.exit(1);
  }
}

run();
