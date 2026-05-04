import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

const collId = 'testperm4';

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

// Add a read permission for any
fetch(`${endpoint}/databases/${databaseId}/collections/${collId}/permissions`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ permission: 'read("any")' }),
})
  .then(res => {
    console.log('Add read status:', res.status);
    return res.json();
  })
  .then(data => console.log('Add read response:', JSON.stringify(data).substring(0,200)))
  .catch(err => console.error('Error adding read:', err.message));

// Add write permission for users
fetch(`${endpoint}/databases/${databaseId}/collections/${collId}/permissions`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ permission: 'write("users")' }),
})
  .then(res => {
    console.log('Add write status:', res.status);
    return res.json();
  })
  .then(data => console.log('Add write response:', JSON.stringify(data).substring(0,200)))
  .catch(err => console.error('Error adding write:', err.message));
