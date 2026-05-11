/**
 * Server-side Signup Endpoint
 *
 * Handles user registration with Appwrite, including:
 * - Account creation
 * - Orphaned user document cleanup (email conflict resolution)
 * - Organization creation for firms/organizations
 * - Verification token generation and email dispatch
 *
 * This endpoint replaces client-side direct Appwrite SDK signup,
 * ensuring deleted accounts can reuse their email addresses.
 */

import { randomBytes } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    email,
    password,
    username,
    role = 'individual',
    organization_id,
    phone,
    address,
    bio,
    practice_areas,
    registration_number,
    id_passport_number,
    marital_status,
    occupation,
    date_of_birth,
    nationality,
  } = req.body;

  // Basic validation
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password, and username are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const endpoint = process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1';
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

  if (!projectId || !apiKey || !databaseId) {
    return res.status(503).json({ error: 'Server configuration error' });
  }

  // Helper for Appwrite admin calls
  const appwrite = async (path, method, body) => {
    const url = `${endpoint.replace(/\/$/, '')}${path}`;
    const headers = {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
      'Content-Type': 'application/json',
    };
    const options = { method, headers };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    let data;
    const ct = response.headers.get('content-type');
    try {
      data = ct && ct.includes('application/json') ? await response.json() : { message: await response.text() };
    } catch (e) {
      data = { message: await response.text() };
    }
    if (!response.ok) {
      const err = new Error(data.message || `HTTP ${response.status}`);
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return { response, data };
  };

  try {
    // 1. Create Appwrite account (public endpoint, no API key needed)
    let newAccount;
    try {
      const result = await appwrite('/account', 'POST', {
        email: email.trim(),
        password,
        name: username.trim(),
      });
      newAccount = result.data;
    } catch (err) {
      if (err.status === 409 || (err.message && err.message.toLowerCase().includes('already exists'))) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      console.error('Account creation failed:', err);
      return res.status(err.status || 500).json({ error: err.message || 'Account creation failed' });
    }

    const userId = newAccount.$id || newAccount.id;

    // 2. Cleanup orphaned user documents with this email (if any)
    {
      const queryParams = new URLSearchParams();
      queryParams.append('queries[0][attribute]', 'email');
      queryParams.append('queries[0][operator]', 'equal');
      queryParams.append('queries[0][value]', email.trim());
      try {
        const { data: existingDocs } = await appwrite(
          `/databases/${databaseId}/collections/users/documents?${queryParams.toString()}`,
          'GET'
        );
        const docs = existingDocs.documents || [];
        for (const doc of docs) {
          try {
            const docId = doc.$id || doc.id;
            await appwrite(`/databases/${databaseId}/collections/users/documents/${docId}`, 'DELETE');
            console.log(`[signup] Deleted orphan user doc ${docId} for email ${email}`);
          } catch (delErr) {
            console.warn(`[signup] Failed to delete orphan doc ${docId}:`, delErr.message);
          }
        }
      } catch (listErr) {
        console.warn('[signup] Orphan cleanup failed:', listErr.message);
      }
    }

    // 3. Resolve/create organization for firm/organization roles
    let resolvedOrgId = organization_id || null;
    if ((role === 'firm' || role === 'organization') && !resolvedOrgId) {
      const orgId = `org_${Date.now()}_${randomBytes(8).toString('hex')}`;
      const orgData = {
        id: orgId,
        name: username.trim(),
        email: email.trim(),
        registration_number: registration_number || '',
        address: address || '',
        plan_type: 'free',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      try {
        await appwrite(
          `/databases/${databaseId}/collections/organizations/documents`,
          'POST',
          {
            documentId: orgId,
            data: orgData,
          }
        );
        resolvedOrgId = orgId;
      } catch (orgErr) {
        console.error('[signup] Organization creation failed:', orgErr);
        return res.status(500).json({ error: 'Failed to create organization' });
      }
    }

    // 4. Generate verification token
    const verificationToken = randomBytes(32).toString('hex');

    // 5. Build user profile
    const userProfile = {
      id: userId,
      username: username.trim(),
      email: email.trim(),
      role,
      phone: phone || '',
      timezone: 'EAT',
      status: 'Active',
      messaging_enabled: true,
      deadline_notifications: true,
      organization_id: resolvedOrgId,
      verification_token: verificationToken,
      email_verified: false,
      bio: bio || '',
      practice_areas: Array.isArray(practice_areas)
        ? practice_areas
        : practice_areas
        ? String(practice_areas).split(',').map(s => s.trim()).filter(Boolean)
        : [],
      id_passport_number: id_passport_number || '',
      marital_status: marital_status || '',
      nationality: nationality || '',
      occupation: occupation || '',
      date_of_birth: date_of_birth || '',
      registration_number: registration_number || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 6. Create user document
    try {
      await appwrite(
        `/databases/${databaseId}/collections/users/documents`,
        'POST',
        {
          documentId: userId,
          data: userProfile,
        }
      );
    } catch (userErr) {
      console.error('[signup] User document creation failed:', userErr);
      return res.status(userErr.status || 500).json({ error: userErr.message || 'Failed to create user profile' });
    }

    // 7. Send verification email (fire and forget, but await to catch errors)
    try {
      await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userProfile,
          token: verificationToken,
        }),
      });
    } catch (emailErr) {
      console.warn('[signup] Verification email failed:', emailErr);
    }

    // 8. Return success payload
    return res.status(200).json({
      id: userId,
      email: email.trim(),
      username: username.trim(),
      verification_token: verificationToken,
    });
  } catch (err) {
    console.error('[signup] Unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
}
