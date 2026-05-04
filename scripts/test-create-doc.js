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

const docId = 'testdoc_' + Date.now();
// Use only required fields: title, owner, organization_id (plus timestamps). Let the id be auto.
const body = {
  title: 'Test Doc',
  owner: 'someuser',
  organization_id: 'someorg',
  created_at: new Date().toISOString(),
};

fetch(`${endpoint}/databases/${databaseId}/collections/documents/documents`, {
  method: 'POST',
  headers,
  body: JSON.stringify(body),
})
  .then(res => res.json())
  .then(data => {
    console.log('Create doc response:', JSON.stringify(data).substring(0,300));
  })
  .catch(err => console.error('Error:', err.message));
