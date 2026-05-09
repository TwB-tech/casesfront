// Vercel serverless function: verify email token using Appwrite SDK
import { Client, Databases, Query } from 'appwrite';

export default async function handler(req, res) {
  console.log('🔔 verify-email called', { method: req.method, token: req.body?.token?.substring(0, 10) });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpoint = process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1';
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.APPWRITE_DATABASE_ID;

  if (!projectId || !apiKey || !databaseId) {
    const missing = [];
    if (!projectId) missing.push('APPWRITE_PROJECT_ID');
    if (!apiKey) missing.push('APPWRITE_API_KEY');
    if (!databaseId) missing.push('APPWRITE_DATABASE_ID');
    console.error('❌ Missing required env vars:', missing);
    return res.status(503).json({ error: 'Server configuration error', missing });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    // Initialize Appwrite SDK with server-side API key
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new Databases(client);

    // Find user by verification token
    const result = await databases.listDocuments(
      databaseId,
      'users',
      [Query.equal('verification_token', token)],
      1
    );

    if (!result.documents || result.documents.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const user = result.documents[0];
    console.log('🔍 Found user by token:', { userId: user.$id, email: user.email, current_verified: user.email_verified });

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Update: mark verified, clear token, activate
    const updated = await databases.updateDocument(
      databaseId,
      'users',
      user.$id,
      {
        email_verified: true,
        verification_token: null,
        status: 'Active',
      }
    );

    console.log('✅ Verification updated successfully:', { userId: updated.$id, email_verified: updated.email_verified });

    return res.status(200).json({
      message: 'Email verified successfully',
      email_verified: true,
      user_id: updated.$id,
    });
  } catch (error) {
    console.error('❌ Verification error:', error);
    return res.status(500).json({ error: error?.message || 'Verification failed' });
  }
}
