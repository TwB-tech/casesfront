/**
 * Production Smoke Test
 *
 * Simulates real user flows against the deployed Appwrite instance.
 * Run: node scripts/production-smoke-test.js
 *
 * Tests:
 * 1. Create account (registration)
 * 2. Login
 * 3. Create case
 * 4. Create document
 * 5. Logout
 *
 * Uses same endpoints as frontend (through axiosConfig).
 */

import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

const headers = {
  'X-Appwrite-Project': projectId,
  'Content-Type': 'application/json',
};

let sessionSecret = null;

function setSession(secret) {
  sessionSecret = secret;
  headers['X-Appwrite-Session'] = secret;
}

function clearSession() {
  sessionSecret = null;
  delete headers['X-Appwrite-Session'];
}

async function api(method, path, body) {
  const url = `${endpoint}${path}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function createUser(email, password, username, role = 'individual') {
  // 1. Create Appwrite account
  const { data: account } = await api('POST', '/account', {
    userId: `test_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
    email,
    password,
    name: username,
  });

  // 2. Create session
  const { data: session } = await api('POST', '/account/sessions/email', { email, password });
  setSession(session.secret);

  // 3. Create user document
  const userId = account.$id;
  await api('POST', `/databases/${databaseId}/collections/users/documents`, {
    documentId: userId,
    data: {
      id: userId,
      email,
      username,
      role,
      organization_id: null,
      status: 'Active',
      messaging_enabled: true,
      deadline_notifications: true,
      email_verified: false,
      created_at: new Date().toISOString(),
    },
  });

  return { userId, email, username, role };
}

async function login(email, password) {
  const { data: session } = await api('POST', '/account/sessions/email', { email, password });
  setSession(session.secret);
  const { data: account } = await api('GET', '/account');
  return { userId: account.$id, email: account.email };
}

async function createCase(title, organizationId = null) {
  const caseId = `test_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;
  await api('POST', '/case', {
    id: caseId,
    title,
    case_number: `TEST-${Date.now()}`,
    description: 'Smoke test case',
    organization_id: organizationId,
    created_by: user.userId || 'current', // use authenticated user
  });
  return caseId;
}

async function createDocument(title, ownerId) {
  const docId = `test_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;
  await api('POST', '/document_management/api/documents', {
    title,
    description: 'Smoke test document',
    owner: ownerId,
    organization_id: null,
    shared_with: [],
  });
  return docId;
}

async function logout() {
  try {
    await api('DELETE', '/account/sessions/current');
  } catch (e) {
    // ignore
  }
  clearSession();
}

async function run() {
  console.log('\n=== Production Smoke Test ===\n');
  const timestamp = Date.now();
  const testEmail = `smoke${timestamp}@example.com`;
  const testPassword = 'TestPass123!';
  const testName = 'Smoke User';

  try {
    // 1. Create account
    console.log('1. Creating account...');
    const user = await createUser(testEmail, testPassword, testName);
    console.log(`   ✅ Created: ${user.email} (${user.role})`);

    // 2. Create case
    console.log('2. Creating case...');
    const caseId = await createCase('Test Case');
    console.log(`   ✅ Case created: ${caseId}`);

    // 3. Create document
    console.log('3. Creating document...');
    const docId = await createDocument('Test Doc', user.userId);
    console.log(`   ✅ Document created: ${docId}`);

    // 4. Logout
    console.log('4. Logging out...');
    await logout();
    console.log('   ✅ Logged out');

    // 5. Login again
    console.log('5. Logging in again...');
    const loginResult = await login(testEmail, testPassword);
    console.log(`   ✅ Logged in as ${loginResult.email}`);

    // 6. Verify data persistence (fetch case)
    console.log('6. Verifying persisted data...');
    const { data: cases } = await api('GET', '/case');
    const myCase = cases.find(c => c.id === caseId);
    if (!myCase) throw new Error('Case not found after re-login');
    console.log(`   ✅ Case persists: ${myCase.title}`);

    console.log('\n✅ All smoke tests passed!\n');
  } catch (error) {
    console.error('\n❌ Smoke test failed:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', error.data || '');
    process.exit(1);
  }
}

run().catch(console.error);
