import { Client, Databases, Query } from 'appwrite';

export default async function handler(req, res) {
  try {
    // Initialize Appwrite client
    const client = new Client();
    client.setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1');
    client.setProject(process.env.APPWRITE_PROJECT_ID);
    if (process.env.APPWRITE_API_KEY) {
      client.setKey(process.env.APPWRITE_API_KEY);
    }
    const db = new Databases(client);
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token } = req.body || {};
    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const projectId = process.env.APPWRITE_PROJECT_ID;
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    if (!projectId || !databaseId) {
      const missing = [];
      if (!projectId) missing.push('APPWRITE_PROJECT_ID');
      if (!databaseId) missing.push('APPWRITE_DATABASE_ID');
      return res.status(503).json({ error: 'Server configuration error', missing });
    }

    // Look up user by verification token
    const result = await db.listDocuments(databaseId, 'users', [
      Query.equal('verification_token', token),
      Query.limit(1),
    ]);

    const user = result.documents?.[0];
    if (!user) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Update user: mark verified, clear token, set active
    const updated = await db.updateDocument(databaseId, 'users', user.$id, {
      email_verified: true,
      verification_token: null,
      status: 'Active',
    });

    console.log('✅ Email verified:', updated.$id);
    return res.status(200).json({
      message: 'Email verified successfully',
      email_verified: true,
      user_id: updated.$id,
    });
  } catch (error) {
    console.error('❌ verify-email error:', error);
    return res.status(500).json({ error: error.message || 'Verification failed' });
  }
}
