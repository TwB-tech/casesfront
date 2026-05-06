import { config } from 'dotenv';
config();
import { ID } from 'appwrite';

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

if (!projectId || !apiKey) {
  console.error('Missing env vars');
  process.exit(1);
}

async function request(method, path, options = {}) {
  const url = `${endpoint}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'X-Appwrite-Project': projectId,
      ...options.headers,
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function main() {
  const userId = ID.unique();
  const email = `e2e_${Date.now()}@example.com`;
  const password = 'TestPass123!';
  const username = 'E2E User';

  console.log('1. Create Appwrite account');
  await request('POST', '/account', {
    body: { userId, email, password, name: username },
    headers: { 'X-Appwrite-Key': apiKey, 'Content-Type': 'application/json' },
  });
  console.log('   ✓ Account created');

  const token = ID.unique();
  console.log('2. Create user document with verification_token:', token);
  await request('POST', `/databases/${databaseId}/collections/users/documents`, {
    body: {
      documentId: userId,
      data: {
        id: userId,
        username,
        email,
        role: 'individual',
        organization_id: null,
        status: 'Active',
        email_verified: false,
        verification_token: token,
      },
    },
    headers: { 'X-Appwrite-Key': apiKey, 'Content-Type': 'application/json' },
  });
  console.log('   ✓ User document created');

  // Verify
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
  console.log('3. Verify via', `${baseUrl}/api/verify-email`);
  const verifyRes = await fetch(`${baseUrl}/api/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok) {
    console.error('   ❌ Verify failed:', verifyRes.status, verifyData);
    process.exit(1);
  }
  console.log('   ✓ Verified');

  // Create session (login)
  console.log('4. Create session (login)');
  const session = await request('POST', '/account/sessions/email', {
    body: { email, password },
    headers: { 'X-Appwrite-Key': apiKey, 'Content-Type': 'application/json' },
  });
  const sessionSecret = session.secret;
  if (!sessionSecret) throw new Error('No session secret returned');
  console.log('   ✓ Session secret obtained');

  // Access user document using session
  console.log('5. Read user document with session');
  const userWithSession = await request('GET', `/databases/${databaseId}/collections/users/documents/${userId}`, {
    headers: { 'X-Appwrite-Session': sessionSecret },
  });
  console.log('   email_verified:', userWithSession.email_verified);
  console.log('   verification_token:', userWithSession.verification_token);

  if (!userWithSession.email_verified) {
    console.error('❌ Still not verified');
    process.exit(1);
  }

  console.log('\n✅ Full verification flow succeeded');

  // Cleanup: delete user doc and account? For safety, delete doc, account can be left or deleted via account delete? Not necessary for test.
  await request('DELETE', `/databases/${databaseId}/collections/users/documents/${userId}`, {
    headers: { 'X-Appwrite-Key': apiKey },
  }).catch(() => {});
  console.log('Cleaned up test user');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
