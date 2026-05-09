export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token } = req.body || {};
    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const projectId = process.env.APPWRITE_PROJECT_ID;
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    if (!projectId || !databaseId) {
      return res.status(503).json({ error: 'Server config missing' });
    }

    const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1').replace(/\/$/, '');
    const url = `${endpoint}/databases/${databaseId}/collections/users/documents`;
    const params = new URLSearchParams();
    params.append('queries[0]', JSON.stringify({
      method: 'equal',
      attribute: 'verification_token',
      values: [token]
    }));
    params.append('limit', '1');
    const fullUrl = `${url}?${params}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
      },
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return res.status(response.status).json({
        error: 'Invalid response from database',
        raw: raw.substring(0, 200)
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Database error' });
    }

    const user = data.documents?.[0];
    if (!user) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    const updateUrl = `${endpoint}/databases/${databaseId}/collections/users/documents/${user.$id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
      },
      body: JSON.stringify({ email_verified: true, verification_token: null, status: 'Active' }),
    });

    const updateRaw = await updateRes.text();
    let updateData;
    try {
      updateData = JSON.parse(updateRaw);
    } catch (e) {
      return res.status(updateRes.status).json({
        error: 'Update response invalid',
        raw: updateRaw.substring(0, 200)
      });
    }

    if (!updateRes.ok) {
      return res.status(updateRes.status).json({ error: updateData.message || 'Update failed' });
    }

    return res.status(200).json({
      message: 'Email verified successfully',
      email_verified: true,
      user_id: updateData.$id,
    });
  } catch (err) {
    console.error('❌ verify-email error:', err);
    return res.status(500).json({ error: err.message || 'Verification failed' });
  }
}
