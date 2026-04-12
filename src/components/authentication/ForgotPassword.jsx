import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { forgotPassword } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isFuturistic, themeConfig } = useTheme();

    const bgColor = isFuturistic ? themeConfig.background : '#F2E0D6FF';
    const cardBg = isFuturistic ? themeConfig.card : '#ebe9d8';
    const inputBg = isFuturistic ? themeConfig.inputBg : '#e0cfc8';
    const textColor = isFuturistic ? '#f8fafc' : '#1a1a1a';
    const mutedText = isFuturistic ? '#94a3b8' : '#6b7280';
    const borderColor = isFuturistic ? themeConfig.border : '#d1d5db';
    const accentColor = isFuturistic ? '#6366f1' : '#1a1a1a';

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email);
            message.success('Password reset link sent to your email!');
            setEmail('');
            setLoading(false);
            navigate('/password-reset-success');
        } catch (error) {
            console.error('Failed to send reset link:', error);
            message.error('Failed to send reset link!');
            setLoading(false);
        }
    };

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
                            src={require('../../assets/LogoNoBg.png').default} 
                            alt='WakiliWorld Logo' 
                            style={{ maxHeight: '60px', maxWidth: '60px' }} 
                        />
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight" style={{ color: textColor }}>
                        Forgot Password
                    </h1>
                    <p className="mt-2" style={{ color: mutedText }}>
                        Enter your email to receive a reset link
                    </p>
                </motion.div>
                <motion.form 
                    onSubmit={handleSubmit} 
                    className={`mt-4 w-full mx-auto rounded-2xl p-8 ${isFuturistic ? 'futuristic-card' : ''}`}
                    style={{ 
                        backgroundColor: cardBg,
                        border: isFuturistic ? `1px solid ${borderColor}` : 'none'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-bold mb-2" style={{ color: textColor }}>
                            EMAIL
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline"
                            style={{ 
                                backgroundColor: inputBg, 
                                color: textColor,
                                borderColor: borderColor
                            }}
                            required
                        />
                    </div>
                    <div className="flex items-center">
                        <button 
                            type="submit" 
                            className={`font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline ${
                                isFuturistic 
                                    ? 'futuristic-btn' 
                                    : 'bg-black hover:bg-gray-800 text-white'
                            }`}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </motion.form>
                <div className="mt-8 text-center">
                    <p style={{ color: mutedText }}>
                        Remember your password?{' '}
                        <Link to="/login" className="font-bold" style={{ color: accentColor }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
