const projectId = '69e8bc1500162d3defdb';
const dbId = '69e90e4d00075469122c';
const proxy = 'https://www.kwakorti.live/api/appwrite-proxy';
const timestamp = Date.now();
const email = `indv${timestamp}@example.com`;
const username = `Indv${timestamp}`;
const password = 'TestPass123!';
const userId = `indv${timestamp}`;

async function main() {
  console.log('=== Testing individual signup flow via proxy ===\n');

  // Step 1: create account (auth.create)
  console.log('1. Creating user account...');
  const createRes = await fetch(`${proxy}/account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId
    },
    body: JSON.stringify({
      userId,
      email,
      password,
      name: username
    }),
    signal: AbortSignal.timeout(15000)
  });
  console.log('Create status:', createRes.status);
  const createData = await createRes.json();
  if (!createRes.ok) {
    console.log('Create error:', JSON.stringify(createData).substring(0, 300));
    return;
  }
  console.log('User created, ID:', createData.$id);

  // Step 2: create email session (auth.createEmailSession)
  console.log('\n2. Creating email session...');
  const sessRes = await fetch(`${proxy}/account/sessions/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId
    },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(15000)
  });
  console.log('Session status:', sessRes.status);
  const sessData = await sessRes.json();
  if (!sessRes.ok) {
    console.log('Session error:', JSON.stringify(sessData).substring(0, 300));
    return;
  }
  const sessionSecret = sessData.secret;
  console.log('Session secret length:', sessionSecret.length);

  // Step 3: create user profile in users collection
  console.log('\n3. Creating user profile in users collection...');
  const profile = {
    id: userId,
    username: username,
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
  const profileRes = await fetch(`${proxy}/databases/${dbId}/collections/users/documents/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Session': sessionSecret
    },
    body: JSON.stringify(profile),
    signal: AbortSignal.timeout(15000)
  });
  console.log('Profile status:', profileRes.status);
  const profileData = await profileRes.json();
  if (!profileRes.ok) {
    console.log('Profile error:', JSON.stringify(profileData).substring(0, 300));
  } else {
    console.log('Profile created successfully!');
  }
}

main().catch(e => console.error('Unhandled error:', e));
