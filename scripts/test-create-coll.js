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

const payload = {
  collectionId: 'test_courts',
  name: 'Test Courts',
  read: ['role:all'],
  write: ['role:users'],
  documentSecurity: false,
};

fetch(`${endpoint}/databases/${databaseId}/collections`, {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
})
  .then(res => {
    console.log('Status:', res.status);
    return res.json();
  })
  .then(data => console.log('Response:', JSON.stringify(data).substring(0,500)))
  .catch(err => console.error('Fetch error:', err.message));
