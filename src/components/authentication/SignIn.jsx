import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../../assets/LogoNoBg.png';

function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isFuturistic } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      message.success('Login successful!');
      setLoading(false);
      navigate('/home');
    } catch (error) {
      message.error('Login failed!');
      setLoading(false);
    }
  };

  const bgColor = isFuturistic ? '#0a0a0f' : '#F2E0D6FF';
  const cardBg = isFuturistic ? '#1a1a24' : '#ebe9d8';
  const inputBg = isFuturistic ? '#12121a' : '#e0cfc8';
  const textColor = isFuturistic ? '#f8fafc' : '#1a1a1a';
  const mutedText = isFuturistic ? '#94a3b8' : '#6b7280';
  const borderColor = isFuturistic ? '#2a2a3a' : '#d1d5db';

  return (
    <div className="relative min-h-screen flex" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto my-auto relative flex flex-col w-11/12 sm:w-4/5 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block mb-6">
            <img
              src={Logo}
              alt="WakiliWorld Logo"
              style={{ maxHeight: '60px', maxWidth: '60px' }}
            />
          </Link>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: textColor }}>
            Welcome Back
          </h1>
          <p className="mt-2" style={{ color: mutedText }}>
            Sign in to your WakiliWorld account
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
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-bold mb-2"
              style={{ color: textColor }}
            >
              EMAIL
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: inputBg,
                color: textColor,
                borderColor: borderColor,
              }}
              required
            />
          </div>
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-sm font-bold mb-2"
              style={{ color: textColor }}
            >
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-3 px-4 pr-12 leading-tight focus:outline-none focus:shadow-outline"
                style={{
                  backgroundColor: inputBg,
                  color: textColor,
                  borderColor: borderColor,
                }}
                required
              />
              <span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
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
              className={`font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline ${
                isFuturistic ? 'futuristic-btn' : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <Link
              to="/forgot-password"
              className="inline-block align-baseline font-bold text-sm"
              style={{ color: isFuturistic ? '#6366f1' : '#1a1a1a' }}
            >
              Forgot Password?
            </Link>
          </div>
        </motion.form>
        <div className="mt-8 text-center">
          <p style={{ color: mutedText }}>
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-bold"
              style={{ color: isFuturistic ? '#6366f1' : '#1a1a1a' }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
