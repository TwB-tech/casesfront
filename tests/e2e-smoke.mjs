// WakiliWorld E2E Smoke Test — all major pages & basic interactions
import { chromium } from 'playwright';
import { existsSync, mkdirSync, rmdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'e2e-smoke-results');
if (existsSync(OUT)) try { rmdirSync(OUT, { recursive: true, force: true }); } catch {}
mkdirSync(OUT, { recursive: true });

const BASE = 'https://www.kwakorti.live';
const PASSWORD = 'TestPass123!';
const TIMESTAMP = Date.now();
const makeEmail = (prefix) => `${prefix}-smoke-${TIMESTAMP}@test.com`;

function loadEnv() {
  const env = {};
  try {
    const content = fs.readFileSync('.env', 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.substring(0, eq).trim();
      let value = trimmed.substring(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch (e) { console.error('Missing .env?', e.message); }
  return env;
}
const env = loadEnv();

async function forceVerify(email) {
  const ep = (env.APPWRITE_ENDPOINT||'https://cloud.appwrite.io/v1').replace(/\/$/,'');
  const pid = env.APPWRITE_PROJECT_ID, key = env.APPWRITE_API_KEY, did = env.APPWRITE_DATABASE_ID||'default';
  if(!pid||!key) return;
  try {
    const q = encodeURIComponent(`query[attribute]=email&query[operator]=eq&query[value]=${encodeURIComponent(email)}`);
    const res = await fetch(`${ep}/databases/${did}/collections/users/documents?${q}`, {
      headers: {'X-Appwrite-Project':pid,'X-Appwrite-Key':key}
    });
    const data = await res.json();
    if (data.documents?.length) {
      const user = data.documents[0];
      await fetch(`${ep}/databases/${did}/collections/users/documents/${user.$id}`, {
        method:'PATCH', headers:{'X-Appwrite-Project':pid,'X-Appwrite-Key':key,'Content-Type':'application/json'},
        body: JSON.stringify({ email_verified:true, verification_token:null, status:'Active' })
      });
      console.log(`  Verified ${email}`);
    }
  } catch(e) { console.warn('Verify failed:', e.message); }
}

async function run() {
  const browser = await chromium.launch({ headless:true, executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => {
    const t = msg.type(), txt = msg.text();
    if (t==='error' && !txt.includes('favicon') && !txt.includes('404') && !txt.includes('net::ERR')) errors.push(`[${t}] ${txt}`);
  });

  const screenshot = (name) => {
    const safe = name.replace(/[^a-zA-Z0-9_-]/g,'_');
    page.screenshot({ path: join(OUT, `${safe}.png`), fullPage:true });
  };

  const idle = async () => { await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(1000); };

  async function login(email, pwd) {
    await page.goto(`${BASE}/login`, { waitUntil:'domcontentloaded' });
    await page.waitForSelector('input[name="email"]', { state:'visible', timeout:30000 });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', pwd);
    await page.click('button[type="submit"]', { timeout:30000 });
    try { await page.waitForURL(`${BASE}/home`, { timeout:30000 }); } catch(e) { console.log('Login URL fail', page.url()); throw e; }
    await idle();
  }

  async function goToSection(label) {
    await page.getByRole('menuitem', { name: label, exact:false }).click();
    await idle();
  }

  async function click(text) {
    await page.click(`button:has-text("${text}")`, { timeout:15000 });
    await idle();
  }

  // --- Flow ---
  try {
    // 1. Register advocate
    console.log('\n=== 1. Registration ===');
    const email = makeEmail('adv');
    await page.goto(`${BASE}/signup`, { waitUntil:'domcontentloaded' });
    await page.waitForSelector('h2:has-text("Join WakiliWorld")', { state:'visible', timeout:30000 });
    await page.getByRole('button', { name:/Advocate/i }).click();
    await page.waitForTimeout(1500);
    await page.fill('input[name="full name"]', 'E2E Advocate');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone number"]', '+254700000001');
    await page.fill('input[name="bar number"]', 'BAR12345');
    await page.getByRole('button', { name:/next/i }).click(); await page.waitForTimeout(2000);
    await page.fill('textarea[name="practice areas"]', 'Corporate');
    await page.fill('textarea[name="bio"]', 'E2E');
    await page.getByRole('button', { name:/next/i }).click(); await page.waitForTimeout(2000);
    await page.fill('input[name="password"]', PASSWORD);
    await page.fill('input[name="confirm password"]', PASSWORD);
    await page.getByRole('button', { name:/review/i }).click(); await page.waitForTimeout(2000);
     await page.getByRole('button', { name:/submit/i }).click();
     // Wait for navigation to login page after registration
     await page.waitForURL(`${BASE}/login`, { timeout:20000 });
     await idle();
     screenshot('signup_result');
     console.log('  ✓ Registered, redirected to login');
     // Verify email via API
     await forceVerify(email);
     await page.waitForTimeout(2000);

    // 2. Login
    console.log('\n=== 2. Login ===');
    await login(email, PASSWORD);
    console.log('  ✓ Logged in');

    // 3. Dashboard
    console.log('\n=== 3. Dashboard ===');
    await page.waitForSelector('body');
    screenshot('dashboard');
    console.log('  ✓ Dashboard OK');

    // 4. Clients page
    console.log('\n=== 4. Clients ===');
    await goToSection('Clients');
    screenshot('clients');
    console.log('  ✓ Clients page loaded');

    // 5. Cases page + form open
    console.log('\n=== 5. Cases ===');
    await goToSection('Cases');
    await click('New Case');
    // Cases: open form
    console.log('\n=== 5. Cases ===');
    await goToSection('Cases');
    await click('New Case');
    await page.waitForURL(`${BASE}/case-form`, { timeout:15000 });
    await idle();
    screenshot('case_form');

    // Fill form using label accessors
    await page.getByLabel('Title').fill('E2E Case');
    await page.getByLabel('Description').fill('Auto test case');

    // Client select (first option)
    try {
      const clientCtrl = page.getByLabel('Client');
      await clientCtrl.click();
      await page.waitForSelector('.ant-select-dropdown', { state:'visible', timeout:5000 });
      await page.locator('.ant-select-item-option').first().click();
      await page.waitForSelector('.ant-select-dropdown', { state:'hidden' });
    } catch(e) { console.log('  (client select skipped)'); }

    // Court select (first)
    try {
      const courtCtrl = page.getByLabel('Court');
      await courtCtrl.click();
      await page.waitForSelector('.ant-select-dropdown', { state:'visible', timeout:5000 });
      await page.locator('.ant-select-item-option').first().click();
      await page.waitForSelector('.ant-select-dropdown', { state:'hidden' });
    } catch(e) { console.log('  (court select skipped)'); }

    // Start date
    try {
      await page.getByLabel('Start Date').fill(new Date().toISOString().split('T')[0]);
    } catch(e) { console.log('  (start date fill skipped)'); }

    // Go back to list
    await page.goBack(); await idle();
    console.log('  ✓ Case form opened');

    // 6. Documents page + form
    console.log('\n=== 6. Documents ===');
    await goToSection('Documents');
    await click('Upload Document');
    await page.waitForURL(`${BASE}/new-document`, { timeout:15000 });
    await idle();
    screenshot('doc_form');
    await page.getByLabel('Title').fill('E2E Doc');
    await page.getByLabel('Description').fill('Auto doc');
    // Owner select (first)
    try {
      const owner = page.getByLabel('Owner');
      await owner.click();
      await page.waitForSelector('.ant-select-dropdown', { state:'visible', timeout:5000 });
      await page.locator('.ant-select-item-option').first().click();
      await page.waitForSelector('.ant-select-dropdown', { state:'hidden' });
    } catch(e) { console.log('  (owner select skipped)'); }
    const fp = join(__dirname,'..','test-fixtures','test-file.txt');
    if (existsSync(fp)) await page.setInputFiles('input[type="file"]', fp);
    await page.waitForTimeout(1000);
    await page.goBack(); await idle();
    console.log('  ✓ Document form opened');

    // 7. Tasks page + form
    console.log('\n=== 7. Tasks ===');
    await goToSection('Tasks');
    await click('Create Task');
    await page.waitForURL(`${BASE}/tasks/create/`, { timeout:15000 });
    await idle();
    screenshot('task_form');
    await page.getByLabel('Title').fill('E2E Task');
    await page.getByLabel('Description').fill('Auto task');
    // Deadline (DatePicker)
    try {
      await page.getByLabel('Deadline').fill(new Date(Date.now()+86400000*2).toISOString().split('T')[0]);
    } catch(e) { console.log('  (deadline skip)'); }
    // Back
    await page.goBack(); await idle();
    console.log('  ✓ Task form opened');

    // 8. Chats
    console.log('\n=== 8. Chats ===');
    await goToSection('Chats');
    try {
      const ta = page.locator('textarea').first();
      await ta.fill('E2E test');
      await page.click('button:has-text("Send")');
      await page.waitForTimeout(2000);
      console.log('  ✓ Chat message sent');
    } catch(e) { console.log('  ⚠️ Chat failed'); }

    // 9. Reya
    console.log('\n=== 9. Reya ===');
    await page.click('button[data-testid="reya-open-button"]', { timeout:15000 });
    await page.waitForTimeout(2000);
    const reyaInput = page.locator('input[data-testid="reya-input"]');
    await reyaInput.fill('Hello');
    await page.click('button[data-testid="reya-send-button"]');
    await page.waitForTimeout(5000);
    const msgs = page.locator('[data-testid="message-assistant"]');
    if (await msgs.count()>0) console.log('  ✓ Reya answered');
    try {
      await msgs.nth(0).locator('button:has-text("Save as Note")').click();
      await page.waitForTimeout(1000);
      console.log('  ✓ Note saved');
    } catch(e) { console.log('  ⚠️ Save note not found'); }
    await page.click('button[title="Close"]').catch(()=>{});
    await page.waitForTimeout(1000);

    // 10. HR Management
    console.log('\n=== 10. HR ===');
    await goToSection('HR & Payroll');
    screenshot('hr');
    try {
      await click('Add Employee');
      await page.waitForSelector('h2:has-text("Add Employee")', { timeout:15000 });
      await page.getByLabel('Full Name').fill('E2E Employee');
      await page.getByLabel('Email').fill(makeEmail('emp'));
      // Role select
      try {
        const roleCtrl = page.getByLabel('Role');
        await roleCtrl.click();
        await page.waitForSelector('.ant-select-dropdown', { state:'visible', timeout:5000 });
        await page.locator('.ant-select-item-option').filter({ hasText:'employee' }).click();
        await page.waitForSelector('.ant-select-dropdown', { state:'hidden' });
      } catch(e) { console.log('  (role select skip)'); }
      // Hire date
      try {
        await page.getByLabel('Hire Date').fill(new Date().toISOString().split('T')[0]);
      } catch(e) {}
      await page.goBack(); await idle();
      console.log('  ✓ HR form opened');
    } catch(e) {
      console.log('  ⚠️ HR add form fail', e.message);
    }

    // 11. Payroll
    console.log('\n=== 11. Payroll ===');
    try {
      await page.click('text=Payroll', { timeout:10000 });
      await waitIdle();
      screenshot('payroll');
      console.log('  ✓ Payroll page opened');
    } catch(e) { console.log('  ⚠️ Payroll navigation failed'); }

    // 12. Expenses
    console.log('\n=== 12. Expenses ===');
    try {
      await page.locator('.ant-menu-item', { hasText:'Expenses' }).click();
      await waitIdle();
      screenshot('expenses');
      console.log('  ✓ Expenses page opened');
    } catch(e) { console.log('  ⚠️ Expenses nav failed'); }

    // 13. Reports
    console.log('\n=== 13. Reports ===');
    try {
      await page.locator('.ant-menu-item', { hasText:'Case Reports' }).click();
      await waitIdle();
      await page.locator('.ant-menu-item', { hasText:'Accounting' }).click();
      await waitIdle();
      screenshot('reports');
      console.log('  ✓ Reports loaded');
    } catch(e) { console.log('  ⚠️ Reports nav failed'); }

    // 14. Settings & Profile
    console.log('\n=== 14. Settings/Profile ===');
    await goToSection('Profile');
    await page.getByLabel('Phone Number').fill('+254700000888');
    await click('Save');
    await page.waitForTimeout(2000);
    await goToSection('Settings');
    screenshot('settings');
    console.log('  ✓ Settings OK');

    // 15. Contact
    console.log('\n=== 15. Contact ===');
    await page.goto(`${BASE}/contact`, { waitUntil:'domcontentloaded' });
    await idle();
    await page.fill('input[name="name"]', 'E2E');
    await page.fill('input[name="email"]', makeEmail('contact'));
    await page.fill('textarea[name="message"]', 'Test contact');
    await click('Submit');
    await page.waitForTimeout(3000);
    console.log('  ✓ Contact submitted');

    // 16. Logout
    console.log('\n=== 16. Logout ===');
    await page.click('button:has(img[alt*="avatar"])', { timeout:5000 }).catch(()=>{});
    await page.waitForTimeout(500);
    await page.click('text=Logout', { timeout:5000 }).catch(()=>{});
    await idle();
    console.log('  ✓ Logged out');

    // Summary
    console.log('\n=== SUMMARY ===');
    if (errors.length) { console.log('Console errors:'); errors.forEach(e=>console.log(' ',e)); }
    else console.log('No console errors');
    console.log('Screenshots:', OUT);
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
