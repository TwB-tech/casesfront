// Vercel serverless function for contact form emails via Resend
// No imports needed - fetch and env are provided globally

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@techwithbrands.com';
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL || 'a1kkamau@gmail.com';
const SITE_URL = process.env.SITE_URL || (typeof global !== 'undefined' && global.SITE_URL) || 'https://www.kwakorti.live';

function buildContactEmail(formData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #1e40af; margin-bottom: 20px;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p><strong>Message:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${formData.message.replace(/\n/g, '<br>')}
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">This email was sent from the WakiliWorld contact form at ${SITE_URL}.</p>
    </div>
  `;
}

export default async function handler(req, res) {
  console.log('🔔 /api/contact called', { method: req.method });
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured');
    return res.status(503).json({ error: 'Email service not configured' });
  }

  try {
    const html = buildContactEmail({ firstName, lastName, email, message });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `WakiliWorld <${NOREPLY_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: `WakiliWorld Contact: ${firstName} ${lastName} <${email}>`,
        html,
        reply_to: email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(response.status).json({ error: data?.error?.message || 'Failed to send email' });
    }

    console.log('Contact email sent:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message });
  }
}
