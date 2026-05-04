import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

async function api(method, path, body) {
  const url = `${endpoint}${path}`;
  const options = { method, headers: apiHeaders };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// GET the test collection
const coll = await api('GET', `/databases/${databaseId}/collections/testcoll`);
console.log('Collection fields:', Object.keys(coll).join(', '));
console.log('documentSecurity:', coll.documentSecurity);
console.log('read:', coll.read);
console.log('write:', coll.write);
console.log('$permissions:', JSON.stringify(coll.$permissions).substring(0,200));
