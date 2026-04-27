const projectId = '69e8bc1500162d3defdb';
const apiKey = 'standard_c0ef0d3a1fb6688a01c11efc38207f791dbb59a1a9157b9138504b8a148431bdbda78b87f8f7d3b1f5e0ff0c246766ec601175aacca06f06cc001060c001a6d9b857fd72c60ec477dd835e40a11f09644ab93b0654157409e861c1d9eb3edeb25539a68c3cf551ebcc58248da86d744e392891d813ce82a279d87eca13b59c9c';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const endpoint = 'https://tor.cloud.appwrite.io/v1';

async function main() {
  const res = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey
    },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(15000)
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Raw:', text.substring(0, 400));
  let data;
  try { data = JSON.parse(text); } catch(e) { data = { parseError: e.message }; }
  console.log('Secret length:', data.secret ? data.secret.length : 'no secret field');
}
main().catch(e => console.error(e));
