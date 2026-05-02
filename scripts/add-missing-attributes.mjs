/**
 * Add missing attributes to Appwrite collections
 * Run: node scripts/add-missing-attributes.mjs
 */

import fs from 'fs';
import path from 'path';

function loadEnv(filePath) {
  const env = {};
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      let value = trimmed.substring(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch (err) {
    console.warn('Could not read .env:', err.message);
  }
  return env;
}

const env = loadEnv(path.resolve(process.cwd(), '.env'));

const endpoint = (env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = env.APPWRITE_PROJECT_ID;
const apiKey = env.APPWRITE_API_KEY;
const databaseId = env.APPWRITE_DATABASE_ID || 'default';

if (!projectId || !apiKey) {
  console.error('❌ Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env');
  process.exit(1);
}

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

const log = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
};

async function api(method, path, body) {
  const url = `${endpoint}${path}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function addAttribute(collectionName, attr) {
  try {
    const type = attr.type;
    const endpoint_path = `/databases/${databaseId}/collections/${collectionName}/attributes/${type}`;
    const payload = {
      key: attr.key,
      required: attr.required || false,
    };
    if (type === 'string') {
      payload.size = attr.size || 255;
      if (attr.array) payload.array = true;
    } else if (type === 'text') {
      if (attr.array) payload.array = true;
    }
    if (attr.default !== undefined) {
      payload.default = attr.default;
    }
    await api('POST', endpoint_path, payload);
    log.success(`  ✓ Added ${attr.key} (${type}) to ${collectionName}`);
  } catch (e) {
    if (e.status === 409 || (e.message && e.message.toLowerCase().includes('already exists'))) {
      log.info(`  ✓ ${attr.key} already exists in ${collectionName}`);
    } else {
      log.error(`  ✗ Failed to add ${attr.key} to ${collectionName}: ${e.message}`);
    }
  }
}

async function main() {
  console.log('\n=== Adding Missing Attributes ===\n');

  // chat_messages needs organization_id
  console.log('Updating chat_messages collection...');
  await addAttribute('chat_messages', { key: 'organization_id', type: 'string', size: 255 });

  // communications needs organization_id (if not present)
  console.log('\nUpdating communications collection...');
  await addAttribute('communications', { key: 'organization_id', type: 'string', size: 255 });

  // tasks needs client_id if not present (for the OR conditions)
  console.log('\nChecking tasks collection...');
  await addAttribute('tasks', { key: 'client_id', type: 'string', size: 255 });

  // cases needs created_by if not present
  console.log('\nChecking cases collection...');
  await addAttribute('cases', { key: 'created_by', type: 'string', size: 255 });

  console.log('\n✅ Done!');
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
