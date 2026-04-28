import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { notification } from 'antd';

const EmailVerification = () => {
  const [verifying, setVerifying] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        notification.error({
          message: 'Verification Failed',
          description: 'No verification token found in the URL.',
        });
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        notification.success({
          message: 'Email Verified',
          description:
            'Your email has been successfully verified. You can now log in to your account.',
        });
        // Redirect to login after success
        setTimeout(() => navigate('/login'), 2000);
      } catch (error) {
        console.error('Email verification error:', error);

        let errorMessage = 'An unexpected error occurred during verification.';
        if (error.message) {
          errorMessage = error.message;
        }

        notification.error({
          message: 'Verification Failed',
          description: errorMessage,
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [location, navigate]);

  if (verifying) {
    return <div>Verifying your email...</div>;
  }

  return <div>Verification process completed. You can close this page.</div>;
};

export default EmailVerification;
