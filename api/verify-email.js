// Vercel serverless function: verify email token by directly querying Appwrite
export default async function handler(req, res) {
  try {
    console.log('🔔 verify-email called', { method: req.method, tokenPreview: req.body?.token?.substring(0, 10) });

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const projectId = process.env.APPWRITE_PROJECT_ID;
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    if (!projectId || !databaseId) {
      const missing = [];
      if (!projectId) missing.push('APPWRITE_PROJECT_ID');
      if (!databaseId) missing.push('APPWRITE_DATABASE_ID');
      console.error('❌ Missing env:', missing);
      return res.status(503).json({ error: 'Server config error', missing });
    }

    const token = req.body?.token;
    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Prepare Appwrite request
    const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1').replace(/\/$/, '');
    const url = `${endpoint}/databases/${databaseId}/collections/users/documents?${new URLSearchParams({
      'queries[0]': JSON.stringify({ method: 'equal', attribute: 'verification_token', values: [token] }),
      limit: '1',
    })}`;

    console.log('🔍 GET', url);
    const response = await fetch(url, {
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
      },
    });

    console.log('📥 Appwrite responded:', response.status, response.headers.get('content-type'));

    let data;
    try {
      data = await response.json();
    } catch (e) {
      const raw = await response.text();
      console.error('❌ JSON parse failed. Raw:', raw.substring(0, 200));
      return res.status(response.status).json({ error: 'Database returned invalid JSON', raw: raw.substring(0, 200) });
    }

    if (!response.ok) {
      console.error('❌ Appwrite error:', data);
      return res.status(response.status).json({ error: data.message || 'Database error' });
    }

    const user = (data.documents || [])[0];
    if (!user) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email already verified', email_verified: true });
    }

    // Update user: set email_verified=true, clear token, set status=Active
    const updateUrl = `${endpoint}/databases/${databaseId}/collections/users/documents/${user.$id}`;
    const updateBody = { email_verified: true, verification_token: null, status: 'Active' };
    console.log('🔍 PATCH', updateUrl, updateBody);

    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
      },
      body: JSON.stringify(updateBody),
    });

    console.log('📥 Update response:', updateRes.status);
    let updateData;
    try {
      updateData = await updateRes.json();
    } catch (e) {
      const raw = await updateRes.text();
      console.error('❌ Update JSON parse fail:', raw.substring(0, 200));
      return res.status(updateRes.status).json({ error: 'Update response invalid', raw: raw.substring(0, 200) });
    }

    if (!updateRes.ok) {
      console.error('❌ Update error:', updateData);
      return res.status(updateRes.status).json({ error: updateData.message || 'Update failed' });
    }

    console.log('✅ Verified:', updateData.$id);
    return res.status(200).json({ message: 'Email verified successfully', email_verified: true, user_id: updateData.$id });
  } catch (err) {
    console.error('❌ Unexpected handler error:', err);
    return res.status(500).json({ error: err.message || 'Verification failed' });
  }
}
