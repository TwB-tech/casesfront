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

// GET users collection
fetch(`${endpoint}/databases/${databaseId}/collections/users`, { headers })
  .then(res => res.json())
  .then(data => {
    console.log('Collection users:');
    console.log(' documentSecurity:', data.documentSecurity);
    console.log(' $permissions:', JSON.stringify(data.$permissions));
    // Now try to list documents (public read should work with API key)
    return fetch(`${endpoint}/databases/${databaseId}/collections/users/documents?limit=1`, { headers });
  })
  .then(res => res.json())
  .then(data => {
    console.log('List users documents:');
    console.log(' total:', data.total || 'N/A');
    console.log(' documents[0] fields:', data.documents?.[0] ? Object.keys(data.documents[0]).join(', ') : 'none');
  })
  .catch(err => console.error('Error:', err.message));
