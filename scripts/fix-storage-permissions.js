// Fix storage bucket permissions without deleting data
// Usage: node scripts/fix-storage-permissions.js

import { Client, Storage } from 'appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY; // server-side only

if (!projectId) {
  console.error('APPWRITE_PROJECT_ID is required');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

if (apiKey) {
  client.setKey(apiKey);
}

const storage = new Storage(client);
const databases = new Databases(client);

const BUCKET_ID = 'documents';

async function fixBucket() {
  try {
    console.log(`Checking bucket "${BUCKET_ID}"...`);
    const bucket = await storage.getBucket(BUCKET_ID);
    console.log('  Current permissions:', bucket.permissions);
    console.log('  Current maximumFileSize:', bucket.maximumFileSize);
    console.log('  Current allowedFileExtensions:', bucket.allowedFileExtensions);

    // Update to correct permissions
    console.log('  Updating permissions to ["read("users")", "write("users")"]...');
    await storage.updateBucket(BUCKET_ID, {
      permissions: ['read("users")', 'write("users")'],
      maximumFileSize: 50000000, // 50MB
      allowedFileExtensions: [
        // Documents
        'pdf', 'PDF', 'doc', 'DOC', 'docx', 'DOCX', 'txt', 'TXT', 'rtf', 'RTF', 'odt', 'ODT',
        // Spreadsheets
        'xls', 'XLS', 'xlsx', 'XLSX', 'csv', 'CSV',
        // Presentations
        'ppt', 'PPT', 'pptx', 'PPTX',
        // Images
        'jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF', 'bmp', 'BMP', 'tiff', 'TIFF', 'svg', 'SVG',
        // Audio/Video
        'mp3', 'MP3', 'mp4', 'MP4', 'wav', 'WAV', 'avi', 'AVI', 'mov', 'MOV', 'mkv', 'MKV',
        // Archives
        'zip', 'ZIP', 'rar', 'RAR', '7z', '7Z',
        // Data & Code
        'json', 'JSON', 'xml', 'XML', 'html', 'HTML', 'htm', 'HTM',
        'py', 'PY', 'js', 'JS', 'ts', 'TS', 'java', 'JAVA', 'c', 'C', 'cpp', 'CPP', 'cs', 'CS',
      ],
    });

    console.log('✅ Storage bucket updated successfully');
  } catch (error) {
    console.error('❌ Failed to update bucket:', error.message);
    if (error.code === 404) {
      console.log('Bucket does not exist. Create it manually in Appwrite Console or run setup script.');
    }
    process.exit(1);
  }
}

fixBucket();
