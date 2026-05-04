import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

if (!projectId || !apiKey) {
  console.error('Missing env');
  process.exit(1);
}

const email = 'admin@techwithbrands.com';

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

// List all documents in users collection
fetch(`${endpoint}/databases/${databaseId}/collections/users/documents?limit=100`, { headers: apiHeaders })
  .then(res => res.json())
  .then(data => {
    if (!data.documents) {
      console.log('No documents key:', data);
      return;
    }
    console.log(`Found ${data.documents.length} user documents:`);
    const matches = data.documents.filter(d => d.email && d.email.toLowerCase() === email.toLowerCase());
    if (matches.length === 0) {
      console.log(`No user document with email ${email} found.`);
    } else {
      const target = matches[0];
      console.log(`Found user doc ID: ${target.$id}, current role: ${target.role}`);
      // Patch to admin
      return fetch(`${endpoint}/databases/${databaseId}/collections/users/documents/${target.$id}`, {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({
          data: {
            role: 'admin',
            username: target.username || 'Admin User',
          },
        }),
      });
    }
  })
  .then(patchRes => {
    if (!patchRes) return;
    return patchRes.json();
  })
  .then(patchData => {
    if (patchData) {
      console.log('✅ Promoted to admin:', patchData);
    }
  })
  .catch(err => {
    console.error('Error:', err.message);
    if (err.data) console.error('Details:', err.data);
  });
