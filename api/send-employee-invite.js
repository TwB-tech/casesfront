// Vercel serverless function for sending employee invitation emails via Resend
// Used by HR module when admins/managers invite staff members

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@techwithbrands.com';
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL || 'noreply@techwithbrands.com';
const SITE_URL = process.env.SITE_URL || (typeof global !== 'undefined' && global.SITE_URL) || 'https://www.kwakorti.live';
const siteUrl = SITE_URL.replace(/\/$/, '');

function buildEmployeeInviteEmail(inviterName, inviteeName, role, department, inviteToken) {
  const acceptUrl = `${siteUrl}/auth/accept-invite?token=${inviteToken}`;
  const departmentDisplay = department ? department.replace('_', ' ') : 'General';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">WakiliWorld</h1>
        <p style="color: #8b5cf6; margin: 5px 0 0 0;">Legal CRM Platform</p>
      </div>
      <h2 style="color: #1e40af; margin-bottom: 20px;">You're Invited to Join the Team!</h2>
      <p>Hi ${inviteeName || 'there'},</p>
      <p><strong>${inviterName}</strong> has invited you to join their legal team on WakiliWorld as a <strong>${role || 'Employee'}</strong> (${departmentDisplay}).</p>
      <p>WakiliWorld helps legal teams manage cases, documents, tasks, payroll, and billing — all in one integrated platform.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${acceptUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${acceptUrl}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        If you weren't expecting this invitation, you can safely ignore this email.<br>
        The invite expires in 7 days.<br>
        © ${new Date().getFullYear()} WakiliWorld - Tech with Brands
      </p>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

   const { inviterName, inviterEmail, inviteeName, inviteeEmail, role, department, inviteToken } = req.body;

   if (!inviterName || !inviteeEmail || !inviteToken) {
     return res.status(400).json({
       error: 'Missing required fields (inviterName, inviteeEmail, inviteToken)'
     });
   }

   if (!RESEND_API_KEY) {
     console.warn('RESEND_API_KEY not configured');
     return res.status(503).json({ error: 'Email service not configured' });
   }

   try {
     const html = buildEmployeeInviteEmail(inviterName, inviteeName, role, department, inviteToken);

     const response = await fetch('https://api.resend.com/emails', {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${RESEND_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         from: `${inviterName} via WakiliWorld <${NOREPLY_EMAIL}>`,
         to: inviteeEmail,
         subject: `${inviterName} invited you to join their team on WakiliWorld`,
         html,
         reply_to: inviterEmail || ADMIN_EMAIL,
       }),
     });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Failed to send email'
      });
    }

    console.log('Employee invite email sent:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message });
  }
}
