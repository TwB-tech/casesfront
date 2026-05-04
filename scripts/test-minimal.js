import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

console.log('Endpoint:', endpoint);
console.log('Project:', projectId);
console.log('DB:', databaseId);
console.log('Key length:', apiKey?.length);

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

fetch(`${endpoint}/databases/${databaseId}`, { headers })
  .then(res => {
    console.log('Status:', res.status);
    return res.json().catch(() => res.text()).then(d => console.log('Data:', typeof d === 'object' ? JSON.stringify(d).substring(0,200) : d));
  })
  .catch(err => {
    console.error('Fetch error:', err.message);
  });
