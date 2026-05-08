import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Button, Typography, Space, Result } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import LicenseActivationModal from './LicenseActivationModal';
import { useLicense } from '../../contexts/LicenseContext';
import { verifyLicenseKey, generateInstallationId, getTrialStatus } from '../../utils/license';

const { Title, Text, Paragraph } = Typography;

const LicenseVerification = ({ children }) => {
  const [showActivation, setShowActivation] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { activation, refreshData } = useLicense();

  // Use ref to track verification state and avoid setState in useEffect
  const verificationPerformedRef = useRef(false);

  const installationId = useMemo(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('twb_installation_id') ||
        (() => {
          const id = generateInstallationId();
          localStorage.setItem('twb_installation_id', id);
          return id;
        })()
      );
    }
    return null;
  }, []);

  const performVerification = useCallback(async () => {
    try {
      if (!installationId) {
        setIsBlocked(false);
        return;
      }

      const trialStatus = getTrialStatus();

      // Check activation
      if (activation?.activated) {
        try {
          const verification = await verifyLicenseKey(activation.licenseKey, installationId);

          if (verification?.valid) {
            setIsBlocked(false);
          } else {
            // Activation invalid - show modal but allow trial
            if (!trialStatus.inTrial) {
              setIsBlocked(true);
            } else {
              setShowActivation(true);
            }
          }
        } catch (verificationError) {
          console.error('License verification failed:', verificationError);
          // On verification error, allow trial if available
          if (!trialStatus.inTrial) {
            setIsBlocked(true);
          } else {
            setIsBlocked(false);
            setShowActivation(true);
          }
        }
      } else {
        // Not activated
        if (!trialStatus.inTrial) {
          setIsBlocked(true);
        } else {
          // Show activation modal after trial expires in future
          setShowActivation(false);
          setIsBlocked(false);
        }
      }
    } catch (error) {
      console.error('License verification error:', error);
      // On any error, default to allowing the app to work
      setIsBlocked(false);
      setShowActivation(false);
    }
  }, [installationId, activation]);

  // Initial verification effect - runs once on mount
  useEffect(() => {
    if (!verificationPerformedRef.current) {
      verificationPerformedRef.current = true;
      performVerification().catch((error) => {
        console.error('Initial license verification failed:', error);
        setHasError(true);
        setIsBlocked(false); // Allow app to work even if verification fails
      });
    }
  }, [performVerification]); // Run when performVerification changes

  // Periodic verification effect
  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshData().then(() => {
          // Use setTimeout to avoid calling setState synchronously
          setTimeout(() => {
            if (installationId) {
              performVerification();
            }
          }, 500);
        });
      },
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [refreshData, installationId, performVerification]); // Include installationId to restart interval if it changes

  // Listen for storage changes (tamper detection)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e) => {
      if (e.key === 'twb_activation' || e.key === 'twb_licenses') {
        refreshData();
        setTimeout(performVerification, 300);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshData, performVerification]);

   // License check disabled for deployment - always render children
   return (
     <>
       {showActivation && !activation?.activated && !hasError && (
         <LicenseActivationModal
           visible={showActivation}
           onClose={() => {
             setShowActivation(false);
           }}
         />
       )}
       {children}
     </>
   );
 };

export default LicenseVerification;
