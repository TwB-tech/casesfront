/**
 * Disable document-level security for all collections
 *
 * When documentSecurity is enabled, Appwrite checks ACLs on each document.
 * Collection-level permissions (read: ['role:all']) only apply when documentSecurity=false.
 *
 * Run: node scripts/disable-document-security.js
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

async function getCollections() {
  const { collections } = await api('GET', `/databases/${databaseId}/collections`);
  return collections;
}

async function disableDocumentSecurity(collectionName) {
  try {
    // Patch collection to disable document security
    await api('PATCH', `/databases/${databaseId}/collections/${collectionName}`, {
      documentSecurity: false,
    });
    log.success(`  ✓ Disabled document security on ${collectionName}`);
  } catch (error) {
    if (error.status === 404) {
      log.warn(`  Collection ${collectionName} not found`);
    } else {
      log.error(`  Failed for ${collectionName}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('\n=== Disabling Document-Level Security ===\n');
  console.log('When documentSecurity is enabled, collection-level permissions are ignored.');
  console.log('We need documentSecurity=false for our read:["role:all"] / write:["role:member"] model.\n');

  // Fetch all collections
  const collections = await getCollections();
  log.info(`Found ${collections.length} collections in database '${databaseId}'\n`);

  for (const coll of collections) {
    log.info(`Checking: ${coll.name}`);
    if (coll.documentSecurity) {
      await disableDocumentSecurity(coll.name);
    } else {
      log.success(`  Already disabled on ${coll.name}`);
    }
  }

  console.log('\n\x1b[1m✅ Document Security Disabled!\x1b[0m');
  console.log('All collections now respect collection-level permissions.');
  console.log('Authenticated users can access data according to read/write rules.\n');
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
