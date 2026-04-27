const projectId = '69e8bc1500162d3defdb';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const endpoint = 'https://tor.cloud.appwrite.io/v1';
const proxy = 'https://www.kwakorti.live/api/appwrite-proxy';

async function main() {
  // Get session via proxy (to get secret with API key applied)
  const loginRes = await fetch(`${proxy}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  const secret = loginData.secret;
  console.log('Got secret, length:', secret.length);

  // Direct to Appwrite: GET /account with secret as X-Appwrite-Session
  const directRes = await fetch(`${endpoint}/account`, {
    method: 'GET',
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Session': secret },
    signal: AbortSignal.timeout(15000)
  });
  console.log('Direct status:', directRes.status);
  const directData = await directRes.json();
  console.log('Direct:', JSON.stringify(directData).substring(0, 200));

  // Via proxy: GET /account with secret
  const proxyRes = await fetch(`${proxy}/account`, {
    method: 'GET',
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Session': secret },
    signal: AbortSignal.timeout(15000)
  });
  console.log('Proxy status:', proxyRes.status);
  const proxyData = await proxyRes.json();
  console.log('Proxy:', JSON.stringify(proxyData).substring(0, 200));
}

main().catch(e => console.error(e));
