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

const email = 'tony@techwithbrands.com';
const username = 'Tony Admin';
const role = 'admin';

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

// Query users collection for email
const queryUrl = `${endpoint}/databases/${databaseId}/collections/users/documents?queries[0][key]=email&queries[0][value]=${encodeURIComponent(email)}`;
const res = await fetch(queryUrl, { headers: apiHeaders });
const data = await res.json();

if (!res.ok) {
  console.error('Failed to find user doc:', data);
  process.exit(1);
}

if (!data.documents || data.documents.length === 0) {
  console.log('No user document exists for', email);
  process.exit(1);
}

const userDoc = data.documents[0];
const userId = userDoc.$id;

console.log('Found user doc:', userId, 'current role:', userDoc.role);

// Patch to admin
const patchUrl = `${endpoint}/databases/${databaseId}/collections/users/documents/${userId}`;
const patchRes = await fetch(patchUrl, {
  method: 'PATCH',
  headers: apiHeaders,
  body: JSON.stringify({
    data: {
      role: 'admin',
      username,
    },
  }),
});
const patchData = await patchRes.json();

if (!patchRes.ok) {
  console.error('Failed to update:', patchData);
  process.exit(1);
}

console.log(`\n✅ User ${email} is now admin (role=${patchData.data?.role || 'admin'})\n`);
