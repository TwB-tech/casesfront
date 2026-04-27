const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const endpoint = 'https://www.kwakorti.live/api/appwrite-proxy';
const projectId = '69e8bc1500162d3defdb';
const dbId = '69e90e4d00075469122c';

async function main() {
  // Get session
  const loginRes = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  const sessionId = loginData.$id;
  console.log('Session:', sessionId, 'Status:', loginRes.status);

  // Use that session to get own account via GET /account (should work)
  const accRes = await fetch(`${endpoint}/account`, {
    method: 'GET',
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Session': sessionId }
  });
  console.log('Account status:', accRes.status);
  const accData = await accRes.json();
  console.log('Account message:', accData.message);

  // Get user document from users collection
  const userId = loginData.userId;
  const docRes = await fetch(`${endpoint}/databases/${dbId}/collections/users/documents/${userId}`, {
    method: 'GET',
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Session': sessionId }
  });
  console.log('Doc status:', docRes.status);
  const docData = await docRes.json();
  console.log('Doc:', docData);
}

main().catch(e => console.error(e));
