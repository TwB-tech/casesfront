import { config } from 'dotenv';
config();

const endpoint = 'https://tor.cloud.appwrite.io/v1';
const projectId = '69e8bc1500162d3defdb';

async function testLogin(email, password) {
  try {
    const res = await fetch(`${endpoint}/account/sessions`, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    console.log(`Login ${email}:`, res.status, data);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

await testLogin('advocate@wakiliworld.local', 'demo1234');
await testLogin('admin@wakiliworld.local', 'demo1234');
await testLogin('client@wakiliworld.local', 'demo1234');
