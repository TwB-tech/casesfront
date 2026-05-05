// Verify email using direct Appwrite API calls via proxy
// Vercel serverless function — no SDK needed
const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';
const apiKey = process.env.APPWRITE_API_KEY;

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
    // Build Appwrite API URL
    const url = `${endpoint}/databases/${databaseId}/collections/users/documents`;
    
    // Query: find by verification_token
    const queryUrl = `${url}?queries[0]=${encodeURIComponent('verification_token=' + token)}`;
    
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error('Appwrite list error:', response.status, errBody);
      return res.status(response.status).json({ error: errBody.message || 'Failed to lookup token' });
    }

    const { documents } = await response.json();

    if (!documents || documents.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const user = documents[0];

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Update: set email_verified=true, clear token
    const updateUrl = `${url}/${user.$id}`;
    const updatePayload = {
      email_verified: true,
      verification_token: null,
      status: 'Active',
    };

    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateResponse.ok) {
      const errBody = await updateResponse.json().catch(() => ({}));
      console.error('Appwrite update error:', updateResponse.status, errBody);
      return res.status(updateResponse.status).json({ error: errBody.message || 'Failed to update verification' });
    }

    const updated = await updateResponse.json();

    return res.status(200).json({
      message: 'Email verified successfully',
      email_verified: true,
      user_id: updated.$id,
    });
  } catch (error) {
    console.error('Verification error:', error);
    const message = error?.message || 'Verification failed';
    const status = error?.response?.status || 500;
    return res.status(status).json({ error: message });
  }
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
     // Initialize Appwrite client per-request (avoid reuse issues)
     // Use non-chained setters to avoid bundler issues with SDK method returns
     const client = new Client();
     client.setEndpoint(endpoint);
     client.setProject(projectId);
     client.setKey(apiKey);

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
