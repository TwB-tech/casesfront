const projectId = '69e8bc1500162d3defdb';
const apiKey = 'standard_c0ef0d3a1fb6688a01c11efc38207f791dbb59a1a9157b9138504b8a148431bdbda78b87f8f7d3b1f5e0ff0c246766ec601175aacca06f06cc001060c001a6d9b857fd72c60ec477dd835e40a11f09644ab93b0654157409e861c1d9eb3edeb25539a68c3cf551ebcc58248da86d744e392891d813ce82a279d87eca13b59c9c';
const dbId = '69e90e4d00075469122c';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const endpoint = 'https://tor.cloud.appwrite.io/v1';

async function main() {
  // Login to get session
  const loginRes = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email, password })
  });
  const { secret } = await loginRes.json();
  console.log('Secret length:', secret.length);

  const userId = 'rest' + Date.now();
  const profile = {
    id: userId,
    username: 'REST Test',
    email: `rest${Date.now()}@example.com`,
    role: 'individual',
    phone_number: '',
    created_at: new Date().toISOString()
  };

  const body = { documentId: userId, data: profile };

  const createRes = await fetch(`${endpoint}/databases/${dbId}/collections/users/documents`, {
    method: 'POST',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
      'X-Appwrite-Session': secret,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  });
  console.log('Create status:', createRes.status);
  const data = await createRes.json();
  console.log('Response:', JSON.stringify(data).substring(0, 400));
}
main().catch(e => console.error(e));
