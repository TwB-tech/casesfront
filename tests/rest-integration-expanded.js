/**
 * WakiliWorld Appwrite Expanded Integration Test
 * Tests: Docs, HR, Expenses, Reports, Notes, ClientComm in addition to core modules
 */
import fs from 'fs';
import path from 'path';

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
  } catch (e) {
    console.error('Could not read .env:', e.message);
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const endpoint = (env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = env.APPWRITE_PROJECT_ID;
const apiKey = env.APPWRITE_API_KEY;
const databaseId = env.APPWRITE_DATABASE_ID || 'default';

if (!projectId || !apiKey) {
  console.error('Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY');
  process.exit(1);
}

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

let sessionSecret = null;

function setSession(secret) {
  sessionSecret = secret;
  headers['X-Appwrite-Session'] = secret;
}

function clearSession() {
  delete headers['X-Appwrite-Session'];
  sessionSecret = null;
}

async function api(method, path, body) {
  const url = `${endpoint}${path}`;
  const options = { method, headers };
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  let data;
  const ct = res.headers.get('content-type');
  if (ct && ct.includes('application/json')) data = await res.json();
  else data = { message: await res.text() };
  if (!res.ok) {
    const err = new Error(data.message || data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function uid() {
  return `t_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;
}

const results = { passed: 0, failed: 0, tests: [] };

function test(name) {
  return async (fn) => {
    try {
      await fn();
      results.passed++;
      results.tests.push({ name, status: 'PASS' });
      console.log(`✓ ${name}`);
    } catch (e) {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', error: e.message });
      console.log(`✗ ${name}: ${e.message}`);
    }
  };
}

async function run() {
  console.log('\n=== WakiliWorld Expanded Integration Test ===\n');

  // Use existing test users: create temp ones
  const TEST_USER = {
    email: `exp-${Date.now()}@test.com`,
    password: 'TestPass123!'
  };

  // AUTH
  console.log('🔹 Authentication');
  let userId;
  await test('Create user account')(async () => {
    const { data, error } = await api('POST', '/account', {
      userId: uid(),
      email: TEST_USER.email,
      password: TEST_USER.password,
      name: 'Exp Tester'
    });
    if (error) throw error;
    userId = data.$id;
  });

  await test('Create user profile in users collection')(async () => {
    await api('POST', `/databases/${databaseId}/collections/users/documents`, {
      documentId: userId,
      data: {
        id: userId,
        username: 'Exp Tester',
        email: TEST_USER.email,
        role: 'individual',
        status: 'Active',
        created_at: new Date().toISOString(),
      },
    });
  });

  await test('Login and set session')(async () => {
    const { data, error } = await api('POST', '/account/sessions', {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });
    if (error) throw error;
    setSession(data.secret);
  });

  // SESSION VERIFY
  await test('Verify session (get current account)')(async () => {
    const origKey = headers['X-Appwrite-Key'];
    delete headers['X-Appwrite-Key'];
    const me = await api('GET', '/account');
    if (me.email !== TEST_USER.email) throw new Error('Email mismatch');
    headers['X-Appwrite-Key'] = origKey;
  });

  // DOCUMENTS
  console.log('\n🔹 Documents');
  let docId;
  let fileId; // We'll simulate file_id if storage bucket available

  await test('Create document record')(async () => {
    const docDocId = uid();
    const doc = await api('POST', `/databases/${databaseId}/collections/documents/documents`, {
      documentId: docDocId,
      data: {
        id: docDocId,
        title: 'E2E Test Doc',
        description: 'Comprehensive test document',
        owner: userId,
        organization_id: 'org-pending',
        shared_with: [],
        created_at: new Date().toISOString(),
      },
    });
    docId = doc.$id;
  });

  await test('Read document')(async () => {
    const doc = await api('GET', `/databases/${databaseId}/collections/documents/documents/${docId}`);
    if (doc.title !== 'E2E Test Doc') throw new Error('Title mismatch');
  });

  await test('Update document')(async () => {
    const updated = await api('PATCH', `/databases/${databaseId}/collections/documents/documents/${docId}`, {
      data: { title: 'Updated Doc Title' },
    });
    if (updated.title !== 'Updated Doc Title') throw new Error('Update failed');
  });

  await test('Delete document')(async () => {
    await api('DELETE', `/databases/${databaseId}/collections/documents/documents/${docId}`);
    try {
      await api('GET', `/databases/${databaseId}/collections/documents/documents/${docId}`);
      throw new Error('Document should be gone');
    } catch (e) {
      if (e.status !== 404) throw e;
    }
  });

  // NOTES
  console.log('\n🔹 Notes');
  await test('Create note')(async () => {
    const noteDocId = uid();
    await api('POST', `/databases/${databaseId}/collections/notes/documents`, {
      documentId: noteDocId,
      data: {
        id: noteDocId,
        user_id: userId,
        organization_id: 'org-pending',
        title: 'E2E Note',
        content: 'This is a test note',
        created_at: new Date().toISOString(),
      },
    });
  });

  await test('List notes')(async () => {
    const res = await api('GET', '/notes');
    if (!res.results || !Array.isArray(res.results)) throw new Error('Invalid notes list');
  });

  // CLIENT COMMUNICATIONS
  console.log('\n🔹 Client Communications');
  await test('Create client communication')(async () => {
    const commDocId = uid();
    await api('POST', `/databases/${databaseId}/collections/communications/documents`, {
      documentId: commDocId,
      data: {
        id: commDocId,
        organization_id: 'org-pending',
        subject: 'E2E Comm',
        message: 'Test client communication',
        sender_id: userId,
        recipient_ids: [userId],
        created_at: new Date().toISOString(),
      },
    });
  });

  await test('List client communications')(async () => {
    const res = await api('GET', '/clientcomm/api/clientcommunications');
    if (!res.results || !Array.isArray(res.results)) throw new Error('Invalid communications list');
  });

  // HR: EMPLOYEES
  console.log('\n🔹 HR - Employees');
  await test('List employees via hr/employees endpoint')(async () => {
    // Requires admin to create other employee; will just self as individual can't access fully; may get empty or filtered.
    // In Appwrite, endpoint filters by role and org. We'll call and verify it returns an object with results array.
    const res = await api('GET', '/hr/employees');
    if (!res.results || !Array.isArray(res.results)) throw new Error('Invalid employee list');
  });

  // HR: INVITES (list)
  console.log('\n🔹 HR - Invites');
  await test('List pending invites')(async () => {
    const res = await api('GET', '/hr/invites');
    if (!res.results) throw new Error('Missing results');
  });

  // PAYROLL
  console.log('\n🔹 Payroll');
  await test('Create payroll run')(async () => {
    // Create minimal payroll
    const payload = {
      period_start: new Date().toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      total_amount: 1000,
      organization_id: 'org-pending',
    };
    const res = await api('POST', '/payroll', payload);
    if (!res.id) throw new Error('Payroll run not created');
  });

  await test('List payroll runs')(async () => {
    const res = await api('GET', '/payroll');
    if (!Array.isArray(res)) throw new Error('Payroll list invalid');
  });

  // EXPENSES
  console.log('\n🔹 Expenses');
  await test('Create expense')(async () => {
    const payload = {
      amount: 500,
      description: 'E2E test expense',
      date: new Date().toISOString().split('T')[0],
      category: 'Office',
      organization_id: 'org-pending',
    };
    const res = await api('POST', '/expenses', payload);
    if (!res.id) throw new Error('Expense not created');
  });

  // REPORTS
  console.log('\n🔹 Reports');
  await test('Financial reports endpoint')(async () => {
    const res = await api('GET', '/reports/financial');
    if (!res.results || !Array.isArray(res.results)) throw new Error('Invalid financial reports');
  });

  await test('User stats endpoint')(async () => {
    const res = await api('GET', '/users/stats');
    if (!res.totalCases && res.totalCases !== 0) throw new Error('Invalid stats structure');
  });

  // FIRM LISTING
  console.log('\n🔹 Firms');
  await test('List firms')(async () => {
    const res = await api('GET', '/firm');
    if (!res.results || !Array.isArray(res.results)) throw new Error('Invalid firms list');
  });

  // LOGOUT
  console.log('\n🔹 Cleanup');
  await test('Logout')(async () => {
    await api('POST', '/auth/logout');
    clearSession();
  });

  // SUMMARY
  console.log('\n=== Test Summary ===');
  console.log(`Total: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  if (results.failed > 0) {
    console.log('\nFailed tests:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => console.log(` - ${t.name}: ${t.error}`));
    process.exit(1);
  } else {
    console.log('\n✅ All expanded integration tests passed');
  }
}

run().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
