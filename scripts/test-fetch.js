import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
};

const url = `${endpoint}/databases/${databaseId}/collections/users`;
console.log('Fetching:', url);
const res = await fetch(url, { headers });
console.log('Status:', res.status);
const text = await res.text();
console.log('Full body:', text);
try {
  const json = JSON.parse(text);
  console.log('Parsed OK. read:', json.read, 'write:', json.write, 'documentSecurity:', json.documentSecurity);
} catch (e) {
  console.error('JSON parse error:', e.message);
}
