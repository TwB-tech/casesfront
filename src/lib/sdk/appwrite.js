import { Client, Account, Databases } from 'appwrite';

const endpoint = import.meta.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = import.meta.env.APPWRITE_PROJECT_ID;

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const account = new Account(client);
const databases = new Databases(client);

// Ping Appwrite on initialization to verify connection
let pingStatus = null;
let pingError = null;

async function verifyConnection() {
  try {
    const result = await client.ping();
    pingStatus = 'connected';
    pingError = null;
    console.log('✅ Appwrite connection verified:', result);
    return true;
  } catch (error) {
    pingStatus = 'error';
    pingError = error;
    console.error('❌ Appwrite connection failed:', error.message);
    return false;
  }
}

// Auto-ping on module load (non-blocking)
verifyConnection().catch(console.error);

export { client, account, databases, verifyConnection, getPingStatus };

function getPingStatus() {
  return { status: pingStatus, error: pingError };
}
