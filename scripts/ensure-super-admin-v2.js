/**
 * Ensure Super Admin Exists
 *
 * - If Appwrite account exists for given email, use its ID.
 * - If not, create account.
 * - Ensure user document exists with role='admin'.
 *
 * Usage: node scripts/ensure-super-admin.js
 */

import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

if (!projectId || !apiKey) {
  console.error('❌ Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env');
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL || 'tony@techwithbrands.com';
const username = 'Tony Admin';
const role = 'admin';

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

async function findAccountByEmail(email) {
  // Use the Appwrite Users API (not the database) to list accounts
  // GET /users?queries[0][key]=email&queries[0][value]=...
  const url = `${endpoint}/users?queries[0][key]=email&queries[0][value]=${encodeURIComponent(email)}`;
  const res = await fetch(url, { headers: apiHeaders });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status} while searching users`);
  }
  const data = await res.json();
  if (data.users && data.users.length > 0) {
    return data.users[0]; // { $id, email, name, ... }
  }
  return null;
}

async function createAccount(email, password, name) {
  const res = await fetch(`${endpoint}/account`, {
    method: 'POST',
    headers: apiHeaders,
    body: JSON.stringify({
      userId: `admin_${Date.now()}`,
      email,
      password,
      name,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status} creating account`);
  }
  return data;
}

async function ensureUserDocument(userId, email, username, role) {
  const docUrl = `${endpoint}/databases/${databaseId}/collections/users/documents/${userId}`;
  const getRes = await fetch(docUrl, { headers: apiHeaders });
  if (getRes.ok) {
    // Update to ensure role and fields
    const patchRes = await fetch(docUrl, {
      method: 'PATCH',
      headers: apiHeaders,
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
      throw new Error(err.message || `HTTP ${patchRes.status} updating user doc`);
    }
    return 'updated';
  } else if (getRes.status === 404) {
    // Create new user document
    const createRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents`, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({
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
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      throw new Error(createData.message || `HTTP ${createRes.status} creating user doc`);
    }
    return 'created';
  } else {
    const err = await getRes.json();
    throw new Error(err.message || `HTTP ${getRes.status} fetching user doc`);
  }
}

async function main() {
  console.log(`\n=== Ensuring Super Admin: ${email} ===\n`);

  // 1. Find existing Appwrite account by email
  console.log('1. Searching for account...');
  let account = null;
  try {
    account = await findAccountByEmail(email);
    if (account) {
      console.log(`   ✅ Found account: ${account.$id} (${account.email})`);
    } else {
      console.log('   Account not found, will create one.');
    }
  } catch (err) {
    console.error(`   ⚠️  Error searching account: ${err.message}`);
  }

  // 2. Create account if missing
  if (!account) {
    console.log('2. Creating account...');
    account = await createAccount(email, 'Jene835*', username);
    console.log(`   ✅ Created account: ${account.$id}`);
  }

  // 3. Ensure user document with admin role
  console.log('3. Ensuring user document with admin role...');
  const action = await ensureUserDocument(account.$id, email, username, role);
  console.log(`   ✅ User document ${action} with role=${role}`);

  console.log('\n✅ Super admin ready:');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: Jene835*`);
  console.log(`   User ID:  ${account.$id}`);
  console.log(`   Role:     ${role}\n`);
}

main().catch(err => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
