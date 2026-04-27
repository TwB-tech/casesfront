// Test creating organization directly to Appwrite using API key
import { Client, Databases, ID } from 'appwrite';

const client = new Client()
  .setEndpoint('https://tor.cloud.appwrite.io/v1')
  .setProject('69e8bc1500162d3defdb')
  .setKey('standard_c0ef0d3a1fb6688a01c11efc38207f791dbb59a1a9157b9138504b8a148431bdbda78b87f8f7d3b1f5e0ff0c246766ec601175aacca06f06cc001060c001a6d9b857fd72c60ec477dd835e40a11f09644ab93b0654157409e861c1d9eb3edeb25539a68c3cf551ebcc58248da86d744e392891d813ce82a279d87eca13b59c9c');

const databases = new Databases(client);

async function test() {
  try {
    const orgId = ID.unique();
    const doc = await databases.createDocument(
      '69e90e4d00075469122c',
      'organizations',
      orgId,
      {
        id: orgId,
        name: 'Direct Test Org',
        email: 'directtest@example.com',
        plan_type: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
    console.log('Org created:', doc.$id);
  } catch (error) {
    console.error('Error:', error.message, error.code, error.type, error.response?.data || error.response);
  }
}

test();
