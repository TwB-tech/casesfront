import { Client, Databases } from 'appwrite';

const client = new Client();
client.setEndpoint('https://tor.cloud.appwrite.io/v1');
client.setProject('69e8bc1500162d3defdb');
client.setDevKey('standard_c0ef0d3a1fb6688a01c11efc38207f791dbb59a1a9157b9138504b8a148431bdbda78b87f8f7d3b1f5e0ff0c246766ec601175aacca06f06cc001060c001a6d9b857fd72c60ec477dd835e40a11f09644ab93b0654157409e861c1d9eb3edeb25539a68c3cf551ebcc58248da86d744e392891d813ce82a279d87eca13b59c9c');

const databases = new Databases(client);

async function patch() {
  try {
    const updated = await databases.updateCollectionAttribute(
      '69e90e4d00075469122c', // databaseId
      'cases',                 // collectionId
      'organization_id',       // attributeId (key)
      {
        required: false,
      }
    );
    console.log('Patched:', JSON.stringify(updated, null, 2));
  } catch (error) {
    console.error('Error:', error.message, error.code, error.response);
  }
}

patch();
