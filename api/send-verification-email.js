// Vercel serverless function for sending verification emails via Resend
// No imports needed - fetch and env are provided globally

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@techwithbrands.com';
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL || 'noreply@techwithbrands.com';
const SITE_URL = process.env.SITE_URL || (typeof global !== 'undefined' && global.SITE_URL) || 'https://www.kwakorti.live';

function buildVerificationEmail(username, token) {
  const verifyUrl = `${SITE_URL}/verify-email?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #1e40af; margin-bottom: 20px;">Welcome to WakiliWorld</h2>
      <p>Hi ${username || 'User'},</p>
      <p>Thank you for registering with WakiliWorld. Please verify your email address by clicking the button below:</p>
      <div style="margin: 30px 0;">
        <a href="${verifyUrl}"
           style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.<br>
      © ${new Date().getFullYear()} WakiliWorld - Tech with Brands</p>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user, token } = req.body;

  if (!user?.email || !token) {
    return res.status(400).json({ error: 'User email and token are required' });
  }

  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured');
    return res.status(503).json({ error: 'Email service not configured' });
  }

  try {
    const html = buildVerificationEmail(user.username || user.email, token);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `WakiliWorld <${NOREPLY_EMAIL}>`,
        to: user.email,
        subject: 'Verify your WakiliWorld email',
        html,
        reply_to: ADMIN_EMAIL,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(response.status).json({ error: data?.error?.message || 'Failed to send email' });
    }

    console.log('Verification email sent:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message });
  }
}
