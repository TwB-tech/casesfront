// Verify email using direct Appwrite REST API (no SDK)
// Vercel serverless function
export default async function handler(req, res) {
  console.log('🔔 verify-email called', { method: req.method, token: req.body?.token?.substring(0, 10) });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

    const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1').replace(/\/$/, '');
   const projectId = process.env.APPWRITE_PROJECT_ID;
   const databaseId = process.env.APPWRITE_DATABASE_ID; // Required, no default
   const apiKey = process.env.APPWRITE_API_KEY;

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
      // Build query using Appwrite REST format: queries[0]={"method":"equal","column":"verification_token","values":["token"]}
      const queryParams = new URLSearchParams();
      queryParams.append('queries[0]', JSON.stringify({
        method: 'equal',
        column: 'verification_token',
        values: [token],
      }));
      queryParams.append('limit', '1');
      const listUrl = `${endpoint}/databases/${databaseId}/collections/users/documents?${queryParams.toString()}`;
      const listRes = await fetch(listUrl, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': projectId,
          'X-Appwrite-Key': apiKey,
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

      // Update: mark verified, clear token, activate
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
        // Appwrite expects document fields at top level, not wrapped in "data"
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
