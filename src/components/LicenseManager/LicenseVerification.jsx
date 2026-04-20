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

  const performVerification = useCallback(() => {
    // Allow app to render by default - don't block unless explicitly needed
    setIsBlocked(false);

    if (!installationId) {
      return;
    }

    const trialStatus = getTrialStatus();

    // Check activation
    if (activation?.activated) {
      const verification = verifyLicenseKey(activation.licenseKey, installationId);

      if (verification.valid) {
        setIsBlocked(false);
      } else {
        // Activation invalid - show modal but don't block the app
        if (!trialStatus.inTrial) {
          // Only block if both license is invalid AND trial is expired
          setIsBlocked(true);
        } else {
          setShowActivation(true);
        }
      }
    } else {
      // Not activated - only block if trial has actually expired
      if (!trialStatus.inTrial && trialStatus.daysRemaining === 0) {
        setIsBlocked(true);
      } else {
        // Don't show activation modal constantly, just allow the app to work
        setShowActivation(false);
      }
    }
  }, [installationId, activation]);

  // Initial verification effect - runs once on mount
  useEffect(() => {
    if (!verificationPerformedRef.current && installationId) {
      verificationPerformedRef.current = true;
      performVerification();
    }
  }, [installationId]); // Only depend on installationId, not performVerification

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
  }, [refreshData, installationId]); // Include installationId to restart interval if it changes

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

  // Render the blocked state
  if (isBlocked) {
    return (
      <Result
        status="lock"
        title="Software License Required"
        subTitle={
          <Space direction="vertical" size="middle">
            <Paragraph>
              Your trial period has expired or the license is invalid. Please activate your software
              license to continue using WakiliWorld CRM.
            </Paragraph>
            <Paragraph>
              <Text strong>Contact for License:</Text>
              <br />
              Email: support@techwithbrands.com
              <br />
              Phone: +254 700 000 000
              <br />
              Mpesa Till: 8352474 | KCB: 1261709403
            </Paragraph>
          </Space>
        }
        extra={[
          <Button
            key="activate"
            type="primary"
            size="large"
            onClick={() => setShowActivation(true)}
            icon={<UnlockOutlined />}
          >
            Activate License
          </Button>,
          <Button key="retry" size="large" onClick={() => window.location.reload()}>
            Retry
          </Button>,
        ]}
      />
    );
  }

  // Show activation modal if needed
  const showActivationModal = showActivation && !activation?.activated;

  return (
    <>
      {showActivationModal && (
        <LicenseActivationModal
          visible={showActivationModal}
          onClose={() => {
            setShowActivation(false);
            performVerification();
          }}
        />
      )}
      {children}
    </>
  );
};

export default LicenseVerification;
