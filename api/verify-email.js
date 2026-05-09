// Vercel serverless function: verify email token via appwrite-proxy
// Uses the same proxy as frontend to ensure consistent query handling
export default async function handler(req, res) {
    try {
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

      const fullUrl = proxyUrl + '?' + params.toString();
      console.log('🔍 Querying Appwrite URL:', fullUrl);

      const listRes = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': projectId,
          'Content-Type': 'application/json',
          'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
        },
      });

      console.log('📥 Appwrite list response status:', listRes.status);
      const ct = listRes.headers.get('content-type');
      console.log('📦 Content-Type:', ct);

      if (!listRes.ok) {
        let err;
        try {
          err = await listRes.json();
        } catch (e) {
          const text = await listRes.text();
          console.error('❌ Appwrite list error (non-JSON):', listRes.status, text.substring(0, 200));
          return res.status(listRes.status).json({ error: 'Appwrite error', details: text.substring(0, 200) });
        }
        console.error('❌ Appwrite list error:', listRes.status, err);
        return res.status(listRes.status).json({ error: err.message || 'Failed to lookup token' });
      }

      let data;
      try {
        data = await listRes.json();
      } catch (parseErr) {
        const raw = await listRes.text();
        console.error('❌ Failed to parse Appwrite response as JSON:', parseErr.message, 'Raw:', raw.substring(0, 200));
        return res.status(500).json({ error: 'Invalid response from database', details: parseErr.message });
      }

      const { documents } = data;
      if (!documents || documents.length === 0) {
        return res.status(404).json({ error: 'Invalid verification token' });
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

    console.log('🔍 PATCH to Appwrite:', updateUrl);
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
      },
      body: JSON.stringify(updatePayload),
    });

    console.log('📥 Appwrite update response status:', updateRes.status);
    if (!updateRes.ok) {
      let err;
      try {
        err = await updateRes.json();
      } catch (e) {
        const text = await updateRes.text();
        console.error('❌ Appwrite update error (non-JSON):', updateRes.status, text.substring(0, 200));
        return res.status(updateRes.status).json({ error: 'Update failed', details: text.substring(0, 200) });
      }
      console.error('❌ Appwrite update error:', updateRes.status, err);
      return res.status(updateRes.status).json({ error: err.message || 'Failed to update verification' });
    }

    let updated;
    try {
      updated = await updateRes.json();
    } catch (parseErr) {
      const raw = await updateRes.text();
      console.error('❌ Failed to parse update response:', parseErr.message, 'Raw:', raw.substring(0, 200));
      return res.status(500).json({ error: 'Invalid response from database on update' });
    }
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
