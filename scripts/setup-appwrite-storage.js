/**
 * Create Appwrite storage bucket for documents
 */

import fs from 'fs';
import path from 'path';

function loadEnv(filePath) {
  const env = {};
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
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
    console.warn('Could not read .env:', err.message);
  }
  return env;
}

const env = loadEnv(path.resolve(process.cwd(), '.env'));

const endpoint = (env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = env.APPWRITE_PROJECT_ID;
const apiKey = env.APPWRITE_API_KEY;

if (!projectId || !apiKey) {
  console.error('❌ Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env');
  process.exit(1);
}

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

async function api(method, path, body) {
  const url = `${endpoint}${path}`;
  const options = { method, headers: apiHeaders };
  if (body) options.body = JSON.stringify(body);
  console.log(`   [${method}] ${url}`);
  const res = await fetch(url, options);
  let data;
  const contentType = res.headers.get('content-type');
  try {
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { message: text };
    }
  } catch (e) {
    data = { error: e.message };
  }
  console.log(`   Response: ${res.status}`, data);
  if (!res.ok) {
    const err = new Error(data.message || data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function createBucket() {
  const bucketId = 'documents';
  // First, list all buckets to see if endpoint works
  try {
    console.log('   Checking if /buckets endpoint is accessible...');
    const list = await api('GET', '/buckets');
    console.log(
      `   ✓ Bucket endpoint works. Existing buckets: ${list.buckets.map((b) => b.bucketId).join(', ')}`
    );
  } catch (e) {
    console.log(`   ⚠ GET /buckets failed: ${e.status} - ${e.message}`);
    console.log(`   This suggests storage service may be disabled or endpoint path differs.`);
  }

  try {
    const bucket = await api('GET', `/buckets/${bucketId}`);
    console.log(`✓ Bucket '${bucketId}' exists`);
    return bucket;
  } catch (e) {
    if (e.status === 404) {
      console.log(`Creating bucket '${bucketId}'...`);
      try {
        const created = await api('POST', '/buckets', {
          bucketId,
          name: 'Documents',
          maximumFileSize: 10 * 1024 * 1024, // 10MB
          allowedFileExtensions: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif'],
          encryption: false,
          antivirus: false,
        });
        console.log(`✓ Bucket created`);
        return created;
      } catch (err) {
        console.error(`✗ Failed to create bucket: ${err.message}`);
        console.error(`   Status: ${err.status}`);
        console.error(`   Details: ${JSON.stringify(err.data || {}, null, 2)}`);
        console.log('\n⚠  Storage bucket creation failed.');
        console.log('   This may be due to:');
        console.log('   - Storage service not enabled in Appwrite');
        console.log('   - API key lacks storage.write permission');
        console.log('   - Storage provider not configured (S3/Local)');
        console.log('\n   You can create the bucket manually in Appwrite Console:');
        console.log('   1. Go to Appwrite Console → Storage');
        console.log('   2. Click "Create Bucket"');
        console.log(
          '   3. Name: documents, Max File Size: 10MB, Extensions: pdf,doc,docx,txt,jpg,jpeg,png,gif'
        );
        console.log(
          '\n   Continuing without storage (document file uploads will fail but other features work)'
        );
        return null;
      }
    } else {
      console.error(`✗ Failed to check bucket: ${e.message}`);
      process.exit(1);
    }
  }
}

createBucket().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
