// Verify email using Appwrite SDK
import { Client, Databases, Query } from 'appwrite';

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

if (!projectId) {
  console.error('❌ Missing APPWRITE_PROJECT_ID');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(process.env.APPWRITE_API_KEY); // server-side key

const db = new Databases(client);
const COLLECTION_USERS = 'users';

export default async function handler(req, res) {
  console.log('🔔 verify-email called', { method: req.method, token: req.body?.token?.substring(0, 10) });
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    // Find user by verification token
    const result = await db.list(COLLECTION_USERS, [Query.equal('verification_token', token)]);

    if (result.documents.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const user = result.documents[0];

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Mark as verified and clear token
    const updated = await db.update(COLLECTION_USERS, user.$id, {
      email_verified: true,
      verification_token: null,
    });

    return res.status(200).json({
      message: 'Email verified successfully',
      email_verified: true,
      user_id: updated.$id,
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message || 'Verification failed' });
  }
}
