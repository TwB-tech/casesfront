import { createContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { notification } from 'antd';
import axiosInstance from '../axiosConfig';

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = 'appwrite_session_secret';

const parseStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return JSON.parse(localStorage.getItem('userInfo') || 'null');
  } catch (error) {
    return null;
  }
};

// Lazy Appwrite imports so Postgres mode never tries to init Appwrite
let appwriteModule = null;
const loadAppwriteModule = async () => {
  if (appwriteModule) return appwriteModule;
  try {
    appwriteModule = await import('../lib/appwrite');
    return appwriteModule;
  } catch {
    return null;
  }
};

const parseSessionSecret = (tokensValue) => {
  if (!tokensValue || typeof tokensValue !== 'string') {
    return null;
  }
  try {
    const normalized = tokensValue.replace(/'/g, '"');
    const parsed = JSON.parse(normalized);
    return typeof parsed?.access === 'string' ? parsed.access : null;
  } catch {
    return null;
  }
};

const checkRegistrationRateLimit = () => {
  const RATE_LIMIT_KEY = 'wakiliworld_registration_attempts';
  const MAX_ATTEMPTS = 3;
  const WINDOW_MS = 60 * 60 * 1000;

  try {
    const attempts = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');
    const now = Date.now();
    const recentAttempts = attempts.filter((timestamp) => now - timestamp < WINDOW_MS);

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const oldestAttempt = Math.min(...recentAttempts);
      const resetTime = new Date(oldestAttempt + WINDOW_MS);
      throw new Error(
        `Too many registration attempts. Try again after ${resetTime.toLocaleTimeString()}`
      );
    }

    recentAttempts.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentAttempts));
    return true;
  } catch (error) {
    if (error.message.includes('Too many registration attempts')) {
      throw error;
    }
    console.warn('Rate limiting check failed:', error);
    return true;
  }
};

const normalizeRegisterPayload = (formData, userType) => {
  if (!formData || typeof formData !== 'object') {
    throw new Error('Invalid form data provided');
  }

  const lowered = Object.entries(formData).reduce((acc, [key, value]) => {
    if (typeof key !== 'string') return acc;
    acc[key.toLowerCase()] = typeof value === 'string' ? value.trim() : value;
    return acc;
  }, {});

  const password = lowered.password;
  const confirmPassword = lowered['confirm password'];
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long');
  if (password !== confirmPassword) throw new Error('Passwords do not match');

  const email = lowered.email;
  if (!email || email === '') throw new Error('Email is required for registration');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error('Please enter a valid email address');

  const role = userType.toLowerCase();
  const base = {
    email: email.trim(),
    username: '',
    password,
    role,
    phone: lowered['phone number'] || '',
    address: lowered.address || '',
    bio: lowered.bio || '',
  };

  switch (role) {
    case 'organization': {
      const orgName = lowered['organization name'];
      if (!orgName || orgName.trim() === '') throw new Error('Organization name is required');
      return {
        ...base,
        username: orgName.trim(),
        organization_id: null,
        registration_number: lowered['registration number'] || '',
      };
    }

    case 'firm': {
      const firmName = lowered['law firm name'];
      if (!firmName || firmName.trim() === '') throw new Error('Law firm name is required');
      const practiceAreas = lowered['practice areas']
        ? lowered['practice areas'].split(',').map((a) => a.trim()).filter(Boolean)
        : [];
      return {
        ...base,
        username: firmName.trim(),
        organization_id: null,
        practice_areas: practiceAreas,
        registration_number: lowered['registration number'] || '',
      };
    }

    case 'law_school': {
      const instName = lowered['institution name'];
      if (!instName || instName.trim() === '') throw new Error('Institution name is required');
      return {
        ...base,
        username: instName.trim(),
        organization_id: null,
      };
    }

    case 'legal_clinic': {
      const clinicName = lowered['clinic name'];
      if (!clinicName || clinicName.trim() === '') throw new Error('Clinic name is required');
      return {
        ...base,
        username: clinicName.trim(),
        organization_id: null,
      };
    }

    case 'advocate': {
      const fullName = lowered['full name'];
      if (!fullName || fullName.trim() === '') throw new Error('Full name is required');
      const advocatePracticeAreas = lowered['practice areas']
        ? lowered['practice areas'].split(',').map((a) => a.trim()).filter(Boolean)
        : [];
      return {
        ...base,
        username: fullName.trim(),
        organization_id: null,
        practice_areas: advocatePracticeAreas,
        id_passport_number: lowered['id number or passport number'] || '',
        marital_status: lowered['marital status'] || '',
        occupation: lowered.occupation || '',
        date_of_birth: lowered['date of birth'] || '',
      };
    }

    case 'individual':
    default: {
      const indName = lowered['full name'];
      if (!indName || indName.trim() === '') throw new Error('Full name is required');
      return {
        ...base,
        username: indName.trim(),
        organization_id: null,
        nationality: lowered.nationality || '',
        occupation: lowered.occupation || '',
        date_of_birth: lowered['date of birth'] || '',
      };
    }
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(parseStoredUser);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login/', { email, password });

    const userInfo = {
      id: data?.id || data?.user?.id || null,
      email: data?.email || data?.user?.email || email,
      username: data?.username || data?.user?.username || email,
      role: data?.role || data?.user?.role || 'individual',
      organization_id: data?.organization_id || data?.user?.organization_id || null,
      email_verified: data?.email_verified || false,
    };

    const sessionSecret = parseSessionSecret(data?.tokens);
    if (sessionSecret) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionSecret);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    if (userInfo.organization_id) {
      localStorage.setItem('organization_id', userInfo.organization_id);
    } else {
      localStorage.removeItem('organization_id');
    }

    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    flushSync(() => setUser(userInfo));
    return userInfo;
  };

  const register = async (formData, userType) => {
    try {
      checkRegistrationRateLimit();

      if (!formData || typeof formData !== 'object') throw new Error('Invalid form data provided');

      const registrationData = normalizeRegisterPayload(formData, userType);
      if (!registrationData.email || typeof registrationData.email !== 'string' || registrationData.email.trim() === '') {
        throw new Error('Email is required for registration');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registrationData.email)) throw new Error('Please enter a valid email address');
      if (!registrationData.password || registrationData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('Registration data:', { ...registrationData, password: '[REDACTED]' });

      const { data } = await axiosInstance.post('/auth/register/', registrationData);

      notification.success({
        message: 'Registration Successful',
        description: `Welcome, ${data.username || registrationData.username}! Please check your email and click the verification link to activate your account.`,
      });

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Unable to create your account.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join(', ');
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      notification.error({
        message: 'Registration Failed',
        description: errorMessage,
      });
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    await axiosInstance.post('/auth/request-reset-email/', { email });
    notification.success({
      message: 'Reset Link Generated',
      description: 'Check your email for the password reset instructions.',
    });
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    if (!token || typeof token !== 'string' || token.trim() === '') throw new Error('Invalid reset token');
    if (!newPassword || newPassword.length < 6) throw new Error('Password must be at least 6 characters long');
    if (newPassword !== confirmPassword) throw new Error('Passwords do not match');

    try {
      await axiosInstance.post(`/auth/password-reset/${token}`, {
        password: newPassword,
      });
      notification.success({
        message: 'Password Reset Successful',
        description: 'Your password has been updated successfully.',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout/');
    } catch {
      // ignore
    }

    const mod = await loadAppwriteModule();
    if (mod) {
      try {
        await mod.auth.deleteSession();
      } catch (e) {
        console.warn('Failed to clear Appwrite session:', e);
      }
    }

    localStorage.removeItem('userInfo');
    localStorage.removeItem('organization_id');
    localStorage.removeItem('user_permissions');
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
  };

  const verifyToken = async () => {
    const mod = await loadAppwriteModule();
    if (!mod) {
      const stored = parseStoredUser();
      if (stored) {
        flushSync(() => setUser(stored));
        return true;
      }
      await logout();
      return false;
    }

    try {
      const { data: account } = await mod.auth.get();
      if (!account) {
        await logout();
        return false;
      }

      const userId = account.$id || account.id;

      const { data: userProfile, error: profileErr } = await mod.db.get(mod.COLLECTIONS.USERS, userId);
      const userInfo = profileErr
        ? {
            id: userId,
            email: account.email,
            username: account.name || account.email,
            role: 'individual',
            organization_id: null,
            email_verified: false,
          }
        : {
            id: userProfile.id,
            email: account.email,
            username: userProfile.username || account.name || account.email,
            role: userProfile.role || 'individual',
            organization_id: userProfile.organization_id || null,
            email_verified: userProfile.email_verified || false,
          };

      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      if (userInfo.organization_id) {
        localStorage.setItem('organization_id', userInfo.organization_id);
      }
      flushSync(() => setUser(userInfo));
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      await logout();
      return false;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !localStorage.getItem('userInfo')) {
      return;
    }

    queueMicrotask(() => {
      void verifyToken();
    });
  }, []);

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
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
