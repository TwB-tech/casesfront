/**
 * Fix Appwrite Permissions In-Place (Non-Destructive)
 *
 * This script patches every collection to:
 * - documentSecurity: false
 * - permissions: array with proper read/create/update/delete rules
 *
 * It does NOT delete collections or attributes.
 *
 * Run: node scripts/fix-permissions-inplace.js
 */

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

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
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch {
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

// Determine which permission set to apply per collection
function getPermissions(collectionName) {
  const usersOnly = new Set(['invites', 'audit_logs', 'payroll_runs', 'admin_settings']);
  if (usersOnly.has(collectionName)) {
    return ['read("users")', 'create("users")', 'update("users")', 'delete("users")'];
  }
  return ['read("any")', 'create("users")', 'update("users")', 'delete("users")'];
}

async function fixCollection(coll) {
  const collId = coll.$id;
  const collName = coll.name;
  const perms = getPermissions(collName);

  try {
    // Patch collection to set documentSecurity=false and permissions array
    await api('PATCH', `/databases/${databaseId}/collections/${collId}`, {
      documentSecurity: false,
      permissions: perms,
    });
    console.log(`  ✓ ${collName} (${collId}): permissions set, documentSecurity=false`);
    return { ok: true, coll: collName };
  } catch (error) {
    console.log(`  ✗ ${collName} (${collId}): ${error.status} - ${error.message}`);
    return { ok: false, coll: collName, error: error.message };
  }
}

async function main() {
  console.log('\n=== Fixing Appwrite Permissions In-Place ===\n');

  // Fetch all collections
  let collections;
  try {
    const result = await api('GET', `/databases/${databaseId}/collections`);
    collections = result.collections || [];
  } catch (error) {
    console.error('Failed to fetch collections:', error.message);
    process.exit(1);
  }

  console.log(`Found ${collections.length} collections. Updating...\n`);

  let updated = 0;
  let skipped = 0;
  for (const coll of collections) {
    const currentRead = coll.read || [];
    const currentWrite = coll.write || [];
    const currentDocSec = coll.documentSecurity;

    const perms = getPermissions(coll.name);
    const needsUpdate =
      currentDocSec !== false ||
      JSON.stringify((currentRead || []).sort()) !== JSON.stringify(['any']) ||
      JSON.stringify((currentWrite || []).sort()) !== JSON.stringify(['users']);

    if (!needsUpdate) {
      console.log(`  ✓ ${coll.name} already correct`);
      skipped++;
      continue;
    }

    const result = await fixCollection(coll);
    if (result.ok) updated++;
  }

  console.log(`\n✅ Complete — ${updated} updated, ${skipped} already correct`);
  console.log('\nNext steps:');
  console.log('  1. Clear your browser localStorage');
  console.log('  2. Restart dev server if running locally');
  console.log('  3. Test signup/login — should work\n');
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
