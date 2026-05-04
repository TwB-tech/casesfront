/**
 * Create Super Admin User
 *
 * Creates an Appwrite account and user document with admin role.
 *
 * Usage: node scripts/create-super-admin.js
 *
 * Expected env vars:
 * - APPWRITE_PROJECT_ID
 * - APPWRITE_DATABASE_ID
 * - ADMIN_EMAIL (optional, defaults to tony@techwithbrands.com)
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
const password = 'Jene835*';
const username = 'Tony Admin';
const role = 'admin';

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

async function createAdminUser() {
  try {
    // Generate a unique user ID
    const userId = `admin_${Date.now()}`;

    console.log(`\nCreating admin account: ${email}`);
    console.log('Using user ID:', userId);

    // 1. Create Appwrite account
    console.log('1. Creating account...');
    const accountRes = await fetch(`${endpoint}/account`, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({
        userId,
        email,
        password,
        name: username,
      }),
    });
    const accountData = await accountRes.json();
    if (!accountRes.ok) {
      if (accountData.code === 'user_already_exists') {
        console.log('⚠️  Account already exists, will update profile instead.');
        // Fetch existing account by email conversion not possible; we'll try to find user doc
        // We'll skip account creation and just ensure user document exists
      } else {
        throw new Error(accountData.message || `HTTP ${accountRes.status}`);
      }
    } else {
      console.log(`   ✅ Account created (${accountData.$id})`);
    }

    // 2. Create/Update user document in 'users' collection with admin role
    console.log('2. Ensuring user document with admin role...');
    const userIdFinal = accountData?.$id || userId;
    const userDocId = userIdFinal; // use same ID for easier lookup

    // Check if user doc exists
    const getRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents/${userDocId}`, {
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      },
    });
    const userData = await getRes.json();

    if (getRes.ok) {
      // Update to ensure admin role
      console.log(`   User doc exists, updating role to admin...`);
      const patchRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents/${userDocId}`, {
        method: 'PATCH',
        headers: {
          'X-Appwrite-Project': projectId,
          'X-Appwrite-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            role: 'admin',
            username,
            email,
          },
        }),
      });
      if (!patchRes.ok) {
        const err = await patchRes.json();
        throw new Error(err.message || `HTTP ${patchRes.status}`);
      }
      console.log('   ✅ User document updated with admin role');
    } else if (getRes.status === 404) {
      // Create new user doc
      console.log('   User doc not found, creating...');
      const createRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          documentId: userDocId,
          data: {
            id: userDocId,
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
        throw new Error(createData.message || `HTTP ${createRes.status}`);
      }
      console.log('   ✅ User document created with admin role');
    } else {
      throw new Error(userData.message || `HTTP ${getRes.status}`);
    }

    // 3. Output credentials
    console.log('\n✅ Super admin user ready:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID:  ${userIdFinal}`);
    console.log('\n⚠️  Save these credentials securely. Admin can now access all features.\n');
  } catch (error) {
    console.error('\n❌ Failed to create admin user:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

createAdminUser();
