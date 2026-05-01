// Verify email using Appwrite REST API directly
const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';
const collectionId = 'users';

export default async function handler(req, res) {
  console.log('🔔 verify-email called', { method: req.method, token: req.body?.token?.substring(0,10) });
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  // Build query to find user by verification_token
  const query = new URLSearchParams({
    'queries[0][attribute]': 'verification_token',
    'queries[0][operator]': 'equal',
    'queries[0][value]': token,
  });

  const url = `${endpoint}/databases/${databaseId}/collections/${collectionId}/documents?${query}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Appwrite error:', data);
      return res.status(response.status).json({ error: data.message || 'Failed to fetch user' });
    }

    if (!data.documents || data.documents.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const user = data.documents[0];

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Update user: set email_verified true and clear verification_token
    const updateUrl = `${endpoint}/databases/${databaseId}/collections/${collectionId}/documents/${user.$id}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_verified: true,
        verification_token: null,
      }),
    });

    const updateData = await updateResponse.json();

    if (!updateResponse.ok) {
      console.error('Update error:', updateData);
      return res.status(updateResponse.status).json({ error: updateData.message || 'Failed to update user' });
    }

    return res.status(200).json({ message: 'Email verified successfully', email_verified: true, user_id: user.$id });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
}
