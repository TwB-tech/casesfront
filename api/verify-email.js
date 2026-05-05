// Verify email using Appwrite SDK
// Vercel serverless function — never call process.exit()
import { Client, Databases, Query } from 'appwrite';

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';
const apiKey = process.env.APPWRITE_API_KEY;

// Helper to check required env vars
function missingEnv() {
  const missing = [];
  if (!projectId) missing.push('APPWRITE_PROJECT_ID');
  if (!apiKey) missing.push('APPWRITE_API_KEY');
  return missing;
}

export default async function handler(req, res) {
  console.log('🔔 verify-email called', { method: req.method, token: req.body?.token?.substring(0, 10) });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check env early
  const missing = missingEnv();
  if (missing.length > 0) {
    console.error('❌ Missing env vars:', missing);
    return res.status(503).json({ error: 'Server configuration error', missing });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    // Initialize Appwrite client per-request (cheap, avoids reuse issues)
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const db = new Databases(client);
    const COLLECTION_USERS = 'users';

    // Find user by verification token
    const result = await db.list(COLLECTION_USERS, [Query.equal('verification_token', token)]);

    if (result.documents.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const user = result.documents[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Mark as verified and clear token
    const updated = await db.update(COLLECTION_USERS, user.$id, {
      email_verified: true,
      verification_token: null,
      status: 'Active',
    });

    return res.status(200).json({
      message: 'Email verified successfully',
      email_verified: true,
      user_id: updated.$id,
    });
  } catch (error) {
    console.error('Verification error:', error);
    const message = error?.message || 'Verification failed';
    const status = error?.response?.status || (error.message?.includes('Missing') ? 503 : 500);
    return res.status(status).json({ error: message });
  }
}
