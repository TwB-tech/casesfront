import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const bucketId = 'documents';

const response = await fetch(`${endpoint}/storage/buckets/${bucketId}`, {
  method: 'PATCH',
  headers: {
    'X-Appwrite-Project': projectId,
    'X-Appwrite-Key': apiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    permissions: ['read("role:users")', 'write("role:users")'],
    maximumFileSize: 10485760,
    allowedFileExtensions: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'],
  }),
});

const data = await response.json();
if (response.ok) {
  console.log('✅ Bucket updated:', JSON.stringify(data).substring(0, 500));
} else {
  console.error('❌ Error:', data.message || response.status);
}
