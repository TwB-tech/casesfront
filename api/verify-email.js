// Verify email using direct Appwrite REST API (no SDK)
// Called from Vercel serverless — can reach Appwrite directly
export default async function handler(req, res) {
  console.log('🔔 verify-email called', { method: req.method, token: req.body?.token?.substring(0, 10) });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!projectId || !apiKey) {
    const missing = [];
    if (!projectId) missing.push('APPWRITE_PROJECT_ID');
    if (!apiKey) missing.push('APPWRITE_API_KEY');
    console.error('❌ Missing env vars:', missing);
    return res.status(503).json({ error: 'Server configuration error', missing });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    // 1) List users with this verification_token
    const listUrl = `${endpoint}/databases/${databaseId}/collections/users/documents?verification_token=${encodeURIComponent(token)}`;
    const listRes = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      },
    });

    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      console.error('Appwrite list error:', listRes.status, err);
      return res.status(listRes.status).json({ error: err.message || 'Failed to lookup token' });
    }

    const { documents } = await listRes.json();
    if (!documents || documents.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const user = documents[0];

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // 2) Update user: mark verified, clear token, activate
    const updateUrl = `${endpoint}/databases/${databaseId}/collections/users/documents/${user.$id}`;
    const updatePayload = {
      email_verified: true,
      verification_token: null,
      status: 'Active',
    };

    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      console.error('Appwrite update error:', updateRes.status, err);
      return res.status(updateRes.status).json({ error: err.message || 'Failed to update verification' });
    }

    const updated = await updateRes.json();

    return res.status(200).json({
      message: 'Email verified successfully',
      email_verified: true,
      user_id: updated.$id,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: error?.message || 'Verification failed' });
  }
}

  const projectId = process.env.APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!projectId || !apiKey) {
    const missing = [];
    if (!projectId) missing.push('APPWRITE_PROJECT_ID');
    if (!apiKey) missing.push('APPWRITE_API_KEY');
    console.error('❌ Missing env vars:', missing);
    return res.status(503).json({ error: 'Server configuration error', missing });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    // Build proxy URL (same-origin to avoid CORS)
    const proxyBase = `${req.headers.host}`;
    const proxyUrl = `https://${proxyBase}/api/appwrite-proxy/databases/${databaseId}/collections/users/documents`;

    // Find user by verification_token using simple equality filter
    const listRes = await fetch(`${proxyUrl}?verification_token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      },
    });

    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      console.error('Appwrite list error:', listRes.status, err);
      return res.status(listRes.status).json({ error: err.message || 'Failed to lookup token' });
    }

    const { documents } = await listRes.json();
    if (!documents || documents.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const user = documents[0];

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Update: set email_verified=true, clear token, set status Active
    const updateRes = await fetch(`${proxyUrl}/${user.$id}`, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_verified: true,
        verification_token: null,
        status: 'Active',
      }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      console.error('Appwrite update error:', updateRes.status, err);
      return res.status(updateRes.status).json({ error: err.message || 'Failed to update verification' });
    }

    const updated = await updateRes.json();

    return res.status(200).json({
      message: 'Email verified successfully',
      email_verified: true,
      user_id: updated.$id,
    });
  } catch (error) {
    console.error('Verification error:', error);
    const message = error?.message || 'Verification failed';
    return res.status(500).json({ error: message });
  }
}
