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

const collId = 'testperm3';
const body = {
  collectionId: collId,
  name: 'TestPerm3',
  // Use permissions array format: e.g. 'read("role:all")', 'write("role:users")'
  permissions: [
    'read("role:all")',
    'write("role:users")'
  ],
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
    return fetch(`${endpoint}/databases/${databaseId}/collections/${collId}`, { headers });
  })
  .then(res => res.json())
  .then(data => {
    console.log('Get response:', JSON.stringify(data).substring(0,300));
    console.log('Has read?:', 'read' in data);
    console.log('Has $permissions?:', '$permissions' in data);
    console.log('$permissions value:', data.$permissions);
  })
  .catch(err => console.error('Error:', err.message));
