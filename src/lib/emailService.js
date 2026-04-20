/**
 * Email Service using Resend API
 * Handles transactional emails: verification, password reset, notifications, contact form
 */

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL || 'admin@techwithbrands.com';
const NOREPLY_EMAIL = import.meta.env.NOREPLY_EMAIL || 'noreply@techwithbrands.com';
const SITE_URL =
  import.meta.env.SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

const buildContactEmail = (formData) => {
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
      <p style="color: #999; font-size: 12px;">This email was sent from the WakiliWorld contact form.</p>
    </div>
  `;
};

export const sendContactEmail = async (formData) => {
  const html = buildContactEmail(formData);
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `WakiliWorld Enquiry: ${formData.firstName} ${formData.lastName}`,
    html,
  });
};

/**
 * Send email via Resend API
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - email sending disabled');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `WakiliWorld <${NOREPLY_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '').slice(0, 5000),
        reply_to: ADMIN_EMAIL,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data?.error?.message || 'Failed to send email' };
    }

    console.log('Email sent successfully:', data.id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate email verification token
 */
export const generateVerificationToken = () => {
  return `verify-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Generate password reset token
 */
export const generateResetToken = () => {
  return `reset-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Generate secure token (alias for generateResetToken for broader use)
 */
export const generateSecureToken = () => {
  return `secure-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Build client invitation email HTML
 */
const buildClientInviteEmail = (inviterName, clientName, inviteToken) => {
  const inviteUrl = `${SITE_URL}/client-register?token=${inviteToken}`;
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
        <a href="${inviteUrl}"
           style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
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
};

/**
 * Send client invitation email
 */
export const sendClientInvite = async ({ clientEmail, clientName, inviterName, inviteToken }) => {
  const html = buildClientInviteEmail(inviterName, clientName, inviteToken);
  return sendEmail({
    to: clientEmail,
    subject: `${inviterName} invited you to WakiliWorld`,
    html,
  });
};

/**
 * Build employee invitation email HTML
 */
const buildEmployeeInviteEmail = (inviterName, employeeName, role, inviteToken) => {
  const inviteUrl = `${SITE_URL}/employee-register?token=${inviteToken}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">WakiliWorld</h1>
        <p style="color: #8b5cf6; margin: 5px 0 0 0;">Legal CRM Platform</p>
      </div>
      <h2 style="color: #1e40af; margin-bottom: 20px;">You're Invited to Join a Law Firm!</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p><strong>${inviterName}</strong> has invited you to join their law firm on WakiliWorld as a <strong>${role || 'employee'}</strong>.</p>
      <p>WakiliWorld helps legal teams manage cases, documents, tasks, and billing - all in one place.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${inviteUrl}"
           style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
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
};

/**
 * Send employee invitation email
 */
export const sendEmployeeInvite = async ({ employeeEmail, employeeName, inviterName, role, inviteToken }) => {
  const html = buildEmployeeInviteEmail(inviterName, employeeName, role, inviteToken);
  return sendEmail({
    to: employeeEmail,
    subject: `${inviterName} invited you to join their law firm`,
    html,
  });
};

/**
 * Build verification email HTML
 */
const buildVerificationEmail = (username, token) => {
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
      <p style="color: #999; font-size: 12px;">If you didn't create an account, you can ignore this email.</p>
    </div>
  `;
};

/**
 * Build password reset email HTML
 */
const buildPasswordResetEmail = (username, token) => {
  const resetUrl = `${SITE_URL}/reset-password/${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #1e40af; margin-bottom: 20px;">Password Reset Request</h2>
      <p>Hi ${username || 'User'},</p>
      <p>We received a request to reset your password. Click the button below to choose a new password:</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}"
           style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">This link will expire in 24 hours.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">If you didn't request a password reset, you can ignore this email.</p>
    </div>
  `;
};

/**
 * Send verification email to new user
 */
export const sendVerificationEmail = async (user, providedToken = null) => {
  const token = providedToken || generateVerificationToken();
  const html = buildVerificationEmail(user.username || user.email, token);

  // In standalone mode, store token for verification flow
  if (!import.meta.env.SUPABASE_URL) {
    const db = JSON.parse(
      localStorage.getItem('wakiliworld.frontend.db.v1') || '{"emailVerifications":[]}'
    );
    if (!db.emailVerifications) {
      db.emailVerifications = [];
    }
    db.emailVerifications.push({
      token,
      email: user.email,
      user_id: user.id,
      created_at: new Date().toISOString(),
      used: false,
    });
    // Also update user record
    const userIndex = db.users?.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      db.users[userIndex].verification_token = token;
      db.users[userIndex].email_verified = false;
    }
    localStorage.setItem('wakiliworld.frontend.db.v1', JSON.stringify(db));
  }

  return sendEmail({
    to: user.email,
    subject: 'Verify your WakiliWorld email',
    html,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, token) => {
  // Get user to get username - need to access DB
  let username = 'User';
  if (!import.meta.env.SUPABASE_URL) {
    const db = JSON.parse(localStorage.getItem('wakiliworld.frontend.db.v1') || '{}');
    const user = db.users?.find((u) => u.email === email);
    if (user) {
      username = user.username || user.email;
    }
  }

  const html = buildPasswordResetEmail(username, token);

  return sendEmail({
    to: email,
    subject: 'Reset your WakiliWorld password',
    html,
  });
};

export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendContactEmail,
  sendClientInvite,
  generateVerificationToken,
  generateResetToken,
  generateSecureToken,
};
