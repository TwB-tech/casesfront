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

// List users in the 'users' collection
fetch(`${endpoint}/databases/${databaseId}/collections/users/documents?limit=10`, { headers })
  .then(res => {
    console.log('Status:', res.status);
    return res.json();
  })
  .then(data => {
    if (data.documents) {
      console.log('Found', data.documents.length, 'users:');
      data.documents.forEach(u => console.log(' -', u.email, 'role:', u.role, 'id:', u.id));
    } else {
      console.log('No documents key:', JSON.stringify(data).substring(0,200));
    }
  })
  .catch(err => console.error('Error:', err.message));
