import { createContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { notification } from 'antd';
import axiosInstance from '../axiosConfig';
import appwrite, { auth } from '../lib/appwrite';

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

// Rate limiting for registration
const checkRegistrationRateLimit = () => {
  const RATE_LIMIT_KEY = 'wakiliworld_registration_attempts';
  const MAX_ATTEMPTS = 3; // 3 attempts per hour
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour

  try {
    const attempts = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');
    const now = Date.now();

    // Filter out old attempts
    const recentAttempts = attempts.filter((timestamp) => now - timestamp < WINDOW_MS);

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const oldestAttempt = Math.min(...recentAttempts);
      const resetTime = new Date(oldestAttempt + WINDOW_MS);
      throw new Error(
        `Too many registration attempts. Try again after ${resetTime.toLocaleTimeString()}`
      );
    }

    // Add current attempt
    recentAttempts.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentAttempts));

    return true;
  } catch (error) {
    if (error.message.includes('Too many registration attempts')) {
      throw error;
    }
    // If localStorage fails, allow registration but log the issue
    console.warn('Rate limiting check failed:', error);
    return true;
  }
};

const normalizeRegisterPayload = (formData, userType) => {
  if (!formData || typeof formData !== 'object') {
    throw new Error('Invalid form data provided');
  }

  const lowered = Object.entries(formData).reduce((acc, [key, value]) => {
    if (typeof key !== 'string') {
      console.warn('Non-string key found in form data:', key);
      return acc;
    }
    acc[key.toLowerCase()] = typeof value === 'string' ? value.trim() : value;
    return acc;
  }, {});

  // Validate password confirmation
  const password = lowered.password;
  const confirmPassword = lowered['confirm password'];

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  // Validate email is present
  const email = lowered.email;
  if (!email || email === '') {
    throw new Error('Email is required for registration');
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }

   if (userType === 'organization') {
     const orgName = lowered['organization name'];
     if (!orgName || orgName === '') {
       throw new Error('Organization name is required');
     }
     return {
       email,
       username: orgName,
       password,
       role: 'organization',
       phone_number: lowered['phone number'] || '',
       alternative_phone_number: lowered['alternative phone number'] || '',
       address: lowered.address || '',
       occupation: 'Organization',
     };
   }

    if (userType === 'firm') {
      const firmName = lowered['law firm name'];
      if (!firmName || firmName === '') {
        throw new Error('Law firm name is required');
      }
      // Parse practice areas into array
      const practiceAreas = lowered['practice areas']
        ? lowered['practice areas'].split(',').map(a => a.trim()).filter(Boolean)
        : [];
      return {
        email,
        username: firmName,
        password,
        role: 'firm',
        phone_number: lowered['phone number'] || '',
        alternative_phone_number: lowered['alternative phone number'] || '',
        address: lowered.address || '',
        bio: lowered.bio || '',
        practice_areas: practiceAreas,
        registration_number: lowered['registration number'] || '',
      };
    }

   if (userType === 'law_school') {
     const instName = lowered['institution name'];
     if (!instName || instName === '') {
       throw new Error('Institution name is required');
     }
     return {
       email,
       username: instName,
       password,
       role: 'law_school',
       phone_number: lowered['phone number'] || '',
       address: lowered.address || '',
     };
   }

   if (userType === 'legal_clinic') {
     const clinicName = lowered['clinic name'];
     if (!clinicName || clinicName === '') {
       throw new Error('Clinic name is required');
     }
     return {
       email,
       username: clinicName,
       password,
       role: 'legal_clinic',
       phone_number: lowered['phone number'] || '',
       address: lowered.address || '',
     };
   }

    // Default case: Advocate or Individual
    const fullName = lowered['full name'];
    if (!fullName || fullName === '') {
      throw new Error('Full name is required');
    }
    // Parse practice areas if provided
    const practiceAreas = lowered['practice areas']
      ? lowered['practice areas'].split(',').map(a => a.trim()).filter(Boolean)
      : [];
    return {
      email,
      username: fullName,
      password,
      role: userType === 'advocate' ? 'advocate' : 'individual',
      phone_number: lowered['phone number'] || '',
      alternative_phone_number: lowered['alternative phone number'] || '',
      id_passport_number: lowered['id number or passport number'] || '',
      marital_status: lowered['marital status'] || '',
      occupation: lowered.occupation || '',
      address: lowered.address || '',
      date_of_birth: lowered['date of birth'] || '',
      bio: lowered.bio || '',
      practice_areas: practiceAreas,
    };
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(parseStoredUser);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

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
    };

    const sessionSecret = parseSessionSecret(data?.tokens);
    if (sessionSecret) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionSecret);
      auth.setSessionSecret(sessionSecret);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      auth.setSessionSecret('');
    }

    if (userInfo.organization_id) {
      localStorage.setItem('organization_id', userInfo.organization_id);
    } else {
      localStorage.removeItem('organization_id');
    }

    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    // Flush state synchronously so navigation sees updated user
    flushSync(() => {
      setUser(userInfo);
    });
    return userInfo;
  };

   const register = async (formData, userType) => {
    try {
      // Check rate limiting before processing
      checkRegistrationRateLimit();

      // Validate required fields before processing
      if (!formData || typeof formData !== 'object') {
        throw new Error('Invalid form data provided');
      }

      const registrationData = normalizeRegisterPayload(formData, userType);

      // Ensure email is present and valid
      if (
        !registrationData.email ||
        typeof registrationData.email !== 'string' ||
        registrationData.email.trim() === ''
      ) {
        throw new Error('Email is required for registration');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registrationData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Ensure password is present
      if (!registrationData.password || registrationData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('Registration data:', { ...registrationData, password: '[REDACTED]' });

      const { data } = await axiosInstance.post('/auth/register/', registrationData);

      notification.success({
        message: 'Registration Successful',
        description: `Welcome, ${data.username || registrationData.username}! Your standalone workspace is ready.`,
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
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Invalid reset token');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

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
      // Ignore logout errors - user is logging out anyway
    }
    // Clear Appwrite session
    try {
      await auth.deleteSession();
    } catch (e) {
      console.warn('Failed to clear Appwrite session:', e);
    }
    localStorage.removeItem('userInfo');
    localStorage.removeItem('organization_id');
    localStorage.removeItem('user_permissions');
    localStorage.removeItem(SESSION_STORAGE_KEY);
    auth.setSessionSecret('');
    setUser(null);
  };

  const verifyToken = async () => {
    try {
      // Verify the current session directly via Appwrite
      const { data: account } = await auth.get();
      if (!account) {
        await logout();
        return false;
      }

      const userId = account.$id || account.id;

      // Fetch user profile from users collection
      const { data: userProfile, error: profileErr } = await appwrite.db.get(
        appwrite.COLLECTIONS.USERS,
        userId
      );

      if (profileErr) {
        // Profile not found – create minimal user info from account
        const userInfo = {
          id: userId,
          email: account.email,
          username: account.name || account.email,
          role: 'individual',
          organization_id: null,
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        flushSync(() => setUser(userInfo));
        return true;
      }

      const userInfo = {
        id: userProfile.id,
        email: account.email,
        username: userProfile.username || account.name || account.email,
        role: userProfile.role || 'individual',
        organization_id: userProfile.organization_id || null,
      };

      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      if (userInfo.organization_id) {
        localStorage.setItem('organization_id', userInfo.organization_id);
      }

      flushSync(() => {
        setUser(userInfo);
      });
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
   }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
