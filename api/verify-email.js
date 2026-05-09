// Vercel serverless function: verify email token by calling Appwrite directly
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

    // Safely extract token
    const token = req.body?.token;
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Build absolute Appwrite URL
    const appwriteEndpoint = (process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1').replace(/\/$/, '');
    const baseUrl = `${appwriteEndpoint}/databases/${databaseId}/collections/users/documents`;

    // Build query: queries[0]=JSON({method:'equal',attribute:'verification_token',values:[token]})
    const params = new URLSearchParams();
    params.append('queries[0]', JSON.stringify({
      method: 'equal',
      attribute: 'verification_token',
      values: [token]
    }));
    params.append('limit', '1');
    const fullUrl = `${baseUrl}?${params.toString()}`;

    console.log('🔍 GET Appwrite:', fullUrl);
    const listRes = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
      },
    });

    console.log('📥 Appwrite list status:', listRes.status);
    let listData;
    try {
      listData = await listRes.json();
    } catch (e) {
      const raw = await listRes.text();
      console.error('❌ Failed to parse list JSON:', raw.substring(0, 200));
      return res.status(listRes.status).json({ error: 'Database returned invalid JSON', details: raw.substring(0, 200) });
    }

    if (!listRes.ok) {
      console.error('❌ Appwrite list error:', listData);
      return res.status(listRes.status).json({ error: listData.message || 'Failed to lookup token' });
    }

    const documents = listData.documents || [];
    if (documents.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const user = documents[0];
    console.log('🔍 Found user:', { id: user.$id, email: user.email, email_verified: user.email_verified });

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // PATCH update
    const updateUrl = `${appwriteEndpoint}/databases/${databaseId}/collections/users/documents/${user.$id}`;
    const updatePayload = {
      email_verified: true,
      verification_token: null,
      status: 'Active',
    };

    console.log('🔍 PATCH Appwrite:', updateUrl);
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
      },
      body: JSON.stringify(updatePayload),
    });

    console.log('📥 Appwrite update status:', updateRes.status);
    let updateData;
    try {
      updateData = await updateRes.json();
    } catch (e) {
      const raw = await updateRes.text();
      console.error('❌ Failed to parse update JSON:', raw.substring(0, 200));
      return res.status(updateRes.status).json({ error: 'Update response invalid', details: raw.substring(0, 200) });
    }

    if (!updateRes.ok) {
      console.error('❌ Appwrite update error:', updateData);
      return res.status(updateRes.status).json({ error: updateData.message || 'Failed to update verification' });
    }

    console.log('✅ Verification successful for:', updateData.$id);
    return res.status(200).json({
      message: 'Email verified successfully',
      email_verified: true,
      user_id: updateData.$id,
    });
  } catch (error) {
    console.error('❌ Verification handler error:', error);
    return res.status(500).json({ error: error?.message || 'Verification failed' });
  }
}
