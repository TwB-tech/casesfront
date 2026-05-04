import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

const headers = {
  'X-Appwrite-Project': projectId,
  'Content-Type': 'application/json',
};

const payload = { email: 'test@example.com', password: 'test' };

fetch(`${endpoint}/account/sessions/email`, {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
})
  .then(res => {
    console.log('Status:', res.status);
    return res.json().catch(() => res.text()).then(d => console.log('Body:', typeof d === 'object' ? JSON.stringify(d).substring(0,200) : d));
  })
  .catch(err => console.error('Error:', err.message));
