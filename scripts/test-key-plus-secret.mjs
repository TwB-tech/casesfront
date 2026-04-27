const projectId = '69e8bc1500162d3defdb';
const apiKey = 'standard_c0ef0d3a1fb6688a01c11efc38207f791dbb59a1a9157b9138504b8a148431bdbda78b87f8f7d3b1f5e0ff0c246766ec601175aacca06f06cc001060c001a6d9b857fd72c60ec477dd835e40a11f09644ab93b0654157409e861c1d9eb3edeb25539a68c3cf551ebcc58248da86d744e392891d813ce82a279d87eca13b59c9c';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const endpoint = 'https://tor.cloud.appwrite.io/v1';

async function main() {
  // Create session with API key
  const loginRes = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  const secret = loginData.secret;
  console.log('Secret length:', secret.length);

  // GET /account with both API key and session secret
  const accRes = await fetch(`${endpoint}/account`, {
    method: 'GET',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
      'X-Appwrite-Session': secret
    },
    signal: AbortSignal.timeout(15000)
  });
  console.log('Status with both:', accRes.status);
  const accData = await accRes.json();
  console.log('Response:', JSON.stringify(accData).substring(0, 200));
}
main().catch(console.error);
