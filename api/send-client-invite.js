// Vercel serverless function for sending client invitation emails via Resend
// No imports needed - fetch and env are provided globally

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@techwithbrands.com';
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL || 'noreply@techwithbrands.com';
const SITE_URL = process.env.SITE_URL || (typeof global !== 'undefined' && global.SITE_URL) || 'https://www.kwakorti.live';
// Ensure no trailing slash to avoid double-slash in URL
const siteUrl = SITE_URL.replace(/\/$/, '');

function buildClientInviteEmail(inviterName, clientName, inviteToken) {
  const inviteUrl = `${siteUrl}/client-register?token=${inviteToken}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">WakiliWorld</h1>
        <p style="color: #8b5cf6; margin: 5px 0 0 0;">Legal CRM Platform</p>
      </div>
      <h2 style="color: #1e40af; margin-bottom: 20px;">You're Invited!</h2>
      <p>Hi ${clientName || 'there'},</p>
      <p><strong>${inviterName}</strong> has invited you to join WakiliWorld as their client.</p>
      <p>WakiliWorld helps legal professionals manage cases, documents, tasks, and billing - all in one place.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${inviteUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${inviteUrl}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        If you don't know ${inviterName}, you can safely ignore this email.<br>
        © ${new Date().getFullYear()} WakiliWorld - Tech with Brands
      </p>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { inviterName, clientName, clientEmail, inviteToken } = req.body;

  if (!inviterName || !clientEmail || !inviteToken) {
    return res.status(400).json({ error: 'Missing required fields (inviterName, clientEmail, inviteToken)' });
  }

  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured');
    return res.status(503).json({ error: 'Email service not configured' });
  }

  try {
    const html = buildClientInviteEmail(inviterName, clientName, inviteToken);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `WakiliWorld <${NOREPLY_EMAIL}>`,
        to: clientEmail,
        subject: `${inviterName} invited you to WakiliWorld`,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(response.status).json({ error: data?.error?.message || 'Failed to send email' });
    }

    console.log('Client invite email sent:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message });
  }
}
