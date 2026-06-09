import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.NEON_DATABASE_URL;
if (!dbUrl) {
  console.error('NEON_DATABASE_URL is not configured');
}
const sql = neon(dbUrl, { fetchConnectionCache: true });

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
};

const getCurrentUserFromReq = (req) => {
  try {
    const header = req.headers['x-wakili-user'];
    return header ? JSON.parse(header) : null;
  } catch {
    return null;
  }
};

const success = (data, status = 200) => ({ status, data });
const failure = (message, status = 400, errors) => {
  const err = new Error(message);
  err.status = status;
  err.body = errors || { message };
  throw err;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { path, method, params = {}, query = {} } = body || {};
  if (!path || !method) {
    return res.status(400).json({ error: 'path and method are required' });
  }

  const user = getCurrentUserFromReq(req);

  try {
    let result;
    const upper = method.toUpperCase();

    if (upper === 'GET' && path === '/health') {
      return res.status(200).json({ status: 'ok', database: 'postgres' });
    }

    if (path.startsWith('/auth/')) {
      result = await handleAuth(path, upper, body, user);
    } else if (path.startsWith('/users') || path.startsWith('/admin')) {
      result = await handleUsers(path, upper, body, user);
    } else {
      result = await handleGeneric(path, upper, body, user);
    }

    const status = result.status || 200;
    res.status(status).json(result.data || result.body || result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(error.body || { error: error.message || 'Server error' });
  }
}

async function handleAuth(path, method, body, user) {
  if (path === '/auth/register') {
    const payload = body.payload || body;
    const email = payload.email;
    const password = payload.password;
    const role = payload.role || 'individual';
    const username = payload.username || email.split('@')[0];

    if (!email || !password) {
      return failure('Email and password are required', 400);
    }

    const existing = await sql.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return failure('A user with this email already exists', 400);
    }

    const id = body.client_ip
      ? undefined
      : `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    const now = new Date().toISOString();
    await sql.query(
      `INSERT INTO users (id, email, username, password, role, organization_id, status, email_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, email, username, password, role, null, 'Active', false, now, now]
    );

    const verificationToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await sql.query('UPDATE users SET verification_token = $1 WHERE id = $2', [verificationToken, id]);

    return success({
      id,
      email,
      username,
      role,
      organization_id: null,
      email_verified: false,
      verification_token: verificationToken,
    }, 201);
  }

  if (path === '/auth/login') {
    const payload = body.payload || body;
    const { email, password } = payload;
    if (!email || !password) return failure('Email and password are required', 400);

    const rows = await sql.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    const account = rows[0];
    if (!account) return failure('Invalid email or password', 401);

    if (account.password !== password) {
      return failure('Invalid email or password', 401);
    }

    if (account.email_verified === false) {
      return failure('Please verify your email before logging in. Check your inbox for the verification link.', 403, {
        code: 'EMAIL_NOT_VERIFIED',
        email_verified: false,
      });
    }

    return success({
      id: account.id,
      email: account.email,
      username: account.username,
      role: account.role,
      organization_id: account.organization_id,
      email_verified: !!account.email_verified,
    });
  }

  if (path === '/auth/verify-email') {
    const { token } = body;
    if (!token) return failure('Verification token is required', 400);

    const rows = await sql.query('SELECT * FROM users WHERE verification_token = $1 LIMIT 1', [token]);
    const record = rows[0];
    if (!record) return failure('Invalid verification token', 400);

    if (record.email_verified) {
      return success({ detail: 'Email already verified.', email_verified: true });
    }

    await sql.query('UPDATE users SET email_verified = true, verification_token = NULL, updated_at = $1 WHERE id = $2', [
      new Date().toISOString(),
      record.id,
    ]);

    return success({ detail: 'Email verified successfully.', email_verified: true, user_id: record.id });
  }

  if (path === '/auth/request-reset-email') {
    const { email } = body;
    if (!email) return failure('Email is required', 400);
    const rows = await sql.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (rows.length === 0) {
      return success({ detail: 'If the email exists, reset instructions have been sent.' });
    }
    const resetToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await sql.query('UPDATE users SET verification_token = $1, updated_at = $2 WHERE id = $3', [
      resetToken,
      new Date().toISOString(),
      rows[0].id,
    ]);
    return success({ detail: 'If the email exists, reset instructions have been sent.', reset_token: resetToken });
  }

  if (path.startsWith('/auth/accept-invite')) {
    const { token, fullName, password } = body;
    if (!token || !password) return failure('Token and password are required', 400);

    const inviteRows = await sql.query('SELECT * FROM invites WHERE token = $1 LIMIT 1', [token]);
    const invite = inviteRows[0];
    if (!invite) return failure('Invalid or expired invitation', 400);

    const userId = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    await sql.query(
      `INSERT INTO users (id, email, username, password, role, organization_id, status, email_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [userId, invite.email, fullName || invite.email, password, invite.role || 'employee', invite.organization_id, 'Active', true, now, now]
    );

    await sql.query('UPDATE invites SET status = accepted, updated_at = $1 WHERE id = $2', [now, invite.id]);

    return success({ id: userId, email: invite.email, username: fullName || invite.email, role: invite.role });
  }

  return failure(`Auth path not implemented: ${path}`, 404);
}

async function handleUsers(path, method, body, user) {
  if (!user) return failure('Unauthorized - login required', 401);

  if (path === '/users' && method === 'GET') {
    const rows = await sql.query('SELECT id, email, username, role, organization_id, email_verified FROM users');
    return success({ results: rows });
  }

  return failure(`Users path not implemented: ${method} ${path}`, 404);
}

async function handleGeneric(path, method, body, user) {
  if (!user) return failure('Unauthorized - login required', 401);

  const collection = path.split('/').filter(Boolean)[0];
  if (!collection) return failure('Collection path is required', 400);

  if (method === 'GET') {
    const rows = await sql.query(`SELECT * FROM ${collection}`);
    return success({ results: rows });
  }

  if (method === 'POST') {
    const payload = body.payload || body;
    const keys = Object.keys(payload).filter((k) => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
    const values = keys.map((k) => payload[k]);
    const id = payload.id || `${collection.slice(0, 3)}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const columns = ['id', ...keys, 'created_at', 'updated_at'];
    const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(',');
    const params = [id, ...values, now, now];

    const result = await sql.query(
      `INSERT INTO ${collection} (${columns.join(',')}) VALUES (${placeholders}) RETURNING *`,
      params
    );
    return success({ ...result[0], id }, 201);
  }

  if (method === 'PUT') {
    const payload = body.payload || body;
    const id = payload.id || path.split('/').pop();
    if (!id) return failure('Record id is required', 400);

    const keys = Object.keys(payload).filter((k) => k !== 'id' && k !== 'created_at');
    const sets = keys.map((k, idx) => `${k} = $${idx + 2}`).join(', ');
    const params = [id, ...keys.map((k) => payload[k])];
    const result = await sql.query(
      `UPDATE ${collection} SET ${sets}, updated_at = $${params.length + 1} WHERE id = $1 RETURNING *`,
      [...params, new Date().toISOString()]
    );
    return success(result[0]);
  }

  if (method === 'DELETE') {
    const id = body.id || path.split('/').pop();
    if (!id) return failure('Record id is required', 400);
    await sql.query(`DELETE FROM ${collection} WHERE id = $1`, [id]);
    return success({ success: true });
  }

  return failure(`Method not implemented: ${method} ${path}`, 404);
}
