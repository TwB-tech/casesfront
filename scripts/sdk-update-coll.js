import { Client, Databases } from 'appwrite';
import { config } from 'dotenv';
config();

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function updateCollection() {
  try {
    const coll = await databases.getCollection(databaseId, 'users');
    console.log('Current collection:', coll.$id, 'read:', coll.read, 'write:', coll.write, 'docSec:', coll.documentSecurity);
    
    const updated = await databases.updateCollection(databaseId, coll.$id, {
      read: ['role:all'],
      write: ['role:users'],
      documentSecurity: false,
    });
    console.log('Updated collection:', updated.$id);
    console.log('New read:', updated.read);
    console.log('New write:', updated.write);
    console.log('New docSec:', updated.documentSecurity);
  } catch (error) {
    console.error('Error:', error.message, 'code:', error.code, 'type:', error.type);
  }
}

updateCollection();
