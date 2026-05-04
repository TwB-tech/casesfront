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
  try {
    data = await res.json();
  } catch (e) {
    data = { error: e.message };
  }
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

try {
  const result = await api('POST', `/databases/${databaseId}/collections`, {
    collectionId: 'testcoll',
    name: 'Test Coll',
    read: ['role:all'],
    write: ['role:users'],
    documentSecurity: false,
  });
  console.log('Collection created:', result.$id, 'read:', result.read, 'write:', result.write);
} catch (e) {
  console.error('Error:', e.status, e.message);
  console.error('Details:', e.data);
}
