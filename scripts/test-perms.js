import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

async function createAndFetch() {
  const createPayload = {
    collectionId: 'testperm' + Date.now(),
    name: 'TestPerm',
    read: ['role:all'],
    write: ['role:users'],
    documentSecurity: false,
  };
  const createRes = await fetch(`${endpoint}/databases/${databaseId}/collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify(createPayload),
  });
  const createData = await createRes.json();
  console.log('Create status:', createRes.status);
  console.log('Create response:', JSON.stringify(createData).substring(0,300));

  // Now GET it
  const collId = createData.$id || createPayload.collectionId;
  const getRes = await fetch(`${endpoint}/databases/${databaseId}/collections/${collId}`, { headers });
  const getData = await getRes.json();
  console.log('Get status:', getRes.status);
  console.log('Get data keys:', Object.keys(getData));
  console.log('read:', getData.read);
  console.log('write:', getData.write);
  console.log('$permissions:', JSON.stringify(getData.$permissions).substring(0,200));
  console.log('documentSecurity:', getData.documentSecurity);
}

createAndFetch().catch(console.error);
