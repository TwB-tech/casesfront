/**
 * Ensure Super Admin User
 *
 * If user exists, set role to admin.
 * If user doesn't exist, create account and user document.
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

async function ensureAdmin() {
  try {
    console.log(`\nEnsuring super admin: ${email}`);

    // 1. Try to find existing user document by email
    console.log('1. Checking if user document exists...');
    const listRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents?queries[0][key]=email&queries[0][value]=${encodeURIComponent(email)}`, {
      headers: apiHeaders,
    });
    const listData = await listRes.json();

    let userDoc;
    if (listRes.ok && listData.documents && listData.documents.length > 0) {
      userDoc = listData.documents[0];
      console.log(`   Found user document: ${userDoc.$id}`);
    }

    if (userDoc) {
      // 2a. Update existing user doc to admin role
      console.log('2. Updating user document to admin role...');
      const patchRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents/${userDoc.$id}`, {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({
          data: {
            role: 'admin',
            username,
          },
        }),
      });
      if (!patchRes.ok) {
        const err = await patchRes.json();
        throw new Error(err.message || `HTTP ${patchRes.status}`);
      }
      console.log('   ✅ User document updated');
    } else {
      // 2b. Create new user document (account must already exist; we'll use a deterministic ID based on email hash or just timestamp)
      console.log('2. User document not found, creating new one...');
      const userId = `admin_${Date.now()}`;
      const createRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents`, {
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
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.message || `HTTP ${createRes.status}`);
      }
      console.log(`   ✅ User document created with ID ${userId}`);
    }

    console.log('\n✅ Super admin role ensured.');
    console.log(`   Email: ${email}`);
    console.log(`   Role:  admin\n`);
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    if (error.data) console.error('Details:', JSON.stringify(error.data, null, 2));
    process.exit(1);
  }
}

ensureAdmin();
