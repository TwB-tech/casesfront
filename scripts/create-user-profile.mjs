const projectId = '69e8bc1500162d3defdb';
const dbId = '69e90e4d00075469122c';
const proxy = 'https://www.kwakorti.live/api/appwrite-proxy';
const email = 'freshuser001@example.com';
const password = 'TestPass123!';

async function main() {
  // login to get session secret
  const loginRes = await fetch(`${proxy}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  const secret = loginData.secret;
  const userId = loginData.userId;
  console.log('Session secret length:', secret.length, 'userId:', userId);

  // Create user profile document using POST? documentId=
  const profile = {
    id: userId,
    username: 'Fresh User',
    email: email,
    role: 'individual',
    phone_number: '',
    alternative_phone_number: '',
    id_number: '',
    passport_number: '',
    date_of_birth: '',
    gender: 'Not set',
    address: '',
    nationality: 'Kenyan',
    occupation: '',
    marital_status: '',
    status: 'Active',
    timezone: 'EAT',
    messaging: true,
    client_communication: true,
    task_management: true,
    deadline_notifications: true,
    organization_id: null,
    created_at: new Date().toISOString()
  };

  const url = `${proxy}/databases/${dbId}/collections/users/documents?documentId=${encodeURIComponent(userId)}`;
  console.log('POST to:', url);
  const createRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Session': secret
    },
    body: JSON.stringify(profile),
    signal: AbortSignal.timeout(15000)
  });
  console.log('Create status:', createRes.status);
  const data = await createRes.json();
  console.log('Response snippet:', JSON.stringify(data).substring(0, 300));
}

main().catch(e => console.error(e));
