import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import axiosInstance from '../axiosConfig';

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
        const response = await axiosInstance.post('/auth/verify-email/', { token });

        notification.success({
          message: 'Email Verified',
          description:
            'Your email has been successfully verified. You can now log in to your account.',
        });
        navigate('/login');
      } catch (error) {
        console.error('Email verification error:', error);

        let errorMessage = 'An unexpected error occurred during verification.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          errorMessage = Object.values(error.response.data.errors).flat().join(', ');
        } else if (error.message) {
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
