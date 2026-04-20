/**
 * LICENSE MONITORING DASHBOARD
 * Backend component to track license usage and detect anomalies
 */

const LicenseMonitor = {
  // Track license usage patterns
  trackUsage: async (licenseId, action, metadata) => {
    // Log to monitoring database
    console.log(`License ${licenseId}: ${action}`, metadata);
  },

  // Detect suspicious activity
  detectAnomalies: (usagePatterns) => {
    const alerts = [];

    // Multiple installations using same license
    if (usagePatterns.uniqueInstallations > 1) {
      alerts.push({
        type: 'MULTIPLE_INSTALLATIONS',
        severity: 'HIGH',
        message: 'License used on multiple installations',
      });
    }

    // Unusual access patterns (VPN, different countries)
    if (usagePatterns.ipChanges > 5) {
      alerts.push({
        type: 'LOCATION_ANOMALY',
        severity: 'MEDIUM',
        message: 'Unusual location changes detected',
      });
    }

    return alerts;
  },

  // Generate usage reports
  generateReport: (licenseId) => {
    return {
      totalValidations: 0,
      lastUsed: new Date(),
      installationCount: 1,
      usagePatterns: {},
      alerts: [],
    };
  },
};

export default LicenseMonitor;
