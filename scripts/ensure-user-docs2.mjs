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

async function listUsersByEmail(email) {
  // Build queries array as JSON string
  const queries = JSON.stringify([
    { attribute: 'email', operator: 'equal', value: email }
  ]);
  const url = `${endpoint}/users?queries=${encodeURIComponent(queries)}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to list users');
  }
  return (await res.json()).users;
}

async function ensureUserDoc(accountId, email, role, name) {
  // Check if exists
  try {
    const getRes = await fetch(`${endpoint}/databases/${DB_ID}/collections/${USERS_COL}/documents/${accountId}`, { headers });
    if (getRes.ok) {
      console.log(`✓ User document for ${email} exists`);
      return;
    }
  } catch (e) {}

  // Create user document
  const payload = {
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
  };
  const createRes = await fetch(`${endpoint}/databases/${DB_ID}/collections/${USERS_COL}/documents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (createRes.ok) {
    console.log(`✅ Created user document for ${email}`);
  } else {
    const err = await createRes.json();
    console.error(`❌ Failed to create user document for ${email}:`, err);
  }
}

async function main() {
  console.log('=== Ensuring user documents exist ===\n');

  const usersToEnsure = [
    { email: 'advocate@wakiliworld.local', role: 'advocate', name: 'Amina Wanjiru' },
    { email: 'admin@wakiliworld.local', role: 'admin', name: 'Admin User' },
    { email: 'client@wakiliworld.local', role: 'individual', name: 'Brian Otieno' },
  ];

  for (const u of usersToEnsure) {
    try {
      const accounts = await listUsersByEmail(u.email);
      if (accounts.length === 0) {
        console.log(`⚠️  No account found for ${u.email}`);
        continue;
      }
      const accountId = accounts[0].$id;
      await ensureUserDoc(accountId, u.email, u.role, u.name);
    } catch (e) {
      console.error(`Error processing ${u.email}:`, e.message);
    }
  }

  console.log('\n✅ Done');
}

main().catch(console.error);
