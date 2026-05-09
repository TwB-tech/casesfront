// Vercel serverless function: verify email token by querying Appwrite directly
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
      return res.status(503).json({ error: 'Server configuration error', missing });
    }

    const token = req.body?.token;
    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1').replace(/\/$/, '');
    const url = `${endpoint}/databases/${databaseId}/collections/users/documents`;

    // Build query: queries[0]=JSON(...)
    const params = new URLSearchParams();
    params.append('queries[0]', JSON.stringify({
      method: 'equal',
      attribute: 'verification_token',
      values: [token]
    }));
    params.append('limit', '1');

    console.log('🔍 GET', url + '?' + params.toString());
    const response = await fetch(url + '?' + params.toString(), {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
      },
    });

    // Read raw body once
    const rawBody = await response.text();
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      console.error('❌ JSON parse failed. Raw:', rawBody.substring(0, 200));
      return res.status(response.status).json({
        error: 'Database returned invalid JSON',
        raw: rawBody.substring(0, 200),
        parseError: e.message
      });
    }

    if (!response.ok) {
      console.error('❌ Appwrite error response:', data);
      return res.status(response.status).json({ error: data.message || 'Database error' });
    }

    const user = (data.documents || [])[0];
    if (!user) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Update the user
    const updateUrl = `${endpoint}/databases/${databaseId}/collections/users/documents/${user.$id}`;
    const updatePayload = {
      email_verified: true,
      verification_token: null,
      status: 'Active',
    };

    console.log('🔍 PATCH', updateUrl);
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
      },
      body: JSON.stringify(updatePayload),
    });

    const updateRaw = await updateRes.text();
    let updateData;
    try {
      updateData = JSON.parse(updateRaw);
    } catch (e) {
      console.error('❌ Failed to parse update response:', updateRaw.substring(0, 200));
      return res.status(updateRes.status).json({ error: 'Update response invalid', raw: updateRaw.substring(0, 200) });
    }

    if (!updateRes.ok) {
      console.error('❌ Appwrite update error:', updateData);
      return res.status(updateRes.status).json({ error: updateData.message || 'Update failed' });
    }

    console.log('✅ Verification successful:', updateData.$id);
    return res.status(200).json({
      message: 'Email verified successfully',
      email_verified: true,
      user_id: updateData.$id,
    });
  } catch (error) {
    console.error('❌ Verification handler error:', error);
    return res.status(500).json({ error: error.message || 'Verification failed' });
  }
}
