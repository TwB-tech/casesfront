/**
 * Fix missing user documents in Appwrite
 * Run: node scripts/fix-missing-user-docs.mjs
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

async function createUserDoc(userId, email, role, name, orgId) {
  try {
    // Check if document already exists
    try {
      await api('GET', `/databases/${databaseId}/collections/users/documents/${userId}`);
      console.log(`✓ User document already exists for ${email}`);
      return;
    } catch (e) {
      if (e.status !== 404) throw e;
    }

    // Create document
    const payload = {
      documentId: userId,
      data: {
        id: userId,
        email,
        username: name,
        role: role || 'individual',
        organization_id: orgId || null,
        status: 'Active',
        messaging_enabled: true,
        deadline_notifications: true,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    await api('POST', `/databases/${databaseId}/collections/users/documents`, payload);
    console.log(`✅ Created user document for ${email} (${userId})`);
  } catch (err) {
    console.error(`❌ Failed to create user document for ${email}:`, err.message);
  }
}

async function main() {
  console.log('\n=== Fix Missing User Documents ===\n');

  // Get all users from Appwrite Auth
  try {
    const result = await api('GET', `/users?queries[]=${encodeURIComponent(JSON.stringify({method: 'limit', values: [100]}))}`);
    const users = result.users || [];

    console.log(`Found ${users.length} users in Appwrite Auth\n`);

    for (const user of users) {
      await createUserDoc(user.$id, user.email, 'individual', user.name || user.email.split('@')[0], null);
    }

    console.log('\n✅ Done!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main().catch(console.error);
