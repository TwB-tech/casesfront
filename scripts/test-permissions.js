/**
 * Test Appwrite Permissions Effectively
 *
 * Tests actual access control behavior:
 * - Can read users as public? (should be true)
 * - Can create document as public? (should be false without auth)
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

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'Content-Type': 'application/json',
};

async function testPermission(method, url, describe) {
  const options = { method, headers: apiHeaders };
  if (method !== 'GET' && method !== 'HEAD') {
    options.body = JSON.stringify({ test: true });
  }
  const res = await fetch(url, options);
  return { status: res.status, ok: res.ok };
}

async function main() {
  console.log('\n=== Testing Effective Permissions ===\n');

  // Test public read on users (should succeed with 200)
  const readUrl = `${endpoint}/databases/${databaseId}/collections/users/documents`;
  const readResult = await testPermission('GET', readUrl, 'Public read users');
  console.log(`GET /users/documents: ${readResult.status} (${readResult.ok ? '✅ Allowed' : '❌ Denied'})`);

  // Test public create on users (should fail with 401/403)
  const createUrl = `${endpoint}/databases/${databaseId}/collections/users/documents`;
  const createResult = await testPermission('POST', createUrl, 'Public create users');
  console.log(`POST /users/documents: ${createResult.status} (${!createResult.ok ? '✅ Correctly denied' : '❌ Should be denied!'})`);

  console.log('\n=== Summary ===');
  if (readResult.ok && !createResult.ok) {
    console.log('✅ Permissions are correctly configured:');
    console.log('   - Public can read');
    console.log('   - Public cannot write');
  } else {
    console.log('❌ Permissions misconfigured. Check collection settings.');
  }
  console.log('');
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
