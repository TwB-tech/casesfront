const projectId = '69e8bc1500162d3defdb';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const endpoint = 'https://tor.cloud.appwrite.io/v1';

async function main() {
  // login
  const loginRes = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  const sessionId = loginData.$id;
  const jwtSecret = loginData.secret;
  console.log('Session ID:', sessionId);
  console.log('JWT Secret length:', jwtSecret.length);

  // Try GET /account with session ID
  const trySession = async (headerName, token) => {
    const start = Date.now();
    try {
      const res = await fetch(`${endpoint}/account`, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': projectId,
          [headerName]: token
        },
        signal: AbortSignal.timeout(10000) // 10s timeout
      });
      const data = await res.json();
      console.log(`${headerName} status:`, res.status, data);
    } catch (e) {
      console.log(`${headerName} error after ${Date.now()-start}ms:`, e.message);
    }
  };

  await trySession('X-Appwrite-Session', sessionId);
  await trySession('X-Appwrite-JWT', jwtSecret);
  await trySession('X-Appwrite-Session', jwtSecret);
  await trySession('X-Appwrite-JWT', sessionId);
}

main();
