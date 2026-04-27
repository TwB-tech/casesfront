import { Client, Databases, ID } from 'appwrite';

const projectId = '69e8bc1500162d3defdb';
const apiKey = 'standard_c0ef0d3a1fb6688a01c11efc38207f791dbb59a1a9157b9138504b8a148431bdbda78b87f8f7d3b1f5e0ff0c246766ec601175aacca06f06cc001060c001a6d9b857fd72c60ec477dd835e40a11f09644ab93b0654157409e861c1d9eb3edeb25539a68c3cf551ebcc58248da86d744e392891d813ce82a279d87eca13b59c9c';
const dbId = '69e90e4d00075469122c';
const client = new Client()
  .setEndpoint('https://tor.cloud.appwrite.io/v1')
  .setProject(projectId)
  .setKey(apiKey);

const db = new Databases(client);

async function main() {
  const userId = 'sdk' + Date.now();
  const profile = {
    id: userId,
    username: 'SDK Test',
    email: `sdk${Date.now()}@example.com`,
    role: 'individual',
    phone_number: '',
    alternative_phone_number: '',
    id_number: '',
    passport_number: '',
    date_of_birth: '',
    gender: 'Not set',
    address: '',
    nationality: 'Kenyan',
    occupation: '',
    marital_status: '',
    status: 'Active',
    timezone: 'EAT',
    messaging: true,
    client_communication: true,
    task_management: true,
    deadline_notifications: true,
    organization_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const doc = await db.createDocument(dbId, 'users', userId, profile);
    console.log('Created user doc:', doc.$id);
  } catch (error) {
    console.error('Create failed:', error.message, 'Code:', error.code, 'Type:', error.type);
    if (error.response) {
      console.log('Response data:', error.response.data || error.response);
    }
  }
}

main().catch(console.error);
