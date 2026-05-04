/**
 * Ensure Super Admin Exists (Login-based)
 *
 * 1. Login as admin@techwithbrands.com (password: Jene835*)
 * 2. Get account ID from session
 * 3. Ensure user document for that ID has role='admin'
 *
 * This works because the account already exists.
 */

import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

const email = process.env.ADMIN_EMAIL || 'tony@techwithbrands.com';
const password = 'Jene835*';
const username = 'Tony Admin';
const role = 'admin';

const headers = {
  'X-Appwrite-Project': projectId,
  'Content-Type': 'application/json',
};

async function login() {
  const res = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data; // contains secret
}

async function getAccount(sessionSecret) {
  const res = await fetch(`${endpoint}/account`, {
    headers: {
      ...headers,
      'X-Appwrite-Session': sessionSecret,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'GET account failed');
  return data; // contains $id, email, name, etc.
}

async function ensureUserDocument(userId, sessionSecret) {
  const docHeaders = {
    ...headers,
    'X-Appwrite-Session': sessionSecret,
  };
  const docUrl = `${endpoint}/databases/${databaseId}/collections/users/documents/${userId}`;

  // Try get
  const getRes = await fetch(docUrl, { headers: docHeaders });
  if (getRes.ok) {
    // Patch to admin
    const patchRes = await fetch(docUrl, {
      method: 'PATCH',
      headers: docHeaders,
      body: JSON.stringify({
        data: {
          role,
          username,
          email,
          updated_at: new Date().toISOString(),
        },
      }),
    });
    if (!patchRes.ok) {
      const err = await patchRes.json();
      throw new Error(err.message || `PATCH failed ${patchRes.status}`);
    }
    return 'updated';
  } else if (getRes.status === 404) {
    // Create
    const createRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents`, {
      method: 'POST',
      headers: docHeaders,
      body: JSON.stringify({
        documentId: userId,
        data: {
          id: userId,
          email,
          username,
          role: 'admin',
          organization_id: null,
          status: 'Active',
          messaging_enabled: true,
          deadline_notifications: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      throw new Error(createData.message || `POST failed ${createRes.status}`);
    }
    return 'created';
  } else {
    const err = await getRes.json();
    throw new Error(err.message || `GET failed ${getRes.status}`);
  }
}

async function main() {
  console.log(`\n=== Ensuring Super Admin: ${email} ===\n`);

  try {
    // 1. Login
    console.log('1. Logging in...');
    const { secret } = await login();
    console.log(`   ✅ Logged in`);

    // 2. Get account
    console.log('2. Getting account info...');
    const account = await getAccount(secret);
    console.log(`   ✅ Account ID: ${account.$id}`);

    // 3. Ensure user document
    console.log('3. Ensuring user document with admin role...');
    const action = await ensureUserDocument(account.$id, secret);
    console.log(`   ✅ User document ${action}`);

    console.log('\n✅ Super admin ready:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID:  ${account.$id}`);
    console.log(`   Role:     admin\n`);
  } catch (err) {
    console.error('\n❌ Failed:', err.message);
    if (err.data) console.error('Details:', JSON.stringify(err.data, null, 2));
    process.exit(1);
  }
}

main();
