/**
 * WakiliWorld Appwrite Integration Test
 * Uses direct REST API calls to validate all core operations.
 */

import fs from 'fs';
import path from 'path';

function loadEnv() {
  const env = {};
  try {
    const content = fs.readFileSync('.env', 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      let value = trimmed.substring(eqIdx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch (err) {
    console.error('❌ Could not read .env:', err.message);
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const endpoint = (env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = env.APPWRITE_PROJECT_ID;
const apiKey = env.APPWRITE_API_KEY;
const databaseId = env.APPWRITE_DATABASE_ID || 'default';

if (!projectId || !apiKey) {
  console.error('❌ Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env');
  process.exit(1);
}

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

let currentSession = null;
function setSession(secret) {
  currentSession = secret;
  apiHeaders['X-Appwrite-Session'] = secret;
  // keep API key as well for server-side privileges
}
function clearSession() {
  delete apiHeaders['X-Appwrite-Session'];
  // keep API key? We'll leave it if needed; but for thorough logout we can also delete key
  // delete apiHeaders['X-Appwrite-Key'];
  currentSession = null;
}

async function api(method, path, body) {
  const url = `${endpoint}${path}`;
  const options = { method, headers: apiHeaders };
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    delete options.headers['Content-Type'];
    options.body = body;
  }
  if (method !== 'GET') {
    console.log(`   [${method}] ${path}`, body ? JSON.stringify(body).slice(0, 100) : '');
    console.log(`   Headers:`, apiHeaders);
  }
  const res = await fetch(url, options);
  let data;
  const ct = res.headers.get('content-type');
  try {
    if (ct && ct.includes('application/json')) data = await res.json();
    else data = { message: await res.text() };
  } catch (e) {
    data = { error: e.message };
  }
  if (!res.ok) {
    const err = new Error(data.message || data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ID generator
const ID = {
  unique() {
    return `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  },
};

const TIMESTAMP = Date.now();
const TEST_ADMIN = {
  email: `admin-${TIMESTAMP}@test.com`,
  password: 'TestPass123!',
  username: 'Int Admin',
};
const TEST_ADVOCATE = {
  email: `adv-${TIMESTAMP}@test.com`,
  password: 'TestPass123!',
  username: 'Int Advocate',
};
const TEST_CLIENT = {
  email: `client-${TIMESTAMP}@test.com`,
  password: 'TestPass123!',
  username: 'Int Client',
};

const results = { passed: 0, failed: 0, tests: [] };

function test(name) {
  return async (fn) => {
    try {
      await fn();
      results.passed++;
      results.tests.push({ name, status: 'PASS' });
      console.log(`  ✓ ${name}`);
    } catch (e) {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', error: e.message });
      console.log(`  ✗ ${name}: ${e.message}`);
    }
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function runTests() {
  console.log('\n=== WakiliWorld Appwrite Integration Test ===\n');

  // 1. Database & Collections
  console.log('🔹 Database Connectivity');
  await test('Database exists')(async () => {
    await api('GET', `/databases/${databaseId}`);
  });

  await test('All core collections present')(async () => {
    const result = await api('GET', `/databases/${databaseId}/collections?limit=100`);
    const ids = result.collections.map((c) => c.$id).sort();
    const required = [
      'organizations',
      'users',
      'cases',
      'tasks',
      'documents',
      'invoices',
      'admin_settings',
      'invites',
    ];
    const missing = required.filter((r) => !ids.includes(r));
    if (missing.length) throw new Error(`Missing collections: ${missing.join(', ')}`);
  });

  // 2. Authentication
  console.log('\n🔹 Authentication');
  let adminUserId, advocateUserId, clientUserId;

  await test('Create admin account')(async () => {
    const user = await api('POST', '/account', {
      userId: ID.unique(),
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
      name: TEST_ADMIN.username,
    });
    adminUserId = user.$id;
  });

  await test('Create advocate account')(async () => {
    const user = await api('POST', '/account', {
      userId: ID.unique(),
      email: TEST_ADVOCATE.email,
      password: TEST_ADVOCATE.password,
      name: TEST_ADVOCATE.username,
    });
    advocateUserId = user.$id;
  });

  await test('Create client account')(async () => {
    const user = await api('POST', '/account', {
      userId: ID.unique(),
      email: TEST_CLIENT.email,
      password: TEST_CLIENT.password,
      name: TEST_CLIENT.username,
    });
    clientUserId = user.$id;
  });

  await test('Create user profiles in users collection')(async () => {
    const createProfile = (userId, role, userData) => ({
      documentId: userId, // use same ID for easier lookup
      data: {
        id: userId,
        username: userData.username,
        email: userData.email,
        role,
        organization_id: 'pending',
        status: 'Active',
        created_at: new Date().toISOString(),
      },
    });
    await api(
      'POST',
      `/databases/${databaseId}/collections/users/documents`,
      createProfile(adminUserId, 'admin', TEST_ADMIN)
    );
    await api(
      'POST',
      `/databases/${databaseId}/collections/users/documents`,
      createProfile(advocateUserId, 'advocate', TEST_ADVOCATE)
    );
    await api(
      'POST',
      `/databases/${databaseId}/collections/users/documents`,
      createProfile(clientUserId, 'individual', TEST_CLIENT)
    );
  });

  await test('Login as admin (create email session)')(async () => {
    const session = await api('POST', '/account/sessions', {
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
    });
    setSession(session.secret);
  });

  await test('Verify session (get current account)')(async () => {
    // Temporarily remove API key to test user session only
    const originalKey = apiHeaders['X-Appwrite-Key'];
    delete apiHeaders['X-Appwrite-Key'];
    const me = await api('GET', '/account');
    assert(me.email === TEST_ADMIN.email, 'Email mismatch');
    // restore key
    if (originalKey) apiHeaders['X-Appwrite-Key'] = originalKey;
  });

  // 3. Documents
  console.log('\n🔹 Documents');
  let docId = '';
  await test('Create document')(async () => {
    const documentId = ID.unique();
    const doc = await api('POST', `/databases/${databaseId}/collections/documents/documents`, {
      documentId,
      data: {
        id: documentId,
        title: 'Test Document',
        description: 'Created by integration test',
        owner: adminUserId,
        organization_id: 'org-pending',
        shared_with: [],
        created_at: new Date().toISOString(),
      },
    });
    docId = doc.$id;
  });

  await test('Read document')(async () => {
    const doc = await api(
      'GET',
      `/databases/${databaseId}/collections/documents/documents/${docId}`
    );
    assert(doc.title === 'Test Document');
  });

  await test('Update document')(async () => {
    const updated = await api(
      'PATCH',
      `/databases/${databaseId}/collections/documents/documents/${docId}`,
      {
        data: { title: 'Updated Document' },
      }
    );
    assert(updated.title === 'Updated Document');
  });

  await test('Delete document')(async () => {
    await api('DELETE', `/databases/${databaseId}/collections/documents/documents/${docId}`);
    try {
      await api('GET', `/databases/${databaseId}/collections/documents/documents/${docId}`);
      assert(false, 'Expected document to be gone');
    } catch (e) {
      assert(e.status === 404);
    }
  });

  // 4. Cases
  console.log('\n🔹 Cases');
  let caseId = '';
  await test('Create case')(async () => {
    const caseDocId = ID.unique();
    const c = await api('POST', `/databases/${databaseId}/collections/cases/documents`, {
      documentId: caseDocId,
      data: {
        id: caseDocId,
        case_number: `CW-${TIMESTAMP}`,
        title: 'Test Case',
        description: 'Test case description',
        status: 'open',
        organization_id: 'org-pending',
        client_id: clientUserId,
        advocate_id: advocateUserId,
        created_by: adminUserId,
      },
    });
    caseId = c.$id;
  });

  await test('Get case')(async () => {
    const c = await api('GET', `/databases/${databaseId}/collections/cases/documents/${caseId}`);
    assert(c.title === 'Test Case');
  });

  // 5. Tasks
  console.log('\n🔹 Tasks');
  await test('Create task')(async () => {
    const taskDocId = ID.unique();
    const t = await api('POST', `/databases/${databaseId}/collections/tasks/documents`, {
      documentId: taskDocId,
      data: {
        id: taskDocId,
        title: 'Test Task',
        description: 'Task description',
        assigned_to: advocateUserId,
        case_id: caseId,
        priority: 'medium',
        organization_id: 'org-pending',
        created_by: adminUserId,
      },
    });
    assert(t.title === 'Test Task');
  });

  // 6. Invoices
  console.log('\n🔹 Invoices');
  await test('Create invoice')(async () => {
    const invDocId = ID.unique();
    const inv = await api('POST', `/databases/${databaseId}/collections/invoices/documents`, {
      documentId: invDocId,
      data: {
        id: invDocId,
        invoice_number: `INV-${TIMESTAMP}`,
        client_name: 'Test Client',
        client_address: '123 Test St',
        total_amount: 1000,
        amount_due: 1000,
        tax: 0,
        items: JSON.stringify([{ description: 'Service', quantity: 1, unit_price: 1000 }]),
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        organization_id: 'org-pending',
      },
    });
    assert(inv.invoice_number === `INV-${TIMESTAMP}`);
  });

  // 7. Admin Settings
  console.log('\n🔹 Admin Settings');
  await test('Get or create default admin settings')(async () => {
    try {
      await api('GET', `/databases/${databaseId}/collections/admin_settings/documents/default`);
    } catch (e) {
      if (e.status === 404) {
        await api('POST', `/databases/${databaseId}/collections/admin_settings/documents`, {
          documentId: 'default',
          data: {
            id: 'default',
            case_status: false,
            case_assignment: false,
            progress_tracking: false,
            milestones: false,
            client_fields: false,
            client_portal_access: false,
          },
        });
      }
    }
  });

  await test('Update admin settings')(async () => {
    const updated = await api(
      'PATCH',
      `/databases/${databaseId}/collections/admin_settings/documents/default`,
      {
        data: { case_status: true, milestones: true },
      }
    );
    assert(updated.case_status === true && updated.milestones === true);
  });

  // 8. Chat
  console.log('\n🔹 Chat');
  let roomId = '';
  await test('Create chat room')(async () => {
    const roomName = `room-${[adminUserId, advocateUserId].sort().join('-')}`;
    const roomDocId = ID.unique();
    const room = await api('POST', `/databases/${databaseId}/collections/chat_rooms/documents`, {
      documentId: roomDocId,
      data: {
        id: roomDocId,
        room_name: roomName,
        participants: [adminUserId, advocateUserId],
        organization_id: 'org-pending',
      },
    });
    roomId = room.$id;
    assert(room.room_name === roomName);
  });

  await test('Send chat message')(async () => {
    const msgDocId = ID.unique();
    const msg = await api('POST', `/databases/${databaseId}/collections/chat_messages/documents`, {
      documentId: msgDocId,
      data: {
        id: msgDocId,
        room: roomId,
        sender: 1, // integer per schema
        content: 'Hello from integration test',
        timestamp: new Date().toISOString(),
        attachments: [],
      },
    });
    assert(msg.content === 'Hello from integration test');
  });

  // 9. Invitations
  console.log('\n🔹 Invitations');
  await test('Create invite')(async () => {
    const inviteDocId = ID.unique();
    const invite = await api('POST', `/databases/${databaseId}/collections/invites/documents`, {
      documentId: inviteDocId,
      data: {
        id: inviteDocId,
        email: `invitee-${Date.now()}@test.com`,
        role: 'employee',
        organization_id: 'org-pending',
        status: 'pending',
        invited_by: adminUserId,
        token: ID.unique(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    assert(invite.token);
  });

  // 10. Reporting
  console.log('\n🔹 Reporting');
  await test('User stats query')(async () => {
    // Simple list operations to verify read access
    await api('GET', `/databases/${databaseId}/collections/cases/documents`);
    await api('GET', `/databases/${databaseId}/collections/tasks/documents`);
    await api('GET', `/databases/${databaseId}/collections/documents/documents`);
  });

  await test('Financial dashboard query')(async () => {
    await api('GET', `/databases/${databaseId}/collections/invoices/documents`);
    await api('GET', `/databases/${databaseId}/collections/expenses/documents`);
  });

  // 11. User switching
  console.log('\n🔹 User Switching');
  await test('Switch to advocate')(async () => {
    clearSession();
    const sess = await api('POST', '/account/sessions', {
      email: TEST_ADVOCATE.email,
      password: TEST_ADVOCATE.password,
    });
    setSession(sess.secret);
  });

  await test('Advocate creates own document')(async () => {
    const docDocId = ID.unique();
    const doc = await api('POST', `/databases/${databaseId}/collections/documents/documents`, {
      documentId: docDocId,
      data: {
        id: docDocId,
        title: 'Advocate Doc',
        owner: advocateUserId,
        organization_id: 'org-pending',
      },
    });
    assert(doc.owner === advocateUserId);
  });

  await test('Logout')(async () => {
    // Simply clear the session locally and verify unauthenticated
    clearSession();
    try {
      await api('GET', '/account');
      assert(false, 'Should be unauthenticated');
    } catch (e) {
      assert(e.status === 401 || e.message.includes('session'), 'Expected session error');
    }
  });

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  if (results.failed > 0) {
    console.log('\nFailed tests:');
    results.tests
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => console.log(`  - ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log('\n✅ All integration tests passed');
  }
}

runTests().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
