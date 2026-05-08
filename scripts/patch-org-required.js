/**
 * Patch Appwrite collections to make organization_id optional.
 *
 * This updates the 'organization_id' attribute in specified collections
 * to set required: false, allowing users without an organization to create records.
 *
 * Run: node scripts/patch-org-required.js
 *
 * Prerequisites:
 *   - .env file with APPWRITE_PROJECT_ID, APPWRITE_API_KEY, and APPWRITE_DATABASE_ID
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
  console.error('❌ Missing APPWRITE_API_KEY in .env (needed for API access)');
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

async function patchAttribute(collectionName) {
  const url = `${endpoint}/databases/${databaseId}/collections/${collectionName}/attributes/organization_id`;
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: apiHeaders,
      body: JSON.stringify({ required: false }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`HTTP ${res.status}: ${errBody}`);
    }
    log.success(`Patched ${collectionName}.organization_id → required: false`);
    return true;
  } catch (err) {
    log.warn(`Failed to patch ${collectionName}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n=== Patching organization_id attributes ===\n');

  const collections = [
    'cases',
    'tasks',
    'documents',
    'communications',
    'invoices',
    'expenses',
    'payroll_runs',
    'subscriptions',
    'onboarding',
  ];
  let patched = 0;

  for (const coll of collections) {
    log.info(`Patching ${coll}...`);
    try {
      const ok = await patchAttribute(coll);
      if (ok) patched++;
    } catch (e) {
      log.error(`Error on ${coll}: ${e.message}`);
    }
  }

  console.log(`\n\x1b[1m✅ Done! Patched ${patched}/${collections.length} collections.\x1b[0m`);
  console.log('Users without an organization can now create records in these collections.');
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
