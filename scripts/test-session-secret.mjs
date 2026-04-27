const projectId = '69e8bc1500162d3defdb';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const endpoint = 'https://tor.cloud.appwrite.io/v1';

async function main() {
  // login - create session
  const loginRes = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  console.log('Full session:', loginData);
  const sessionId = loginData.$id;
  const secret = loginData.secret;
  console.log('Session ID:', sessionId);
  console.log('Secret length:', secret ? secret.length : 0);

  // Test GET /account with secret (JWT) as X-Appwrite-Session
  const accRes1 = await fetch(`${endpoint}/account`, {
    method: 'GET',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Session': secret // use secret, not ID
    },
    signal: AbortSignal.timeout(10000)
  });
  console.log('With secret — status:', accRes1.status);
  const accData1 = await accRes1.json().catch(() => ({}));
  console.log('Data:', accData1);

  // Test GET /account with session ID (should fail)
  const accRes2 = await fetch(`${endpoint}/account`, {
    method: 'GET',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Session': sessionId
    },
    signal: AbortSignal.timeout(10000)
  });
  console.log('With session ID — status:', accRes2.status);
  const accData2 = await accRes2.json().catch(() => ({}));
  console.log('Data:', accData2);
}

main().catch(e => console.error(e));
