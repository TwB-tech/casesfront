/**
 * Create or Ensure Super Admin
 *
 * - Search all Appwrite accounts for email
 * - If found: use that account ID
 * - If not: create account with given password
 * - Ensure user document exists with role='admin'
 */

import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

if (!projectId || !apiKey) {
  console.error('Missing env');
  process.exit(1);
}

const email = 'tony@techwithbrands.com';
const username = 'Tony Admin';
const role = 'admin';
const password = 'Jene835*';

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

async function listAllAccounts() {
  // Use simpler query: just list all and filter client-side
  const all = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const res = await fetch(`${endpoint}/users?limit=${limit}&offset=${offset}`, { headers: apiHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    all.push(...(data.users || []));
    if (data.users?.length < limit) break;
    offset += limit;
  }
  return all;
}
  return all;
}

async function main() {
  console.log(`\n=== Ensuring Super Admin: ${email} ===`);

  // 1. Search for existing account
  console.log('\n1. Searching Appwrite accounts...');
  let accounts;
  try {
    accounts = await listAllAccounts();
    const match = accounts.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (match) {
      console.log(`   ✅ Found account: ${match.$id} (${match.email})`);
      // 2. Ensure user doc is admin
      console.log('2. Ensuring user document role=admin...');
      await ensureUserDoc(match.$id, email, username, role);
      console.log('\n✅ Super admin ready.\n');
      return;
    } else {
      console.log('   Account not found, will create...');
    }
  } catch (err) {
    console.error('   ⚠️  Error listing accounts:', err.message);
  }

  // 3. Create account
  console.log('3. Creating new account...');
  const createRes = await fetch(`${endpoint}/account`, {
    method: 'POST',
    headers: apiHeaders,
    body: JSON.stringify({
      userId: `admin_${Date.now()}`,
      email,
      password,
      name: username,
    }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(createData.message || `HTTP ${createRes.status} creating account`);
  }
  const accountId = createData.$id;
  console.log(`   ✅ Account created: ${accountId}`);

  // 4. Create user document
  console.log('4. Creating user document with admin role...');
  await ensureUserDoc(accountId, email, username, role);
  console.log('\n✅ Super admin created.\n');
}

async function ensureUserDoc(userId, email, username, role) {
  const docHeaders = apiHeaders;
  const docUrl = `${endpoint}/databases/${databaseId}/collections/users/documents/${userId}`;

  // Try get
  const getRes = await fetch(docUrl, { headers: docHeaders });
  if (getRes.ok) {
    const getData = await getRes.json();
    if (getData.data?.role === role) {
      console.log(`   User document already has admin role.`);
      return;
    }
    // Patch
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
    const patchData = await patchRes.json();
    if (!patchRes.ok) throw new Error(patchData.message || `PATCH failed ${patchRes.status}`);
    console.log(`   ✅ Updated user document role to ${role}`);
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
    if (!createRes.ok) throw new Error(createData.message || `POST failed ${createRes.status}`);
    console.log(`   ✅ Created user document with role admin`);
  } else {
    const err = await getRes.json();
    throw new Error(err.message || `GET failed ${getRes.status}`);
  }
}

main().catch(err => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
