/**
 * Email Service using Resend API
 * Handles transactional emails: verification, password reset, notifications
 */

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL || 'admin@wakiliworld.local';
const SITE_URL = import.meta.env.SITE_URL || window.location.origin;

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
        from: `WakiliWorld <${ADMIN_EMAIL}>`,
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
 * Build verification email HTML
 */
const buildVerificationEmail = (username, token) => {
  const verifyUrl = `${SITE_URL}/email-verify/?token=${token}`;
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
export const sendVerificationEmail = async (user) => {
  const token = generateVerificationToken();
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
  generateVerificationToken,
  generateResetToken,
};
