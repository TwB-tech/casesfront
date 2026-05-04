import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;

const headers = {
  'X-Appwrite-Project': projectId,
  'Content-Type': 'application/json',
};

const email = 'advocate@wakiliworld.local';
const password = 'demo1234';

fetch(`${endpoint}/account/sessions/email`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ email, password }),
})
  .then(res => res.json())
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch(err => console.error('Error:', err.message));
