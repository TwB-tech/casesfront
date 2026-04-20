import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/authContext';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const { resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const { token } = useParams();
  const { isFuturistic, themeConfig } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      message.error('Passwords do not match!');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      message.error('Password must be at least 6 characters long!');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, formData.password, formData.confirmPassword);
      message.success('Password successfully reset! You can now log in with your new password.');
      navigate('/login');
    } catch (error) {
      console.error('Password reset failed:', error);
      let errorMessage = 'Password reset failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join(', ');
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center"
        style={{ backgroundColor: isFuturistic ? themeConfig.background : '#F2E0D6FF' }}
      >
        <div className="text-center">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: isFuturistic ? '#f8fafc' : '#1a1a1a' }}
          >
            Invalid Reset Link
          </h2>
          <p style={{ color: isFuturistic ? '#94a3b8' : '#6b7280' }}>
            Redirecting to password reset page...
          </p>
        </div>
      </div>
    );
  }

  const bgColor = isFuturistic ? themeConfig.background : '#F2E0D6FF';
  const cardBg = isFuturistic ? themeConfig.card : '#ebe9d8';
  const inputBg = isFuturistic ? themeConfig.inputBg : '#e0cfc8';
  const textColor = isFuturistic ? '#f8fafc' : '#1a1a1a';
  const mutedText = isFuturistic ? '#94a3b8' : '#6b7280';
  const borderColor = isFuturistic ? themeConfig.border : '#d1d5db';

  return (
    <div className="relative min-h-screen flex" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto my-auto relative flex flex-col w-11/12 sm:w-4/5 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: textColor }}>
            Reset Password
          </h1>
          <p className="mt-2" style={{ color: mutedText }}>
            Enter your new password below
          </p>
        </motion.div>
        <motion.form
          onSubmit={handleSubmit}
          className={`mt-4 w-full mx-auto rounded-2xl p-8 ${isFuturistic ? 'futuristic-card' : ''}`}
          style={{
            backgroundColor: cardBg,
            border: isFuturistic ? `1px solid ${borderColor}` : 'none',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-sm font-bold mb-2"
              style={{ color: textColor }}
            >
              NEW PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline"
                style={{
                  backgroundColor: inputBg,
                  color: textColor,
                  borderColor: borderColor,
                }}
                placeholder="Enter your new password"
                required
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                style={{ color: mutedText }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
              </span>
            </div>
          </div>
          <div className="mb-6 relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-bold mb-2"
              style={{ color: textColor }}
            >
              CONFIRM PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline"
                style={{
                  backgroundColor: inputBg,
                  color: textColor,
                  borderColor: borderColor,
                }}
                placeholder="Confirm your new password"
                required
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                style={{ color: mutedText }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline ${
                isFuturistic ? 'futuristic-btn' : 'bg-black hover:bg-gray-800 text-white'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default ResetPassword;
