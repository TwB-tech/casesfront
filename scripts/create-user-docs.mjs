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

async function createUserDoc(accountId, email, role, name) {
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
  const res = await fetch(`${endpoint}/databases/${DB_ID}/collections/${USERS_COL}/documents/${accountId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    console.log(`✅ Created/updated user document for ${email}`);
  } else {
    const err = await res.json();
    console.error(`❌ Failed for ${email}:`, err.message);
  }
}

async function main() {
  console.log('=== Creating user documents ===\n');
  // Hardcoded account IDs from Appwrite (you can also look them up)
  await createUserDoc('69f35d6f002a60aa5304', 'advocate@wakiliworld.local', 'advocate', 'Amina Wanjiru');
  await createUserDoc('69f35d6a0036eb9502fd', 'admin@wakiliworld.local', 'admin', 'Admin User');
  await createUserDoc('69f35d700030fc9b02ee', 'client@wakiliworld.local', 'individual', 'Brian Otieno');
  console.log('\n✅ Done');
}

main().catch(console.error);
