/**
 * WakiliWorld Appwrite Integration Test Suite
 *
 * Tests core database operations using the Appwrite SDK with user sessions.
 * Run: node tests/integration-test.js
 *
 * Prerequisites:
 *   - .env with APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID, DATABASE_MODE=appwrite
 *   - Database and collections created (npm run db:setup)
 */

import { Client, Account, Databases, Query, ID } from 'appwrite';
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
const databaseId = env.APPWRITE_DATABASE_ID || 'default';

if (!projectId) {
  console.error('❌ Missing APPWRITE_PROJECT_ID in .env');
  process.exit(1);
}

// Initialize Appwrite client (no API key; will use user sessions)
const client = new Client();
client.setEndpoint(endpoint);
client.setProject(projectId);

const account = new Account(client);
const databases = new Databases(client);

// Test user data
const TIMESTAMP = Date.now();
const TEST_ADMIN = {
  email: `admin-${TIMESTAMP}@test.com`,
  password: 'TestPass123!',
  username: 'Integration Admin',
  role: 'admin',
};
const TEST_ADVOCATE = {
  email: `advocate-${TIMESTAMP}@test.com`,
  password: 'TestPass123!',
  username: 'Integration Advocate',
  role: 'advocate',
};
const TEST_CLIENT = {
  email: `client-${TIMESTAMP}@test.com`,
  password: 'TestPass123!',
  username: 'Integration Client',
  role: 'individual',
};

const results = { passed: 0, failed: 0, tests: [] };
let adminUserId = '';
let advocateUserId = '';
let clientUserId = '';

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

async function createUserProfile(userData, userId) {
  // Create user profile in users collection
  await databases.createDocument(databaseId, 'users', userId, {
    id: userId,
    username: userData.username,
    email: userData.email,
    role: userData.role,
    organization_id: 'pending',
    status: 'Active',
    email_verified: true,
    created_at: new Date().toISOString(),
  });
}

async function runTests() {
  console.log('\n=== WakiliWorld Appwrite Integration Test ===\n');

  // 1. Database Connectivity
  console.log('🔹 Database Connectivity');
  await test('List all expected collections')(async () => {
    const res = await databases.listCollections(databaseId);
    const names = res.collections.map((c) => c.name).sort();
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
    required.forEach((r) => assert(names.includes(r), `Missing collection: ${r}`));
  });

  // 2. Authentication & User Creation
  console.log('\n🔹 Authentication');
  await test('Create and log in as admin user')(async () => {
    // Create user via account API (sign-up)
    const user = await account.create(
      ID.unique(),
      TEST_ADMIN.email,
      TEST_ADMIN.password,
      TEST_ADMIN.username
    );
    adminUserId = user.$id;
    // Create profile
    await createUserProfile(TEST_ADMIN, adminUserId);
    // Login
    const session = await account.createEmailSession(TEST_ADMIN.email, TEST_ADMIN.password);
    client.setSession(session.secret);
  });

  await test('Create advocate user')(async () => {
    const user = await account.create(
      ID.unique(),
      TEST_ADVOCATE.email,
      TEST_ADVOCATE.password,
      TEST_ADVOCATE.username
    );
    advocateUserId = user.$id;
    await createUserProfile(TEST_ADVOCATE, advocateUserId);
  });

  await test('Create client user')(async () => {
    const user = await account.create(
      ID.unique(),
      TEST_CLIENT.email,
      TEST_CLIENT.password,
      TEST_CLIENT.username
    );
    clientUserId = user.$id;
    await createUserProfile(TEST_CLIENT, clientUserId);
  });

  await test('Verify admin session (account.get)')(async () => {
    const current = await account.get();
    assert(current.email === TEST_ADMIN.email);
  });

  // 3. Document Operations
  console.log('\n🔹 Document Management');
  let docId = '';

  await test('Create document')(async () => {
    const orgId = 'org-pending';
    const doc = await databases.createDocument(databaseId, 'documents', ID.unique(), {
      title: 'Test Document',
      description: 'Created by integration test',
      owner: adminUserId,
      organization_id: orgId,
      shared_with: [],
      created_at: new Date().toISOString(),
    });
    docId = doc.$id;
    assert(doc.title === 'Test Document');
  });

  await test('Read created document')(async () => {
    const doc = await databases.getDocument(databaseId, 'documents', docId);
    assert(doc.$id === docId);
    assert(doc.title === 'Test Document');
  });

  await test('Update document')(async () => {
    const updated = await databases.updateDocument(databaseId, 'documents', docId, {
      title: 'Updated Document',
    });
    assert(updated.title === 'Updated Document');
  });

  await test('Delete document')(async () => {
    await databases.deleteDocument(databaseId, 'documents', docId);
    try {
      await databases.getDocument(databaseId, 'documents', docId);
      assert(false, 'Should have been deleted');
    } catch (e) {
      assert(e.code === 404, 'Expected not found');
    }
  });

  // 4. Case, Task, Invoice
  console.log('\n🔹 Core CRUD');
  let caseId = '';

  await test('Create case')(async () => {
    const orgId = 'org-pending';
    const caseData = {
      id: ID.unique(),
      organization_id: orgId,
      case_number: `CW-${TIMESTAMP}`,
      title: 'Integration Test Case',
      description: 'Test case',
      status: 'open',
      client_id: clientUserId,
      advocate_id: advocateUserId,
      created_by: adminUserId,
      created_at: new Date().toISOString(),
    };
    const c = await databases.createDocument(databaseId, 'cases', caseData.id, caseData);
    caseId = c.$id;
    assert(c.title === 'Integration Test Case');
  });

  await test('Get case')(async () => {
    const c = await databases.getDocument(databaseId, 'cases', caseId);
    assert(c.$id === caseId);
  });

  let taskId = '';

  await test('Create task')(async () => {
    const orgId = 'org-pending';
    const task = await databases.createDocument(databaseId, 'tasks', ID.unique(), {
      title: 'Integration Task',
      description: 'Test task',
      assigned_to: advocateUserId,
      case_id: caseId,
      priority: 'medium',
      status: false,
      organization_id: orgId,
      created_by: adminUserId,
      created_at: new Date().toISOString(),
    });
    taskId = task.$id;
    assert(task.title === 'Integration Task');
  });

  await test('Create invoice')(async () => {
    const orgId = 'org-pending';
    const inv = await databases.createDocument(databaseId, 'invoices', ID.unique(), {
      invoice_number: `INV-${TIMESTAMP}`,
      client_name: 'Test Client',
      client_address: '123 Test St',
      total_amount: 1000,
      amount_due: 1000,
      tax: 0,
      items: JSON.stringify([{ description: 'Consultation', quantity: 1, unit_price: 1000 }]),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      organization_id: orgId,
    });
    assert(inv.invoice_number === `INV-${TIMESTAMP}`);
  });

  // 5. Admin Settings
  console.log('\n🔹 Admin Operations');
  await test('Get admin settings (create default if missing)')(async () => {
    try {
      await databases.getDocument(databaseId, 'admin_settings', 'default');
    } catch (e) {
      if (e.code === 404) {
        await databases.createDocument(databaseId, 'admin_settings', 'default', {
          id: 'default',
          case_status: false,
          case_assignment: false,
          progress_tracking: false,
          milestones: false,
          client_fields: false,
          client_portal_access: false,
          updated_at: new Date().toISOString(),
        });
      }
    }
    const settings = await databases.getDocument(databaseId, 'admin_settings', 'default');
    assert(settings.id === 'default');
  });

  await test('Update admin settings')(async () => {
    const updated = await databases.updateDocument(databaseId, 'admin_settings', 'default', {
      case_status: true,
      milestones: true,
    });
    assert(updated.case_status === true);
    assert(updated.milestones === true);
  });

  // 6. Chat
  console.log('\n🔹 Chat');
  await test('Create chat room')(async () => {
    const roomName = `room-${[adminUserId, advocateUserId].sort().join('-')}`;
    const room = await databases.createDocument(databaseId, 'chat_rooms', ID.unique(), {
      room_name: roomName,
      participants: [adminUserId, advocateUserId],
      organization_id: 'org-pending',
      created_at: new Date().toISOString(),
    });
    assert(room.room_name === roomName);
  });

  await test('Send chat message')(async () => {
    // For simplicity, create a room first if not exists
    const roomList = await databases.listDocuments(databaseId, 'chat_rooms', [
      Query.equal('participants', adminUserId),
    ]);
    const room = roomList.documents[0];
    const msg = await databases.createDocument(databaseId, 'chat_messages', ID.unique(), {
      room: room.$id,
      sender: adminUserId,
      content: 'Hello from integration test',
      timestamp: new Date().toISOString(),
      attachments: [],
    });
    assert(msg.content === 'Hello from integration test');
  });

  // 7. Invitations
  console.log('\n🔹 Invitations');
  await test('Create invite')(async () => {
    const inviteToken = ID.unique();
    const invite = await databases.createDocument(databaseId, 'invites', ID.unique(), {
      email: `invitee-${Date.now()}@test.com`,
      role: 'employee',
      department: 'Legal',
      organization_id: 'org-pending',
      status: 'pending',
      invited_by: adminUserId,
      token: inviteToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });
    assert(invite.token === inviteToken);
  });

  // 8. Reporting
  console.log('\n🔹 Reporting');
  await test('User stats query works')(async () => {
    const cases = await databases.listDocuments(databaseId, 'cases', [
      Query.or(Query.equal('client_id', clientUserId), Query.equal('advocate_id', advocateUserId)),
    ]);
    const tasks = await databases.listDocuments(databaseId, 'tasks', [
      Query.equal('assigned_to', advocateUserId),
    ]);
    const docs = await databases.listDocuments(databaseId, 'documents', [
      Query.equal('owner', adminUserId),
    ]);
    assert(typeof cases.total === 'number');
    assert(typeof tasks.total === 'number');
    assert(typeof docs.total === 'number');
  });

  await test('Financial dashboard query works')(async () => {
    const invoices = await databases.listDocuments(databaseId, 'invoices');
    const expenses = await databases.listDocuments(databaseId, 'expenses');
    assert(typeof invoices.total === 'number');
    assert(typeof expenses.total === 'number');
  });

  // 9. Switch user context (advocate)
  console.log('\n🔹 User Switching');
  await test('Login as advocate and verify session')(async () => {
    await account.deleteSession(); // logout admin
    const session = await account.createEmailSession(TEST_ADVOCATE.email, TEST_ADVOCATE.password);
    client.setSession(session.secret);
    const user = await account.get();
    assert(user.email === TEST_ADVOCATE.email);
  });

  await test('Advocate can create own document')(async () => {
    const doc = await databases.createDocument(databaseId, 'documents', ID.unique(), {
      title: 'Advocate Doc',
      description: 'Created by advocate',
      owner: advocateUserId,
      organization_id: 'org-pending',
      created_at: new Date().toISOString(),
    });
    assert(doc.owner === advocateUserId);
  });

  await test('Logout')(async () => {
    await account.deleteSession();
    // Subsequent call should fail
    try {
      await account.get();
      assert(false, 'Expected no session');
    } catch (e) {
      assert(e.code === 401 || e.message.includes('session'), 'Expected session error');
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
  } else {
    console.log('\n✅ All integration tests passed!');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
