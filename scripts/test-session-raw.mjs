const projectId = '69e8bc1500162d3defdb';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const endpoint = 'https://tor.cloud.appwrite.io/v1';

async function main() {
  const res = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId
    },
    body: JSON.stringify({ email, password })
  });
  const text = await res.text();
  console.log('Raw response text:', text);
  let data;
  try { data = JSON.parse(text); } catch(e) { data = { parseError: e.message }; }
  console.log('Parsed:', data);
}
main().catch(e => console.error(e));
