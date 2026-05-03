/**
 * COMPREHENSIVE PERMISSIONS FIX
 *
 * This script:
 * 1. Disables document-level security on all collections
 * 2. Updates collection-level permissions
 *
 * IMPORTANT: Uses collection ID ($id), not collection name.
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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
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

if (!projectId) {
  console.error('❌ Missing APPWRITE_PROJECT_ID in .env');
  process.exit(1);
}
if (!apiKey) {
  console.error('❌ Missing APPWRITE_API_KEY in .env');
  process.exit(1);
}

const apiHeaders = {
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
  const options = { method, headers: apiHeaders };
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

async function fixCollection(collection) {
  const collName = collection.name;
  const collId = collection.$id; // Lowercase ID like "users"

  // All collections get same treatment: documentSecurity=false, public read, member write
  try {
    const payload = {
      read: ['role:all'],
      write: ['role:member'],
      documentSecurity: false,
    };

    await api('PATCH', `/databases/${databaseId}/collections/${collId}`, payload);
    log.success(`  ✓ ${collName}: set documentSecurity=false, read=role:all, write=role:member`);
  } catch (error) {
    log.error(`  Failed ${collName} (${collId}): ${error.status} - ${error.message}`);
  }
}

async function main() {
  console.log('\n========================================');
  console.log('  APPRWRITE PERMISSIONS FIX');
  console.log('========================================\n');
  console.log('This will disable document-level security and set collection-level permissions.\n');

  // Fetch all collections
  let collections;
  try {
    const result = await api('GET', `/databases/${databaseId}/collections`);
    collections = result.collections || [];
  } catch (error) {
    log.error(`Failed to fetch collections: ${error.message}`);
    process.exit(1);
  }

  if (collections.length === 0) {
    log.warn('No collections found. Run setup script first: node scripts/setup-appwrite.js');
    process.exit(1);
  }

  log.info(`Processing ${collections.length} collections...\n`);

  for (const coll of collections) {
    await fixCollection(coll);
  }

  console.log('\n========================================');
  console.log('  ✅ FIX COMPLETE');
  console.log('========================================\n');
  console.log('Next steps:');
  console.log('  1. Clear your browser localStorage');
  console.log('  2. Restart dev server: npm run dev:all');
  console.log('  3. Login and test - 401 errors should be gone\n');
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
