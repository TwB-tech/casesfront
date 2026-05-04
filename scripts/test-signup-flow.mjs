import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

async function testSignupVerifyLogin() {
  console.log('\n=== Testing Signup → Verify → Login Flow ===\n');

  const email = `test-${Date.now()}@example.com`;
  const password = 'TestPass123!';
  const username = 'Test User';
  const userId = `test_${Date.now()}`;

  // 1. Create account
  console.log('1. Creating account...');
  const accRes = await fetch(`${endpoint}/account`, {
    method: 'POST',
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: userId, email, password, name: username }),
  });
  const accData = await accRes.json();
  if (!accRes.ok) throw new Error('Account creation failed: ' + (accData.message || JSON.stringify(accData)));
  console.log('   ✅ Account created:', accData.$id);

  // 2. Create user document (use POST without ID to generate ID automatically)
  const verificationToken = `token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  const userDoc = {
    id: userId,
    email,
    username,
    role: 'individual',
    organization_id: null,
    verification_token: verificationToken,
    email_verified: false,
    status: 'Active',
    messaging_enabled: true,
    deadline_notifications: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log('2. Creating user document...');
  const docRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents`, {
    method: 'POST',
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentId: userId,
      data: userDoc,
    }),
  });
  const docResult = await docRes.json();
  if (!docRes.ok) throw new Error('Document creation failed: ' + (docResult.message || JSON.stringify(docResult)));
  console.log('   ✅ User document created with ID:', docResult.$id || docResult.id);

  // 3. Verify email (PATCH document)
  console.log('3. Verifying email...');
  const verifyId = docResult.$id || docResult.id;
  const patchRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents/${verifyId}`, {
    method: 'PATCH',
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { email_verified: true, verification_token: null } }),
  });
  const patchResult = await patchRes.json();
  if (!patchRes.ok) throw new Error('Verification failed: ' + (patchResult.message || JSON.stringify(patchResult)));
  console.log('   ✅ Email verified');

  // 4. Login
  console.log('4. Logging in...');
  const loginRes = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'X-Appwrite-Project': projectId, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error('Login failed: ' + (loginData.message || JSON.stringify(loginData)));
  console.log('   ✅ Login successful, session secret:', loginData.secret?.substring(0, 20) + '...');

  console.log('\n✅ Full signup → verify → login flow works correctly!\n');
}

testSignupVerifyLogin().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
