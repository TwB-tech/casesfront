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

// Use an existing user doc: we have three user docs. Let's get one ID from earlier.
const userId = '69f35d6f002a60aa5304'; // advocate

// PATCH the user doc to set a new field 'test' = true
fetch(`${endpoint}/databases/${databaseId}/collections/users/documents/${userId}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ test: true }),
})
  .then(res => {
    console.log('Status:', res.status);
    return res.json();
  })
  .then(data => console.log('Response:', JSON.stringify(data).substring(0,200)))
  .catch(err => console.error('Error:', err.message));
