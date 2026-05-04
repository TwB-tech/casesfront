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

const collId = 'testperm4';
const body = {
  collectionId: collId,
  name: 'TestPerm4',
  read: ['any'],
  write: ['users'],
  documentSecurity: false,
};

fetch(`${endpoint}/databases/${databaseId}/collections`, {
  method: 'POST',
  headers,
  body: JSON.stringify(body),
})
  .then(res => res.json())
  .then(data => {
    console.log('Create response:', JSON.stringify(data).substring(0,300));
    // GET it
    return fetch(`${endpoint}/databases/${databaseId}/collections/${collId}`, { headers });
  })
  .then(res => res.json())
  .then(data => {
    console.log('Get response:');
    console.log(' read:', data.read);
    console.log(' write:', data.write);
    console.log(' $permissions:', data.$permissions);
  })
  .catch(err => console.error('Error:', err.message));
