const projectId = '69e8bc1500162d3defdb';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const proxy = 'https://www.kwakorti.live/api/appwrite-proxy';

async function main() {
  // Create session via proxy
  const loginRes = await fetch(`${proxy}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  console.log('Login status:', loginRes.status);
  const secret = loginData.secret;
  console.log('Secret length:', secret.length);

  // Test GET /account using that secret as X-Appwrite-Session via proxy
  const accRes = await fetch(`${proxy}/account`, {
    method: 'GET',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Session': secret
    },
    signal: AbortSignal.timeout(15000)
  });
  console.log('Account via proxy status:', accRes.status);
  const accData = await accRes.json();
  console.log('Account data:', accData);

  // Also test getting a document via proxy: GET /databases/.../users/...
  const dbId = '69e90e4d00075469122c';
  const userId = loginData.userId;
  const docRes = await fetch(`${proxy}/databases/${dbId}/collections/users/documents/${userId}`, {
    method: 'GET',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Session': secret
    },
    signal: AbortSignal.timeout(15000)
  });
  console.log('Doc status:', docRes.status);
  const docData = await docRes.json();
  console.log('Doc data snippet:', JSON.stringify(docData).substring(0, 200));
}

main().catch(e => console.error('Error:', e.message));
