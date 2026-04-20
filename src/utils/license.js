/**
 * ENHANCED License Management Utilities
 * Handles key generation, verification, hardware fingerprinting, and storage
 * Now with server-side validation and advanced security
 */

import { LicenseValidator, EncryptedStorage, TamperDetector } from './enhancedSecurity';

const LICENSE_PREFIX = 'TWB-LF';
const STORAGE_KEYS = {
  LICENSES: 'twb_licenses',
  ACTIVATION: 'twb_activation',
  TRIAL_START: 'twb_trial_start',
  LICENSE_VERIFICATION: 'twb_license_last_check',
};

const GRACE_PERIOD_DAYS = 30;

/**
 * Generate a cryptographically secure random string
 */
function generateSecureRandom(length = 16) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a unique license key in format: TWB-LF-XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey() {
  const parts = [
    generateSecureRandom(4),
    generateSecureRandom(4),
    generateSecureRandom(4),
    generateSecureRandom(4),
  ];
  return `${LICENSE_PREFIX}-${parts.join('-')}`.toUpperCase();
}

/**
 * Generate a hardware fingerprint based on available system information
 */
export function generateHardwareFingerprint() {
  const components = [
    // Browser fingerprints
    navigator.userAgent,
    navigator.platform,
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown',
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    // Generate a persistent ID if not exists
    localStorage.getItem('hw_id') || generateSecureRandom(32),
  ];

  const fingerprint = components.join('|');

  // Store hardware ID for persistence across sessions
  if (!localStorage.getItem('hw_id')) {
    localStorage.setItem('hw_id', generateSecureRandom(32));
  }

  // Simple hash of fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36).slice(0, 16);
}

/**
 * Generate a simple installation ID from multiple sources
 */
export function generateInstallationId() {
  const timestamp = Date.now().toString(36);
  const random = generateSecureRandom(8);
  const hw = generateHardwareFingerprint();
  return `twb-${timestamp}-${random}-${hw}`.slice(0, 64);
}

/**
 * Hash a license key for storage/comparison (simple but effective)
 */
export function hashLicenseKey(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Verify a license key against server and local cache
 * @returns {object} verification result with status and license data
 */
export async function verifyLicenseKey(licenseKey, installationId = null) {
  try {
    // First try server-side validation
    const serverResult = await LicenseValidator.validateLicense(licenseKey, installationId);

    if (serverResult.valid) {
      // Cache successful validation
      EncryptedStorage.setItem(`license_cache_${licenseKey}`, {
        data: serverResult,
        timestamp: Date.now(),
      });
      return serverResult;
    }

    // If server validation fails but we have a recent cache (offline mode)
    if (serverResult.offline) {
      const cached = EncryptedStorage.getItem(`license_cache_${licenseKey}`);
      if (cached && Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
        // 7 days
        console.warn('Using cached license validation (offline mode)');
        return cached.data;
      }
    }

    // Fall back to local validation for admin operations
    return fallbackLocalValidation(licenseKey, installationId);
  } catch (error) {
    console.error('License verification error:', error);
    // Emergency fallback
    return fallbackLocalValidation(licenseKey, installationId);
  }
}

/**
 * Fallback local validation for emergency situations
 */
function fallbackLocalValidation(licenseKey, installationId = null) {
  try {
    const licensesJson = localStorage.getItem(STORAGE_KEYS.LICENSES);
    if (!licensesJson) {
      return {
        valid: false,
        reason: 'no_licenses',
        message: 'No licenses found in system',
      };
    }

    const licenses = JSON.parse(licensesJson);
    const normalizedKey = licenseKey.toUpperCase().trim();
    const license = licenses.find((l) => l.licenseKey.toUpperCase() === normalizedKey);

    if (!license) {
      return {
        valid: false,
        reason: 'invalid_key',
        message: 'License key not recognized',
      };
    }

    if (license.status === 'revoked') {
      return {
        valid: false,
        reason: 'revoked',
        message: 'License has been revoked',
        license,
      };
    }

    const expiry = new Date(license.expiryDate);
    const now = new Date();
    if (expiry < now) {
      return {
        valid: false,
        reason: 'expired',
        message: 'License has expired',
        license,
      };
    }

    return {
      valid: true,
      reason: 'valid',
      message: 'License is valid (local fallback)',
      license,
      fallback: true,
    };
  } catch (error) {
    return {
      valid: false,
      reason: 'error',
      message: 'Verification system error',
    };
  }
}

/**
 * Get current trial/grace period status
 */
export function getTrialStatus() {
  const trialStart = localStorage.getItem(STORAGE_KEYS.TRIAL_START);
  if (!trialStart) {
    // First run - start trial
    const start = new Date();
    localStorage.setItem(STORAGE_KEYS.TRIAL_START, start.toISOString());
    return {
      inTrial: true,
      daysRemaining: GRACE_PERIOD_DAYS,
      startDate: start,
      endDate: new Date(start.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000),
    };
  }

  const start = new Date(trialStart);
  const end = new Date(start.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((end - now) / (24 * 60 * 60 * 1000)));

  return {
    inTrial: now <= end,
    daysRemaining,
    startDate: start,
    endDate: end,
  };
}

/**
 * Get current activation status with server validation
 */
export async function getActivationStatus() {
  // Try encrypted storage first
  let activation = EncryptedStorage.getItem('activation');

  // Fallback to regular localStorage
  if (!activation) {
    const activationJson = localStorage.getItem(STORAGE_KEYS.ACTIVATION);
    if (activationJson) {
      try {
        activation = JSON.parse(activationJson);
      } catch (e) {
        console.error('Failed to parse activation data:', e);
      }
    }
  }

  if (!activation) {
    return {
      activated: false,
      licenseKey: null,
      clientName: null,
      expiryDate: null,
      daysRemaining: 0,
      isExpiringSoon: false,
      paymentStatus: null,
      serverValidated: false,
    };
  }

  try {
    const expiry = new Date(activation.expiryDate);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((expiry - now) / (24 * 60 * 60 * 1000)));

    // Re-verify license with server
    const verification = await verifyLicenseKey(activation.licenseKey, activation.installationId);
    if (!verification.valid) {
      return {
        activated: false,
        licenseKey: activation.licenseKey,
        clientName: activation.clientName,
        expiryDate: activation.expiryDate,
        daysRemaining: 0,
        isExpiringSoon: false,
        paymentStatus: null,
        invalidReason: verification.reason,
        serverValidated: false,
      };
    }

    return {
      activated: true,
      licenseKey: activation.licenseKey,
      clientName: activation.clientName,
      expiryDate: activation.expiryDate,
      daysRemaining,
      isExpiringSoon: daysRemaining <= 30 && daysRemaining > 0,
      isExpired: daysRemaining <= 0,
      paymentStatus: verification.license?.paymentStatus || 'paid',
      maintenanceDue: checkMaintenanceDue(verification.license),
      serverValidated: !verification.fallback,
    };
  } catch (error) {
    console.error('Error getting activation status:', error);
    return { activated: false, serverValidated: false };
  }
}

/**
 * Check if maintenance fee is due (quarterly)
 */
function checkMaintenanceDue(license) {
  if (!license) {
    return false;
  }
  const lastPayment = new Date(license.lastPaymentDate || license.createdAt);
  const now = new Date();
  const monthsDiff =
    (now.getFullYear() - lastPayment.getFullYear()) * 12 +
    (now.getMonth() - lastPayment.getMonth());
  return monthsDiff >= 3;
}

/**
 * Activate a license key for current installation with server validation
 */
export async function activateLicense(licenseKey, clientName, installationId) {
  try {
    // Verify with server first
    const verification = await verifyLicenseKey(licenseKey, installationId);
    if (!verification.valid) {
      return {
        success: false,
        message: verification.message,
        reason: verification.reason,
      };
    }

    const activation = {
      licenseKey: licenseKey.toUpperCase().trim(),
      installationId,
      clientName: verification.license.clientName || clientName,
      activatedAt: new Date().toISOString(),
      expiryDate: verification.license.expiryDate,
      hardwareHash: generateHardwareFingerprint(),
      licenseId: verification.license.id,
      serverValidated: !verification.fallback,
    };

    // Store encrypted activation data
    EncryptedStorage.setItem('activation', activation);

    // Also store in regular localStorage for backward compatibility
    localStorage.setItem(STORAGE_KEYS.ACTIVATION, JSON.stringify(activation));

    // Update license record with installation ID
    updateLicenseInstallation(licenseKey, installationId);

    // Send heartbeat to confirm activation
    await LicenseValidator.sendHeartbeat(licenseKey, installationId, {
      activated: true,
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: 'License activated successfully',
      activation,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Activation failed. Please check your connection and try again.',
      error: error.message,
    };
  }
}

/**
 * Update license record with installation ID
 */
function updateLicenseInstallation(licenseKey, installationId) {
  try {
    const licensesJson = localStorage.getItem(STORAGE_KEYS.LICENSES);
    if (!licensesJson) {
      return;
    }

    const licenses = JSON.parse(licensesJson);
    const idx = licenses.findIndex((l) => l.licenseKey.toUpperCase() === licenseKey.toUpperCase());

    if (idx !== -1) {
      licenses[idx].installationId = installationId;
      licenses[idx].activatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));
    }
  } catch (error) {
    console.error('Failed to update license installation:', error);
  }
}

/**
 * Save a new license record with encryption (admin only)
 */
export function saveLicenseRecord(licenseData) {
  try {
    // Get existing licenses (try encrypted first, then fallback)
    let licenses = EncryptedStorage.getItem('licenses') || [];
    if (!Array.isArray(licenses)) {
      const licensesJson = localStorage.getItem(STORAGE_KEYS.LICENSES);
      licenses = licensesJson ? JSON.parse(licensesJson) : [];
    }

    const newLicense = {
      id: generateSecureRandom(16),
      clientName: licenseData.clientName,
      organization: licenseData.organization,
      email: licenseData.email,
      licenseKey: licenseData.licenseKey,
      installationId: licenseData.installationId || null,
      allowedDomain: licenseData.allowedDomain || null,
      activatedAt: licenseData.activatedAt || null,
      expiryDate: licenseData.expiryDate,
      status: 'active',
      paymentStatus: licenseData.paymentStatus || 'pending',
      amount: licenseData.amount || 250000,
      maintenanceFee: licenseData.maintenanceFee || 40000,
      createdBy: licenseData.createdBy || 'Tony Kamau',
      createdAt: new Date().toISOString(),
      lastPaymentDate: null,
      notes: licenseData.notes || '',
      serverSynced: false, // Track if synced with server
    };

    licenses.push(newLicense);

    // Store in encrypted storage
    EncryptedStorage.setItem('licenses', licenses);

    // Also store in regular localStorage for backward compatibility
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));

    return { success: true, license: newLicense };
  } catch (error) {
    console.error('Failed to save license:', error);
    return { success: false, error };
  }
}

/**
 * Get all licenses with decryption (admin only)
 */
export function getAllLicenses() {
  try {
    // Try encrypted storage first
    let licenses = EncryptedStorage.getItem('licenses');

    if (!licenses) {
      // Fallback to regular localStorage
      const licensesJson = localStorage.getItem(STORAGE_KEYS.LICENSES);
      licenses = licensesJson ? JSON.parse(licensesJson) : [];
    }

    return Array.isArray(licenses) ? licenses : [];
  } catch (error) {
    console.error('Failed to get licenses:', error);
    return [];
  }
}

/**
 * Sync license with server (admin only)
 */
export async function syncLicenseWithServer(licenseId) {
  try {
    const licenses = getAllLicenses();
    const license = licenses.find((l) => l.id === licenseId);

    if (!license) {
      return { success: false, error: 'License not found' };
    }

    // Send to server (placeholder - implement actual server endpoint)
    const response = await fetch('/api/admin/license/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(license),
    });

    if (response.ok) {
      // Mark as synced
      license.serverSynced = true;
      updateLicense(licenseId, { serverSynced: true });
      return { success: true };
    } else {
      return { success: false, error: 'Server sync failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update a license record
 */
export function updateLicense(licenseId, updates) {
  try {
    const licensesJson = localStorage.getItem(STORAGE_KEYS.LICENSES);
    if (!licensesJson) {
      return { success: false };
    }

    const licenses = JSON.parse(licensesJson);
    const idx = licenses.findIndex((l) => l.id === licenseId);
    if (idx === -1) {
      return { success: false, error: 'License not found' };
    }

    licenses[idx] = { ...licenses[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));

    return { success: true, license: licenses[idx] };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Delete/Revoke a license
 */
export function revokeLicense(licenseId) {
  return updateLicense(licenseId, { status: 'revoked' });
}

/**
 * Renew a license by extending expiry
 */
export function renewLicense(licenseId, extensionMonths = 12) {
  try {
    const licensesJson = localStorage.getItem(STORAGE_KEYS.LICENSES);
    if (!licensesJson) {
      return { success: false };
    }

    const licenses = JSON.parse(licensesJson);
    const idx = licenses.findIndex((l) => l.id === licenseId);
    if (idx === -1) {
      return { success: false, error: 'License not found' };
    }

    const currentExpiry = new Date(licenses[idx].expiryDate);
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + extensionMonths);

    licenses[idx].expiryDate = newExpiry.toISOString();
    licenses[idx].status = 'active';
    licenses[idx].lastPaymentDate = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));

    // Also update activation if this is the current license
    const activationJson = localStorage.getItem(STORAGE_KEYS.ACTIVATION);
    if (activationJson) {
      const activation = JSON.parse(activationJson);
      if (activation.licenseId === licenseId) {
        activation.expiryDate = newExpiry.toISOString();
        localStorage.setItem(STORAGE_KEYS.ACTIVATION, JSON.stringify(activation));
      }
    }

    return { success: true, license: licenses[idx] };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Get license statistics (admin dashboard)
 */
export function getLicenseStats() {
  const licenses = getAllLicenses();
  const now = new Date();

  const stats = {
    total: licenses.length,
    active: 0,
    expired: 0,
    revoked: 0,
    expiringSoon: 0,
    totalRevenue: 0,
    pendingPayment: 0,
  };

  licenses.forEach((license) => {
    const expiry = new Date(license.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - now) / (24 * 60 * 60 * 1000));

    if (license.status === 'active') {
      stats.active++;
    } else if (license.status === 'revoked') {
      stats.revoked++;
    }

    if (expiry < now) {
      stats.expired++;
    } else if (daysUntilExpiry <= 30) {
      stats.expiringSoon++;
    }

    if (license.paymentStatus === 'paid') {
      stats.totalRevenue += Number(license.amount) || 0;
    } else {
      stats.pendingPayment++;
    }
  });

  return stats;
}

/**
 * Format license key for display (groups of 4)
 */
export function formatLicenseKey(key) {
  if (!key) {
    return '';
  }
  const cleaned = key.replace(/[^A-Z0-9]/gi, '');
  // Insert hyphens every 4 chars after prefix
  const prefix = cleaned.slice(0, 8); // TWB-LF
  const rest =
    cleaned
      .slice(8)
      .match(/.{1,4}/g)
      ?.join('-') || '';
  return `${prefix}-${rest}`.toUpperCase();
}

/**
 * Validate license key format
 */
export function isValidLicenseFormat(key) {
  const pattern = /^TWB-LF-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
  return pattern.test(key.trim());
}

/**
 * Reset all license data (for development only)
 */
export function resetLicenseData() {
  if (import.meta.env.DEV) {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    return true;
  }
  return false;
}

export { STORAGE_KEYS, GRACE_PERIOD_DAYS };
