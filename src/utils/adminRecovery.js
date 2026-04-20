/**
 * SuperAdmin Password Recovery Utility
 * Allows superadmin to reset their password via Supabase admin API
 * Run this in browser console or import as module
 */

import axios from 'axios';

// Configuration - SET YOUR VALUES HERE
const CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_SERVICE_KEY: 'your-service-role-key', // Get from Supabase > Settings > API
  ADMIN_EMAIL: 'admin@techwithbrands.com', // Your superadmin email
};

/**
 * Reset superadmin password via Supabase Admin API
 * This uses service role key to update user directly
 */
export async function resetSuperAdminPassword(newPassword) {
  try {
    const response = await axios.post(
      `${CONFIG.SUPABASE_URL}/auth/v1/admin/users/by_email`,
      {
        email: CONFIG.ADMIN_EMAIL,
        password: newPassword,
        email_confirm: true,
      },
      {
        headers: {
          Authorization: `Bearer ${CONFIG.SUPABASE_SERVICE_KEY}`,
          apikey: CONFIG.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Password reset failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Alternative: Create a password reset email (if email is accessible)
 */
export async function sendPasswordResetEmail() {
  try {
    const response = await axios.post(`${CONFIG.SUPABASE_URL}/auth/v1/recover`, {
      email: CONFIG.ADMIN_EMAIL,
    });

    if (response.status === 200) {
      console.log('Password reset email sent! Check your inbox.');
      return { success: true };
    }
  } catch (error) {
    console.error('Failed to send reset email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Create one-time recovery token and store locally
 * Use this if you can't access email
 */
export async function createRecoveryToken() {
  const token = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Store token in localStorage (you'll use this to authenticate recovery API)
  localStorage.setItem('twb_recovery_token', token);
  localStorage.setItem('twb_recovery_timestamp', Date.now());

  console.log('Recovery token created:', token);
  console.log('Call resetSuperAdminPassword() with a new password:');
  console.log(`
  resetSuperAdminPassword('YourNewPassword123!')
    .then(console.log)
    .catch(console.error);
  `);

  return token;
}

/**
 * Quick recovery - run all steps
 */
export async function quickRecovery(newPassword = 'Admin@2024!') {
  console.log('Starting password recovery for:', CONFIG.ADMIN_EMAIL);
  const result = await resetSuperAdminPassword(newPassword);
  if (result.success) {
    console.log('✅ Password reset successful!');
    console.log('New password:', newPassword);
    console.log('Please log in and change password immediately.');
  } else {
    console.error('❌ Failed:', result.error);
  }
  return result;
}

// Export for use
export default {
  resetPassword: resetSuperAdminPassword,
  sendResetEmail: sendPasswordResetEmail,
  createToken: createRecoveryToken,
  quickRecovery,
};
