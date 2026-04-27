const projectId = '69e8bc1500162d3defdb';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';
const proxy = 'https://www.kwakorti.live/api/appwrite-proxy';

async function main() {
  try {
    const res = await fetch(`${proxy}/account/sessions/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(15000)
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Raw response:', text);
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { parseError: e.message }; }
    console.log('Parsed:', data);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
main();
