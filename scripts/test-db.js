import fs from 'fs';
import path from 'path';

function loadEnv() {
  const env = {};
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      let value = trimmed.substring(eqIdx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch (err) {
    console.error('❌ Could not read .env:', err.message);
    process.exit(1);
  }
  return env;
}

const env = loadEnv();

const endpoint = (env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = env.APPWRITE_PROJECT_ID;
const apiKey = env.APPWRITE_API_KEY;
const databaseId = env.APPWRITE_DATABASE_ID || 'default';

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

const url = `${endpoint}/databases/${databaseId}`;
console.log('GET', url);
fetch(url, { headers })
  .then(res => {
    console.log('Status:', res.status);
    return res.json().catch(() => res.text()).then(data => ({status: res.status, data}));
  })
  .then(obj => {
    console.log('Response:', JSON.stringify(obj, null, 2).substring(0, 500));
  })
  .catch(err => {
    console.error('Fetch error:', err.message);
  });
