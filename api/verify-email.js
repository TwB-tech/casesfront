// Vercel serverless function: verify email token via appwrite-proxy
// Uses the same proxy as frontend to ensure consistent query handling
export default async function handler(req, res) {
  try {
    console.log('🔔 verify-email called', { method: req.method, token: req.body?.token?.substring(0, 10) });

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const projectId = process.env.APPWRITE_PROJECT_ID;
    const databaseId = process.env.APPWRITE_DATABASE_ID;

    if (!projectId || !databaseId) {
      const missing = [];
      if (!projectId) missing.push('APPWRITE_PROJECT_ID');
      if (!databaseId) missing.push('APPWRITE_DATABASE_ID');
      console.error('❌ Missing required env vars:', missing);
      return res.status(503).json({ error: 'Server configuration error', missing });
    }

    // Safely get token (handle cases where body parsing might not have occurred)
    const token = req.body?.token;
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Call Appwrite directly (server-side, no CORS) with absolute URL
    const appwriteEndpoint = (process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1').replace(/\/$/, '');
    const proxyUrl = `${appwriteEndpoint}/databases/${databaseId}/collections/users/documents`;

    // Build query parameters using Appwrite's expected format: queries[0] with JSON string
    const params = new URLSearchParams();
    params.append('queries[0]', JSON.stringify({
      method: 'equal',
      attribute: 'verification_token',
      values: [token]
    }));
    params.append('limit', '1');

    const listRes = await fetch(proxyUrl + '?' + params.toString(), {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
      },
    });

    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      console.error('❌ Appwrite list error:', listRes.status, err);
      return res.status(listRes.status).json({ error: err.message || 'Failed to lookup token' });
    }

    const { documents } = await listRes.json();
    if (!documents || documents.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const user = documents[0];
    console.log('🔍 Found user by token:', { userId: user.$id, email: user.email, current_verified: user.email_verified });

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Update directly via Appwrite
    const updateUrl = `${appwriteEndpoint}/databases/${databaseId}/collections/users/documents/${user.$id}`;
    const updatePayload = {
      email_verified: true,
      verification_token: null,
      status: 'Active',
    };

    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      console.error('❌ Appwrite update error:', updateRes.status, err);
      return res.status(updateRes.status).json({ error: err.message || 'Failed to update verification' });
    }

    const updated = await updateRes.json();
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
