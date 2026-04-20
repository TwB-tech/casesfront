/**
 * ADVANCED SECURITY ENHANCEMENTS
 * Additional protection layers for IP and license security
 */

const ADVANCED_SECURITY = {
  // Obfuscation techniques
  obfuscateCode: () => {
    // In production build, this would be handled by webpack plugins
    console.log('Code obfuscation should be handled in build process');
  },

  // Watermark injection
  injectWatermark: (licenseData) => {
    // Inject invisible watermark in DOM
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position: fixed;
      top: -100px;
      left: -100px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
    `;
    watermark.textContent = `Licensed to ${licenseData.clientName} - ${licenseData.licenseKey}`;
    document.body.appendChild(watermark);
  },

  // Console watermark
  injectConsoleWatermark: () => {
    const originalConsoleLog = console.log;
    console.log = function (...args) {
      originalConsoleLog.apply(console, [
        '%c[TWB CRM]%c',
        'color: #8b5cf6; font-weight: bold; font-size: 12px;',
        'color: inherit; font-size: inherit;',
        ...args,
      ]);
    };
  },

  // Anti-tampering checks
  initTamperDetection: () => {
    // Monitor for developer tools
    const devtools = { open: false, orientation: null };
    const threshold = 160;

    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          // Log to server for security monitoring
          console.warn('Developer tools detected');
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Monitor localStorage tampering
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      if (key.startsWith('twb_')) {
        // Validate license-related changes
        if (key === 'twb_activation') {
          const activation = JSON.parse(value);
          // Additional validation could go here
        }
      }
      return originalSetItem.call(this, key, value);
    };
  },

  // Server-side validation endpoint (to be implemented)
  validateOnServer: async (licenseData) => {
    // This would call a server endpoint to validate license
    // For now, it's client-side only
    return { valid: true, serverValidated: false };
  },
};

export default ADVANCED_SECURITY;
