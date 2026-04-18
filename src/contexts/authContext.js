import { createContext, useEffect, useMemo, useState } from 'react';
import { notification } from 'antd';
import axiosInstance from '../axiosConfig';

const AuthContext = createContext(null);

const parseStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const encrypted = localStorage.getItem('userInfo_encrypted');
    if (encrypted) {
      // TODO: In production, derive key from user password
      // For now, fallback to unencrypted for demo
      return JSON.parse(localStorage.getItem('userInfo') || 'null');
    }
    return JSON.parse(localStorage.getItem('userInfo') || 'null');
  } catch (error) {
    return null;
  }
};

const normalizeRegisterPayload = (formData, userType) => {
  const lowered = Object.entries(formData || {}).reduce((acc, [key, value]) => {
    acc[key.toLowerCase()] = typeof value === 'string' ? value.trim() : value;
    return acc;
  }, {});

  if (lowered.password !== lowered['confirm password']) {
    throw new Error('Passwords do not match');
  }

  if (userType === 'organization') {
    return {
      email: lowered.email,
      username: lowered['organization name'] || lowered.email,
      password: lowered.password,
      role: 'organization',
      phone_number: lowered['phone number'] || '',
      alternative_phone_number: lowered['alternative phone number'] || '',
      address: lowered.address || '',
      occupation: 'Organization',
    };
  }

  if (userType === 'law firm') {
    return {
      email: lowered.email,
      username: lowered['law firm name'] || lowered.email,
      password: lowered.password,
      role: 'firm',
      phone_number: lowered['phone number'] || '',
      alternative_phone_number: lowered['alternative phone number'] || '',
      address: lowered.address || '',
      occupation: 'Law Firm',
    };
  }

  return {
    email: lowered.email,
    username: lowered['full name'] || lowered.email,
    password: lowered.password,
    role: lowered['is advocate'] === 'true' ? 'advocate' : 'individual',
    phone_number: lowered['phone number'] || '',
    alternative_phone_number: lowered['alternative phone number'] || '',
    id_passport_number: lowered['id number or passport number'] || '',
    marital_status: lowered['marital status'] || '',
    occupation: lowered.occupation || '',
    address: lowered.address || '',
    date_of_birth: lowered['date of birth'] || '',
  };
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(parseStoredUser);

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login/', { email, password });
    const tokens = JSON.parse(data.tokens.replace(/'/g, '"'));
    const userInfo = {
      id: data.id,
      email: data.email,
      username: data.username,
      role: data.role,
    };

    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const register = async (formData, userType) => {
    try {
      const registrationData = normalizeRegisterPayload(formData, userType);
      const { data } = await axiosInstance.post('/auth/register/', registrationData);

      notification.success({
        message: 'Registration Successful',
        description: `Welcome, ${data.username}! Your standalone workspace is ready.`,
      });

      return data;
    } catch (error) {
      notification.error({
        message: 'Registration Failed',
        description: error?.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(', ')
          : error.message || 'Unable to create your account.',
      });
      throw error;
    }
  };

  const verifyToken = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return false;
    }
    try {
      await axiosInstance.post('/auth/verify-token', { token });
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const forgotPassword = async (email) => {
    await axiosInstance.post('/auth/request-reset-email/', { email });
    notification.success({
      message: 'Reset Link Generated',
      description: 'In standalone mode, you can proceed directly to the reset screen.',
    });
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      notification.error({
        message: 'Error',
        description: 'Passwords do not match.',
      });
      return;
    }

    await axiosInstance.post(`/auth/password-reset/${token}`, {
      token,
      password: newPassword,
      confirm_password: confirmPassword,
    });

    notification.success({
      message: 'Password Reset Successful',
      description: 'Your password has been updated.',
    });
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout/');
    } catch (error) {
      void error;
    }
    localStorage.removeItem('userInfo');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('organization_id');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      verifyToken,
      forgotPassword,
      resetPassword,
      logout,
    }),
    [user] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
