const { appwrite } = require('./src/lib/appwrite.js');

async function testSignup() {
  const timestamp = Date.now();
  const email = `test${timestamp}@example.com`;
  const username = `TestUser${timestamp}`;
  const password = 'TestPass123!';
  const role = 'individual';

  console.log('Testing signup with:', { email, username, role });

  try {
    // Step 1: create user via auth.create
    const { data: newUser, error: createErr } = await appwrite.auth.create(null, email, password, username, {
      role,
      email_verified: false,
      status: 'Active',
      created_at: new Date().toISOString(),
    });
    if (createErr) throw createErr;
    console.log('✅ User created:', newUser.user.$id);

    // Step 2: create session
    const { data: session, error: sessionErr } = await appwrite.auth.createEmailSession(email, password);
    if (sessionErr) throw sessionErr;
    console.log('✅ Session created');

    // Step 3: create user profile
    const userProfile = {
      id: newUser.user.$id,
      username,
      email,
      role,
      phone_number: '',
      organization_id: null,
      created_at: new Date().toISOString(),
    };
    const { error: profileErr } = await appwrite.db.create(appwrite.COLLECTIONS.USERS, userProfile, newUser.user.$id);
    if (profileErr) throw profileErr;
    console.log('✅ Profile created');

    console.log('SIGNUP SUCCESS');
  } catch (error) {
    console.error('SIGNUP FAILED:', error.message || error);
    if (error.code) console.error('Code:', error.code);
    if (error.type) console.error('Type:', error.type);
  }
}

testSignup();
