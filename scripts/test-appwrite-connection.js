/**
 * Appwrite Connection Test using REST API
 *
 * Run: node scripts/test-appwrite-connection.js
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
  console.error('❌ Missing APPWRITE_API_KEY in .env (needed for test)');
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

async function test() {
  console.log('\n=== Appwrite Connection Test ===\n');

  // Test 1: List collections
  console.log('1. Listing collections...');
  try {
    const result = await api('GET', `/databases/${databaseId}/collections`);
    console.log(`   ✓ Found ${result.collections.length} collections`);
    console.log(
      `   Collections: ${result.collections
        .map((c) => c.name)
        .sort()
        .join(', ')}`
    );
  } catch (e) {
    console.error(`   ✗ Failed: ${e.message}`);
    if (e.status === 404 || e.message.toLowerCase().includes('database not found')) {
      console.error('   → Database may not exist. Run: npm run db:setup first.');
    }
    process.exit(1);
  }

  // Test 2: Try read users collection
  console.log('\n2. Testing collection access...');
  try {
    await api('GET', `/databases/${databaseId}/collections/users`);
    console.log(`   ✓ users collection accessible`);
  } catch (e) {
    console.log(`   ⚠ users collection: ${e.message}`);
  }

  // Test 3: Try writing a test document
  console.log('\n3. Testing write operation...');
  const testCollection = 'audit_logs';
  const testId = `test-${Date.now()}`;
  try {
    await api(
      'POST',
      `/databases/${databaseId}/collections/${testCollection}/documents?documentId=${testId}`,
      {
        organization_id: null,
        user_id: 'test-user',
        action: 'connection_test',
        table_name: 'appwrite_test',
        record_id: 'test-001',
        changes: JSON.stringify({ test: true }),
        user_agent: 'connection-test-script',
      }
    );
    console.log(`   ✓ Created test document in ${testCollection}`);

    // Clean up
    await api(
      'DELETE',
      `/databases/${databaseId}/collections/${testCollection}/documents/${testId}`
    );
    console.log(`   ✓ Cleaned up test document`);
  } catch (e) {
    console.log(`   ⚠ Write test failed: ${e.message}`);
  }

  console.log('\n✅ Appwrite connection successful!\n');
  console.log('Next: Set DATABASE_MODE=appwrite in .env and run npm run dev\n');
}

test().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
