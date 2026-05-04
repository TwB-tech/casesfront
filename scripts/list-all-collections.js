import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
};

fetch(`${endpoint}/databases/${databaseId}/collections?limit=100`, { headers })
  .then(res => res.json())
  .then(data => {
    if (data.collections) {
      console.log(`Found ${data.collections.length} collections:`);
      data.collections.forEach(c => {
        console.log(` - ${c.name} (${c.$id})`);
        console.log(`   documentSecurity: ${c.documentSecurity}`);
        console.log(`   $permissions: ${JSON.stringify(c.$permissions)}`);
      });
    } else {
      console.log('Error or no collections:', JSON.stringify(data).substring(0,200));
    }
  })
  .catch(err => console.error('Fetch error:', err.message));
