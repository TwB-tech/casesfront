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

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

async function fetchAllDocuments(collectionId) {
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const res = await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents?limit=${limit}&offset=${offset}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(`Failed to fetch ${collectionId}: ${data.message}`);
    const docs = data.documents || [];
    all.push(...docs);
    if (docs.length < limit) break;
    offset += limit;
  }
  return all;
}

async function backupAllCollections() {
  console.log('Starting backup...\n');

  // Fetch all collections
  const collRes = await fetch(`${endpoint}/databases/${databaseId}/collections?limit=100`, { headers });
  const collData = await collRes.json();
  if (!collRes.ok) throw new Error(`Failed to list collections: ${collData.message}`);

  const backup = {
    timestamp: new Date().toISOString(),
    endpoint,
    projectId,
    databaseId,
    collections: {},
  };

  for (const coll of collData.collections) {
    const collId = coll.collectionId || coll.$id || coll.id;
    console.log(`Backing up: ${collId}...`);
    try {
      const docs = await fetchAllDocuments(collId);
      backup.collections[collId] = {
        metadata: {
          name: coll.name,
          attributes: coll.attributes || [],
          permissions: { read: coll.read, write: coll.write },
        },
        documents: docs.map(doc => {
          const { $id, $createdAt, $updatedAt, ...rest } = doc;
          return {
            id: $id,
            created_at: $createdAt,
            updated_at: $updatedAt,
            ...rest,
          };
        }),
      };
      console.log(`  ✓ ${collId}: ${docs.length} documents`);
    } catch (e) {
      console.error(`  ✗ ${collId}: ${e.message}`);
      backup.collections[collId] = { error: e.message };
    }
  }

  // Ensure backups directory exists
  const fs = await import('fs');
  const path = await import('path');
  const backupDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const filename = `appwrite-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(backupDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
  console.log(`\n✅ Backup saved: ${filepath}`);
  console.log(`   Collections: ${Object.keys(backup.collections).length}`);
  return filepath;
}

async function main() {
  try {
    await backupAllCollections();
  } catch (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  }
}

main();
