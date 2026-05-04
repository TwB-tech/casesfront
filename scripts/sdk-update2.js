import { Client, Databases } from 'appwrite';
import { config } from 'dotenv';
config();

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

const client = new Client();
client.setEndpoint(endpoint);
client.setProject(projectId);
client.setKey(apiKey);

const databases = new Databases(client);

async function test() {
  try {
    const coll = await databases.getCollection(databaseId, 'users');
    console.log('Fetched collection:', coll.$id);
    console.log('read:', coll.read, 'write:', coll.write, 'docSec:', coll.documentSecurity);
    const updated = await databases.updateCollection(databaseId, coll.$id, {
      read: ['role:all'],
      write: ['role:users'],
      documentSecurity: false,
    });
    console.log('Updated OK');
    console.log('New read:', updated.read, 'write:', updated.write);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Type:', error.type);
  }
}

test();
