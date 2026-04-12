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
          description: 'No verification token found.',
        });
        setVerifying(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/auth/email-verify/?token=${token}`);
        
        if (response.status === 200) {
          notification.success({
            message: 'Email Verified',
            description: 'Your email has been successfully activated.',
          });
          navigate('/login');
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            const errorMessage = error.response.data.error;
            notification.error({
              message: 'Verification Failed',
              description: errorMessage,
            });
          } else {
            notification.error({
              message: 'Verification Failed',
              description: 'An unexpected error occurred. Please try again.',
            });
          }
        } else {
          notification.error({
            message: 'Verification Failed',
            description: 'Unable to connect to the server. Please try again later.',
          });
        }
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