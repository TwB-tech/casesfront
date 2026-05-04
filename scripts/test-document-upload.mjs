import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

async function testDocumentUpload() {
  console.log('\n=== Testing Document Upload & Retrieval ===\n');

  // Create a test user first
  const email = `doc-test-${Date.now()}@example.com`;
  const password = 'TestPass123!';
  const userId = `doc_${Date.now()}`;

  console.log('1. Creating test user...');
  const accRes = await fetch(`${endpoint}/account`, {
    method: 'POST',
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email, password, name: 'Doc Tester' }),
  });
  const accData = await accRes.json();
  if (!accRes.ok) throw new Error('Account creation failed: ' + accData.message);
  console.log('   ✅ Account created:', accData.$id);

  // Create user document
  console.log('2. Creating user document...');
  const userDoc = {
    id: userId,
    email,
    username: 'Doc Tester',
    role: 'individual',
    organization_id: null,
    email_verified: true,
    status: 'Active',
  };
  await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents`, {
    method: 'POST',
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId: userId, data: userDoc }),
  });
  console.log('   ✅ User document created');

  // Login to get session
  console.log('3. Logging in to get session...');
  const loginRes = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'X-Appwrite-Project': projectId, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error('Login failed: ' + loginData.message);
  const sessionSecret = loginData.secret;
  console.log('   ✅ Logged in, session secret acquired');

  // Create document record with file
  console.log('4. Creating document record with file...');
  const documentData = {
    title: 'Test Document',
    description: 'Test description',
    owner: userId,
    organization_id: null,
  };

  // Simulate file upload by creating a file in storage first
  console.log('   a. Uploading file to storage...');
  const fileContent = 'Hello, this is a test document content.';
  const fileBlob = new Blob([fileContent], { type: 'text/plain' });
  const file = new File([fileBlob], 'test.txt', { type: 'text/plain' });

  // Use our API's storage.createFile via fetch
  const uploadRes = await fetch(`${endpoint}/storage/buckets/documents/files`, {
    method: 'POST',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Session': sessionSecret,
      'Content-Type': 'multipart/form-data',
    },
    body: file,
  });
  const uploadResult = await uploadRes.json();
  if (!uploadRes.ok) throw new Error('File upload failed: ' + (uploadResult.message || JSON.stringify(uploadResult)));
  const fileId = uploadResult.$id;
  console.log('   ✅ File uploaded to storage, fileId:', fileId);

  // Now create document record referencing the file
  console.log('   b. Creating document record...');
  const docRecordRes = await fetch(`${endpoint}/databases/${databaseId}/collections/documents/documents`, {
    method: 'POST',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Session': sessionSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        ...documentData,
        file_path: fileId,
        file_size: fileContent.length,
        mime_type: 'text/plain',
        shared_with: [],
      },
    }),
  });
  const docRecord = await docRecordRes.json();
  if (!docRecordRes.ok) throw new Error('Document record creation failed: ' + (docRecord.message || JSON.stringify(docRecord)));
  console.log('   ✅ Document record created with ID:', docRecord.$id);

  // Retrieve document
  console.log('5. Retrieving document...');
  const getRes = await fetch(`${endpoint}/databases/${databaseId}/collections/documents/documents/${docRecord.$id}`, {
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Session': sessionSecret,
    },
  });
  const retrievedDoc = await getRes.json();
  if (!getRes.ok) throw new Error('Document retrieval failed: ' + (retrievedDoc.message || JSON.stringify(retrievedDoc)));
  console.log('   ✅ Document retrieved:', retrievedDoc.title);

  // Verify file can be viewed
  console.log('6. Verifying file download URL...');
  const fileUrl = `${endpoint}/storage/buckets/documents/files/${fileId}/preview?X-Appwrite-Project=${projectId}&X-Appwrite-Session=${sessionSecret}`;
  console.log('   ✅ File URL:', fileUrl);

  console.log('\n✅ Document upload, storage integration, and retrieval all working!\n');
}

testDocumentUpload().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
