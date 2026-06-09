import React, { useState, useContext } from 'react';
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
      setLoading(false);
      const responseData = error?.response?.data;
      const isUnverified = error?.response?.status === 403 ||
                          responseData?.code === 'EMAIL_NOT_VERIFIED' ||
                          responseData?.message?.includes('verify');

      if (isUnverified) {
        message.error({
          content: 'Email Not Verified',
          duration: 5,
        });
        message.info({
          content: 'Please check your email inbox for the verification link. If you did not receive it, contact support.',
          duration: 5,
        });
      } else {
        const errorMsg = error?.response?.data?.message || error?.message || 'Invalid email or password';
        message.error(errorMsg);
      }
    }
  };

  const bgColor = isFuturistic ? '#0a0a0f' : '#F2E0D6FF';
  const cardBg = isFuturistic ? '#0f0f18' : '#ffffff';
  const inputBg = isFuturistic ? '#1a1a24' : '#F9F5FF';
  const textColor = isFuturistic ? '#ffffff' : '#1f2937';
  const mutedText = isFuturistic ? '#94a3b8' : '#6b7280';
  const borderColor = isFuturistic ? '#4c1d95' : '#ddd6fe';
  const accent = isFuturistic ? '#7c3aed' : '#4c1d95';
  const accentHover = isFuturistic ? '#6d28d9' : '#5b21b6';

  return (
    <div className="relative min-h-screen flex" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto my-auto relative flex flex-col w-11/12 sm:w-4/5 lg:w-1/2">
        <div className="text-center mb-8">
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
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full mx-auto rounded-2xl p-8"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div className="mb-6">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold"
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
              className="w-full rounded-xl py-3 px-4 outline-none transition-colors duration-200"
              style={{
                backgroundColor: inputBg,
                color: textColor,
                border: `1px solid ${borderColor}`,
              }}
              required
            />
          </div>
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold"
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
                className="w-full rounded-xl py-3 px-4 pr-12 outline-none transition-colors duration-200"
                style={{
                  backgroundColor: inputBg,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                }}
                required
              />
              <span
                className="absolute right-4 top-1/2 cursor-pointer"
                style={{ color: mutedText, transform: 'translateY(-50%)' }}
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
              className="rounded-lg px-6 py-3 font-bold transition-colors focus:outline-none"
              style={{
                backgroundColor: accent,
                color: '#ffffff',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <Link
              to="/forgot-password"
              className="text-sm font-bold"
              style={{ color: accent }}
            >
              Forgot Password?
            </Link>
          </div>
        </form>
        <div className="mt-8 text-center">
          <p style={{ color: mutedText }}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-bold" style={{ color: accent }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
