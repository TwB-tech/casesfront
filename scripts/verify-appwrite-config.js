/**
 * Verify Appwrite Database Configuration
 *
 * Checks:
 * - Collection existence
 * - Document security status
 * - Read/write permissions
 * - Attribute definitions
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

// Expected schema from appwrite-schema.json
const expectedSchema = {
  organizations: {
    attributes: ['id', 'name', 'registration_number', 'address', 'phone', 'email', 'plan_type', 'is_verified', 'created_at', 'updated_at'],
  },
  users: {
    attributes: ['id', 'organization_id', 'username', 'email', 'phone', 'role', 'title', 'bio', 'practice_areas', 'timezone', 'status', 'messaging_enabled', 'deadline_notifications', 'verification_token', 'email_verified', 'created_at', 'updated_at'],
  },
  cases: {
    attributes: ['id', 'organization_id', 'case_number', 'title', 'description', 'status', 'start_date', 'end_date', 'client_id', 'advocate_id', 'court_id', 'created_by', 'created_at', 'updated_at'],
  },
  tasks: {
    attributes: ['id', 'organization_id', 'title', 'description', 'assigned_to', 'case_id', 'priority', 'deadline', 'status', 'created_by', 'created_at', 'updated_at'],
  },
  documents: {
    attributes: ['id', 'organization_id', 'title', 'description', 'owner', 'file_path', 'file_size', 'mime_type', 'shared_with', 'created_at', 'updated_at'],
  },
  chat_messages: {
    attributes: ['id', 'room', 'sender', 'content', 'timestamp', 'attachments', 'created_at'],
  },
};

async function verifyCollections() {
  log.info('Fetching all collections...\n');
  const { collections } = await api('GET', `/databases/${databaseId}/collections`);

  const issues = [];

  for (const coll of collections) {
    log.info(`Collection: ${coll.name}`);
    log.info(`  documentSecurity: ${coll.documentSecurity}`);
    log.info(`  read: ${JSON.stringify(coll.read)}`);
    log.info(`  write: ${JSON.stringify(coll.write)}`);

    // Check if documentSecurity should be false
    if (coll.documentSecurity) {
      issues.push(`❌ ${coll.name}: documentSecurity is ENABLED (should be false)`);
    } else {
      log.success(`  ✓ documentSecurity disabled`);
    }

    // Check read permission
    if (!coll.read || coll.read.length === 0) {
      issues.push(`❌ ${coll.name}: no read permissions`);
    } else {
      log.success(`  ✓ Read: ${coll.read.join(', ')}`);
    }

    // Check write permission
    if (!coll.write || coll.write.length === 0) {
      issues.push(`❌ ${coll.name}: no write permissions`);
    } else {
      log.success(`  ✓ Write: ${coll.write.join(', ')}`);
    }

    console.log('');
  }

  if (issues.length > 0) {
    console.log('\x1b[31m=== ISSUES FOUND ===\x1b[0m\n');
    issues.forEach((i) => console.log(i));
    console.log('\nRun: node scripts/fix-appwrite-permissions.js\n');
  } else {
    console.log('\x1b[32m=== ALL COLLECTIONS CONFIGURED CORRECTLY ===\x1b[0m\n');
  }
}

async function verifyAttributes() {
  log.info('Verifying attribute definitions...\n');
  const { collections } = await api('GET', `/databases/${databaseId}/collections`);

  for (const coll of collections) {
    if (!expectedSchema[coll.name]) continue; // Skip collections we don't have schema for

    try {
      const { attributes } = await api('GET', `/databases/${databaseId}/collections/${coll.name}/attributes`);
      const attrKeys = attributes.map(a => a.key).sort();
      const expected = expectedSchema[coll.name].attributes.sort();

      const missing = expected.filter(k => !attrKeys.includes(k));
      const extra = attrKeys.filter(k => !expected.includes(k));

      if (missing.length > 0 || extra.length > 0) {
        log.warn(`  ${coll.name} attributes differ:`);
        if (missing.length > 0) log.warn(`    Missing: ${missing.join(', ')}`);
        if (extra.length > 0) log.warn(`    Extra: ${extra.join(', ')}`);
      } else {
        log.success(`  ✓ ${coll.name} attributes match schema`);
      }
    } catch (e) {
      log.error(`  Failed to fetch attributes for ${coll.name}: ${e.message}`);
    }
  }
  console.log('');
}

async function testDirectAccess() {
  log.info('Testing direct collection access (should succeed)...\n');
  try {
    // Try to list users
    const res = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents`, {
      headers: apiHeaders,
    });
    if (res.ok) {
      log.success('✓ Direct GET /users/documents works (public read)');
    } else {
      const body = await res.json();
      log.error(`✗ GET /users/documents failed: ${res.status} - ${body.message || ''}`);
    }
  } catch (e) {
    log.error(`✗ GET /users/documents error: ${e.message}`);
  }

  try {
    // Try to list organizations
    const res = await fetch(`${endpoint}/databases/${databaseId}/collections/organizations/documents`, {
      headers: apiHeaders,
    });
    if (res.ok) {
      log.success('✓ Direct GET /organizations/documents works (public read)');
    } else {
      const body = await res.json();
      log.error(`✗ GET /organizations/documents failed: ${res.status} - ${body.message || ''}`);
    }
  } catch (e) {
    log.error(`✗ GET /organizations/documents error: ${e.message}`);
  }
}

async function main() {
  console.log('\n========================================');
  console.log('  APPRWRITE CONFIGURATION VERIFICATION');
  console.log('========================================\n');

  await verifyCollections();
  await verifyAttributes();
  await testDirectAccess();

  console.log('========================================');
  console.log('  ✅ VERIFICATION COMPLETE');
  console.log('========================================\n');
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
