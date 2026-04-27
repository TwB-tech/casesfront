// Test Appwrite session directly via REST
const endpoint = 'https://tor.cloud.appwrite.io/v1';
const projectId = '69e8bc1500162d3defdb';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';

async function main() {
  // Step 1: create session
  const loginRes = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId,
    },
    body: JSON.stringify({ email, password })
  });
  console.log('Login status:', loginRes.status);
  const loginData = await loginRes.json();
  const sessionId = loginData.$id;
  console.log('Session ID:', sessionId);

  // Step 2: get account using session header
  const accRes = await fetch(`${endpoint}/account`, {
    method: 'GET',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Session': sessionId,
    }
  });
  console.log('Account status:', accRes.status);
  const accData = await accRes.json();
  console.log('Account:', accData);
}

main().catch(e => console.error(e));
