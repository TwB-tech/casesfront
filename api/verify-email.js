import { Client, Databases, Query } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); // server-side API key

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'default';
const COLLECTION_USERS = 'users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    // Find user by verification token
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_USERS, [
      Query.equal('verification_token', token),
    ]);

    if (result.documents.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const user = result.documents[0];

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Mark as verified and clear token
    await databases.updateDocument(DATABASE_ID, COLLECTION_USERS, user.$id, {
      email_verified: true,
      verification_token: null,
    });

    return res.status(200).json({ message: 'Email verified successfully', email_verified: true, user_id: user.$id });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
}
