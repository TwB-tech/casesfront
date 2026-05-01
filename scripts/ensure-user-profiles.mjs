import { ID } from 'appwrite';
import { config } from 'dotenv';
config();

const endpoint = 'https://tor.cloud.appwrite.io/v1';
const projectId = '69e8bc1500162d3defdb';
const apiKey = 'standard_c0ef0d3a1fb6688a01c11efc38207f791dbb59a1a9157b9138504b8a148431bdbda78b87f8f7d3b1f5e0ff0c246766ec601175aacca06f06cc001060c001a6d9b857fd72c60ec477dd835e40a11f09644ab93b0654157409e861c1d9eb3edeb25539a68c3cf551ebcc58248da86d744e392891d813ce82a279d87eca13b59c9c';
const DB_ID = '69e90e4d00075469122c';
const USERS_COL = 'users';

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

async function ensureUserProfile(email, role, name) {
  // Find account by email
  const q = encodeURIComponent(JSON.stringify([{ attribute: 'email', operator: 'equal', value: email }]));
  const usersRes = await fetch(`${endpoint}/users?queries=${q}`, { headers });
  const usersData = await usersRes.json();
  let accountId;
  if (usersRes.ok && usersData.users && usersData.users.length > 0) {
    accountId = usersData.users[0].$id;
    console.log(`Found account ${email}: ${accountId}`);
  } else {
    console.log(`Account ${email} not found, creating...`);
    const accRes = await fetch(`${endpoint}/account`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: ID.unique(),
        email,
        password: 'demo1234',
        name,
      }),
    });
    if (!accRes.ok) {
      const err = await accRes.json();
      console.error('Failed to create account:', err);
      return;
    }
    const accData = await accRes.json();
    accountId = accData.$id;
    console.log(`Created account ${email}: ${accountId}`);
  }

  // Check if user profile exists in users collection
  const docRes = await fetch(`${endpoint}/databases/${DB_ID}/collections/${USERS_COL}/documents/${accountId}`, { headers });
  if (docRes.ok) {
    console.log(`Profile for ${email} already exists`);
    return;
  }

  // Create user profile
  const createRes = await fetch(`${endpoint}/databases/${DB_ID}/collections/${USERS_COL}/documents`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      documentId: accountId,
      data: {
        id: accountId,
        username: name,
        email,
        role,
        organization_id: 'pending',
        status: 'Active',
        created_at: new Date().toISOString(),
      },
    }),
  });
  if (createRes.ok) {
    console.log(`✅ Created profile for ${email}`);
  } else {
    const err = await createRes.json();
    console.error(`❌ Failed to create profile for ${email}:`, err);
  }
}

async function main() {
  console.log('=== Ensuring user profiles exist ===\n');
  await ensureUserProfile('advocate@wakiliworld.local', 'advocate', 'Amina Wanjiru');
  await ensureUserProfile('admin@wakiliworld.local', 'admin', 'Admin User');
  await ensureUserProfile('client@wakiliworld.local', 'individual', 'Brian Otieno');
  console.log('\n✅ Done');
}

main().catch(console.error);
