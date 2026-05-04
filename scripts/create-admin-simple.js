/**
 * Create or Promote Super Admin
 *
 * Creates account if doesn't exist, ensures user document has admin role.
 * Email: tony@techwithbrands.com
 * Password: Jene835*
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

async function run() {
  console.log(`\nEnsuring super admin: ${email}`);

  // Generate a deterministic user ID based on a prefix and timestamp to avoid conflict
  const userId = `admin_${Date.now()}`;

  try {
    // 1. Create the account (may succeed or fail if email already exists)
    console.log('1. Attempting to create account...');
    const createAccRes = await fetch(`${endpoint}/account`, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({
        userId,
        email,
        password,
        name: username,
      }),
    });
    const createAccData = await createAccRes.json();
    if (createAccRes.ok) {
      console.log(`   ✅ Account created: ${createAccData.$id}`);
    } else {
      if (createAccData.code === 'user_already_exists') {
        console.log(`   ⚠️  Account already exists. We'll ensure user document role.`);
        // Try to get the user document by email via database query
        // Since we can't list accounts, we just need to ensure user doc for some ID, but we don't know the account ID.
        // Alternative: we could list user documents by email in the users collection.
        // That's what we'll do: query users collection by email.
        const listRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents?queries[0][key]=email&queries[0][value]=${encodeURIComponent(email)}`, {
          headers: apiHeaders,
        });
        const listData = await listRes.json();
        if (!listRes.ok) throw new Error(listData.message || `HTTP ${listRes.status}`);
        if (!listData.documents || listData.documents.length === 0) {
          throw new Error('Account exists but user document not found. Creating new doc...');
        }
        const existingUserDoc = listData.documents[0];
        const existingUserId = existingUserDoc.$id;
        console.log(`   Found user document ID: ${existingUserId}`);

        // Update user doc to admin role
        console.log('2. Updating user doc to admin...');
        const patchRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents/${existingUserId}`, {
          method: 'PATCH',
          headers: apiHeaders,
          body: JSON.stringify({
            data: {
              role: 'admin',
              username,
            },
          }),
        });
        const patchData = await patchRes.json();
        if (!patchRes.ok) throw new Error(patchData.message || `HTTP ${patchRes.status}`);
        console.log('   ✅ User doc updated to admin');
        console.log(`\n✅ Super admin ensured for ${email}`);
        return;
      } else {
        throw new Error(createAccData.message || `HTTP ${createAccRes.status}`);
      }
    }

    // 2. Create user document
    console.log('2. Creating user document with admin role...');
    const createDocRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents`, {
      method: 'POST',
      headers: apiHeaders,
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
    const createDocData = await createDocRes.json();
    if (!createDocRes.ok) throw new Error(createDocData.message || `HTTP ${createDocRes.status}`);
    console.log(`   ✅ User document created with ID ${userId}`);

    console.log('\n✅ Super admin created:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${userId}\n`);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

run();
