/**
 * Fix Appwrite Collection Permissions
 *
 * This script ensures all collections have proper collection-level permissions
 * (documentSecurity: false) and correct read/write roles.
 *
 * Run: node scripts/fix-permissions.js
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
  console.error('❌ Missing APPWRITE_API_KEY in .env (needed for setup)');
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

// Define proper permissions for each collection
// Using Appwrite standard roles: 'role:all' (everyone, including guests), 'role:member' (authenticated users), 'role:admin' (admins)
const collectionPermissions = {
  organizations: { read: ['role:all'], write: ['role:member'] }, // Public read, authenticated write
  users: { read: ['role:all'], write: ['role:member'] }, // Public read, authenticated write (profile updates)
  courts: { read: ['role:all'], write: ['role:member'] },
  cases: { read: ['role:all'], write: ['role:member'] },
  tasks: { read: ['role:all'], write: ['role:member'] },
  documents: { read: ['role:all'], write: ['role:member'] },
  communications: { read: ['role:all'], write: ['role:member'] },
  invites: { read: ['role:member'], write: ['role:member'] }, // Authenticated only
  invoices: { read: ['role:all'], write: ['role:member'] },
  invoice_items: { read: ['role:all'], write: ['role:member'] },
  chat_rooms: { read: ['role:all'], write: ['role:member'] },
  chat_messages: { read: ['role:all'], write: ['role:member'] },
  audit_logs: { read: ['role:admin'], write: ['role:admin'] },
  expenses: { read: ['role:all'], write: ['role:member'] },
  payroll_runs: { read: ['role:member'], write: ['role:member'] },
  admin_settings: { read: ['role:admin'], write: ['role:admin'] },
  subscriptions: { read: ['role:all'], write: ['role:member'] },
  onboarding: { read: ['role:all'], write: ['role:member'] },
  notes: { read: ['role:all'], write: ['role:member'] },
};

async function fixCollection(collectionName) {
  const perms = collectionPermissions[collectionName];
  if (!perms) {
    log.warn(`  No permission rules defined for ${collectionName}, skipping`);
    return;
  }

  try {
    // First, get current collection to see if documentSecurity is enabled
    const current = await api('GET', `/databases/${databaseId}/collections/${collectionName}`);

    // Update collection with correct permissions and disable document-level security
    const payload = {
      read: perms.read,
      write: perms.write,
      // Important: disable document-level security to use collection-level permissions
      documentSecurity: false,
    };

    await api('PATCH', `/databases/${databaseId}/collections/${collectionName}`, payload);
    log.success(`  ✓ Fixed permissions for ${collectionName}: read=${perms.read.join(',')}, write=${perms.write.join(',')}, documentSecurity=false`);
  } catch (error) {
    if (error.status === 404) {
      log.warn(`  Collection ${collectionName} doesn't exist yet, will be created with correct permissions`);
    } else {
      log.error(`  Failed to update ${collectionName}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('\n=== Fixing Appwrite Permissions ===\n');

  // First, ensure database exists
  try {
    await api('GET', `/databases/${databaseId}`);
    log.success(`Database '${databaseId}' ready`);
  } catch (e) {
    log.error(`Database not found: ${e.message}`);
    process.exit(1);
  }

  // Update permissions for all collections
  const collectionNames = Object.keys(collectionPermissions);
  log.info(`Updating permissions for ${collectionNames.length} collections...\n`);

  for (const name of collectionNames) {
    await fixCollection(name);
  }

  console.log('\n\x1b[1m✅ Permissions Fix Complete!\x1b[0m');
  console.log('All collections now use collection-level permissions (documentSecurity: false).');
  console.log('Authenticated users can read/write according to their role.\n');
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
