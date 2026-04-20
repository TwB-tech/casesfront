import { createContext, useEffect, useState, useMemo } from 'react';
import {
  getActivationStatus,
  getTrialStatus,
  activateLicense as doActivateLicense,
  revokeLicense,
  renewLicense,
  saveLicenseRecord,
  getAllLicenses,
  updateLicense,
  getLicenseStats,
  resetLicenseData,
} from '../utils/license';
import { message } from 'antd';

const LicenseContext = createContext(null);

export const LicenseProvider = ({ children }) => {
  const [activation, setActivation] = useState(null);
  const [trial, setTrial] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationCheckCount, setVerificationCheckCount] = useState(0);

  useEffect(() => {
    initializeLicenseState();
  }, []);

  const initializeLicenseState = async () => {
    try {
      const [activationStatus, trialStatus, allLicenses, licenseStats] = await Promise.all([
        getActivationStatus(),
        getTrialStatus(),
        Promise.resolve(getAllLicenses()),
        Promise.resolve(getLicenseStats()),
      ]);

      setActivation(activationStatus);
      setTrial(trialStatus);
      setLicenses(allLicenses);
      setStats(licenseStats);

      // Log status for debugging
      if (import.meta.env.DEV) {
        console.log('License Status:', activationStatus);
        console.log('Trial Status:', trialStatus);
      }
    } catch (error) {
      console.error('License initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    initializeLicenseState();
  };

  const activateLicense = async (licenseKey, clientName, installationId) => {
    setLoading(true);
    try {
      const result = await doActivateLicense(licenseKey, clientName, installationId);

      if (result.success) {
        message.success('License activated successfully');
        refreshData();
        return { success: true };
      } else {
        let errorMsg = result.message;
        switch (result.reason) {
          case 'expired':
            errorMsg = 'This license has expired. Please contact support for renewal.';
            break;
          case 'revoked':
            errorMsg = 'This license has been revoked. Please contact support.';
            break;
          case 'wrong_installation':
            errorMsg = 'License is bound to a different installation.';
            break;
          case 'wrong_domain':
            errorMsg = result.message;
            break;
          case 'no_licenses':
            errorMsg = 'No license records exist. Please generate a license first.';
            break;
          case 'invalid_key':
            errorMsg = 'Invalid license key. Please check and try again.';
            break;
          case 'server_error':
            errorMsg = 'Server validation failed. Please check your connection.';
            break;
        }
        message.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      message.error('Activation failed. Please try again.');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deactivateLicense = () => {
    localStorage.removeItem('twb_activation');
    message.info('License deactivated');
    refreshData();
  };

  const createLicense = (licenseData) => {
    const result = saveLicenseRecord(licenseData);
    if (result.success) {
      message.success('License created successfully');
      refreshData();
      return { success: true, license: result.license };
    } else {
      message.error('Failed to create license');
      return { success: false, error: result.error };
    }
  };

  const updateLicenseRecord = (licenseId, updates) => {
    const result = updateLicense(licenseId, updates);
    if (result.success) {
      message.success('License updated');
      refreshData();
      return { success: true };
    }
    message.error('Failed to update license');
    return { success: false };
  };

  const revokeLicenseRecord = (licenseId) => {
    const result = revokeLicense(licenseId);
    if (result.success) {
      message.success('License revoked');
      refreshData();
      return { success: true };
    }
    message.error('Failed to revoke license');
    return { success: false };
  };

  const renewLicenseRecord = (licenseId, months) => {
    const result = renewLicense(licenseId, months);
    if (result.success) {
      message.success(
        `License renewed until ${new Date(result.license.expiryDate).toLocaleDateString()}`
      );
      refreshData();
      return { success: true, license: result.license };
    }
    message.error('Failed to renew license');
    return { success: false };
  };

  const forceRefresh = () => {
    setVerificationCheckCount((prev) => prev + 1);
  };

  const value = useMemo(
    () => ({
      activation,
      trial,
      licenses,
      stats,
      loading,
      refreshData,
      activateLicense,
      deactivateLicense,
      createLicense,
      updateLicense: updateLicenseRecord,
      revokeLicense: revokeLicenseRecord,
      renewLicense: renewLicenseRecord,
      resetLicenseData: () => {
        resetLicenseData();
        refreshData();
        message.info('License data reset (dev mode only)');
      },
      forceRefresh,
      verificationCheckCount,
    }),
    [activation, trial, licenses, stats, loading, verificationCheckCount]
  );

  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>;
};

export const useLicense = () => {
  const context = LicenseContext;
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};

export default LicenseContext;
