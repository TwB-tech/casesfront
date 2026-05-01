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

async function createUser(user) {
  try {
    // Create account via Appwrite Account API
    const userId = ID.unique();
    const accRes = await fetch(`${endpoint}/account`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        email: user.email,
        password: user.password,
        name: user.name,
      }),
    });
    const accData = await accRes.json();
    if (!accRes.ok) {
      if (accRes.status === 409) {
        console.log('⚠️  Account already exists:', user.email);
        return;
      }
      throw new Error(JSON.stringify(accData));
    }
    const accountId = accData.$id;
    console.log('✅ Created account:', user.email);

    // Create user profile in users collection
    await fetch(`${endpoint}/databases/${DB_ID}/collections/${USERS_COL}/documents`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        documentId: accountId,
        data: {
          id: accountId,
          username: user.name,
          email: user.email,
          role: user.role,
          organization_id: 'pending',
          status: 'Active',
          created_at: new Date().toISOString(),
        },
      }),
    });
    console.log('✅ Created profile for', user.email);
  } catch (e) {
    console.error('❌ Error creating', user.email, e.message);
  }
}

async function main() {
  console.log('=== Seeding test users into Appwrite ===\n');
  const users = [
    { email: 'admin@wakiliworld.local', password: 'demo1234', name: 'Admin User', role: 'admin' },
    { email: 'advocate@wakiliworld.local', password: 'demo1234', name: 'Amina Wanjiru', role: 'advocate' },
    { email: 'client@wakiliworld.local', password: 'demo1234', name: 'Brian Otieno', role: 'individual' },
  ];

  for (const u of users) {
    await createUser(u);
  }
  console.log('\n✅ Seeding complete');
}

main().catch(console.error);
