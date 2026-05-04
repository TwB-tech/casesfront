import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
};

fetch(`${endpoint}/users?limit=100`, { headers })
  .then(res => res.json())
  .then(data => {
    if (data.users) {
      console.log(`Found ${data.users.length} users:`);
      data.users.forEach(u => {
        console.log(`- ${u.email} (ID: ${u.$id}, name: ${u.name})`);
      });
    } else {
      console.log('No users array:', JSON.stringify(data).substring(0,200));
    }
  })
  .catch(err => console.error('Error:', err.message));
