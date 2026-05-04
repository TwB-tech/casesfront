/**
 * Fix Appwrite Collection Permissions
 *
 * Updates all collection-level permissions to:
 *   read: ['role:all'], write: ['role:users']
 *   except: invites, audit_logs, payroll_runs, admin_settings -> read/write: ['role:users']
 *
 * Uses the proven api() helper pattern from integration tests.
 *
 * Run: node scripts/fix-permissions.js
 */

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

if (!projectId || !apiKey) {
  console.error('❌ Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env');
  process.exit(1);
}

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

async function api(method, path, body) {
  const url = `${endpoint}${path}`;
  const options = { method, headers: apiHeaders };
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  let data;
  const ct = res.headers.get('content-type') || '';
  try {
    if (ct && ct.includes('application/json')) {
      data = await res.json();
    } else {
      data = { message: await res.text() };
    }
  } catch (e) {
    data = { error: e.message };
  }
  if (!res.ok) {
    const err = new Error(data.message || data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const collections = [
  { name: 'organizations', read: ['role:all'], write: ['role:users'] },
  { name: 'users', read: ['role:all'], write: ['role:users'] },
  { name: 'courts', read: ['role:all'], write: ['role:users'] },
  { name: 'cases', read: ['role:all'], write: ['role:users'] },
  { name: 'tasks', read: ['role:all'], write: ['role:users'] },
  { name: 'documents', read: ['role:all'], write: ['role:users'] },
  { name: 'communications', read: ['role:all'], write: ['role:users'] },
  { name: 'invoices', read: ['role:all'], write: ['role:users'] },
  { name: 'invoice_items', read: ['role:all'], write: ['role:users'] },
  { name: 'chat_rooms', read: ['role:all'], write: ['role:users'] },
  { name: 'chat_messages', read: ['role:all'], write: ['role:users'] },
  { name: 'audit_logs', read: ['role:users'], write: ['role:users'] },
  { name: 'expenses', read: ['role:all'], write: ['role:users'] },
  { name: 'payroll_runs', read: ['role:users'], write: ['role:users'] },
  { name: 'admin_settings', read: ['role:users'], write: ['role:users'] },
  { name: 'subscriptions', read: ['role:all'], write: ['role:users'] },
  { name: 'onboarding', read: ['role:all'], write: ['role:users'] },
  { name: 'invites', read: ['role:users'], write: ['role:users'] },
  { name: 'notes', read: ['role:all'], write: ['role:users'] },
];

async function fixPermissions() {
  console.log('\n=== Fixing Appwrite Collection Permissions ===\n');
  let updated = 0;
  let skipped = 0;

  for (const coll of collections) {
    try {
      const path = `/databases/${databaseId}/collections/${coll.name}`;
      const current = await api('GET', path);

      const currentRead = current.read || [];
      const currentWrite = current.write || [];

      const same =
        JSON.stringify(currentRead.sort()) === JSON.stringify(coll.read.sort()) &&
        JSON.stringify(currentWrite.sort()) === JSON.stringify(coll.write.sort());

      if (same) {
        console.log(`  ✓ ${coll.name} permissions already correct (read: ${JSON.stringify(currentRead)}, write: ${JSON.stringify(currentWrite)})`);
        skipped++;
        continue;
      }

      console.log(`  Updating ${coll.name} from read:${JSON.stringify(currentRead)} write:${JSON.stringify(currentWrite)} -> read:${JSON.stringify(coll.read)} write:${JSON.stringify(coll.write)}`);

      const patchRes = await api('PATCH', path, {
        read: coll.read,
        write: coll.write,
      });

      console.log(`  ✓ Updated ${coll.name} permissions`);
      updated++;
    } catch (err) {
      console.log(`  ✗ ${coll.name}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n✅ Complete — ${updated} updated, ${skipped} skipped\n`);
}

fixPermissions().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
