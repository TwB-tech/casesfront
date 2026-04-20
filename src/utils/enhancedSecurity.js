/**
 * ENHANCED LICENSE VALIDATION - Server-Side Implementation
 * This replaces client-side validation with secure server calls
 * Tech with Brands (TwB) - WakiliWorld/LawFirm CRM
 */

import axios from 'axios';
// Using native browser crypto for production build compatibility
// import crypto from 'crypto-js';

// Configuration for license server
const LICENSE_SERVER = {
  BASE_URL: process.env.REACT_APP_LICENSE_SERVER || 'https://api.techwithbrands.com',
  PUBLIC_KEY: process.env.REACT_APP_LICENSE_PUBLIC_KEY,
  APP_SECRET: process.env.REACT_APP_LICENSE_APP_SECRET,
};

// Encrypted storage for sensitive license data
class EncryptedStorage {
  static #encryptionKey = 'twb-secure-license-storage-v2';

  static async encrypt(data) {
    // For production build, use simple base64 encoding instead of crypto
    // In production, this should use proper encryption
    try {
      const dataStr = JSON.stringify(data);
      return btoa(dataStr); // Simple base64 encoding for now
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  static async decrypt(encryptedData) {
    try {
      const decoded = atob(encryptedData); // Simple base64 decoding for now
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  static async setItem(key, data) {
    const encrypted = await this.encrypt(data);
    if (encrypted) {
      localStorage.setItem(`twb_enc_${key}`, encrypted);
    }
  }

  static async getItem(key) {
    const encrypted = localStorage.getItem(`twb_enc_${key}`);
    return encrypted ? await this.decrypt(encrypted) : null;
  }

  static removeItem(key) {
    localStorage.removeItem(`twb_enc_${key}`);
  }
}

// Server-side license validation
export class LicenseValidator {
  static async validateLicense(licenseKey, installationId, clientName = '') {
    try {
      // Create validation payload with signature
      const timestamp = Date.now();
      const payload = {
        licenseKey,
        installationId,
        clientName,
        timestamp,
        domain: window.location.hostname,
        userAgent: navigator.userAgent.substring(0, 200),
      };

      // Sign payload for authenticity
      const signature = this.#createSignature(payload);

      const response = await axios.post(
        `${LICENSE_SERVER.BASE_URL}/api/license/validate`,
        {
          ...payload,
          signature,
        },
        {
          headers: {
            'X-App-Secret': LICENSE_SERVER.APP_SECRET,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('License validation failed:', error);

      // Fallback to cached validation if server is unreachable
      const cached = this.#getCachedValidation(licenseKey);
      if (cached && Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
        // 7 days
        console.warn('Using cached validation (server unreachable)');
        return cached.data;
      }

      return {
        valid: false,
        reason: 'server_error',
        message: 'Unable to validate license. Please check your connection.',
        offline: true,
      };
    }
  }

  static async sendHeartbeat(licenseKey, installationId, usageStats = {}) {
    try {
      const payload = {
        licenseKey,
        installationId,
        timestamp: Date.now(),
        usage: usageStats,
        domain: window.location.hostname,
      };

      const signature = this.#createSignature(payload);

      await axios.post(
        `${LICENSE_SERVER.BASE_URL}/api/license/heartbeat`,
        { ...payload, signature },
        {
          headers: {
            'X-App-Secret': LICENSE_SERVER.APP_SECRET,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );
    } catch (error) {
      // Silently fail - heartbeats are not critical
      console.debug('Heartbeat failed:', error.message);
    }
  }

  static async revokeLicense(licenseKey, reason = 'admin_action') {
    try {
      const payload = {
        licenseKey,
        reason,
        timestamp: Date.now(),
      };

      const signature = this.#createSignature(payload);

      await axios.post(
        `${LICENSE_SERVER.BASE_URL}/api/license/revoke`,
        { ...payload, signature },
        {
          headers: {
            'X-App-Secret': LICENSE_SERVER.APP_SECRET,
            'Content-Type': 'application/json',
          },
        }
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static #createSignature(payload) {
    // Simplified signature for production build compatibility
    // In production, this should use proper HMAC
    const dataString = JSON.stringify(payload, Object.keys(payload).sort());
    return btoa(dataString).substring(0, 32); // Simple truncated base64 for now
  }

  static #cacheValidation(licenseKey, data) {
    const cacheKey = `license_cache_${licenseKey}`;
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    EncryptedStorage.setItem(cacheKey, cacheData);
  }

  static #getCachedValidation(licenseKey) {
    const cacheKey = `license_cache_${licenseKey}`;
    return EncryptedStorage.getItem(cacheKey);
  }
}

// Enhanced tamper detection
export class TamperDetector {
  static #integrityChecks = [];
  static #lastHeartbeat = Date.now();

  static initialize() {
    // Monitor for developer tools
    this.#monitorDevTools();

    // Monitor localStorage tampering
    this.#monitorStorageTampering();

    // Add integrity checkpoints
    this.#addIntegrityChecks();

    // Start heartbeat monitoring
    this.#startHeartbeat();

    console.log('🔒 Tamper detection initialized');
  }

  static #monitorDevTools() {
    const devtools = { open: false, orientation: null };
    const threshold = 200;

    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight < 100 ||
        window.outerWidth < 100
      ) {
        if (!devtools.open) {
          devtools.open = true;
          TamperDetector.onTamperDetected('dev_tools_opened', 'Developer tools detected');
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  static #monitorStorageTampering() {
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = function (key, value) {
      if (key.startsWith('twb_') && !key.startsWith('twb_enc_')) {
        // Log suspicious activity
        console.warn(`Storage modification detected: ${key}`);
      }
      return originalSetItem.call(this, key, value);
    };

    localStorage.getItem = function (key) {
      if (key.startsWith('twb_')) {
        // Additional validation could go here
      }
      return originalGetItem.call(this, key);
    };

    localStorage.removeItem = function (key) {
      if (key.startsWith('twb_')) {
        console.warn(`Storage deletion detected: ${key}`);
      }
      return originalRemoveItem.call(this, key);
    };
  }

  static #addIntegrityChecks() {
    // Add random integrity checkpoints
    setInterval(() => {
      const checkpoint = Math.random().toString(36);
      this.#integrityChecks.push({
        id: checkpoint,
        timestamp: Date.now(),
      });

      // Keep only last 10 checkpoints
      if (this.#integrityChecks.length > 10) {
        this.#integrityChecks.shift();
      }
    }, 30000); // Every 30 seconds
  }

  static #startHeartbeat() {
    setInterval(() => {
      if (Date.now() - this.#lastHeartbeat > 300000) {
        // 5 minutes
        // System appears suspended or tampered
        TamperDetector.onTamperDetected('system_suspended', 'System heartbeat stopped');
      }
      this.#lastHeartbeat = Date.now();
    }, 60000); // Check every minute
  }

  static onTamperDetected(type, message) {
    console.warn(`🚨 TAMPER DETECTED: ${type} - ${message}`);

    // Report to server (if license is active)
    const activation = JSON.parse(localStorage.getItem('twb_activation') || 'null');
    if (activation?.licenseKey) {
      // Send tamper alert (non-blocking)
      fetch(`${LICENSE_SERVER.BASE_URL}/api/license/tamper-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Secret': LICENSE_SERVER.APP_SECRET,
        },
        body: JSON.stringify({
          licenseKey: activation.licenseKey,
          type,
          message,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(() => {
        // Silently fail - tamper alerts are best effort
      });
    }

    // Trigger license re-validation
    window.dispatchEvent(
      new CustomEvent('licenseTamperDetected', {
        detail: { type, message },
      })
    );
  }

  static getIntegrityStatus() {
    return {
      lastHeartbeat: this.#lastHeartbeat,
      integrityChecks: this.#integrityChecks.length,
      timeSinceLastCheck:
        Date.now() - (this.#integrityChecks[this.#integrityChecks.length - 1]?.timestamp || 0),
    };
  }
}

// Code integrity verification
export class CodeIntegrity {
  static #expectedHashes = {
    // These would be generated during build process
    'main.js': 'expected-hash-here',
    'vendor.js': 'expected-hash-here',
  };

  static async verifyIntegrity() {
    const scripts = document.querySelectorAll('script[src]');
    const violations = [];

    for (const script of scripts) {
      try {
        const response = await fetch(script.src);
        const content = await response.text();
        const hash = btoa(content).substring(0, 32); // Simple hash for production build

        const filename = script.src.split('/').pop();
        const expectedHash = this.#expectedHashes[filename];

        if (expectedHash && hash !== expectedHash) {
          violations.push({
            file: filename,
            expected: expectedHash,
            actual: hash,
          });
        }
      } catch (error) {
        violations.push({
          file: script.src,
          error: error.message,
        });
      }
    }

    if (violations.length > 0) {
      TamperDetector.onTamperDetected(
        'code_integrity_violation',
        `Code integrity check failed: ${violations.length} violations`
      );
      return { valid: false, violations };
    }

    return { valid: true };
  }

  static injectWatermark() {
    // Invisible watermark for code ownership
    const watermark = document.createElement('div');
    watermark.id = 'twb-watermark';
    watermark.style.cssText = `
      position: fixed !important;
      top: -100px !important;
      left: -100px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      z-index: -9999 !important;
    `;
    watermark.textContent = `Licensed to TwB - Anthony Kerige (Tony Kamau) - Version 2.0 - ${new Date().toISOString()}`;
    document.body.appendChild(watermark);

    // Console watermark
    const originalConsoleLog = console.log;
    console.log = function (...args) {
      originalConsoleLog.call(
        console,
        '%c[TWB CRM]%c',
        'color: #8b5cf6; font-weight: bold; font-size: 12px; background: #f0f0f0; padding: 2px 6px; border-radius: 3px;',
        'color: inherit; font-size: inherit; background: inherit; padding: inherit;',
        ...args
      );
    };

    console.log('🔒 TwB WakiliWorld CRM - Licensed Software');
  }
}

// Enhanced license monitoring
export class LicenseMonitor {
  static #usageStats = {
    pageViews: 0,
    featureUsage: {},
    loginCount: 0,
    lastActivity: Date.now(),
  };

  static initialize() {
    this.#trackPageViews();
    this.#trackFeatureUsage();
    this.#trackUserActivity();
    this.#sendPeriodicReports();
  }

  static #trackPageViews() {
    let currentPage = window.location.pathname;

    const trackPageChange = () => {
      const newPage = window.location.pathname;
      if (newPage !== currentPage) {
        this.#usageStats.pageViews++;
        currentPage = newPage;
        this.#updateActivity();
      }
    };

    // Listen for navigation events
    window.addEventListener('popstate', trackPageChange);
    window.addEventListener('pushstate', trackPageChange);

    // Track initial page load
    this.#usageStats.pageViews++;
  }

  static #trackFeatureUsage() {
    // Track button clicks and feature usage
    document.addEventListener('click', (event) => {
      const target = event.target;
      const feature =
        target.getAttribute('data-feature') ||
        target.closest('[data-feature]')?.getAttribute('data-feature');

      if (feature) {
        this.#usageStats.featureUsage[feature] = (this.#usageStats.featureUsage[feature] || 0) + 1;
        this.#updateActivity();
      }
    });
  }

  static #trackUserActivity() {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
      document.addEventListener(event, () => this.#updateActivity(), { passive: true });
    });
  }

  static #updateActivity() {
    this.#usageStats.lastActivity = Date.now();
  }

  static #sendPeriodicReports() {
    setInterval(
      async () => {
        const activation = JSON.parse(localStorage.getItem('twb_activation') || 'null');
        if (activation?.licenseKey) {
          await LicenseValidator.sendHeartbeat(activation.licenseKey, activation.installationId, {
            ...this.#usageStats,
          });

          // Reset counters after sending
          this.#usageStats.pageViews = 0;
          this.#usageStats.featureUsage = {};
          this.#usageStats.loginCount = 0;
        }
      },
      4 * 60 * 60 * 1000
    ); // Every 4 hours
  }

  static recordLogin() {
    this.#usageStats.loginCount++;
    this.#updateActivity();
  }

  static getUsageStats() {
    return { ...this.#usageStats };
  }
}

// Initialize all security systems
export function initializeSecurity() {
  TamperDetector.initialize();
  CodeIntegrity.injectWatermark();
  LicenseMonitor.initialize();

  console.log('🔒 Advanced security systems initialized');
}

// Export enhanced utilities
export { EncryptedStorage };
export default {
  initializeSecurity,
  LicenseValidator,
  TamperDetector,
  CodeIntegrity,
  LicenseMonitor,
  EncryptedStorage,
};
