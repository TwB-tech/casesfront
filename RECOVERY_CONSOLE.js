/**
 * WAKILIWORLD - SUPERADMIN RECOVERY CONSOLE UTILITY
 * Run this in browser DevTools Console on any page of the app
 *
 * This utility allows you to:
 * 1. Set your user account as superadmin (admin role)
 * 2. Reset your password via email
 * 3. View current user info
 * 4. Clear license for re-activation
 *
 * Usage: Paste entire script in browser console and press Enter
 * Or run individual commands: recoverAdmin.setAsAdmin()
 */

const recoverAdmin = (function () {
  'use strict';

  // Configuration
  const CONFIG = {
    ADMIN_EMAIL: 'admin@techwithbrands.com', // CHANGE TO YOUR EMAIL
    DEFAULT_PASSWORD: 'Admin@2024!', // You'll change after login
  };

  // Helper: pause for visual feedback
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Get current user from localStorage
  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || 'null');
    } catch (e) {
      return null;
    }
  }

  // Show user info
  function showUserInfo() {
    console.log(
      '%c=== CURRENT USER INFO ===',
      'color: #8b5cf6; font-size: 14px; font-weight: bold;'
    );
    const user = getCurrentUser();
    if (user) {
      console.table({
        ID: user.id,
        Email: user.email,
        Username: user.username,
        Role: user.role || '(not set)',
        'Organization ID': user.organization_id || '(none)',
      });
    } else {
      console.log('Not logged in');
    }
    console.log('');
  }

  // Set user role to admin in localStorage
  function setLocalRole(role = 'admin') {
    const user = getCurrentUser();
    if (!user) {
      console.error('Not logged in. Please log in first.');
      return false;
    }

    user.role = role;
    localStorage.setItem('userInfo', JSON.stringify(user));
    console.log(`✅ Local user role set to: ${role}`);
    console.log('⚠️  Refresh the page to take effect');
    return true;
  }

  // Update Supabase profile role via API
  async function updateSupabaseRole(userId, newRole = 'admin') {
    console.log(`Updating Supabase profile for user ${userId}...`);

    try {
      // Get the auth token
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found. Please log in first.');
      }

      // Call the profile update endpoint
      const response = await fetch('/auth/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          username: getCurrentUser()?.username,
          email: getCurrentUser()?.email,
          role: newRole,
        }),
      });

      if (response.ok) {
        console.log('✅ Supabase profile updated');
        return true;
      } else {
        const err = await response.json();
        console.error('❌ Update failed:', err);
        return false;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      return false;
    }
  }

  // Direct Supabase update via API (if you have service key)
  async function directSupabaseUpdate(userId, newRole = 'admin') {
    console.log('Direct Supabase update requires service key.');
    console.log('Option 1: Use Supabase Dashboard (recommended)');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Select project → Authentication → Users');
    console.log(`3. Find user by email: ${CONFIG.ADMIN_EMAIL || 'your email'}`);
    console.log('4. Edit user_metadata: {"role": "admin"}');
    console.log('');
    console.log('Option 2: Run this in console to update localStorage + API:');
    console.log('  recoverAdmin.fixRole()');
  }

  // Complete fix: localStorage + API
  async function fixRole() {
    console.log('%c🔧 FIXING ADMIN ROLE...', 'color: #8b5cf6; font-size: 16px; font-weight: bold;');
    console.log('');

    const user = getCurrentUser();
    if (!user) {
      console.error('❌ Not logged in. Please log in first.');
      return;
    }

    console.log(`User: ${user.username} (${user.email})`);
    console.log(`Current role: ${user.role || '(none)'}`);

    // Step 1: Update localStorage
    console.log('Step 1: Updating localStorage...');
    setLocalRole('admin');
    await wait(500);

    // Step 2: Update Supabase via API
    console.log('Step 2: Updating Supabase profile...');
    const success = await updateSupabaseRole(user.id, 'admin');

    if (success) {
      console.log('');
      console.log('%c✅ SUCCESS!', 'color: #52c41a; font-size: 16px; font-weight: bold;');
      console.log('Please refresh the page and try accessing the admin dashboard.');
      console.log('Login again if needed.');
    } else {
      console.log('');
      console.log('%c⚠️  PARTIAL SUCCESS', 'color: #faad14; font-size: 14px;');
      console.log('Local role updated. API update failed (possibly no admin route).');
      console.log('Refresh and try accessing admin - if still denied, use Supabase Dashboard.');
    }
  }

  // Password reset via email
  async function requestPasswordReset() {
    const email = prompt('Enter your admin email:', CONFIG.ADMIN_EMAIL);
    if (!email) return;

    console.log(`Requesting password reset for: ${email}`);
    try {
      const response = await fetch('/auth/request-reset-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        console.log('✅ Password reset email sent!');
        console.log('Check your inbox and follow the link.');
      } else {
        console.error('❌ Request failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  // Clear all license data (for testing)
  function clearLicenseData() {
    if (confirm('Clear ALL license data? This will reset activation.')) {
      localStorage.removeItem('twb_activation');
      localStorage.removeItem('twb_licenses');
      localStorage.removeItem('twb_trial_start');
      console.log('✅ License data cleared. Refresh to reactivate.');
    }
  }

  // Show license status
  function showLicenseStatus() {
    const activation = JSON.parse(localStorage.getItem('twb_activation') || 'null');
    const licenses = JSON.parse(localStorage.getItem('twb_licenses') || '[]');

    console.log('%c=== LICENSE STATUS ===', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');
    console.table({
      Activated: activation?.activated || false,
      'License Key': activation?.licenseKey?.substring(0, 20) + '...' || 'N/A',
      Client: activation?.clientName || 'N/A',
      Expiry: activation?.expiryDate || 'N/A',
      'Days Left': activation?.daysRemaining || 0,
      'Total Licenses': licenses.length,
    });
  }

  // Public API
  return {
    info: showUserInfo,
    fixRole,
    setAsAdmin: () => setLocalRole('admin'),
    resetPassword: requestPasswordReset,
    clearLicense: clearLicenseData,
    licenseStatus: showLicenseStatus,
    showHelp: () => {
      console.log(
        '%c=== WAKILIWORLD RECOVERY TOOL ===',
        'color: #8b5cf6; font-size: 16px; font-weight: bold;'
      );
      console.log('');
      console.log('Commands:');
      console.log('  recoverAdmin.info()              - Show current user info');
      console.log('  recoverAdmin.setAsAdmin()        - Set local role to admin (fast)');
      console.log('  recoverAdmin.fixRole()           - Full fix: local + Supabase update');
      console.log('  recoverAdmin.resetPassword()     - Send password reset email');
      console.log('  recoverAdmin.clearLicense()      - Clear license data');
      console.log('  recoverAdmin.licenseStatus()     - Show license status');
      console.log('');
      console.log('Quick fix workflow:');
      console.log('  1. recoverAdmin.fixRole()');
      console.log('  2. Refresh page');
      console.log('  3. Click avatar → Admin Dashboard');
    },
  };
})();

// Auto-print help on load
console.log(
  '%c💡 WakiliWorld Recovery Tool loaded. Type recoverAdmin.showHelp() for commands.',
  'color: #8b5cf6; background: #f0f0f0; padding: 4px 8px; border-radius: 4px;'
);
