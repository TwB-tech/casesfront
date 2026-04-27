const projectId = '69e8bc1500162d3defdb';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const endpoint = 'https://tor.cloud.appwrite.io/v1';

async function main() {
  const loginRes = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  console.log('Login status', loginRes.status, loginData);
  const sessionId = loginData.$id;

  const accRes = await fetch(`${endpoint}/account`, {
    method: 'GET',
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Session': sessionId }
  });
  console.log('Account status', accRes.status);
  const accData = await accRes.json();
  console.log('Account data', accData);
}

main();
