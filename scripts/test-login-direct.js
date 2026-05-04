import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;

// No API key for login endpoint (it's public)
const headers = {
  'X-Appwrite-Project': projectId,
  'Content-Type': 'application/json',
};

const payload = {
  email: 'advocate@wakiliworld.local',
  password: 'demo1234',
};

fetch(`${endpoint}/account/sessions/email`, {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
})
  .then(res => {
    console.log('Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('Response:', JSON.stringify(data).substring(0,300));
  })
  .catch(err => console.error('Fetch error:', err.message));
