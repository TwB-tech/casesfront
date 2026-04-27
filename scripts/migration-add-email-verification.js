/**
 * Migration: Add verification_token and email_verified to users collection
 * Run: node scripts/migration-add-email-verification.js
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

const env = loadEnv(path.join(process.cwd(), '.env'));

const endpoint = (env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = env.APPWRITE_PROJECT_ID;
const apiKey = env.APPWRITE_API_KEY;
const databaseId = env.APPWRITE_DATABASE_ID || 'default';

if (!projectId || !apiKey) {
  console.error('❌ Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env');
  process.exit(1);
}

// Attributes to add: format { key, type, size?, required?, default?, array? }
const newAttributes = [
  {
    key: 'verification_token',
    type: 'string',
    size: 255,
    required: false,
  },
  {
    key: 'email_verified',
    type: 'boolean',
    required: false,
    default: false,
  },
];

async function addAttributes() {
  console.log(`🔧 Adding verification attributes to users collection...`);
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Project: ${projectId}`);
  console.log(`   Database: ${databaseId}`);

  for (const attr of newAttributes) {
    const type = attr.type;
    const attrEndpoint = `/databases/${databaseId}/collections/users/attributes/${type}`;
    const payload = {
      key: attr.key,
      required: attr.required || false,
    };
    if (type === 'string' || type === 'double' || type === 'integer') {
      if (attr.size) payload.size = attr.size;
      if (attr.array) payload.array = true;
    }
    if (attr.default !== undefined) {
      payload.default = attr.default;
    }

    try {
      const res = await fetch(`${endpoint}${attrEndpoint}`, {
        method: 'POST',
        headers: {
          'X-Appwrite-Project': projectId,
          'X-Appwrite-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log(`   ✓ Added attribute: ${attr.key}`);
      } else if (res.status === 409) {
        console.log(`   ℹ Attribute already exists: ${attr.key}`);
      } else {
        const err = await res.text();
        console.error(`   ❌ Failed to add ${attr.key}: ${res.status} - ${err}`);
      }
    } catch (err) {
      console.error(`   ❌ Error adding ${attr.key}:`, err.message);
    }
  }

  console.log('✅ Migration complete');
}

addAttributes().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
