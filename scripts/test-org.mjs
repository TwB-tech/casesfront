// Quick test: org creation via proxy
const sessionId = '69eeb83012783c579c81'; // from earlier session might be invalid now; need fresh session first
const email = 'freshuser001@example.com';
const password = 'TestPass123!';

// 1. Get fresh session
async function getSession() {
  const res = await fetch('https://www.kwakorti.live/api/appwrite-proxy/account/sessions/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  console.log('Session status:', res.status);
  return data.$id;
}

// 2. Create org
async function createOrg(sessionId) {
  const orgId = 'org' + Date.now();
  const res = await fetch('https://www.kwakorti.live/api/appwrite-proxy/databases/69e90e4d00075469122c/collections/organizations/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Session': sessionId
    },
    body: JSON.stringify({ id: orgId, name: 'Test Org', email: email, plan_type: 'free' })
  });
  const data = await res.json();
  console.log('Org status:', res.status, data);
}

(async () => {
  try {
    const sessId = await getSession();
    console.log('Session ID:', sessId);
    await createOrg(sessId);
  } catch (e) {
    console.error('Error:', e.message, e.body);
  }
})();
