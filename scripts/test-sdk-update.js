import { Client, Databases } from 'appwrite';
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

const client = new Client()
  .setEndpoint(env.APPWRITE_ENDPOINT)
  .setProject(env.APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = env.APPWRITE_DATABASE_ID || 'default';

async function test() {
  try {
    // Get organizations collection
    const coll = await databases.getCollection(databaseId, 'organizations');
    console.log('Fetched collection:', coll.$id, coll.name);
    console.log('Current read:', coll.read);
    console.log('Current write:', coll.write);

    // Try update
    const updated = await databases.updateCollection(databaseId, coll.$id, {
      name: coll.name,
      read: ['role:all'],
      write: ['role:users'],
    });
    console.log('Updated collection:', updated.$id, 'read:', updated.read, 'write:', updated.write);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Type:', error.type);
  }
}

test();
